import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Interview from "../pages/Interview";
import RouteError from "../components/RouteError";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Interviews from "../pages/Interviews";
import Summary from "../pages/Summary";
import ReviewSession from "../pages/ReviewSession";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Landing />,
        errorElement: <RouteError />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/interviews",
        element: (<ProtectedRoute><Interviews /></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "/interview/:interviewId",
        element: (<ProtectedRoute><Interview /></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "/summary/:interviewId",
        element: (<ProtectedRoute><Summary /></ProtectedRoute>),
        errorElement: <RouteError />
    },
    {
        path: "/review/:interviewId",
        element: (<ProtectedRoute><ReviewSession /></ProtectedRoute>),
        errorElement: <RouteError />
    }
]);