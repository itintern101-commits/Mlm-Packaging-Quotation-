import React, { useState } from 'react';
import { api } from './api';  // ADD THIS LINE

const Login = ({ onLogin, switchToRegister, switchToAdmin, companyBranding }) => {
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

    console.log('📤 Submitting login form:', {
        email: formData.email,
        rememberMe: formData.rememberMe
    });

    try {
        const data = await api.request('/api/login', 'POST', {
            email: formData.email,
            password: formData.password,
            rememberMe: formData.rememberMe  // Make sure this is included!
        });

        console.log('📥 Login response:', data);

        if (data.token && data.user) {
            console.log('✅ Login successful, calling onLogin');
            onLogin(data.user, data.token, false, formData.rememberMe);
        } else {
            setError(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('❌ Login error:', error);
        setError('Network error. Please check if backend is running.');
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gray-50">
            <div className="w-full max-w-md">
                {/* Professional Company Branding Header */}
                <div className="text-center mb-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="mb-6">
                            <img 
                                src={companyBranding.logo} 
                                alt={`${companyBranding.name} logo`}
                                className="h-20 w-auto object-contain mx-auto"
                            />
                        </div>
                        <div className="text-center">
                            <h1 className="text-3xl font-semibold text-gray-900 tracking-tight whitespace-nowrap">
                                {companyBranding.name}
                            </h1>
                            <p className="text-sm text-gray-500 font-normal mt-0.5">{companyBranding.tagline}</p>
                        </div>
                    </div>
                    
                   <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-center mb-2">
                            <h2 className="text-xl font-semibold text-gray-900">Welcome Back</h2>
                            <svg className="w-6 h-6 text-blue-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-gray-600 text-center">Sign in to access your quotation account</p>
                    </div>
                </div>
                
                {/* Professional Login Form Card */}
                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 flex-1">
                                    <h3 className="text-sm font-medium text-red-800">Authentication Error</h3>
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
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
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
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
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
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                                        placeholder="Enter your password"
                                    />
                                </div>
                            </div>

                            {/* Remember Me Checkbox */}
                            <div className="flex items-center">
                                <input
                                    id="rememberMe"
                                    name="rememberMe"
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Sign in
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                        <p className="text-sm text-gray-600">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={switchToRegister}
                                className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                            >
                                Create account
                            </button>
                        </p>
                    </div>

                    {/* Admin Login Option */}
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                        <p className="text-xs text-gray-500">
                            Admin access?{' '}
                            <button
                                type="button"
                                onClick={switchToAdmin}
                                className="text-gray-600 hover:text-gray-700 font-medium transition-colors"
                            >
                                Admin login
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-500">
                        © {new Date().getFullYear()} {companyBranding.name}. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;