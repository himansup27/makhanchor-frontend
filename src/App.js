// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './components/Auth/LoginPage';
import Header from './components/Dashboard/Header';
import Sidebar from './components/Dashboard/Sidebar';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import ProductionPage from './components/Production/ProductionPage';
import MaidaPage from './components/Inventory/MaidaPage';
import OilPage from './components/Inventory/OilPage';
import GheePage from './components/Inventory/GheePage';
import SalesPage from './components/Sales/SalesPage';
import ReportsPage from './components/Reports/ReportsPage';
import SettingsPage from './components/Settings/SettingsPage';

// Import Raw Materials Pages
import SujiPage from './components/RawMaterials/SujiPage';
import SugarPage from './components/RawMaterials/SugarPage';
import SaltPage from './components/RawMaterials/SaltPage';
import GasPage from './components/RawMaterials/GasPage';

// Dashboard Layout Component
const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <DashboardOverview />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/production"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ProductionPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          
          {/* Inventory Routes */}
          <Route
            path="/inventory/maida"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MaidaPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/oil"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OilPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/ghee"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GheePage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Raw Materials Routes */}
          <Route
            path="/raw-materials/suji"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SujiPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/raw-materials/sugar"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SugarPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/raw-materials/salt"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SaltPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/raw-materials/gas"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <GasPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SalesPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;