import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Interview from "../pages/Interview";
import RouteError from "../components/RouteError";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Interviews from "../pages/Interviews";
import Summary from "../pages/Summary";
import ReviewSession from "../pages/ReviewSession";
import RecruiterDashboard from "../pages/RecruiterDashboard";
import InvitePage from "../pages/InvitePage";
import JobResults from "../pages/JobResults";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Settings from "../pages/Settings";

import Layout from "../components/Layout";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />,
        errorElement: <RouteError />
    },
    {
        path: "/invite/:code",
        element: <Layout><InvitePage /></Layout>
    },
    {
        path: "/recruiter",
        element: (<ProtectedRoute role="recruiter"><Layout><RecruiterDashboard /></Layout></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "/job/:templateId/results",
        element: (<ProtectedRoute role="recruiter"><Layout><JobResults /></Layout></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "/login",
        element: <Layout><Login /></Layout>
    },
    {
        path: "/signup",
        element: <Layout><Signup /></Layout>
    },
    {
        path: "/verify-email",
        element: <Layout><VerifyEmail /></Layout>
    },
    {
        path: "/forgot-password",
        element: <Layout><ForgotPassword /></Layout>,
        errorElement: <RouteError />
    },
    {
        path: "/reset-password",
        element: <Layout><ResetPassword /></Layout>,
        errorElement: <RouteError />
    },
    {
        path: "/settings",
        element: <Layout><Settings /></Layout>,
        errorElement: <RouteError />
    },

    {
        path: "/interviews",
        element: (<ProtectedRoute role="candidate"><Layout><Interviews /></Layout></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "/interview/:interviewId",
        element: (<ProtectedRoute><Interview /></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "/summary/:interviewId",
        element: (<ProtectedRoute><Layout><Summary /></Layout></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "/review/:interviewId",
        element: (<ProtectedRoute><Layout><ReviewSession /></Layout></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "*",
        element: <Navigate to="/" replace />
    }
]);
