import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount (page refresh), try to re-hydrate user from the cookie session
    useEffect(() => {
        const rehydrate = async () => {
            try {
                const res = await api.get('users/me/');
                setUser(res.data);
            } catch (err) {
                // Cookie absent or expired — user is not logged in
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        rehydrate();
    }, []);

    const login = async (username, password) => {
        // Backend sets HttpOnly cookies; body returns { role, username, email }
        const res = await api.post('users/login/', { username, password });
        const userData = {
            role: res.data.role,
            username: res.data.username,
            email: res.data.email,
        };
        setUser(userData);
        return userData.role;
    };

    const logout = async () => {
        try {
            await api.post('users/logout/');
        } catch (err) {
            // Even if the request fails, clear state locally
            console.error('Logout request failed', err);
        }
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
