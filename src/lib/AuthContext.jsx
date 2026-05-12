import React, { createContext, useContext } from 'react';

const AuthContext = createContext(null);

/** Stable mock auth — no network, no loading. useAuth works with or without AuthProvider. */
const mockAuth = {
  user: null,
  isAuthenticated: false,
  isLoadingAuth: false,
  isLoadingPublicSettings: false,
  authError: null,
  authChecked: true,
  appPublicSettings: null,
  logout: () => {},
  navigateToLogin: () => {},
  checkUserAuth: async () => {},
  checkAppState: async () => {}
};

/** Optional no-op provider for code that still expects AuthProvider in the tree. */
export const AuthProvider = ({ children }) => (
  <AuthContext.Provider value={mockAuth}>{children}</AuthContext.Provider>
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context ?? mockAuth;
};
