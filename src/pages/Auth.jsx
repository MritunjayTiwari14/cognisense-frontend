import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        navigate('/');
      }
    });
  }, [navigate]);

  const handleSignInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1419]">
      <div className="bg-[#1a1f2e] rounded-xl p-10 max-w-md w-full shadow-xl border border-gray-800">
        <h1 className="text-2xl font-bold text-gray-100 mb-2">Sign in to Digital Footprint</h1>
        <p className="text-gray-400 mb-8 text-sm">
          Continue with your Google account to view your dashboard and insights.
        </p>
        <button
          onClick={handleSignInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
        >
          <span className="bg-white rounded-sm p-1">
            <svg className="w-4 h-4" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
              <path fill="#4285F4" d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.4H272v95.3h147.5c-6.4 34.7-25.9 64.1-55.2 83.6v69.4h89.2c52.2-48 82-118.8 82-197.9z"/>
              <path fill="#34A853" d="M272 544.3c74.7 0 137.4-24.7 183.1-67.2l-89.2-69.4c-24.8 16.7-56.6 26.5-93.9 26.5-72.2 0-133.4-48.5-155.3-113.9H26.1v71.6C71.4 486.1 165.6 544.3 272 544.3z"/>
              <path fill="#FBBC05" d="M116.7 320.3c-5.6-16.7-8.8-34.6-8.8-53 0-18.4 3.2-36.3 8.7-53l-.1-71.6H26.1C9.4 192.8 0 229.6 0 267.3c0 37.7 9.4 74.5 26.1 106.7l90.6-71.6z"/>
              <path fill="#EA4335" d="M272 107.7c40.7 0 77.3 14 106.1 41l79.3-79.3C409.3 24.5 346.6 0 272 0 165.6 0 71.4 58.2 26.1 160.7l90.6 71.6C138.6 156.2 199.8 107.7 272 107.7z"/>
            </svg>
          </span>
          <span>Continue with Google</span>
        </button>
      </div>
    </div>
  );
};

export default Auth;
