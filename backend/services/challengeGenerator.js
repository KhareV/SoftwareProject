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
 * Generate a high-quality coding challenge with enhanced AI
 */
export async function generateCodingChallenge(
  difficulty,
  topic,
  language = "JavaScript"
) {
  const prompt = `Generate a professional, interview-grade ${difficulty} level coding challenge for the topic "${topic}" in ${language}.

Requirements:
- Create a unique, realistic problem similar to FAANG company interviews
- Include clear problem statement with multiple examples
- Provide comprehensive test cases including edge cases
- Add progressive hints that don't give away the solution
- Include optimal solution with detailed explanation
- Specify complexity analysis

Return a JSON object with:
{
  "title": "Engaging, clear challenge title",
  "difficulty": "${difficulty}",
  "topic": "${topic}",
  "description": "Detailed problem description (2-4 paragraphs) with context, requirements, and what to return",
  "realWorldContext": "Brief explanation of where this problem applies in real software development",
  "examples": [
    {
      "input": "specific example input with data structure",
      "output": "expected output",
      "explanation": "detailed step-by-step explanation of how to get this output"
    },
    {
      "input": "different example",
      "output": "expected output",
      "explanation": "explanation"
    },
    {
      "input": "edge case example",
      "output": "expected output",
      "explanation": "why this edge case matters"
    }
  ],
  "constraints": [
    "specific constraint with numbers (e.g., 1 <= n <= 10^5)",
    "data type constraints",
    "time/space constraints",
    "input validation requirements"
  ],
  "hints": [
    "subtle hint pointing to general approach",
    "hint about data structure to consider",
    "hint about algorithm pattern",
    "more specific hint without revealing solution"
  ],
  "starterCode": "Well-commented function skeleton with parameter types and return type",
  "testCases": [
    {
      "input": "test input",
      "expectedOutput": "expected output",
      "hidden": false,
      "description": "what this tests"
    },
    {
      "input": "edge case input",
      "expectedOutput": "expected output",
      "hidden": true,
      "description": "edge case description"
    }
  ],
  "solution": "Complete, optimal solution with inline comments explaining key steps",
  "solutionExplanation": "Comprehensive explanation with: 1) Intuition, 2) Approach, 3) Algorithm steps, 4) Why this is optimal",
  "timeComplexity": "O(...) with explanation",
  "spaceComplexity": "O(...) with explanation",
  "alternativeSolutions": [
    {
      "approach": "Alternative approach name",
      "timeComplexity": "O(...)",
      "spaceComplexity": "O(...)",
      "pros": "Advantages",
      "cons": "Disadvantages"
    }
  ],
  "tags": ["specific algorithm pattern", "data structure", "technique"],
  "companies": ["Real companies that ask similar questions"],
  "relatedTopics": ["topic1", "topic2", "topic3"],
  "difficulty_rating": ${
    difficulty === "Easy" ? "1-3" : difficulty === "Medium" ? "4-7" : "8-10"
  },
  "estimatedTimeMinutes": ${
    difficulty === "Easy"
      ? "15-20"
      : difficulty === "Medium"
      ? "25-35"
      : "40-60"
  }
}

Make it professional, educational, and interview-realistic like LeetCode/HackerRank problems. Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert software engineering interviewer from a top tech company. Create challenging, realistic coding problems that test both algorithmic thinking and practical programming skills.",
        },
        { role: "user", content: prompt },
      ],
      model: MODEL,
      temperature: 0.7,
      max_tokens: 5096,
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
 * Evaluate user's solution with enhanced AI analysis
 */
export async function evaluateSolution(challenge, userCode, language) {
  const prompt = `You are an expert coding challenge evaluator and mentor with deep knowledge of algorithms, data structures, and best practices.

Challenge: ${challenge.title}
Difficulty: ${challenge.difficulty}
Topic: ${challenge.topic}
Expected Solution Approach: ${challenge.solutionExplanation}
Expected Time Complexity: ${challenge.timeComplexity}
Expected Space Complexity: ${challenge.spaceComplexity}

User's Code:
\`\`\`${language.toLowerCase()}
${userCode}
\`\`\`

Language: ${language}

Perform a comprehensive evaluation with:
1. Code correctness and functionality analysis
2. Algorithm efficiency comparison
3. Code quality and style assessment
4. Edge case handling
5. Best practices compliance
6. Performance optimization opportunities
7. Alternative approach suggestions

Return JSON:
{
  "passed": true/false,
  "score": 0-100,
  "correctness": "Detailed explanation of correctness with specific references to code",
  "timeComplexity": "Actual analyzed time complexity (e.g., O(n²))",
  "spaceComplexity": "Actual analyzed space complexity (e.g., O(n))",
  "efficiencyRating": "Optimal/Good/Average/Poor",
  "codeQualityScore": 0-100,
  "strengths": ["specific strength 1 with line reference", "specific strength 2"],
  "weaknesses": ["specific weakness 1 with explanation", "specific weakness 2"],
  "improvements": [
    {
      "category": "Performance/Readability/Logic",
      "suggestion": "Specific improvement",
      "impact": "High/Medium/Low",
      "example": "Code example if applicable"
    }
  ],
  "edgeCasesHandled": ["edge case 1", "edge case 2"],
  "edgeCasesMissed": ["missed edge case 1", "missed edge case 2"],
  "alternativeApproaches": [
    {
      "approach": "Approach name",
      "description": "Brief description",
      "complexity": "Time/Space complexity",
      "tradeoffs": "Pros and cons"
    }
  ],
  "bestPractices": {
    "followed": ["practice 1", "practice 2"],
    "violated": ["violation 1 with explanation", "violation 2"]
  },
  "testResults": [
    {
      "testCase": 1,
      "passed": true/false,
      "input": "...",
      "expectedOutput": "...",
      "actualOutput": "...",
      "executionTime": "estimated time",
      "error": "error if any"
    }
  ],
  "feedback": "Comprehensive, encouraging feedback with actionable insights",
  "nextSteps": ["what to study next", "related topics to explore"],
  "comparisionWithOptimal": "How does this compare to the optimal solution?"
}

Be thorough, specific, and educational. Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert programming instructor and code reviewer. Provide detailed, constructive, and educational feedback that helps developers improve.",
        },
        { role: "user", content: prompt },
      ],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 4096,
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
 * Get progressive, context-aware hint for challenge
 */
export async function getHint(challenge, currentCode, hintLevel = 1) {
  const hintDescriptions = {
    1: "Very subtle - just point in the right direction",
    2: "Moderate - suggest data structures or patterns",
    3: "Detailed - explain approach but not full implementation",
  };

  const prompt = `You are a helpful coding mentor. Provide a hint level ${hintLevel} (${
    hintDescriptions[hintLevel]
  }) for this coding challenge.

Challenge: ${challenge.title}
Difficulty: ${challenge.difficulty}
Topic: ${challenge.topic}
Description: ${challenge.description}

User's current code:
\`\`\`
${currentCode || "No code written yet - user is stuck at the starting point"}
\`\`\`

Analyze their progress and provide an appropriate hint:
- Level 1: Ask a guiding question or suggest what to think about
- Level 2: Suggest specific data structures, patterns, or approaches
- Level 3: Provide detailed approach with pseudocode or algorithm steps

Return JSON:
{
  "hintLevel": ${hintLevel},
  "hint": "Progressive hint based on their current code and hint level",
  "approach": "General direction without revealing solution",
  "codeAnalysis": "What they've tried so far (if code exists) and what's missing",
  "suggestedDataStructure": "Data structure that might help (if level 2+)",
  "algorithmPattern": "Algorithm pattern to consider (if level 2+)",
  "pseudocode": "High-level pseudocode (only if level 3)",
  "relatedConcept": "Related concept to review if stuck",
  "encouragement": "Encouraging message about their progress"
}

Be supportive and educational. Guide them to discover the solution rather than giving it away. Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a patient, encouraging coding mentor who helps students learn by asking good questions and providing progressive hints.",
        },
        { role: "user", content: prompt },
      ],
      model: MODEL,
      temperature: 0.5,
      max_tokens: 1536,
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
 * Explain solution with detailed educational breakdown
 */
export async function explainSolution(challenge) {
  const prompt = `Provide a comprehensive, educational explanation of the optimal solution to this coding challenge.

Challenge: ${challenge.title}
Difficulty: ${challenge.difficulty}
Topic: ${challenge.topic}
Description: ${challenge.description}

Optimal Solution:
\`\`\`
${challenge.solution}
\`\`\`

Expected Complexity:
- Time: ${challenge.timeComplexity}
- Space: ${challenge.spaceComplexity}

Return JSON:
{
  "intuition": "2-3 sentences explaining the core idea and why this approach works",
  "visualExplanation": "Describe how to visualize this problem (e.g., 'Think of it as...')",
  "stepByStep": [
    {
      "step": 1,
      "title": "Step title",
      "description": "Detailed explanation of what happens",
      "code": "Relevant code snippet for this step",
      "visualization": "How to visualize this step"
    }
  ],
  "keyInsights": [
    "Critical insight that makes this solution work",
    "Important observation about the problem structure",
    "Why other approaches won't work as well"
  ],
  "algorithmPattern": "Name of the algorithm pattern used (e.g., Two Pointers, Dynamic Programming)",
  "dataStructureChoice": "Why specific data structures were chosen",
  "complexityAnalysis": {
    "timeComplexity": "Detailed breakdown of time complexity",
    "spaceComplexity": "Detailed breakdown of space complexity",
    "worstCase": "Explanation of worst case scenario",
    "bestCase": "Explanation of best case scenario"
  },
  "commonMistakes": [
    {
      "mistake": "Common mistake description",
      "why": "Why people make this mistake",
      "consequence": "What goes wrong"
    }
  ],
  "optimization": {
    "canOptimizeFurther": true/false,
    "optimization": "How to optimize if possible",
    "tradeoff": "What you trade for optimization"
  },
  "variations": [
    {
      "variation": "Problem variation",
      "howToAdapt": "How to modify solution for this variation"
    }
  ],
  "practiceAdvice": "What to practice to master this pattern",
  "relatedProblems": ["Similar problem 1", "Similar problem 2"],
  "interviewTips": [
    "Tip 1 for explaining this in an interview",
    "Tip 2 for writing this efficiently"
  ]
}

Make it educational and thorough, like a great teacher explaining the solution. Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert computer science educator who excels at breaking down complex algorithms into understandable steps. Make learning enjoyable and insights memorable.",
        },
        { role: "user", content: prompt },
      ],
      model: MODEL,
      temperature: 0.4,
      max_tokens: 3096,
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

/**
 * AI Code Review - Get personalized feedback on any code
 */
export async function getPersonalizedCodeReview(
  code,
  language,
  focusArea = null
) {
  const prompt = `Perform a detailed, personalized code review as an expert mentor.

Code:
\`\`\`${language.toLowerCase()}
${code}
\`\`\`

Language: ${language}
${focusArea ? `Focus Area: ${focusArea}` : ""}

Provide comprehensive feedback covering:
1. Code quality and readability
2. Best practices compliance
3. Performance optimization opportunities
4. Potential bugs or edge cases
5. Design patterns and architecture
6. Security concerns
7. Testing recommendations

Return JSON:
{
  "overallRating": "Excellent/Good/Fair/Needs Improvement",
  "score": 0-100,
  "summary": "2-3 sentence summary of code quality",
  "strengths": [
    {
      "aspect": "What's done well",
      "details": "Specific examples from code",
      "lineNumbers": [1, 2, 3]
    }
  ],
  "improvements": [
    {
      "category": "Performance/Readability/Security/Logic",
      "issue": "What needs improvement",
      "why": "Why this matters",
      "suggestion": "Specific recommendation",
      "priority": "High/Medium/Low",
      "codeExample": "Improved code snippet"
    }
  ],
  "bugs": [
    {
      "description": "Potential bug",
      "severity": "Critical/High/Medium/Low",
      "location": "Where in code",
      "fix": "How to fix"
    }
  ],
  "edgeCases": ["Edge case 1 to consider", "Edge case 2"],
  "bestPractices": {
    "followed": ["Practice 1", "Practice 2"],
    "missing": ["Missing practice 1", "Missing practice 2"]
  },
  "designSuggestions": [
    {
      "pattern": "Design pattern name",
      "benefit": "How it would improve code",
      "application": "Where to apply it"
    }
  ],
  "testingRecommendations": [
    "Test case 1 to add",
    "Test case 2 to add"
  ],
  "learningResources": [
    {
      "topic": "Topic to study",
      "reason": "Why it's relevant to this code"
    }
  ],
  "encouragement": "Positive, motivating feedback"
}

Be thorough, specific, and constructive. Help the developer grow. Return ONLY valid JSON, no markdown.`;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a senior software engineer and mentor who provides detailed, constructive code reviews that help developers improve their skills.",
        },
        { role: "user", content: prompt },
      ],
      model: MODEL,
      temperature: 0.3,
      max_tokens: 4096,
    });

    const response = completion.choices[0]?.message?.content || "{}";
    let jsonText = response
      .trim()
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "");

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Code review error:", error);
    throw error;
  }
}
