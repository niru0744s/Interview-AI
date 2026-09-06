const { startInterview, nextQuestion, submitAnswer, skipQuestion } = require("../services/interview.service");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const logger = require("../utils/logger");

exports.initSocket = (io) => {

    io.use((socket, next) => {
        try {
            const cookies = cookie.parse(socket.handshake.headers.cookie || "");
            const token = cookies.token || socket.handshake.auth?.token;

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
        logger.info("Socket client connected", { socketId: socket.id, userId: socket.userId });

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
                const question = await nextQuestion(interviewId, socket.userId);
                socket.emit("question", { question });
            } catch (error) {
                socket.emit("error", error.message);
            }
        });

        socket.on("submit_answer", async ({ interviewId, answer, selectedOptions, code, language }, callback) => {
            try {
                const evaluation = await submitAnswer(interviewId, socket.userId, {
                    answer,
                    selectedOptions,
                    code,
                    language
                });

                if (typeof callback === "function") {
                    callback({ status: "ok" });
                }

                if (evaluation.interviewCompleted) {
                    socket.emit("interview_completed", evaluation);
                } else {
                    const nextQ = await nextQuestion(interviewId, socket.userId);
                    socket.emit("question", { question: nextQ });
                }
            } catch (error) {
                logger.error("Submit answer socket error", {
                    socketId: socket.id,
                    userId: socket.userId,
                    message: error.message,
                    stack: error.stack
                });
                if (typeof callback === "function") {
                    callback({ status: "error", message: error.message });
                }
                socket.emit("error", error.message || "Failed to process answer");
            }
        });

        socket.on("skip_question", async ({ interviewId }) => {
            try {
                const result = await skipQuestion(interviewId, socket.userId);

                // If we are already processing a question (race condition check)
                // Just return and let the existing process finish
                if (result.alreadyProcessing) {
                    console.log("Skip ignored: already processing next question for", interviewId);
                    return;
                }

                if (result.interviewCompleted) {
                    socket.emit("interview_completed");
                } else {
                    const nextQ = await nextQuestion(interviewId, socket.userId);
                    socket.emit("question", { question: nextQ });
                }
            } catch (error) {
                logger.error("Skip question socket error", {
                    socketId: socket.id,
                    userId: socket.userId,
                    message: error.message,
                    stack: error.stack
                });
                socket.emit("error", error.message || "Failed to skip question");
            }
        });

        socket.on("disconnect", () => {
            logger.info("Socket client disconnected", { socketId: socket.id, userId: socket.userId });
        });

        socket.on("error", (err) => {
            logger.error("Socket client error", { socketId: socket.id, userId: socket.userId, error: err });
        });
    });
};
