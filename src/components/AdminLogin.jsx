import React, { useState } from 'react';
import { api } from './api';  // ADD THIS LINE

const AdminLogin = ({ onLogin, switchToUserLogin, companyBranding }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log('📤 Submitting admin login form:', {
        email: formData.email,
        rememberMe: formData.rememberMe
    });

    try {
        const data = await api.request('/api/admin/login', 'POST', {
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe  // Make sure this is included!
        });

        console.log('📥 Admin login response:', data);

        if (data.token && data.user) {
            console.log('✅ Admin login successful, calling onLogin');
            onLogin(data.user, data.token, true, formData.rememberMe);
        } else {
            setError(data.error || 'Admin login failed');
        }
    } catch (error) {
        console.error('❌ Admin login error:', error);
        setError('Network error. Please check if backend is running.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 opacity-95">
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundRepeat: 'repeat'
                }}></div>
            </div>
            
            <div className="w-full max-w-md relative z-10">
                {/* Enhanced Company Branding Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center space-x-4 mb-6">
                        <div className="relative">
                            <img 
                                src={companyBranding.logo} 
                                alt={`${companyBranding.name} logo`}
                                className="max-h-24 w-auto rounded-2xl object-contain border-2 border-white shadow-xl"
                            />
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-600/10"></div>
                        </div>
                        <div className="text-left">
                            <h1 className="text-3xl font-bold text-amber-400 whitespace-nowrap drop-shadow-lg">
                                {companyBranding.name}
                            </h1>
                            <p className="text-base text-amber-200 font-medium">Admin Portal</p>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
                        <div className="flex items-center justify-center mb-2">
                            <svg className="w-6 h-6 text-amber-300 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            <h2 className="text-2xl font-bold text-white drop-shadow-md">Admin Access</h2>
                        </div>
                        <p className="text-amber-100 text-base text-center">Sign in to admin dashboard</p>
                    </div>
                </div>
                
                {/* Enhanced Admin Login Form Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-8 transform transition-all duration-300 hover:shadow-3xl">
                    {/* Back to User Login Button - Added at the top */}
                    <div className="mb-6">
                        <button
                            onClick={switchToUserLogin}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-500 font-semibold transition-all duration-200"
                        >
                            <span>←</span>
                            <span>Back to User Login</span>
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-2 border-red-200 rounded-2xl p-4 shadow-lg">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                        <span className="text-white text-xl font-bold">!</span>
                                    </div>
                                </div>
                                <div className="ml-4 flex-1">
                                    <h3 className="text-base font-bold text-red-800">Authentication Error</h3>
                                    <div className="mt-1 text-sm text-red-700">
                                        {error}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    Admin Email
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                                        placeholder="Enter admin email"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    Admin Password
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm"
                                        placeholder="Enter admin password"
                                    />
                                </div>
                            </div>

                            {/* Remember Me Checkbox for Admin */}
                            <div className="flex items-center">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-4 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Sign in as Admin
                                </>
                            )}
                        </button>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-6 p-4 bg-amber-50 rounded-md border border-amber-200">
                        <p className="text-sm text-gray-700 text-center font-medium flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Restricted access - Admin privileges required
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-white/80 drop-shadow-md">
                        Powered by {companyBranding.name} • Admin System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;