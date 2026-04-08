

// @ts-nocheck
// This file will be properly typed in phases - keeping app working while we add types

// TYPE DEFINITIONS
interface SearchResult {
  title: string;
  url: string;
  domain: string;
  snippet?: string;
  publishedDate?: string;
  provider?: string;
  [key: string]: any;
}

interface SearchResponse {
  results: SearchResult[];
  weak?: boolean;
  duration?: number;
  provider?: string;
  error?: boolean;
  answer?: string;
}

type NicheCategory = 'fitness' | 'gaming' | 'beauty' | 'food' | 'tech' | 'fashion' | 'travel' | 'parenting' | 'business' | 'education' | 'health' | string;

// ═══════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════

// SOURCE TIER SYSTEM - Ranked by authority for Indian SMM
const TRUST_DOMAINS: { HIGH: string[]; MEDIUM: string[]; LOW: string[] } = {
  // TIER 1: Highest Trust (Primary Evidence)
  HIGH: [
    // Business/Startup
    'yourstory.com', 'inc42.com', 'economictimes.indiatimes.com', 'livemint.com', 'business-standard.com', 'moneycontrol.com',
    // Government (India Data)
    'data.gov.in', 'dpiit.gov.in', 'meity.gov.in', 'startupindia.gov.in', 'mca.gov.in', 'niti.gov.in', 'seab.gov.in', 'rbi.org.in',
    // Marketing/Advertising
    'afaqs.com', 'exchange4media.com', 'socialsamosa.com', 'bestmediainfo.co.in', 'adgully.com',
    // Consulting/Strategy
    'mckinsey.com', 'bcg.com', 'deloitte.com', 'bain.com', 'hbr.org', 'weforum.org', 'imd.org',
    // Global News (World-class sources)
    'bbc.co.uk', 'bbc.com', 'bbci.co.uk',
    // Sports/Cricket
    'cricbuzz.com',
    // Finance
    'finance.yahoo.com', 'finnhub.io', 'coingecko.com',
    // AI Search
    'linkup.com', 'tavily.com',
    // Health/Medical (India + Global)
    'who.int', 'icmr.gov.in', 'mohfw.gov.in', 'ncbi.nlm.nih.gov', 'pubmed.ncbi.nlm.nih.gov', 'aiims.edu', 'nimhans.ac.in'
  ],
  // TIER 2: Good Trust (Secondary Evidence)
  MEDIUM: [
    // Business News
    'ndtv.com', 'hindubusinessline.com', 'financialexpress.com', 'businesstoday.in', 'forbesindia.com', 'entrepreneur.com', 'theprint.in',
    // Tech
    'techcrunch.com', 'entrackr.com', 'medianama.com', 'pluggd.in', 'factordaily.com',
    // Influencer/Marketing Platforms
    'plixxo.com', 'grynow.in', 'winkl.co', 'viralmafia.com', 'kofluence.com', 'qoruz.com'
  ],
  // TIER 3: Weaker Trust (Context Only)
  LOW: ['news.ycombinator.com', 'reddit.com', 'linkedin.com', 'twitter.com', 'x.com', 'quora.com', 'hindustantimes.com', 'thehindu.com']
};

// Platform domains
const PLATFORM_DOMAINS = {
  instagram: ['instagram.com', 'instavote.app'],
  linkedin: ['linkedin.com', 'linkedin.in'],
  youtube: ['youtube.com', 'youtu.be'],
  twitter: ['twitter.com', 'x.com'],
  facebook: ['facebook.com', 'fb.com']
};

// Exclude low-quality sources from search
const EXCLUDE_DOMAINS = ['reddit.com', 'quora.com', 'yahoo.com', 'answers.com', 'justdial.com', 'mouthshut.com', 'sulekha.com', 'indiamart.com', 'stackexchange.com', 'tripadvisor.com', 'glassdoor.com', 'blogspot.com', 'tumblr.com'];

// Jina Reader can't access these (legal blocks / paywalls)
const JINA_BLOCKLIST = [
  'reuters.com', 'wsj.com', 'bloomberg.com', 'ft.com', 'nytimes.com', 
  'theguardian.com', 'economist.com', 'washingtonpost.com', 'businessinsider.com', 'forbes.com'
];

// Scrape.do fallback API (when Jina returns 451 error)
// Token set via window.SCRAPE_DO_TOKEN in index.html or Vercel env

// ═══════════════════════════════════════════════════════════════════
// INFLUENCER DOMAINS
// ═══════════════════════════════════════════════════════════════════

const INFLUENCER_TRUST_DOMAINS = [
  'yourstory', 'inc42', 'economictimes', 'livemint', 'business-standard', 'moneycontrol',
  'afaqs', 'exchange4media', 'socialsamosa', 'bestmediainfo', 'adgully',
  'mckinsey', 'bcg', 'deloitte', 'bain', 'hbr',
  'ndtv', 'hindubusinessline', 'financialexpress', 'businesstoday', 'forbesindia', 'entrepreneur', 'theprint',
  'entrackr', 'medianama', 'techcrunch',
  'startupindia.gov.in', 'data.gov.in', 'dpiit.gov.in', 'meity.gov.in', 'niti.gov.in'
];

const INFLUENCER_DIRECTORY_DOMAINS = [
  'grynow.in', 'viralmafia.com', 'winkl.co', 'plixxo.com',
  'influglue.com', 'kofluence.com', 'socialsamosa.com',
  'afaqs.com', 'exchange4media.com', 'yourstory.com', 'inc42.com',
  'collabstr.com'
];

const INFLUENCER_TIERS = {
  nano:  { label: 'nano', range: '1k-10k', searchTerm: '1000 5000 10000 followers' },
  micro: { label: 'micro', range: '10k-100k', searchTerm: '10k 50k 100k followers' },
  mid:   { label: 'mid', range: '100k-500k', searchTerm: '100k 200k 500k followers' },
  macro: { label: 'macro', range: '500k+', searchTerm: '500k 1M million followers' }
};

// Normalize niche input to match map keys
function normalizeNiche(rawNiche) {
  if (!rawNiche) return 'lifestyle';
  const n = rawNiche.toLowerCase().trim();

  const aliases = {
    'health': 'fitness', 'gym': 'fitness', 'yoga': 'fitness', 'wellness': 'fitness',
    'beauty': 'skincare', 'makeup': 'skincare', 'cosmetics': 'skincare', 'skin': 'skincare',
    'cooking': 'food', 'recipe': 'food', 'chef': 'food', 'foodie': 'food',
    'style': 'fashion', 'clothing': 'fashion', 'outfit': 'fashion', 'apparel': 'fashion',
    'money': 'finance', 'investing': 'finance', 'stocks': 'finance', 'crypto': 'finance',
    'adventure': 'travel', 'tourism': 'travel', 'backpacking': 'travel',
    'technology': 'tech', 'gadget': 'tech', 'smartphone': 'tech', 'coding': 'tech',
    'mom': 'parenting', 'baby': 'parenting', 'family': 'parenting', 'kids': 'parenting',
    'startup': 'business', 'entrepreneur': 'business', 'marketing': 'business', 'ecommerce': 'business',
    'study': 'education', 'exam': 'education', 'coaching': 'education', 'school': 'education',
    'game': 'gaming', 'esports': 'gaming', 'streamer': 'gaming', 'bgmi': 'gaming'
  };

  if (NICHE_INTELLIGENCE[n]) return n;
  if (aliases[n]) return aliases[n];

  for (const key of Object.keys(NICHE_INTELLIGENCE)) {
    if (n.includes(key) || key.includes(n)) return key;
  }

  return 'lifestyle';
}

// NICHE INTELLIGENCE MAP
const NICHE_INTELLIGENCE = {
  fitness: {
    keywords: ['workout','gym','fitness','yoga','nutrition','health','weight loss','bodybuilding','crossfit','running','marathon','zumba','pilates','calisthenics','protein','supplement'],
    indiaKeywords: ['gym India','fitness influencer Mumbai','yoga India','fit India','Indian fitness','desi fitness','Indian bodybuilder','Hindi fitness'],
    topHashtags: ['#FitIndia','#IndianFitness','#YogaIndia','#GymLife','#FitnessMotivation','#HealthyIndia','#WorkoutIndia'],
    brandCategories: ['supplements','activewear','health food','fitness equipment','sports nutrition'],
    indianBrands: ['MuscleBlaze','HealthKart','Yoga Bar','HRX','Decathlon India','Avvatar'],
    contentFormats: ['workout videos','transformation reels','diet tips','exercise tutorials','motivation'],
    audienceTraits: 'health-conscious urban Indians 18-35 metros and tier-1 cities',
    searchAngles: ['fitness trainer India','gym coach India','yoga teacher India','nutrition expert India','fitness model India']
  },
  skincare: {
    keywords: ['skincare','skin','glow','serum','moisturizer','sunscreen','acne','routine','dermatology','beauty','complexion','SPF','retinol','vitamin C','hyaluronic'],
    indiaKeywords: ['skincare India','Indian skin type','glow skin India','desi skincare','Indian beauty blogger','K-beauty India','skincare routine India'],
    topHashtags: ['#IndianSkincare','#GlowUpIndia','#SkincareCommunity','#DesiBeauty','#IndianBeauty','#SkincareRoutine','#GlowingSkin'],
    brandCategories: ['skincare','cosmetics','derma brands','beauty tools','natural beauty'],
    indianBrands: ['Minimalist','The Derma Co','Dot and Key','Plum','MCaffeine','Mamaearth','Wow Skin Science','Pilgrim','Foxtale'],
    contentFormats: ['skincare routines','ingredient breakdowns','before/after','product reviews','skin tips'],
    audienceTraits: 'urban Indian women 18-30 interested in science-backed skincare',
    searchAngles: ['skincare blogger India','beauty influencer India','dermatologist India','skincare educator India','makeup artist India']
  },
  food: {
    keywords: ['food','recipe','cooking','chef','restaurant','cuisine','baking','street food','homecook','foodie','gastronomy','vegan','vegetarian','nutrition'],
    indiaKeywords: ['Indian food blogger','recipe India Hindi','street food India','Indian chef','homecook India','desi food','Indian cuisine','biryani','dal','roti'],
    topHashtags: ['#IndianFood','#FoodBloggerIndia','#RecipeIndia','#StreetFoodIndia','#HomeCooking','#DesiFood','#FoodiesOfIndia'],
    brandCategories: ['food brands','kitchenware','spices','packaged food','beverages','health food'],
    indianBrands: ['MDH','Everest','Haldiram','Paper Boat','Lijjat','iD Fresh','Epigamia','Raw Pressery'],
    contentFormats: ['recipe videos','restaurant reviews','cooking tutorials','street food tours','food challenges'],
    audienceTraits: 'food-loving Indians across all demographics metro and tier-2',
    searchAngles: ['food blogger India','recipe creator India','chef India','food vlogger India','home cook India']
  },
  fashion: {
    keywords: ['fashion','style','outfit','clothing','ootd','trendy','designer','wardrobe','streetwear','ethnic','saree','kurta','accessories','jewellery'],
    indiaKeywords: ['fashion blogger India','Indian style','outfit India','ethnic wear India','Indian fashion influencer','desi style','Bollywood fashion','Indian streetwear'],
    topHashtags: ['#IndianFashion','#OOTD','#FashionBloggerIndia','#EthnicWear','#IndianStyle','#StyleInspiration','#FashionIndia'],
    brandCategories: ['clothing','accessories','jewellery','ethnic wear','fast fashion','luxury'],
    indianBrands: ['Fabindia','Manyavar','W for Woman','Global Desi','Myntra brands','Libas','Biba'],
    contentFormats: ['outfit of the day','styling videos','hauls','lookbooks','trend reports','ethnic wear showcases'],
    audienceTraits: 'fashion-forward Indians 18-35 metros tier-1 cities mix of western and ethnic',
    searchAngles: ['fashion blogger India','style influencer India','outfit creator India','fashion vlogger India','ethnic wear influencer India']
  },
  finance: {
    keywords: ['finance','investing','stocks','mutual funds','SIP','trading','personal finance','money','wealth','budget','financial planning','crypto','NFT','real estate'],
    indiaKeywords: ['stock market India','mutual fund India','SIP India','personal finance Hindi','Indian investor','NSE BSE','Zerodha','Groww','financial advice India'],
    topHashtags: ['#PersonalFinanceIndia','#StockMarketIndia','#MutualFundsIndia','#SIPInvestment','#IndianInvestor','#MoneyManagement','#FinancialFreedom'],
    brandCategories: ['fintech apps','trading platforms','insurance','banking','investment products'],
    indianBrands: ['Zerodha','Groww','Upstox','INDmoney','Coin by Zerodha','ET Money','Paytm Money'],
    contentFormats: ['market analysis','investment tips','SIP explainers','budget breakdowns','financial news commentary'],
    audienceTraits: 'working professionals 25-45 metros tier-1 cities interested in wealth building',
    searchAngles: ['stock market influencer India','personal finance creator India','investment advisor India','finance educator India','trading coach India']
  },
  travel: {
    keywords: ['travel','adventure','explore','wanderlust','tourism','backpacking','destination','trip','vacation','hotel','resort','trek','nomad','vlog'],
    indiaKeywords: ['travel blogger India','Indian travel vlogger','budget travel India','Himachal travel','Rajasthan travel','Goa travel','Northeast India','Indian backpacker'],
    topHashtags: ['#TravelIndia','#IncredibleIndia','#IndianTraveller','#HiddenGems','#TravelBloggerIndia','#WanderlustIndia','#ExploreIndia'],
    brandCategories: ['travel gear','luggage','hotels','airlines','travel insurance','booking platforms'],
    indianBrands: ['MakeMyTrip','Cleartrip','OYO','IRCTC','Airbnb India','Zostel'],
    contentFormats: ['destination guides','budget breakdowns','travel vlogs','packing tips','hidden gems','itineraries'],
    audienceTraits: 'young working Indians 22-35 who travel domestically and internationally',
    searchAngles: ['travel blogger India','travel vlogger India','adventure creator India','backpacker India','travel guide India']
  },
  tech: {
    keywords: ['technology','tech','smartphone','gadget','review','unboxing','software','app','AI','coding','developer','startup','SaaS','laptop','gaming'],
    indiaKeywords: ['tech reviewer India','Indian tech YouTuber','gadget review India','smartphone India','startup India','Indian developer','coding India Hindi','tech news India'],
    topHashtags: ['#TechIndia','#GadgetReview','#IndianTech','#SmartphoneIndia','#StartupIndia','#TechReviewIndia','#UnboxingIndia'],
    brandCategories: ['smartphones','laptops','accessories','apps','software','gaming'],
    indianBrands: ['OnePlus India','Realme','Poco','boAt','Noise','Fire-Boltt','Boat'],
    contentFormats: ['unboxing videos','comparison videos','app reviews','tech news','coding tutorials','startup stories'],
    audienceTraits: 'tech-savvy Indians 18-35 metros interested in latest gadgets and software',
    searchAngles: ['tech reviewer India','gadget influencer India','smartphone reviewer India','tech YouTuber India','coding creator India']
  },
  parenting: {
    keywords: ['parenting','mom','dad','baby','kids','toddler','pregnancy','motherhood','fatherhood','family','child development','education','newborn','breastfeeding'],
    indiaKeywords: ['Indian mom blogger','parenting India','Indian family vlogger','desi mom','Indian parenting tips','baby care India','pregnancy India','new mom India'],
    topHashtags: ['#IndianMom','#ParentingIndia','#MomBloggerIndia','#DesiMom','#IndianFamily','#MotherhoodIndia','#BabyIndia'],
    brandCategories: ['baby products','toys','education','maternity','nutrition for kids','childcare'],
    indianBrands: ['Himalaya Baby','Mamaearth Baby','Chicco India','LuvLap','Mamy Poko','FirstCry'],
    contentFormats: ['parenting tips','baby product reviews','pregnancy vlogs','family vlogs','child development content'],
    audienceTraits: 'Indian parents 25-40 primarily mothers in metros and tier-1 cities',
    searchAngles: ['mom influencer India','parenting blogger India','family vlogger India','pregnancy creator India','baby care influencer India']
  },
  business: {
    keywords: ['business','entrepreneurship','startup','founder','CEO','marketing','sales','ecommerce','D2C','brand building','growth hacking','leadership','MBA','agency'],
    indiaKeywords: ['Indian entrepreneur','startup India','D2C founder India','business influencer India','Indian CEO','founder story India','business tips Hindi','marketing India'],
    topHashtags: ['#StartupIndia','#IndianEntrepreneur','#D2CIndia','#BusinessIndia','#FounderStory','#MarketingIndia','#GrowthHacking'],
    brandCategories: ['business tools','SaaS','books','courses','consulting','marketing services'],
    indianBrands: ['Zoho','Razorpay','Freshworks','CleverTap','MoEngage','WebEngage'],
    contentFormats: ['founder stories','business lessons','marketing breakdowns','startup advice','revenue reveals','growth case studies'],
    audienceTraits: 'Indian entrepreneurs founders and business professionals 25-45 metros',
    searchAngles: ['entrepreneur India','startup founder India','business influencer India','marketing expert India','D2C founder India']
  },
  education: {
    keywords: ['education','learning','study','exam','competitive exam','UPSC','JEE','NEET','career','skills','online learning','coaching','teacher','tutoring'],
    indiaKeywords: ['education influencer India','study tips India','UPSC preparation','JEE coaching','NEET India','Hindi education','Indian teacher','online classes India'],
    topHashtags: ['#EducationIndia','#StudyIndia','#UPSCIndia','#JEEPreparation','#LearningIndia','#StudentIndia','#OnlineEducation'],
    brandCategories: ['edtech','books','stationery','online courses','coaching institutes','learning apps'],
    indianBrands: ['Byju\'s','Unacademy','Vedantu','Physics Wallah','Toppr','Doubtnut'],
    contentFormats: ['study tips','exam preparation','career advice','subject tutorials','motivation for students'],
    audienceTraits: 'Indian students 15-25 preparing for competitive exams across all tiers',
    searchAngles: ['education creator India','study influencer India','teacher India','exam coach India','student motivator India']
  },
  lifestyle: {
    keywords: ['lifestyle','daily routine','productivity','wellness','mindfulness','self-improvement','morning routine','journaling','mental health','work-life balance','minimalism'],
    indiaKeywords: ['lifestyle blogger India','Indian lifestyle influencer','productivity India','wellness India','daily routine India','self-improvement Hindi','Indian lifestyle vlog'],
    topHashtags: ['#LifestyleIndia','#IndianLifestyle','#WellnessIndia','#ProductivityIndia','#SelfCareIndia','#MindfulnessIndia','#DailyRoutineIndia'],
    brandCategories: ['wellness products','productivity tools','home decor','personal care','books','supplements'],
    indianBrands: ['The Minimalist','Bombay Shaving Company','Kama Ayurveda','Forest Essentials','Conscious Chemist'],
    contentFormats: ['day in the life','morning routines','productivity systems','wellness tips','book recommendations','mindset content'],
    audienceTraits: 'urban Indians 22-35 metros interested in self-improvement and quality of life',
    searchAngles: ['lifestyle influencer India','wellness creator India','productivity creator India','self-improvement India','daily routine India']
  },
  gaming: {
    keywords: ['gaming','esports','streamer','gamer','Twitch','YouTube gaming','mobile gaming','BGMI','Free Fire','Call of Duty','Minecraft','game review','walkthrough'],
    indiaKeywords: ['Indian gamer','gaming influencer India','BGMI India','Free Fire India','mobile gamer India','esports India','Hindi gaming','gaming setup India'],
    topHashtags: ['#IndianGaming','#BGMIIndia','#FreeFire','#GamingIndia','#IndianGamer','#EsportsIndia','#MobileGaming'],
    brandCategories: ['gaming peripherals','smartphones','energy drinks','gaming chairs','headphones','gaming accessories'],
    indianBrands: ['Lenovo Legion India','ASUS ROG India','boAt gaming','Cosmic Byte','Redgear','Portronics'],
    contentFormats: ['gameplay videos','game reviews','esports commentary','gaming setup tours','tips and tricks','live streams'],
    audienceTraits: 'young Indians 15-28 primarily male metros and tier-2 cities mobile gaming dominant',
    searchAngles: ['gaming influencer India','esports creator India','mobile gamer India','BGMI player India','gaming YouTuber India']
  }
};

// ═══════════════════════════════════════════════════════════════════
// SEARCH ANALYTICS
// ═══════════════════════════════════════════════════════════════════

const searchAnalytics = {
  history: [],
  suggestions: new Map(),
  lastSearch: null,
  
  track(query, resultsCount, duration, provider) {
    const entry = {
      query: query.toLowerCase().trim(),
      results: resultsCount,
      duration,
      provider,
      timestamp: Date.now()
    };
    this.history.unshift(entry);
    if (this.history.length > 100) this.history.pop();
    
    // Update suggestions
    const words = query.toLowerCase().split(/\s+/);
    words.forEach(w => {
      if (w.length > 3) {
        const count = this.suggestions.get(w) || 0;
        this.suggestions.set(w, count + 1);
      }
    });
    
    this.lastSearch = entry;
    this.save();
  },
  
  getSuggestions(partial) {
    if (!partial || partial.length < 2) return [];
    const p = partial.toLowerCase();
    const suggestions = [];
    this.suggestions.forEach((count, word) => {
      if (word.startsWith(p) && word.length > partial.length) {
        suggestions.push({ word, count });
      }
    });
    return suggestions.sort((a, b) => b.count - a.count).slice(0, 5).map(s => s.word);
  },
  
  getRelated() {
    if (!this.lastSearch) return [];
    const words = this.lastSearch.query.split(/\s+/).filter(w => w.length > 3);
    const related = [];
    this.suggestions.forEach((count, word) => {
      if (words.some(w => word.includes(w) && word !== w)) {
        related.push(word);
      }
    });
    return [...new Set(related)].slice(0, 5);
  },
  
  save() {
    try {
      localStorage.setItem('smm_search_analytics', JSON.stringify({
        history: this.history.slice(0, 50),
        suggestions: Array.from(this.suggestions.entries())
      }));
    } catch(e) { console.warn('Search error:', e); }
  },
  
  load() {
    try {
      const data = JSON.parse(localStorage.getItem('smm_search_analytics') || '{}');
      if (data.history) this.history = data.history;
      if (data.suggestions) this.suggestions = new Map(data.suggestions);
    } catch(e) { console.warn('Search error:', e); }
  }
};

searchAnalytics.load();

// ═══════════════════════════════════════════════════════════════════
// MULTI-FACTOR RANKING
// ═══════════════════════════════════════════════════════════════════

function calculateRelevanceScore(result, query, filters = {}) {
  const { trustLevel = 'all', timeRange = 'all', platform = 'all' } = filters;
  let score = 50; // Base score
  
  // Trust scoring (0-30 points)
  const trustScore = getTrustScore(result.domain);
  score += trustScore;
  
  // Recency scoring (0-20 points)
  const recencyScore = getRecencyScore(result.publishedDate);
  score += recencyScore;
  
  // Query relevance (0-30 points)
  const queryScore = getQueryRelevance(result, query);
  score += queryScore;
  
  // Engagement signals (0-10 points) - based on domain authority
  const engagementScore = getEngagementScore(result.domain);
  score += engagementScore;
  
  // Platform filter bonus
  if (platform !== 'all' && result.domain?.includes(platform)) {
    score += 15;
  }
  
  return Math.min(100, Math.max(0, Math.round(score)));
}

function getTrustScore(domain) {
  if (!domain) return 0;
  const d = domain.toLowerCase();
  if (TRUST_DOMAINS.HIGH.some(td => d.includes(td))) return 30;
  if (TRUST_DOMAINS.MEDIUM.some(td => d.includes(td))) return 20;
  if (TRUST_DOMAINS.LOW.some(td => d.includes(td))) return 10;
  return 5;
}

function getRecencyScore(dateStr) {
  if (!dateStr) return 5; // Unknown date
  const date = new Date(dateStr);
  const now = new Date();
  const daysOld = (now - date) / (1000 * 60 * 60 * 24);
  
  if (daysOld <= 7) return 20;
  if (daysOld <= 30) return 15;
  if (daysOld <= 90) return 10;
  if (daysOld <= 365) return 5;
  return 0;
}

function getQueryRelevance(result, query) {
  if (!query || !result) return 0;
  const q = query.toLowerCase();
  const snippetStr = typeof result.snippet === 'string' ? result.snippet : JSON.stringify(result.snippet || '');
  const text = `${result.title || ''} ${snippetStr} ${result.domain || ''}`.toLowerCase();
  
  const queryWords = q.split(/\s+/).filter(w => w.length > 2);
  let matches = 0;
  queryWords.forEach(w => {
    if (text.includes(w)) matches++;
  });
  
  return Math.min(30, Math.round((matches / queryWords.length) * 30));
}

function getEngagementScore(domain) {
  // High-authority domains typically have better content
  if (TRUST_DOMAINS.HIGH.some(d => domain?.includes(d))) return 10;
  if (TRUST_DOMAINS.MEDIUM.some(d => domain?.includes(d))) return 7;
  if (TRUST_DOMAINS.LOW.some(d => domain?.includes(d))) return 4;
  return 2;
}

// ═══════════════════════════════════════════════════════════════════
// FILTERS
// ═══════════════════════════════════════════════════════════════════

function applyFilters(results, filters = {}) {
  let filtered = [...results];
  
  // Time range filter
  if (filters.timeRange && filters.timeRange !== 'all') {
    const now = new Date();
    filtered = filtered.filter(r => {
      if (!r.publishedDate) return filters.timeRange === 'any';
      const date = new Date(r.publishedDate);
      const days = (now - date) / (1000 * 60 * 60 * 24);
      switch (filters.timeRange) {
        case 'week': return days <= 7;
        case 'month': return days <= 30;
        case 'quarter': return days <= 90;
        case 'year': return days <= 365;
        default: return true;
      }
    });
  }
  
  // Trust filter
  if (filters.trustLevel && filters.trustLevel !== 'all') {
    filtered = filtered.filter(r => {
      const score = getTrustScore(r.domain);
      switch (filters.trustLevel) {
        case 'high': return score >= 25;
        case 'medium': return score >= 15 && score < 25;
        case 'low': return score < 15;
        default: return true;
      }
    });
  }
  
  // Platform filter
  if (filters.platform && filters.platform !== 'all') {
    const platformDomains = PLATFORM_DOMAINS[filters.platform] || [];
    filtered = filtered.filter(r => 
      platformDomains.some(pd => r.domain?.includes(pd))
    );
  }
  
  // Confidence filter (based on relevance score)
  if (filters.minConfidence) {
    filtered = filtered.filter(r => 
      (r.relevanceScore || 0) >= filters.minConfidence
    );
  }
  
  return filtered;
}

// ═══════════════════════════════════════════════════════════════════
// RESULT FORMATTING
// ═══════════════════════════════════════════════════════════════════

function getTrustBadge(domain) {
  const score = getTrustScore(domain);
  if (score >= 25) return { label: 'HIGH TRUST', color: '#00d4aa', bg: 'rgba(0,212,170,0.15)' };
  if (score >= 15) return { label: 'MEDIUM', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
  return { label: 'BASIC', color: '#9ca3af', bg: 'rgba(156,163,175,0.15)' };
}

function getRecencyBadge(dateStr) {
  if (!dateStr) return { label: 'Unknown', color: '#9ca3af' };
  const date = new Date(dateStr);
  const now = new Date();
  const daysOld = (now - date) / (1000 * 60 * 60 * 24);
  
  if (daysOld <= 7) return { label: 'This Week', color: '#10b981' };
  if (daysOld <= 30) return { label: 'This Month', color: '#3b82f6' };
  if (daysOld <= 90) return { label: '3 Months', color: '#8b5cf6' };
  if (daysOld <= 365) return { label: 'This Year', color: '#f59e0b' };
  return { label: 'Older', color: '#9ca3af' };
}

function formatResultForModule(result, module) {
  const trustBadge = getTrustBadge(result.domain);
  const recencyBadge = getRecencyBadge(result.publishedDate);
  
  const base = {
    ...result,
    trustBadge,
    recencyBadge,
    relevanceScore: result.relevanceScore || 50
  };
  
  switch (module) {
    case 'content':
      return formatContentResult(base);
    case 'analytics':
      return formatAnalyticsResult(base);
    case 'strategy':
      return formatStrategyResult(base);
    case 'trends':
      return formatTrendsResult(base);
    case 'influencer':
      return formatInfluencerResult(base);
    default:
      return formatDefaultResult(base);
  }
}

function formatContentResult(r) {
  return {
    ...r,
    formatted: `🎯 **${r.title}**
${r.trustBadge.label} | ${r.recencyBadge.label}
${r.snippet?.substring(0, 200)}...
📎 [Read more →](${r.url})`,
    quickActions: ['Copy Hook', 'Save Idea', 'Generate Post']
  };
}

function formatAnalyticsResult(r) {
  return {
    ...r,
    formatted: `📊 **${r.title}**
${r.trustBadge.label} | ${r.recencyBadge.label} | Score: ${r.relevanceScore}
${r.snippet?.substring(0, 250)}...`,
    quickActions: ['Analyze', 'Compare', 'Export']
  };
}

function formatStrategyResult(r) {
  return {
    ...r,
    formatted: `🏆 **${r.title}**
${r.trustBadge.label} | ${r.recencyBadge.label}
**Insight:** ${r.snippet?.substring(0, 300)}`,
    quickActions: ['Apply Strategy', 'Save', 'Get Details']
  };
}

function formatTrendsResult(r) {
  return {
    ...r,
    formatted: `🔥 **${r.title}**
${r.trustBadge.label} | ${r.recencyBadge.label}
${r.snippet?.substring(0, 200)}...
📈 [Full Trend Analysis →](${r.url})`,
    quickActions: ['Use Trend', 'Set Alert', 'Save']
  };
}

function formatInfluencerResult(r) {
  return {
    ...r,
    formatted: `👤 **${r.title}**
Source: ${r.domain}
${r.snippet?.substring(0, 200)}...`,
    quickActions: ['View Profile', 'Get Contact', 'Save']
  };
}

function formatDefaultResult(r) {
  return {
    ...r,
    formatted: `**${r.title}**
${r.trustBadge.label} | ${r.recencyBadge.label} | Relevance: ${r.relevanceScore}%
${r.snippet?.substring(0, 300)}`,
    quickActions: ['Read', 'Save', 'Share']
  };
}

// ═══════════════════════════════════════════════════════════════════
// MODULE-CONTEXTUAL SEARCH
// ═══════════════════════════════════════════════════════════════════

function getContextualQueries(query, module) {
  const baseQuery = query.toLowerCase().trim();
  const queries = [];
  
  const modulePrefixes = {
    content: ['content marketing', 'viral post', 'engaging content'],
    analytics: ['metrics', 'performance data', 'engagement stats'],
    strategy: ['marketing strategy', 'growth plan', 'competitive analysis'],
    trends: ['trending', 'viral', 'what\'s working'],
    influencer: ['influencer', 'creator', 'collaboration'],
    scheduling: ['posting time', 'best time', 'schedule'],
    research: ['market research', 'data', 'insights']
  };
  
  const prefixes = modulePrefixes[module] || [];
  
  // Generate contextual variations
  prefixes.forEach(prefix => {
    queries.push(`${prefix} ${baseQuery} India 2026`);
    queries.push(`${baseQuery} ${prefix} India`);
  });
  
  // Always add base + India
  queries.push(`${baseQuery} India 2026`);
  queries.push(`${baseQuery} Indian market`);
  
  // Add competitive angle for strategy
  if (module === 'strategy') {
    queries.push(`${baseQuery} competitor India`);
    queries.push(`${baseQuery} case study India`);
  }
  
  return [...new Set(queries)].slice(0, 5);
}

// ═══════════════════════════════════════════════════════════════════
// SEARCH PROVIDERS - API Route fallback
// ═══════════════════════════════════════════════════════════════════

// Try API route first, fallback to direct call
async function tryApiRoute(provider, query, maxResults = 8) {
  try {
    const res = await fetchWithTimeout('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, query, maxResults })
    }, 10000);
    
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return { results: data.results, fromApiRoute: true };
      }
      if (data.error) {
        return { results: [], error: data.error, fromApiRoute: true };
      }
    } else {
      // Non-2xx response — consume body to avoid browser logging 400
      try { await res.json(); } catch(e) { try { await res.text(); } catch(e2) {} }
    }
  } catch(e) {
    // Silently fail - will use fallback
  }
  return null;
}

// Unified search function - Serper primary, Exa fallback
async function searchTavily(q, options = {}) {
  const { maxResults = 8 } = options;
  
  // Try Serper first via API route
  const serperResult = await tryApiRoute('serper', q, maxResults);
  if (serperResult) {
    return { ...serperResult, weak: serperResult.results.length < 2, duration: 0 };
  }
  
  // Try Serper direct
  const serperDirect = await searchSerper(q);
  if (serperDirect.results && serperDirect.results.length > 0) {
    return { ...serperDirect, provider: 'serper' };
  }
  
  // Fallback to Exa
  const exaResult = await searchExa(q);
  if (exaResult.results && exaResult.results.length > 0) {
    return { ...exaResult, provider: 'exa' };
  }
  
  return { results: [], weak: true, error: true };
}

// CoinGecko - Free crypto price data (no API key needed)
async function searchCoinGecko(query = '') {
  try {
    const startTime = Date.now();
    const qLower = query.toLowerCase();

    const COIN_MAP = {
      'bitcoin': 'bitcoin', 'btc': 'bitcoin',
      'ethereum': 'ethereum', 'eth': 'ethereum',
      'usdt': 'tether', 'tether': 'tether',
      'bnb': 'binancecoin', 'binance': 'binancecoin',
      'xrp': 'ripple', 'ripple': 'ripple',
      'solana': 'solana', 'sol': 'solana',
      'dogecoin': 'dogecoin', 'doge': 'dogecoin',
      'cardano': 'cardano', 'ada': 'cardano',
      'polygon': 'matic-network', 'matic': 'matic-network',
      'shib': 'shiba-inu', 'shiba': 'shiba-inu',
      'crypto': 'bitcoin'
    };

    let coinId = 'bitcoin';
    for (const [keyword, id] of Object.entries(COIN_MAP)) {
      if (qLower.includes(keyword)) { coinId = id; break; }
    }

    const res = await fetchWithTimeout(
      `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`,
      {},
      8000
    );

    if (!res.ok) throw new Error('CoinGecko error ' + res.status);
    const data = await res.json();
    const p = data.market_data;

    const priceInr = p.current_price?.inr;
    const priceUsd = p.current_price?.usd;
    const change24h = p.price_change_percentage_24h?.toFixed(2);
    const change7d = p.price_change_percentage_7d?.toFixed(2);
    const marketCap = p.market_cap?.inr;
    const high24h = p.high_24h?.inr;
    const low24h = p.low_24h?.inr;

    const snippet = [
      `${data.name} (${data.symbol?.toUpperCase()})`,
      priceInr ? `₹${Number(priceInr).toLocaleString('en-IN')} / $${Number(priceUsd).toLocaleString()}` : '',
      change24h ? `24h: ${change24h > 0 ? '+' : ''}${change24h}%` : '',
      change7d ? `7d: ${change7d > 0 ? '+' : ''}${change7d}%` : '',
      high24h ? `24h High: ₹${Number(high24h).toLocaleString('en-IN')}` : '',
      low24h ? `24h Low: ₹${Number(low24h).toLocaleString('en-IN')}` : '',
      marketCap ? `Market Cap: ₹${(marketCap / 1e12).toFixed(2)}T` : '',
      `Last updated: ${new Date(data.last_updated).toLocaleTimeString('en-IN')}`
    ].filter(Boolean).join(' | ');

    return {
      results: [{
        domain: 'coingecko.com',
        title: `${data.name} Live Price`,
        snippet,
        url: `https://www.coingecko.com/en/coins/${coinId}`,
        publishedDate: data.last_updated,
        provider: 'coingecko'
      }],
      weak: false,
      duration: Date.now() - startTime,
      provider: 'coingecko'
    };
  } catch(e) {
    console.warn('[CoinGecko]', e.message);
    return { results: [], weak: true, error: true, provider: 'coingecko' };
  }
}

// Search via LinkUp (AI-powered real-time search, requires LINKUP_KEY)
async function searchLinkUp(query = '') {
  try {
    const startTime = Date.now();
    const result = await tryApiRoute('linkup', query, 8);
    
    if (result && result.results && result.results.length > 0) {
      return { results: result.results, weak: false, duration: Date.now() - startTime, provider: 'linkup' };
    }
    
    return { results: [], weak: true, duration: Date.now() - startTime, provider: 'linkup' };
  } catch(e) {
    return { results: [], weak: true, error: true };
  }
}

// Search via Tavily (AI-powered search, requires TAVILY_KEY)
async function searchTavily(query = '') {
  try {
    const startTime = Date.now();
    const result = await tryApiRoute('tavily', query, 8);
    
    if (result && result.results && result.results.length > 0) {
      return { results: result.results, weak: false, duration: Date.now() - startTime, provider: 'tavily' };
    }
    
    return { results: [], weak: true, duration: Date.now() - startTime, provider: 'tavily' };
  } catch(e) {
    return { results: [], weak: true, error: true };
  }
}

// ═══════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════

async function fetchWithTimeout(url, options, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch(e) {
    clearTimeout(id);
    throw e;
  }
}

function extractHandlesFromText(text) {
  if (!text) return [];
  const handleMatches = text.match(/@[a-zA-Z0-9_.]{3,30}/g) || [];
  const contextMatches = text.match(/\b([a-zA-Z][a-zA-Z0-9_.]{3,25})\b(?=\s*[\(\-–]\s*\d+[k|K|m|M]?\s*followers?)/g) || [];
  
  const allHandles = [...handleMatches.map(h => h.replace('@', '')), ...contextMatches];
  const stopWords = new Set(['gmail', 'yahoo', 'hotmail', 'outlook', 'instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'tiktok', 'google', 'apple', 'india', 'delhi', 'mumbai', 'bangalore', 'email', 'contact', 'hello', 'info', 'admin', 'support', 'media', 'brand', 'official']);
  
  return [...new Set(allHandles)]
    .map(h => h.toLowerCase().trim())
    .filter(h => h.length >= 3 && h.length <= 30 && !stopWords.has(h) && !h.includes('..') && /^[a-zA-Z0-9_.]+$/.test(h))
    .slice(0, 25);
}

// ═══════════════════════════════════════════════════════════════════
// RESULT SCORING - Intent-based relevance
// ═══════════════════════════════════════════════════════════════════

function scoreSearchResult(r, intent) {
  const url = (r.url || '').toLowerCase();
  const text = ((r.title || '') + ' ' + (r.snippet || '')).toLowerCase();
  
  // Hard reject low-trust domains
  if (EXCLUDE_DOMAINS.some(d => url.includes(d))) return null;
  
  let score = 0;
  const domain = url.replace(/^https?:\/\//, '').split('/')[0];
  
  // Trust level scoring
  const trustScore = getTrustScore(domain);
  score += trustScore;
  
  // Recency scoring
  const pubDate = r.publishedDate || r.date || '';
  if (/2026|2025/.test(pubDate)) score += 3;
  else if (/2024/.test(pubDate)) score += 2;
  else if (/2023/.test(pubDate)) score += 1;
  
  // Intent-based relevance
  if (intent.isBrand && /revenue|market share|campaign|strategy|brand|company|founded/i.test(text)) score += 3;
  if (intent.isResearch && /research|report|survey|data|analysis|market|competitor/i.test(text)) score += 3;
  if (intent.isContent && /engagement|viral|reel|content|post|hook|caption/i.test(text)) score += 3;
  if (intent.isInfluencer && /influencer|follower|nano|micro|creator|collab|ugc/i.test(text)) score += 3;
  if (intent.isNews && /launched|announced|trending|viral|2025|2026|latest|news/i.test(text)) score += 3;
  
  // Data quality signals
  if (/\d+%|\d+\s*(crore|lakh|K|k|M|m)|₹/.test(text)) score += 2;
  if (/case study|data|research|report|survey|benchmark/i.test(text)) score += 1;
  
  return {
    ...r,
    domain,
    score,
    trustLevel: trustScore >= 25 ? 'HIGH' : trustScore >= 15 ? 'MED' : 'BASIC',
    recency: /2026|2025/.test(pubDate) ? 'RECENT' : /2024/.test(pubDate) ? 'CURRENT' : 'DATED'
  };
}

function extractClaims(results) {
  const claims = [];
  if (!Array.isArray(results) || results.length === 0) return claims;
  
  const claimPatterns = [
    { pattern: /(?:₹|Rs\.?)\s*[\d,]+\.?\d*\s*(?:crore|lakh|thousand|million|billion)?/gi, type: 'STAT', label: 'monetary value' },
    { pattern: /[\d,]+\.?\d*\s*(?:crore|lakh|thousand|million|billion)\s*(?:rupees?|INR|₹)?/gi, type: 'STAT', label: 'monetary value' },
    { pattern: /[\d,]+\.?\d*%/g, type: 'STAT', label: 'percentage' },
    { pattern: /(?:grew|increased|grew|declined|fell|drops?|rose|jump(?:ed|ing)|surge[sd]?|growth of)\s+(?:by\s+)?[\d,]+\.?\d*\s*%/gi, type: 'TREND', label: 'growth/decline' },
    { pattern: /(?:market size|valuation|revenue|valuation|worth)\s+(?:of\s+)?(?:₹|Rs\.?)?[\d,]+\.?\d*\s*(?:crore|lakh|thousand|million|billion)?/gi, type: 'STAT', label: 'market metric' },
    { pattern: /(?:founded|launched|acquired|merged)\s+(?:in\s+)?(?:20\d{2})/gi, type: 'EVENT', label: 'company event' },
    { pattern: /(?:top\s+(?:\d+|one|two|three)|#\d+|ranked\s+(?:\d+|one|two|three))\s*(?:brand|platform|company|app|influencer)?/gi, type: 'RANKING', label: 'ranking' },
    { pattern: /(?:users?|customers?|audience|followers?|subscribers?)\s+(?:of\s+)?[\d,]+\.?\d*\s*(?:million|lakh|crore|thousand)?/gi, type: 'STAT', label: 'user metric' },
    { pattern: /(?:D2C|B2B|B2C|SaaS|EdTech|FinTech|FMCG|ecommerce)\s+(?:market|sector|industry)/gi, type: 'CATEGORY', label: 'industry classification' },
  ];
  
  results.forEach(r => {
    const text = (r.snippet || r.title || '').trim();
    const domain = r.domain || '';
    
    claimPatterns.forEach(({ pattern, type, label }) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const key = match.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 30);
          if (key.length < 4) return;
          
          const existing = claims.find(c => c.key === key && c.type === type);
          if (existing) {
            if (!existing.domains.includes(domain) && domain) {
              existing.domains.push(domain);
            }
          } else {
            claims.push({
              key,
              claim: match,
              type,
              label,
              domains: domain ? [domain] : [],
              snippet: text.substring(0, 200),
              sourceTitle: r.title
            });
          }
        });
      }
    });
  });
  
  return claims;
}

function buildEvidencePack(scoredResults, intent) {
  const total = scoredResults.length;
  const claims = extractClaims(scoredResults);
  
  const verifiedClaims = claims.filter(c => c.domains.length >= 2);
  const singleSourceClaims = claims.filter(c => c.domains.length === 1);
  
  const signal = (() => {
    if (verifiedClaims.length >= 2) return 'STRONG';
    if (verifiedClaims.length >= 1) return 'MODERATE';
    if (singleSourceClaims.length >= 2) return 'MODERATE';
    if (total >= 3) return 'WEAK';
    return 'UNCERROBORATED';
  })();
  
  let pack = `=== EVIDENCE PACK ===\n`;
  pack += `Signal: ${signal} | Sources: ${total} | Verified claims: ${verifiedClaims.length} | Single-source: ${singleSourceClaims.length}\n\n`;
  
  if (verifiedClaims.length > 0) {
    pack += `── VERIFIED CLAIMS (cross-referenced) ──\n`;
    verifiedClaims.forEach((c, i) => {
      pack += `[${i + 1}] ✅ ${c.claim}\n`;
      pack += `    Corroborated by: ${c.domains.join(', ')}\n`;
      pack += `    Context: ${c.snippet.substring(0, 150)}\n\n`;
    });
  }
  
  if (singleSourceClaims.length > 0) {
    pack += `── SINGLE-SOURCE CLAIMS (unverified) ──\n`;
    singleSourceClaims.slice(0, 5).forEach((c, i) => {
      pack += `[${i + 1}] ⚠️  ${c.claim}\n`;
      pack += `    Source: ${c.domains[0]} | Type: ${c.label}\n`;
      pack += `    "${c.snippet.substring(0, 120)}"\n\n`;
    });
    if (singleSourceClaims.length > 5) {
      pack += `[... ${singleSourceClaims.length - 5} more unverified claims]\n\n`;
    }
  }
  
  const strong = scoredResults.filter(r => r && r.score >= 6);
  const moderate = scoredResults.filter(r => r && r.score >= 3 && r.score < 6);
  const low = scoredResults.filter(r => r && r.score >= 1 && r.score < 3);
  
  if (strong.length) {
    pack += `── HIGH-QUALITY SOURCES (prioritize these) ──\n\n`;
    strong.slice(0, 2).forEach((r, i) => {
      pack += `[TRUST: HIGH] ${r.domain}\n`;
      pack += `Title: ${r.title}\n`;
      pack += `${(r.snippet || '').substring(0, 200)}\n\n`;
    });
  }
  
  if (moderate.length) {
    pack += `── MEDIUM-QUALITY SOURCES ──\n\n`;
    moderate.slice(0, 1).forEach((r, i) => {
      pack += `[TRUST: MEDIUM] ${r.domain}\n`;
      pack += `Title: ${r.title}\n`;
      pack += `${(r.snippet || '').substring(0, 150)}\n\n`;
    });
  }
  
  if (low.length) {
    pack += `── LOW-QUALITY SOURCES (use with caution) ──\n\n`;
    low.slice(0, 1).forEach((r, i) => {
      pack += `[TRUST: LOW] ${r.domain}\n`;
      pack += `Title: ${r.title}\n`;
      pack += `${(r.snippet || '').substring(0, 100)}\n\n`;
    });
  }
  
  if (verifiedClaims.length === 0 && singleSourceClaims.length === 0 && total === 0) {
    pack += `── NO VERIFIABLE DATA ──\n`;
    pack += `⚠️  No statistics, facts, or figures found in search results.\n`;
    pack += `INSTRUCTION: Answer from general knowledge. Clearly label any estimates as [ESTIMATE].\n\n`;
  } else if (signal === 'UNCORROBORATED') {
    pack += `⚠️  WARNING: Evidence is weak. No claims corroborated across multiple sources.\n`;
    pack += `INSTRUCTION: Cite sources directly. Do not present single-source claims as facts.\n`;
  }
  
  pack += `=== END PACK ===\n`;
  pack += `INSTRUCTIONS:
- Prioritize [TRUST: HIGH] sources - they are verified and reliable
- If using [TRUST: MEDIUM] data → add [SOURCE] tag
- [TRUST: LOW] sources → MUST add [UNVERIFIED] if used
- If HIGH sources conflict → say "mixed signals, need more data"
- NEVER invent numbers not in the data
- Lead with VERIFIED CLAIMS. Mark single-source data as [UNVERIFIED].`;
  
  return pack;
}

// ═══════════════════════════════════════════════════════════════════
// SMART SEARCH - UNIFIED INTERFACE
// ═══════════════════════════════════════════════════════════════════
// SMART SEARCH ROUTING - Intent-based intelligent search
// ═══════════════════════════════════════════════════════════════════

async function smartSearch(query, options = {}) {
  const { onStatus, maxResults = 8 } = options;
  const status = function(msg) { if (onStatus) onStatus(msg); };
  
  if (!query?.trim() || query.trim().length < 3) return '';
  
  const q = query.trim();
  const qLower = q.toLowerCase();
  const wordCount = q.split(' ').length;
  
  // Add India context if not present
  let searchQuery = q;
  if (!qLower.includes('india')) {
    searchQuery = q + ' India';
  }
  
  // Check cache
  const cacheKey = `smart_${searchQuery.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 50)}`;
  try {
    const cached = localStorage.getItem('smm_search_cache_' + cacheKey);
    if (cached) {
      const { data, time, confidence } = JSON.parse(cached);
      if (Date.now() - time < 15 * 60 * 1000) {
        status('Using cached results...');
        return { evidence: data, confidence: confidence || 'UNKNOWN', sourceCount: 0 };
      }
    }
  } catch(e) { console.warn('Search error:', e); }
  
  // INTENT CLASSIFIER
  const intent = {
    isCasual: wordCount <= 4 && !/create|write|plan|campaign|strategy|content|hook|caption|influencer|calendar|analyse|research|find|generate|brand|post|reel/i.test(qLower),
    isBrand: /about|who is|brand|company|startup|founded|revenue|funding|market share|valuation/i.test(qLower),
    isResearch: /research|analyse|analyze|deep analysis|market|intel|competitor|landscape|report|strategy|audit/i.test(qLower),
    isInfluencer: /influencer|creator|collab|nano|micro|macro|ugc|kol|ambassador/i.test(qLower),
    isNews: /\b(news|latest news|breaking|just announced|this week|just launched|recently launched)\b/i.test(qLower) && !/research|analyse|analyze|strategy|market|brand|campaign performance|influencer/i.test(qLower),
    isContent: /write|create|caption|hook|reel|post|story|dm|script|carousel|thread|hashtag|generate/i.test(qLower),
    isTech: /tech|saas|app|software|developer|startup|product|api|code/i.test(qLower),
    isLocal: /india|delhi|mumbai|bangalore|jaipur|chennai|hyderabad|kolkata|pune|tier.?2/i.test(qLower),
    isCricket: /cricket|match|score|ipl|t20|world cup|odi|test|rcb|mi|csk|dc|rr|kkr|srh|pti|virat|rohit|sachin/i.test(qLower),
    isStock: /stock|nifty|sensex|share|market|bse|nse|reliance|tcs|hdfc|bharti|infosys|price/i.test(qLower),
    isCrypto: /crypto|bitcoin|btc|ethereum|eth|web3|blockchain|nft|defi|solana|dogecoin|bnb|xrp|usdt|polygon|matic|altcoin|coin\s*(price|market|trading)/i.test(qLower),
    isHealth: /\b(health|fitness|diet|nutrition|exercise|yoga|ayurveda|medicine|disease|symptoms|treatment|doctor|hospital|calories|weight loss|diabetes|blood pressure|cholesterol|mental health|anxiety|depression|therapy|wellness)\b/i.test(qLower) && !/stock|market|brand|marketing|campaign|influencer/i.test(qLower),
  };
  
  // CASUAL - No search needed
  if (intent.isCasual) {
    return '';
  }
  
  const searches = [];
  const aux = [];
  let skipNormalSearch = false;
  let allStructured = [];
  
  // ROUTING TABLE - 2 primary calls per intent max, fallbacks handle the rest
  if (intent.isResearch || intent.isBrand) {
    status('Searching...');

    // Fix 1: Counter = Exa (better for insights/opinions), not Serper
    const factualQuery  = searchQuery + ' 2025 2026';
    const evidenceQuery = searchQuery + ' India case study data report 2025 2026';
    const counterQuery  = searchQuery + ' India mistakes problems warnings 2026';

    const [factualResults, evidenceResults, counterResults] = await Promise.all([
      Promise.all([searchSerper(factualQuery).catch(() => null),  searchExa(factualQuery).catch(() => null)]),
      Promise.all([searchSerper(evidenceQuery).catch(() => null), searchExa(evidenceQuery).catch(() => null)]),
      Promise.all([searchExa(counterQuery).catch(() => null)])  // Exa better for counter insights
    ]);

    const factualStructured  = factualResults.flatMap(r  => r && r.results ? r.results : []).filter(r => r && r.title);
    const evidenceStructured = evidenceResults.flatMap(r => r && r.results ? r.results : []).filter(r => r && r.title);
    const counterStructured  = counterResults.flatMap(r  => r && r.results ? r.results : []).filter(r => r && r.title);

    factualStructured.forEach(r  => r._angle = 'FACTUAL');
    evidenceStructured.forEach(r => r._angle = 'EVIDENCE');
    counterStructured.forEach(r  => r._angle = 'COUNTER');

    allStructured = [...factualStructured, ...evidenceStructured, ...counterStructured];

    // One aux source only — GNews for recency signal
    aux.push(searchGNews(searchQuery));
    skipNormalSearch = true;
  }
  else if (intent.isInfluencer) {
    status('Searching influencer directories...');
    searches.push(searchSerper(
      searchQuery + ' influencer Instagram India 2025 2026 ' +
      'site:grynow.in OR site:winkl.co OR site:plixxo.com OR site:kofluence.com'
    ));
    searches.push(searchExa(searchQuery + ' influencer campaign India'));
    // No aux — influencer queries need precision not volume
  }
  else if (intent.isNews) {
    status('Searching latest news...');
    searches.push(searchGNews(searchQuery));
    searches.push(searchSerper(searchQuery + ' news 2026'));
    aux.push(searchIndiaNewsFeeds());
  }
  else if (intent.isContent) {
    status('Finding what is working right now...');
    searches.push(searchSerper(searchQuery + ' social media content 2025 2026'));
    aux.push(searchGNews(searchQuery + ' brand campaign'));
  }
  else if (intent.isTech) {
    status('Searching tech sources...');
    searches.push(searchSerper(searchQuery + ' 2025 2026'));
    searches.push(searchHackerNews(searchQuery));
    // Fix 3: Add Exa as fallback for tech depth
    aux.push(searchExa(searchQuery));
  }
  else if (intent.isCricket) {
    status('Fetching cricket updates...');
    searches.push(searchCricket(searchQuery));
    searches.push(searchSerper(searchQuery + ' cricket India'));
    // No aux needed — live score sources are sufficient
  }
  else if (intent.isCrypto) {
    status('Fetching crypto data...');
    searches.push(searchCoinGecko(searchQuery));
    searches.push(searchSerper(searchQuery + ' cryptocurrency price India 2026'));
    // Conditional: news/analysis only if asked
    const isAnalysis = /why|analysis|prediction|future|news|going|falling|rising|bull|bear/i.test(qLower);
    if (isAnalysis) {
      aux.push(searchGNews(searchQuery + ' cryptocurrency'));
    }
  }
  else if (intent.isStock) {
    status('Fetching stock data...');
    
    // Smart stock flow: Primary = Finnhub + Stocks (structured data)
    // Fallback Serper: ONLY for analysis/news questions
    // Covers: news, analysis, why, prediction, market, finance, going, falling, etc.
    const isAnalysisQuery = /why|analysis|prediction|future|news|opinion|going|falling|ris|update|market|finance|share|quarter|result|earning|report/i.test(qLower);
    
    // Always primary: Stocks + Finnhub (structured data)
    searches.push(searchStocks(searchQuery));
    aux.push(searchFinnhub(searchQuery));
    
    // Serper: ONLY if user asks for analysis/news/reasons (not just price check)
    if (isAnalysisQuery) {
      searches.push(searchSerper(searchQuery + ' stock market India NSE BSE news analysis'));
    }
  }
  else if (intent.isHealth) {
    status('Searching health sources...');
    searches.push(searchSerper(
      searchQuery + ' site:who.int OR site:icmr.gov.in OR site:mohfw.gov.in OR site:ncbi.nlm.nih.gov 2025'
    ));
    searches.push(searchSerper(searchQuery + ' India health expert doctor 2025'));
    aux.push(searchExa(searchQuery + ' clinical research India health'));
  }
  else {
    // General - Fix 2: Add Exa for stability (not rely entirely on fallback)
    status('Searching...');
    searches.push(searchSerper(searchQuery + ' 2026'));
    searches.push(searchExa(searchQuery + ' 2026'));  // Exa fallback for stability
  }
  
  // Execute searches (skip if already decomposed)
  let primaryResults = [];
  let auxResults = [];
  let answers = [];
  
  if (skipNormalSearch) {
    status('Collecting results from decomposed search...');
    auxResults = await Promise.all(aux.map(p => p.catch(() => '')));
  } else {
    status('Collecting results...');
    [primaryResults, auxResults] = await Promise.all([
      Promise.all(searches.map(p => p.catch(() => null))),
      Promise.all(aux.map(p => p.catch(() => '')))
    ]);
    
    // Collect structured results
    allStructured = primaryResults
      .filter(Boolean)
      .flatMap(r => Array.isArray(r) ? r : (r && r.results ? r.results : []));
    
    answers = primaryResults
      .filter(Boolean)
      .map(r => r && r.answer ? r.answer : '')
      .filter(Boolean);
  }
  
  // ═══════════════════════════════════════════════════════════════════
  // RESCUE FALLBACK - If results too few, expand sources
  // ═══════════════════════════════════════════════════════════════════
  if (allStructured.length < 2) {
    status('Expanding search...');
    try {
      const fallbackResults = await Promise.all([
        searchSerper(searchQuery + ' 2026').catch(() => null),
        searchExa(searchQuery).catch(() => null),
        searchDuckDuckGo(searchQuery).catch(() => null)
      ]);
      const fallbackStructured = fallbackResults
        .filter(Boolean)
        .flatMap(r => Array.isArray(r) ? r : (r && r.results ? r.results : []));
      allStructured = [...allStructured, ...fallbackStructured];
    } catch(e) { console.warn('Search error:', e); }
  }
  
  // Deduplicate
  const seen = new Set();
  let ranked = allStructured.filter(r => {
    if (!r || !r.title) return false;
    const key = (r.title || '').toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    if (r.domain && EXCLUDE_DOMAINS.some(d => r.domain.includes(d))) return false;
    return r.domain;
  }).slice(0, maxResults);
  
  // JINA CONTENT EXTRACTION - Fetch clean content from top URLs
  // SCRAPEDO: ONLY when Jina fails AND URL is HIGH/MEDIUM trust (expensive!)
  let jinaContent = '';
  if (ranked.length > 0 && (intent.isResearch || intent.isBrand || intent.isContent)) {
    status('Fetching detailed content...');
    try {
      // Pass URLs with trust level so Scrape.do fallback can decide
      const topUrlsWithTrust = ranked.slice(0, 3)
        .filter(r => r.url && !JINA_BLOCKLIST.some(d => r.url.includes(d)))
        .map(r => ({ url: r.url, trustLevel: r.trustLevel || 'LOW' }));
      if (topUrlsWithTrust.length > 0) {
        const jinaResults = await fetchMultipleWithJina(topUrlsWithTrust, 2);
        if (jinaResults.length > 0) {
          jinaContent = '\n\n### DEEP CONTENT (via Jina Reader) ###\n';
          jinaResults.forEach((jr, idx) => {
            if (jr && jr.content) {
              jinaContent += `\n[Source ${idx + 1}]: ${jr.title || 'Untitled'}\n`;
              jinaContent += jr.content.substring(0, 2000) + '\n';
            }
          });
          jinaContent += '\n### END DEEP CONTENT ###\n';
        }
      }
    } catch(e) {

    }
  }
  
  // SECOND FALLBACK - If still no results, try broad Wikipedia + DDG
  if (ranked.length === 0) {
    status('Broad search...');
    try {
      const broadResults = await Promise.all([
        searchWikipedia(searchQuery).catch(() => null),
        searchDuckDuckGo(searchQuery).catch(() => null)
      ]);
      const broadStructured = broadResults
        .filter(Boolean)
        .flatMap(r => Array.isArray(r) ? r : (r && r.results ? r.results : []));
      ranked = broadStructured.filter(r => r && r.title).slice(0, maxResults);
    } catch(e) { console.warn('Search error:', e); }
  }
  
  // Score and rank results with intent-based relevance
  const scored = ranked
    .map(r => scoreSearchResult(r, intent))
    .filter(r => r !== null);
  
  // Deduplicate by domain after scoring
  const seenDomains = new Set();
  const uniqueScored = scored.filter(r => {
    if (seenDomains.has(r.domain)) return false;
    seenDomains.add(r.domain);
    return true;
  });
  
  // Sort by score
  uniqueScored.sort((a, b) => b.score - a.score);
  
  // Build improved evidence pack
  let evidencePack = '';
  if (uniqueScored.length > 0) {
    evidencePack = buildEvidencePack(uniqueScored, intent);
    
    // Add direct answers if available
    if (answers.length > 0) {
      evidencePack += `\n📌 DIRECT ANSWERS:\n${answers.join('\n')}\n`;
    }
  }
  
  // Add aux string sources
  const auxStrings = auxResults.filter(r => typeof r === 'string' && r.length > 20);
  if (auxStrings.length > 0) {
    evidencePack += `\n### ADDITIONAL CONTEXT ###\n${auxStrings.join('\n').substring(0, 1500)}\n`;
  }
  
  // Add Jina deep content if available
  if (jinaContent) {
    evidencePack += jinaContent;
  }
  
  // Extract confidence from evidence pack
  const signalMatch = evidencePack.match(/Signal:\s*(STRONG|MODERATE|WEAK)/i);
  const confidence = signalMatch ? signalMatch[1].toUpperCase() : 'UNKNOWN';
  
  // Cache results
  try {
    localStorage.setItem('smm_search_cache_' + cacheKey, JSON.stringify({
      data: evidencePack,
      time: Date.now(),
      confidence
    }));
  } catch(e) { console.warn('Search error:', e); }
  
  status('Done');
  return { evidence: evidencePack, confidence, sourceCount: uniqueScored.length, formatted: evidencePack };
}

// Format results for AI consumption
function formatResultsForAI(results, query, directAnswer = '') {
  if (!results || results.length === 0) return '';
  
  let out = `=== SEARCH DATA [${query.substring(0, 60)}] ===\n\n`;
  
  if (directAnswer) {
    out += `📌 DIRECT ANSWER:\n${directAnswer}\n\n`;
  }
  
  out += `📊 SOURCES (${results.length} results, ranked by relevance):\n\n`;
  
  results.forEach((r, i) => {
    out += `[${i + 1}] [${r.trustBadge.label}] [${r.recencyBadge.label}] [Relevance: ${r.relevanceScore}%]\n`;
    out += `🌐 ${r.domain}\n`;
    out += `📝 ${r.title}\n`;
    out += `💬 ${r.snippet?.substring(0, 250)}\n`;
    out += `🔗 ${r.url}\n\n`;
  });
  
  out += `=== END SEARCH DATA ===\n`;
  return out;
}

// ═══════════════════════════════════════════════════════════════════
// CACHE
// ═══════════════════════════════════════════════════════════════════

function getSearchCache(key) {
  try {
    const cached = localStorage.getItem('search_cache_v2_' + key);
    if (!cached) return null;
    const data = JSON.parse(cached);
    if (Date.now() - data.timestamp > 30 * 60 * 1000) {
      localStorage.removeItem('search_cache_v2_' + key);
      return null;
    }
    return data.result;
  } catch(e) { return null; }
}

function setSearchCache(key, result) {
  try {
    localStorage.setItem('search_cache_v2_' + key, JSON.stringify({
      timestamp: Date.now(),
      result
    }));
  } catch(e) { console.warn('Search error:', e); }
}

// ═══════════════════════════════════════════════════════════════════
// NICHE-AWARE INFLUENCER SEARCH HELPERS
// ═══════════════════════════════════════════════════════════════════

function buildNicheInfluencerQueries(params) {
  const { niche, city, platform, tier, brand } = params;

  const normalizedNiche = normalizeNiche(niche);
  const nicheData = NICHE_INTELLIGENCE[normalizedNiche] || NICHE_INTELLIGENCE.lifestyle;
  
  // Normalize tier from dropdown value to key
  const tierLower = tier.toLowerCase();
  const normalizedTier = tierLower.includes('nano') ? 'nano' :
                        tierLower.includes('micro') ? 'micro' :
                        tierLower.includes('mid') ? 'mid' : 'macro';
  const tierInfo = INFLUENCER_TIERS[normalizedTier] || INFLUENCER_TIERS.micro;
  const cityTerm = city && city !== 'Pan-India' ? city : 'India';
  const platformLower = (platform || 'instagram').toLowerCase();

  const topKeywords = nicheData.keywords.slice(0, 3).join(' ');
  const topIndiaKeywords = nicheData.indiaKeywords.slice(0, 2).join(' ');
  const topSearchAngle = nicheData.searchAngles[0];
  const brandCategory = nicheData.brandCategories[0];

  const queries = [];

  queries.push({
    q: `${topSearchAngle} ${cityTerm} ${platformLower} ${tierInfo.range} followers`,
    domains: ['grynow.in','viralmafia.com','winkl.co','plixxo.com','influglue.com','kofluence.com','qoruz.com','klugklug.com'],
    label: 'DIRECTORY_NICHE',
    weight: 5
  });

  queries.push({
    q: `${topIndiaKeywords} ${platformLower} creator ${cityTerm} ${tierInfo.searchTerm}`,
    domains: [],
    label: 'NICHE_INDIA',
    weight: 4
  });

  queries.push({
    q: `${normalizedNiche} ${platformLower} influencer India brand collaboration ${brandCategory} 2026`,
    domains: ['socialsamosa.com','afaqs.com','exchange4media.com','yourstory.com'],
    label: 'BRAND_COLLAB_NICHE',
    weight: 4
  });

  queries.push({
    q: `top ${normalizedNiche} creators India ${platformLower} 2026 most followed engaged authentic`,
    domains: ['grynow.in','viralmafia.com','qoruz.com','klugklug.com','socialsamosa.com','afaqs.com'],
    label: 'TOP_CREATORS_NICHE',
    weight: 4
  });

  queries.push({
    q: `${nicheData.searchAngles[1] || topSearchAngle} ${cityTerm} India ${platformLower} ${tierInfo.range}`,
    domains: [],
    label: 'SEARCH_ANGLE_2',
    weight: 3
  });

  queries.push({
    q: `"${nicheData.topHashtags[0]}" OR "${nicheData.topHashtags[1]}" creator India ${cityTerm} ${platformLower} influencer`,
    domains: [],
    label: 'HASHTAG_DISCOVERY',
    weight: 3
  });

  if (brand) {
    queries.push({
      q: `${brand} India influencer collaboration ${normalizedNiche} ${platformLower} creator partnership`,
      domains: [],
      label: 'BRAND_SPECIFIC',
      weight: 5
    });
  } else {
    queries.push({
      q: `${nicheData.indianBrands.slice(0,2).join(' OR ')} India influencer creator collaboration ${normalizedNiche}`,
      domains: [],
      label: 'CATEGORY_BRANDS',
      weight: 3
    });
  }

  queries.push({
    q: `${topSearchAngle} ${cityTerm} ${platformLower} "@" followers ${nicheData.keywords[0]} ${nicheData.keywords[1]}`,
    domains: [],
    label: 'HANDLE_DISCOVERY',
    weight: 5,
    useSerper: true
  });

  return { queries, nicheData, normalizedNiche };
}

function extractContextAroundHandle(handle, text, windowSize = 300) {
  const idx = text.toLowerCase().indexOf(handle.toLowerCase());
  if (idx === -1) return '';
  const start = Math.max(0, idx - windowSize);
  const end = Math.min(text.length, idx + handle.length + windowSize);
  return text.substring(start, end);
}

function validateHandleForNiche(handle, rawText, nicheData) {
  if (!handle || !rawText || !nicheData) return { valid: true, score: 1, reasons: [] };

  const contextWindow = extractContextAroundHandle(handle, rawText, 300);
  const contextLower = contextWindow.toLowerCase();
  const reasons = [];
  let score = 0;

  const nicheKeywordsFound = nicheData.keywords.filter(kw => contextLower.includes(kw.toLowerCase()));

  if (nicheKeywordsFound.length >= 3) {
    score += 5;
    reasons.push(`Strong niche match: ${nicheKeywordsFound.slice(0,3).join(', ')}`);
  } else if (nicheKeywordsFound.length >= 1) {
    score += 2;
    reasons.push(`Niche keyword found: ${nicheKeywordsFound[0]}`);
  } else {
    score -= 2;
    reasons.push('No niche keywords found near handle');
  }

  const indiaKeywordsFound = nicheData.indiaKeywords.filter(kw => contextLower.includes(kw.toLowerCase().split(' ')[0]));
  if (indiaKeywordsFound.length > 0) {
    score += 2;
    reasons.push('India-specific content confirmed');
  }

  const hasFollowerData = /\d+[k|K|m|M|l|L]?\s*followers?/.test(contextWindow);
  if (hasFollowerData) {
    score += 3;
    reasons.push('Follower count found');
  }

  const indianBrandFound = nicheData.indianBrands.some(brand => contextLower.includes(brand.toLowerCase()));
  if (indianBrandFound) {
    score += 3;
    reasons.push('Indian brand collaboration mentioned');
  }

  if (/engagement|likes|views|reach|impression/.test(contextLower)) {
    score += 2;
    reasons.push('Engagement data present');
  }

  return { valid: score >= 0, score, nicheScore: nicheKeywordsFound.length, reasons };
}

// ═══════════════════════════════════════════════════════════════════
// INFLUENCER SEARCH
// ═══════════════════════════════════════════════════════════════════

async function findInfluencers(params, onStatus) {
  const { niche = 'lifestyle', city = 'India', platform = 'Instagram', tier = 'micro', brand = '', count = 5 } = params;
  const status = (msg) => { if (onStatus) onStatus(msg); };

  status('Building niche-specific search queries...');

  const { queries, nicheData, normalizedNiche } = buildNicheInfluencerQueries(params);

  status(`Searching for ${normalizedNiche} creators in ${city || 'India'}...`);

  const searchPromises = queries.map(async sq => {
    try {
      const result = await searchSerper(sq.q).catch(() => ({ results: [], text: '' }));
      return { rawText: result.text || '', results: result.results || [], label: sq.label, weight: sq.weight };
    } catch(e) {
      console.warn(`Search failed [${sq.label}]:`, e.message);
      return { results: [], rawText: '', label: sq.label, weight: 1 };
    }
  });

  const allSearchResults = await Promise.all(searchPromises);

  status('Extracting and validating handles...');

  const combinedRawText = allSearchResults
    .map(r => (r.rawText || '').repeat(Math.ceil(r.weight / 2)))
    .join('\n\n');

  const allHandles = extractHandlesFromText(combinedRawText);

  const handleData = allHandles.map(handle => {
    const nicheValidation = validateHandleForNiche(handle, combinedRawText, nicheData);
    const followerMatch = combinedRawText.match(new RegExp(`(${handle}[^\\n]{0,100}(\\d+[kKmMlL]?\\s*followers?))`, 'i'));
    const followers = followerMatch ? followerMatch[2] : null;
    const mentions = (combinedRawText.match(new RegExp(handle, 'gi')) || []).length;
    const sources = allSearchResults
      .filter(r => r.rawText && r.rawText.toLowerCase().includes(handle.toLowerCase()))
      .map(r => r.label);

    return {
      handle,
      followers,
      mentions,
      sources,
      nicheScore: nicheValidation.nicheScore,
      nicheValid: nicheValidation.valid,
      nicheReasons: nicheValidation.reasons,
      dataScore: nicheValidation.score
    };
  });

  const nicheValidHandles = handleData
    .filter(h => h.nicheValid)
    .sort((a, b) => {
      const scoreA = (a.nicheScore * 3) + (a.mentions * 2) + (a.followers ? 5 : 0);
      const scoreB = (b.nicheScore * 3) + (b.mentions * 2) + (b.followers ? 5 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 20);

  const allResults = [];
  allSearchResults.forEach(r => {
    if (r.results && Array.isArray(r.results)) {
      r.results.forEach(item => {
        if (item && item.title) {
          allResults.push({ domain: item.domain || 'unknown', title: item.title, snippet: item.snippet || '', url: item.url || '', searchLabel: r.label });
        }
      });
    }
  });

  const seen = new Set();
  const uniqueResults = allResults.filter(r => {
    if (!r || !r.title) return false;
    const key = r.domain + r.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  status('Building intelligence pack...');

  return {
    results: uniqueResults,
    rawText: combinedRawText,
    handles: nicheValidHandles,
    searchAngles: queries.map(q => q.label),
    totalResultsFound: uniqueResults.length,
    totalHandlesFound: allHandles.length,
    nicheValidHandles: nicheValidHandles.length,
    nicheData,
    normalizedNiche,
    params
  };
}

function buildInfluencerPrompt(searchData, userParams) {
  const { results, handles, searchAngles, totalResultsFound, totalHandlesFound, nicheValidHandles, nicheData, normalizedNiche, params } = searchData;
  const { niche, city, platform, tier, brand, count } = params;
  
  // Normalize tier from dropdown value to key
  const tierLower = tier.toLowerCase();
  const normalizedTier = tierLower.includes('nano') ? 'nano' :
                        tierLower.includes('micro') ? 'micro' :
                        tierLower.includes('mid') ? 'mid' : 'macro';
  const tierInfo = INFLUENCER_TIERS[normalizedTier] || INFLUENCER_TIERS.micro;

  const nicheContext = nicheData ? `
NICHE INTELLIGENCE FOR ${normalizedNiche.toUpperCase()}:
- Core keywords: ${nicheData.keywords.slice(0,5).join(', ')}
- India-specific signals: ${nicheData.indiaKeywords.slice(0,3).join(', ')}
- Audience: ${nicheData.audienceTraits}
- Relevant Indian brands: ${nicheData.indianBrands.slice(0,4).join(', ')}
- Content formats: ${nicheData.contentFormats.slice(0,3).join(', ')}
` : '';

  const handleBlock = handles && handles.length > 0
    ? `NICHE-VALIDATED HANDLES (${handles.length} confirmed in ${normalizedNiche} niche):

${handles.slice(0, 20).map((h, i) =>
  `${i+1}. @${h.handle}` +
  ` | Niche: ${h.nicheScore >= 3 ? 'HIGH' : h.nicheScore >= 1 ? 'MEDIUM' : 'LOW'}` +
  (h.followers ? ` | ${h.followers}` : '') +
  ` | Found in: ${h.sources.slice(0,2).join(', ')}` +
  (h.nicheReasons[0] ? ` | ${h.nicheReasons[0]}` : '')
).join('\n')}

CRITICAL: Only suggest profiles from this validated list.`
    : `NO NICHE-VALIDATED HANDLES FOUND. Return 0 profiles and suggest search terms to try instead.`;

  const sourceBlock = results && results.length > 0
    ? results.slice(0, 6).map((r, i) => `[${i+1}][${r.searchLabel || 'SEARCH'}] ${r.domain}\n${r.title}\n${(r.snippet || '').substring(0,300)}`).join('\n\n')
    : 'Limited source evidence found.';

  return `You are India's most accurate influencer marketing analyst.

STRICT BRIEF:
- Niche: ${niche} (normalized: ${normalizedNiche})
- Platform: ${platform}
- Tier: ${tier} (${tierInfo.range} followers)
- Location: ${city || 'India'}
- Brand: ${brand || 'not specified'}
- Profiles requested: ${count}

${nicheContext}

SEARCH PERFORMANCE:
- Queries run: ${searchAngles ? searchAngles.length : 0} niche-specific angles
- Total results: ${totalResultsFound || 0}
- Raw handles found: ${totalHandlesFound || 0}
- Niche-validated handles: ${nicheValidHandles || 0}

=== NICHE-VALIDATED HANDLES ===
${handleBlock}
=== END HANDLES ===

=== SOURCE EVIDENCE ===
${sourceBlock}
=== END SOURCES ===

=== NON-NEGOTIABLE RULES ===
RULE 1: ONLY suggest @handles from the NICHE-VALIDATED HANDLES list above
RULE 2: Every profile MUST be relevant to ${normalizedNiche} — if their content does not match, do NOT include
RULE 3: NEVER suggest a handle not in the validated list
RULE 4: Follower count — only from extracted data. Otherwise write "Verify on ${platform}"
RULE 5: If fewer than ${count} niche-valid profiles found → return fewer, say exactly how many were confirmed
RULE 6: Reject any profile whose context suggests they are NOT primarily a ${normalizedNiche} creator
=== END RULES ===

For each confirmed profile, output EXACTLY this format:

---
HANDLE: @[handle from validated list]
NICHE FIT: [HIGH/MEDIUM/LOW] — [specific reason]
FOLLOWERS: [from data] OR "Verify on ${platform}"
LOCATION: [from data or "India"]
CONTENT STYLE: [what they post in ${normalizedNiche}]
WHY FIT: [specific reason]
${brand ? `BRAND FIT: [specific reason]` : `IDEAL BRANDS: [${nicheData?.brandCategories?.slice(0,3).join(', ')}]`}
DATA SOURCE: [which search angle found this]
VERIFY: ${platform === 'Instagram' ? 'https://instagram.com/' : platform === 'YouTube' ? 'https://youtube.com/@' : 'https://linkedin.com/in/'}[handle]
---

After all profiles:

NICHE ACCURACY REPORT:
- Niche requested: ${niche} (${normalizedNiche})
- Profiles confirmed in niche: [X of ${count}]
- Off-niche handles rejected: [X]

IF FEWER THAN ${count} PROFILES FOUND — output this section:
FIND MORE ${normalizedNiche.toUpperCase()} INFLUENCERS:
Try these search terms: ${nicheData?.searchAngles?.slice(0,3).join(', ')}
And check: grynow.in, qoruz.com`;
}

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

window.INFLUENCER_DIRECTORY_DOMAINS = INFLUENCER_DIRECTORY_DOMAINS;
window.INFLUENCER_TIERS = INFLUENCER_TIERS;
window.TRUST_DOMAINS = TRUST_DOMAINS;
window.PLATFORM_DOMAINS = PLATFORM_DOMAINS;
window.normalizeNiche = normalizeNiche;
window.NICHE_INTELLIGENCE = NICHE_INTELLIGENCE;
window.buildNicheInfluencerQueries = buildNicheInfluencerQueries;
window.validateHandleForNiche = validateHandleForNiche;

// ═══════════════════════════════════════════════════════════════════
// DEEP RESEARCH - Iterative multi-round search
// ═══════════════════════════════════════════════════════════════════

async function deepResearchSearch(query, options = {}) {
  const { onStatus, maxIterations = 2, callAI } = options;
  const status = (msg) => { if (onStatus) onStatus(msg); };

  if (!callAI) {
    callAI = window.callAI;
  }

  if (!callAI) {
    status('Deep research requires AI — using standard search');
    return smartSearch(query, { onStatus, maxResults: options.maxResults || 8 });
  }

  status('Deep Research: Round 1/3 — Initial search...');

  // Round 1: Initial broad search
  let round1Results = await smartSearch(query, { onStatus: () => {}, maxResults: 6 });
  if (!round1Results || round1Results.length < 50) {
    // fallback if smartSearch returns empty string
    const r1 = await searchSerper(query + ' India 2026').catch(() => ({ results: [] }));
    const r2 = await searchExa(query + ' India').catch(() => ({ results: [] }));
    const merged = [...(r1.results || []), ...(r2.results || [])];
    round1Results = merged.slice(0, 6).map((r, i) =>
      `[${i + 1}] [${r.domain || 'unknown'}] ${r.title || ''}\n${r.snippet || ''}\n`
    ).join('\n');
  }

  let allResults = round1Results;

  // Round 2: AI gap analysis → refined queries
  status('Deep Research: Round 2/3 — Analyzing gaps...');
  try {
    const gapPrompt = `Analyze these search results for: "${query}"

RESULTS:
${round1Results.substring(0, 3000)}

TASK: Identify what information is MISSING or NOT COVERED well.
Then generate 1-2 REFINED search queries (max 80 chars each) that would fill those gaps.

FORMAT: Return ONLY a JSON object like this, nothing else:
{
  "gaps": ["what is missing"],
  "refinedQueries": ["refined query 1", "refined query 2"]
}

Keep refined queries specific, different from: "${query}"`;

    const gapResult = await callAI([
      { role: 'system', content: 'You are a research analyst. Output valid JSON only.' },
      { role: 'user', content: gapPrompt }
    ], 0.3, 500);

    let gapData = null;
    try {
      const text = gapResult.text || gapResult.content || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) gapData = JSON.parse(jsonMatch[0]);
    } catch (e) {}

    if (gapData && gapData.refinedQueries && gapData.refinedQueries.length > 0) {
      status('Deep Research: Round 2/3 — Running refined searches...');
      const refinedQueries = gapData.refinedQueries.slice(0, 2);

      const refinedResults = await Promise.all(
        refinedQueries.map(async (rq) => {
          const r = await smartSearch(rq, { onStatus: () => {}, maxResults: 4 });
          return typeof r === 'string' ? r : (r.evidence || '');
        })
      );

      const refinedText = refinedResults
        .filter(Boolean)
        .map((r, i) => `--- Refined search ${i + 1}: "${refinedQueries[i]}" ---\n${r.substring(0, 1500)}`)
        .join('\n\n');

      allResults += '\n\n' + refinedText;
    }
  } catch (e) {
    console.warn('Deep research round 2 failed:', e.message);
  }

  // Round 3: Second gap analysis (optional, for complex queries)
  if (maxIterations >= 3) {
    status('Deep Research: Round 3/3 — Final refinement...');
    try {
      const finalPrompt = `Based on research about: "${query}"

CURRENT DATA:
${allResults.substring(0, 4000)}

TASK: Are there CRITICAL gaps still remaining? Generate 1 specific query to fill the most important gap.

FORMAT: Return ONLY a JSON object:
{"finalQuery": "specific query to close the most important gap"}

If no critical gaps remain, return: {"finalQuery": ""}`;

      const finalResult = await callAI([
        { role: 'system', content: 'You are a research analyst. Output valid JSON only.' },
        { role: 'user', content: finalPrompt }
      ], 0.2, 300);

      let finalData = null;
      try {
        const text = finalResult.text || finalResult.content || '';
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) finalData = JSON.parse(jsonMatch[0]);
      } catch (e) {}

      if (finalData && finalData.finalQuery && finalData.finalQuery.trim().length > 5) {
        status('Deep Research: Round 3/3 — Final search...');
        const finalR = await smartSearch(finalData.finalQuery, { onStatus: () => {}, maxResults: 4 });
        if (finalR) {
          allResults += '\n\n--- Final refinement: "' + finalData.finalQuery + '" ---\n' + finalR.substring(0, 1500);
        }
      }
    } catch (e) {
      console.warn('Deep research round 3 failed:', e.message);
    }
  }

  status('Deep Research complete');
  return { evidence: allResults, confidence: 'STRONG', sourceCount: 10 };
}

// Trends search - parallel multi-engine fallback queries
async function searchTrends(niche, geo) {
  geo = geo || 'India';
  const HIGH_TRUST = ['socialsamosa.com', 'afaqs.com', 'yourstory.com', 'inc42.com', 'exchange4media.com', 'economictimes.com', 'businessstandard.com', 'entrackr.com', 'medianama.com'];
  
  const queries = [
    { q: `trending ${niche} ${geo} social media viral 2026`, domains: HIGH_TRUST, label: 'TRENDING' },
    { q: `${niche} viral content ${geo} what is trending now 2026`, domains: HIGH_TRUST, label: 'VIRAL NOW' },
    { q: `${niche} ${geo} social media marketing case study 2026`, domains: null, label: 'CASE STUDY' }
  ];
  
  const results = await Promise.all(queries.map(async (qp) => {
    try {
      const r = await smartSearch(qp.q, { maxResults: 4 });
      return { label: qp.label, r: r };
    } catch (e) {
      return { label: qp.label, r: { results: [], surfaceWarning: false } };
    }
  }));
  
  let out = '';
  let hasWarning = false;
  results.forEach(function (res) {
    if (res.r && res.r.surfaceWarning) hasWarning = true;
    const results = res.r?.results || [];
    if (results.length) {
      out += res.label + ':\n' + results.map(r => `${r.title}\n${r.snippet}\n`).join('') + '\n';
    }
  });
  
  const prefix = hasWarning ? '⚠️ SURFACE LEVEL WARNING: Limited multi-signal data.\n\n' : '';
  return out ? prefix + '### TRENDS [' + niche + ' / ' + geo + '] ###\n' + out + '### END TRENDS ###\n\n' : '';
}

window.findInfluencers = findInfluencers;
window.buildInfluencerPrompt = buildInfluencerPrompt;
window.smartSearch = smartSearch;
window.deepResearchSearch = deepResearchSearch;
window.generateSmartQueries = getContextualQueries;
window.searchAnalytics = searchAnalytics;
window.applyFilters = applyFilters;
window.calculateRelevanceScore = calculateRelevanceScore;
window.getTrustBadge = getTrustBadge;
window.getRecencyBadge = getRecencyBadge;

// New search sources
window.searchGNews = searchGNews;
window.searchDuckDuckGo = searchDuckDuckGo;
window.searchRSS = searchRSS;
window.searchIndiaNewsFeeds = searchIndiaNewsFeeds;
window.NEWS_FEEDS = NEWS_FEEDS;

// Trends search
window.searchTrends = searchTrends;

// Jina Reader - URL to clean Markdown
window.fetchWithJina = fetchWithJina;
window.fetchMultipleWithJina = fetchMultipleWithJina;

// Hacker News - Tech/startup news (free, no API key)
window.searchHackerNews = searchHackerNews;


