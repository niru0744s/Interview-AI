const mongoose = require("mongoose");
const newSchema = mongoose.Schema({
    email:{
        type:String,
        unique:true,
        required:true,
    },
    password:{
        type:String,
        required:true,
    }
},{
    timestamps:true
});

const User = mongoose.model("User",newSchema);
module.exports = User;