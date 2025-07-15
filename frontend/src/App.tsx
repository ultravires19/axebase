import "./App.css";
import { Router, Route } from "@solidjs/router";
import { lazy } from "solid-js";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";

// Import pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";

// Lazy-loaded pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));
const ResendVerification = lazy(() => import("./pages/ResendVerification"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

function App() {
  return (
    <Router>
      {/* Public routes */}
      <Route
        path="/"
        component={() => (
          <Layout>
            <Home />
          </Layout>
        )}
      />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/verify-email/:token" component={VerifyEmail} />
      <Route path="/resend-verification" component={ResendVerification} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password/:token" component={ResetPassword} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        component={() => (
          <Layout>
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Layout>
        )}
      />

      <Route
        path="/admin"
        component={() => (
          <Layout>
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          </Layout>
        )}
      />

      {/* 404 route */}
      <Route
        path="*"
        component={() => (
          <Layout>
            <NotFound />
          </Layout>
        )}
      />
    </Router>
  );
}

export default App;
