/**
 * Signal Classification System
 * 
 * Classifies incoming signals to reduce noise and improve data quality.
 * Determines:
 * - entity_type: what kind of entity is this signal about?
 * - signal_type: what kind of content/event is this?
 * - topic: specific AI domain/category
 * - sentiment: positive/neutral/negative
 */

export type EntityType = 
  | 'tool'           // Specific AI tool/product (e.g., ChatGPT, Cursor)
  | 'framework'      // Library/framework (e.g., LangChain, LlamaIndex)
  | 'model'          // AI model (e.g., GPT-4, Claude, Llama)
  | 'company'        // Company/organization (e.g., OpenAI, Anthropic)
  | 'research'       // Research paper/academic work
  | 'ecosystem'      // General AI ecosystem news/discussion
  | 'tutorial'       // Tutorial/guide/how-to
  | 'unknown';

export type SignalType = 
  | 'release'        // Product release, version update
  | 'discussion'     // Discussion, opinion, analysis
  | 'tutorial'       // Tutorial, guide, how-to
  | 'news'           // News, announcement
  | 'showcase'       // Demo, showcase, use case
  | 'other';

export type Topic = 
  | 'llm'            // Large Language Models
  | 'coding'         // AI coding assistants
  | 'image'          // Image generation
  | 'video'          // Video generation
  | 'audio'          // Audio/music generation
  | 'agents'         // AI agents, autonomous systems
  | 'rag'            // RAG, embeddings, vector search
  | 'automation'     // Workflow automation
  | 'infrastructure' // AI infrastructure, deployment
  | 'research'       // Research, papers
  | 'general';       // General AI

export type Sentiment = 'positive' | 'neutral' | 'negative';

export interface ClassificationResult {
  entity_type: EntityType;
  signal_type: SignalType;
  topic: Topic;
  sentiment: Sentiment;
  confidence: number; // 0-1
  reasoning?: string; // For debugging
}

// Keywords for entity type detection
const TOOL_INDICATORS = [
  'app', 'platform', 'tool', 'assistant', 'copilot', 'editor', 
  'ide', 'extension', 'plugin', 'service', 'api', 'dashboard'
];

const FRAMEWORK_INDICATORS = [
  'library', 'framework', 'sdk', 'package', 'npm', 'pip',
  'langchain', 'llamaindex', 'haystack', 'semantic-kernel'
];

const MODEL_INDICATORS = [
  'model', 'gpt', 'claude', 'llama', 'mistral', 'gemini',
  'bert', 'transformer', 'diffusion', 'stable-diffusion',
  'weights', 'checkpoint', 'fine-tune', 'training'
];

const COMPANY_INDICATORS = [
  'openai', 'anthropic', 'google', 'microsoft', 'meta',
  'raises', 'funding', 'acquisition', 'ipo', 'valuation',
  'ceo', 'founder', 'company', 'startup', 'enterprise'
];

const RESEARCH_INDICATORS = [
  'paper', 'arxiv', 'research', 'study', 'analysis',
  'benchmark', 'evaluation', 'experiment', 'dataset',
  'published', 'journal', 'conference'
];

const TUTORIAL_INDICATORS = [
  'tutorial', 'guide', 'how to', 'how-to', 'learn',
  'course', 'lesson', 'walkthrough', 'step by step',
  'introduction to', 'getting started', 'build', 'create'
];

// Signal type keywords
const RELEASE_INDICATORS = [
  'release', 'launched', 'announcing', 'v1', 'v2', 'version',
  'update', 'new version', 'now available', 'just released',
  'beta', 'alpha', 'ga', 'stable'
];

const DISCUSSION_INDICATORS = [
  'discussion', 'thoughts', 'opinion', 'why', 'should you',
  'vs', 'comparison', 'review', 'experience', 'ama',
  'ask me', 'what do you think', 'debate'
];

const SHOWCASE_INDICATORS = [
  'built', 'made', 'created', 'demo', 'showcase',
  'using', 'with', 'powered by', 'my project',
  'show hn', 'check out'
];

// Topic keywords
const TOPIC_KEYWORDS: Record<Topic, string[]> = {
  llm: ['llm', 'gpt', 'claude', 'language model', 'chatbot', 'chat', 'prompt', 'completion'],
  coding: ['code', 'coding', 'copilot', 'cursor', 'windsurf', 'github copilot', 'codebase', 'programming', 'developer'],
  image: ['image', 'midjourney', 'dalle', 'stable diffusion', 'flux', 'img', 'picture', 'photo', 'visual'],
  video: ['video', 'sora', 'runway', 'pika', 'animation', 'film', 'movie'],
  audio: ['audio', 'music', 'voice', 'speech', 'tts', 'text-to-speech', 'sound', 'suno', 'udio'],
  agents: ['agent', 'autonomous', 'autogpt', 'babyagi', 'crew', 'multi-agent', 'agentic'],
  rag: ['rag', 'retrieval', 'embedding', 'vector', 'pinecone', 'weaviate', 'chromadb', 'semantic search'],
  automation: ['automation', 'workflow', 'zapier', 'n8n', 'make', 'automate', 'no-code'],
  infrastructure: ['infrastructure', 'deployment', 'hosting', 'cloud', 'kubernetes', 'docker', 'mlops', 'serving'],
  research: ['research', 'paper', 'arxiv', 'study', 'benchmark', 'evaluation'],
  general: []
};

// Sentiment keywords
const POSITIVE_KEYWORDS = [
  'amazing', 'awesome', 'great', 'excellent', 'impressive',
  'love', 'best', 'incredible', 'revolutionary', 'breakthrough',
  'game changer', 'finally', 'perfect', 'beautiful', 'powerful'
];

const NEGATIVE_KEYWORDS = [
  'bad', 'terrible', 'awful', 'disappointing', 'failed',
  'broken', 'bug', 'issue', 'problem', 'concern', 'worried',
  'worse', 'slow', 'expensive', 'limited', 'lacking'
];

/**
 * Classify a signal based on title, description, and source
 */
export function classifySignal(
  title: string,
  description: string | null,
  source: 'github' | 'hackernews' | 'producthunt' | 'reddit',
  url?: string | null
): ClassificationResult {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  // Detect entity type
  const entity_type = detectEntityType(text, url);
  
  // Detect signal type
  const signal_type = detectSignalType(text, source);
  
  // Detect topic
  const topic = detectTopic(text);
  
  // Detect sentiment
  const sentiment = detectSentiment(text);
  
  // Calculate confidence based on how many indicators matched
  const confidence = calculateConfidence(text, entity_type, signal_type, topic);
  
  return {
    entity_type,
    signal_type,
    topic,
    sentiment,
    confidence
  };
}

function detectEntityType(text: string, url?: string | null): EntityType {
  // Check URL patterns first (more reliable)
  if (url) {
    if (url.includes('github.com') && url.split('/').length >= 5) {
      // github.com/org/repo format - likely a tool or framework
      const hasLibraryKeywords = FRAMEWORK_INDICATORS.some(k => text.includes(k));
      return hasLibraryKeywords ? 'framework' : 'tool';
    }
    if (url.includes('arxiv.org') || url.includes('papers.')) {
      return 'research';
    }
    if (url.includes('huggingface.co/') && text.includes('model')) {
      return 'model';
    }
  }
  
  // Score each entity type
  const scores = {
    tool: countMatches(text, TOOL_INDICATORS),
    framework: countMatches(text, FRAMEWORK_INDICATORS),
    model: countMatches(text, MODEL_INDICATORS),
    company: countMatches(text, COMPANY_INDICATORS),
    research: countMatches(text, RESEARCH_INDICATORS),
    tutorial: countMatches(text, TUTORIAL_INDICATORS),
    ecosystem: 0,
    unknown: 0
  };
  
  // Get highest score
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore === 0) {
    // No specific indicators - classify as ecosystem or unknown
    return text.length > 50 ? 'ecosystem' : 'unknown';
  }
  
  const winner = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as EntityType;
  return winner || 'unknown';
}

function detectSignalType(text: string, source: string): SignalType {
  // GitHub repos are often releases or showcases
  if (source === 'github') {
    const hasShowcase = SHOWCASE_INDICATORS.some(k => text.includes(k));
    return hasShowcase ? 'showcase' : 'release';
  }
  
  // Score each signal type
  const scores = {
    release: countMatches(text, RELEASE_INDICATORS),
    discussion: countMatches(text, DISCUSSION_INDICATORS),
    tutorial: countMatches(text, TUTORIAL_INDICATORS),
    showcase: countMatches(text, SHOWCASE_INDICATORS),
    news: 0,
    other: 0
  };
  
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore === 0) {
    return 'other';
  }
  
  const winner = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as SignalType;
  return winner || 'other';
}

function detectTopic(text: string): Topic {
  let maxScore = 0;
  let bestTopic: Topic = 'general';
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const score = countMatches(text, keywords);
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic as Topic;
    }
  }
  
  return bestTopic;
}

function detectSentiment(text: string): Sentiment {
  const positiveCount = countMatches(text, POSITIVE_KEYWORDS);
  const negativeCount = countMatches(text, NEGATIVE_KEYWORDS);
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function countMatches(text: string, keywords: string[]): number {
  return keywords.filter(keyword => text.includes(keyword)).length;
}

function calculateConfidence(
  text: string,
  entity_type: EntityType,
  signal_type: SignalType,
  topic: Topic
): number {
  // Base confidence
  let confidence = 0.5;
  
  // Boost if we detected specific entity type
  if (entity_type !== 'unknown' && entity_type !== 'ecosystem') {
    confidence += 0.2;
  }
  
  // Boost if we detected specific signal type
  if (signal_type !== 'other') {
    confidence += 0.15;
  }
  
  // Boost if we detected specific topic
  if (topic !== 'general') {
    confidence += 0.15;
  }
  
  return Math.min(confidence, 1.0);
}

/**
 * Determine if a signal should be matched to a tool
 * Only entity_type 'tool', 'framework', or 'model' should attempt tool matching
 */
export function shouldAttemptToolMatch(entity_type: EntityType): boolean {
  return ['tool', 'framework', 'model'].includes(entity_type);
}

/**
 * Determine if a signal is high quality (worth keeping)
 */
export function isHighQualitySignal(classification: ClassificationResult): boolean {
  // Keep if confidence is high
  if (classification.confidence >= 0.7) return true;
  
  // Keep specific entity types even with lower confidence
  if (['tool', 'framework', 'model', 'research'].includes(classification.entity_type)) {
    return classification.confidence >= 0.5;
  }
  
  // Filter out low-confidence ecosystem noise
  if (classification.entity_type === 'ecosystem' && classification.confidence < 0.6) {
    return false;
  }
  
  return classification.confidence >= 0.5;
}
