import React, { useState, useEffect } from 'react';
import { api } from './api';
import { auth } from './auth'; // Add this import for token access

const AdminDashboard = ({ user, onBack }) => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState({
        totalQuotations: 0,
        totalRevenue: 0,
        pendingReviews: 0,
        activeUsers: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        fetchAllQuotations();
        fetchDashboardStats();
        fetchRecentActivity();
    }, []);

    const fetchAllQuotations = async () => {
        try {
            setLoading(true);
            const data = await api.request('/api/admin/quotations', 'GET');
            
            if (data && data.quotations) {
                setQuotations(data.quotations);
            } else {
                setError(data?.error || 'Failed to fetch quotations');
            }
        } catch (error) {
            setError(error.message || 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const data = await api.request('/api/admin/stats', 'GET');
            
            if (data && data.stats) {
                setStats({
                    totalQuotations: data.stats.quotations.total,
                    totalRevenue: data.stats.revenue.total,
                    pendingReviews: data.stats.quotations.byStatus.submitted || 0,
                    activeUsers: data.stats.users.total
                });
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const fetchRecentActivity = async () => {
        // Simulate recent activity data
        const activity = [
            { id: 1, type: 'quotation_submitted', user: 'ABC Company', time: '2 minutes ago', amount: 'RM 1,234.00' },
            { id: 2, type: 'quotation_approved', user: 'XYZ Corp', time: '5 minutes ago', amount: 'RM 5,678.00' },
            { id: 3, type: 'user_registered', user: 'New Company Ltd', time: '10 minutes ago', amount: null },
            { id: 4, type: 'quotation_rejected', user: 'Test Enterprises', time: '15 minutes ago', amount: 'RM 3,456.00' }
        ];
        setRecentActivity(activity);
    };

    const fetchQuotationDetails = async (quotationId) => {
        try {
            const data = await api.request(`/api/admin/quotations/${quotationId}`, 'GET');
            
            if (data && data.quotation) {
                setSelectedQuotation(data.quotation);
                setShowModal(true);
                setActiveSection('overview');
            } else {
                setError(data?.error || 'Failed to fetch quotation details');
            }
        } catch (error) {
            console.error('Fetch quotation details error:', error);
            setError('Network error occurred: ' + error.message);
        }
    };

    const downloadQuotationPDF = async (quotation) => {
        try {
            // Use auth.getToken() to get the token from the correct storage
            const token = auth.getToken();
            const response = await fetch(`http://localhost:3001/api/admin/quotations/${quotation.id}/pdf`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `quotation-${quotation.quotation_number}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            } else {
                downloadQuotationAsText(quotation);
            }
        } catch (error) {
            console.error('PDF download error:', error);
            downloadQuotationAsText(quotation);
        }
    };

    const downloadQuotationAsText = (quotation) => {
        const data = quotation.quotation_data;
        const quotationContent = `
ADMIN QUOTATION: ${quotation.quotation_number}
=============================================

CLIENT INFORMATION:
-------------------
Company: ${quotation.user_company}
Contact Person: ${quotation.user_contact_person}
Email: ${quotation.user_email}
Phone: ${quotation.user_phone || 'Not provided'}
Address: ${quotation.user_address || 'Not provided'}

QUOTATION DETAILS:
------------------
Date: ${new Date(quotation.created_at).toLocaleDateString()}
Status: ${quotation.status.toUpperCase()}
Quotation #: ${quotation.quotation_number}

PRODUCT SPECIFICATIONS:
-----------------------
Dimensions: ${data.input?.dimensions?.width || data.width}mm × ${data.input?.dimensions?.height || data.height}mm
Gusset: ${data.input?.dimensions?.gusset || data.gusset}mm
Quantity: ${data.input?.quantity || data.quantity} pieces
Paper Type: ${data.input?.paper || data.paperName}
Printing: ${data.input?.printing || data.printingOption}

PRICING SUMMARY:
----------------
Total Cost: RM ${data.summary?.totalCost?.toLocaleString() || '0.00'}
Unit Cost: RM ${data.summary?.unitCost?.toFixed(4) || '0.0000'}
Unit Selling Price: RM ${data.summary?.unitSellingPrice?.toFixed(4) || '0.0000'}
Total Selling Price: RM ${quotation.total_amount?.toLocaleString() || '0.00'}
Profit Margin: ${data.summary?.margin ? (data.summary.margin * 100).toFixed(1) : ((1 - (data.summary?.marginIndex || data.marginIndex)) * 100).toFixed(1)}%

--- ADMIN VIEW ---
Generated by: ${user.name}
User Company: ${quotation.user_company}
Contact: ${quotation.user_contact_person}
Email: ${quotation.user_email}

Generated on: ${new Date().toLocaleDateString()}
        `.trim();

        const blob = new Blob([quotationContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `admin-quotation-${quotation.quotation_number}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const updateQuotationStatus = async (quotationId, newStatus) => {
        try {
            const data = await api.request(`/api/admin/quotations/${quotationId}/status`, 'PUT', { 
                status: newStatus 
            });
            
            if (data) {
                fetchAllQuotations();
                fetchDashboardStats();
                alert(`Quotation status updated to ${newStatus}`);
                setShowModal(false);
            } else {
                setError(data?.error || 'Failed to update quotation status');
            }
        } catch (error) {
            setError(error.message || 'Network error occurred');
        }
    };

    const filteredQuotations = quotations.filter(quotation => {
        const matchesFilter = filter === 'all' || quotation.status === filter;
        const matchesSearch = quotation.user_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quotation.quotation_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            quotation.user_contact_person?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'draft': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
            case 'reviewed': return 'bg-purple-100 text-purple-800 border border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'submitted': return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
            );
            case 'draft': return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
            );
            case 'approved': return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
            case 'rejected': return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            );
            case 'reviewed': return (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
            );
            default: return '';
        }
    };

    const getActivityIcon = (type) => {
        const icons = {
            'quotation_submitted': 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12',
            'quotation_approved': 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            'quotation_rejected': 'M6 18L18 6M6 6l12 12',
            'user_registered': 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
        };
        return icons[type] || 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    };

    const getActivityColor = (type) => {
        switch (type) {
            case 'quotation_submitted': return 'text-blue-600 bg-blue-50';
            case 'quotation_approved': return 'text-green-600 bg-green-50';
            case 'quotation_rejected': return 'text-red-600 bg-red-50';
            case 'user_registered': return 'text-purple-600 bg-purple-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    // Enhanced Section components for quotation details
    const CompanyInfoSection = ({ quotation }) => (
        <div className="bg-white rounded-2xl border border-purple-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-800">Client Information</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                        <label className="text-sm font-semibold text-purple-700 mb-3 block">Company Details</label>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Company Name:</span>
                                <span className="font-semibold text-gray-800 text-sm break-words">{quotation.user_company}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Contact Person:</span>
                                <span className="font-semibold text-gray-800 text-sm break-words">{quotation.user_contact_person}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">User ID:</span>
                                <span className="font-semibold text-gray-800 text-sm">{quotation.user_id}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <label className="text-sm font-semibold text-blue-700 mb-3 block">Contact Information</label>
                        <div className="space-y-3">
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Email:</span>
                                <span className="font-semibold text-gray-800 text-sm break-all">{quotation.user_email}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Phone:</span>
                                <span className="font-semibold text-gray-800 text-sm">{quotation.user_phone || 'Not provided'}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-gray-500 mb-1">Address:</span>
                                <span className="font-semibold text-gray-800 text-sm break-words leading-relaxed">
                                    {quotation.user_address || 'Not provided'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProductSpecsSection = ({ data }) => {
        const getDimensions = () => {
            if (data.input?.dimensions?.width && data.input?.dimensions?.height) {
                return `${data.input.dimensions.width}mm × ${data.input.dimensions.height}mm`;
            }
            if (data.form?.width && data.form?.height) {
                return `${data.form.width}mm × ${data.form.height}mm`;
            }
            if (data.result?.input?.dimensions?.width && data.result?.input?.dimensions?.height) {
                return `${data.result.input.dimensions.width}mm × ${data.result.input.dimensions.height}mm`;
            }
            return 'N/A';
        };

        const getGusset = () => {
            return data.input?.dimensions?.gusset || data.form?.gusset || data.result?.input?.dimensions?.gusset || 'N/A';
        };

        const getQuantity = () => {
            return data.input?.quantity || data.form?.quantity || data.result?.input?.quantity || 'N/A';
        };

        const getPaperType = () => {
            return data.input?.paper || data.form?.paper || data.result?.input?.paper || 'N/A';
        };

        const getPrinting = () => {
            return data.input?.printing || data.form?.printing || data.result?.input?.printing || 'N/A';
        };

        return (
            <div className="bg-white rounded-2xl border border-green-200 p-6 shadow-sm">
                <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-4"></div>
                    <h3 className="text-xl font-bold text-gray-800">Product Specifications</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Dimensions', value: getDimensions(), icon: 'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4', color: 'blue' },
                        { label: 'Gusset', value: `${getGusset()} mm`, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'green' },
                        { label: 'Quantity', value: `${getQuantity()} pcs`, icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14', color: 'purple' },
                        { label: 'Paper Type', value: getPaperType(), icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'orange' }
                    ].map((item, index) => (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-md border border-gray-200 hover:shadow-sm transition-shadow">
                            <div className="mb-2">
                                <div className={`w-10 h-10 mx-auto rounded bg-${item.color}-100 flex items-center justify-center`}>
                                    <svg className={`w-6 h-6 text-${item.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                    </svg>
                                </div>
                            </div>
                            <label className="text-sm font-medium text-gray-600">{item.label}</label>
                            <p className="text-lg font-bold text-gray-800 mt-1">{item.value}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <label className="text-sm font-semibold text-yellow-700 mb-2">Printing Options</label>
                    <p className="text-lg font-semibold text-gray-800">{getPrinting()}</p>
                </div>
            </div>
        );
    };

    const PricingSection = ({ data, quotation }) => {
        const getTotalCost = () => {
            return data.summary?.totalCost || data.result?.summary?.totalCost || 0;
        };

        const getUnitCost = () => {
            return data.summary?.unitCost || data.result?.summary?.unitCost || 0;
        };

        const getUnitSellingPrice = () => {
            return data.summary?.unitSellingPrice || data.result?.summary?.unitSellingPrice || 0;
        };

        const getProfitMargin = () => {
            if (data.summary?.margin) {
                return (data.summary.margin * 100).toFixed(1);
            }
            if (data.summary?.marginIndex) {
                return ((1 - data.summary.marginIndex) * 100).toFixed(1);
            }
            if (data.result?.summary?.margin) {
                return (data.result.summary.margin * 100).toFixed(1);
            }
            return '0.0';
        };

        return (
            <div className="bg-white rounded-2xl border border-yellow-200 p-6 shadow-sm">
                <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full mr-4"></div>
                    <h3 className="text-xl font-bold text-gray-800">Pricing Summary</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                        { label: 'Total Cost', value: `RM ${getTotalCost().toLocaleString()}`, color: 'from-gray-500 to-gray-600' },
                        { label: 'Unit Cost', value: `RM ${getUnitCost().toFixed(4)}`, color: 'from-blue-500 to-blue-600' },
                        { label: 'Unit Selling', value: `RM ${getUnitSellingPrice().toFixed(4)}`, color: 'from-purple-500 to-purple-600' },
                        { label: 'Total Selling', value: `RM ${quotation.total_amount?.toLocaleString() || '0.00'}`, color: 'from-green-500 to-green-600' }
                    ].map((item, index) => (
                        <div key={index} className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                            <div className={`text-lg font-semibold mb-2 bg-gradient-to-br ${item.color} bg-clip-text text-transparent`}>
                                {item.label}
                            </div>
                            <p className="text-xl font-bold text-gray-800">{item.value}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
                    <label className="text-sm font-semibold text-yellow-700">Profit Margin</label>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">
                        {getProfitMargin()}%
                    </p>
                </div>
            </div>
        );
    };

    const AdditionalOptionsSection = ({ data }) => {
        const getFinishingOptions = () => {
            const options = [];
            
            if (data.input?.varnish || data.form?.varnish) {
                options.push(`Varnish: ${data.input?.varnish || data.form?.varnish}`);
            }
            if (data.input?.lamination || data.form?.lamination) {
                options.push(`Lamination: ${data.input?.lamination || data.form?.lamination}`);
            }
            if (data.input?.spotUV || data.form?.spotUV) {
                options.push('Spot UV: Yes');
            }
            if (data.input?.stamping || data.form?.stamping) {
                options.push('Stamping: Yes');
            }
            if (data.input?.embossing || data.form?.embossing) {
                options.push('Embossing: Yes');
            }

            return options.length > 0 ? options : ['No additional finishing options selected'];
        };

        return (
            <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
                <div className="flex items-center mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
                    <h3 className="text-xl font-bold text-gray-800">Additional Options</h3>
                </div>
                <div className="space-y-3">
                    {getFinishingOptions().map((option, index) => (
                        <div key={index} className="flex items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <span className="text-blue-600 mr-3">•</span>
                            <span className="text-gray-800 font-medium">{option}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Main render function for quotation details
    const renderQuotationDetails = (quotationData, quotation) => {
        if (!quotationData) return <p>No quotation data available.</p>;

        return (
            <div className="space-y-6">
                {activeSection === 'overview' && (
                    <>
                        <CompanyInfoSection quotation={quotation} />
                        <ProductSpecsSection data={quotationData} />
                        <PricingSection data={quotationData} quotation={quotation} />
                        <AdditionalOptionsSection data={quotationData} />
                    </>
                )}
                {activeSection === 'specs' && (
                    <ProductSpecsSection data={quotationData} />
                )}
                {activeSection === 'pricing' && (
                    <PricingSection data={quotationData} quotation={quotation} />
                )}
                {activeSection === 'company' && (
                    <CompanyInfoSection quotation={quotation} />
                )}
                {activeSection === 'options' && (
                    <AdditionalOptionsSection data={quotationData} />
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading Admin Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-8xl mx-auto">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="p-2 bg-slate-700 rounded-md">
                                    <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                        Admin Dashboard
                                    </h1>
                                    <p className="text-gray-600 text-lg mt-1">Comprehensive management panel</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-slate-200/50 shadow-lg">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-gray-700">System Online</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Quotations', value: stats.totalQuotations, icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', color: 'blue', change: '+12%' },
                            { label: 'Total Revenue', value: `RM ${stats.totalRevenue.toLocaleString()}`, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'green', change: '+8%' },
                            { label: 'Pending Review', value: stats.pendingReviews, icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', color: 'orange', change: '+5%' },
                            { label: 'Active Users', value: stats.activeUsers, icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', color: 'purple', change: '+3%' }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-md bg-${stat.color}-100`}>
                                        <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        {stat.change}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-gray-600 text-sm">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Filters and Search */}
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border-2 border-white/60 mb-6">
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Search Quotations
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search by company name, quotation number, or contact person..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-4 pl-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                    />
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                    </svg>
                                    Filter by Status
                                </label>
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                    <option value="reviewed">Reviewed</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">View Mode</label>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center justify-center ${
                                            viewMode === 'grid' 
                                                ? 'bg-slate-700 text-white border-slate-700' 
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-amber-300'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`flex-1 px-4 py-2 rounded-md border text-sm font-medium transition-colors flex items-center justify-center ${
                                            viewMode === 'list' 
                                                ? 'bg-slate-700 text-white border-slate-700' 
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-amber-300'
                                        }`}
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                        </svg>
                                        List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            <div className="ml-4">
                                <h3 className="text-base font-semibold text-red-800">System Alert</h3>
                                <div className="mt-1 text-base text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="xl:col-span-3">
                        {/* Enhanced Quotations Section */}
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden mb-6">
                            <div className="p-6 border-b border-gray-200/50">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-2xl font-bold text-gray-900">Quotation Management</h2>
                                    <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-semibold">
                                        {filteredQuotations.length} quotations
                                    </span>
                                </div>
                            </div>
                            
                            {viewMode === 'grid' ? (
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {filteredQuotations.length > 0 ? (
                                            filteredQuotations.map((quotation) => (
                                                <div key={quotation.id} className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-gray-200 p-6 hover:shadow-2xl hover:border-amber-400 transition-all duration-300 hover:scale-105 transform">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="font-bold text-gray-900 text-lg">{quotation.quotation_number}</h3>
                                                            <p className="text-gray-600 text-sm">{quotation.user_company}</p>
                                                            <p className="text-gray-500 text-xs">{quotation.user_contact_person}</p>
                                                        </div>
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quotation.status)}`}>
                                                            {getStatusIcon(quotation.status)} {quotation.status}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="space-y-3 mb-4">
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-500">Email:</span>
                                                            <span className="font-semibold text-gray-700 text-xs">{quotation.user_email}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-500">Amount:</span>
                                                            <span className="font-bold text-amber-600">RM {quotation.total_amount?.toLocaleString() || '0.00'}</span>
                                                        </div>
                                                        <div className="flex justify-between text-sm">
                                                            <span className="text-gray-500">Date:</span>
                                                            <span className="text-gray-600">{new Date(quotation.created_at).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => fetchQuotationDetails(quotation.id)}
                                                            className="flex-1 bg-slate-700 hover:bg-slate-800 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
                                                        >
                                                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View Details
                                                        </button>
                                                        <button
                                                            onClick={() => downloadQuotationPDF(quotation)}
                                                            className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md text-sm font-medium transition-colors"
                                                            title="Download PDF"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-3 text-center py-12">
                                                <div className="mb-4 flex justify-center">
                                                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <h3 className="text-xl font-semibold text-gray-900 mb-2">No quotations found</h3>
                                                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 text-white shadow-lg">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Quotation #</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Company</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Contact Person</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Total Amount</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                                                <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {filteredQuotations.length > 0 ? (
                                                filteredQuotations.map((quotation) => (
                                                    <tr key={quotation.id} className="hover:bg-amber-50 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                            {quotation.quotation_number}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">
                                                            {quotation.user_company}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {quotation.user_contact_person}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-600">
                                                            {quotation.user_email}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                            RM {quotation.total_amount?.toLocaleString() || 'N/A'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                                                                {getStatusIcon(quotation.status)} {quotation.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">
                                                            {new Date(quotation.created_at).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => fetchQuotationDetails(quotation.id)}
                                                                    className="text-slate-700 hover:text-slate-900 font-medium text-sm"
                                                                >
                                                                    View Details
                                                                </button>
                                                                <button
                                                                    onClick={() => downloadQuotationPDF(quotation)}
                                                                    className="text-green-600 hover:text-green-900 font-medium text-sm flex items-center"
                                                                    title="Download PDF"
                                                                >
                                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                    </svg>
                                                                    PDF
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                                                        No quotations found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar - Recent Activity */}
                    <div className="xl:col-span-1">
                        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/60 p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                                <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></span>
                                Recent Activity
                            </h3>
                            
                            <div className="space-y-4">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-md border border-gray-200 hover:shadow-sm transition-shadow">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getActivityIcon(activity.type)} />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-semibold text-gray-800">{activity.user}</p>
                                            <p className="text-xs text-gray-500">{activity.time}</p>
                                            {activity.amount && (
                                                <p className="text-xs font-semibold text-green-600 mt-1">{activity.amount}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Quotation Details Modal */}
                {showModal && selectedQuotation && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-2 border-slate-200/60 shadow-2xl">
                            <div className="p-8">
                                {/* Enhanced Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                        <h3 className="text-3xl font-bold text-gray-900 bg-gradient-to-br from-slate-700 to-slate-900 bg-clip-text text-transparent">
                                            Quotation {selectedQuotation.quotation_number}
                                        </h3>
                                        <p className="text-gray-600 mt-2 text-lg">For {selectedQuotation.user_company}</p>
                                        <div className="flex items-center mt-4 space-x-4">
                                            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedQuotation.status)}`}>
                                                {getStatusIcon(selectedQuotation.status)} {selectedQuotation.status.charAt(0).toUpperCase() + selectedQuotation.status.slice(1)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                📅 Created: {new Date(selectedQuotation.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setShowModal(false)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                                    >
                                        ×
                                    </button>
                                </div>

                                {/* Enhanced Navigation Tabs */}
                                <div className="flex border-b border-gray-200 mb-8">
                                    {[
                                        { id: 'overview', label: 'Overview', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
                                        { id: 'specs', label: 'Specifications', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
                                        { id: 'pricing', label: 'Pricing', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                                        { id: 'company', label: 'Client Info', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
                                        { id: 'options', label: 'Options', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4' },
                                    ].map(({ id, label, icon }) => (
                                        <button
                                            key={id}
                                            onClick={() => setActiveSection(id)}
                                            className={`flex items-center px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                                                activeSection === id
                                                    ? 'border-amber-500 text-amber-600 bg-amber-50'
                                                    : 'border-transparent text-gray-600 hover:text-amber-500 hover:bg-gray-50'
                                            }`}
                                        >
                                            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
                                            </svg>
                                            {label}
                                        </button>
                                    ))}
                                </div>

                                {/* Content */}
                                {renderQuotationDetails(selectedQuotation.quotation_data, selectedQuotation)}

                                {/* Enhanced Footer Actions */}
                                <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200">
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => downloadQuotationPDF(selectedQuotation)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center"
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download PDF
                                        </button>
                                    </div>
                                    <div className="flex space-x-3">
                                        {selectedQuotation.status === 'submitted' && (
                                            <>
                                                <button
                                                    onClick={() => updateQuotationStatus(selectedQuotation.id, 'approved')}
                                                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateQuotationStatus(selectedQuotation.id, 'rejected')}
                                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center"
                                                >
                                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {selectedQuotation.status === 'draft' && (
                                            <button
                                                onClick={() => updateQuotationStatus(selectedQuotation.id, 'reviewed')}
                                                className="bg-slate-700 hover:bg-slate-800 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                Mark Reviewed
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 active:scale-95"
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;