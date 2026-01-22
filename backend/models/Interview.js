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
        enum:["in_progress","quit","Completed"],
        required:true,
        default:"in_progress"
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
    },
    summaryGenerated: {
        type: Boolean,
        default: false
    }
},{
    timestamps:true,
});

const Interview = mongoose.model("Interview",newSchema);
module.exports = Interview;