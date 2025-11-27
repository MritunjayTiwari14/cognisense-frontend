import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const Dashboard = ({ user }) => {
  const [metrics, setMetrics] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    (user?.email ? user.email.split('@')[0] : '');

  const formatSeconds = (seconds) => {
    if (!seconds || seconds <= 0) return '0m';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  };

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const { data: { session } = {} } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setError('Missing auth token');
          return;
        }

        const res = await fetch(`${API_BASE_URL}/dashboard?timeRange=this_week`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Dashboard request failed with ${res.status}`);
        }

        const json = await res.json();
        if (!mounted) return;

        setMetrics(json.metrics || []);
        setWeeklyData(json.weeklyData || []);
      } catch (err) {
        if (!mounted) return;
        console.error('Dashboard load error', err);
        setError(err.message || 'Failed to load dashboard');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const metricColorMap = {
    'Total Time': 'border-blue-500',
    'Productive Time': 'border-green-500',
    'Social Time': 'border-purple-500',
    'Entertainment Time': 'border-orange-500',
  };

  const formattedMetrics = metrics.map((metric) => ({
    title: metric.title,
    value: formatSeconds(metric.value),
    change: `${metric.change_percent >= 0 ? '↑' : '↓'} ${Math.abs(metric.change_percent || 0)}% vs last period`,
    trend: metric.trend,
    color: metricColorMap[metric.title] || 'border-blue-500',
  }));

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
          <p className="text-gray-400">Loading your dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
          <p className="text-red-400 text-sm">Failed to load dashboard: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
        <p className="text-gray-400">
          Welcome back
          {displayName && (
            <>
              ,{' '}
              <span className="font-semibold text-gray-100">{displayName}</span>
            </>
          )}
          ! Here's your digital footprint summary.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {formattedMetrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-[#1a1f2e] rounded-lg p-6 border-l-4 ${metric.color} relative`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-2">{metric.title}</p>
                <p className="text-3xl font-bold text-gray-100 mb-2">{metric.value}</p>
                <p className={`text-xs flex items-center gap-1 ${
                  metric.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {metric.change}
                </p>
              </div>
              <div className="p-3 bg-gray-800 rounded-lg">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Screen Time Overview */}
      <div className="bg-[#1a1f2e] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Weekly Screen Time Overview</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="day" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f2e',
                border: '1px solid #2d3748',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Productive" stackId="a" fill="#10b981" />
            <Bar dataKey="Social" stackId="a" fill="#8b5cf6" />
            <Bar dataKey="Entertainment" stackId="a" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;