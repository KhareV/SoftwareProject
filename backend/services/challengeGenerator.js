import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MODEL = "llama-3.3-70b-versatile";

/**
 * Generate coding challenge questions using Groq AI
 * LeetCode-style practice platform
 */

// Difficulty levels and topics
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard"];
const TOPICS = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Recursion",
  "Sorting",
  "Searching",
  "Hash Tables",
  "Stack",
  "Queue",
  "Heap",
  "Backtracking",
  "Greedy",
  "Two Pointers",
  "Sliding Window",
  "Binary Search",
  "Bit Manipulation",
  "Math",
  "Design",
  "SQL",
  "System Design",
];

/**
 * Generate a coding challenge
 */
export async function generateCodingChallenge(
  difficulty,
  topic,
  language = "JavaScript"
) {
  const prompt = `Generate a ${difficulty} level coding challenge for the topic "${topic}" in ${language}.

Return a JSON object with:
{
  "title": "Challenge title",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "description": "Detailed problem description with examples",
  "examples": [
    {
      "input": "example input",
      "output": "expected output",
      "explanation": "why this output"
    }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "hints": ["hint 1", "hint 2", "hint 3"],
  "starterCode": "function skeleton code",
  "testCases": [
    {
      "input": "test input",
      "expectedOutput": "expected output",
      "hidden": false
    }
  ],
  "solution": "Complete working solution code",
  "solutionExplanation": "Step-by-step explanation of solution",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "tags": ["tag1", "tag2"],
  "companies": ["Company1", "Company2"]
}

Make it realistic like LeetCode problems. Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 4096,
    });

    const response = completion.choices[0]?.message?.content || "{}";
    let jsonText = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    const challenge = JSON.parse(jsonText);
    return {
      ...challenge,
      id: `${topic.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      createdAt: new Date().toISOString(),
      language,
    };
  } catch (error) {
    console.error("Challenge generation error:", error);
    throw error;
  }
}

/**
 * Evaluate user's solution
 */
export async function evaluateSolution(challenge, userCode, language) {
  const prompt = `You are a coding challenge evaluator.

Challenge: ${challenge.title}
Expected Solution Approach: ${challenge.solutionExplanation}

User's Code:
${userCode}

Language: ${language}

Evaluate the code and return JSON:
{
  "passed": true/false,
  "score": 0-100,
  "correctness": "Explanation of correctness",
  "timeComplexity": "Actual time complexity",
  "spaceComplexity": "Actual space complexity",
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "improvements": ["suggestion 1", "suggestion 2"],
  "testResults": [
    {
      "testCase": 1,
      "passed": true/false,
      "input": "...",
      "expectedOutput": "...",
      "actualOutput": "...",
      "error": "error if any"
    }
  ],
  "feedback": "Overall feedback"
}

Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 3096,
    });

    const response = completion.choices[0]?.message?.content || "{}";
    let jsonText = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Solution evaluation error:", error);
    throw error;
  }
}

/**
 * Get hint for challenge
 */
export async function getHint(challenge, currentCode, hintLevel = 1) {
  const prompt = `Provide a hint level ${hintLevel} (1=subtle, 2=moderate, 3=detailed) for this coding challenge:

Challenge: ${challenge.title}
Description: ${challenge.description}

User's current code:
${currentCode || "No code yet"}

Return JSON:
{
  "hintLevel": ${hintLevel},
  "hint": "Helpful hint without giving away solution",
  "approach": "General approach suggestion"
}

Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content || "{}";
    let jsonText = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Hint generation error:", error);
    throw error;
  }
}

/**
 * Generate similar challenges
 */
export async function generateSimilarChallenges(challenge, count = 3) {
  const challenges = [];

  for (let i = 0; i < count; i++) {
    try {
      const newChallenge = await generateCodingChallenge(
        challenge.difficulty,
        challenge.topic,
        challenge.language
      );
      challenges.push(newChallenge);
    } catch (error) {
      console.error(`Failed to generate similar challenge ${i + 1}:`, error);
    }
  }

  return challenges;
}

/**
 * Generate topic list for practice
 */
export function getTopics() {
  return TOPICS.map((topic) => ({
    name: topic,
    slug: topic.toLowerCase().replace(/\s+/g, "-"),
    difficulties: DIFFICULTY_LEVELS,
  }));
}

/**
 * Generate learning path
 */
export async function generateLearningPath(userLevel = "beginner", goals = []) {
  const prompt = `Create a structured learning path for a ${userLevel} programmer with goals: ${goals.join(
    ", "
  )}.

Return JSON:
{
  "path": [
    {
      "week": 1,
      "topic": "Topic name",
      "concepts": ["concept 1", "concept 2"],
      "challenges": 5,
      "difficulty": "Easy/Medium/Hard",
      "estimatedHours": 10
    }
  ],
  "totalWeeks": 12,
  "totalChallenges": 50,
  "milestones": ["milestone 1", "milestone 2"]
}

Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.6,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || "{}";
    let jsonText = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Learning path generation error:", error);
    throw error;
  }
}

/**
 * Explain solution
 */
export async function explainSolution(challenge) {
  const prompt = `Explain the solution to this coding challenge in simple terms:

Challenge: ${challenge.title}
Solution:
${challenge.solution}

Return JSON:
{
  "stepByStep": [
    {
      "step": 1,
      "description": "What this step does",
      "code": "Code snippet for this step"
    }
  ],
  "intuition": "Main idea behind the solution",
  "keyInsights": ["insight 1", "insight 2"],
  "commonMistakes": ["mistake 1", "mistake 2"],
  "variations": ["variation 1", "variation 2"]
}

Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL,
      temperature: 0.4,
      max_tokens: 2048,
    });

    const response = completion.choices[0]?.message?.content || "{}";
    let jsonText = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Solution explanation error:", error);
    throw error;
  }
}
