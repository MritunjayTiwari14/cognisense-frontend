import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../supabaseClient';

const API_BASE_URL = 'http://localhost:8080/api/v1';

const Analytics = () => {
  const [weeklyData, setWeeklyData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hours = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
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

        const apiWeekly = json.weeklyData || [];
        const mappedWeekly = apiWeekly.map((day) => ({
          day: day.day,
          // Treat dashboard "Productive" as productive units
          productive: day.Productive,
          // Combine Social + Entertainment as a simple "distracting" metric
          distracting: (day.Social || 0) + (day.Entertainment || 0),
        }));

        setWeeklyData(mappedWeekly);

        const generatedHeatmap = [];
        for (const hour of hours) {
          for (const d of days) {
            generatedHeatmap.push({
              hour,
              day: d,
              intensity: Math.floor(Math.random() * 5),
            });
          }
        }
        setHeatmapData(generatedHeatmap);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || 'Failed to load analytics');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, []);

  const getIntensityColor = (intensity) => {
    const colors = ['#1e293b', '#1e40af', '#3b82f6', '#60a5fa', '#93c5fd'];
    return colors[intensity];
  };

  const stats = [
    { label: 'Total Clicks Today', value: '1,247', change: '↑ 10% from yesterday' },
    { label: 'Avg Session Duration', value: '42m', change: 'Optimal range' },
    { label: 'Most Active Hour', value: '2-3 PM', change: 'Peak productivity' },
    { label: 'Total Sessions', value: '23', change: '↓ 5 from yesterday' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Analytics</h1>
        <p className="text-gray-400">Deep dive into your browsing patterns and habits.</p>
      </div>

      {/* Weekly Activity Heatmap */}
      <div className="bg-[#1a1f2e] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-4">Weekly Activity Heatmap</h2>
        <p className="text-gray-400 text-sm mb-6">Hover over cells to see activity intensity</p>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <div className="flex gap-1">
              <div className="w-16"></div>
              {days.map((day) => (
                <div key={day} className="w-10 text-center text-sm text-gray-400 mb-2">
                  {day}
                </div>
              ))}
            </div>
            {hours.map((hour, hourIndex) => (
              <div key={hour} className="flex gap-1 mb-1">
                <div className="w-16 text-xs text-gray-400 flex items-center">{hour}</div>
                {days.map((day) => {
                  const dataPoint = heatmapData.find(d => d.hour === hour && d.day === day);
                  return (
                    <div
                      key={`${hour}-${day}`}
                      className="w-10 h-6 rounded cursor-pointer transition-all hover:ring-2 hover:ring-blue-500"
                      style={{ backgroundColor: getIntensityColor(dataPoint?.intensity || 0) }}
                      title={`${day} ${hour}: ${dataPoint?.intensity || 0} intensity`}
                    ></div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Productivity vs Distraction Timeline */}
      <div className="bg-[#1a1f2e] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-100 mb-6">Productivity vs Distraction Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={weeklyData}>
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
            <Line
              type="monotone"
              dataKey="productive"
              stroke="#10b981"
              strokeWidth={3}
              name="Productive Hours"
            />
            <Line
              type="monotone"
              dataKey="distracting"
              stroke="#ef4444"
              strokeWidth={3}
              name="Distracting Hours"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#1a1f2e] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-100 mb-1">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Analytics;