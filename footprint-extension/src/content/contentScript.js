// Enhanced content script for comprehensive user interaction tracking
(function () {
    "use strict";

    let engagement = {
        clicks: 0,
        keys: 0,
        scrolls: 0,
        focusTime: 0,
        mouseMovements: 0,
        textSelections: 0,
        formInteractions: 0,
    };

    let lastActivity = Date.now();
    let focusStartTime = Date.now();
    let isPageVisible = !document.hidden;
    let commentsSentiment = [];
    let userInteractions = [];

    // Enhanced sensitive input detection
    function isSensitiveInput(el) {
        if (!el) return false;
        const tag = (el.tagName || "").toLowerCase();
        const type = (el.type || "").toLowerCase();
        const ac = (el.autocomplete || "").toLowerCase();
        const name = (el.name || "").toLowerCase();
        const id = (el.id || "").toLowerCase();

        // Password and financial inputs
        if (
            tag === "input" &&
            ["password", "email", "tel", "number"].includes(type)
        )
            return true;
        if (ac.includes("cc-") || ac.includes("card")) return true;

        // Common sensitive field patterns
        const sensitivePatterns = [
            "password",
            "pin",
            "ssn",
            "social",
            "credit",
            "card",
            "cvv",
            "cvc",
            "account",
            "routing",
            "bank",
            "payment",
            "billing",
        ];

        return sensitivePatterns.some(
            (pattern) =>
                name.includes(pattern) ||
                id.includes(pattern) ||
                (el.placeholder &&
                    el.placeholder.toLowerCase().includes(pattern))
        );
    }

    // Detect comment and posting areas
    function isCommentArea(el) {
        if (!el) return false;
        const tag = (el.tagName || "").toLowerCase();
        const placeholder = (el.placeholder || "").toLowerCase();
        const ariaLabel = (el.getAttribute("aria-label") || "").toLowerCase();
        const className = (el.className || "").toLowerCase();

        if (tag !== "textarea" && tag !== "input") return false;

        const commentPatterns = [
            "comment",
            "reply",
            "post",
            "message",
            "tweet",
            "status",
            "share",
            "write",
            "compose",
            "chat",
            "discuss",
        ];

        return commentPatterns.some(
            (pattern) =>
                placeholder.includes(pattern) ||
                ariaLabel.includes(pattern) ||
                className.includes(pattern)
        );
    }

    // Analyze sentiment of user's text input
    function analyzeSentiment(text) {
        if (!text || text.length < 10) return "neutral";

        const positiveWords = [
            "good",
            "great",
            "awesome",
            "love",
            "amazing",
            "excellent",
            "wonderful",
            "fantastic",
            "perfect",
        ];
        const negativeWords = [
            "bad",
            "terrible",
            "hate",
            "awful",
            "horrible",
            "disgusting",
            "worst",
            "stupid",
            "annoying",
        ];

        const words = text.toLowerCase().split(/\s+/);
        let positiveCount = 0;
        let negativeCount = 0;

        words.forEach((word) => {
            if (positiveWords.includes(word)) positiveCount++;
            if (negativeWords.includes(word)) negativeCount++;
        });

        if (positiveCount > negativeCount) return "positive";
        if (negativeCount > positiveCount) return "negative";
        return "neutral";
    }

    function safeSendMessage(msg, cb) {
        try {
            chrome.runtime.sendMessage(msg, (resp) => {
                if (chrome.runtime.lastError) {
                    cb?.({ ok: false });
                    return;
                }
                cb?.(resp);
            });
        } catch (err) {
            cb?.({ ok: false });
        }
    }

    // Enhanced engagement listeners with detailed tracking
    document.addEventListener(
        "click",
        (ev) => {
            if (!isSensitiveInput(ev.target)) {
                engagement.clicks++;
                lastActivity = Date.now();

                // Track specific interaction types
                const target = ev.target;
                const tagName = target.tagName.toLowerCase();
                const interactionType = getInteractionType(target);

                userInteractions.push({
                    type: "click",
                    element: tagName,
                    interactionType,
                    timestamp: Date.now(),
                });
            }
        },
        { passive: true }
    );

    function getInteractionType(element) {
        const tag = element.tagName.toLowerCase();
        const role = element.getAttribute("role");
        const className = element.className.toLowerCase();

        if (tag === "button" || role === "button") return "button";
        if (tag === "a") return "link";
        if (["input", "textarea", "select"].includes(tag)) return "form";
        if (className.includes("like") || className.includes("heart"))
            return "like";
        if (className.includes("share")) return "share";
        if (className.includes("comment")) return "comment";
        if (className.includes("follow")) return "follow";

        return "general";
    }

    // Enhanced keyboard interaction tracking
    document.addEventListener(
        "keydown",
        (ev) => {
            const active = document.activeElement;

            if (!isSensitiveInput(active)) {
                if (ev.key?.length === 1) {
                    engagement.keys++;
                    lastActivity = Date.now();
                }

                // Track form interactions
                if (
                    ["input", "textarea"].includes(
                        active.tagName?.toLowerCase()
                    )
                ) {
                    engagement.formInteractions++;

                    // Analyze comments and posts for sentiment
                    if (
                        isCommentArea(active) &&
                        ev.key === "Enter" &&
                        active.value.length > 10
                    ) {
                        const sentiment = analyzeSentiment(active.value);
                        commentsSentiment.push({
                            sentiment,
                            length: active.value.length,
                            timestamp: Date.now(),
                        });
                    }
                }
            }
        },
        { passive: true }
    );

    // Mouse movement tracking (throttled)
    let lastMouseMove = 0;
    document.addEventListener(
        "mousemove",
        () => {
            const now = Date.now();
            if (now - lastMouseMove > 1000) {
                // Track once per second
                engagement.mouseMovements++;
                lastActivity = now;
                lastMouseMove = now;
            }
        },
        { passive: true }
    );

    // Text selection tracking
    document.addEventListener(
        "selectstart",
        () => {
            engagement.textSelections++;
            lastActivity = Date.now();
        },
        { passive: true }
    );

    // Enhanced scroll tracking
    let lastScroll = 0;
    window.addEventListener(
        "scroll",
        () => {
            const now = Date.now();
            if (now - lastScroll > 300) {
                engagement.scrolls++;
                lastActivity = now;
                lastScroll = now;
            }
        },
        { passive: true }
    );

    // Page visibility tracking for accurate focus time
    document.addEventListener("visibilitychange", () => {
        const now = Date.now();
        if (document.hidden) {
            if (isPageVisible) {
                engagement.focusTime += now - focusStartTime;
                isPageVisible = false;
            }
        } else {
            if (!isPageVisible) {
                focusStartTime = now;
                isPageVisible = true;
            }
        }
    });

    // Window focus/blur tracking
    window.addEventListener("focus", () => {
        if (!isPageVisible) {
            focusStartTime = Date.now();
            isPageVisible = true;
        }
    });

    window.addEventListener("blur", () => {
        const now = Date.now();
        if (isPageVisible) {
            engagement.focusTime += now - focusStartTime;
            isPageVisible = false;
        }
    });

    // Enhanced engagement reporting with detailed metrics
    setInterval(() => {
        // Update focus time if page is currently visible
        if (isPageVisible) {
            engagement.focusTime += Date.now() - focusStartTime;
            focusStartTime = Date.now();
        }

        // Only send if there's meaningful activity
        if (
            engagement.clicks ||
            engagement.keys ||
            engagement.scrolls ||
            engagement.mouseMovements ||
            engagement.textSelections ||
            engagement.formInteractions
        ) {
            const enhancedEngagement = {
                ...engagement,
                userInteractions: userInteractions.slice(-10), // Last 10 interactions
                commentsSentiment: commentsSentiment.slice(-5), // Last 5 comments
                lastActivity: lastActivity,
                pageVisible: isPageVisible,
            };

            safeSendMessage(
                {
                    type: "engagement",
                    data: enhancedEngagement,
                },
                () => {
                    // Reset counters but keep focus time cumulative
                    const currentFocusTime = engagement.focusTime;
                    engagement = {
                        clicks: 0,
                        keys: 0,
                        scrolls: 0,
                        mouseMovements: 0,
                        textSelections: 0,
                        formInteractions: 0,
                        focusTime: currentFocusTime,
                    };
                    userInteractions = [];
                    commentsSentiment = [];
                }
            );
        }
    }, 15000); // Report every 15 seconds instead of 10

    // Bridge: sync Supabase session from web app localStorage to extension
    function syncSupabaseSessionToExtension() {
        try {
            const host = window.location.host || "";
            // Only attempt on our web app domain (localhost dev or production domain)
            const isWebApp =
                host.startsWith("localhost:5173") ||
                host.includes("cognisense");

            if (!isWebApp) return;

            // Supabase stores auth under sb-<project-ref>-auth-token
            const key = "sb-txaekiuorwnpyntgyncq-auth-token";
            const raw = window.localStorage.getItem(key);

            if (!raw) {
                safeSendMessage({ type: "SUPABASE_SESSION_CLEAR" });
                return;
            }

            let parsed;
            try {
                parsed = JSON.parse(raw);
            } catch (e) {
                console.warn("[CONTENT] Failed to parse Supabase auth token:", e);
                safeSendMessage({ type: "SUPABASE_SESSION_CLEAR" });
                return;
            }

            const access_token = parsed?.access_token;
            const refresh_token = parsed?.refresh_token;

            if (!access_token) {
                safeSendMessage({ type: "SUPABASE_SESSION_CLEAR" });
                return;
            }

            safeSendMessage({
                type: "SUPABASE_SESSION_SYNC",
                data: { access_token, refresh_token },
            });
        } catch (e) {
            console.warn("[CONTENT] Error syncing Supabase session:", e);
        }
    }

    // Run the sync once shortly after load, then periodically
    setTimeout(syncSupabaseSessionToExtension, 2000);
    setInterval(syncSupabaseSessionToExtension, 15000);

    // Enhanced text extraction with metadata
    function extractPageText() {
        try {
            const bodyText = document.body?.innerText?.slice(0, 50000) || "";

            // Extract additional metadata
            const metadata = {
                title: document.title,
                description:
                    document.querySelector('meta[name="description"]')
                        ?.content || "",
                keywords:
                    document.querySelector('meta[name="keywords"]')?.content ||
                    "",
                author:
                    document.querySelector('meta[name="author"]')?.content ||
                    "",
                publishDate:
                    document.querySelector(
                        'meta[property="article:published_time"]'
                    )?.content ||
                    document.querySelector('meta[name="date"]')?.content ||
                    "",
                wordCount: bodyText
                    .split(/\s+/)
                    .filter((w) => w.trim().length > 0).length,
                hasVideo: document.querySelectorAll("video").length > 0,
                hasImages: document.querySelectorAll("img").length,
                hasComments:
                    document.querySelectorAll(
                        '[class*="comment"], [id*="comment"]'
                    ).length > 0,
                socialButtons: document.querySelectorAll(
                    '[class*="share"], [class*="like"], [class*="follow"]'
                ).length,
            };

            return { text: bodyText, metadata };
        } catch {
            return { text: "", metadata: {} };
        }
    }

    // Auto-send enhanced page data when page loads
    setTimeout(() => {
        const pageData = extractPageText();
        safeSendMessage({
            type: "page_html",
            text: pageData.text,
            metadata: pageData.metadata,
            url: window.location.href,
            timestamp: Date.now(),
        });
    }, 2000); // Delay to ensure page is fully loaded

    // Enhanced message listener for background script requests
    chrome.runtime.onMessage.addListener((msg, sender, sendResp) => {
        if (!msg?.type) return;

        if (msg.type === "request_full_text") {
            const pageData = extractPageText();
            sendResp({
                text: pageData.text,
                metadata: pageData.metadata,
                engagement: engagement,
                userInteractions: userInteractions.slice(-20),
                commentsSentiment: commentsSentiment.slice(-10),
            });
            return true;
        }

        if (msg.type === "get_page_metadata") {
            const pageData = extractPageText();
            sendResp({ metadata: pageData.metadata });
            return true;
        }

        if (msg.type === "analyze_visible_content") {
            // Analyze only visible content for better performance
            const visibleText = getVisibleText();
            sendResp({
                text: visibleText,
                timestamp: Date.now(),
            });
            return true;
        }
    });

    // Get only visible text content (within viewport)
    function getVisibleText() {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function (node) {
                    const parent = node.parentElement;
                    if (!parent) return NodeFilter.FILTER_REJECT;

                    const style = window.getComputedStyle(parent);
                    if (
                        style.display === "none" ||
                        style.visibility === "hidden" ||
                        style.opacity === "0"
                    ) {
                        return NodeFilter.FILTER_REJECT;
                    }

                    const rect = parent.getBoundingClientRect();
                    if (rect.top < window.innerHeight && rect.bottom > 0) {
                        return NodeFilter.FILTER_ACCEPT;
                    }

                    return NodeFilter.FILTER_REJECT;
                },
            }
        );

        let visibleText = "";
        let node;
        while ((node = walker.nextNode())) {
            visibleText += node.textContent + " ";
            if (visibleText.length > 10000) break; // Limit to prevent performance issues
        }

        return visibleText.trim();
    }

    // Clean up on page unload
    window.addEventListener("beforeunload", () => {
        if (isPageVisible) {
            engagement.focusTime += Date.now() - focusStartTime;
        }

        // Send final engagement data
        safeSendMessage({
            type: "engagement",
            data: { ...engagement, final: true },
        });
    });
})();
