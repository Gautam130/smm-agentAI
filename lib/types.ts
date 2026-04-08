// Type definitions for SMM Agent

export interface SearchResult {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  publishedDate?: string;
  provider?: string;
  score?: number;
  trustLevel?: string;
  recency?: string;
  relevanceScore?: number;
  _angle?: string;
  [key: string]: unknown;
}

export interface SearchResponse {
  results: SearchResult[];
  weak?: boolean;
  duration?: number;
  provider?: string;
  error?: boolean;
  answer?: string;
  formatted?: string;
  evidence?: string;
  confidence?: string;
  sourceCount?: number;
}

export interface NicheData {
  keywords: string[];
  indiaKeywords: string[];
  topHashtags: string[];
  brandCategories: string[];
  indianBrands: string[];
  contentFormats: string[];
  audienceTraits: string;
  searchAngles: string[];
}

export interface NicheMap {
  [key: string]: NicheData;
}

export interface InfluencerTier {
  label: string;
  range: string;
  searchTerm: string;
}

export interface InfluencerTiers {
  nano: InfluencerTier;
  micro: InfluencerTier;
  mid: InfluencerTier;
  macro: InfluencerTier;
}

export interface PlatformDomains {
  instagram: string[];
  linkedin: string[];
  youtube: string[];
  twitter: string[];
  facebook: string[];
}

export interface TrustDomains {
  HIGH: string[];
  MEDIUM: string[];
  LOW: string[];
}

export interface JinaContent {
  title: string;
  content: string;
  url: string;
  provider: string;
}

export interface Intent {
  isCasual: boolean;
  isBrand: boolean;
  isResearch: boolean;
  isInfluencer: boolean;
  isNews: boolean;
  isContent: boolean;
  isTech: boolean;
  isLocal: boolean;
  isCricket: boolean;
  isStock: boolean;
  isCrypto: boolean;
  isHealth: boolean;
}

export interface SearchOptions {
  onStatus?: (msg: string) => void;
  maxResults?: number;
}

export interface SmartSearchResult {
  evidence?: string;
  confidence?: string;
  sourceCount?: number;
  formatted?: string;
}