import { supabaseAdmin } from "@/lib/supabase/admin";

interface ToolMatch {
  id: string;
  name: string;
  github_url: string | null;
}

export async function findToolMatch(
  searchTerm: string,
  githubUrl?: string
): Promise<ToolMatch | null> {
  if (githubUrl) {
    const { data: exactGithubMatch } = await supabaseAdmin
      .from("tools")
      .select("id, name, github_url")
      .ilike("github_url", `%${githubUrl}%`)
      .single();

    if (exactGithubMatch) {
      return exactGithubMatch;
    }
  }

  const { data: aliasMatches } = await supabaseAdmin
    .from("tool_aliases")
    .select("tool_id, tools(id, name, github_url)")
    .ilike("alias", searchTerm);

  if (aliasMatches && aliasMatches.length > 0) {
    const match = aliasMatches[0];
    if (match.tools && !Array.isArray(match.tools)) {
      return match.tools as unknown as ToolMatch;
    }
  }

  const normalizedSearch = searchTerm.toLowerCase().trim();
  const { data: nameMatches } = await supabaseAdmin
    .from("tools")
    .select("id, name, github_url")
    .ilike("name", normalizedSearch);

  if (nameMatches && nameMatches.length > 0) {
    return nameMatches[0];
  }

  const { data: fuzzyMatches } = await supabaseAdmin
    .from("tools")
    .select("id, name, github_url")
    .ilike("name", `%${normalizedSearch}%`)
    .limit(1);

  if (fuzzyMatches && fuzzyMatches.length > 0) {
    return fuzzyMatches[0];
  }

  return null;
}
