import React, { useState, useEffect } from 'react';
import { api } from './api';

const Dashboard = ({ user, onNewQuotation }) => {
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    const [stats, setStats] = useState({
        total: 0,
        drafts: 0,
        submitted: 0,
        approved: 0
    });

    useEffect(() => {
        fetchQuotations();
    }, []);

    const fetchQuotations = async () => {
        try {
            const data = await api.request('/api/quotations', 'GET');
            
            if (data && data.quotations) {
                setQuotations(data.quotations || []);
                calculateStats(data.quotations || []);
            } else {
                setError('Failed to fetch quotations');
            }
        } catch (error) {
            setError(error.message || 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (quotations) => {
        const stats = {
            total: quotations.length,
            drafts: quotations.filter(q => q.status === 'draft').length,
            submitted: quotations.filter(q => q.status === 'submitted').length,
            approved: quotations.filter(q => q.status === 'approved').length
        };
        setStats(stats);
    };

    const fetchQuotationDetails = async (quotationId) => {
        try {
            const data = await api.request(`/api/quotations/${quotationId}`, 'GET');
            
            if (data && data.quotation) {
                setSelectedQuotation(data.quotation);
                setShowModal(true);
                setActiveSection('overview');
            } else {
                setError(data?.error || 'Failed to fetch quotation details');
            }
        } catch (error) {
            setError(error.message || 'Network error. Please try again.');
        }
    };

    const downloadQuotationPDF = async (quotation) => {
        try {
            // For PDF downloads, we need to use fetch directly since api.request expects JSON
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const response = await fetch(`http://localhost:3001/api/quotations/${quotation.id}/pdf`, {
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
                // Fallback to text download
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
QUOTATION: ${quotation.quotation_number}
========================================

COMPANY INFORMATION:
-------------------
Company: ${user.company_name}
Contact Person: ${user.contact_person}
Email: ${user.email}
Phone: ${user.phone || 'Not provided'}
Address: ${user.address || 'Not provided'}

QUOTATION DETAILS:
------------------
Date: ${new Date(quotation.created_at).toLocaleDateString()}
Status: ${quotation.status.toUpperCase()}

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

FINISHING OPTIONS:
------------------
${data.input?.varnish || data.varnish ? `Varnish: ${data.input?.varnish || data.varnish}` : ''}
${data.input?.lamination || data.lamination ? `Lamination: ${data.input?.lamination || data.lamination}` : ''}
${data.input?.spotUV || data.spotUV ? 'Spot UV: Yes' : ''}
${data.input?.stamping || data.stamping ? 'Stamping: Yes' : ''}
${data.input?.embossing || data.embossing ? 'Embossing: Yes' : ''}

Generated by MLM Packaging Sdn Bhd
Date: ${new Date().toLocaleDateString()}
        `.trim();

        const blob = new Blob([quotationContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `quotation-${quotation.quotation_number}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const submitQuotation = async (quotationId) => {
        try {
            // Since there's no /api/quotations/{id}/submit endpoint, we'll update status
            const data = await api.request(`/api/quotations/${quotationId}`, 'PUT', {
                status: 'submitted'
            });

            if (data) {
                alert('Quotation submitted to sales team!');
                fetchQuotations();
                if (showModal) {
                    setShowModal(false);
                }
            } else {
                setError(data?.error || 'Failed to submit quotation');
            }
        } catch (error) {
            setError(error.message || 'Network error. Please try again.');
        }
    };

    const deleteQuotation = async (quotationId) => {
        if (!window.confirm('Are you sure you want to delete this quotation? This action cannot be undone.')) {
            return;
        }

        try {
            const data = await api.request(`/api/quotations/${quotationId}`, 'DELETE');
            
            if (data) {
                alert('Quotation deleted successfully!');
                fetchQuotations();
                if (showModal) {
                    setShowModal(false);
                }
            } else {
                setError(data?.error || 'Failed to delete quotation');
            }
        } catch (error) {
            setError(error.message || 'Network error. Please try again.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'bg-blue-100 text-blue-800 border border-blue-200';
            case 'approved': return 'bg-green-100 text-green-800 border border-green-200';
            case 'rejected': return 'bg-red-100 text-red-800 border border-red-200';
            case 'reviewed': return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
            default: return 'bg-gray-100 text-gray-800 border border-gray-200';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'submitted': return '→';
            case 'approved': return '✓';
            case 'rejected': return '×';
            case 'reviewed': return '○';
            default: return '';
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Section components for quotation details
    const CompanyInfoSection = () => (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-800">Company Information</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                        <label className="text-sm font-semibold text-blue-700 mb-2">Company Details</label>
                        <div className="space-y-2 mt-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Company Name:</span>
                                <span className="font-semibold text-gray-800">{user.company_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Contact Person:</span>
                                <span className="font-semibold text-gray-800">{user.contact_person}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                        <label className="text-sm font-semibold text-green-700 mb-2">Contact Information</label>
                        <div className="space-y-2 mt-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Email:</span>
                                <span className="font-semibold text-gray-800">{user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Phone:</span>
                                <span className="font-semibold text-gray-800">{user.phone || 'Not provided'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ProductSpecsSection = ({ data }) => (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-800">Product Specifications</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Width', value: `${data.input?.dimensions?.width || data.width} mm` },
                        { label: 'Height', value: `${data.input?.dimensions?.height || data.height} mm` },
                        { label: 'Gusset', value: `${data.input?.dimensions?.gusset || data.gusset} mm` },
                        { label: 'Quantity', value: `${data.input?.quantity || data.quantity} pcs` }
                    ].map((item, index) => (
                        <div key={index} className="text-center p-4 bg-gray-50 rounded-md border border-gray-200 hover:shadow-sm transition-shadow">
                            <div className="mb-2">
                                <div className="w-10 h-10 mx-auto rounded bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-600 text-xs font-medium">{item.label.charAt(0)}</span>
                                </div>
                            </div>
                        <label className="text-sm font-medium text-gray-600">{item.label}</label>
                        <p className="text-lg font-bold text-gray-800 mt-1">{item.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );

    const PricingSection = ({ data, quotation }) => (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-sm">
            <div className="flex items-center mb-6">
                <div className="w-2 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full mr-4"></div>
                <h3 className="text-xl font-bold text-gray-800">Pricing Summary</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[
                    { label: 'Total Cost', value: `RM ${data.summary?.totalCost?.toLocaleString() || '0.00'}`, color: 'from-gray-500 to-gray-600' },
                    { label: 'Unit Cost', value: `RM ${data.summary?.unitCost?.toFixed(4) || '0.0000'}`, color: 'from-blue-500 to-blue-600' },
                    { label: 'Unit Selling', value: `RM ${data.summary?.unitSellingPrice?.toFixed(4) || '0.0000'}`, color: 'from-purple-500 to-purple-600' },
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
                    {data.summary?.margin ? (data.summary.margin * 100).toFixed(1) : ((1 - (data.summary?.marginIndex || data.marginIndex)) * 100).toFixed(1)}%
                </p>
            </div>
        </div>
    );

    // Main render function for quotation details
    const renderQuotationDetails = (quotationData, quotation) => {
        if (!quotationData) return <p>No quotation data available.</p>;

        return (
            <div className="space-y-6">
                {activeSection === 'overview' && (
                    <>
                        <CompanyInfoSection />
                        <ProductSpecsSection data={quotationData} />
                        <PricingSection data={quotationData} quotation={quotation} />
                    </>
                )}
                {activeSection === 'specs' && (
                    <ProductSpecsSection data={quotationData} />
                )}
                {activeSection === 'pricing' && (
                    <PricingSection data={quotationData} quotation={quotation} />
                )}
                {activeSection === 'company' && (
                    <CompanyInfoSection />
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading your quotations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Enhanced Header */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                        <div className="flex-1">
                            <div className="flex items-center space-x-4 mb-3">
                                <div className="p-2 bg-blue-600 rounded-md">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-gray-900 bg-gradient-to-br from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                        My Dashboard
                                    </h1>
                                    <p className="text-gray-600 text-lg mt-1">Manage your quotation requests</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center space-x-3 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 border border-blue-200/50 shadow-lg">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-semibold text-gray-700">Account Active</span>
                            </div>
                            <button
                                onClick={onNewQuotation}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-medium transition-colors flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Create New Quotation
                            </button>
                        </div>
                    </div>

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Quotations', value: stats.total, color: 'blue', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
                            { label: 'Drafts', value: stats.drafts, color: 'yellow', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
                            { label: 'Submitted', value: stats.submitted, color: 'green', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
                            { label: 'Approved', value: stats.approved, color: 'purple', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' }
                        ].map((stat, index) => (
                            <div key={index} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-2 rounded-md bg-${stat.color}-100`}>
                                        <svg className={`w-6 h-6 text-${stat.color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                                        </svg>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-semibold text-gray-900 mb-1">{stat.value}</h3>
                                <p className="text-gray-600 text-sm">{stat.label}</p>
                            </div>
                        ))}
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
                                <h3 className="text-base font-semibold text-red-800">Error</h3>
                                <div className="mt-1 text-base text-red-700">
                                    {error}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {quotations.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200">
                        <div className="mb-4">
                            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">No quotations yet</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                            Create your first quotation to get started with our professional packaging solutions
                        </p>
                        <button
                            onClick={onNewQuotation}
                            className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:via-blue-600 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all duration-300 shadow-xl hover:shadow-2xl text-lg transform hover:scale-105 active:scale-95"
                        >
                            Create First Quotation
                        </button>
                    </div>
                ) : (
                    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/60 overflow-hidden">
                        <div className="p-6 border-b border-gray-200/50">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-gray-900">My Quotations</h2>
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                                    {quotations.length} quotations
                                </span>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-800 text-white">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Quotation #</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Dimensions</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Total Amount</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Created Date</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {quotations.map((quotation) => {
                                        const quotationData = quotation.quotation_data || {};
                                        
                                        const getDimensions = () => {
                                            if (quotationData.form?.width && quotationData.form?.height) {
                                                return `${quotationData.form.width}mm × ${quotationData.form.height}mm`;
                                            }
                                            if (quotationData.input?.dimensions?.width && quotationData.input?.dimensions?.height) {
                                                return `${quotationData.input.dimensions.width}mm × ${quotationData.input.dimensions.height}mm`;
                                            }
                                            if (quotationData.result?.input?.dimensions?.width && quotationData.result?.input?.dimensions?.height) {
                                                return `${quotationData.result.input.dimensions.width}mm × ${quotationData.result.input.dimensions.height}mm`;
                                            }
                                            return 'View details';
                                        };

                                        const dimensions = getDimensions();

                                        return (
                                            <tr key={quotation.id} className="hover:bg-blue-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {quotation.quotation_number}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {dimensions}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    RM {quotation.total_amount?.toLocaleString() || '0.00'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(quotation.status)}`}>
                                                        {getStatusIcon(quotation.status)} {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(quotation.created_at)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button 
                                                            onClick={() => fetchQuotationDetails(quotation.id)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                            View
                                                        </button>
                                                        <button 
                                                            onClick={() => downloadQuotationPDF(quotation)}
                                                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center"
                                                        >
                                                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                            </svg>
                                                            PDF
                                                        </button>
                                                        {quotation.status === 'draft' && (
                                                            <>
                                                                <button 
                                                                    onClick={() => submitQuotation(quotation.id)}
                                                                    className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center"
                                                                >
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                                    </svg>
                                                                    Submit
                                                                </button>
                                                                <button 
                                                                    onClick={() => deleteQuotation(quotation.id)}
                                                                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-medium transition-colors flex items-center"
                                                                >
                                                                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Delete
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Enhanced Quotation Details Modal */}
                {showModal && selectedQuotation && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-xl">
                            <div className="p-8">
                                {/* Enhanced Header */}
                                <div className="flex justify-between items-start mb-8">
                                    <div>
                                    <h3 className="text-2xl font-semibold text-gray-900">
                                        Quotation {selectedQuotation.quotation_number}
                                    </h3>
                                        <p className="text-gray-600 mt-2 text-lg">For {user.company_name}</p>
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
                                        { id: 'overview', label: 'Overview' },
                                        { id: 'specs', label: 'Specifications' },
                                        { id: 'pricing', label: 'Pricing' },
                                        { id: 'company', label: 'Company' },
                                    ].map(({ id, label }) => (
                                        <button
                                            key={id}
                                            onClick={() => setActiveSection(id)}
                                            className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                                                activeSection === id
                                                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                                                    : 'border-transparent text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                                            }`}
                                        >
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
                                        {selectedQuotation.status === 'draft' && (
                                            <button
                                                onClick={() => {
                                                    submitQuotation(selectedQuotation.id);
                                                    setShowModal(false);
                                                }}
                                                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors flex items-center"
                                            >
                                                📤 Submit Quotation
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-2.5 rounded-md font-medium text-sm transition-colors"
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

export default Dashboard;