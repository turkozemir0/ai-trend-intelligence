# AI Trend Intelligence - V2 DaaS Checklist

> V1 public build calisiyor. Bu dosya, projeyi demo urununden gercek bir data product / DaaS katmanina tasimak icin gerekli ikinci fazi tanimlar.
> Odak: reliability, data quality, API productization, monetization, growth.

---

## Mevcut Durum

Su an sistemin calisan parcalari:
- Vercel production deploy calisiyor
- GitHub + Hacker News scraper calisiyor
- Cron endpoint veri yaziyor
- Homepage signal feed gosteriyor
- Tools directory ve tool detail sayfalari calisiyor
- Public API endpointleri calisiyor
- Submit form calisiyor

Su an sistemin siniri:
- Hala productized API degil
- Veri kalitesi temel seviyede
- Gozlemlenebilirlik ve operasyon eksik
- API key, rate limit, usage tracking yok
- Monetization katmani yok
- SEO / distribution katmani kisitli

---

## PHASE 1 - Reliability ve Data Integrity

### TASK 1 - Cron Run Logging

**Amac:** Her cron calismasinin ne yaptigi izlenebilsin.

Yapilacaklar:
- Supabase'de `cron_runs` tablosu ekle
- Alanlar:
  - `id`
  - `started_at`
  - `finished_at`
  - `status` (`running`, `success`, `partial_failure`, `failed`)
  - `github_count`
  - `hackernews_count`
  - `scored_count`
  - `error_count`
  - `errors` JSONB
- `src/app/api/cron/route.ts` icinde run baslangic ve bitis kaydi yaz

Basari kriteri:
- Her cron call sonrasi DB'de yeni `cron_runs` kaydi olusuyor
- Hata oldugunda `errors` doluyor

### TASK 2 - Signal Write Idempotency ve Validation

**Amac:** Scraper duplicate, malformed, eksik veri ile sistemi kirletmesin.

Yapilacaklar:
- `signals` tablosu icin migration dosyalarini duzenli hale getir
- `source_id` null kabul etmeyecek sekilde schema sabitlensin
- Scraper save fonksiyonlarinda:
  - bos title skip
  - bos source_id skip
  - gecersiz URL normalize et veya null yap
  - parse edilemeyen sayisal alanlari 0'a dusur
- `raw_data` tutarliligini koru

Basari kriteri:
- Ayni cron tekrar calistiginda signal sayisi patlamiyor
- Bad row insert oranı sifira yakin

### TASK 3 - Basic Admin Diagnostics Endpoint

**Amac:** Uretimde debug icin terminale bagimli kalmamak.

Yeni endpoint:
- `src/app/api/admin/health/route.ts`

Donmesi gerekenler:
- son cron run
- son 10 signal
- signal count today
- tools count
- env kontrol sonucu:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `CRON_SECRET`
  - `NEXT_PUBLIC_SITE_URL`

Gereksinim:
- basit bearer auth veya admin secret

Basari kriteri:
- Tek endpoint ile cron / DB / env durumu gorulebiliyor

---

## PHASE 2 - Data Quality ve Ranking Engine

### TASK 4 - Tool Alias / Entity Resolution

**Amac:** Signal -> Tool eslesmesi daha guvenilir olsun.

Yapilacaklar:
- `tool_aliases` tablosu ekle
  - `id`
  - `tool_id`
  - `alias`
  - `source`
- Tool matching mantigini `name ILIKE` seviyesinden cikar
- Oncelik sirası:
  - exact github_url match
  - alias exact match
  - normalized name match
  - fallback text match

Basari kriteri:
- Yanlis eslesen tool sayisi bariz sekilde azalir
- HN / GitHub match accuracy artar

### TASK 5 - Windowed Metrics

**Amac:** Kümülatif skor yerine zaman pencereli skorlar kullanmak.

Yapilacaklar:
- `tools` icin su alanlari dusun:
  - `signals_24h`
  - `signals_7d`
  - `github_delta_7d`
  - `hn_points_7d`
  - `trend_score_24h`
  - `trend_score_7d`
- `scoring.ts` icinde pencere bazli hesaplama yap
- Kümülatif `hn_points` birikmesini kontrol et

Basari kriteri:
- Trend score gecmise gore sismez
- Yeni hareketler daha anlamli gorunur

### TASK 6 - Signal Classification

**Amac:** Her signal sadece ham veri olmasin, etiketlensin.

Yapilacaklar:
- `signals` tablosuna opsiyonel alanlar ekle:
  - `signal_type`
  - `topic`
  - `sentiment`
  - `tool_id`
- Ilk etapta rule-based classification yeterli

Basari kriteri:
- Signal'lar source disinda anlamli sekilde filtrelenebilir

---

## PHASE 3 - API Productization

### TASK 7 - Versioned API

**Amac:** Public endpointleri urune donusturmek.

Yeni namespace:
- `/api/v1/tools`
- `/api/v1/signals`
- `/api/v1/trends`

Gereksinimler:
- stabil response shape
- pagination
- filtering
- sorting
- explicit error schema

Basari kriteri:
- API dokumante edilebilir hale gelir
- Frontend ile external consumer ayrisir

### TASK 8 - API Keys

**Amac:** DaaS katmaninin temel kapisi.

Yapilacaklar:
- `api_keys` tablosu
  - `id`
  - `user_email` veya `account_id`
  - `name`
  - `key_hash`
  - `plan`
  - `is_active`
  - `created_at`
- Request middleware ile API key dogrulama
- Plain key yerine hash sakla

Basari kriteri:
- API sadece yetkili kullanimla erisilebilir

### TASK 9 - Rate Limiting ve Usage Metering

**Amac:** Free vs paid plan ayrimi yapabilmek.

Yapilacaklar:
- `api_usage` tablosu
- endpoint bazli request log
- gunluk / aylik kota takibi
- basic per-key rate limiting

Basari kriteri:
- Kimin ne kadar kullandigi gorulebiliyor
- Abuse kontrol altinda

### TASK 10 - API Docs

**Amac:** Urun satilabilir ve entegre edilebilir olsun.

Yeni sayfa:
- `/docs`

Icerik:
- auth nasil calisir
- ornek request / response
- filter ve pagination mantigi
- error kodlari
- changelog linki

Basari kriteri:
- Disaridan biri ekip yardimi olmadan entegrasyon yapabilir

---

## PHASE 4 - Monetization

### TASK 11 - Pricing Page

Yeni sayfa:
- `/pricing`

Planlar:
- Free
- Pro
- Team

Icerik:
- aylik request limitleri
- export hakki
- historical access
- webhook / alert access

### TASK 12 - Billing Integration

Tercih:
- Stripe

Yapilacaklar:
- subscription lifecycle
- webhook handling
- plan -> API limit baglantisi

Basari kriteri:
- Kullanicinin plani backend'de yetki olarak kullaniliyor

### TASK 13 - Self-Serve Access Flow

Akis:
- kullanici email ile kayit olur
- API key olusturur
- plan secip odeme yapar
- docs ve dashboard'a erisir

Basari kriteri:
- Manuel destek olmadan onboarding tamamlanabilir

---

## PHASE 5 - Product Surface Expansion

### TASK 14 - Historical Trends Endpoint

Yeni endpoint:
- `/api/v1/trends`

Ozellikler:
- tool bazli zaman serisi
- 24h / 7d / 30d
- moving average

### TASK 15 - Saved Filters / Watchlists

**Amac:** Sitenin sticky olmasi.

Yapilacaklar:
- watchlist tablosu
- kullanicinin secili tool / category / source filtreleri
- saved searches

### TASK 16 - Alerts / Digest

Secenekler:
- email digest
- webhook notifications

Triggerler:
- trend_score threshold
- yeni signal burst
- category spike

---

## PHASE 6 - Growth ve Distribution

### TASK 17 - Production SEO Cleanup

Yapilacaklar:
- `NEXT_PUBLIC_SITE_URL` production'da dogru mu kontrol et
- canonical URL'leri duzelt
- OG/Twitter metadata dogrula
- sitemap coverage'i genislet

Basari kriteri:
- Placeholder domain kalmaz

### TASK 18 - Programmatic SEO Pages

Onerilen sayfalar:
- `/tools/for-marketers`
- `/tools/for-developers`
- `/tools/category/[slug]`
- `/trends/[category]`

### TASK 19 - Changelog ve Methodology Pages

Yeni sayfalar:
- `/changelog`
- `/methodology`

Icerik:
- trend score nasil hesaplanir
- data sources neler
- ne kadar sik guncellenir
- known limitations

---

## 2 Haftalik Uygulama Sirasi

### Sprint 1
- [ ] Task 1 - Cron run logging
- [ ] Task 2 - Signal validation / idempotency hardening
- [ ] Task 3 - Admin diagnostics endpoint
- [ ] Task 4 - Tool alias table + better matching
- [ ] Task 5 - Windowed metrics

### Sprint 2
- [ ] Task 7 - Versioned API
- [ ] Task 8 - API keys
- [ ] Task 9 - Rate limiting + usage metering
- [ ] Task 10 - API docs
- [ ] Task 17 - SEO cleanup

---

## Gelire Giden En Kisa Yol

Eger hedef hizli monetization ise oncelik su olmali:

1. Reliability
- [ ] Cron logs
- [ ] Diagnostics
- [ ] Better matching

2. API Product
- [ ] `/api/v1/signals`
- [ ] API key auth
- [ ] Rate limits
- [ ] Docs

3. Monetization
- [ ] Pricing page
- [ ] Stripe
- [ ] Self-serve key generation

Bu uc blok olmadan DaaS satmak erken olur.

---

## Definition of Done - V2

V2 tamamlandi diyebilmek icin en az sunlar gerekli:

- [ ] Cron failure / success observability var
- [ ] Data quality regressions tespit edilebiliyor
- [ ] API versioned ve dokumante
- [ ] API key ile koruma var
- [ ] Rate limit ve usage tracking var
- [ ] Pricing + billing var
- [ ] Kullanicilar self-serve onboard olabiliyor
- [ ] Historical trend verisi sunuluyor
- [ ] SEO / metadata production-grade durumda

---

## Not

V1 "working product".
V2 hedefi "sellable data service".

Bu iki asama ayni sey degil. Bundan sonraki odak yeni UI eklemekten cok:
- veri guvenilirligi
- API urunlestirme
- monetization
- operasyon

