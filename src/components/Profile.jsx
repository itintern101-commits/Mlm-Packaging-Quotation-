import React, { useState, useEffect } from 'react';
import { api } from './api';
import { auth } from './auth'; // Add this import for token access

const Profile = ({ user, onBack, isAdmin = false }) => {
    const [formData, setFormData] = useState({
        company_name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        name: '' // For admin
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const endpoint = isAdmin ? '/api/admin/profile' : '/api/profile';
            const data = await api.request(endpoint, 'GET');
            
            if (data && data.user) {
                if (isAdmin) {
                    setFormData({
                        name: data.user.name || '',
                        email: data.user.email || '',
                        company_name: 'Administrator',
                        contact_person: data.user.name || '',
                        phone: '',
                        address: ''
                    });
                } else {
                    setFormData({
                        company_name: data.user.company_name || '',
                        contact_person: data.user.contact_person || '',
                        email: data.user.email || '',
                        phone: data.user.phone || '',
                        address: data.user.address || '',
                        name: ''
                    });
                }
            } else {
                setError(data?.error || 'Failed to fetch profile');
            }
        } catch (error) {
            setError(error.message || 'Network error. Please try again.');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const endpoint = isAdmin ? '/api/admin/profile' : '/api/profile';
            const method = isAdmin ? 'PUT' : 'PUT';
            
            let requestBody;
            if (isAdmin) {
                requestBody = {
                    name: formData.name,
                    email: formData.email
                };
            } else {
                requestBody = {
                    company_name: formData.company_name,
                    contact_person: formData.contact_person,
                    phone: formData.phone,
                    address: formData.address
                };
            }

            const data = await api.request(endpoint, method, requestBody);

            if (data && data.message) {
                setSuccess(data.message || 'Profile updated successfully!');
                // Update global user state if needed
                if (window.updateUser && data.user) {
                    window.updateUser(data.user);
                }
            } else {
                setError(data?.error || 'Failed to update profile');
            }
        } catch (error) {
            setError(error.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-6 sm:py-8 lg:py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {isAdmin ? 'Admin Profile' : 'My Profile'}
                            </h1>
                            <p className="text-gray-600">
                                {isAdmin ? 'Manage your administrator account' : 'Manage your company profile information'}
                            </p>
                        </div>
                        <button
                            onClick={onBack}
                            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back to {isAdmin ? 'Dashboard' : 'Quotations'}</span>
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 via-orange-50 to-red-50 border-2 border-red-200 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error</h3>
                                <div className="mt-1 text-sm text-red-700">{error}</div>
                            </div>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-green-800">Success</h3>
                                <div className="mt-1 text-sm text-green-700">{success}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Profile Form */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-blue-200/60 p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {isAdmin ? (
                            <>
                                <div>
                                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Admin Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                                        placeholder="Enter your name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Admin Email
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                                        placeholder="Enter admin email"
                                    />
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Admin Information</h4>
                                    <p className="text-sm text-blue-600">
                                        Role: {user?.role || 'Administrator'}
                                    </p>
                                    {user?.last_login && (
                                        <p className="text-sm text-blue-600 mt-1">
                                            Last Login: {new Date(user.last_login).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div>
                                    <label htmlFor="company_name" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                        Company Name
                                    </label>
                                    <input
                                        id="company_name"
                                        name="company_name"
                                        type="text"
                                        required
                                        value={formData.company_name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact_person" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Contact Person
                                    </label>
                                    <input
                                        id="contact_person"
                                        name="contact_person"
                                        type="text"
                                        required
                                        value={formData.contact_person}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                                        placeholder="Enter contact person name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                                        placeholder="Enter email address"
                                        disabled
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        Phone Number
                                    </label>
                                    <input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows="3"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/30 focus:border-blue-500 transition-all duration-200 bg-white shadow-sm hover:border-gray-400"
                                        placeholder="Enter company address"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                    Update Profile
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;