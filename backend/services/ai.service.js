// import OpenAI from "openai";
const { OpenAI } = require("openai");

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://api.perplexity.ai'
});

/**
 * Generate one interview question
 */
exports.generateQuestion = async({ role, difficulty, askedQuestions })=> {
  const systemPrompt = `
You are a strict technical interviewer for a ${role} role.

Rules:
- Ask ONE interview-level technical question
- No explanations
- No hints
- Do not repeat previous questions
- Difficulty: ${difficulty}
`;

  const userPrompt = `
Previously asked questions:
${askedQuestions.join("\n")}

Ask the next question.
`;

  const response = await client.chat.completions.create({
    model: "sonar",
    contents: "You Are an AI Interviewer",
    messages:[
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.4,
    disable_search: true
  });

  return response;
}

exports.evaluateAnswer = async({ role, question, answer }) => {
  const systemPrompt = `
You are a strict technical interviewer evaluating a candidate.

Evaluate based on:
1. Correctness
2. Depth
3. Clarity

Rules:
- Be objective and strict
- No encouragement
- No teaching tone
- Real interview standards

Return ONLY valid JSON in this exact format:
{
  "score": number (0-10),
  "strengths": string[],
  "missing_points": string[],
  "ideal_answer": string
}
`;

  const userPrompt = `
Role: ${role}
Question: ${question}
Candidate Answer: ${answer}
`;

  const response = await client.chat.completions.create({
    model: "sonar",
    contents:"You are an AI Interviewer",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    disable_search: true,
    response_format: { type: "text" }
  });

  function assertEvaluationShape(obj) {
  if (
    typeof obj.score !== "number" ||
    obj.score < 0 ||
    obj.score > 10 ||
    !Array.isArray(obj.strengths) ||
    !Array.isArray(obj.missing_points) ||
    typeof obj.ideal_answer !== "string"
  ) {
    throw new Error("Invalid evaluation schema");
  }
}

  let content = response.choices[0].message.content;
  assertEvaluationShape(content);
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error("AI returned invalid JSON");
  }
};