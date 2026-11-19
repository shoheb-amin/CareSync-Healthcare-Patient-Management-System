import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { decodeJwt, isTokenExpired } from '../utils/jwt';
import { sessionLogger } from '../services/sessionLogger';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem('caresync_token'));
  const [user, setUser] = useState(() => {
    const savedToken = sessionStorage.getItem('caresync_token');
    return savedToken && !isTokenExpired(savedToken) ? decodeJwt(savedToken) : null;
  });
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      // 1. Log the session termination event
      sessionLogger.logEvent({
        module: 'AUTH',
        action: 'USER_LOGOUT',
        status: 'SUCCESS',
        recipient: user?.sub || 'User',
        details: 'User initiated session termination and logout',
      });

      // 2. Automatically save all session logs to CSV in frontend folder without prompting for download
      await sessionLogger.saveCsvSilently();

      // 3. Clear logs for the next user session
      sessionLogger.clearLogs();
    } catch {
      // Ensure logout proceeds even if log saving encounters an issue
    }

    sessionStorage.removeItem('caresync_token');
    setToken(null);
    setUser(null);
  }, [user]);

  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    if (data && data.token) {
      sessionStorage.setItem('caresync_token', data.token);
      setToken(data.token);
      const decodedUser = decodeJwt(data.token);
      setUser(decodedUser);

      // Log successful login session start
      sessionLogger.logEvent({
        module: 'AUTH',
        action: 'USER_LOGIN',
        status: 'SUCCESS',
        recipient: email,
        details: `User authenticated with role ${decodedUser?.role || 'STAFF'}`,
      });

      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = sessionStorage.getItem('caresync_token');
      if (savedToken && !isTokenExpired(savedToken)) {
        try {
          const valid = await authService.validateToken();
          if (valid) {
            setToken(savedToken);
            setUser(decodeJwt(savedToken));
          } else {
            logout();
          }
        } catch {
          // If auth service is temporarily unreachable, check token expiry locally
          if (!isTokenExpired(savedToken)) {
            setToken(savedToken);
            setUser(decodeJwt(savedToken));
          } else {
            logout();
          }
        }
      } else {
        logout();
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  const value = {
    token,
    user,
    isAuthenticated: !!token && !isTokenExpired(token),
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
