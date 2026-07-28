"use client";

const MAX_WIDTH = {
  md: "max-w-lg",
  lg: "max-w-2xl",
};

export function Modal({
  title,
  onClose,
  children,
  size = "md",
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: "md" | "lg";
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      onClick={onClose}
    >
      <div
        className={`flex max-h-[85vh] w-full ${MAX_WIDTH[size]} flex-col overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-lg font-medium text-neutral-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-400 hover:text-neutral-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
