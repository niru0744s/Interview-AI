import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { logout } = useAuth();

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await api.get("/interviews");
                const data = Array.isArray(res.data)
                    ? res.data
                    : Array.isArray(res.data?.data)
                        ? res.data.data
                        : [];
                setInterviews(data);
            } catch (err) {
                alert("Failed to load interviews");
                setInterviews([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, []);

    const handleStartNew = async () => {
        try {
            const res = await api.post("/interviews/start");
            navigate(`/interview/${res.data.interviewId}`);
        } catch (err) {
            alert("Failed to start interview");
        }
    };

    const handleAction = (interview) => {
        if (interview.status === "in_progress") {
            navigate(`/interview/${interview._id}`);
        } else {
            navigate(`/summary/${interview._id}`);
        }
    };

    if (loading) {
        return <div className="p-6">Loading interviews...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Your Interviews</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={logout}>
                        Logout
                    </Button>
                    <Button onClick={handleStartNew}>
                        Start New Interview
                    </Button>
                </div>
            </div>

            {Array.isArray(interviews) && interviews.length > 0 ? (
                <ul className="space-y-3">
                    {interviews.map((interview, index) => (
                        <li key={interview._id} className="flex justify-between items-center border rounded p-4">
                            <div>
                                <p className="font-medium">Interview #{index + 1}</p>
                                <p className="text-sm text-muted-foreground">
                                    Status: {interview.status}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => handleAction(interview)}
                            >
                                {interview.status === "in_progress" ? "Resume" : "View"}
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-muted-foreground">No interviews found.</p>
            )}
        </div>
    );
};

export default Interviews;
