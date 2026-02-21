const { OpenAI } = require("openai");
const crypto = require("crypto");
const AICache = require("../models/AICache");

const client = new OpenAI({
  apiKey: process.env.AI_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1'
});

/**
 * Parse raw resume text into structured JSON
 */
exports.structureResume = async (rawText) => {
  const systemPrompt = `
You are an expert resume parser. Extract the user data from the following raw resume text.
Clean the text by removing extra spaces, repeated headers, page numbers, and normalizing bullet points.

Return ONLY valid JSON in this exact format. If a field is missing, return an empty array/string:
{
  "name": "",
  "skills": [],
  "projects": [
    {
      "name": "",
      "techStack": [],
      "description": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "duration": "",
      "technologies": []
    }
  ],
  "education": []
}
`;

  const userPrompt = `Raw Resume Text:\n${rawText}`;

  try {
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error("AI failed to structure resume JSON:", err.message);
    return null; // Fallback to raw text if AI fails
  }
};

/**
 * Generate one interview question
 */
exports.generateQuestion = async ({ role, topic, difficulty, askedQuestions, resumeContent, resumeData }) => {
  let systemPrompt = `
You are a strict technical interviewer for a ${role} role.
The specific focus/topic for this part of the interview is: ${topic}.
`;

  if (resumeData && typeof resumeData === 'object' && Object.keys(resumeData).length > 0) {
    systemPrompt += `
The candidate's structured resume data is provided below. 
You must ask ONE SHORT AND DIRECT technical question based on their actual experience.
Do this by picking ONE skill and ONE project from the data.

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}
`;
  } else if (resumeContent) {
    systemPrompt += `
I have provided the candidate's raw resume/experience below. 
Use this context to tailor your questions to their actual background, projects, and skills where possible. 

RESUME CONTEXT:
${resumeContent}
`;
  }

  systemPrompt += `
Rules:
- Ask exactly ONE direct question.
- Do NOT ask multi-part questions (e.g., avoid "1. ..., 2. ..., 3. ...").
- Keep your question under 3 sentences.
- Focus strictly on ${topic}.
- No explanations or hints.
- Do not repeat previous questions.
- Difficulty: ${difficulty}
`;

  const userPrompt = `
Previously asked questions:
${askedQuestions.join("\n")}

Ask the next question.
`;

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.4
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
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2,
    response_format: { type: "json_object" }
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

    // Add fallback for missing fields when using smaller open-source models
    if (parsed.ideal_answer === undefined) parsed.ideal_answer = "No ideal answer provided by the AI.";
    if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
    if (!Array.isArray(parsed.missing_points)) parsed.missing_points = [];
    if (typeof parsed.score !== "number") parsed.score = Number(parsed.score) || 0;

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

exports.generateDetailedSummary = async ({ role, topic, questionsAndAnswers, status }) => {
  const systemPrompt = `
You are a senior technical hiring manager reviewing an interview session for a ${role} position.
The interview topic was: ${topic}.

Rules:
- Provide a professional, objective technical evaluation.
- Identify specific technical strengths based on their answers.
- Identify specific areas for improvement.
- Provide a final hiring verdict.

Return ONLY valid JSON in this exact format:
{
  "score": number (0-100 total based on average performace),
  "verdict": "hire" | "borderline" | "reject",
  "strengths": string[],
  "weaknesses": string[],
  "feedback": "Detailed paragraph of constructive feedback"
}
`;

  const userPrompt = `
Interview Status: ${status}
Transcript:
${questionsAndAnswers.map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}\nScore: ${qa.score}/10`).join("\n\n")}

Generate the detailed technical summary.
`;

  const response = await client.chat.completions.create({
    model: "openai/gpt-oss-20b",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.3,
    response_format: { type: "json_object" }
  });

  let content = response.choices[0].message.content;
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("AI failed to return summary JSON");

  return JSON.parse(jsonMatch[0]);
};