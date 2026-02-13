/**
 * App Context - Апп-ийн ерөнхий state
 * БАЙРШИЛ: Cashly.mn/App/src/context/AppContext.js
 */

import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [wallet, setWallet] = useState(null);
  const [loans, setLoans] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const value = {
    wallet,
    setWallet,
    loans,
    setLoans,
    activeLoans,
    setActiveLoans,
    transactions,
    setTransactions,
    notifications,
    setNotifications,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};