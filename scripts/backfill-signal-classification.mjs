#!/usr/bin/env node

/**
 * Backfill Signal Classification
 * 
 * Classifies existing signals that don't have entity_type/classification data.
 * This improves data quality and reduces noise.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Classification logic (duplicated from src/lib/classification.ts for script independence)
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

const TOPIC_KEYWORDS = {
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

function countMatches(text, keywords) {
  return keywords.filter(keyword => text.includes(keyword)).length;
}

function detectEntityType(text, url) {
  if (url) {
    if (url.includes('github.com') && url.split('/').length >= 5) {
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
  
  const maxScore = Math.max(...Object.values(scores));
  
  if (maxScore === 0) {
    return text.length > 50 ? 'ecosystem' : 'unknown';
  }
  
  const winner = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
  return winner || 'unknown';
}

function detectSignalType(text, source) {
  if (source === 'github') {
    const hasShowcase = SHOWCASE_INDICATORS.some(k => text.includes(k));
    return hasShowcase ? 'showcase' : 'release';
  }
  
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
  
  const winner = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0];
  return winner || 'other';
}

function detectTopic(text) {
  let maxScore = 0;
  let bestTopic = 'general';
  
  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    const score = countMatches(text, keywords);
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic;
    }
  }
  
  return bestTopic;
}

function detectSentiment(text) {
  const positiveCount = countMatches(text, POSITIVE_KEYWORDS);
  const negativeCount = countMatches(text, NEGATIVE_KEYWORDS);
  
  if (positiveCount > negativeCount) return 'positive';
  if (negativeCount > positiveCount) return 'negative';
  return 'neutral';
}

function calculateConfidence(text, entity_type, signal_type, topic) {
  let confidence = 0.5;
  
  if (entity_type !== 'unknown' && entity_type !== 'ecosystem') {
    confidence += 0.2;
  }
  
  if (signal_type !== 'other') {
    confidence += 0.15;
  }
  
  if (topic !== 'general') {
    confidence += 0.15;
  }
  
  return Math.min(confidence, 1.0);
}

function classifySignal(title, description, source, url) {
  const text = `${title} ${description || ''}`.toLowerCase();
  
  const entity_type = detectEntityType(text, url);
  const signal_type = detectSignalType(text, source);
  const topic = detectTopic(text);
  const sentiment = detectSentiment(text);
  const confidence = calculateConfidence(text, entity_type, signal_type, topic);
  
  return {
    entity_type,
    signal_type,
    topic,
    sentiment,
    classification_confidence: confidence
  };
}

async function backfillClassification() {
  console.log('🔍 Fetching signals without classification...\n');
  
  // Fetch signals that don't have entity_type
  const { data: signals, error } = await supabase
    .from('signals')
    .select('id, title, description, source, url')
    .is('entity_type', null)
    .order('created_at', { ascending: false })
    .limit(500); // Process in batches
  
  if (error) {
    console.error('Error fetching signals:', error);
    process.exit(1);
  }
  
  if (!signals || signals.length === 0) {
    console.log('✅ No signals to classify. All done!');
    return;
  }
  
  console.log(`📊 Found ${signals.length} signals to classify\n`);
  
  let updated = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const signal of signals) {
    try {
      const classification = classifySignal(
        signal.title,
        signal.description,
        signal.source,
        signal.url
      );
      
      const { error: updateError } = await supabase
        .from('signals')
        .update({
          entity_type: classification.entity_type,
          signal_type: classification.signal_type,
          topic: classification.topic,
          sentiment: classification.sentiment,
          classification_confidence: classification.classification_confidence
        })
        .eq('id', signal.id);
      
      if (updateError) {
        console.error(`❌ Error updating signal ${signal.id}:`, updateError.message);
        errors++;
      } else {
        updated++;
        if (updated % 10 === 0) {
          console.log(`✓ Classified ${updated}/${signals.length} signals...`);
        }
      }
    } catch (err) {
      console.error(`❌ Error classifying signal ${signal.id}:`, err.message);
      errors++;
    }
  }
  
  console.log('\n📈 Backfill Summary:');
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);
  
  // Show classification distribution
  console.log('\n📊 Classification Distribution:');
  const { data: stats } = await supabase
    .from('signals')
    .select('entity_type, count')
    .not('entity_type', 'is', null);
  
  if (stats) {
    const distribution = {};
    for (const row of stats) {
      distribution[row.entity_type] = (distribution[row.entity_type] || 0) + 1;
    }
    
    Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`   ${type.padEnd(15)}: ${count}`);
      });
  }
}

backfillClassification()
  .then(() => {
    console.log('\n✅ Backfill complete!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n❌ Backfill failed:', err);
    process.exit(1);
  });
