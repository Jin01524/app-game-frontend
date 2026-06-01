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
import CalculatorPage from './pages/CalculatorPage';
import PhotosPage from './pages/PhotosPage';
import WeatherPage from './pages/WeatherPage';
import TarotPage from './pages/TarotPage';
import SpyPage from './pages/SpyPage';
import GoldPage from './pages/GoldPage';
import MessagingPage from './pages/MessagingPage';
import WerewolfPage from './pages/WerewolfPage';
import AccommodationPage from './pages/AccommodationPage';
import TravelMapPage from './pages/TravelMapPage';


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
          <Route path="/utilities/calculator"
            element={<ProtectedRoute><CalculatorPage /></ProtectedRoute>}
          />
          <Route path="/utilities/photos"
            element={<ProtectedRoute><PhotosPage /></ProtectedRoute>}
          />
          <Route path="/utilities/weather"
            element={<ProtectedRoute><WeatherPage /></ProtectedRoute>}
          />
          <Route path="/utilities/tarot"
            element={<ProtectedRoute><TarotPage /></ProtectedRoute>}
          />
          <Route path="/utilities/spy"
            element={<ProtectedRoute><SpyPage /></ProtectedRoute>}
          />
          <Route path="/utilities/gold"
            element={<ProtectedRoute><GoldPage /></ProtectedRoute>}
          />
          <Route path="/utilities/messaging"
            element={<ProtectedRoute><MessagingPage /></ProtectedRoute>}
          />
          <Route path="/utilities/werewolf"
            element={<ProtectedRoute><WerewolfPage /></ProtectedRoute>}
          />
          <Route path="/utilities/accommodation"
            element={<ProtectedRoute><AccommodationPage /></ProtectedRoute>}
          />
          <Route path="/utilities/travel-map"
            element={<ProtectedRoute><TravelMapPage /></ProtectedRoute>}
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
