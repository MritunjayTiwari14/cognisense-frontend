// background.js

let activeTabId = null;
let activeStart = null;
let activeUrl = null;
let paused = false;
let isSwitching = false; // NEW: Lock to prevent race conditions

// Dummy endpoints
const SESSION_API = "https://dummy.server.com/session";
const HTML_API = "https://dummy.server.com/html";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(["events", "settings"], (res) => {
    if (!res.events) chrome.storage.local.set({ events: [] });
    if (!res.settings)
      chrome.storage.local.set({
        settings: { contentScanning: false, excludeList: [] }
      });
  });
});

// Persist local events
function persistEvent(event) {
  chrome.storage.local.get({ events: [] }, (res) => {
    const events = res.events || [];
    const twoWeeks = Date.now() - 14 * 24 * 60 * 60 * 1000;

    const filtered = events.filter((e) => e.ts >= twoWeeks);
    filtered.push(event);

    chrome.storage.local.set({ events: filtered });
  });
}

// Backend POST
async function sendSessionToBackend(url, start, end) {
  const duration = end - start;
  // ... (rest of function is unchanged)
  try {
    await fetch(SESSION_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url,
        startTime: start,
        endTime: end,
        duration
      })
    });
  } catch (err) {
    console.warn("SESSION API ERROR", err);
  }
}

async function sendHtmlToBackend(url, htmlText) {
  // ... (rest of function is unchanged)
  try {
    await fetch(HTML_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, html: htmlText })
    });
  } catch (err) {
    console.warn("HTML API ERROR", err);
  }
}

// Guaranteed contentScript injection before request
function fetchPageText(tabId) {
  return new Promise((resolve) => {
    try {
      chrome.scripting.executeScript(
        {
          target: { tabId },
          files: ["content/contentScript.js"]
        },
        () => {
          if (chrome.runtime.lastError) {
            console.warn("Script injection error:", chrome.runtime.lastError.message);
            resolve({ text: "", engagement: null }); // Fail gracefully
            return;
          }
          
          chrome.tabs.sendMessage(
            tabId,
            { type: "request_full_text" },
            (resp) => {
              if (chrome.runtime.lastError) {
                 console.warn("Message send error:", chrome.runtime.lastError.message);
                 resolve({ text: "", engagement: null }); // Fail gracefully
                 return;
              }
              // CHANGED: Resolve with an object
              resolve({
                text: resp?.text || "",
                engagement: resp?.engagement || null
              });
            }
          );
        }
      );
    } catch (e) {
      console.warn("fetchPageText error:", e);
      resolve({ text: "", engagement: null }); // Fail gracefully
    }
  });
}

// Stop active session
async function stopActiveTimer() {
  if (!activeTabId || !activeStart || !activeUrl) {
    return; // No active session to stop
  }

  // CHANGED: Capture state and clear *immediately* to prevent race conditions
  const end = Date.now();
  const tabId = activeTabId;
  const url = activeUrl;
  const start = activeStart;

  activeTabId = null;
  activeStart = null;
  activeUrl = null;

  // Now perform async operations with the captured state
  const { text: htmlText, engagement } = await fetchPageText(tabId);

  sendSessionToBackend(url, start, end);
  if (htmlText) { // Only send if we got text
    sendHtmlToBackend(url, htmlText);
  }

  // NEW: Persist the final engagement data collected
  if (engagement && (engagement.clicks || engagement.keys || engagement.scrolls)) {
    persistEvent({
      type: "engagement",
      url: url,
      data: engagement,
      ts: end // Use the session end time
    });
  }

  persistEvent({
    type: "session_end",
    url,
    duration: end - start,
    ts: end
  });
}

// CHANGED: Refactored to be async and use the isSwitching lock
async function handleSwitch(tab) {
  if (isSwitching) return; // Don't run if a switch is already processing
  isSwitching = true;

  await stopActiveTimer(); // Wait for the previous session to fully stop

  // If tab is null or invalid (e.g., window blurred), just stop and exit
  if (!tab || !tab.id || !tab.url) {
    isSwitching = false;
    return;
  }
  
  const newUrl = tab.url;
  if (newUrl.startsWith("chrome://") || newUrl.startsWith("chrome-extension://")) {
    isSwitching = false;
    return;
  }

  // CHANGED: Switched to async/await for storage.get
  try {
    const res = await chrome.storage.local.get({ settings: { excludeList: [] } });
    const excludeList = res.settings.excludeList || [];
    if (excludeList.some((e) => newUrl.includes(e))) {
      isSwitching = false;
      return;
    }

    // All checks passed, start new session
    activeTabId = tab.id;
    activeUrl = newUrl;
    activeStart = Date.now();

    persistEvent({
      type: "session_start",
      url: newUrl,
      ts: activeStart
    });
  } catch (e) {
    console.warn("Error in handleSwitch:", e);
  }

  isSwitching = false; // Release the lock
}

// Listeners
// CHANGED: All listeners are now async to correctly await handleSwitch
chrome.tabs.onActivated.addListener(async (info) => {
  if (paused) return;
  try {
    const tab = await chrome.tabs.get(info.tabId);
    await handleSwitch(tab);
  } catch (e) {
    console.warn("onActivated error:", e);
    isSwitching = false; // Ensure lock is released on error
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (paused) return;
  
  try {
    if (windowId === chrome.windows.WINDOW_ID_NONE) {
      await handleSwitch(null); // Window blurred, stop timer
    } else {
      const tabs = await chrome.tabs.query({ active: true, windowId });
      if (tabs[0]) {
        await handleSwitch(tabs[0]);
      } else {
        await handleSwitch(null); // No active tab found, stop timer
      }
    }
  } catch (e) {
     console.warn("onFocusChanged error:", e);
     isSwitching = false; // Ensure lock is released on error
  }
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (paused) return;

  // Only handle updates for the *currently active* tab
  if (tabId === activeTabId && changeInfo.status === "complete") {
    await handleSwitch(tab);
  }
});

// NEW: Interval to periodically flush engagement from long-lived active tabs
setInterval(async () => {
  if (paused || !activeTabId || !activeUrl) return;

  try {
    // We use a new message type to avoid resetting page text
    chrome.tabs.sendMessage(
      activeTabId,
      { type: "request_interim_engagement" },
      (resp) => {
        if (chrome.runtime.lastError || !resp?.engagement) {
          return;
        }
        
        const data = resp.engagement;
        if (data.clicks || data.keys || data.scrolls) {
          persistEvent({
            type: "engagement",
            url: activeUrl, // Use the stored activeUrl
            data: data,
            ts: Date.now()
          });
        }
      }
    );
  } catch (e) {
    console.warn("Interim engagement flush error:", e);
  }
}, 30000); // Flush every 30 seconds

// Message handlers
// CHANGED: Using async/await for pause/resume
chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
  if (!msg?.type) return true; // Keep channel open for async response if needed

  if (msg.type === "pause") {
    (async () => {
      paused = true;
      await stopActiveTimer();
      sendResp({ paused: true });
    })();
    return true; // Indicates async response
  }

  if (msg.type === "resume") {
    (async () => {
      paused = false;
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]) {
        await handleSwitch(tabs[0]);
      }
      sendResp({ paused: false });
    })();
    return true; // Indicates async response
  }

  if (msg.type === "getStatus") {
    sendResp({ paused });
    return true;
  }

  if (msg.type === "engagement") {
    // This is for interim data
    if (sender.tab?.url === activeUrl) {
      persistEvent({
        type: "engagement",
        url: sender.tab.url,
        data: msg.data,
        ts: Date.now()
      });
    }
    sendResp({ ok: true });
    return true;
  }

  if (msg.type === "page_html") {
    // Only send if the page is from the active tab
    if (sender.tab?.url === activeUrl) {
       sendHtmlToBackend(sender.tab.url, msg.text);
    }
    sendResp({ ok: true });
    return true;
  }
  
  return true; // Default
});