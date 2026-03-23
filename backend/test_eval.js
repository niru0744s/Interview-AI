require('dotenv').config();
const mongoose = require('mongoose');
const Interview = require('./models/Interview');
const ai = require('./services/ai.service');

async function run() {
    await mongoose.connect(process.env.MONGO_URL);
    try {
        const interview = await Interview.findOne({ status: 'in_progress', currentQuestion: { $type: "string" } }).sort({createdAt: -1});
        if(!interview) return console.log('No active interview');
        console.log('Found Interview:', interview._id, 'Role:', interview.role);
        console.log('Q:', interview.currentQuestion);
        const res = await ai.evaluateAnswer({
            role: interview.role,
            question: interview.currentQuestion,
            answer: 'test'
        });
        console.log("EVALUATION SUCCESS:", res);
    } catch(e) {
        console.error('EVAL ERROR:', e);
    } finally {
        await mongoose.disconnect();
    }
}
run();
