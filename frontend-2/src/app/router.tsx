import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import RouteError from "../components/RouteError";
import Layout from "../components/Layout";

const Landing = lazy(() => import("../pages/Landing"));
const Login = lazy(() => import("../pages/Login"));
const Signup = lazy(() => import("../pages/Signup"));
const Interviews = lazy(() => import("../pages/Interviews"));
const Interview = lazy(() => import("../pages/Interview"));
const Summary = lazy(() => import("../pages/Summary"));
const ReviewSession = lazy(() => import("../pages/ReviewSession"));
const RecruiterDashboard = lazy(() => import("../pages/RecruiterDashboard"));
const InvitePage = lazy(() => import("../pages/InvitePage"));
const JobResults = lazy(() => import("../pages/JobResults"));
const VerifyEmail = lazy(() => import("../pages/VerifyEmail"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const Settings = lazy(() => import("../pages/Settings"));
const Pricing = lazy(() => import("../pages/Pricing"));

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={null}>{element}</Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<Landing />),
    errorElement: <RouteError />
  },
  {
    path: "/invite/:code",
    element: withSuspense(<Layout><InvitePage /></Layout>)
  },
  {
    path: "/recruiter",
    element: withSuspense(<ProtectedRoute role="recruiter"><Layout><RecruiterDashboard /></Layout></ProtectedRoute>),
    errorElement: <RouteError />
  },
  {
    path: "/job/:templateId/results",
    element: withSuspense(<ProtectedRoute role="recruiter"><Layout><JobResults /></Layout></ProtectedRoute>),
    errorElement: <RouteError />
  },
  {
    path: "/login",
    element: withSuspense(<Layout><Login /></Layout>)
  },
  {
    path: "/signup",
    element: withSuspense(<Layout><Signup /></Layout>)
  },
  {
    path: "/verify-email",
    element: withSuspense(<Layout><VerifyEmail /></Layout>)
  },
  {
    path: "/forgot-password",
    element: withSuspense(<Layout><ForgotPassword /></Layout>),
    errorElement: <RouteError />
  },
  {
    path: "/reset-password",
    element: withSuspense(<Layout><ResetPassword /></Layout>),
    errorElement: <RouteError />
  },
  {
    path: "/settings",
    element: withSuspense(<Layout><Settings /></Layout>),
    errorElement: <RouteError />
  },
  {
    path: "/pricing",
    element: withSuspense(<Layout><Pricing /></Layout>),
    errorElement: <RouteError />
  },
  {
    path: "/interviews",
    element: withSuspense(<ProtectedRoute role="candidate"><Layout><Interviews /></Layout></ProtectedRoute>),
    errorElement: <RouteError />
  },
  {
    path: "/interview/:interviewId",
    element: withSuspense(<ProtectedRoute><Interview /></ProtectedRoute>),
    errorElement: <RouteError />
  },
  {
    path: "/summary/:interviewId",
    element: withSuspense(<ProtectedRoute><Layout><Summary /></Layout></ProtectedRoute>),
    errorElement: <RouteError />
  },
  {
    path: "/review/:interviewId",
    element: withSuspense(<ProtectedRoute><Layout><ReviewSession /></Layout></ProtectedRoute>),
    errorElement: <RouteError />
  },
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);
