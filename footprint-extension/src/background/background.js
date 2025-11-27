import { categorizeUrl } from "../utils/categories.js";
import {
    analyzeSentiment,
    analyzeContentQuality,
    extractTopics,
    calculateReadabilityScore,
} from "../utils/contentAnalysis.js";

let activeTabId = null;
let activeStart = null;
let activeUrl = null;
let paused = false;

// Enhanced API endpoints - replace with your actual backend URLs
const API_BASE_URL =
    process.env.VITE_API_BASE_URL || "https://your-backend-api.com";
const SESSION_API = `${API_BASE_URL}/sessions`;
const CONTENT_API = `${API_BASE_URL}/tracking/ingest`;
const ENGAGEMENT_API = `${API_BASE_URL}/engagement`;

const AUTH_HEADER =
    (typeof process !== "undefined" &&
        process.env &&
        process.env.VITE_EXTENSION_API_TOKEN) ||
    "";

// Development mode flag - set to false in production
const DEV_MODE = true;

// On install init with enhanced settings
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(
        ["events", "settings", "userCategories", "contentAnalyses"],
        (res) => {
            if (!res.events) chrome.storage.local.set({ events: [] });
            if (!res.contentAnalyses)
                chrome.storage.local.set({ contentAnalyses: [] });
            if (!res.userCategories)
                chrome.storage.local.set({ userCategories: {} });
            if (!res.settings) {
                chrome.storage.local.set({
                    settings: {
                        contentScanning: true,
                        emotionalAnalysis: true,
                        productivityTracking: true,
                        biasDetection: true,
                        excludeList: [],
                        scanInterval: 30000, // 30 seconds
                        onboardingCompleted: false,
                    },
                });
            }
        }
    );

    // Set up periodic content scanning alarm
    chrome.alarms.create("contentScan", { periodInMinutes: 0.5 });
});

// Enhanced content analysis and persistence
function persistEvent(event) {
    console.log("[DigitalFootprint][EVENT_PERSIST]", event);

    chrome.storage.local.get({ events: [] }, (res) => {
        const events = res.events || [];
        const twoWeeks = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const filtered = events.filter((e) => e.ts >= twoWeeks);
        filtered.push(event);

        chrome.storage.local.set({ events: filtered }, () => {
            console.log("[DigitalFootprint][EVENTS_COUNT]", filtered.length);
        });
    });
}

// Persist content analysis data
function persistContentAnalysis(analysis) {
    console.log("[DigitalFootprint][CONTENT_ANALYSIS]", analysis);

    chrome.storage.local.get({ contentAnalyses: [] }, (res) => {
        const analyses = res.contentAnalyses || [];
        const twoWeeks = Date.now() - 14 * 24 * 60 * 60 * 1000;
        const filtered = analyses.filter((a) => a.timestamp >= twoWeeks);
        filtered.push(analysis);

        // Limit to last 1000 analyses to prevent excessive storage
        const limited = filtered.slice(-1000);

        chrome.storage.local.set({ contentAnalyses: limited }, () => {
            console.log(
                "[DigitalFootprint][CONTENT_ANALYSES_COUNT]",
                limited.length
            );
        });
    });
}

// Enhanced backend communication with detailed analysis
async function sendSessionToBackend(
    url,
    start,
    end,
    category,
    engagement,
    analysis
) {
    if (DEV_MODE) {
        console.log("[DigitalFootprint][DEV_MODE] Skipping session API call");
        return;
    }

    const duration = Math.round((end - start) / 1000);

    const payload = {
        url,
        startTime: start,
        endTime: end,
        duration,
        category,
        engagement,
        analysis,
        timestamp: end,
    };

    console.log("[DigitalFootprint][SESSION_API] POST", SESSION_API, payload);

    try {
        const response = await fetch(SESSION_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: AUTH_HEADER,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log("[DigitalFootprint][SESSION_API] Success");
    } catch (err) {
        console.warn("[DigitalFootprint][SESSION_API] ERROR:", err.message);
    }
}

async function sendContentAnalysisToBackend(analysis) {
    if (DEV_MODE) {
        console.log(
            "[DigitalFootprint][DEV_MODE] Skipping content analysis API call"
        );
        return;
    }

    console.log("[DigitalFootprint][CONTENT_API] POST", CONTENT_API, {
        url: analysis.url,
        analysisKeys: Object.keys(analysis),
    });

    try {
        const response = await fetch(CONTENT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: AUTH_HEADER,
            },
            body: JSON.stringify(analysis),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log("[DigitalFootprint][CONTENT_API] Success");
    } catch (err) {
        console.warn("[DigitalFootprint][CONTENT_API] ERROR:", err.message);
    }
}

// Enhanced content analysis function
async function analyzePageContent(tabId, url) {
    try {
        const textData = await fetchPageText(tabId);
        if (!textData || textData.length < 50) return null; // Skip very short content

        // Get user settings for analysis
        const settings = await new Promise((resolve) => {
            chrome.storage.local.get({ settings: {} }, (res) => {
                resolve(res.settings || {});
            });
        });

        if (!settings.contentScanning) return null;

        const analysis = {
            url,
            timestamp: Date.now(),
            textLength: textData.length,
            wordCount: textData.split(/\s+/).filter((w) => w.trim().length > 0)
                .length,
        };

        // Perform different types of analysis based on settings
        if (settings.emotionalAnalysis !== false) {
            analysis.sentiment = analyzeSentiment(textData);
        }

        if (settings.biasDetection !== false) {
            analysis.contentQuality = analyzeContentQuality(textData);
        }

        analysis.topics = extractTopics(textData);
        analysis.readabilityScore = calculateReadabilityScore(textData);

        return analysis;
    } catch (err) {
        console.warn(
            "[DigitalFootprint][CONTENT_ANALYSIS] ERROR:",
            err.message
        );
        return null;
    }
}

// Fetch page text from content script
function fetchPageText(tabId) {
    return new Promise((resolve) => {
        chrome.scripting.executeScript(
            {
                target: { tabId },
                files: ["content/contentScript.js"],
            },
            () => {
                chrome.tabs.sendMessage(
                    tabId,
                    { type: "request_full_text" },
                    (resp) => resolve(resp?.text || "")
                );
            }
        );
    });
}

// Enhanced session stop with comprehensive analysis
async function stopActiveTimer() {
    if (!activeTabId || !activeStart || !activeUrl) return;

    const end = Date.now();
    const tabId = activeTabId;
    const url = activeUrl;
    const durationSeconds = Math.round((end - activeStart) / 1000);

    try {
        // Get user categories for categorization
        const { userCategories } = await new Promise((resolve) => {
            chrome.storage.local.get({ userCategories: {} }, resolve);
        });

        const category = categorizeUrl(url, userCategories);

        // Get engagement data from storage
        const engagementData = await new Promise((resolve) => {
            chrome.storage.local.get(
                { currentEngagement: { clicks: 0, keys: 0, scrolls: 0 } },
                resolve
            );
        });

        // Analyze page content
        const contentAnalysis = await analyzePageContent(tabId, url);

        // Send to backend
        await sendSessionToBackend(
            url,
            activeStart,
            end,
            category,
            engagementData.currentEngagement,
            contentAnalysis
        );

        if (contentAnalysis) {
            persistContentAnalysis(contentAnalysis);
            await sendContentAnalysisToBackend(contentAnalysis);
        }

        // Persist enhanced session event
        persistEvent({
            type: "session_end",
            url,
            duration: durationSeconds,
            category,
            engagement: engagementData.currentEngagement,
            hasContentAnalysis: !!contentAnalysis,
            ts: end,
        });

        // Reset engagement data
        chrome.storage.local.set({
            currentEngagement: { clicks: 0, keys: 0, scrolls: 0 },
        });
    } catch (err) {
        console.warn("[DigitalFootprint][STOP_TIMER] ERROR:", err.message);
        // Fallback to basic event persistence
        persistEvent({
            type: "session_end",
            url,
            duration: durationSeconds,
            ts: end,
        });
    }

    activeTabId = null;
    activeStart = null;
    activeUrl = null;
}

// Enhanced session start with categorization
function handleSwitch(tab) {
    if (!tab || !tab.url || paused) return;

    // Ignore chrome internal pages
    if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://")
    ) {
        return;
    }

    chrome.storage.local.get(
        { settings: { excludeList: [] }, userCategories: {} },
        async (res) => {
            const excludeList = res.settings.excludeList || [];
            if (excludeList.some((e) => tab.url.includes(e))) return;

            // Only stop if switching to a different tab or URL
            if (activeTabId !== tab.id || activeUrl !== tab.url) {
                await stopActiveTimer();
            }

            activeTabId = tab.id;
            activeUrl = tab.url;
            activeStart = Date.now();

            // Categorize the new URL
            const category = categorizeUrl(tab.url, res.userCategories || {});

            persistEvent({
                type: "session_start",
                url: tab.url,
                category,
                ts: activeStart,
            });
        }
    );
}

// -------------------------
// EVENT LISTENERS
// -------------------------

// TAB ACTIVATED
chrome.tabs.onActivated.addListener(async (info) => {
    if (paused) return;

    const tab = await chrome.tabs.get(info.tabId);
    handleSwitch(tab);
});

// WINDOW FOCUS HANDLING (DEBOUNCED)
let blurTimeout = null;

chrome.windows.onFocusChanged.addListener((windowId) => {
    if (paused) return;

    if (windowId === chrome.windows.WINDOW_ID_NONE) {
        // Chrome lost focus
        blurTimeout = setTimeout(() => stopActiveTimer(), 250);
    } else {
        // Chrome regained focus
        clearTimeout(blurTimeout);
        chrome.tabs.query({ active: true, windowId }, (tabs) => {
            if (tabs[0]) handleSwitch(tabs[0]);
        });
    }
});

// TAB UPDATED (only when URL changes!)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (paused) return;

    if (tabId === activeTabId && changeInfo.url) {
        handleSwitch(tab);
    }
});

// ALARM HANDLER for periodic content scanning
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "contentScan" && activeTabId && activeUrl && !paused) {
        // Perform content analysis for the current active tab
        analyzePageContent(activeTabId, activeUrl)
            .then((analysis) => {
                if (analysis) {
                    persistContentAnalysis(analysis);
                    sendContentAnalysisToBackend(analysis);
                }
            })
            .catch((err) => {
                console.warn(
                    "[DigitalFootprint][PERIODIC_SCAN] ERROR:",
                    err.message
                );
            });
    }
});

// IDLE STATE DETECTION
chrome.idle.onStateChanged.addListener((state) => {
    if (state === "idle" || state === "locked") {
        stopActiveTimer();
    } else if (state === "active" && !paused) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) handleSwitch(tabs[0]);
        });
    }
});

// -------------------------
// ENHANCED MESSAGE HANDLERS
// -------------------------

chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
    if (!msg?.type) return;

    if (msg.type === "pause") {
        paused = true;
        stopActiveTimer();
        sendResp({ paused: true });
        return true;
    }

    if (msg.type === "resume") {
        paused = false;
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) handleSwitch(tabs[0]);
        });
        sendResp({ paused: false });
        return true;
    }

    if (msg.type === "getStatus") {
        sendResp({ paused });
        return true;
    }

    if (msg.type === "engagement") {
        // Store current engagement data for use when session ends
        chrome.storage.local.get(
            { currentEngagement: { clicks: 0, keys: 0, scrolls: 0 } },
            (res) => {
                const current = res.currentEngagement;
                const updated = {
                    clicks: current.clicks + (msg.data.clicks || 0),
                    keys: current.keys + (msg.data.keys || 0),
                    scrolls: current.scrolls + (msg.data.scrolls || 0),
                };
                chrome.storage.local.set({ currentEngagement: updated });
            }
        );

        persistEvent({
            type: "engagement",
            url: sender.tab?.url || "",
            data: msg.data,
            ts: Date.now(),
        });
        sendResp({ ok: true });
        return true;
    }

    if (msg.type === "page_html") {
        // Trigger content analysis for the received content
        if (msg.text && msg.text.length > 50) {
            const analysis = {
                url: sender.tab?.url || "",
                timestamp: Date.now(),
                textLength: msg.text.length,
                wordCount: msg.text
                    .split(/\s+/)
                    .filter((w) => w.trim().length > 0).length,
                sentiment: analyzeSentiment(msg.text),
                contentQuality: analyzeContentQuality(msg.text),
                topics: extractTopics(msg.text),
                readabilityScore: calculateReadabilityScore(msg.text),
            };

            persistContentAnalysis(analysis);
            sendContentAnalysisToBackend(analysis);
        }
        sendResp({ ok: true });
        return true;
    }

    if (msg.type === "getUserCategories") {
        chrome.storage.local.get({ userCategories: {} }, (res) => {
            sendResp({ userCategories: res.userCategories });
        });
        return true;
    }

    if (msg.type === "updateUserCategories") {
        chrome.storage.local.set({ userCategories: msg.categories }, () => {
            sendResp({ ok: true });
        });
        return true;
    }

    if (msg.type === "getTodayStats") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const startOfDay = today.getTime();

        chrome.storage.local.get({ events: [], contentAnalyses: [] }, (res) => {
            const events = res.events || [];
            const analyses = res.contentAnalyses || [];

            // Filter today's data
            const todayEvents = events.filter((e) => e.ts >= startOfDay);
            const todayAnalyses = analyses.filter(
                (a) => a.timestamp >= startOfDay
            );

            sendResp({
                events: todayEvents,
                analyses: todayAnalyses,
            });
        });
        return true;
    }

    if (msg.type === "getWeeklyStats") {
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

        chrome.storage.local.get({ events: [], contentAnalyses: [] }, (res) => {
            const events = res.events || [];
            const analyses = res.contentAnalyses || [];

            // Filter last week's data
            const weekEvents = events.filter((e) => e.ts >= weekAgo);
            const weekAnalyses = analyses.filter((a) => a.timestamp >= weekAgo);

            sendResp({
                events: weekEvents,
                analyses: weekAnalyses,
            });
        });
        return true;
    }
});
