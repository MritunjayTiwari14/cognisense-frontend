import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Moon, Sun, Bell, User } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const navItems = [
    { path: '/', label: 'Dashboard' },
    { path: '/analytics', label: 'Analytics' },
    { path: '/insights', label: 'Insights' },
    { path: '/settings', label: 'Settings' },
  ];

  // Load theme preference from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', !newTheme);
    
    // Update body background color
    if (newTheme) {
      document.body.style.backgroundColor = '#0f1419';
    } else {
      document.body.style.backgroundColor = '#f3f4f6';
    }
  };

  return (
    <nav className={`bg-[${isDarkMode ? '#1a1f2e' : '#f9fafb'}] border-b border-gray-800`}>
      <div className="max-w-[1400px] mx-auto px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            <span className="text-xl font-semibold text-white">Digital Footprint</span>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                  location.pathname === item.path
                    ? 'text-blue-400'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {item.label}
                {location.pathname === item.path && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                )}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-4">
            <select className="bg-[#2d3748] text-gray-300 text-sm rounded px-3 py-1.5 border border-gray-700 focus:outline-none focus:border-blue-500">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
            <button 
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-200 transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-200 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;