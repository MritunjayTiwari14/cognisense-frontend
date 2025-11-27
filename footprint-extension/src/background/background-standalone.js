// Digital Footprint Tracker - Background Script (Standalone)
// All utilities inlined to avoid ES6 import issues

// === CATEGORIES UTILITIES ===
const CATEGORIES = {
    PRODUCTIVITY: "productivity",
    ENTERTAINMENT: "entertainment",
    SOCIAL: "social",
    NEWS: "news",
    SHOPPING: "shopping",
    EDUCATION: "education",
    HEALTH: "health",
    FINANCE: "finance",
    WORK: "work",
    OTHER: "other",
};

const CATEGORY_COLORS = {
    [CATEGORIES.PRODUCTIVITY]: "#4CAF50",
    [CATEGORIES.ENTERTAINMENT]: "#FF9800",
    [CATEGORIES.SOCIAL]: "#E91E63",
    [CATEGORIES.NEWS]: "#2196F3",
    [CATEGORIES.SHOPPING]: "#9C27B0",
    [CATEGORIES.EDUCATION]: "#00BCD4",
    [CATEGORIES.HEALTH]: "#4CAF50",
    [CATEGORIES.FINANCE]: "#FFC107",
    [CATEGORIES.WORK]: "#607D8B",
    [CATEGORIES.OTHER]: "#9E9E9E",
};

const DEFAULT_CATEGORY_PATTERNS = {
    [CATEGORIES.PRODUCTIVITY]: [
        "github.com",
        "gitlab.com",
        "stackoverflow.com",
        "docs.google.com",
        "notion.so",
        "trello.com",
        "asana.com",
        "slack.com",
        "discord.com",
        "zoom.us",
        "teams.microsoft.com",
        "atlassian.net",
        "jira.",
        "confluence.",
        "drive.google.com",
        "dropbox.com",
        "onedrive.",
        "figma.com",
        "canva.com",
    ],
    [CATEGORIES.ENTERTAINMENT]: [
        "youtube.com",
        "netflix.com",
        "hulu.com",
        "disney.",
        "prime.video",
        "spotify.com",
        "soundcloud.com",
        "twitch.tv",
        "gaming.",
        "steam.",
        "epic.games",
        "xbox.com",
        "playstation.com",
        "ign.com",
        "gamespot.com",
        "imdb.com",
        "rottentomatoes.com",
        "metacritic.com",
    ],
    [CATEGORIES.SOCIAL]: [
        "facebook.com",
        "instagram.com",
        "twitter.com",
        "x.com",
        "linkedin.com",
        "snapchat.com",
        "tiktok.com",
        "reddit.com",
        "pinterest.com",
        "tumblr.com",
        "whatsapp.com",
        "telegram.org",
        "signal.org",
        "mastodon.",
    ],
    [CATEGORIES.NEWS]: [
        "cnn.com",
        "bbc.com",
        "reuters.com",
        "ap.org",
        "nytimes.com",
        "wsj.com",
        "guardian.co.uk",
        "washingtonpost.com",
        "foxnews.com",
        "npr.org",
        "bloomberg.com",
        "techcrunch.com",
        "wired.com",
        "arstechnica.com",
        "theverge.com",
        "engadget.com",
        "gizmodo.com",
    ],
    [CATEGORIES.SHOPPING]: [
        "amazon.com",
        "ebay.com",
        "walmart.com",
        "target.com",
        "bestbuy.com",
        "shopify.com",
        "etsy.com",
        "alibaba.com",
        "aliexpress.com",
        "wish.com",
        "nike.com",
        "adidas.com",
        "zara.com",
        "h&m.com",
    ],
    [CATEGORIES.EDUCATION]: [
        "coursera.org",
        "udemy.com",
        "khan.academy",
        "edx.org",
        "pluralsight.com",
        "lynda.com",
        "skillshare.com",
        "masterclass.com",
        "mit.edu",
        "stanford.edu",
        "harvard.edu",
        "wikipedia.org",
        "scholar.google.com",
        "researchgate.net",
    ],
    [CATEGORIES.HEALTH]: [
        "webmd.com",
        "mayoclinic.org",
        "healthline.com",
        "nih.gov",
        "cdc.gov",
        "who.int",
        "myfitnesspal.com",
        "fitbit.com",
        "strava.com",
        "headspace.com",
        "calm.com",
    ],
    [CATEGORIES.FINANCE]: [
        "mint.com",
        "chase.com",
        "bankofamerica.com",
        "wellsfargo.com",
        "paypal.com",
        "venmo.com",
        "robinhood.com",
        "fidelity.com",
        "schwab.com",
        "vanguard.com",
        "coinbase.com",
        "binance.com",
        "bloomberg.com",
    ],
    [CATEGORIES.WORK]: [
        "office.com",
        "gmail.com",
        "outlook.com",
        "calendar.google.com",
        "salesforce.com",
        "hubspot.com",
        "mailchimp.com",
        "zapier.com",
    ],
};

function categorizeUrl(url, userCategories = {}) {
    try {
        const domain = new URL(url).hostname.toLowerCase();

        // Check user-defined categories first
        for (const [category, patterns] of Object.entries(userCategories)) {
            if (
                patterns.some((pattern) =>
                    domain.includes(pattern.toLowerCase())
                )
            ) {
                return category;
            }
        }

        // Check default patterns
        for (const [category, patterns] of Object.entries(
            DEFAULT_CATEGORY_PATTERNS
        )) {
            if (
                patterns.some((pattern) =>
                    domain.includes(pattern.toLowerCase())
                )
            ) {
                return category;
            }
        }

        return CATEGORIES.OTHER;
    } catch {
        return CATEGORIES.OTHER;
    }
}

function getCategoryDisplayName(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function getCategoryIcon(category) {
    const icons = {
        [CATEGORIES.PRODUCTIVITY]: "💼",
        [CATEGORIES.ENTERTAINMENT]: "🎬",
        [CATEGORIES.SOCIAL]: "👥",
        [CATEGORIES.NEWS]: "📰",
        [CATEGORIES.SHOPPING]: "🛒",
        [CATEGORIES.EDUCATION]: "📚",
        [CATEGORIES.HEALTH]: "🏥",
        [CATEGORIES.FINANCE]: "💰",
        [CATEGORIES.WORK]: "💻",
        [CATEGORIES.OTHER]: "🌐",
    };
    return icons[category] || "🌐";
}

// Handle Supabase OAuth callback coming back to chrome.identity redirect URL
async function handleSupabaseOAuthCallback(tabId, url) {
    try {
        Logger.info("Handling Supabase OAuth callback...", url);
        const hash = new URL(url).hash;
        if (!hash || hash.length <= 1) {
            Logger.warn("Supabase OAuth callback URL missing hash fragment");
            return;
        }

        const params = new URLSearchParams(hash.slice(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (!accessToken) {
            Logger.warn("Supabase OAuth callback missing access_token");
            return;
        }

        const supabaseSession = {
            access_token: accessToken,
            refresh_token: refreshToken,
        };

        await chrome.storage.local.set({
            supabase_session: supabaseSession,
            access_token: accessToken,
            supabaseToken: accessToken,
        });

        API_TOKEN = accessToken;
        Logger.info("Supabase OAuth tokens stored from redirect callback");

        try {
            await chrome.tabs.remove(tabId);
        } catch (closeError) {
            Logger.warn(
                "Failed to close Supabase OAuth tab:",
                closeError?.message || closeError
            );
        }
    } catch (error) {
        Logger.error("Error handling Supabase OAuth callback:", error);
    }
}

// === CONTENT ANALYSIS UTILITIES ===
const SENTIMENT = {
    POSITIVE: "positive",
    NEGATIVE: "negative",
    NEUTRAL: "neutral",
};

const CONTENT_QUALITY = {
    BIASED: "biased",
    NEUTRAL: "neutral",
    INFORMATIVE: "informative",
    HARMFUL: "harmful",
};

function analyzeSentiment(text) {
    if (!text || typeof text !== "string") return SENTIMENT.NEUTRAL;

    const lowercaseText = text.toLowerCase();

    const positiveWords = [
        "amazing",
        "awesome",
        "brilliant",
        "excellent",
        "fantastic",
        "great",
        "happy",
        "love",
        "perfect",
        "wonderful",
        "good",
        "best",
        "beautiful",
        "inspiring",
        "incredible",
        "outstanding",
        "remarkable",
        "success",
        "achievement",
        "celebration",
        "joy",
        "excited",
        "thrilled",
        "grateful",
    ];

    const negativeWords = [
        "terrible",
        "awful",
        "horrible",
        "bad",
        "hate",
        "worst",
        "disgusting",
        "angry",
        "frustrated",
        "disappointed",
        "sad",
        "depressed",
        "crisis",
        "disaster",
        "failure",
        "problem",
        "issue",
        "concern",
        "worry",
        "fear",
        "anxiety",
        "stress",
        "conflict",
        "violence",
        "death",
        "destruction",
    ];

    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach((word) => {
        const matches = lowercaseText.match(new RegExp(`\\b${word}\\b`, "g"));
        if (matches) positiveCount += matches.length;
    });

    negativeWords.forEach((word) => {
        const matches = lowercaseText.match(new RegExp(`\\b${word}\\b`, "g"));
        if (matches) negativeCount += matches.length;
    });

    if (positiveCount > negativeCount) return SENTIMENT.POSITIVE;
    if (negativeCount > positiveCount) return SENTIMENT.NEGATIVE;
    return SENTIMENT.NEUTRAL;
}

function analyzeContentQuality(text) {
    if (!text || typeof text !== "string") return CONTENT_QUALITY.NEUTRAL;

    const lowercaseText = text.toLowerCase();

    const biasedIndicators = [
        "always",
        "never",
        "all",
        "none",
        "everyone",
        "nobody",
        "obviously",
        "clearly",
        "undoubtedly",
        "definitely",
        "absolutely",
        "completely",
        "totally",
        "utterly",
        "entirely",
        "without question",
        "no doubt",
    ];

    const harmfulIndicators = [
        "violence",
        "violent",
        "kill",
        "murder",
        "suicide",
        "self-harm",
        "hate",
        "harassment",
        "bullying",
        "discrimination",
        "racism",
        "sexism",
        "extremist",
        "terrorist",
        "weapon",
        "bomb",
        "drug",
    ];

    let biasScore = 0;
    let harmScore = 0;

    biasedIndicators.forEach((indicator) => {
        const matches = lowercaseText.match(
            new RegExp(`\\b${indicator}\\b`, "g")
        );
        if (matches) biasScore += matches.length;
    });

    harmfulIndicators.forEach((indicator) => {
        const matches = lowercaseText.match(
            new RegExp(`\\b${indicator}\\b`, "g")
        );
        if (matches) harmScore += matches.length;
    });

    // Normalize scores based on text length
    const wordCount = text.split(/\s+/).length;
    const normalizedBias = (biasScore / wordCount) * 100;
    const normalizedHarm = (harmScore / wordCount) * 100;

    if (normalizedHarm > 0.5) return CONTENT_QUALITY.HARMFUL;
    if (normalizedBias > 2) return CONTENT_QUALITY.BIASED;

    // Check for informative indicators
    const informativeIndicators = [
        "according to",
        "research shows",
        "study finds",
        "data indicates",
        "statistics",
        "evidence",
        "peer-reviewed",
        "scientific",
        "academic",
    ];

    const hasInformativeContent = informativeIndicators.some((indicator) =>
        lowercaseText.includes(indicator)
    );

    return hasInformativeContent
        ? CONTENT_QUALITY.INFORMATIVE
        : CONTENT_QUALITY.NEUTRAL;
}

function extractTopics(text, maxTopics = 5) {
    if (!text || typeof text !== "string") return [];

    const topicKeywords = {
        Technology: [
            "tech",
            "software",
            "hardware",
            "computer",
            "programming",
            "coding",
            "ai",
            "machine learning",
            "blockchain",
            "cryptocurrency",
        ],
        Politics: [
            "politics",
            "government",
            "election",
            "democracy",
            "policy",
            "legislation",
            "congress",
            "senate",
            "president",
            "vote",
        ],
        Sports: [
            "sports",
            "football",
            "basketball",
            "soccer",
            "baseball",
            "tennis",
            "olympics",
            "championship",
            "team",
            "game",
        ],
        Health: [
            "health",
            "medical",
            "medicine",
            "doctor",
            "hospital",
            "treatment",
            "therapy",
            "fitness",
            "nutrition",
            "wellness",
        ],
        Entertainment: [
            "movie",
            "film",
            "music",
            "concert",
            "celebrity",
            "actor",
            "singer",
            "album",
            "show",
            "entertainment",
        ],
        Business: [
            "business",
            "company",
            "market",
            "stock",
            "economy",
            "finance",
            "investment",
            "startup",
            "entrepreneur",
            "corporate",
        ],
        Science: [
            "science",
            "research",
            "study",
            "experiment",
            "discovery",
            "theory",
            "biology",
            "chemistry",
            "physics",
            "astronomy",
        ],
        Travel: [
            "travel",
            "vacation",
            "trip",
            "tourism",
            "destination",
            "flight",
            "hotel",
            "adventure",
            "culture",
            "explore",
        ],
    };

    const lowercaseText = text.toLowerCase();
    const topicScores = {};

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
        let score = 0;
        keywords.forEach((keyword) => {
            const matches = lowercaseText.match(
                new RegExp(`\\b${keyword}\\b`, "g")
            );
            if (matches) score += matches.length;
        });
        if (score > 0) topicScores[topic] = score;
    });

    return Object.entries(topicScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, maxTopics)
        .map(([topic]) => topic);
}

function calculateReadabilityScore(text) {
    if (!text || typeof text !== "string") return 0;

    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = text.split(/\s+/).filter((w) => w.trim().length > 0);
    const syllables = words.reduce((count, word) => {
        return count + countSyllables(word);
    }, 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Simplified Flesch Reading Ease Score
    const score =
        206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word) {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
}

/* eslint-env webextensions */
/* global chrome */

// === MAIN BACKGROUND SCRIPT ===

// API Configuration
const API_BASE =
    import.meta.env?.VITE_API_BASE_URL ||
    "http://localhost:8080/api/v1";
let API_TOKEN =
    import.meta.env?.VITE_EXTENSION_API_TOKEN ||
    null;
// Always use this exact Authorization header value for backend requests (no Bearer prefix)
const AUTH_HEADER =
    import.meta.env?.VITE_EXTENSION_API_TOKEN ||
    "";

// Supabase OAuth redirect base (for chrome.identity flow)
const OAUTH_REDIRECT_BASE =
    typeof chrome !== "undefined" &&
    chrome.identity &&
    typeof chrome.identity.getRedirectURL === "function"
        ? chrome.identity.getRedirectURL()
        : null;

// Enhanced logging system
const Logger = {
    info: (message, data = null) => {
        console.log(`[FOOTPRINT-TRACKER] ${message}`, data || "");
    },
    warn: (message, data = null) => {
        console.warn(`[FOOTPRINT-TRACKER] ${message}`, data || "");
    },
    error: (message, data = null) => {
        console.error(`[FOOTPRINT-TRACKER] ${message}`, data || "");
    },
    api: (endpoint, method, payload = null, response = null) => {
        console.group(`[FOOTPRINT-API] ${method} ${endpoint}`);
        if (payload) {
            console.log(
                "📤 Request Payload:",
                JSON.stringify(payload, null, 2)
            );
        }
        if (response) {
            console.log("📥 Response:", JSON.stringify(response, null, 2));
        }
        console.groupEnd();
    },
};

// Tracking state management
let isTrackingPaused = false;
let currentActiveTab = null;
let tabStartTime = null;

// Track user activity
let currentSession = {
    startTime: Date.now(),
    endTime: null,
    totalTime: 0,
    activeTime: 0,
    sites: {},
    emotionalBalance: {
        positive: 0,
        negative: 0,
        neutral: 0,
    },
    categories: {},
    insights: [],
    isPaused: false,
};

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
    Logger.info("🔧 Extension installed/updated - starting initialization...");
    initializeStorage();
});

// Also initialize on startup
chrome.runtime.onStartup.addListener(() => {
    Logger.info("🚀 Extension startup - initializing...");
    initializeStorage();
});

// Initialize storage with default settings
async function initializeStorage() {
    try {
        Logger.info("Initializing storage and API connection...");

        const settings = await chrome.storage.sync.get([
            "trackingEnabled",
            "excludedSites",
            "userCategories",
            "privacyMode",
        ]);

        if (!settings.trackingEnabled) {
            await chrome.storage.sync.set({
                trackingEnabled: true,
                excludedSites: ["chrome://", "chrome-extension://", "about:"],
                userCategories: {},
                privacyMode: false,
            });
            Logger.info("Default settings initialized");
        }

        // Restore tracking state
        const localSettings = await chrome.storage.local.get([
            "isTrackingPaused",
        ]);
        isTrackingPaused = localSettings.isTrackingPaused || false;
        currentSession.isPaused = isTrackingPaused;

        Logger.info(
            `Tracking state: ${isTrackingPaused ? "PAUSED" : "ACTIVE"}`
        );

        // Attempt to hydrate API token from local storage if present
        try {
            const tokens = await chrome.storage.local.get([
                "authToken",
                "access_token",
                "supabaseToken",
                "supabase_session",
            ]);
            API_TOKEN =
                tokens.authToken ||
                tokens.access_token ||
                tokens.supabaseToken ||
                (tokens.supabase_session &&
                    tokens.supabase_session.access_token) ||
                API_TOKEN;
            if (API_TOKEN) {
                Logger.info("Auth token loaded for API requests");
            }
        } catch (e) {
            Logger.warn("No auth token found in storage:", e?.message);
        }

        // Test API connectivity (non-blocking)
        testAPIConnectivity().catch((error) => {
            Logger.warn(
                "API connectivity test failed, continuing without backend:",
                error.message
            );
        });

        // Fetch available categories (non-blocking)
        fetchCategories().catch((error) => {
            Logger.warn(
                "Failed to fetch categories, using defaults:",
                error.message
            );
        });
        startNewSession();
    } catch (error) {
        Logger.error("Error initializing storage:", error);
    }
}

// Start a new tracking session
function startNewSession() {
    currentSession = {
        startTime: Date.now(),
        endTime: null,
        totalTime: 0,
        activeTime: 0,
        sites: {},
        emotionalBalance: {
            positive: 0,
            negative: 0,
            neutral: 0,
        },
        categories: {},
        insights: [],
        isPaused: isTrackingPaused,
    };
}

// Pause/Play functionality with enhanced logging
async function pauseTracking() {
    console.log(`⏸️ [BACKGROUND] PAUSE button clicked - stopping tracking`);
    console.log(
        `📊 [BACKGROUND] Current session time: ${Math.round(
            currentSession.totalTime / 1000
        )}s`
    );

    isTrackingPaused = true;
    currentSession.isPaused = true;

    // Save current tab time if active
    if (currentActiveTab && tabStartTime) {
        const timeSpent = Date.now() - tabStartTime;
        console.log(
            `⏰ [BACKGROUND] Saving current tab time before pause: ${Math.round(
                timeSpent / 1000
            )}s for ${currentActiveTab}`
        );
        await saveTabTime(currentActiveTab, timeSpent);
        tabStartTime = null;
    } else {
        console.log(`ℹ️ [BACKGROUND] No active tab time to save`);
    }

    await chrome.storage.local.set({ isTrackingPaused: true });
    console.log(`💾 [BACKGROUND] Pause state saved to storage`);
    console.log(`✅ [BACKGROUND] TRACKING PAUSED SUCCESSFULLY`);
}

async function resumeTracking() {
    console.log(`▶️ [BACKGROUND] RESUME button clicked - starting tracking`);

    isTrackingPaused = false;
    currentSession.isPaused = false;

    // Start timing current tab if any
    try {
        // Get the currently active tab
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        if (tabs[0] && tabs[0].url) {
            currentActiveTab = tabs[0].url;
            tabStartTime = Date.now();
            console.log(
                `⏰ [BACKGROUND] Started timing for current tab after resume: ${currentActiveTab}`
            );
        } else if (currentActiveTab) {
            tabStartTime = Date.now();
            console.log(
                `⏰ [BACKGROUND] Resumed timing for stored tab: ${currentActiveTab}`
            );
        } else {
            console.log(`ℹ️ [BACKGROUND] No current tab to start timing`);
        }
    } catch (error) {
        console.error(
            `❌ [BACKGROUND] Error getting current tab on resume:`,
            error
        );
        if (currentActiveTab) {
            tabStartTime = Date.now();
            console.log(
                `⏰ [BACKGROUND] Resumed timing for stored tab: ${currentActiveTab}`
            );
        }
    }

    await chrome.storage.local.set({ isTrackingPaused: false });
    console.log(`💾 [BACKGROUND] Resume state saved to storage`);
    console.log(`✅ [BACKGROUND] TRACKING RESUMED SUCCESSFULLY`);
}

// Save time spent on a tab with comprehensive logging
async function saveTabTime(url, timeSpent) {
    if (!url || timeSpent < 1000) {
        if (timeSpent < 1000) {
            Logger.info(
                `Ignoring short session: ${Math.round(
                    timeSpent / 1000
                )}s on ${url}`
            );
        }
        return; // Ignore < 1 second
    }

    try {
        const domain = new URL(url).hostname;
        const settings = await chrome.storage.sync.get(["excludedSites"]);

        // Check if site is excluded
        const isExcluded = settings.excludedSites?.some((excluded) =>
            url.includes(excluded)
        );
        if (isExcluded) {
            Logger.info(`Skipping excluded site: ${domain}`);
            return;
        }

        Logger.info(`💾 Saving ${Math.round(timeSpent / 1000)}s for ${domain}`);

        // Update session data
        if (!currentSession.sites[domain]) {
            currentSession.sites[domain] = {
                url,
                domain,
                visits: 0,
                timeSpent: 0,
                category: categorizeUrl(url),
                lastVisit: Date.now(),
            };
            Logger.info(
                `📝 New site tracked: ${domain} (${currentSession.sites[domain].category})`
            );
        }

        currentSession.sites[domain].timeSpent += timeSpent;
        currentSession.sites[domain].visits += 1;
        currentSession.sites[domain].lastVisit = Date.now();

        // Update total time
        currentSession.totalTime += timeSpent;

        // Send to API with enhanced logging
        await sendToAPI({
            url,
            domain,
            timeSpent,
            category: currentSession.sites[domain].category,
            title: currentSession.sites[domain].title || "",
            clicks: 0, // Will be updated by content script
            keypresses: 0, // Will be updated by content script
        });

        await updateStoredData();

        Logger.info(
            `✅ Session updated - Total: ${Math.round(
                currentSession.totalTime / 1000
            )}s, Sites: ${Object.keys(currentSession.sites).length}`
        );
    } catch (error) {
        Logger.error("Error saving tab time:", error);
    }
}

// Send data to CogniSense API with comprehensive logging
async function sendToAPI(data) {
    try {
        // Get user ID
        const userId = await getUserId();
        if (!userId) {
            Logger.warn("No user ID available for API request");
            return;
        }

        const endpoint = "/tracking/ingest";
        const fullUrl = `${API_BASE}${endpoint}`;

        // Prepare payload according to API documentation
        const payload = {
            user_id: userId,
            url: data.url,
            title: data.title || "",
            text: data.text || "",
            start_ts: (Date.now() - data.timeSpent) / 1000,
            end_ts: Date.now() / 1000,
            duration_seconds: data.timeSpent / 1000,
            clicks: data.clicks || 0,
            keypresses: data.keypresses || 0,
            engagement_score: calculateEngagementScore(
                data.clicks || 0,
                data.keypresses || 0
            ),
        };

        // Log the API request
        Logger.api(endpoint, "POST", payload);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(fullUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: AUTH_HEADER,
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const responseData = await response.json();
            Logger.api(endpoint, "POST", null, responseData);
            Logger.info(`Successfully sent tracking data for ${data.url}`);

            // If we have text content, also send it for content analysis
            if (data.text && data.text.trim().length > 0) {
                await analyzeContent(data.text, data.url);
            }
        } else {
            const errorText = await response.text();
            Logger.warn(
                `API request failed (${response.status}): ${response.statusText}`,
                errorText
            );
        }
    } catch (error) {
        if (error.name === "AbortError") {
            Logger.warn(
                "API request timed out - continuing without backend sync"
            );
        } else {
            Logger.warn(
                "Failed to send data to API (extension will continue working):",
                error.message
            );
        }
    }
}

// Calculate engagement score based on interactions
function calculateEngagementScore(clicks, keypresses) {
    // Simple engagement score calculation
    const totalInteractions = clicks + keypresses;
    return Math.min(1.0, totalInteractions / 100); // Max score of 1.0
}

// Analyze content using the content analysis endpoint
async function analyzeContent(text, url) {
    try {
        const endpoint = "/content/analyze";
        const fullUrl = `${API_BASE}${endpoint}`;

        const payload = {
            text: text.substring(0, 5000), // Limit text length
            url: url,
            analyze_sentiment: true,
            analyze_category: true,
            analyze_emotions: true,
        };

        Logger.api(endpoint, "POST", payload);

        const response = await fetch(fullUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: AUTH_HEADER,
            },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            const analysisData = await response.json();
            Logger.api(endpoint, "POST", null, analysisData);
            Logger.info(`Content analysis completed for ${url}`);

            // Store analysis results
            await storeContentAnalysis(url, analysisData);
        } else {
            const errorText = await response.text();
            Logger.warn(
                `Content analysis failed (${response.status}): ${response.statusText}`,
                errorText
            );
        }
    } catch (error) {
        Logger.warn("Content analysis request failed:", error);
    }
}

// Store content analysis results
async function storeContentAnalysis(url, analysisData) {
    try {
        const domain = new URL(url).hostname;

        if (currentSession.sites[domain]) {
            currentSession.sites[domain].contentAnalysis = {
                sentiment: analysisData.sentiment,
                category: analysisData.category,
                emotions: analysisData.emotions,
                analyzedAt: Date.now(),
            };

            Logger.info(`Stored analysis for ${domain}:`, {
                sentiment: analysisData.sentiment?.label,
                category: analysisData.category?.primary,
                dominantEmotion: analysisData.emotions?.dominant?.label,
            });
        }
    } catch (error) {
        Logger.error("Failed to store content analysis:", error);
    }
}

// Test API connectivity
async function testAPIConnectivity() {
    try {
        const endpoint = "/ping";
        const fullUrl = `${API_BASE}${endpoint}`;

        Logger.info("Testing API connectivity...");

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(fullUrl, {
            signal: controller.signal,
            headers: {
                "Content-Type": "application/json",
                Authorization: AUTH_HEADER,
            },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            Logger.api(endpoint, "GET", null, data);
            Logger.info("API connectivity test successful");
            return true;
        } else {
            Logger.warn(
                `API connectivity test failed (${response.status}): ${response.statusText}`
            );
            return false;
        }
    } catch (error) {
        if (error.name === "AbortError") {
            Logger.warn(
                "API connectivity test timed out (backend may not be running)"
            );
        } else {
            Logger.warn("API connectivity test failed:", error.message);
        }
        return false;
    }
}

// Get available categories from API
async function fetchCategories() {
    try {
        const endpoint = "/categories/labels";
        const fullUrl = `${API_BASE}${endpoint}`;

        Logger.info("Fetching available categories...");

        const response = await fetch(fullUrl, {
            headers: {
                Authorization: AUTH_HEADER,
            },
        });

        if (response.ok) {
            const data = await response.json();
            Logger.api(endpoint, "GET", null, data);
            Logger.info(`Fetched ${data.total} categories`);
            return data.categories;
        } else {
            Logger.warn(
                `Failed to fetch categories (${response.status}): ${response.statusText}`
            );
            return null;
        }
    } catch (error) {
        Logger.warn("Failed to fetch categories:", error);
        return null;
    }
}

// Get user ID (prefer Supabase UUID from JWT; fallback to temporary ID)
async function getUserId() {
    try {
        // Helper to decode JWT payload and extract `sub`
        const getSubFromJwt = (token) => {
            try {
                if (!token || typeof token !== "string") return null;
                const parts = token.split(".");
                if (parts.length < 2) return null;
                const payload = parts[1]
                    .replace(/-/g, "+")
                    .replace(/_/g, "/");
                // Base64 padding
                const padded = payload + "=".repeat((4 - (payload.length % 4)) % 4);
                const json = atob(padded);
                const data = JSON.parse(json);
                return data?.sub || null;
            } catch {
                return null;
            }
        };

        // 1) Try in-memory API_TOKEN first
        let uuid = getSubFromJwt(API_TOKEN);
        if (uuid) return uuid;

        // 2) Try common storage keys where a token might be saved
        const tokens = await chrome.storage.local.get([
            "authToken",
            "access_token",
            "supabaseToken",
            "supabase_session",
        ]);

        const candidateToken =
            tokens.authToken ||
            tokens.access_token ||
            tokens.supabaseToken ||
            (tokens.supabase_session && tokens.supabase_session.access_token) ||
            null;

        uuid = getSubFromJwt(candidateToken);
        if (uuid) return uuid;

        // 3) Fallback to previously stored local ID (legacy behavior)
        const stored = await chrome.storage.local.get(["userId"]);
        if (!stored.userId) {
            const userId =
                (typeof crypto !== "undefined" &&
                    typeof crypto.randomUUID === "function" &&
                    crypto.randomUUID()) ||
                `user_${Date.now()}`;
            await chrome.storage.local.set({ userId });
            return userId;
        }
        return stored.userId;
    } catch {
        return null;
    }
}

// Get today's stats for popup
async function getTodayStats() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get stored data
        const stored = await chrome.storage.local.get([
            "sessions",
            "todayTotal",
        ]);
        const sessions = stored.sessions || [];

        // Filter today's sessions
        const todaySessions = sessions.filter(
            (session) => session.startTime >= today.getTime()
        );

        // Add current session if active
        if (currentSession.startTime >= today.getTime()) {
            todaySessions.push(currentSession);
        }

        // Calculate aggregated stats
        let totalTime = 0;
        const sitesMap = {};

        todaySessions.forEach((session) => {
            totalTime += session.totalTime || 0;

            Object.entries(session.sites || {}).forEach(
                ([domain, siteData]) => {
                    if (!sitesMap[domain]) {
                        sitesMap[domain] = {
                            domain,
                            totalTime: 0,
                            visits: 0,
                            category: siteData.category || "other",
                        };
                    }
                    sitesMap[domain].totalTime += siteData.timeSpent || 0;
                    sitesMap[domain].visits += siteData.visits || 0;
                }
            );
        });

        // Add current active time if we're timing a tab right now
        if (currentActiveTab && tabStartTime && !isTrackingPaused) {
            const currentActiveTime = Date.now() - tabStartTime;
            totalTime += currentActiveTime;

            // Add to the current domain's time
            try {
                const currentDomain = new URL(currentActiveTab).hostname;
                if (!sitesMap[currentDomain]) {
                    sitesMap[currentDomain] = {
                        domain: currentDomain,
                        totalTime: 0,
                        visits: 0,
                        category: categorizeUrl(currentActiveTab),
                    };
                }
                sitesMap[currentDomain].totalTime += currentActiveTime;
                Logger.info(
                    `Adding current active time: ${Math.round(
                        currentActiveTime / 1000
                    )}s to ${currentDomain}`
                );
            } catch (e) {
                Logger.error("Error adding current active time:", e);
            }
        }

        // Convert to array and sort with null checks
        const topSites = Object.values(sitesMap)
            .filter((site) => site && site.domain) // Filter out invalid entries
            .sort((a, b) => (b.totalTime || 0) - (a.totalTime || 0))
            .slice(0, 5)
            .map((site) => ({
                ...site,
                totalTime: Math.max(0, Math.round(site.totalTime / 1000)), // Convert to seconds
            }));

        return {
            totalTime: Math.max(0, Math.round(totalTime / 1000)), // Convert to seconds, ensure positive
            topSites: topSites || [],
            isPaused: Boolean(isTrackingPaused),
            sessionCount: Math.max(0, todaySessions.length),
        };
    } catch (error) {
        Logger.error("Error getting today stats:", error);
        return {
            totalTime: 0,
            topSites: [],
            isPaused: Boolean(isTrackingPaused),
            sessionCount: 0,
        };
    }
}

// Track tab navigation
chrome.tabs.onActivated.addListener(async (activeInfo) => {
    console.log(`🔄 [BACKGROUND] Tab activated: ${activeInfo.tabId}`);

    try {
        const tab = await chrome.tabs.get(activeInfo.tabId);
        console.log(`📱 [BACKGROUND] Active tab URL: ${tab.url}`);
        console.log(
            `⏸️ [BACKGROUND] Tracking state: ${
                isTrackingPaused ? "PAUSED" : "ACTIVE"
            }`
        );

        // Save time for previous tab if we were tracking one
        if (currentActiveTab && tabStartTime && !isTrackingPaused) {
            const timeSpent = Date.now() - tabStartTime;
            console.log(
                `⏰ [BACKGROUND] Tab switched: saving ${Math.round(
                    timeSpent / 1000
                )}s for ${currentActiveTab}`
            );
            await saveTabTime(currentActiveTab, timeSpent);
        } else if (currentActiveTab && isTrackingPaused) {
            console.log(
                `⏸️ [BACKGROUND] Tracking paused - not saving time for: ${currentActiveTab}`
            );
        }

        // Start tracking the new tab (if not paused)
        currentActiveTab = tab.url;
        if (!isTrackingPaused) {
            tabStartTime = Date.now();
            console.log(
                `▶️ [BACKGROUND] Started timing for new active tab: ${tab.url}`
            );
        } else {
            tabStartTime = null;
            console.log(
                `⏸️ [BACKGROUND] Tracking paused - not timing tab: ${tab.url}`
            );
        }

        await trackPageVisit(tab.url, tab.title);
    } catch (error) {
        console.error(
            `❌ [BACKGROUND] Error tracking tab activation:`,
            error
        );
    }
});

// Track tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    // Intercept Supabase OAuth callback to chrome.identity redirect URL
    if (
        OAUTH_REDIRECT_BASE &&
        changeInfo.url &&
        changeInfo.url.startsWith(OAUTH_REDIRECT_BASE)
    ) {
        await handleSupabaseOAuthCallback(tabId, changeInfo.url);
        return;
    }

    if (changeInfo.status === "complete" && tab.url) {
        try {
            // Save time for previous URL if it was different and we were timing it
            if (
                currentActiveTab &&
                currentActiveTab !== tab.url &&
                tabStartTime &&
                !isTrackingPaused
            ) {
                const timeSpent = Date.now() - tabStartTime;
                Logger.info(
                    `URL changed: saving ${Math.round(
                        timeSpent / 1000
                    )}s for ${currentActiveTab}`
                );
                await saveTabTime(currentActiveTab, timeSpent);
            }

            // Update current tab
            currentActiveTab = tab.url;

            // Start timing if not paused
            if (!isTrackingPaused) {
                tabStartTime = Date.now();
                Logger.info(`Started timing for updated tab: ${tab.url}`);
            } else {
                tabStartTime = null;
                Logger.info(
                    `Tracking paused - not timing updated tab: ${tab.url}`
                );
            }

            await trackPageVisit(tab.url, tab.title);

            // Request content analysis regardless of pause state
            await requestContentAnalysis(tabId);
        } catch (error) {
            console.error("Error tracking tab update:", error);
        }
    }
});

// Get today's stats for popup
// Request content analysis from content script
async function requestContentAnalysis(tabId) {
    try {
        // Check if tab is valid and can be scripted
        const tab = await chrome.tabs.get(tabId);
        if (
            !tab.url ||
            tab.url.startsWith("chrome://") ||
            tab.url.startsWith("chrome-extension://") ||
            tab.url.startsWith("moz-extension://") ||
            tab.url.startsWith("edge://") ||
            tab.url === "about:blank" ||
            tab.status !== "complete"
        ) {
            Logger.info(
                `Skipping content analysis for: ${tab.url || "unknown URL"}`
            );
            return;
        }

        // Inject content script and request analysis
        await chrome.scripting.executeScript({
            target: { tabId },
            func: () => {
                try {
                    // Send page content for analysis
                    const content = document.body.innerText || "";
                    const title = document.title || "";

                    if (content.trim().length > 0) {
                        chrome.runtime.sendMessage({
                            type: "CONTENT_ANALYSIS",
                            data: {
                                content: content.substring(0, 5000), // Limit content size
                                title,
                                url: window.location.href,
                            },
                        });
                    }
                } catch (injectionError) {
                    console.warn(
                        "Content analysis injection failed:",
                        injectionError
                    );
                }
            },
        });
    } catch (error) {
        // Check for specific Chrome extension errors
        if (
            error.message.includes("Frame with ID") ||
            error.message.includes("error page") ||
            error.message.includes("Cannot access") ||
            error.message.includes("Extension context invalidated")
        ) {
            Logger.warn(`Cannot inject content script: ${error.message}`);
        } else {
            Logger.error("Error requesting content analysis:", error.message);
        }
    }
}

// Track page visits
async function trackPageVisit(url, title = "") {
    if (!url) return;

    console.log(`🌐 [BACKGROUND] Tracking page visit: ${url}`);
    console.log(`📝 [BACKGROUND] Page title: ${title || "No title"}`);

    try {
        const settings = await chrome.storage.sync.get([
            "trackingEnabled",
            "excludedSites",
        ]);

        if (!settings.trackingEnabled) {
            console.log(`⏹️ [BACKGROUND] Tracking disabled - skipping: ${url}`);
            return;
        }

        // Check if site is excluded
        const isExcluded = settings.excludedSites?.some((excluded) =>
            url.includes(excluded)
        );
        if (isExcluded) {
            console.log(`🚫 [BACKGROUND] Site excluded - skipping: ${url}`);
            return;
        }

        const domain = new URL(url).hostname;
        const timestamp = Date.now();
        const category = categorizeUrl(url);

        console.log(`🏷️ [BACKGROUND] Domain: ${domain}, Category: ${category}`);

        // Update session data
        if (!currentSession.sites[domain]) {
            currentSession.sites[domain] = {
                url,
                title,
                visits: 0,
                timeSpent: 0,
                lastVisit: timestamp,
                category: category,
            };
            console.log(`✨ [BACKGROUND] New site added to session: ${domain}`);
        }

        currentSession.sites[domain].visits += 1;
        currentSession.sites[domain].lastVisit = timestamp;
        currentSession.sites[domain].title = title; // Update title

        console.log(
            `📊 [BACKGROUND] Site stats - Visits: ${
                currentSession.sites[domain].visits
            }, Time: ${Math.round(
                currentSession.sites[domain].timeSpent / 1000
            )}s`
        );

        // Update category tracking
        currentSession.categories[category] =
            (currentSession.categories[category] || 0) + 1;

        // Store in persistent storage
        await updateStoredData();

        console.log(`💾 [BACKGROUND] Session data updated for: ${domain}`);
    } catch (error) {
        console.error(
            `❌ [BACKGROUND] Error tracking page visit for ${url}:`,
            error
        );
    }
}

// Handle messages from content script
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log(`📨 [BACKGROUND] Message received:`, message);
    // Validate message structure first
    if (!message || typeof message !== "object" || !message.type) {
        Logger.warn("Invalid message received:", message);
        try {
            sendResponse({ error: "Invalid message format" });
        } catch (e) {
            Logger.warn("Failed to send error response:", e.message);
        }
        return true;
    }

    try {
        Logger.info(
            `📬 Received message: ${message.type}`,
            sender?.tab?.url || "popup"
        );

        switch (message.type) {
            case "CONTENT_ANALYSIS":
                if (!isTrackingPaused) {
                    await processContentAnalysis(message.data, sender.tab);
                }
                break;

            case "SUPABASE_SESSION_SYNC": {
                try {
                    const accessToken = message.data?.access_token;
                    const refreshToken = message.data?.refresh_token;
                    if (!accessToken) {
                        Logger.warn("SUPABASE_SESSION_SYNC missing access_token");
                        break;
                    }

                    const supabaseSession = {
                        access_token: accessToken,
                        refresh_token: refreshToken || null,
                    };

                    await chrome.storage.local.set({
                        supabase_session: supabaseSession,
                        access_token: accessToken,
                        supabaseToken: accessToken,
                    });

                    API_TOKEN = accessToken;
                    Logger.info("Supabase session synced from web app");
                    sendResponse({ success: true });
                } catch (syncError) {
                    Logger.error(
                        "Error handling SUPABASE_SESSION_SYNC:",
                        syncError
                    );
                    try {
                        sendResponse({ success: false, error: String(syncError) });
                    } catch {
                        // ignore
                    }
                }
                break;
            }

            case "SUPABASE_SESSION_CLEAR": {
                try {
                    await chrome.storage.local.remove([
                        "supabase_session",
                        "access_token",
                        "supabaseToken",
                    ]);
                    API_TOKEN = null;
                    Logger.info("Supabase session cleared from web app");
                    sendResponse({ success: true });
                } catch (clearError) {
                    Logger.error(
                        "Error handling SUPABASE_SESSION_CLEAR:",
                        clearError
                    );
                    try {
                        sendResponse({
                            success: false,
                            error: String(clearError),
                        });
                    } catch {
                        // ignore
                    }
                }
                break;
            }

            case "USER_INTERACTION":
                if (!isTrackingPaused) {
                    await trackUserInteraction(message.data, sender.tab);
                }
                break;

            case "GET_SESSION_DATA":
                sendResponse(await getSessionData());
                break;

            case "GET_ANALYTICS":
                sendResponse(await getAnalytics(message.timeframe));
                break;

            case "UPDATE_SETTINGS":
                await updateSettings(message.settings);
                break;

            case "EXPORT_DATA":
                sendResponse(await exportData());
                break;

            case "getStatus": {
                const status = { paused: isTrackingPaused };
                Logger.info(
                    `Status requested: ${
                        isTrackingPaused ? "PAUSED" : "ACTIVE"
                    }`
                );
                sendResponse(status);
                break;
            }

            case "pauseTracking": {
                await pauseTracking();
                const pauseResponse = { success: true, paused: true };
                Logger.info("✅ Pause request completed");
                sendResponse(pauseResponse);
                break;
            }

            case "resumeTracking": {
                await resumeTracking();
                const resumeResponse = { success: true, paused: false };
                Logger.info("✅ Resume request completed");
                sendResponse(resumeResponse);
                break;
            }

            case "getTodayStats": {
                try {
                    const stats = await getTodayStats();

                    // Validate stats object before accessing properties
                    const validStats = {
                        totalTime:
                            typeof stats?.totalTime === "number"
                                ? stats.totalTime
                                : 0,
                        topSites: Array.isArray(stats?.topSites)
                            ? stats.topSites
                            : [],
                        isPaused:
                            typeof stats?.isPaused === "boolean"
                                ? stats.isPaused
                                : false,
                        sessionCount:
                            typeof stats?.sessionCount === "number"
                                ? stats.sessionCount
                                : 0,
                    };

                    Logger.info(
                        `📊 Stats requested - Total: ${validStats.totalTime}s, Sites: ${validStats.topSites.length}`
                    );
                    sendResponse(validStats);
                } catch (statsError) {
                    Logger.error("Error getting stats for popup:", statsError);
                    const fallbackStats = {
                        totalTime: 0,
                        topSites: [],
                        isPaused: Boolean(isTrackingPaused),
                        sessionCount: 0,
                    };
                    sendResponse(fallbackStats);
                }
                break;
            }

            default:
                Logger.warn("Unknown message type:", message.type);
        }
    } catch (error) {
        const errorMsg = error?.message || String(error);
        Logger.error("Error handling message:", errorMsg);
        try {
            sendResponse({
                error: errorMsg,
                success: false,
                // Provide safe defaults based on message type
                ...(message?.type === "getTodayStats" && {
                    totalTime: 0,
                    topSites: [],
                    isPaused: Boolean(isTrackingPaused),
                    sessionCount: 0,
                }),
                ...(message?.type === "getStatus" && {
                    paused: Boolean(isTrackingPaused),
                }),
            });
        } catch (responseError) {
            Logger.error(
                "Failed to send error response:",
                responseError?.message || responseError
            );
        }
    }

    return true; // Keep channel open for async response
});

// Process content analysis
async function processContentAnalysis(data, tab) {
    if (!data.content || !tab?.url) return;

    try {
        const domain = new URL(tab.url).hostname;

        // Analyze content
        const sentiment = analyzeSentiment(data.content);
        const quality = analyzeContentQuality(data.content);
        const topics = extractTopics(data.content);
        const readability = calculateReadabilityScore(data.content);

        // Update emotional balance
        currentSession.emotionalBalance[sentiment] += 1;

        // Update site data with analysis
        if (currentSession.sites[domain]) {
            currentSession.sites[domain].contentAnalysis = {
                sentiment,
                quality,
                topics,
                readability,
                analyzedAt: Date.now(),
            };
        }

        // Calculate productivity score
        await calculateProductivityScore();

        // Generate insights
        await generateInsights();

        // Update stored data
        await updateStoredData();
    } catch (error) {
        console.error("Error processing content analysis:", error);
    }
}

// Track user interactions
async function trackUserInteraction(data, tab) {
    if (!tab?.url) return;

    try {
        const domain = new URL(tab.url).hostname;
        const timestamp = Date.now();

        if (currentSession.sites[domain]) {
            if (!currentSession.sites[domain].interactions) {
                currentSession.sites[domain].interactions = [];
            }

            currentSession.sites[domain].interactions.push({
                type: data.type,
                timestamp,
                details: data.details,
            });

            // Update active time (rough estimate)
            currentSession.activeTime += 1000; // 1 second per interaction
        }

        await updateStoredData();
    } catch (error) {
        console.error("Error tracking user interaction:", error);
    }
}

// Calculate productivity score
async function calculateProductivityScore() {
    const productiveCategories = [
        CATEGORIES.PRODUCTIVITY,
        CATEGORIES.EDUCATION,
        CATEGORIES.WORK,
    ];
    const distractingCategories = [CATEGORIES.ENTERTAINMENT, CATEGORIES.SOCIAL];

    let productiveTime = 0;
    let distractingTime = 0;
    let totalTime = 0;

    Object.values(currentSession.sites).forEach((site) => {
        const timeSpent = site.timeSpent || 0;
        totalTime += timeSpent;

        if (productiveCategories.includes(site.category)) {
            productiveTime += timeSpent;
        } else if (distractingCategories.includes(site.category)) {
            distractingTime += timeSpent;
        }
    });

    if (totalTime === 0) {
        currentSession.productivityScore = 50; // Neutral score
    } else {
        // Score from 0-100 based on productive vs distracting time
        const productiveRatio = productiveTime / totalTime;
        const distractingRatio = distractingTime / totalTime;
        currentSession.productivityScore = Math.round(
            productiveRatio * 100 - distractingRatio * 30
        );
    }

    // Ensure score is between 0-100
    currentSession.productivityScore = Math.max(
        0,
        Math.min(100, currentSession.productivityScore)
    );
}

// Generate personalized insights
async function generateInsights() {
    const insights = [];

    // Emotional balance insights
    const { positive, negative, neutral } = currentSession.emotionalBalance;
    const total = positive + negative + neutral;

    if (total > 0) {
        const negativeRatio = negative / total;
        if (negativeRatio > 0.6) {
            insights.push({
                type: "emotional_warning",
                title: "High Negative Content Exposure",
                description:
                    "You've encountered a lot of negative content today. Consider taking breaks or visiting more positive content.",
                priority: "high",
            });
        } else if (positive / total > 0.6) {
            insights.push({
                type: "emotional_positive",
                title: "Positive Content Day",
                description:
                    "Great job! You've been consuming mostly positive content today.",
                priority: "low",
            });
        }
    }

    // Productivity insights
    if (currentSession.productivityScore < 30) {
        insights.push({
            type: "productivity_warning",
            title: "Low Productivity Score",
            description:
                "Your focus seems scattered today. Try using website blockers or taking focused work sessions.",
            priority: "medium",
        });
    } else if (currentSession.productivityScore > 80) {
        insights.push({
            type: "productivity_praise",
            title: "Highly Productive Session",
            description:
                "Excellent! You've maintained great focus on productive activities.",
            priority: "low",
        });
    }

    // Category diversity insights
    const categoryCount = Object.keys(currentSession.categories).length;
    if (categoryCount > 6) {
        insights.push({
            type: "diversity_high",
            title: "Diverse Content Consumption",
            description:
                "You've explored many different types of content today. This shows good curiosity!",
            priority: "low",
        });
    }

    currentSession.insights = insights;
}

// Get current session data
async function getSessionData() {
    return {
        session: currentSession,
        timestamp: Date.now(),
    };
}

// Get analytics for specified timeframe
async function getAnalytics(timeframe = "7d") {
    try {
        const storedSessions = (await chrome.storage.local.get([
            "sessions",
        ])) || { sessions: [] };
        const sessions = storedSessions.sessions || [];

        // Calculate timeframe boundaries
        const now = Date.now();
        let startTime;

        switch (timeframe) {
            case "1d":
                startTime = now - 24 * 60 * 60 * 1000;
                break;
            case "7d":
                startTime = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case "30d":
                startTime = now - 30 * 24 * 60 * 60 * 1000;
                break;
            default:
                startTime = now - 7 * 24 * 60 * 60 * 1000;
        }

        const relevantSessions = sessions.filter(
            (session) => session.startTime >= startTime
        );

        // Add current session if active
        if (currentSession.startTime >= startTime) {
            relevantSessions.push(currentSession);
        }

        // Aggregate analytics
        const analytics = {
            totalTime: 0,
            activeTime: 0,
            sitesVisited: new Set(),
            categories: {},
            emotionalBalance: { positive: 0, negative: 0, neutral: 0 },
            avgProductivityScore: 0,
            insights: [],
            trends: [],
        };

        relevantSessions.forEach((session) => {
            analytics.totalTime += session.totalTime || 0;
            analytics.activeTime += session.activeTime || 0;

            Object.keys(session.sites || {}).forEach((site) => {
                analytics.sitesVisited.add(site);
            });

            Object.entries(session.categories || {}).forEach(
                ([category, count]) => {
                    analytics.categories[category] =
                        (analytics.categories[category] || 0) + count;
                }
            );

            analytics.emotionalBalance.positive +=
                session.emotionalBalance?.positive || 0;
            analytics.emotionalBalance.negative +=
                session.emotionalBalance?.negative || 0;
            analytics.emotionalBalance.neutral +=
                session.emotionalBalance?.neutral || 0;

            analytics.insights.push(...(session.insights || []));
        });

        // Calculate average productivity score
        if (relevantSessions.length > 0) {
            const totalProductivity = relevantSessions.reduce(
                (sum, session) => sum + (session.productivityScore || 0),
                0
            );
            analytics.avgProductivityScore =
                totalProductivity / relevantSessions.length;
        }

        analytics.sitesVisited = analytics.sitesVisited.size;

        return analytics;
    } catch (error) {
        console.error("Error getting analytics:", error);
        return null;
    }
}

// Update stored data
async function updateStoredData() {
    try {
        // Update current session end time
        currentSession.endTime = Date.now();
        currentSession.totalTime =
            currentSession.endTime - currentSession.startTime;

        // Store session data
        await chrome.storage.local.set({
            currentSession: currentSession,
            lastUpdated: Date.now(),
        });

        // Also store in sessions history (limit to last 100 sessions)
        const storedSessions = await chrome.storage.local.get(["sessions"]);
        let sessions = storedSessions.sessions || [];

        // Remove current session if it exists in history
        sessions = sessions.filter(
            (s) => s.startTime !== currentSession.startTime
        );

        // Add current session
        sessions.push({ ...currentSession });

        // Keep only last 100 sessions
        if (sessions.length > 100) {
            sessions = sessions.slice(-100);
        }

        await chrome.storage.local.set({ sessions });
    } catch (error) {
        console.error("Error updating stored data:", error);
    }
}

// Update settings
async function updateSettings(newSettings) {
    try {
        await chrome.storage.sync.set(newSettings);
    } catch (error) {
        console.error("Error updating settings:", error);
    }
}

// Export data
async function exportData() {
    try {
        const [syncData, localData] = await Promise.all([
            chrome.storage.sync.get(null),
            chrome.storage.local.get(null),
        ]);

        return {
            settings: syncData,
            sessions: localData.sessions || [],
            currentSession: localData.currentSession,
            exportedAt: Date.now(),
            version: "1.0.0",
        };
    } catch (error) {
        console.error("Error exporting data:", error);
        return null;
    }
}

// Periodic cleanup and session management
setInterval(async () => {
    try {
        // Clean up old sessions (older than 90 days)
        const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
        const storedSessions = await chrome.storage.local.get(["sessions"]);
        let sessions = storedSessions.sessions || [];

        const cleanedSessions = sessions.filter(
            (session) => session.startTime > cutoff
        );

        if (cleanedSessions.length !== sessions.length) {
            await chrome.storage.local.set({ sessions: cleanedSessions });
            console.log("Cleaned up old sessions");
        }

        // Update current session
        await updateStoredData();
    } catch (error) {
        console.error("Error in periodic cleanup:", error);
    }
}, 60000); // Run every minute

console.log("Digital Footprint Tracker background script loaded");

// Initialize when script loads
Logger.info("🚀 Digital Footprint Tracker background script initialized");
Logger.info("📡 API Base URL:", API_BASE);
