// src/utils/auth.js
export const auth = {
    // Store authentication data
    login: (user, token, isAdmin, rememberMe) => {
    console.log('🔐 Auth login called:', { rememberMe, isAdmin });
    
    // Clear everything first
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('rememberMe');
    
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('isAdmin');
    sessionStorage.removeItem('rememberMe');
    
    if (rememberMe) {
        console.log('💾 Storing in localStorage (Remember me: ON)');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('isAdmin', isAdmin.toString());
        localStorage.setItem('rememberMe', 'true');
    } else {
        console.log('💾 Storing in sessionStorage (Remember me: OFF)');
        sessionStorage.setItem('token', token);
        sessionStorage.setItem('user', JSON.stringify(user));
        sessionStorage.setItem('isAdmin', isAdmin.toString());
        sessionStorage.setItem('rememberMe', 'false');
    }
},
    
    // Get stored authentication data
    getAuthData: () => {
    // Check sessionStorage first (for non-remember me sessions)
    const sessionRememberMe = sessionStorage.getItem('rememberMe');
    
    // If sessionStorage has rememberMe (false) and token exists
    if (sessionRememberMe !== null && sessionStorage.getItem('token')) {
        return {
            token: sessionStorage.getItem('token'),
            user: sessionStorage.getItem('user'),
            isAdmin: sessionStorage.getItem('isAdmin'),
            rememberMe: sessionRememberMe === 'true'
        };
    }
    
    // Then check localStorage (for remember me sessions)
    const localStorageRememberMe = localStorage.getItem('rememberMe');
    if (localStorageRememberMe !== null && localStorage.getItem('token')) {
        return {
            token: localStorage.getItem('token'),
            user: localStorage.getItem('user'),
            isAdmin: localStorage.getItem('isAdmin'),
            rememberMe: localStorageRememberMe === 'true'
        };
    }
    
    // No authentication data found
    return {
        token: null,
        user: null,
        isAdmin: null,
        rememberMe: false
    };
},
    
    // Check if user is authenticated
    isAuthenticated: () => {
    const { token, user, rememberMe } = auth.getAuthData();
    console.log('🔍 Auth check:', { hasToken: !!token, hasUser: !!user, rememberMe });
    return !!(token && user);
},
    
    // Get current user
    getCurrentUser: () => {
        const { user } = auth.getAuthData();
        if (!user) return null;
        
        try {
            return JSON.parse(user);
        } catch (error) {
            console.error('Error parsing user data:', error);
            return null;
        }
    },
    
    // Get token
    getToken: () => {
        const { token } = auth.getAuthData();
        return token;
    },
    
    // Logout
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('rememberMe');
        
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('isAdmin');
        sessionStorage.removeItem('rememberMe');
        
        console.log('✅ Cleared all authentication data');
    },
    
    // Check if it's admin
    isAdmin: () => {
        const { isAdmin } = auth.getAuthData();
        return isAdmin === 'true';
    }
};