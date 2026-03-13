-- =============================================
-- TOOL CATALOG EXPANSION
-- =============================================
-- Adds 30+ popular AI tools to improve match rate
-- Includes comprehensive aliases for better entity resolution

-- First, let's add the new tools
-- We'll use INSERT ... ON CONFLICT DO NOTHING to avoid duplicates

-- LLM & Chat Tools
INSERT INTO tools (name, slug, description, category_id, pricing, website, github_url) VALUES
  ('Gemini', 'gemini', 'Google''s multimodal AI model and chat interface', (SELECT id FROM categories WHERE slug='llm' LIMIT 1), 'freemium', 'https://gemini.google.com', NULL),
  ('Llama', 'llama', 'Meta''s open-source large language model family', (SELECT id FROM categories WHERE slug='llm' LIMIT 1), 'open-source', 'https://llama.meta.com', 'https://github.com/meta-llama/llama'),
  ('Mistral', 'mistral', 'Open-source LLM with strong performance', (SELECT id FROM categories WHERE slug='llm' LIMIT 1), 'open-source', 'https://mistral.ai', 'https://github.com/mistralai/mistral-src'),
  ('Grok', 'grok', 'xAI''s conversational AI assistant', (SELECT id FROM categories WHERE slug='llm' LIMIT 1), 'paid', 'https://x.ai', NULL),
  ('Pi', 'pi', 'Inflection AI''s personal intelligence assistant', (SELECT id FROM categories WHERE slug='llm' LIMIT 1), 'free', 'https://pi.ai', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Coding Assistants
INSERT INTO tools (name, slug, description, category_id, pricing, website, github_url) VALUES
  ('Codeium', 'codeium', 'Free AI-powered code completion and chat', (SELECT id FROM categories WHERE slug='coding' LIMIT 1), 'freemium', 'https://codeium.com', NULL),
  ('Tabnine', 'tabnine', 'AI code completion for developers', (SELECT id FROM categories WHERE slug='coding' LIMIT 1), 'freemium', 'https://tabnine.com', NULL),
  ('Replit', 'replit', 'AI-powered collaborative coding platform', (SELECT id FROM categories WHERE slug='coding' LIMIT 1), 'freemium', 'https://replit.com', NULL),
  ('Bolt', 'bolt', 'StackBlitz''s AI-powered web development tool', (SELECT id FROM categories WHERE slug='coding' LIMIT 1), 'freemium', 'https://bolt.new', NULL),
  ('Aider', 'aider', 'AI pair programming in your terminal', (SELECT id FROM categories WHERE slug='coding' LIMIT 1), 'open-source', 'https://aider.chat', 'https://github.com/paul-gauthier/aider')
ON CONFLICT (slug) DO NOTHING;

-- Image Generation
INSERT INTO tools (name, slug, description, category_id, pricing, website, github_url) VALUES
  ('DALL-E', 'dalle', 'OpenAI''s image generation model', (SELECT id FROM categories WHERE slug='image-generation' LIMIT 1), 'paid', 'https://openai.com/dall-e', NULL),
  ('Flux', 'flux', 'Black Forest Labs'' advanced image generation', (SELECT id FROM categories WHERE slug='image-generation' LIMIT 1), 'freemium', 'https://blackforestlabs.ai', NULL),
  ('Leonardo', 'leonardo', 'AI art and image generation platform', (SELECT id FROM categories WHERE slug='image-generation' LIMIT 1), 'freemium', 'https://leonardo.ai', NULL),
  ('Ideogram', 'ideogram', 'AI image generator with text rendering', (SELECT id FROM categories WHERE slug='image-generation' LIMIT 1), 'freemium', 'https://ideogram.ai', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Video Generation
INSERT INTO tools (name, slug, description, category_id, pricing, website, github_url) VALUES
  ('Sora', 'sora', 'OpenAI''s text-to-video model', (SELECT id FROM categories WHERE slug='video-generation' LIMIT 1), 'paid', 'https://openai.com/sora', NULL),
  ('Runway', 'runway', 'AI video generation and editing platform', (SELECT id FROM categories WHERE slug='video-generation' LIMIT 1), 'freemium', 'https://runwayml.com', NULL),
  ('Pika', 'pika', 'AI video generation from text and images', (SELECT id FROM categories WHERE slug='video-generation' LIMIT 1), 'freemium', 'https://pika.art', NULL),
  ('Luma', 'luma', 'AI video generation and 3D capture', (SELECT id FROM categories WHERE slug='video-generation' LIMIT 1), 'freemium', 'https://lumalabs.ai', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Audio & Music
INSERT INTO tools (name, slug, description, category_id, pricing, website, github_url) VALUES
  ('Suno', 'suno', 'AI music generation from text prompts', (SELECT id FROM categories WHERE slug='audio-generation' LIMIT 1), 'freemium', 'https://suno.ai', NULL),
  ('Udio', 'udio', 'AI music creation platform', (SELECT id FROM categories WHERE slug='audio-generation' LIMIT 1), 'freemium', 'https://udio.com', NULL),
  ('ElevenLabs', 'elevenlabs', 'AI voice generation and cloning', (SELECT id FROM categories WHERE slug='audio-generation' LIMIT 1), 'freemium', 'https://elevenlabs.io', NULL)
ON CONFLICT (slug) DO NOTHING;

-- AI Agents & Automation
INSERT INTO tools (name, slug, description, category_id, pricing, website, github_url) VALUES
  ('AutoGPT', 'autogpt', 'Autonomous AI agent framework', (SELECT id FROM categories WHERE slug='agents' LIMIT 1), 'open-source', 'https://agpt.co', 'https://github.com/Significant-Gravitas/AutoGPT'),
  ('CrewAI', 'crewai', 'Framework for orchestrating AI agents', (SELECT id FROM categories WHERE slug='agents' LIMIT 1), 'open-source', 'https://crewai.com', 'https://github.com/joaomdmoura/crewAI'),
  ('LangGraph', 'langgraph', 'Build stateful multi-actor applications', (SELECT id FROM categories WHERE slug='agents' LIMIT 1), 'open-source', 'https://langchain.com/langgraph', 'https://github.com/langchain-ai/langgraph'),
  ('Zapier', 'zapier', 'Workflow automation with AI capabilities', (SELECT id FROM categories WHERE slug='automation' LIMIT 1), 'freemium', 'https://zapier.com', NULL),
  ('Make', 'make', 'Visual automation platform with AI', (SELECT id FROM categories WHERE slug='automation' LIMIT 1), 'freemium', 'https://make.com', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Frameworks & Libraries
INSERT INTO tools (name, slug, description, category_id, pricing, website, github_url) VALUES
  ('LangChain', 'langchain', 'Framework for developing LLM applications', (SELECT id FROM categories WHERE slug='frameworks' LIMIT 1), 'open-source', 'https://langchain.com', 'https://github.com/langchain-ai/langchain'),
  ('LlamaIndex', 'llamaindex', 'Data framework for LLM applications', (SELECT id FROM categories WHERE slug='frameworks' LIMIT 1), 'open-source', 'https://llamaindex.ai', 'https://github.com/run-llama/llama_index'),
  ('Haystack', 'haystack', 'NLP framework for building search systems', (SELECT id FROM categories WHERE slug='frameworks' LIMIT 1), 'open-source', 'https://haystack.deepset.ai', 'https://github.com/deepset-ai/haystack'),
  ('Semantic Kernel', 'semantic-kernel', 'Microsoft''s SDK for AI orchestration', (SELECT id FROM categories WHERE slug='frameworks' LIMIT 1), 'open-source', 'https://learn.microsoft.com/semantic-kernel', 'https://github.com/microsoft/semantic-kernel')
ON CONFLICT (slug) DO NOTHING;

-- Vector Databases & RAG
INSERT INTO tools (name, slug, description, category_id, pricing, website, github_url) VALUES
  ('Pinecone', 'pinecone', 'Vector database for AI applications', (SELECT id FROM categories WHERE slug='infrastructure' LIMIT 1), 'freemium', 'https://pinecone.io', NULL),
  ('Weaviate', 'weaviate', 'Open-source vector database', (SELECT id FROM categories WHERE slug='infrastructure' LIMIT 1), 'open-source', 'https://weaviate.io', 'https://github.com/weaviate/weaviate'),
  ('Chroma', 'chroma', 'AI-native open-source embedding database', (SELECT id FROM categories WHERE slug='infrastructure' LIMIT 1), 'open-source', 'https://trychroma.com', 'https://github.com/chroma-core/chroma'),
  ('Qdrant', 'qdrant', 'Vector similarity search engine', (SELECT id FROM categories WHERE slug='infrastructure' LIMIT 1), 'open-source', 'https://qdrant.tech', 'https://github.com/qdrant/qdrant')
ON CONFLICT (slug) DO NOTHING;

-- Now add comprehensive aliases for ALL tools (existing + new)
-- This dramatically improves entity resolution

-- Existing tools aliases expansion
INSERT INTO tool_aliases (tool_id, alias, source) VALUES
  -- ChatGPT
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'gpt-4', 'manual'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'gpt-3.5', 'manual'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'gpt4', 'manual'),
  ((SELECT id FROM tools WHERE slug='chatgpt'), 'chatgpt-4', 'manual'),
  
  -- Claude
  ((SELECT id FROM tools WHERE slug='claude'), 'claude-3', 'manual'),
  ((SELECT id FROM tools WHERE slug='claude'), 'claude-sonnet', 'manual'),
  ((SELECT id FROM tools WHERE slug='claude'), 'claude-opus', 'manual'),
  ((SELECT id FROM tools WHERE slug='claude'), 'claude-haiku', 'manual'),
  
  -- Cursor
  ((SELECT id FROM tools WHERE slug='cursor'), 'cursor.com', 'manual'),
  ((SELECT id FROM tools WHERE slug='cursor'), 'cursor editor', 'manual'),
  
  -- Windsurf
  ((SELECT id FROM tools WHERE slug='windsurf'), 'codeium windsurf', 'manual'),
  ((SELECT id FROM tools WHERE slug='windsurf'), 'windsurf ide', 'manual'),
  
  -- Midjourney
  ((SELECT id FROM tools WHERE slug='midjourney'), 'mj', 'manual'),
  ((SELECT id FROM tools WHERE slug='midjourney'), 'midjourney bot', 'manual'),
  
  -- Perplexity
  ((SELECT id FROM tools WHERE slug='perplexity'), 'perplexity.ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='perplexity'), 'pplx', 'manual')
ON CONFLICT (tool_id, alias) DO NOTHING;

-- New tools aliases
INSERT INTO tool_aliases (tool_id, alias, source) VALUES
  -- Gemini
  ((SELECT id FROM tools WHERE slug='gemini'), 'google gemini', 'manual'),
  ((SELECT id FROM tools WHERE slug='gemini'), 'gemini pro', 'manual'),
  ((SELECT id FROM tools WHERE slug='gemini'), 'gemini ultra', 'manual'),
  ((SELECT id FROM tools WHERE slug='gemini'), 'bard', 'manual'),
  
  -- Llama
  ((SELECT id FROM tools WHERE slug='llama'), 'llama 2', 'manual'),
  ((SELECT id FROM tools WHERE slug='llama'), 'llama 3', 'manual'),
  ((SELECT id FROM tools WHERE slug='llama'), 'llama2', 'manual'),
  ((SELECT id FROM tools WHERE slug='llama'), 'llama3', 'manual'),
  ((SELECT id FROM tools WHERE slug='llama'), 'meta llama', 'manual'),
  
  -- Mistral
  ((SELECT id FROM tools WHERE slug='mistral'), 'mistral ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='mistral'), 'mistral 7b', 'manual'),
  ((SELECT id FROM tools WHERE slug='mistral'), 'mixtral', 'manual'),
  
  -- Grok
  ((SELECT id FROM tools WHERE slug='grok'), 'grok ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='grok'), 'xai grok', 'manual'),
  
  -- Codeium
  ((SELECT id FROM tools WHERE slug='codeium'), 'codeium.com', 'manual'),
  
  -- Tabnine
  ((SELECT id FROM tools WHERE slug='tabnine'), 'tabnine.com', 'manual'),
  
  -- Replit
  ((SELECT id FROM tools WHERE slug='replit'), 'repl.it', 'manual'),
  ((SELECT id FROM tools WHERE slug='replit'), 'replit ai', 'manual'),
  
  -- Bolt
  ((SELECT id FROM tools WHERE slug='bolt'), 'bolt.new', 'manual'),
  ((SELECT id FROM tools WHERE slug='bolt'), 'stackblitz bolt', 'manual'),
  
  -- DALL-E
  ((SELECT id FROM tools WHERE slug='dalle'), 'dall-e 2', 'manual'),
  ((SELECT id FROM tools WHERE slug='dalle'), 'dall-e 3', 'manual'),
  ((SELECT id FROM tools WHERE slug='dalle'), 'dalle2', 'manual'),
  ((SELECT id FROM tools WHERE slug='dalle'), 'dalle3', 'manual'),
  
  -- Flux
  ((SELECT id FROM tools WHERE slug='flux'), 'flux.1', 'manual'),
  ((SELECT id FROM tools WHERE slug='flux'), 'black forest labs', 'manual'),
  
  -- Runway
  ((SELECT id FROM tools WHERE slug='runway'), 'runway ml', 'manual'),
  ((SELECT id FROM tools WHERE slug='runway'), 'runwayml', 'manual'),
  ((SELECT id FROM tools WHERE slug='runway'), 'gen-2', 'manual'),
  
  -- Pika
  ((SELECT id FROM tools WHERE slug='pika'), 'pika labs', 'manual'),
  ((SELECT id FROM tools WHERE slug='pika'), 'pika.art', 'manual'),
  
  -- Luma
  ((SELECT id FROM tools WHERE slug='luma'), 'luma ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='luma'), 'luma labs', 'manual'),
  
  -- Suno
  ((SELECT id FROM tools WHERE slug='suno'), 'suno.ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='suno'), 'suno ai', 'manual'),
  
  -- Udio
  ((SELECT id FROM tools WHERE slug='udio'), 'udio.com', 'manual'),
  
  -- ElevenLabs
  ((SELECT id FROM tools WHERE slug='elevenlabs'), 'eleven labs', 'manual'),
  ((SELECT id FROM tools WHERE slug='elevenlabs'), '11labs', 'manual'),
  ((SELECT id FROM tools WHERE slug='elevenlabs'), 'elevenlabs.io', 'manual'),
  
  -- AutoGPT
  ((SELECT id FROM tools WHERE slug='autogpt'), 'auto-gpt', 'manual'),
  ((SELECT id FROM tools WHERE slug='autogpt'), 'auto gpt', 'manual'),
  
  -- CrewAI
  ((SELECT id FROM tools WHERE slug='crewai'), 'crew ai', 'manual'),
  ((SELECT id FROM tools WHERE slug='crewai'), 'crewai.com', 'manual'),
  
  -- LangGraph
  ((SELECT id FROM tools WHERE slug='langgraph'), 'lang graph', 'manual'),
  
  -- LangChain
  ((SELECT id FROM tools WHERE slug='langchain'), 'lang chain', 'manual'),
  ((SELECT id FROM tools WHERE slug='langchain'), 'langchain.com', 'manual'),
  
  -- LlamaIndex
  ((SELECT id FROM tools WHERE slug='llamaindex'), 'llama index', 'manual'),
  ((SELECT id FROM tools WHERE slug='llamaindex'), 'gpt-index', 'manual'),
  
  -- Haystack
  ((SELECT id FROM tools WHERE slug='haystack'), 'deepset haystack', 'manual'),
  
  -- Pinecone
  ((SELECT id FROM tools WHERE slug='pinecone'), 'pinecone.io', 'manual'),
  ((SELECT id FROM tools WHERE slug='pinecone'), 'pinecone db', 'manual'),
  
  -- Weaviate
  ((SELECT id FROM tools WHERE slug='weaviate'), 'weaviate.io', 'manual'),
  
  -- Chroma
  ((SELECT id FROM tools WHERE slug='chroma'), 'chromadb', 'manual'),
  ((SELECT id FROM tools WHERE slug='chroma'), 'chroma db', 'manual'),
  
  -- Qdrant
  ((SELECT id FROM tools WHERE slug='qdrant'), 'qdrant.tech', 'manual')
ON CONFLICT (tool_id, alias) DO NOTHING;

-- Add GitHub repo aliases for tools with known repos
INSERT INTO tool_aliases (tool_id, alias, source) VALUES
  ((SELECT id FROM tools WHERE slug='llama'), 'meta-llama/llama', 'github'),
  ((SELECT id FROM tools WHERE slug='mistral'), 'mistralai/mistral-src', 'github'),
  ((SELECT id FROM tools WHERE slug='aider'), 'paul-gauthier/aider', 'github'),
  ((SELECT id FROM tools WHERE slug='autogpt'), 'Significant-Gravitas/AutoGPT', 'github'),
  ((SELECT id FROM tools WHERE slug='crewai'), 'joaomdmoura/crewAI', 'github'),
  ((SELECT id FROM tools WHERE slug='langgraph'), 'langchain-ai/langgraph', 'github'),
  ((SELECT id FROM tools WHERE slug='langchain'), 'langchain-ai/langchain', 'github'),
  ((SELECT id FROM tools WHERE slug='llamaindex'), 'run-llama/llama_index', 'github'),
  ((SELECT id FROM tools WHERE slug='haystack'), 'deepset-ai/haystack', 'github'),
  ((SELECT id FROM tools WHERE slug='semantic-kernel'), 'microsoft/semantic-kernel', 'github'),
  ((SELECT id FROM tools WHERE slug='weaviate'), 'weaviate/weaviate', 'github'),
  ((SELECT id FROM tools WHERE slug='chroma'), 'chroma-core/chroma', 'github'),
  ((SELECT id FROM tools WHERE slug='qdrant'), 'qdrant/qdrant', 'github')
ON CONFLICT (tool_id, alias) DO NOTHING;
