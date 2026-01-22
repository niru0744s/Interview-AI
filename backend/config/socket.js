const {startInterview,nextQuestion,submitAnswer} = require("../services/interview.service");
const jwt = require("jsonwebtoken");

exports.initSocket = (io) =>{

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
        
        socket.on("start_interview", async({role}) =>{
            const userId = socket.userId;
            try {
                const interview = await startInterview({userId, role});
                socket.emit("interview_started",{
                    interviewId: interview._id
                });
            } catch (error) {
                socket.emit("error",error.message);
            }
        });

        socket.on("next_question", async({interviewId}) =>{
            try {
                const question = await nextQuestion(interviewId);
                socket.emit("question",{question});
            } catch (error) {
                socket.emit("error",err.message);
            }
        });

        socket.on("submit_answer", async({interviewId, answer})=>{
            try {
                const evaluation = await submitAnswer({interviewId, answer});
                socket.emit("evaluation", evaluation);

                if(evaluation.interviewComplated) {
                    socket.emit("interview_completed", evaluation);
                }
            } catch (error) {
                socket.emit("error", err.message);
            }
        });

        socket.on("disconnect", ()=>{
            console.log("Client disconnected", socket.id);
        });
    });
}