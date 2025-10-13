import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";
import { Toaster } from "react-hot-toast";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Analyze from "./pages/Analyze";
import AnalysisDetail from "./pages/AnalysisDetail";
import Analytics from "./pages/Analytics";
import Practice from "./pages/Practice";
import GitHubIntegration from "./pages/GitHubIntegration";
import { setAuthToken, setTokenGetter } from "./api";

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

// Auth Token Handler - Uses Clerk's useAuth hook
const AuthTokenHandler = ({ children }) => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  React.useEffect(() => {
    const setupAuth = async () => {
      if (isLoaded && isSignedIn) {
        try {
          // Set the token getter function for axios interceptor
          setTokenGetter(getToken);

          // Also set initial token
          const token = await getToken();
          if (token) {
            setAuthToken(token);
          }
        } catch (error) {
          console.error("Auth setup error:", error);
        }
      }
    };

    setupAuth();
  }, [isLoaded, isSignedIn, getToken]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center">
        <div className="spinner w-12 h-12"></div>
      </div>
    );
  }

  return children;
};

function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-dark-100 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Configuration Error
          </h1>
          <p className="text-light-200">
            Missing Clerk Publishable Key. Please add VITE_CLERK_PUBLISHABLE_KEY
            to your .env file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AuthTokenHandler>
        <Toaster position="top-right" />
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyze"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Analyze />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analyze/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalysisDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Analytics />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/practice"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Practice />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/github"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GitHubIntegration />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthTokenHandler>
    </ClerkProvider>
  );
}

export default App;
