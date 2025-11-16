/* eslint-env browser */
/* global chrome */
import React, { useEffect, useState } from "react";
import "./popup-simple.css";
import { formatDuration } from "../utils/analytics.js";
import { getCategoryDisplayName, getCategoryIcon } from "../utils/categories.js";

function secToMin(seconds) {
    return Math.round(seconds / 60);
}

const isChrome = typeof chrome !== "undefined" && !!chrome.runtime;

const Popup = () => {
    const [totalTimeSeconds, setTotalTimeSeconds] = useState(0);
    const [paused, setPaused] = useState(false);
    const [topSites, setTopSites] = useState([]);
    const [currentSite, setCurrentSite] = useState({
        category: "other",
        domain: "",
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            // Get paused status
            if (isChrome) {
                try {
                    chrome.runtime.sendMessage(
                        { type: "getStatus" },
                        (resp) => {
                            if (resp && typeof resp.paused === "boolean")
                                setPaused(resp.paused);
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
                                    const domain = new URL(tabs[0].url).hostname;
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

            // Get today's stats
            if (isChrome) {
                try {
                    chrome.runtime.sendMessage(
                        { type: "getTodayStats" },
                        (resp) => {
                            if (resp) {
                                setTotalTimeSeconds(resp.totalTime || 0);
                                setTopSites(resp.topSites || []);
                                setPaused(resp.isPaused || false);
                            }
                            setLoading(false);
                        }
                    );
                } catch (e) {
                    console.warn("chrome.storage not available:", e);
                    setLoading(false);
                }
            } else {
                // Dev fallback
                setTotalTimeSeconds(7200); // 2 hours
                setTopSites([
                    {
                        domain: "github.com",
                        totalTime: 3600000, // 1 hour in milliseconds
                        category: "productivity",
                    },
                    {
                        domain: "youtube.com", 
                        totalTime: 2400000, // 40 minutes in milliseconds
                        category: "entertainment",
                    },
                ]);
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Handle pause/resume functionality
    const handlePauseResume = async () => {
        if (!isChrome) {
            setPaused(p => !p);
            return;
        }
        
        try {
            const messageType = paused ? "resumeTracking" : "pauseTracking";
            chrome.runtime.sendMessage({ type: messageType }, (response) => {
                if (response && response.success) {
                    setPaused(response.paused);
                }
            });
        } catch (e) {
            console.warn("Failed to toggle tracking:", e);
        }
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
        // For now, just open the options page as dashboard
        openOptions();
    };

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
                    <div className="time-value">{formatDuration(totalTimeSeconds * 1000)}</div>
                    <div className="time-label">Today's Total</div>
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
                <button className="primary" onClick={handlePauseResume}>
                    {paused ? "▶️ Resume Tracking" : "⏸️ Pause Tracking"}
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
