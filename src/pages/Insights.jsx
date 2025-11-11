import { AlertTriangle, TrendingUp, Grid, MessageSquare } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const Insights = () => {
  const emotionalBalanceData = [
    { name: 'Positive', value: 45, color: '#10b981' },
    { name: 'Neutral', value: 30, color: '#6b7280' },
    { name: 'Negative', value: 15, color: '#ef4444' },
    { name: 'Biased', value: 10, color: '#f59e0b' },
  ];

  const contentCategories = [
    { name: 'Technology', percentage: 35, color: 'bg-blue-500' },
    { name: 'Entertainment', percentage: 25, color: 'bg-orange-500' },
    { name: 'News', percentage: 18, color: 'bg-red-500' },
    { name: 'Social', percentage: 15, color: 'bg-purple-500' },
    { name: 'Other', percentage: 7, color: 'bg-gray-500' },
  ];

  const alerts = [
    {
      icon: AlertTriangle,
      title: 'Negative Content Alert',
      description: 'Your negative content consumption increased by 8% this week. Consider diversifying your sources.',
      color: 'border-red-500',
      bgColor: 'bg-red-500/10',
      buttonColor: 'bg-red-500 hover:bg-red-600',
      buttonText: 'Learn More',
    },
    {
      icon: Grid,
      title: 'Content Bubble Detected',
      description: "You've been in a tech content bubble. Try exploring other topics for a balanced perspective.",
      color: 'border-purple-500',
      bgColor: 'bg-purple-500/10',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600',
      buttonText: 'Explore Topics',
    },
    {
      icon: TrendingUp,
      title: 'Great Progress!',
      description: 'Great job! Your productive screen time increased by 15% compared to last week.',
      color: 'border-green-500',
      bgColor: 'bg-green-500/10',
      buttonColor: 'bg-green-500 hover:bg-green-600',
      buttonText: 'View Details',
    },
    {
      icon: MessageSquare,
      title: 'Social Media Limit',
      description: 'Your social media usage is 22% above your target. Consider setting app limits.',
      color: 'border-blue-500',
      bgColor: 'bg-blue-500/10',
      buttonColor: 'bg-blue-500 hover:bg-blue-600',
      buttonText: 'Set Limit',
    },
  ];

  const weeklyProgress = [
    { label: 'Reduce Social Media Time', progress: 65, color: 'bg-blue-500' },
    { label: 'Increase Productive Hours', progress: 80, color: 'bg-green-500' },
    { label: 'Diversify Content Sources', progress: 45, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-100 mb-2">Insights & Suggestions</h1>
        <p className="text-gray-400">Personalized recommendations based on your digital footprint.</p>
      </div>

      {/* Summary Cards */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-100 mb-6">Your Digital Footprint Summary</h2>
        <div className="grid grid-cols-3 gap-8">
          <div>
            <p className="text-5xl font-bold text-gray-100 mb-2">72/100</p>
            <p className="text-blue-100">Overall Health Score</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-gray-100 mb-2">48%</p>
            <p className="text-blue-100">Productive Time Ratio</p>
          </div>
          <div>
            <p className="text-5xl font-bold text-gray-100 mb-2">+15%</p>
            <p className="text-blue-100">Weekly Improvement</p>
          </div>
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="grid grid-cols-2 gap-6">
        {alerts.map((alert, index) => (
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
          {weeklyProgress.map((item, index) => (
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
      <div className="grid grid-cols-2 gap-6">
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
            <p className="text-3xl font-bold text-gray-100 mb-1">72/100</p>
            <p className="text-gray-400 text-sm">Balance Score</p>
          </div>
        </div>

        {/* Content Categories */}
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-6">Content Categories</h2>
          <div className="space-y-4">
            {contentCategories.map((category, index) => (
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