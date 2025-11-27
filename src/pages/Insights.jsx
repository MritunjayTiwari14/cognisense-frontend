import { useEffect, useState } from 'react';
import { AlertTriangle, TrendingUp, Grid, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const Insights = () => {
  const [summary, setSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [emotionalSegments, setEmotionalSegments] = useState([]);
  const [balanceScore, setBalanceScore] = useState(null);
  const [contentCategories, setContentCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadInsights = async () => {
      try {
        const { data: { session } = {} } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setError('Missing auth token');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/dashboard/insights?timeRange=this_week`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Insights request failed with ${res.status}`);
        }

        const json = await res.json();
        if (!mounted) return;

        setSummary(json.summary || null);
        setAlerts(json.alerts || []);
        setWeeklyProgress(json.weeklyProgress || []);

        const eb = json.emotionalBalance || {};
        setEmotionalSegments(eb.segments || []);
        setBalanceScore(eb.balanceScore ?? null);

        setContentCategories(json.contentCategories || []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to load insights');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadInsights();

    return () => {
      mounted = false;
    };
  }, []);

  const emotionalBalanceData = emotionalSegments.map((segment) => {
    const colorMap = {
      positive: '#10b981',
      neutral: '#6b7280',
      negative: '#ef4444',
      biased: '#f59e0b',
    };

    return {
      name: segment.type
        ? segment.type.charAt(0).toUpperCase() + segment.type.slice(1)
        : '',
      value: segment.value,
      color: colorMap[segment.type] || '#6b7280',
    };
  });

  const categoryColorMap = {
    technology: 'bg-blue-500',
    entertainment: 'bg-orange-500',
    news: 'bg-red-500',
    social: 'bg-purple-500',
    other: 'bg-gray-500',
  };

  const categoryItems = contentCategories.map((category) => ({
    name: category.category
      ? category.category.charAt(0).toUpperCase() + category.category.slice(1)
      : '',
    percentage: category.percentage,
    color: categoryColorMap[category.category] || 'bg-gray-500',
  }));

  const alertStyleMap = {
    warning: {
      icon: AlertTriangle,
      color: 'border-red-500',
      bgColor: 'bg-red-500/10',
      buttonColor: 'bg-red-500 hover:bg-red-600',
    },
    info: {
      icon: Grid,
      color: 'border-purple-500',
      bgColor: 'bg-purple-500/10',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
    },
    success: {
      icon: TrendingUp,
      color: 'border-green-500',
      bgColor: 'bg-green-500/10',
      buttonColor: 'bg-green-500 hover:bg-green-600',
    },
  };

  const styledAlerts = alerts.map((alert) => {
    const style = alertStyleMap[alert.type] || alertStyleMap.info;
    return {
      ...style,
      title: alert.title,
      description: alert.description,
      buttonText: 'Learn More',
    };
  });

  const progressColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];

  const progressItems = weeklyProgress.map((goal, index) => ({
    label: goal.label,
    progress: goal.progressPercent,
    color: progressColors[index % progressColors.length],
  }));

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Insights & Suggestions</h1>
          <p className="text-gray-400 text-sm">Loading your insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Insights & Suggestions</h1>
          <p className="text-red-400 text-sm">Failed to load insights: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Insights & Suggestions</h1>
        <p className="text-gray-400">Personalized recommendations based on your digital footprint.</p>
      </div>

      {/* Summary Cards */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Your Digital Footprint Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <p className="text-5xl font-bold text-gray-100 mb-2">{`${summary?.overallHealthScore ?? 0}/100`}</p>
            <p className="text-blue-100">Overall Health Score</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-gray-100 mb-2">{`${summary?.productiveTimeRatio ?? 0}%`}</p>
            <p className="text-blue-100">Productive Time Ratio</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-gray-100 mb-2">{`+${summary?.weeklyImprovementPercent ?? 0}%`}</p>
            <p className="text-blue-100">Weekly Improvement</p>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {styledAlerts.map((alert, index) => (
          <div
            key={index}
            className={`bg-[#1a1f2e] rounded-lg p-6 border-l-4 ${alert.color}`}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${alert.bgColor}`}>
                <alert.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-100 mb-2">{alert.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{alert.description}</p>
                <button className={`px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors ${alert.buttonColor}`}>
                  {alert.buttonText}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Progress Tracker */}
      <div className="bg-[#1a1f2e] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Weekly Progress Tracker</h2>
        <div className="space-y-6">
          {progressItems.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300 text-sm">{item.label}</span>
                <span className="text-gray-400 text-sm">{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`${item.color} h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${item.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotional Balance */}
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Emotional Balance</h2>
          <div className="flex items-center justify-center mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={emotionalBalanceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {emotionalBalanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {emotionalBalanceData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-300 text-sm">{item.name}</span>
                </div>
                <span className="text-gray-400 text-sm">{item.value}%</span>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <p className="text-3xl font-bold text-gray-100 mb-1">{`${balanceScore ?? 0}/100`}</p>
            <p className="text-gray-400 text-sm">Balance Score</p>
          </div>
        </div>

        {/* Content Categories */}
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Content Categories</h2>
          <div className="space-y-4">
            {categoryItems.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-300 text-sm">{category.name}</span>
                  <span className="text-gray-400 text-sm">{category.percentage}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`${category.color} h-2 rounded-full`}
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;