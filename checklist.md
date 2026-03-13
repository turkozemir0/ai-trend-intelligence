# AI Trend Intelligence — V1 Public Checklist

> tasks.md tamamlandı. Bu dosya, public V1 için eksik olan kritik parçaları kapsar.
> Stack: Next.js 15 App Router, Supabase, Tailwind, TypeScript

---

## CONTEXT: Mevcut Mimari

Tüm dosyalar mevcut ve build temiz:
- `src/lib/scrapers/github.ts` — GitHub Trending scraper
- `src/lib/scrapers/hackernews.ts` — HN API scraper
- `src/app/api/cron/route.ts` — Cron endpoint (scrape + save signals)
- `src/app/page.tsx` — Homepage (signals + trending tools)
- `src/app/tools/page.tsx` — Tools directory
- `src/app/tools/[slug]/page.tsx` — Tool detail
- `src/app/submit/page.tsx` — Submit form (client component)
- `src/app/api/submit/route.ts` — Submit API
- `src/types/index.ts` — Tool, Category, Signal, Submission types
- `src/lib/utils.ts` — cn, formatNumber, momentumEmoji, scoreColor, timeAgo
- `src/lib/seo.ts` — pageMeta, toolJsonLd, websiteJsonLd

**Kritik sorun:** Scraper signals tablosuna yazıyor ama tools tablosunu hiç güncellemıyor.
Trend score seed SQL'deki statik değer. Signals ile tools arasında hiçbir bağlantı yok.

---

## TASK 1 — Signal → Tool Entity Mapping

**Dosya:** `src/lib/scrapers/github.ts`

`saveGithubSignals()` fonksiyonunu genişlet. Her repo kaydedildikten sonra şunu yap:

1. `repo.fullName` veya `repo.name` ile tools tablosunda eşleşen tool ara:
   - `tools.github_url ILIKE '%{repo.fullName}%'`
   - veya `tools.name ILIKE '%{repo.name}%'`
2. Eşleşen tool bulunursa güncelle:
   ```
   github_stars = repo.stars
   stars_weekly_delta = repo.starsToday
   ```
3. Güncelleme için `supabaseAdmin.from("tools").update(...).eq("id", matchedTool.id)` kullan.

**Dosya:** `src/lib/scrapers/hackernews.ts`

`saveHNSignals()` fonksiyonunu genişlet. Her story kaydedildikten sonra:

1. `story.title` içinde geçen tool isimlerini bul:
   - Önce `supabaseAdmin.from("tools").select("id, name, slug")` ile tüm tool isimlerini çek (fonksiyon başında tek seferlik)
   - Her tool için: `story.title.toLowerCase().includes(tool.name.toLowerCase())`
2. Eşleşen tool bulunursa tools tablosunu güncelle:
   ```
   hn_points = hn_points + story.score  (veya story.score ile overwrite, hangisi mantıklıysa)
   ```

---

## TASK 2 — Trend Score Otomatik Hesaplama

**Yeni dosya:** `src/lib/scoring.ts`

```typescript
// Tüm published tools için trend_score ve momentum hesapla ve güncelle
export async function recalculateTrendScores(): Promise<number>
```

Hesaplama mantığı (basit ağırlıklı formül):

```
github_component  = min(stars_weekly_delta / 100, 3.0)   // max 3 puan
hn_component      = min(hn_points / 50, 3.0)             // max 3 puan
stars_component   = min(github_stars / 10000, 2.0)       // max 2 puan
base_score        = 2.0                                  // minimum başlangıç
trend_score       = base_score + github_component + hn_component + stars_component
trend_score       = clamp(trend_score, 0.0, 10.0)
```

Momentum belirleme:
```
mevcut trend_score vs önceki trend_score (tools.trend_score):
  fark > +0.3  → "rising"
  fark < -0.3  → "declining"
  diğer        → "stable"
```

Her tool için `supabaseAdmin.from("tools").update({ trend_score, momentum }).eq("id", tool.id)` yap.

Return: güncellenen tool sayısı.

---

## TASK 3 — Cron Pipeline Güncelleme

**Dosya:** `src/app/api/cron/route.ts`

Mevcut akışa scoring adımını ekle:

```typescript
// Mevcut:
// 1. scrapeGithubTrending → saveGithubSignals
// 2. scrapeHackerNews → saveHNSignals

// Eklenecek:
// 3. recalculateTrendScores() çağır
//    try/catch içinde, diğer adımları bloklamasın

// Response'a ekle:
// { ok, github, hackernews, scored: number, errors, timestamp }
```

`recalculateTrendScores` import et: `import { recalculateTrendScores } from "@/lib/scoring"`

---

## TASK 4 — Submit Form: Kategorileri DB'den Çek

**Yeni dosya:** `src/app/api/categories/route.ts`

```typescript
// GET handler
// supabaseAdmin ile categories tablosunu çek (id, name, slug, sıralama: name ASC)
// Return: { data: Category[] }
// Cache: Response headers ile cache-control: public, max-age=3600
```

**Dosya:** `src/app/submit/page.tsx`

- Hardcoded `<option>` listesini kaldır (şu an satır ~108'den itibaren 16 adet option var)
- `useEffect` ile component mount olunca `fetch("/api/categories")` çağır
- State: `const [categories, setCategories] = useState<Category[]>([])`
- Select options: `categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)`
- Yükleme sırasında select disabled göster

`Category` tipini `@/types` den import et.

---

## TASK 5 — Tool Detail: Recent Signals Bölümü

**Dosya:** `src/app/tools/[slug]/page.tsx`

Tool verisi çekildikten sonra, aynı server component içinde:

1. Tool adını içeren son 5 sinyali çek:
   ```typescript
   const { data: recentSignals } = await supabase
     .from("signals")
     .select("*")
     .ilike("title", `%${tool.name}%`)
     .order("created_at", { ascending: false })
     .limit(5)
   ```

2. Mevcut layout'un altına (Back to all tools linkinin üstüne) yeni bölüm ekle:

   ```
   <section>
     <h2>Recent Signals</h2>
     {recentSignals.length > 0
       ? recentSignals.map(s => <SignalCard key={s.id} signal={s} />)
       : <p>No recent signals found for {tool.name}.</p>
     }
   </section>
   ```

3. `SignalCard` componentini import et: `import SignalCard from "@/components/signal-card"`

---

## TASK 6 — Tool Detail: Alternatif Tools Bölümü

**Dosya:** `src/app/tools/[slug]/page.tsx`

Tool verisi çekildikten sonra, aynı server component içinde:

1. Aynı kategorideki diğer toolları çek (mevcut tool hariç, max 3):
   ```typescript
   const { data: alternatives } = await supabase
     .from("tools")
     .select("*, category:categories(*)")
     .eq("category_id", tool.category_id)
     .eq("is_published", true)
     .neq("id", tool.id)
     .order("trend_score", { ascending: false })
     .limit(3)
   ```

2. Tool detayının sağ sidebar'ına (stats kutusunun altına) ekle:
   ```
   <div>
     <h3>Similar Tools</h3>
     {alternatives?.map(alt => <ToolCard key={alt.id} tool={alt} variant="compact" />)}
   </div>
   ```

---

## TASK 7 — Homepage: Top Movers This Week

**Dosya:** `src/app/page.tsx`

Mevcut 6 tool sorgusunu değiştir: `stars_weekly_delta DESC` ile sırala (trending by momentum değil, bu hafta en fazla hareket edenler).

Hero section'a şu küçük açıklama bloğunu ekle (h1 ile signal feed arasına):
```
<div className="grid grid-cols-3 gap-4 mb-8">
  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
    <div className="text-2xl font-bold text-emerald-400">{tools?.length || 0}+</div>
    <div className="text-sm text-zinc-400">AI Tools Tracked</div>
  </div>
  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
    <div className="text-2xl font-bold text-emerald-400">{signals?.length || 0}</div>
    <div className="text-sm text-zinc-400">Signals Today</div>
  </div>
  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-center">
    <div className="text-2xl font-bold text-emerald-400">2</div>
    <div className="text-sm text-zinc-400">Data Sources</div>
  </div>
</div>
```

"Trending Tools" başlığını "Top Movers This Week" olarak değiştir.

---

## TASK 8 — Public API Endpoints

**Yeni dosya:** `src/app/api/public/tools/route.ts`

```typescript
// GET handler
// Query params: ?category=slug&limit=20&offset=0
// supabaseAdmin ile tools çek (is_published=true, category join)
// Response: { data: Tool[], total: number }
// CORS header ekle: Access-Control-Allow-Origin: *
// Cache: cache-control: public, s-maxage=300
```

**Yeni dosya:** `src/app/api/public/signals/route.ts`

```typescript
// GET handler
// Query params: ?source=github|hackernews&limit=20
// supabaseAdmin ile signals çek (created_at DESC)
// Response: { data: Signal[] }
// CORS header ekle: Access-Control-Allow-Origin: *
// Cache: cache-control: public, s-maxage=60
```

---

## TASK 9 — Tool Detail: SEO İçerik Zenginleştirme

**Dosya:** `src/app/tools/[slug]/page.tsx`

`generateMetadata` fonksiyonunu güncelle — daha açıklayıcı description:

```typescript
const description = [
  tool.short_description || tool.description,
  tool.pricing_detail ? `Pricing: ${tool.pricing_detail}.` : null,
  `Trend score: ${tool.trend_score}/10.`,
  tool.category?.name ? `Category: ${tool.category.name}.` : null,
].filter(Boolean).join(" ")
```

Tool detay sayfasına (description paragrafının altına) şu "About" blokunu ekle:
```
<div className="grid grid-cols-2 gap-4 my-6">
  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
    <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Pricing</div>
    <div className="font-semibold capitalize">{tool.pricing}</div>
    {tool.pricing_detail && <div className="text-sm text-zinc-400 mt-1">{tool.pricing_detail}</div>}
  </div>
  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4">
    <div className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Category</div>
    <div className="font-semibold">{tool.category?.name}</div>
    <Link href={`/tools?category=${tool.category?.slug}`} className="text-sm text-emerald-400 hover:underline mt-1 block">
      See all {tool.category?.name} tools →
    </Link>
  </div>
</div>
```

---

## TASK 10 — vercel.json Cron Sıklığı Güncelle

**Dosya:** `vercel.json`

Mevcut schedule `"0 0 * * *"` (günde 1 kez). 6 saatte bir çalışacak şekilde güncelle:

```json
{
  "crons": [{
    "path": "/api/cron",
    "schedule": "0 */6 * * *"
  }]
}
```

---

## Tamamlanma Sırası

```
TASK 1  → Signal→Tool mapping (github + HN scrapers)
TASK 2  → Trend score hesaplama (src/lib/scoring.ts)
TASK 3  → Cron pipeline güncelle (scoring adımı ekle)
TASK 4  → Submit form kategorileri DB'den
TASK 5  → Tool detail: recent signals
TASK 6  → Tool detail: alternatif tools
TASK 7  → Homepage: top movers + stat satırı
TASK 8  → Public API endpoints
TASK 9  → Tool detail SEO içerik
TASK 10 → vercel.json cron sıklığı
```

**Task 1-3 birbirine bağımlı, önce bunları bitir.**
Task 4-10 birbirinden bağımsız, herhangi sırayla yapılabilir.

---

## Doğrulama Adımları

Her task sonrası kontrol:

- [ ] `pnpm build` hatasız geçiyor
- [ ] Task 1-3 sonrası: cron endpoint tetiklenince tools tablosunda `hn_points`, `stars_weekly_delta`, `trend_score` değerleri değişiyor
- [ ] Task 4 sonrası: submit formda kategori dropdown'u DB'den geliyor
- [ ] Task 5-6 sonrası: `/tools/cursor` sayfasında "Recent Signals" ve "Similar Tools" görünüyor
- [ ] Task 8 sonrası: `/api/public/tools` ve `/api/public/signals` JSON döndürüyor
