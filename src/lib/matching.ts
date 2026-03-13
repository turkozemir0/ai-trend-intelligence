import { supabaseAdmin } from "@/lib/supabase/admin";

interface ToolMatch {
  id: string;
  name: string;
  github_url: string | null;
  website?: string | null;
  slug?: string;
}

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function extractHostname(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function hostnameVariants(hostname: string | null): string[] {
  if (!hostname) {
    return [];
  }

  const normalized = hostname.replace(/^www\./, "");
  const parts = normalized.split(".");
  const root = parts.length >= 2 ? `${parts[parts.length - 2]}.${parts[parts.length - 1]}` : normalized;
  const label = parts[0];

  return Array.from(new Set([normalized, root, label].filter(Boolean)));
}

async function findByAlias(alias: string): Promise<ToolMatch | null> {
  const normalizedAlias = normalize(alias);

  const { data: aliasMatches } = await supabaseAdmin
    .from("tool_aliases")
    .select("tool_id, tools(id, name, github_url, website, slug)")
    .ilike("alias", normalizedAlias)
    .limit(1);

  if (aliasMatches && aliasMatches.length > 0) {
    const match = aliasMatches[0];
    if (match.tools && !Array.isArray(match.tools)) {
      return match.tools as unknown as ToolMatch;
    }
  }

  return null;
}

export async function findToolMatch(
  searchTerm: string,
  githubUrl?: string,
  sourceUrl?: string | null
): Promise<ToolMatch | null> {
  const normalizedSearch = normalize(searchTerm);
  const sourceHostname = extractHostname(sourceUrl);
  const sourceVariants = hostnameVariants(sourceHostname);

  if (githubUrl) {
    const { data: exactGithubMatch } = await supabaseAdmin
      .from("tools")
      .select("id, name, github_url, website, slug")
      .ilike("github_url", `%${githubUrl}%`)
      .limit(1);

    if (exactGithubMatch && exactGithubMatch.length > 0) {
      return exactGithubMatch[0];
    }
  }

  for (const candidate of [normalizedSearch, ...sourceVariants]) {
    const aliasMatch = await findByAlias(candidate);
    if (aliasMatch) {
      return aliasMatch;
    }
  }

  if (sourceVariants.length > 0) {
    const { data: websiteMatches } = await supabaseAdmin
      .from("tools")
      .select("id, name, github_url, website, slug")
      .or(sourceVariants.map((variant) => `website.ilike.%${variant}%`).join(","))
      .limit(1);

    if (websiteMatches && websiteMatches.length > 0) {
      return websiteMatches[0];
    }
  }

  const { data: slugMatches } = await supabaseAdmin
    .from("tools")
    .select("id, name, github_url, website, slug")
    .or(`slug.ilike.${normalizedSearch},name.ilike.${normalizedSearch}`)
    .limit(1);

  if (slugMatches && slugMatches.length > 0) {
    return slugMatches[0];
  }

  const { data: fuzzyMatches } = await supabaseAdmin
    .from("tools")
    .select("id, name, github_url, website, slug")
    .or(`slug.ilike.%${normalizedSearch}%,name.ilike.%${normalizedSearch}%`)
    .limit(1);

  if (fuzzyMatches && fuzzyMatches.length > 0) {
    return fuzzyMatches[0];
  }

  return null;
}

