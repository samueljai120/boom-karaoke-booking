import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { BusinessHoursProvider } from './contexts/BusinessHoursContext';
import { BusinessInfoProvider } from './contexts/BusinessInfoContext';
import { TutorialProvider } from './contexts/TutorialContext';
import AppleCalendarDashboard from './components/AppleCalendarDashboard';
import InteractiveTutorial from './components/InteractiveTutorial';
import PricingPage from './pages/PricingPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import SettingsPage from './pages/SettingsPage';
import TenantManagement from './pages/TenantManagement';
import AIAnalyticsDashboard from './components/AIAnalyticsDashboard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import HelpCenterPage from './pages/HelpCenterPage';
import StatusPage from './pages/StatusPage';
import APIPage from './pages/APIPage';
import CareersPage from './pages/CareersPage';
import SupportPage from './pages/SupportPage';
import DocumentationPage from './pages/DocumentationPage';
import PrivacyPage from './pages/PrivacyPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminTenantManagement from './pages/AdminTenantManagement';
import AdminUserManagement from './pages/AdminUserManagement';
import AdminFormManagement from './pages/AdminFormManagement';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminBilling from './pages/AdminBilling';
import AdminSystemSettings from './pages/AdminSystemSettings';
import ApiTest from './components/ApiTest';
import AuthTest from './components/AuthTest';
import LoginTest from './components/LoginTest';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import './index.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Error logging removed for clean version
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center max-w-md p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">The application encountered an error. Please refresh the page to try again.</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
              <pre className="mt-2 text-xs text-gray-400 bg-gray-50 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error.response?.status === 401) return false;
        return failureCount < 3;
      },
    },
  },
});

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppContent = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/docs" element={<DocumentationPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/api" element={<APIPage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/api-test" element={<ApiTest />} />
        <Route path="/auth-test" element={<AuthTest />} />
        <Route path="/login-test" element={<LoginTest />} />
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/tenants" element={<AdminTenantManagement />} />
        <Route path="/admin/users" element={<AdminUserManagement />} />
        <Route path="/admin/forms" element={<AdminFormManagement />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/admin/billing" element={<AdminBilling />} />
        <Route path="/admin/system" element={<AdminSystemSettings />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <TutorialProvider>
              <AppleCalendarDashboard />
              <InteractiveTutorial />
            </TutorialProvider>
          </ProtectedRoute>
        } />
        <Route path="/ai-analytics" element={
          <ProtectedRoute>
            <AIAnalyticsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        <Route path="/tenants" element={
          <ProtectedRoute>
            <TenantManagement />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WebSocketProvider>
            <SettingsProvider>
              <BusinessHoursProvider>
                <BusinessInfoProvider>
                  <div className="App">
                    <AppContent />
                    <ScrollToTopButton />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            primary: '#34C759',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          duration: 5000,
                          iconTheme: {
                            primary: '#FF3B30',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                  </div>
                </BusinessInfoProvider>
              </BusinessHoursProvider>
              {/* React Query Devtools hidden for demo */}
            </SettingsProvider>
          </WebSocketProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;