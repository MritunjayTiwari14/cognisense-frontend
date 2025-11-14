import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import { supabase } from './supabaseClient';

const RequireAuth = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!mounted) return;
      setUser(user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
        <div className="text-gray-300 text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#0f1419]">
        <Navbar />
        <main className="max-w-[1400px] mx-auto px-8 py-8">
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={(
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              )}
            />
            <Route
              path="/analytics"
              element={(
                <RequireAuth>
                  <Analytics />
                </RequireAuth>
              )}
            />
            <Route
              path="/insights"
              element={(
                <RequireAuth>
                  <Insights />
                </RequireAuth>
              )}
            />
            <Route
              path="/settings"
              element={(
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              )}
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
