const { startInterview, nextQuestion, submitAnswer } = require("../services/interview.service");
const jwt = require("jsonwebtoken");

exports.initSocket = (io) => {

    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.userId = decoded.userId;

            next();
        } catch (err) {
            next(new Error("Unauthorized"));
        }
    });


    io.on("connection", socket => {
        console.log("Client connected:", socket.id);

        socket.on("start_interview", async ({ role, totalQuestions }) => {
            const userId = socket.userId;
            try {
                const interview = await startInterview({
                    userId,
                    role,
                    totalQuestions: totalQuestions ? parseInt(totalQuestions) : 10
                });
                socket.emit("interview_started", {
                    interviewId: interview._id
                });
            } catch (error) {
                socket.emit("error", error.message);
            }
        });

        socket.on("next_question", async ({ interviewId }) => {
            try {
                const question = await nextQuestion(interviewId);
                socket.emit("question", { question });
            } catch (error) {
                socket.emit("error", error.message);
            }
        });

        socket.on("submit_answer", async ({ interviewId, answer }, callback) => {
            // ACK immediately to allow frontend to show "Thinking..." state
            if (typeof callback === "function") {
                callback({ status: "ok" });
            }

            try {
                // Perform slow AI evaluation
                const evaluation = await submitAnswer(interviewId, answer);
                socket.emit("evaluation", evaluation);

                if (evaluation.interviewCompleted) {
                    socket.emit("interview_completed", evaluation);
                } else {
                    // Automatically trigger and emit the next question
                    const nextQ = await nextQuestion(interviewId);
                    socket.emit("question", { question: nextQ });
                }
            } catch (error) {
                console.error("Submit Answer Error:", error);
                socket.emit("error", error.message || "Failed to process answer");
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
    });
}