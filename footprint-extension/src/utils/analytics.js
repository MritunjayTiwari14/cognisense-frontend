// Time tracking and analytics utilities
export function formatDuration(seconds) {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round((seconds / 3600) * 10) / 10}h`;
}

export function getTimeOfDay(timestamp) {
    const hour = new Date(timestamp).getHours();
    if (hour < 6) return "night";
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
}

export function isWorkingHours(timestamp) {
    const date = new Date(timestamp);
    const hour = date.getHours();
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday

    // Monday to Friday, 9 AM to 5 PM
    return day >= 1 && day <= 5 && hour >= 9 && hour < 17;
}

export function calculateProductivityScore(sessions, userCategories = {}) {
    if (!sessions || sessions.length === 0) return 0;

    let productiveTime = 0;
    let totalTime = 0;

    sessions.forEach((session) => {
        const category = session.category || "other";
        const duration = session.duration || 0;
        totalTime += duration;

        // Consider productivity, education, and work as productive
        if (["productivity", "education", "work"].includes(category)) {
            productiveTime += duration;
        }

        // Check user-defined productive sites
        if (
            userCategories.productive &&
            userCategories.productive.includes(session.url)
        ) {
            productiveTime += duration;
        }
    });

    return totalTime > 0 ? Math.round((productiveTime / totalTime) * 100) : 0;
}

export function getTopSites(sessions, limit = 5) {
    const siteStats = {};

    sessions.forEach((session) => {
        try {
            const domain = new URL(session.url).hostname;
            if (!siteStats[domain]) {
                siteStats[domain] = {
                    domain,
                    totalTime: 0,
                    sessions: 0,
                    category: session.category || "other",
                };
            }
            siteStats[domain].totalTime += session.duration || 0;
            siteStats[domain].sessions += 1;
        } catch {
            // Invalid URL
        }
    });

    return Object.values(siteStats)
        .sort((a, b) => b.totalTime - a.totalTime)
        .slice(0, limit);
}

export function calculateWeeklyTrends(events) {
    const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];
    const weeklyData = {};

    days.forEach((day) => {
        weeklyData[day] = {
            totalTime: 0,
            productivity: 0,
            entertainment: 0,
            social: 0,
            sessions: 0,
        };
    });

    events.forEach((event) => {
        if (event.type === "session_end") {
            const date = new Date(event.ts);
            const dayName = days[date.getDay()];
            const duration = event.duration || 0;

            weeklyData[dayName].totalTime += duration;
            weeklyData[dayName].sessions += 1;

            // Add to category-specific time
            const category = event.category || "other";
            if (weeklyData[dayName][category] !== undefined) {
                weeklyData[dayName][category] += duration;
            }
        }
    });

    return weeklyData;
}

export function calculateEmotionalBalance(contentAnalyses) {
    if (!contentAnalyses || contentAnalyses.length === 0) {
        return { positive: 0, negative: 0, neutral: 0, score: 50 };
    }

    let positive = 0,
        negative = 0,
        neutral = 0;

    contentAnalyses.forEach((analysis) => {
        switch (analysis.sentiment) {
            case "positive":
                positive++;
                break;
            case "negative":
                negative++;
                break;
            default:
                neutral++;
                break;
        }
    });

    const total = positive + negative + neutral;
    const positiveRatio = positive / total;
    const negativeRatio = negative / total;

    // Calculate emotional balance score (0-100, where 50 is balanced)
    const score = Math.round(50 + (positiveRatio - negativeRatio) * 50);

    return {
        positive: Math.round((positive / total) * 100),
        negative: Math.round((negative / total) * 100),
        neutral: Math.round((neutral / total) * 100),
        score: Math.max(0, Math.min(100, score)),
    };
}

export function detectContentBubbles(topicAnalyses) {
    if (!topicAnalyses || topicAnalyses.length === 0)
        return { diversity: 0, topTopics: [] };

    const topicCounts = {};
    let totalTopics = 0;

    topicAnalyses.forEach((analysis) => {
        if (analysis.topics) {
            analysis.topics.forEach((topic) => {
                topicCounts[topic] = (topicCounts[topic] || 0) + 1;
                totalTopics++;
            });
        }
    });

    const uniqueTopics = Object.keys(topicCounts).length;
    const diversity =
        uniqueTopics > 0
            ? Math.round(
                  (uniqueTopics / Math.max(totalTopics / uniqueTopics, 1)) * 100
              )
            : 0;

    const topTopics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([topic, count]) => ({ topic, count }));

    return { diversity: Math.min(100, diversity), topTopics };
}
