import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from './auth-api';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        void (async () => {
            try {
                const session = await authApi.refresh();
                setUser(session.user);
                setAccessToken(session.accessToken);
            }
            catch {
                setUser(null);
                setAccessToken(null);
            }
            finally {
                setLoading(false);
            }
        })();
    }, []);
    const value = useMemo(() => ({
        user,
        accessToken,
        loading,
        setSession: (token, profile) => {
            setAccessToken(token);
            setUser(profile);
        },
        clearSession: () => {
            setAccessToken(null);
            setUser(null);
        },
        updateUser: (nextUser) => {
            setUser(nextUser);
        }
    }), [accessToken, loading, user]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
