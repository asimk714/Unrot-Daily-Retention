/**
 * Prisma seed file for Unrot Daily Retention Prototype.
 *
 * Populates the database with illustrative learning paths and lessons.
 * Run with: pnpm db:seed (requires a configured database connection)
 *
 * This file is syntactically valid and can be compiled without a database.
 */

import { prisma } from "../src/lib/prisma";

// ─── Seed Data ─────────────────────────────────────────────────────────────────

interface LessonContent {
  sections: { heading: string; body: string }[];
  example: { title: string; description: string };
  knowledgeCheck: { question: string; options: string[]; correctIndex: number };
}

interface SeedLesson {
  dayNumber: number;
  title: string;
  summary: string;
  durationMinutes: number;
  content: LessonContent;
}

interface SeedPath {
  title: string;
  description: string;
  role: string;
  goal: string;
  lessons: SeedLesson[];
}

const seedPaths: SeedPath[] = [
  // ── Path 1: AI for Product Managers ────────────────────────────────────────
  {
    title: "AI for Product Managers",
    description:
      "Build your AI fluency to evaluate opportunities, communicate with engineering, and ship AI-powered features confidently.",
    role: "product-manager",
    goal: "upskilling",
    lessons: [
      {
        dayNumber: 1,
        title: "What AI Can and Cannot Do",
        summary:
          "Understand the real capabilities and limitations of modern AI systems so you can set realistic expectations with stakeholders.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "Narrow AI vs General AI",
              body: "Today's AI systems are narrow: they excel at one specific task (image classification, text generation) but cannot transfer that skill to unrelated problems. General AI—a system that matches human flexibility—remains a research goal, not a product you can buy.",
            },
            {
              heading: "Where AI Excels",
              body: "AI works best when there is abundant labeled data, a clearly defined success metric, and tolerance for imperfect outputs. Pattern recognition, recommendation, and language understanding are strong use cases.",
            },
            {
              heading: "Common Pitfalls",
              body: "Watch for overpromising on accuracy, underestimating data requirements, and ignoring edge cases that affect fairness. Always ask: what happens when the model is wrong?",
            },
          ],
          example: {
            title: "Spam Filter",
            description:
              "Email spam filters are a classic narrow-AI success: millions of labeled examples, a clear metric (precision/recall), and users tolerate occasional mistakes.",
          },
          knowledgeCheck: {
            question:
              "Which characteristic makes a problem well-suited for AI?",
            options: [
              "The problem has no historical data",
              "The success metric is clearly defined and there is abundant labeled data",
              "The system must be 100% accurate to be useful",
              "The problem requires general common sense reasoning",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 2,
        title: "Reading an AI Product Brief",
        summary:
          "Learn to evaluate AI feature proposals by asking the right questions about data, metrics, and risk.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "The Data Question",
              body: "Before evaluating any AI proposal, ask: where does the training data come from, how much is available, and who labeled it? Without quality data, no model architecture can rescue the project.",
            },
            {
              heading: "Defining Success Metrics",
              body: "Insist on a quantitative metric (accuracy, F1, AUC) and a business metric (conversion lift, time saved). A model that scores well technically but moves no business needle is a failed experiment.",
            },
            {
              heading: "Risk and Fairness",
              body: "Every AI brief should include a section on failure modes: what happens when the model is wrong, which user groups are most affected, and what fallback exists.",
            },
          ],
          example: {
            title: "Content Recommendation Brief",
            description:
              "A brief proposing personalized article recommendations should specify: the click-through-rate baseline, the training data window, how cold-start users are handled, and how filter bubbles are mitigated.",
          },
          knowledgeCheck: {
            question: "What should you ask first when reading an AI brief?",
            options: [
              "Which framework the engineers will use",
              "Where the training data comes from and how much is available",
              "Whether the model uses deep learning or classical ML",
              "How much the cloud compute will cost",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 3,
        title: "Communicating AI Trade-offs",
        summary:
          "Frame precision vs recall and other trade-offs in business language your stakeholders understand.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "Precision vs Recall in Plain Language",
              body: "Precision answers 'of the items the model flagged, how many were correct?' Recall answers 'of all the correct items, how many did the model find?' Higher precision means fewer false alarms; higher recall means fewer missed cases.",
            },
            {
              heading: "Choosing the Right Trade-off",
              body: "For fraud detection, high recall is critical (missing fraud is costly). For content recommendations, high precision matters more (irrelevant suggestions annoy users). The business context determines the trade-off.",
            },
            {
              heading: "Presenting to Executives",
              body: "Replace jargon with scenarios: 'If we set the threshold here, we catch 95% of fraudulent transactions but 3% of legitimate ones get flagged for review.' Concrete numbers beat abstract metrics.",
            },
          ],
          example: {
            title: "Fraud Detection Dashboard",
            description:
              "A fintech PM presented two threshold options to the CFO: Option A catches 99% of fraud but blocks 8% of good transactions; Option B catches 92% of fraud but only blocks 1%. The CFO chose Option B because customer experience was the priority.",
          },
          knowledgeCheck: {
            question: "When is high recall more important than high precision?",
            options: [
              "When false positives are very costly",
              "When missing a positive case is very costly",
              "When the dataset is very small",
              "When the model is deployed on mobile devices",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 4,
        title: "Building an AI Roadmap",
        summary:
          "Plan AI features in phases: proof of concept, MVP, and production-grade—with clear go/no-go criteria at each stage.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "Phase 1: Proof of Concept",
              body: "Use a small, clean dataset to test whether the core AI capability is feasible. Budget two to four weeks. The goal is not a shippable product; it is a signal on whether to invest further.",
            },
            {
              heading: "Phase 2: MVP",
              body: "Integrate the model into the product behind a feature flag. Measure real user behavior, not just offline metrics. Define a kill switch: if the metric does not improve by X% within Y weeks, revert.",
            },
            {
              heading: "Phase 3: Production",
              body: "Harden the pipeline: monitoring, retraining schedule, data drift detection, and incident response. Most AI projects fail here because teams underestimate operational overhead.",
            },
          ],
          example: {
            title: "Smart Search Rollout",
            description:
              "A SaaS team shipped smart search in three phases: a two-week PoC using 10K queries, a four-week MVP with 5% of users, and a full rollout with automated retraining every Sunday. The kill criterion was: revert if search-to-click rate drops below the keyword baseline.",
          },
          knowledgeCheck: {
            question: "What is the primary goal of a proof-of-concept phase?",
            options: [
              "Ship a feature to all users as quickly as possible",
              "Determine whether the core AI capability is feasible",
              "Optimize the model for maximum accuracy",
              "Set up production monitoring and alerting",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 5,
        title: "Evaluating AI Vendor Proposals",
        summary:
          "Ask the right questions when an AI vendor pitches you—covering data ownership, model transparency, and total cost.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "Data Ownership and Privacy",
              body: "Clarify who owns the data you send to the vendor's API. Does the vendor use your data to improve their models? Is data stored or deleted after processing? These questions have legal and competitive implications.",
            },
            {
              heading: "Model Transparency",
              body: "Ask for benchmark results on a dataset similar to yours, not just a public leaderboard score. Request a trial where you evaluate the model on your own data with your own metrics.",
            },
            {
              heading: "Total Cost of Ownership",
              body: "Factor in API costs at projected volume, integration engineering time, ongoing monitoring, and switching costs. A vendor that is cheap today but locks you in can become expensive at scale.",
            },
          ],
          example: {
            title: "NLP API Evaluation",
            description:
              "A team evaluated three NLP APIs for customer ticket classification. They ran 5,000 real tickets through each, measured accuracy per category, and calculated cost at 100K tickets/month. The cheapest API had the worst accuracy on their edge cases, so they chose the mid-priced option.",
          },
          knowledgeCheck: {
            question:
              "Why should you request a trial on your own data instead of relying on public benchmarks?",
            options: [
              "Public benchmarks are always fabricated",
              "Your data distribution may differ significantly from the benchmark dataset",
              "Vendors do not provide public benchmark results",
              "Trials are always free of charge",
            ],
            correctIndex: 1,
          },
        },
      },
    ],
  },

  // ── Path 2: AI for Software Engineers ──────────────────────────────────────
  {
    title: "AI for Software Engineers",
    description:
      "Deepen your technical understanding of AI systems—from embeddings and model serving to prompt engineering and evaluation.",
    role: "software-engineer",
    goal: "upskilling",
    lessons: [
      {
        dayNumber: 1,
        title: "Embeddings and Vector Search",
        summary:
          "Understand how text and images are converted to vectors and why vector similarity is the backbone of modern search and recommendation.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "What Are Embeddings?",
              body: "An embedding model maps an input (text, image, audio) to a fixed-length vector of floating-point numbers. Semantically similar inputs land close together in this vector space, enabling similarity-based retrieval without keyword matching.",
            },
            {
              heading: "Vector Databases",
              body: "Storing and querying millions of vectors efficiently requires specialized indexes (HNSW, IVF). Libraries like FAISS and databases like pgvector, Pinecone, and Weaviate provide approximate nearest-neighbor search at scale.",
            },
            {
              heading: "Practical Considerations",
              body: "Choose an embedding model whose training data matches your domain. Monitor embedding drift: as your content evolves, embeddings generated by a frozen model may lose relevance. Re-embed periodically or fine-tune.",
            },
          ],
          example: {
            title: "Semantic Search with pgvector",
            description:
              "A team added semantic search to their docs site by: (1) embedding each paragraph with an open-source model, (2) storing vectors in a pgvector column, and (3) running cosine-similarity queries. Search quality improved 40% over keyword search.",
          },
          knowledgeCheck: {
            question: "What is the primary advantage of embedding-based search over keyword search?",
            options: [
              "It requires no database",
              "It matches on semantic meaning rather than exact words",
              "It is always faster than keyword search",
              "It does not require any pre-trained models",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 2,
        title: "Prompt Engineering Fundamentals",
        summary:
          "Write effective prompts for large language models using structure, examples, and constraints.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "Anatomy of a Good Prompt",
              body: "A strong prompt includes: a role ('You are a technical reviewer'), context (the relevant information), a clear task ('Summarize the following in three bullet points'), and constraints ('Use no more than 50 words per bullet').",
            },
            {
              heading: "Few-Shot Prompting",
              body: "Provide two or three input-output examples before the actual task. This grounds the model's behavior in your expected format and style, dramatically reducing formatting errors.",
            },
            {
              heading: "Handling Edge Cases",
              body: "Add explicit instructions for unknown or ambiguous inputs: 'If the text does not contain enough information, respond with INSUFFICIENT_DATA.' This prevents confident-sounding hallucinations.",
            },
          ],
          example: {
            title: "Structured Data Extraction",
            description:
              "A team extracted product attributes from unstructured descriptions by prompting: 'Extract the following fields as JSON: name, color, size, price. If a field is missing, set it to null.' They included two examples and achieved 94% accuracy.",
          },
          knowledgeCheck: {
            question: "What is the purpose of few-shot examples in a prompt?",
            options: [
              "To train the model on new data",
              "To ground the model's output format and behavior",
              "To increase the model's parameter count",
              "To reduce the API cost per request",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 3,
        title: "Model Evaluation for Engineers",
        summary:
          "Set up offline and online evaluation pipelines to know whether your AI feature is actually working.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "Offline Evaluation",
              body: "Build a test set of at least 200 labeled examples that represent your production distribution. Compute precision, recall, and F1. Track these metrics in CI so regressions are caught before deployment.",
            },
            {
              heading: "Online Evaluation",
              body: "Offline metrics do not capture user behavior. Use A/B tests or interleaved experiments to measure business metrics: click-through rate, time-to-resolution, or user satisfaction scores.",
            },
            {
              heading: "Evaluation Pitfalls",
              body: "Beware of data leakage (test data appearing in training), label noise (inconsistent human annotations), and metric gaming (optimizing a proxy that diverges from the real objective).",
            },
          ],
          example: {
            title: "CI-Integrated Model Tests",
            description:
              "A chatbot team ran their model against 300 golden Q&A pairs on every pull request. If accuracy dropped below 88%, the PR was blocked. This caught a prompt regression that would have degraded answers for 15% of users.",
          },
          knowledgeCheck: {
            question: "Why is offline evaluation alone insufficient?",
            options: [
              "Offline evaluation is too expensive",
              "It does not capture real user behavior and business impact",
              "Offline test sets are always too small",
              "Online evaluation is always more accurate",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 4,
        title: "Serving Models in Production",
        summary:
          "Choose between API-based, self-hosted, and edge deployment—and understand latency, cost, and reliability trade-offs.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "API-Based Serving",
              body: "Using a managed API (OpenAI, Anthropic, Google) is the fastest path to production. Trade-offs: you depend on the provider's uptime, pricing, and data-handling policies. Good for prototyping and moderate-volume use cases.",
            },
            {
              heading: "Self-Hosted Serving",
              body: "Frameworks like vLLM and TGI let you serve open-weight models on your own GPUs. You gain full control over data and latency but accept operational overhead: scaling, monitoring, and model updates.",
            },
            {
              heading: "Edge and On-Device",
              body: "For latency-sensitive or offline use cases, smaller quantized models can run directly on user devices. ONNX Runtime and TensorFlow Lite enable this. The constraint is model size: larger models require cloud.",
            },
          ],
          example: {
            title: "Hybrid Serving Strategy",
            description:
              "A health-tech startup used a cloud API for complex diagnostic queries but ran a small on-device model for real-time symptom auto-complete. This balanced accuracy (cloud) with responsiveness (edge).",
          },
          knowledgeCheck: {
            question:
              "When is self-hosted model serving most appropriate?",
            options: [
              "When you need the fastest possible time to production",
              "When data privacy, cost control, and latency require full ownership",
              "When you have no GPU infrastructure",
              "When the model is very small and simple",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 5,
        title: "Retrieval-Augmented Generation",
        summary:
          "Combine vector retrieval with language model generation to build accurate, grounded AI features.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "The RAG Pattern",
              body: "Retrieval-Augmented Generation (RAG) works in two steps: (1) retrieve relevant documents from a vector store based on the user query, and (2) feed those documents as context to a language model that generates the final answer. This grounds the model in your data.",
            },
            {
              heading: "Chunking and Indexing",
              body: "Split your documents into semantically meaningful chunks (paragraphs, sections). Overlap chunks slightly to avoid losing context at boundaries. Index chunks with their embeddings and metadata (source, date, section title).",
            },
            {
              heading: "Evaluating RAG Quality",
              body: "Measure retrieval quality (are the right chunks returned?) separately from generation quality (is the answer faithful to the retrieved context?). Use metrics like context relevance, faithfulness, and answer correctness.",
            },
          ],
          example: {
            title: "Internal Knowledge Bot",
            description:
              "An engineering team built an internal Q&A bot by indexing 5,000 Confluence pages into pgvector. When an engineer asks a question, the top 5 chunks are retrieved and passed to a language model. The bot cites its sources, and 82% of answers were rated helpful.",
          },
          knowledgeCheck: {
            question:
              "What is the main benefit of RAG over using a language model alone?",
            options: [
              "RAG models are smaller and cheaper to run",
              "RAG grounds the model's responses in your specific data, reducing hallucination",
              "RAG eliminates the need for a vector database",
              "RAG does not require any prompt engineering",
            ],
            correctIndex: 1,
          },
        },
      },
    ],
  },

  // ── Path 3: AI for General Professionals ───────────────────────────────────
  {
    title: "AI for General Professionals",
    description:
      "Develop practical AI literacy to use AI tools effectively, evaluate AI claims critically, and make informed decisions at work.",
    role: "general",
    goal: "staying-current",
    lessons: [
      {
        dayNumber: 1,
        title: "How AI Assistants Actually Work",
        summary:
          "Demystify chatbots and AI assistants: understand what happens between your input and the response you see.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "Pattern Matching, Not Thinking",
              body: "AI assistants predict the most likely next word based on patterns learned from vast amounts of text. They do not understand meaning or have beliefs. This is why they can be fluent yet factually wrong.",
            },
            {
              heading: "The Training Process",
              body: "Models are trained in two phases: pre-training on large text datasets (books, websites) to learn language patterns, and fine-tuning with human feedback to make responses helpful, harmless, and honest.",
            },
            {
              heading: "Limitations to Remember",
              body: "AI assistants have a knowledge cutoff date, can confidently state incorrect facts (hallucination), and lack real-world experience. Always verify critical information from primary sources.",
            },
          ],
          example: {
            title: "Email Drafting",
            description:
              "Using an AI assistant to draft a client email works well for tone and structure, but you should always verify any facts, dates, or commitments it includes before sending.",
          },
          knowledgeCheck: {
            question: "Why can AI assistants sound confident but be wrong?",
            options: [
              "They are programmed to lie",
              "They predict likely words based on patterns, not factual verification",
              "They have access to all information in real time",
              "They understand the meaning of every word they generate",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 2,
        title: "Writing Effective AI Prompts at Work",
        summary:
          "Get better results from AI tools by providing clear context, specific instructions, and useful constraints.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "Be Specific",
              body: "Instead of 'Write a report,' say 'Write a 500-word summary of Q3 sales trends for the leadership team, using bullet points and focusing on the three biggest changes from Q2.' Specificity drives quality.",
            },
            {
              heading: "Provide Context",
              body: "Paste relevant background information, data, or previous versions into your prompt. The AI cannot read your mind or access your company's internal systems unless you give it the information.",
            },
            {
              heading: "Iterate and Refine",
              body: "Treat your first prompt as a draft. If the output is not right, ask the AI to adjust: 'Make it more concise,' 'Add data from this table,' or 'Change the tone to be more formal.'",
            },
          ],
          example: {
            title: "Meeting Summary",
            description:
              "Paste your meeting notes and ask: 'Summarize this meeting in five bullet points. For each action item, list the owner and deadline. Flag any unresolved decisions.' This structure produces immediately useful output.",
          },
          knowledgeCheck: {
            question: "What is the most effective way to improve AI output quality?",
            options: [
              "Use the most expensive AI model available",
              "Provide specific context, clear instructions, and constraints",
              "Keep prompts as short as possible",
              "Avoid giving the AI any examples",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 3,
        title: "Evaluating AI Claims Critically",
        summary:
          "Develop a checklist for assessing whether an AI product or feature delivers real value or just hype.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "The Hype Checklist",
              body: "When someone claims 'AI-powered,' ask: (1) What specific task does the AI do? (2) How was it tested? (3) What happens when it is wrong? (4) Is there a non-AI baseline to compare against? Many 'AI features' are simple rule-based systems with a modern label.",
            },
            {
              heading: "Understanding Accuracy Claims",
              body: "An accuracy number is meaningless without context. '95% accurate' on what data? Measured how? Does 5% error mean 5% of the time it slightly misses, or 5% of the time it causes a critical failure? Always ask for the denominator.",
            },
            {
              heading: "Bias and Fairness",
              body: "AI systems can encode biases from their training data. Ask whether the system has been tested across different demographic groups, languages, or use cases. A system that works well for one group but poorly for another may create liability.",
            },
          ],
          example: {
            title: "Resume Screening Tool",
            description:
              "A vendor claims their AI resume screener is '90% accurate.' You should ask: accurate compared to what baseline? Tested on which candidate pool? Does it perform equally across gender, ethnicity, and educational background?",
          },
          knowledgeCheck: {
            question:
              "What is the first question to ask when evaluating an 'AI-powered' product?",
            options: [
              "How many parameters does the model have?",
              "What specific task does the AI perform and how was it tested?",
              "Which programming language was it built in?",
              "How much does the subscription cost?",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 4,
        title: "AI and Data Privacy at Work",
        summary:
          "Understand what data you should and should not share with AI tools, and how to protect sensitive information.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "What Not to Share",
              body: "Never paste passwords, API keys, personally identifiable information (PII), confidential financial data, or trade secrets into a public AI tool. Assume that anything you type could be logged, reviewed, or used for training.",
            },
            {
              heading: "Enterprise vs Consumer AI",
              body: "Enterprise AI plans typically offer data isolation, no training on your inputs, and compliance certifications (SOC 2, GDPR). If your company uses a consumer AI tier, treat it as a public channel.",
            },
            {
              heading: "Practical Guidelines",
              body: "Anonymize data before using AI (replace names with placeholders, redact account numbers). Use your company's approved AI tools. When in doubt, check with your IT or legal team before pasting sensitive content.",
            },
          ],
          example: {
            title: "Safe Data Analysis",
            description:
              "Instead of pasting a raw customer spreadsheet into an AI tool, export a version with names replaced by 'Customer A, B, C' and account numbers removed. You still get useful analysis without exposing PII.",
          },
          knowledgeCheck: {
            question:
              "What should you do before using a consumer AI tool with work data?",
            options: [
              "Nothing, consumer AI tools are always safe for business use",
              "Anonymize sensitive information and check your company's AI policy",
              "Only use the free tier, which is more private",
              "Ask the AI tool to promise not to store your data",
            ],
            correctIndex: 1,
          },
        },
      },
      {
        dayNumber: 5,
        title: "Building Your AI Learning Habit",
        summary:
          "Create a sustainable daily practice for staying current with AI developments without feeling overwhelmed.",
        durationMinutes: 5,
        content: {
          sections: [
            {
              heading: "The Five-Minute Rule",
              body: "Commit to just five minutes of AI learning per day. Read one article, try one prompt experiment, or watch one short explainer. Consistency beats intensity: daily practice builds durable knowledge.",
            },
            {
              heading: "Curate Your Sources",
              body: "Follow two or three high-quality sources rather than dozens. Look for sources that explain implications, not just announce products. Filter for depth over volume.",
            },
            {
              heading: "Apply What You Learn",
              body: "After learning something new, immediately try to apply it. Use a new prompting technique on a real work task, or explain a concept to a colleague. Active use cements learning far better than passive reading.",
            },
          ],
          example: {
            title: "Daily AI Routine",
            description:
              "A marketing manager spends five minutes each morning reading one AI article and then tries to apply one idea during the workday—such as using an AI tool to draft social copy or analyze campaign data. After one month, she reported feeling confident discussing AI in strategy meetings.",
          },
          knowledgeCheck: {
            question: "What is the most effective way to retain AI knowledge?",
            options: [
              "Read as many articles as possible in one sitting",
              "Memorize technical terminology and definitions",
              "Apply new concepts to real tasks immediately after learning them",
              "Wait until you have a full day free for deep study",
            ],
            correctIndex: 2,
          },
        },
      },
    ],
  },
];

// ─── Seeding Logic ─────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding Unrot Daily database...\n");

  for (const path of seedPaths) {
    const learningPath = await prisma.learningPath.create({
      data: {
        title: path.title,
        description: path.description,
        role: path.role,
        goal: path.goal,
        lessons: {
          create: path.lessons.map((lesson) => ({
            dayNumber: lesson.dayNumber,
            title: lesson.title,
            summary: lesson.summary,
            durationMinutes: lesson.durationMinutes,
            contentJson: JSON.stringify(lesson.content),
          })),
        },
      },
    });

    console.log(
      `  ✓ Created path: "${learningPath.title}" with ${path.lessons.length} lessons`
    );
  }

  console.log("\n✅ Seeding complete.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
