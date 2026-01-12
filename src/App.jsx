import React, { useState, useEffect } from 'react';
import QuotationForm from "./components/QuotationForm";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Profile from "./components/Profile";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard"; 
import { auth } from './components/auth'; 

// Your company branding
const COMPANY_BRANDING = {
  name: "MLM Packaging Sdn Bhd",
  logo: `${import.meta.env.BASE_URL || ""}logo.png`,
  tagline: "Quotation System"
};

export default function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 Checking authentication status...');
    
    // Debug: Show what's in storage
    console.log('📦 Storage contents:', {
        localStorage: {
            token: localStorage.getItem('token'),
            user: localStorage.getItem('user'),
            isAdmin: localStorage.getItem('isAdmin'),
            rememberMe: localStorage.getItem('rememberMe')
        },
        sessionStorage: {
            token: sessionStorage.getItem('token'),
            user: sessionStorage.getItem('user'),
            isAdmin: sessionStorage.getItem('isAdmin'),
            rememberMe: sessionStorage.getItem('rememberMe')
        }
    });
    
    if (auth.isAuthenticated()) {
        const currentUser = auth.getCurrentUser();
        const isAdminUser = auth.isAdmin();
        
        console.log('✅ User authenticated:', {
            user: currentUser,
            isAdmin: isAdminUser
        });
        
        setUser(currentUser);
        setIsAdmin(isAdminUser);
        setCurrentView(isAdminUser ? 'admin-dashboard' : 'dashboard');
    } else {
        console.log('❌ No valid authentication found');
    }
    
    setLoading(false);
}, []);

  const handleLogin = (user, token, isAdmin, rememberMe) => {
    console.log('🔐 Login handler called:', { rememberMe, isAdmin });
    auth.login(user, token, isAdmin, rememberMe);
    setUser(user);
    setIsAdmin(isAdmin);
    setCurrentView(isAdmin ? 'admin-dashboard' : 'dashboard');
};

  const handleRegister = (userData, token, rememberMe = true) => {
    // Default register remembers user
    if (rememberMe) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isAdmin', 'false');
    } else {
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('isAdmin', 'false');
    }
    setUser(userData);
    setIsAdmin(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    console.log('🚪 Logging out...');
    auth.logout();
    setUser(null);
    setIsAdmin(false);
    setCurrentView('login');
};

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    if (localStorage.getItem('user')) {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } else {
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  useEffect(() => {
    window.updateUser = updateUser;
    return () => {
      window.updateUser = null;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header for Regular Users */}
      {user && !isAdmin && (
        <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
              {/* Branding */}
              <div className="flex items-center space-x-4">
                <img src={COMPANY_BRANDING.logo} alt={`${COMPANY_BRANDING.name} logo`} className="h-10 w-auto object-contain" />
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 leading-tight whitespace-nowrap">{COMPANY_BRANDING.name}</h1>
                  <p className="text-xs text-gray-500">{COMPANY_BRANDING.tagline}</p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentView('calculator')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Quotation
                </button>

                <button
                  onClick={() => setCurrentView('dashboard')}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-gray-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Quotation History
                </button>

                <button
                  onClick={() => setCurrentView('profile')}
                  className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 rounded-md px-3 py-2 border border-gray-200 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-center w-7 h-7 bg-gray-300 rounded-full text-gray-600 text-xs font-medium">{user.contact_person.charAt(0).toUpperCase()}</div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-medium text-gray-800 leading-tight">{user.contact_person}</p>
                    <p className="text-xs text-gray-600 leading-tight">{user.company_name}</p>
                  </div>
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors border border-gray-300 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Header for Admin Users */}
      {user && isAdmin && (
        <header className="bg-gray-900 text-white border-b border-gray-800 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
              {/* Branding */}
              <div className="flex items-center space-x-4">
                <img src={COMPANY_BRANDING.logo} alt={`${COMPANY_BRANDING.name} logo`} className="max-h-12 w-auto rounded-xl object-contain border-2 border-white shadow-lg" />
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-bold text-white leading-tight whitespace-nowrap">{COMPANY_BRANDING.name}</h1>
                    <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">ADMIN</span>
                  </div>
                  <p className="text-sm text-purple-200 font-medium">{COMPANY_BRANDING.tagline}</p>
                </div>
              </div>

              {/* Admin Navigation */}
              <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setCurrentView('admin-dashboard')}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  Admin Dashboard
                </button>

                <button
                  onClick={() => setCurrentView('profile')}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  Admin Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="w-full">
        {!user ? (
          <>
            {currentView === 'login' && (
              <Login 
                onLogin={handleLogin} 
                switchToRegister={() => setCurrentView('register')}
                switchToAdmin={() => setCurrentView('admin-login')}
                companyBranding={COMPANY_BRANDING}
              />
            )}
            {currentView === 'admin-login' && (
              <AdminLogin 
                onLogin={handleLogin} 
                switchToUserLogin={() => setCurrentView('login')}
                companyBranding={COMPANY_BRANDING}
              />
            )}
            {currentView === 'register' && (
              <Register 
                onRegister={handleRegister} 
                switchToLogin={() => setCurrentView('login')}
                companyBranding={COMPANY_BRANDING}
              />
            )}
          </>
        ) : isAdmin ? (
          <>
            {currentView === 'admin-dashboard' && (
              <AdminDashboard user={user} onBack={() => setCurrentView('admin-dashboard')} />
            )}
            {currentView === 'profile' && (
              <Profile user={user} onBack={() => setCurrentView('admin-dashboard')} isAdmin={true} />
            )}
          </>
        ) : (
          <>
            {currentView === 'dashboard' && (
              <Dashboard user={user} onNewQuotation={() => setCurrentView('calculator')} />
            )}
            {currentView === 'calculator' && (
              <QuotationForm user={user} onBack={() => setCurrentView('dashboard')} companyBranding={COMPANY_BRANDING} />
            )}
            {currentView === 'profile' && (
              <Profile user={user} onBack={() => setCurrentView('dashboard')} isAdmin={false} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-3">
            <img src={COMPANY_BRANDING.logo} alt={`${COMPANY_BRANDING.name} logo`} className="h-6 w-auto object-contain" />
            <div className="text-sm">
              <span className="text-gray-600">Powered by </span>
              <span className="font-medium text-gray-900">{COMPANY_BRANDING.name}</span>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-xs text-gray-500">
            <span>support@yourcompany.com</span>
            <span>© {new Date().getFullYear()} All rights reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
