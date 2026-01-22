import { useRouteError, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

const RouteError = () =>{
    const error = useRouteError();
    const navigate = useNavigate();
    console.error("Route error:",error);

    return(
        <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground">
          An unexpected error occurred. Please try again.
        </p>
        <Button onClick={() => navigate("/")}>
          Go to Home
        </Button>
      </div>
    </div>
    )
};

export default RouteError;