// ============================================================//
//  App.jsx — ROOT FILE: All routes + layout wrapper           //
//  Landing page at '/' bypasses sidebar layout                //
//  15 routes total, animated with Framer Motion               //
// ============================================================//
import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import NetworkBanner from './components/NetworkBanner';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import { useApp } from './context/AppContext';
import { AnimatePresence, motion } from 'framer-motion';

// ==========================================//
//  LAZY LOADED PAGES — Code splitting       //
// ==========================================//
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const BillOfMaterials = lazy(() => import('./pages/BillOfMaterials'));
const CreateBom = lazy(() => import('./pages/CreateBom'));
const BomDetail = lazy(() => import('./pages/BomDetail'));
const EcoList = lazy(() => import('./pages/EcoList'));
const CreateEco = lazy(() => import('./pages/CreateEco'));
const EcoDetail = lazy(() => import('./pages/EcoDetail'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const EcoStages = lazy(() => import('./pages/EcoStages'));
const ApprovalRules = lazy(() => import('./pages/ApprovalRules'));

// Loading fallback for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[40vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
  </div>
);

// ==========================================//
//  ANIMATED ROUTES — Page transitions       //
//  Uses AnimatePresence for smooth swaps    //
// ==========================================//
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/bom" element={<BillOfMaterials />} />
            <Route path="/bom/create" element={<CreateBom />} />
            <Route path="/bom/:id" element={<BomDetail />} />
            <Route path="/eco" element={<EcoList />} />
            <Route path="/eco/create" element={<CreateEco />} />
            <Route path="/eco/:id" element={<EcoDetail />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/eco-stages" element={<EcoStages />} />
            <Route path="/rules" element={<ApprovalRules />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

// ==========================================//
//  APP LAYOUT — Sidebar + Topbar wrapper    //
//  Skips layout for '/' and '/login'        //
// ==========================================//
function AppLayout() {
  const { isAuthenticated, isLoading } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Landing page — always public, no sidebar/topbar
  if (location.pathname === '/') {
    return <LandingPage />;
  }

  // Login page — public, no sidebar/topbar
  if (location.pathname === '/login') {
    if (isAuthenticated) {
      return <Navigate to="/dashboard" replace />;
    }
    return <Login />;
  }

  // Show loading while restoring session
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // All other routes require authentication
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-surface-50 flex flex-col sm:block">
      <Sidebar 
        mobileMenuOpen={mobileMenuOpen} 
        setMobileMenuOpen={setMobileMenuOpen} 
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <div className={`transition-all duration-300 flex-1 flex flex-col ${collapsed ? 'sm:ml-[72px]' : 'sm:ml-[72px] lg:ml-[256px]'}`}>
        <Topbar setMobileMenuOpen={setMobileMenuOpen} />
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <AnimatedRoutes />
        </main>
      </div>
    </div>
  );
}

// ==========================================//
//  APP ROOT — Router + AppProvider          //
// ==========================================//
export default function App() {
  return (
    <Router>
      <NetworkBanner />
      <AppProvider>
        <AppLayout />
      </AppProvider>
    </Router>
  );
}
