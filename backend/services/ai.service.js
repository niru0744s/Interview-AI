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
  category = "technical",
  askedQuestions = [],
  resumeContent,
  resumeData,
  questionIndex = 0,
  totalQuestions = 10
}) => {
  const isBehavioral = category === "behavioral";

  // Determine target question type based on category, questionFormat, and position
  let targetType = "conceptual";
  if (isBehavioral) {
    if (questionFormat === "mcq") {
      targetType = "mcq";
    } else if (questionFormat === "conceptual") {
      targetType = "conceptual";
    } else {
      // Behavioral Blend: situational judgment MCQ warm-up, then rich STAR behavioral scenarios
      if (questionIndex === 0 || (totalQuestions > 5 && questionIndex === 1)) {
        targetType = "mcq";
      } else {
        targetType = "conceptual";
      }
    }
  } else {
    // Technical track
    if (questionFormat === "mcq") {
      targetType = "mcq";
    } else if (questionFormat === "coding") {
      targetType = "code";
    } else if (questionFormat === "conceptual") {
      targetType = "conceptual";
    } else {
      // Dynamic Blend strategy for technical:
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
  }

  let systemPrompt;
  if (isBehavioral) {
    let typeSpecificRules = "";
    if (targetType === "mcq") {
      typeSpecificRules = `
You must output ONLY valid JSON in this exact structure:
{
  "type": "mcq",
  "question": "Workplace situational judgment scenario",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswers": ["Option A"],
  "codeTemplate": null,
  "language": null
}

Rules:
- "question" must present a realistic workplace situational judgment scenario (e.g. cross-team disagreement, critical project delay, ethical dilemma, managing difficult stakeholders).
- "options" MUST contain exactly 4 distinct, plausible workplace actions.
- "correctAnswers" MUST contain exactly 1 most professional, constructive action matching an item in "options".
- "codeTemplate" must be null.
- "language" must be null.
`;
    } else {
      // conceptual
      typeSpecificRules = `
You must output ONLY valid JSON in this exact structure:
{
  "type": "conceptual",
  "question": "Open-ended behavioral scenario (STAR method)",
  "options": [],
  "correctAnswers": [],
  "codeTemplate": null,
  "language": null
}

Rules:
- "question" must be an open-ended behavioral scenario (prompting the candidate to use the STAR method: Situation, Task, Action, Result) regarding teamwork, communication, handling failure, conflict, or high-pressure situations.
- Strictly NO coding or technical syntax requests.
- "options" must be [].
- "correctAnswers" must be [].
- "codeTemplate" must be null.
- "language" must be null.
`;
    }

    systemPrompt = `
You are an Executive HR Director and Leadership Talent Partner conducting a professional Behavioral & Culture Fit interview for a ${role} position.
Specific Focus Area: ${topic}.
Seniority / Depth Level: ${difficulty}.
Required Format: ONLY ${targetType.toUpperCase()}.
${typeSpecificRules}
`;
  } else {
    // Technical track
    let typeSpecificRules = "";
    if (targetType === "mcq") {
      typeSpecificRules = `
You must output ONLY valid JSON in this exact structure:
{
  "type": "mcq",
  "question": "Concise, realistic multiple-choice technical question",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswers": ["Option A"],
  "codeTemplate": null,
  "language": null
}

Rules:
- "question" must be a concise, realistic multiple-choice technical question testing ${topic}.
- "options" MUST contain exactly 4 distinct, plausible technical options.
- "correctAnswers" MUST contain exactly 1 correct option matching one of the items in "options".
- "codeTemplate" must be null.
- "language" must be null.
`;
    } else if (targetType === "code") {
      typeSpecificRules = `
You must output ONLY valid JSON in this exact structure:
{
  "type": "code",
  "question": "Detailed coding challenge description with problem requirements, inputs, expected output, and edge cases",
  "options": [],
  "correctAnswers": [],
  "codeTemplate": "// Starter code / function template\\nfunction solution() {\\n  // TODO\\n}",
  "language": "javascript"
}

Rules:
- "question" must clearly describe a practical coding challenge relevant to ${role} and ${topic} (e.g. React component/hook, Express route/middleware, database query, or utility algorithm). Include inputs, expected output, and edge cases.
- "options" must be [].
- "correctAnswers" must be [].
- "codeTemplate" MUST provide clean starter code / function signature / component shell with TODO comments.
- "language" should be "javascript" or "typescript".
`;
    } else {
      // conceptual
      typeSpecificRules = `
You must output ONLY valid JSON in this exact structure:
{
  "type": "conceptual",
  "question": "In-depth technical conceptual / architectural question",
  "options": [],
  "correctAnswers": [],
  "codeTemplate": null,
  "language": null
}

Rules:
- "question" must test technical depth, trade-offs, architecture, or internal mechanics of ${topic}.
- Strictly NO multiple-choice options or code editor prompts.
- "options" must be [].
- "correctAnswers" must be [].
- "codeTemplate" must be null.
- "language" must be null.
`;
    }

    systemPrompt = `
You are a senior technical interviewer conducting an interview for a ${role} position.
Specific topic: ${topic}.
Difficulty: ${difficulty}.
Required Format: ONLY ${targetType.toUpperCase()}.
${typeSpecificRules}
`;
  }

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
- Ask exactly ONE question in ${targetType.toUpperCase()} format.
- Do NOT repeat previous questions.
- Return strictly valid JSON with no markdown wrapping or outer text.
`;

  const userPrompt = `
Previously asked questions:
${askedQuestions.length > 0 ? askedQuestions.join("\n") : "None (this is the first question)"}

Generate question #${questionIndex + 1} of ${totalQuestions} strictly in ${targetType} format.
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

    // Strictly enforce the targetType so model drift cannot alter the user's requested format
    const validatedType = targetType;

    let options = Array.isArray(parsed.options) ? parsed.options : [];
    let correctAnswers = Array.isArray(parsed.correctAnswers) ? parsed.correctAnswers : [];
    let codeTemplate = parsed.codeTemplate || null;
    let language = parsed.language || null;

    if (validatedType === "mcq") {
      if (options.length < 2) {
        options = [
          `Properly configure and apply ${topic} patterns`,
          `Optimize performance using asynchronous patterns`,
          `Implement automated testing and validation`,
          `Separate architectural boundaries into modular layers`
        ];
        correctAnswers = [options[0]];
      }
      codeTemplate = null;
      language = null;
    } else if (validatedType === "code") {
      options = [];
      correctAnswers = [];
      if (!codeTemplate) {
        codeTemplate = `// Problem: ${parsed.question || topic}\n// Implement your solution below\n\nfunction solution() {\n  // TODO\n}\n`;
      }
      if (!language) {
        language = "javascript";
      }
    } else {
      // conceptual
      options = [];
      correctAnswers = [];
      codeTemplate = null;
      language = null;
    }

    return {
      questionId: `q_${Date.now()}`,
      type: validatedType,
      question: parsed.question || (validatedType === "code"
        ? `Implement a robust function handling ${topic} for a ${role} application.`
        : `Could you explain key architectural principles and best practices for ${topic} in a ${role} role?`),
      options,
      correctAnswers,
      codeTemplate,
      language
    };
  } catch (err) {
    logger.error("Failed to generate structured question", { message: err.message, stack: err.stack });

    // Type-aware fallback ensures the question format always respects targetType
    if (targetType === "mcq") {
      const fallbackOptions = isBehavioral
        ? [
            "Actively listen to team members and organize a structured alignment meeting.",
            "Escalate immediately to senior leadership without consulting peers.",
            "Proceed with the initial plan regardless of team feedback.",
            "Postpone all related deliverables until consensus emerges naturally."
          ]
        : [
            `Utilize modular design and clear abstractions for ${topic}.`,
            `Bypass standard validation to maximize throughput.`,
            `Hardcode values directly into the runtime environment.`,
            `Disable error logging to conserve memory.`
          ];

      return {
        questionId: `q_${Date.now()}`,
        type: "mcq",
        question: isBehavioral
          ? `When encountering unexpected stakeholder disagreements regarding ${topic}, which course of action is most effective?`
          : `Which of the following represents the industry best practice when designing ${topic} solutions for a ${role}?`,
        options: fallbackOptions,
        correctAnswers: [fallbackOptions[0]],
        codeTemplate: null,
        language: null
      };
    }

    if (targetType === "code") {
      return {
        questionId: `q_${Date.now()}`,
        type: "code",
        question: `Write an efficient function or module in JavaScript/TypeScript demonstrating proper implementation of ${topic} for a ${role} system. Handle edge cases and optimize for maintainability.`,
        options: [],
        correctAnswers: [],
        codeTemplate: `/**\n * Solution for ${topic}\n * Role: ${role}\n */\nfunction solution(input) {\n  // Write your implementation here\n}\n\nmodule.exports = { solution };\n`,
        language: "javascript"
      };
    }

    // Default conceptual fallback
    return {
      questionId: `q_${Date.now()}`,
      type: "conceptual",
      question: isBehavioral
        ? `Describe a challenging situation in your career involving ${topic}. How did you assess the problem, what actions did you take, and what was the outcome?`
        : `Could you explain key architectural principles and best practices for ${topic} in a ${role} role?`,
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
  category = "technical",
  selectedOptions = [],
  code = "",
  language = "javascript",
  correctAnswers = []
}) => {
  const answerPayload = (questionType === "mcq" || questionType === "multi_choice")
    ? (Array.isArray(selectedOptions) ? selectedOptions.join(", ") : String(selectedOptions || ""))
    : (questionType === "code" ? (code || answer || "") : (answer || ""));

  const cacheKey = crypto.createHash('sha256')
    .update(`eval_${category}_${role}_${question}_${questionType}_${answerPayload}`)
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

  // 3. Conceptual / Behavioral Evaluation
  let systemPrompt;
  if (category === "behavioral") {
    systemPrompt = `
You are an Executive HR & Talent Director evaluating a candidate's behavioral interview response for a ${role} position.

Evaluate based on:
1. STAR Framework completeness (Situation, Task, Action taken, measurable/clear Result)
2. Professional maturity, accountability, and empathy
3. Conflict resolution, stakeholder management, and team collaboration
4. Clarity, structure, and communication effectiveness

Rules:
- Be objective, realistic, and constructive.
- Do NOT look for code or programming syntax. Focus purely on behavioral competency and soft skills.
- Return ONLY valid JSON in this exact format:
{
  "score": number (0-10),
  "strengths": string[],
  "missing_points": string[],
  "ideal_answer": string
}
`;
  } else {
    systemPrompt = `
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
  }

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
