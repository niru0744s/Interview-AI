const { OpenAI } = require("openai");
const crypto = require("crypto");
const AICache = require("../models/AICache");
const logger = require("../utils/logger");

let aiClient = null;

const getAIClient = () => {
  if (!process.env.AI_API_KEY) {
    throw new Error("Missing AI provider configuration");
  }

  if (!aiClient) {
    aiClient = new OpenAI({
      apiKey: process.env.AI_API_KEY,
      baseURL: "https://api.groq.com/openai/v1"
    });
  }

  return aiClient;
};

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
    const client = getAIClient();
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
    logger.error("AI failed to structure resume JSON", { message: err.message, stack: err.stack });
    return null; // Fallback to raw text if AI fails
  }
};

/**
 * Generate one interview question with structured format (conceptual, mcq, or code)
 */
exports.generateQuestion = async ({
  role,
  topic,
  difficulty,
  questionFormat = "blend",
  askedQuestions = [],
  resumeContent,
  resumeData,
  questionIndex = 0,
  totalQuestions = 10
}) => {
  // Determine target question type based on questionFormat and position
  let targetType = "conceptual";
  if (questionFormat === "mcq") {
    targetType = "mcq";
  } else if (questionFormat === "coding") {
    targetType = "code";
  } else if (questionFormat === "conceptual") {
    targetType = "conceptual";
  } else {
    // Dynamic Blend strategy:
    // Start with MCQ warm-ups, transition to code, balance with conceptual
    if (totalQuestions <= 5) {
      if (questionIndex === 0) targetType = "mcq";
      else if (questionIndex === 2) targetType = "code";
      else targetType = "conceptual";
    } else {
      if (questionIndex < 2) {
        targetType = "mcq";
      } else if (
        questionIndex >= Math.floor(totalQuestions * 0.4) &&
        questionIndex < Math.floor(totalQuestions * 0.4) + 2
      ) {
        targetType = "code";
      } else {
        targetType = "conceptual";
      }
    }
  }

  let systemPrompt = `
You are a senior technical interviewer conducting an interview for a ${role} position.
Specific topic: ${topic}.
Difficulty: ${difficulty}.
Target Question Type: ${targetType.toUpperCase()}.

You must output ONLY valid JSON in this exact structure:
{
  "type": "${targetType}",
  "question": "Question statement or coding problem description",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswers": ["Option A"],
  "codeTemplate": "// Starter code / component or function template",
  "language": "javascript"
}

Specific rules per type:
1. If type is "mcq":
   - "question" must be a concise, realistic multiple-choice technical question.
   - "options" MUST contain exactly 4 distinct, plausible technical options.
   - "correctAnswers" MUST contain exactly 1 correct option matching one of the items in "options".
   - "codeTemplate" must be null.
   - "language" must be null.

2. If type is "code":
   - "question" must clearly describe a practical coding challenge relevant to ${role} (e.g. React component/hook, Express route/middleware, database query, or utility algorithm). Include inputs, expected output, and edge cases.
   - "options" must be [].
   - "correctAnswers" must be [].
   - "codeTemplate" MUST provide clean starter code / function signature / component shell with TODO comments.
   - "language" should be "javascript" or "typescript".

3. If type is "conceptual":
   - "question" must test technical depth, trade-offs, architecture, or internal mechanics.
   - "options" must be [].
   - "correctAnswers" must be [].
   - "codeTemplate" must be null.
   - "language" must be null.
`;

  if (resumeData && typeof resumeData === 'object' && Object.keys(resumeData).length > 0) {
    systemPrompt += `
Candidate's structured resume data:
${JSON.stringify(resumeData, null, 2)}
Where possible, tailor the question to their background or tech stack.
`;
  } else if (resumeContent) {
    systemPrompt += `
Candidate's resume context:
${resumeContent}
`;
  }

  systemPrompt += `
General Rules:
- Ask exactly ONE question.
- Do NOT repeat previous questions.
- Return strictly valid JSON with no markdown wrapping or outer text.
`;

  const userPrompt = `
Previously asked questions:
${askedQuestions.length > 0 ? askedQuestions.join("\n") : "None (this is the first question)"}

Generate question #${questionIndex + 1} of ${totalQuestions} in ${targetType} format.
`;

  try {
    const client = getAIClient();
    const response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const rawContent = response.choices[0].message.content.trim();
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in question generator response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    const validatedType = ["conceptual", "mcq", "multi_choice", "code"].includes(parsed.type)
      ? parsed.type
      : targetType;

    return {
      questionId: `q_${Date.now()}`,
      type: validatedType,
      question: parsed.question || "Describe your approach to building reliable software applications.",
      options: Array.isArray(parsed.options) ? parsed.options : [],
      correctAnswers: Array.isArray(parsed.correctAnswers) ? parsed.correctAnswers : [],
      codeTemplate: parsed.codeTemplate || (validatedType === "code" ? "// Write your implementation here\n" : null),
      language: parsed.language || (validatedType === "code" ? "javascript" : null)
    };
  } catch (err) {
    logger.error("Failed to generate structured question", { message: err.message, stack: err.stack });
    // Safe fallback to conceptual question if JSON generation fails
    return {
      questionId: `q_${Date.now()}`,
      type: "conceptual",
      question: `Could you explain key architectural principles and best practices for ${topic} in a ${role} role?`,
      options: [],
      correctAnswers: [],
      codeTemplate: null,
      language: null
    };
  }
};

exports.evaluateAnswer = async ({
  role,
  question,
  answer,
  questionType = "conceptual",
  selectedOptions = [],
  code = "",
  language = "javascript",
  correctAnswers = []
}) => {
  const answerPayload = (questionType === "mcq" || questionType === "multi_choice")
    ? (Array.isArray(selectedOptions) ? selectedOptions.join(", ") : String(selectedOptions || ""))
    : (questionType === "code" ? (code || answer || "") : (answer || ""));

  const cacheKey = crypto.createHash('sha256')
    .update(`eval_${role}_${question}_${questionType}_${answerPayload}`)
    .digest('hex');

  // Check Cache
  const cached = await AICache.findOne({ key: cacheKey });
  if (cached) {
    console.log("AI Cache Hit: evaluation");
    return cached.value;
  }

  // 1. MCQ & Multi-Choice Evaluation: Deterministic grading
  if (questionType === "mcq" || questionType === "multi_choice") {
    const selected = Array.isArray(selectedOptions) ? selectedOptions : [selectedOptions].filter(Boolean);
    const correct = Array.isArray(correctAnswers) ? correctAnswers : [correctAnswers].filter(Boolean);

    const isMatch = selected.length > 0 && correct.some(c =>
      selected.some(s => s && s.trim().toLowerCase() === c.trim().toLowerCase())
    );

    const score = isMatch ? 10 : 0;
    const strengths = isMatch ? ["Selected the correct answer accurately."] : [];
    const missing_points = isMatch ? [] : [`Selected "${selected[0] || 'none'}" instead of the correct answer.`];
    const ideal_answer = correct[0] || "Correct option";

    const result = {
      score,
      strengths,
      missing_points,
      ideal_answer
    };

    await AICache.create({
      key: cacheKey,
      value: result,
      type: 'evaluation'
    }).catch(err => logger.error("Cache write error", { message: err.message }));

    return result;
  }

  // 2. Code Evaluation: Review code implementation without sandbox runner
  if (questionType === "code") {
    const systemPrompt = `
You are a senior technical interviewer reviewing a candidate's code submission for a ${role} interview.
Review the candidate's implementation for: ${question}

Evaluate based on:
1. Logic & Functional Correctness (does it solve the problem, handle React state/hooks or backend routes properly)
2. Architecture, Clean Code & Best Practices
3. Handling of Edge Cases & Error Boundaries
4. Performance & Complexity

Rules:
- Be strict, objective, and realistic.
- Return ONLY valid JSON in this exact format:
{
  "score": number (0-10),
  "strengths": string[],
  "missing_points": string[],
  "ideal_answer": string
}
`;

    const userPrompt = `
Problem: ${question}
Candidate Code Submission (${language || "javascript"}):
\`\`\`${language || "javascript"}
${code || answer}
\`\`\`
Candidate Additional Notes: ${answer || "None"}
`;

    try {
      const client = getAIClient();
      const response = await client.chat.completions.create({
        model: "openai/gpt-oss-20b",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("AI failed to return code evaluation JSON");
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.ideal_answer === undefined) parsed.ideal_answer = "Clean implementation covering core logic and edge cases.";
      if (!Array.isArray(parsed.strengths)) parsed.strengths = [];
      if (!Array.isArray(parsed.missing_points)) parsed.missing_points = [];
      if (typeof parsed.score !== "number") parsed.score = Number(parsed.score) || 0;

      await AICache.create({
        key: cacheKey,
        value: parsed,
        type: 'evaluation'
      }).catch(err => logger.error("Cache write error", { message: err.message }));

      return parsed;
    } catch (err) {
      logger.error("AI code evaluation failed", { message: err.message, stack: err.stack });
      throw new Error("AI evaluation failed. Please retry.");
    }
  }

  // 3. Conceptual Evaluation (Default)
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

  let response;
  try {
    const client = getAIClient();
    response = await client.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });
  } catch (apiErr) {
    logger.error("AI API call failed", { message: apiErr.message || String(apiErr) });
    throw new Error(`AI Provider Error: ${apiErr.message || "Unknown error"}. Please check API limits or status.`);
  }

  let content = response.choices[0].message.content;

  // Extract JSON using regex to handle potential markdown or preamble text
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    logger.error("No JSON found in AI response", { content });
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
    }).catch(err => logger.error("Cache write error", { message: err.message, stack: err.stack }));

    return parsed;
  } catch (err) {
    logger.error("AI response logic error", { message: err.message, stack: err.stack, content });
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

  const client = getAIClient();
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
