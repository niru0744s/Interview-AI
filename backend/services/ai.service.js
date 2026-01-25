const { OpenAI } = require("openai");
const crypto = require("crypto");
const AICache = require("../models/AICache");

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://api.perplexity.ai'
});

/**
 * Generate one interview question
 */
exports.generateQuestion = async ({ role, topic, difficulty, askedQuestions, resumeContent }) => {
  const systemPrompt = `
You are a strict technical interviewer for a ${role} role.
The specific focus/topic for this part of the interview is: ${topic}.

${resumeContent ? `
I have provided the candidate's resume/experience below. 
Use this context to tailor your questions to their actual background, projects, and skills where possible. 
RESUME CONTEXT:
${resumeContent}
` : ""}

Rules:
- Ask ONE interview-level technical question strictly related to the topic: ${topic}.
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
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.4,
    // disable_search: true // Optional: check if sonar-small/large etc needs this
  });

  return {
    questionId: `q_${Date.now()}`,
    question: response.choices[0].message.content.trim()
  };
}

exports.evaluateAnswer = async ({ role, question, answer }) => {
  const cacheKey = crypto.createHash('sha256')
    .update(`eval_${role}_${question}_${answer}`)
    .digest('hex');

  // Check Cache
  const cached = await AICache.findOne({ key: cacheKey });
  if (cached) {
    console.log("AI Cache Hit: evaluation");
    return cached.value;
  }

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
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    // response_format: { type: "json_object" } // Sonic model support?
  });

  let content = response.choices[0].message.content;

  // Extract JSON using regex to handle potential markdown or preamble text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("No JSON found in AI response:", content);
    throw new Error("AI failed to return evaluation JSON");
  }
  content = jsonMatch[0];

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

  try {
    const parsed = JSON.parse(content);
    assertEvaluationShape(parsed);

    // Set Cache
    await AICache.create({
      key: cacheKey,
      value: parsed,
      type: 'evaluation'
    }).catch(err => console.error("Cache Write Error:", err));

    return parsed;
  } catch (err) {
    console.error("AI Response logic error:", err, "Content:", content);
    throw new Error("AI returned invalid evaluation format");
  }
};