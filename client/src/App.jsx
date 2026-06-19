import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import MosquesPage from './pages/MosquesPage';
import MosqueDetailPage from './pages/MosqueDetailPage';
import JamaatsPage from './pages/JamaatsPage';
import JamaatDetailPage from './pages/JamaatDetailPage';
import AdminPage from './pages/AdminPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import BottomNav from './components/BottomNav';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin' && user.role !== 'superadmin') return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <div className="app">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/mosques" element={<ProtectedRoute><MosquesPage /></ProtectedRoute>} />
        <Route path="/mosques/:id" element={<ProtectedRoute><MosqueDetailPage /></ProtectedRoute>} />
        <Route path="/jamaats" element={<ProtectedRoute><JamaatsPage /></ProtectedRoute>} />
        <Route path="/jamaats/:id" element={<ProtectedRoute><JamaatDetailPage /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><UsersPage /></AdminRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {user && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
