import { Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const weeklyData = [
    { day: 'Mon', Productive: 150, Social: 100, Entertainment: 80 },
    { day: 'Tue', Productive: 180, Social: 120, Entertainment: 100 },
    { day: 'Wed', Productive: 200, Social: 150, Entertainment: 120 },
    { day: 'Thu', Productive: 280, Social: 180, Entertainment: 200 },
    { day: 'Fri', Productive: 150, Social: 120, Entertainment: 180 },
    { day: 'Sat', Productive: 100, Social: 180, Entertainment: 250 },
    { day: 'Sun', Productive: 80, Social: 150, Entertainment: 240 },
  ];

  const metrics = [
    {
      title: 'Total Screen Time',
      value: '8h 7m',
      change: '↑ 12% vs yesterday',
      trend: 'up',
      color: 'border-blue-500',
    },
    {
      title: 'Productive Time',
      value: '3h 54m',
      change: '↑ 15% vs yesterday',
      trend: 'up',
      color: 'border-green-500',
    },
    {
      title: 'Social Media',
      value: '1h 40m',
      change: '↓ 8% vs yesterday',
      trend: 'down',
      color: 'border-purple-500',
    },
    {
      title: 'Entertainment',
      value: '2h 33m',
      change: '↑ 5% vs yesterday',
      trend: 'up',
      color: 'border-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Dashboard</h1>
        <p className="text-gray-400">Welcome back! Here's your digital footprint summary.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
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