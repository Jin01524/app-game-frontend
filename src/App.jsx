import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from './components/ToastContainer';
import LoginPage   from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import ProfilePage from './pages/ProfilePage';
import AdminPage   from './pages/AdminPage';
import HousePage   from './pages/HousePage';
import MarketPage  from './pages/MarketPage';
import LobbyPage   from './pages/LobbyPage';
import UtilitiesPage from './pages/UtilitiesPage';

// Guard: only admin can access, others redirect to /
function AdminOnly({ children }) {
  const { user } = useAuth();
  if (!user) return null; // ProtectedRoute handles loading/redirect
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/"
            element={<ProtectedRoute><WelcomePage /></ProtectedRoute>}
          />
          <Route path="/home2d"
            element={<ProtectedRoute><HousePage /></ProtectedRoute>}
          />
          <Route path="/home2d/:username"
            element={<ProtectedRoute><HousePage /></ProtectedRoute>}
          />
          <Route path="/market"
            element={<ProtectedRoute><MarketPage /></ProtectedRoute>}
          />
          <Route path="/utilities"
            element={<ProtectedRoute><UtilitiesPage /></ProtectedRoute>}
          />
          <Route path="/lobby"
            element={<ProtectedRoute><LobbyPage /></ProtectedRoute>}
          />
          <Route path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route path="/admin"
            element={
              <ProtectedRoute>
                <AdminOnly>
                  <AdminPage />
                </AdminOnly>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}
