import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Journal from './pages/Journal';
import Accounts from './pages/Accounts';
import Budget from './pages/Budget';
import Debts from './pages/Debts';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Categories from './pages/Categories';
import { useAuth } from './store/useAuth';
import { useTheme } from './store/useTheme';
import SplashScreen from './components/SplashScreen';
import React, { useEffect, useState } from 'react';

// Protected Route Wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuth((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  const initTheme = useTheme((state) => state.initTheme);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="journal" element={<Journal />} />
          <Route path="accounts" element={<Accounts />} />
          <Route path="budget" element={<Budget />} />
          <Route path="debts" element={<Debts />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="categories" element={<Categories />} />
          {/* Other routes can be added here */}
          <Route path="*" element={<div className="p-8 text-center text-slate-400">Page not found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;
