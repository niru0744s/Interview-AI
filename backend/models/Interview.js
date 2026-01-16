const mongoose = require("mongoose");
const newSchema = mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    role:{
        type:String,
        enum:["React Developer","MERN Stack Developer","Backend Developer"],
        required:true,
    },
    status:{
        type:String,
        enum:["in_progress","Completed"],
        required:true,
    },
    endedReason:{
        type:String,
    },
    currentQuestionIndex:{
        type:Number,
        default:0
    },
    totalScore:{
        type:Number,
        default:0,
    },
    finalSummary: {
        averageScore: Number,
        strengths: [String],
        weaknesses: [String]
    }
},{
    timestamps:true,
});

const Interview = mongoose.model("Interview",newSchema);
module.exports = Interview;