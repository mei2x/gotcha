export type Rarity = "common" | "semi_rare" | "rare" | "ultra_rare";

export type User = {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
};

export type Character = {
  id: string;
  name: string;
  slug: string;
  iconUrl: string | null;
};

export type Listing = {
  id: string;
  title: string;
  series: string;
  description: string | null;
  rarity: Rarity;
  price: string | null;
  seriesIndex: number;
  seriesTotal: number;
  tradeWithUsername: string | null;
  imageUrls: string[];
  tradingMethod: string;
  likesCount: number;
  likedByMe: boolean;
  seller: { username: string };
  character: { name: string; slug: string };
};

export type SortOption = "newest" | "oldest" | "rare_to_common" | "common_to_rare";

export type Profile = User & {
  bio: string | null;
  preferredTradingMethod: string | null;
  city: string | null;
  state: string | null;
  tradingSinceYear: number;
  favoriteCharacters: FavoriteCharacter[];
  rating: { average: number | null; count: number };
};

export type FavoriteCharacter = Character & { color: string; textColor: string };

export type PublicProfile = {
  id: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  preferredTradingMethod: string | null;
  city: string | null;
  state: string | null;
  tradingSinceYear: number;
  favoriteCharacters: FavoriteCharacter[];
  rating: { average: number | null; count: number };
};

export type TradeListingSummary = {
  title: string;
  series: string;
  imageUrls: string[];
  character: { name: string; slug: string };
};

export type Trade = {
  id: string;
  completedAt: string;
  mine: TradeListingSummary;
  theirs: TradeListingSummary;
};

export type TradeRequestListingSummary = {
  id: string;
  title: string;
  series: string;
  rarity: Rarity;
  seriesIndex: number;
  seriesTotal: number;
  imageUrls: string[];
  character: { name: string; slug: string };
};

export type TradeRequestStatus = "pending" | "confirmed" | "declined";

export type TradeRequest = {
  id: string;
  status: TradeRequestStatus;
  createdAt: string;
  respondedAt: string | null;
  tradingMethod: string;
  pickupLocation: string | null;
  proposedDate: string | null;
  proposedTimes: string[];
  fromUser: { username: string; avatarUrl: string | null };
  toUser: { username: string; avatarUrl: string | null };
  fromListing: TradeRequestListingSummary;
  toListing: TradeRequestListingSummary;
};
