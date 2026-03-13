import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

function normalize(value) {
  return value.toLowerCase().trim();
}

function extractHostname(value) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function hostnameVariants(hostname) {
  if (!hostname) {
    return [];
  }

  const normalized = hostname.replace(/^www\./, "");
  const parts = normalized.split(".");
  const root = parts.length >= 2 ? `${parts[parts.length - 2]}.${parts[parts.length - 1]}` : normalized;
  const label = parts[0];

  return Array.from(new Set([normalized, root, label].filter(Boolean)));
}

function toolVariants(tool, aliasesByToolId) {
  const variants = new Set([normalize(tool.name), normalize(tool.slug)]);

  const hostname = extractHostname(tool.website);
  for (const variant of hostnameVariants(hostname)) {
    variants.add(normalize(variant));
  }

  for (const alias of aliasesByToolId.get(tool.id) || []) {
    variants.add(normalize(alias));
  }

  return Array.from(variants);
}

async function main() {
  const { data: tools, error: toolsError } = await supabase
    .from("tools")
    .select("id, name, slug, website, github_url")
    .eq("is_published", true);

  if (toolsError) {
    throw toolsError;
  }

  const { data: aliases, error: aliasesError } = await supabase
    .from("tool_aliases")
    .select("tool_id, alias");

  if (aliasesError) {
    throw aliasesError;
  }

  const aliasesByToolId = new Map();
  for (const alias of aliases || []) {
    const current = aliasesByToolId.get(alias.tool_id) || [];
    current.push(alias.alias);
    aliasesByToolId.set(alias.tool_id, current);
  }

  const enrichedTools = (tools || []).map((tool) => ({
    ...tool,
    variants: toolVariants(tool, aliasesByToolId),
  }));

  const { data: signals, error: signalsError } = await supabase
    .from("signals")
    .select("id, title, url, source, tool_id")
    .is("tool_id", null)
    .order("created_at", { ascending: false })
    .limit(1000);

  if (signalsError) {
    throw signalsError;
  }

  let matched = 0;
  let skipped = 0;
  let domainMatched = 0;
  let textMatched = 0;

  for (const signal of signals || []) {
    const title = normalize(signal.title || "");
    const url = (signal.url || "").toLowerCase();
    const hostname = extractHostname(signal.url);
    const variants = hostnameVariants(hostname);

    let matchedTool = null;
    let matchType = "none";

    if (signal.source === "github" && url) {
      matchedTool = enrichedTools.find(
        (tool) => tool.github_url && url.includes(tool.github_url.toLowerCase())
      );
      if (matchedTool) {
        matchType = "github_url";
      }
    }

    if (!matchedTool && variants.length > 0) {
      matchedTool = enrichedTools.find((tool) =>
        variants.some((variant) => tool.variants.includes(variant))
      );
      if (matchedTool) {
        matchType = "domain";
      }
    }

    if (!matchedTool && title) {
      matchedTool = enrichedTools.find((tool) =>
        tool.variants.some((variant) => title.includes(variant))
      );
      if (matchedTool) {
        matchType = "text";
      }
    }

    if (!matchedTool) {
      skipped++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("signals")
      .update({ tool_id: matchedTool.id })
      .eq("id", signal.id);

    if (updateError) {
      console.error(`Failed to update signal ${signal.id}: ${updateError.message}`);
      skipped++;
      continue;
    }

    matched++;
    if (matchType === "domain") {
      domainMatched++;
    } else if (matchType === "text") {
      textMatched++;
    }
  }

  console.log(JSON.stringify({ scanned: signals?.length || 0, matched, skipped, domainMatched, textMatched }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

