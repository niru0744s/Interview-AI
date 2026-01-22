// src/pages/Landing.jsx

import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Landing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (user) {
      navigate("/interviews");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md text-center space-y-6">
        <h1 className="text-3xl font-bold">AI Interview Partner</h1>
        <p className="text-muted-foreground">
          Practice real interview questions and receive structured AI feedback.
        </p>

        <Button size="lg" onClick={handlePrimaryAction}>
          Start Interview
        </Button>

        <p
          className="text-sm text-muted-foreground cursor-pointer underline"
          onClick={() => navigate("/interviews")}
        >
          Resume an existing interview
        </p>
      </div>
    </div>
  );
};

export default Landing;