// src/components/api.js
import { auth } from './auth';

// Create the api object
const api = {
    request: async (endpoint, method = 'GET', data = null) => {
        const token = auth.getToken();
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
            console.log(`🔑 Sending token in request to ${endpoint}`);
        }
        
        const config = {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined,
            credentials: 'include'
        };
        
        // Use the correct backend URL
        const baseURL = 'http://localhost:3001';
        const url = `${baseURL}${endpoint}`;
        
        try {
            console.log(`📡 Making ${method} request to ${url}`);
            const response = await fetch(url, config);
            
            console.log(`📥 Response status: ${response.status} for ${endpoint}`);
            
            // Handle token expiration
            if (response.status === 401) {
                const errorData = await response.json().catch(() => ({}));
                console.log('❌ Token expired or invalid:', errorData.error);
                
                // Only redirect to login if it's a token error
                if (errorData.error?.includes('token')) {
                    auth.logout();
                    window.location.href = '/';
                }
                return null;
            }
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ API error ${response.status}:`, errorText);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('❌ API request error:', error);
            // Don't auto-logout on network errors
            if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
                throw new Error('Network error. Please check if backend server is running on port 3001.');
            }
            throw error;
        }
    },
    
    // Helper method to get token for direct fetch calls (like PDF downloads)
    getToken: () => {
        return auth.getToken();
    }
};

// Export the api object as a named export
export { api };