import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Analytics = () => {
  const weeklyData = [
    { day: 'Mon', productive: 3, distracting: 2.5 },
    { day: 'Tue', productive: 3.5, distracting: 2 },
    { day: 'Wed', productive: 3.2, distracting: 2.8 },
    { day: 'Thu', productive: 4, distracting: 4 },
    { day: 'Fri', productive: 2.8, distracting: 3.5 },
    { day: 'Sat', productive: 2, distracting: 5 },
    { day: 'Sun', productive: 1.5, distracting: 5.5 },
  ];

  const heatmapData = [];
  const hours = ['0:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  for (let hour of hours) {
    for (let day of days) {
      heatmapData.push({
        hour,
        day,
        intensity: Math.floor(Math.random() * 5),
      });
    }
  }

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
      <div className="grid grid-cols-4 gap-6">
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