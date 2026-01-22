import { createBrowserRouter } from "react-router-dom";
import Login from "@/pages/Login";
import Landing from "@/pages/Landing";
import ProtectedRoute from "@/components/ProtectedRoute";
import Interviews from "@/pages/Interviews";
import RouteError from "@/components/RouteError";
import Interview from "@/pages/Interview";
import Summary from "@/pages/Summary";

export const router = createBrowserRouter([
  { 
    path: "/login", 
    element: <Login />,
    errorElement:<RouteError/>
  },
  {
    path:"/", 
    element:<Landing/>,
    errorElement:<RouteError/>
  },
  {
    path: "/interviews",
    element: (
      <ProtectedRoute>
        <Interviews/>
      </ProtectedRoute>
    ),
    errorElement:<RouteError/>
  },{
    path:"/interview/:interviewId",
    element:(
        <ProtectedRoute>
            <Interview/>
        </ProtectedRoute>
    ),
    errorElement:<RouteError/>
  },{
    path:"/summary/:interviewId",
    element:(
        <ProtectedRoute>
            <Summary/>
        </ProtectedRoute>
    ),
    errorElement:<RouteError/>
  }
]);
