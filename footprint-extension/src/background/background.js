let activeTabId = null;
let activeStart = null;
let activeUrl = null;
let paused = false;

// Dummy endpoints - these are non-functional for demo purposes
const SESSION_API = "https://dummy.server.com/session";
const HTML_API = "https://dummy.server.com/html";

// Development mode flag - set to true to disable API calls
const DEV_MODE = true;

// On install init
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(["events", "settings"], (res) => {
        if (!res.events) chrome.storage.local.set({ events: [] });
        if (!res.settings) {
            chrome.storage.local.set({
                settings: { contentScanning: false, excludeList: [] },
            });
        }
    });
});

// Persist local events
function persistEvent(event) {
    // Log every event before persisting so we can inspect gathered data
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

// Backend POST
async function sendSessionToBackend(url, start, end) {
    // Skip API calls in development mode
    if (DEV_MODE) {
        console.log("[DigitalFootprint][DEV_MODE] Skipping session API call");
        return;
    }

    // Convert duration to seconds before sending to backend
    const duration = Math.round((end - start) / 1000);

    const payload = {
        url,
        startTime: start,
        endTime: end,
        duration,
    };

    // Log outbound session API call
    console.log("[DigitalFootprint][SESSION_API] POST", SESSION_API, payload);

    try {
        const response = await fetch(SESSION_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

async function sendHtmlToBackend(url, htmlText) {
    // Skip API calls in development mode
    if (DEV_MODE) {
        console.log("[DigitalFootprint][DEV_MODE] Skipping HTML API call");
        return;
    }

    const payload = { url, html: htmlText };

    // Log outbound HTML API call
    console.log("[DigitalFootprint][HTML_API] POST", HTML_API, {
        url: payload.url,
        // Avoid dumping huge HTML, just log length for debugging
        htmlLength: payload.html?.length || 0,
    });

    try {
        const response = await fetch(HTML_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        console.log("[DigitalFootprint][HTML_API] Success");
    } catch (err) {
        console.warn("[DigitalFootprint][HTML_API] ERROR:", err.message);
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

// Stop active session
async function stopActiveTimer() {
    if (!activeTabId || !activeStart || !activeUrl) return;

    const end = Date.now();
    const tabId = activeTabId;
    const url = activeUrl;

    // Duration in seconds for local events as well
    const durationSeconds = Math.round((end - activeStart) / 1000);

    const htmlText = await fetchPageText(tabId);

    sendSessionToBackend(url, activeStart, end);
    sendHtmlToBackend(url, htmlText);

    persistEvent({
        type: "session_end",
        url,
        duration: durationSeconds,
        ts: end,
    });

    activeTabId = null;
    activeStart = null;
    activeUrl = null;
}

// Start new session (safe)
function handleSwitch(tab) {
    if (!tab || !tab.url || paused) return;

    // Ignore chrome internal pages
    if (
        tab.url.startsWith("chrome://") ||
        tab.url.startsWith("chrome-extension://")
    ) {
        return;
    }

    chrome.storage.local.get({ settings: { excludeList: [] } }, (res) => {
        const excludeList = res.settings.excludeList || [];
        if (excludeList.some((e) => tab.url.includes(e))) return;

        // Only stop if switching to a different tab or URL
        if (activeTabId !== tab.id || activeUrl !== tab.url) {
            stopActiveTimer();
        }

        activeTabId = tab.id;
        activeUrl = tab.url;
        activeStart = Date.now();

        persistEvent({
            type: "session_start",
            url: tab.url,
            ts: activeStart,
        });
    });
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

// -------------------------
// MESSAGE HANDLERS
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
        persistEvent({
            type: "engagement",
            url: sender.tab?.url || "",
            data: msg.data,
            ts: Date.now(),
        });
        sendResp({ ok: true });
        return true;
    }

    // Auto-sent page HTML
    if (msg.type === "page_html") {
        sendHtmlToBackend(sender.tab?.url || "", msg.text);
        sendResp({ ok: true });
        return true;
    }
});
