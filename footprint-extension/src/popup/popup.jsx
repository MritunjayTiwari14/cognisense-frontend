/* eslint-env browser */
/* global chrome */
import React, { useEffect, useState } from "react";
import "./popup-simple.css";
import { formatDuration } from "../utils/analytics.js";
import {
    getCategoryDisplayName,
    getCategoryIcon,
} from "../utils/categories.js";

function secToMin(seconds) {
    return Math.round(seconds / 60);
}

const isChrome = typeof chrome !== "undefined" && !!chrome.runtime;

// Base URL of the main web app used for authentication
// Configure via VITE_WEBAPP_URL, otherwise default to localhost dev URL
const WEBAPP_URL =
    import.meta.env?.VITE_WEBAPP_URL || "http://localhost:5173";

const Popup = () => {
    const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
    const [paused, setPaused] = useState(false);
    const [topSites, setTopSites] = useState([]);
    const [currentSite, setCurrentSite] = useState({
        category: "other",
        domain: "",
    });
    const [loading, setLoading] = useState(true);
    const [displayTime, setDisplayTime] = useState(0); // For real-time display
    const [sessionStartTime, setSessionStartTime] = useState(Date.now()); // When current session started
    const [pauseTime, setPauseTime] = useState(null); // When pause was clicked
    const [hasToken, setHasToken] = useState(null); // null = checking, true/false

    // On mount, just check for an existing Supabase token in chrome.storage.local
    useEffect(() => {
        if (!isChrome || !chrome.storage || !chrome.storage.local) {
            setHasToken(false);
            return;
        }

        try {
            chrome.storage.local.get(
                ["authToken", "access_token", "supabaseToken", "supabase_session"],
                (result) => {
                    const token =
                        result.authToken ||
                        result.access_token ||
                        result.supabaseToken ||
                        (result.supabase_session &&
                            result.supabase_session.access_token);
                    setHasToken(Boolean(token));
                }
            );
        } catch (e) {
            console.warn(
                "Error checking Supabase token in chrome.storage:",
                e
            );
            setHasToken(false);
        }
    }, []);

    // Real-time timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            if (!paused && !loading) {
                // When active, show base time + elapsed time since session start
                const now = Date.now();
                const sessionElapsed = Math.floor(
                    (now - sessionStartTime) / 1000
                );
                const newDisplayTime = totalTimeSeconds + sessionElapsed;
                setDisplayTime(newDisplayTime);
                console.log(
                    `⏱️ [POPUP] Active timer: ${totalTimeSeconds}s + ${sessionElapsed}s = ${newDisplayTime}s`
                );
            } else if (paused) {
                // When paused, show the time at the moment of pause
                if (pauseTime) {
                    const pauseElapsed = Math.floor(
                        (pauseTime - sessionStartTime) / 1000
                    );
                    const pausedDisplayTime = totalTimeSeconds + pauseElapsed;
                    setDisplayTime(pausedDisplayTime);
                    console.log(
                        `⏸️ [POPUP] Paused timer: showing ${pausedDisplayTime}s (paused at +${pauseElapsed}s)`
                    );
                } else {
                    setDisplayTime(totalTimeSeconds);
                }
            } else {
                // Loading state
                setDisplayTime(totalTimeSeconds);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [paused, totalTimeSeconds, sessionStartTime, pauseTime, loading]);

    // Periodic stats refresh
    useEffect(() => {
        const refreshStats = () => {
            if (isChrome) {
                console.log("🔄 [POPUP] Refreshing stats...");
                chrome.runtime.sendMessage(
                    { type: "getTodayStats" },
                    (resp) => {
                        if (chrome.runtime.lastError) {
                            console.warn(
                                "🚨 [POPUP] Error refreshing stats:",
                                chrome.runtime.lastError.message
                            );
                            return;
                        }
                        if (resp && !resp.error) {
                            console.log("✅ [POPUP] Stats refreshed:", resp);
                            setTotalTimeSeconds(resp.totalTime || 0);
                            setTopSites(resp.topSites || []);
                            const wasPaused = paused;
                            setPaused(resp.isPaused || false);

                            // If pause state changed, update timing
                            if (wasPaused !== (resp.isPaused || false)) {
                                setSessionStartTime(Date.now());
                                if (resp.isPaused) {
                                    setPauseTime(Date.now());
                                } else {
                                    setPauseTime(null);
                                }
                            }
                        }
                    }
                );
            }
        };

        const interval = setInterval(refreshStats, 5000); // Refresh every 5 seconds
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const loadData = async () => {
            console.log("🚀 [POPUP] Starting data load...");
            setLoading(true);

            // Get paused status
            if (isChrome) {
                try {
                    console.log("📡 [POPUP] Requesting status...");
                    chrome.runtime.sendMessage(
                        { type: "getStatus" },
                        (resp) => {
                            if (chrome.runtime.lastError) {
                                console.warn(
                                    "🚨 [POPUP] Error getting status:",
                                    chrome.runtime.lastError.message ||
                                        chrome.runtime.lastError
                                );
                                return;
                            }
                            console.log("✅ [POPUP] Status response:", resp);
                            if (resp) {
                                if (resp.error) {
                                    console.warn(
                                        "⚠️ [POPUP] getStatus returned error:",
                                        resp.error
                                    );
                                } else if (typeof resp.paused === "boolean") {
                                    console.log(
                                        `🔄 [POPUP] Pause state: ${
                                            resp.paused ? "PAUSED" : "ACTIVE"
                                        }`
                                    );
                                    setPaused(resp.paused);
                                } else {
                                    console.warn(
                                        "⚠️ [POPUP] getStatus response missing paused field:",
                                        resp
                                    );
                                }
                            } else {
                                console.warn(
                                    "⚠️ [POPUP] getStatus returned null/undefined response"
                                );
                            }
                        }
                    );
                } catch (e) {
                    console.warn("chrome.runtime not available:", e);
                }
            }

            // Get current active tab info
            if (isChrome) {
                try {
                    chrome.tabs.query(
                        { active: true, currentWindow: true },
                        (tabs) => {
                            if (tabs[0] && tabs[0].url) {
                                try {
                                    const domain = new URL(tabs[0].url)
                                        .hostname;
                                    setCurrentSite({
                                        domain,
                                        category: "other", // Will be updated with actual category
                                    });
                                } catch {
                                    setCurrentSite({
                                        domain: "Unknown",
                                        category: "other",
                                    });
                                }
                            }
                        }
                    );
                } catch (e) {
                    console.warn("Failed to get current tab:", e);
                }
            }

            // Get today's stats with timeout
            if (isChrome) {
                try {
                    // Add a timeout to prevent hanging
                    const timeoutPromise = new Promise((_, reject) => {
                        setTimeout(
                            () => reject(new Error("Stats request timeout")),
                            5000
                        );
                    });

                    const messagePromise = new Promise((resolve) => {
                        chrome.runtime.sendMessage(
                            { type: "getTodayStats" },
                            (resp) => {
                                if (chrome.runtime.lastError) {
                                    console.warn(
                                        "Error getting stats:",
                                        chrome.runtime.lastError.message ||
                                            chrome.runtime.lastError
                                    );
                                    resolve(null);
                                    return;
                                }
                                resolve(resp);
                            }
                        );
                    });

                    const resp = await Promise.race([
                        messagePromise,
                        timeoutPromise,
                    ]);

                    if (resp) {
                        if (resp.error) {
                            console.warn(
                                "Stats request returned error:",
                                resp.error
                            );
                        } else if (typeof resp === "object") {
                            setTotalTimeSeconds(
                                typeof resp.totalTime === "number"
                                    ? resp.totalTime
                                    : 0
                            );
                            setTopSites(
                                Array.isArray(resp.topSites)
                                    ? resp.topSites
                                    : []
                            );
                            setPaused(
                                typeof resp.isPaused === "boolean"
                                    ? resp.isPaused
                                    : false
                            );
                        }
                    } else {
                        console.warn(
                            "Stats request returned null/undefined response"
                        );
                    }
                    setLoading(false);
                } catch (e) {
                    const errorMessage =
                        e.message ||
                        (typeof e === "object" ? JSON.stringify(e) : String(e));
                    console.warn("Error getting stats:", errorMessage);
                    setLoading(false);
                }
            } else {
                // Non-Chrome environment - show message
                console.log("📱 [POPUP] Non-Chrome environment detected");
                setTotalTimeSeconds(0);
                setTopSites([]);
                setLoading(false);
            }
        };

        loadData();

        // Debug logging
        console.log("🔧 [POPUP] Initial state:", {
            totalTimeSeconds,
            paused,
            topSites: topSites.length,
            loading,
        });
    }, []);

    // Handle pause/resume functionality
    const handlePauseResume = () => {
        if (!isChrome) {
            console.log("⚠️ [POPUP] Chrome runtime not available");
            return;
        }

        const action = paused ? "resumeTracking" : "pauseTracking";
        const newState = !paused;

        console.log(
            `🎯 [POPUP] ${action} clicked - changing from ${
                paused ? "PAUSED" : "ACTIVE"
            } to ${newState ? "PAUSED" : "ACTIVE"}`
        );

        // Handle timing state
        if (newState) {
            // Pausing - record the pause time
            setPauseTime(Date.now());
            console.log("⏸️ [POPUP] Recording pause time");
        } else {
            // Resuming - update base time and reset session start
            const now = Date.now();
            if (pauseTime) {
                const pausedSessionTime = Math.floor(
                    (pauseTime - sessionStartTime) / 1000
                );
                const newBaseTime = totalTimeSeconds + pausedSessionTime;
                setTotalTimeSeconds(newBaseTime);
                console.log(
                    `▶️ [POPUP] Resuming: adding ${pausedSessionTime}s to base time, new base: ${newBaseTime}s`
                );
            }
            setSessionStartTime(now);
            setPauseTime(null);
        }

        // Update pause state immediately for UI responsiveness
        setPaused(newState);

        chrome.runtime.sendMessage({ type: action }, (response) => {
            if (chrome.runtime.lastError) {
                console.error(
                    `🚨 [POPUP] Error ${action}:`,
                    chrome.runtime.lastError.message || chrome.runtime.lastError
                );
                // Revert state on error
                setPaused(!newState);
                if (!newState) {
                    // If resume failed, restore pause time
                    setPauseTime(Date.now());
                }
                return;
            }

            console.log(`✅ [POPUP] ${action} response:`, response);

            if (response && response.success) {
                console.log(
                    `✅ [POPUP] ${action} successful - background state: ${
                        response.paused ? "PAUSED" : "ACTIVE"
                    }`
                );
                // Background confirms the state change
                setPaused(response.paused);
            } else if (response && response.error) {
                console.error(
                    `🚨 [POPUP] ${action} returned error:`,
                    response.error
                );
                setPaused(!newState); // Revert on error
            } else {
                console.warn(
                    `⚠️ [POPUP] ${action} unexpected response:`,
                    response
                );
            }
        });
    };
    const openOptions = () => {
        if (!isChrome) {
            window.open("options/index.html", "_blank");
            return;
        }

        try {
            if (chrome.runtime.openOptionsPage) {
                chrome.runtime.openOptionsPage(() => {
                    if (chrome.runtime.lastError) {
                        window.open(
                            chrome.runtime.getURL("options/index.html"),
                            "_blank"
                        );
                    }
                });
            } else {
                window.open(
                    chrome.runtime.getURL("options/index.html"),
                    "_blank"
                );
            }
        } catch (err) {
            console.warn("Failed to open options:", err);
        }
    };

    const openDashboard = () => {
        // Open main web app dashboard
        const targetUrl = WEBAPP_URL;
        if (!isChrome || !chrome.tabs) {
            window.open(targetUrl, "_blank");
            return;
        }

        try {
            chrome.tabs.create({ url: targetUrl });
        } catch (err) {
            console.warn("Failed to open dashboard:", err);
            window.open(targetUrl, "_blank");
        }
    };

    const openWebAppAuth = () => {
        const targetUrl = `${WEBAPP_URL}/auth`;
        if (!isChrome || !chrome.tabs) {
            window.open(targetUrl, "_blank");
            return;
        }

        try {
            chrome.tabs.create({ url: targetUrl });
        } catch (err) {
            console.warn("Failed to open web app auth page:", err);
            window.open(targetUrl, "_blank");
        }
    };

    // While we're checking for a token, show a small loading state
    if (hasToken === null) {
        return (
            <div className="popup">
                <header className="pf-header">
                    <div className="logo">🧭</div>
                    <h1>Digital Footprint</h1>
                </header>
                <div className="loading">
                    <div>Checking login status...</div>
                </div>
            </div>
        );
    }

    // If no Supabase token in chrome.storage, instruct user to sign in on web app
    if (hasToken === false) {
        return (
            <div className="popup">
                <header className="pf-header">
                    <div className="logo">⏱️</div>
                    <h1>Time Tracker</h1>
                </header>
                <div className="auth-container">
                    <div className="auth-card">
                        <h2 className="auth-title">Sign in to start tracking</h2>
                        <p className="auth-subtitle">
                            Use your web dashboard account to keep your browsing
                            time in sync. Sign in on the website, then reopen
                            this popup.
                        </p>
                        <button
                            className="primary auth-primary"
                            onClick={openWebAppAuth}
                        >
                            Open web app to sign in
                        </button>
                        <p className="auth-helper">
                            If you just signed out on the website, you will
                            need to sign in again to continue tracking.
                        </p>
                    </div>
                </div>
                <footer className="pf-footer">
                    <small>Simple time tracking • Privacy-focused</small>
                </footer>
            </div>
        );
    }

    // We have a token but stats are still loading
    if (loading) {
        return (
            <div className="popup">
                <header className="pf-header">
                    <div className="logo">🦶</div>
                    <h1>Digital Footprint</h1>
                </header>
                <div className="loading">
                    <div>Loading your insights...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="popup">
            <header className="pf-header">
                <div className="logo">⏱️</div>
                <h1>Time Tracker</h1>
                <div className="status-indicator">
                    {paused ? "⏸️ Paused" : "🟢 Active"}
                </div>
            </header>

            <div className="current-site">
                <div className="site-info">
                    <span className="site-icon">
                        {getCategoryIcon(currentSite.category)}
                    </span>
                    <div>
                        <div className="site-domain">{currentSite.domain}</div>
                        <div className="site-category">
                            {getCategoryDisplayName(currentSite.category)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="time-display">
                <div className="main-time">
                    <div className="time-value">
                        {formatDuration(displayTime)}
                        {!paused && !loading && (
                            <span className="live-indicator">●</span>
                        )}
                    </div>
                    <div className="time-label">
                        Today's Total {paused ? "(Paused)" : "(Live)"}
                    </div>
                </div>
            </div>

            {topSites.length > 0 && (
                <div className="top-sites-section">
                    <h3>🏆 Top Sites Today</h3>
                    <div className="sites-list">
                        {topSites.map((site, idx) => (
                            <div key={idx} className="site-item">
                                <span className="site-icon">
                                    {getCategoryIcon(site.category)}
                                </span>
                                <div className="site-details">
                                    <div className="site-name">
                                        {site.domain}
                                    </div>
                                    <div className="site-time">
                                        {formatDuration(site.totalTime)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="controls">
                <button
                    className="primary"
                    onClick={handlePauseResume}
                    disabled={loading}
                >
                    {loading
                        ? "⏳ Loading..."
                        : paused
                        ? "▶️ Resume Tracking"
                        : "⏸️ Pause Tracking"}
                </button>

                <div className="secondary-row">
                    <button className="link" onClick={openOptions}>
                        ⚙️ Settings
                    </button>
                    <button className="link" onClick={openDashboard}>
                        📊 Dashboard
                    </button>
                </div>
            </div>

            <footer className="pf-footer">
                <small>Simple time tracking • Privacy-focused</small>
            </footer>
        </div>
    );
};

export default Popup;
