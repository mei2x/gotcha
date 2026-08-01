"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Measures the true visual bounding box of its content (including children
// that overflow via negative margins/absolute positioning), then applies a
// uniform scale + centering offset so the whole composition fits the
// container without ever needing to scroll, while keeping every element's
// position/size relative to each other exactly as authored.
export function ScaleToFit({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const boundsRef = useRef<{
    width: number;
    height: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [transform, setTransform] = useState("");

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const measureBounds = () => {
      const contentBox = content.getBoundingClientRect();
      const nodes = content.querySelectorAll<HTMLElement>("*");
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      const consider = (rect: DOMRect) => {
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.right);
        maxY = Math.max(maxY, rect.bottom);
      };
      consider(contentBox);
      nodes.forEach((node) => consider(node.getBoundingClientRect()));

      const trueCenterX = (minX + maxX) / 2 - contentBox.left;
      const trueCenterY = (minY + maxY) / 2 - contentBox.top;
      boundsRef.current = {
        width: maxX - minX,
        height: maxY - minY,
        offsetX: contentBox.width / 2 - trueCenterX,
        offsetY: contentBox.height / 2 - trueCenterY,
      };
    };

    const applyScale = () => {
      const bounds = boundsRef.current;
      if (!bounds || bounds.width === 0 || bounds.height === 0) return;
      const containerRect = container.getBoundingClientRect();
      const scale = Math.min(
        containerRect.width / bounds.width,
        containerRect.height / bounds.height,
        1
      );
      setTransform(
        `scale(${scale}) translate(${bounds.offsetX}px, ${bounds.offsetY}px)`
      );
    };

    measureBounds();
    applyScale();

    const onResize = () => applyScale();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-1 items-center justify-center overflow-hidden"
    >
      <div
        ref={contentRef}
        style={{
          width: "1200px",
          transform,
          transformOrigin: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
