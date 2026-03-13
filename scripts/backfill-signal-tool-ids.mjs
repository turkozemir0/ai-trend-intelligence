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

async function main() {
  const { data: tools, error: toolsError } = await supabase
    .from("tools")
    .select("id, name, github_url")
    .eq("is_published", true);

  if (toolsError) {
    throw toolsError;
  }

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

  for (const signal of signals || []) {
    const title = normalize(signal.title || "");
    const url = (signal.url || "").toLowerCase();

    let matchedTool = null;

    if (signal.source === "github" && url) {
      matchedTool = tools.find((tool) => tool.github_url && url.includes(tool.github_url.toLowerCase()));
    }

    if (!matchedTool && title) {
      matchedTool = tools.find((tool) => title.includes(normalize(tool.name)));
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
  }

  console.log(JSON.stringify({ scanned: signals?.length || 0, matched, skipped }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

