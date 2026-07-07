# orchesis.ai — Захват цитирований AI-answer-engine. Инженерный план v2

> Система, которая заставляет ChatGPT/Perplexity/Gemini/Claude **читать и цитировать** наши страницы
> (и **вызывать** наш MCP-тул) по запросам в нише agent-security, измеряет это, и само-улучшается.
> Весь стек — открытые технологии. Никаких приватных «движков».

---

## 0. Это НЕ одна вещь, а три сросшихся (главный сдвиг v2)

1. **Фабрика маяков (offense)** — тысячи машиночитаемых страниц/тулов, которые движки цитируют.
2. **Citation-intelligence датасет (актив + продукт Orchesis; defense)** — живая карта «кому и по каким
   запросам доверяют answer-engine'ы». Побочный продукт измерения ценнее, чем кажется: это тот самый
   trust/observability-слой, и он on-brand для Orchesis (безопасность агентов). Offense (получить цитату)
   и defense (детектить манипуляцию цитированием) замыкаются: Orchesis владеет категорией **GEO-security**.
3. **Повторяемый GEO-движок (настоящий бизнес)** — контур «майнинг спроса → генерация → локальный скор →
   оптимизация → измерение» наводится на ЛЮБУЮ нишу или продаётся как сервис. **agent-security = полигон, движок = бизнес.**

## 1. Несущая дисциплина
Доказать фундамент ДЁШЕВО, прежде чем строить. Три гейта GO/NO-GO (см. §9). H1 первым.

## 2. Домен-стратегия (защита orchesis.ai)
Штраф Google **восстановим** (алго — перекролл после чистки; ручной — reconsideration). Постоянного шитлиста нет.
Но раз домен красивый — **изоляция за ~$10:**
- **Throwaway-домен** — вся масштабная фабрика + adversarial/gray эксперименты (E10). Обкатка плейбука тут.
- **`ref.orchesis.ai`** (поддомен) — ТОЛЬКО чистые качественные страницы (каждая несёт уникальный факт → штраф не берёт).
- **MCP-тул можно на orchesis.ai** — это не веб-страницы, риска scaled-content нет.
- Мигрируем на orchesis.ai только **доказанных победителей**. Бонус: A/B throwaway vs main.

## 3. Почему это вообще работает (разблокировка)
Модель, стоящая ВНУТРИ движка, стала open-weight: `pplx-embed` (MIT — эмбеддер Perplexity), реранкеры
`Qwen3-Reranker`/`RankZephyr`. → «попадёт ли в цитату» = **локальная дифференцируемая fitness**, скоришь
бесплатно против той же модели. Adversarial-ranking (EMPRA, FSAP 97% transfer) доказал: локальная
оптимизация **переносится** на живой чёрный ящик.

---

## 4. Компоненты (декомпозиция)

### Компонент 0 — Citation-graph mining (НОВОЕ, строим ПЕРВЫМ вместе с A) ⭐
Решает cold-start: у нового домена цитат ноль, скорер не на чем калибровать.
**То, что движки УЖЕ цитируют по agent-security, — готовый ключ-ответ.**
- Прогон self-probe по сотням agent-security запросов на 4 движках → собрать КАЖДЫЙ цитируемый URL.
- Даёт: (а) **позитивный трейнсет для скорера B в день 1**; (б) карта «кто владеет термином»;
  (в) **карта вакуумов** (запросы, где цитируют слабьё/ничего = наши дыры); (г) вход для value-weighting.
- Стек: self-probe-оркестратор (см. A), embedding-кластеризация цитируемых страниц.
- Усилие: low-medium. Зависимости: нет.

### Компонент A — Фундамент измерения (строим первым)
Видеть: crawled? cited? absorbed? каким движком, с какой латентностью.
- `middleware.ts` bot-логгер (готов) → ClickHouse/SQLite.
- self-probe на 4 API (Perplexity Sonar, OpenAI Responses, Gemini grounding, **Brave-API как Claude-прокси**) со span-level citations.
- **Canary-токены**; **uncited-influence детектор** (span-NLI/AutoAIS — сигнал поглощения за 2-4 нед ДО цитаты).
- Статистика: **sequential testing (mSPRT) + mixed-effects + CUPED** (движки стохастичны, разовый замер врёт; 10x меньше зондов).
- Верификация ботов: crypto (RFC 9421/Web Bot Auth) > IP-range > rDNS (убрать 5-10% спуфа).
- Усилие: medium. Зависимости: нет.

### Компонент B — Локальный скорер цитируемости (fitness) ⭐
- `pplx-embed` + **ансамбль** `Qwen3-Reranker-4B/8B` + `bge-reranker-v2-m3` + `RankZephyr` (P(yes) logit),
  listwise против пула реальных конкурентов (из Комп.0/fan-out) + `GEO-16` чек-лист + 4 каузальных gatekeeper.
- **Анти-Goodhart:** min по ансамблю (WCO/UWO) + χ²-occupancy — иначе real-citation падает после ~30 итераций.
- Калибровка на данных Комп.0 (день 1) → мост local→real обновляется через A.
- Выход: одна цифра citation-proxy/страницу. Усилие: medium. Зависимости: 0, A.

### Компонент C — Контент-пайплайн (карта → генератор → гейт → деплой)
- **C1 Карта тем:** grounding-API (Gemini `webSearchQueries` + OpenAI `action.query`) K=10-20 сэмплов/термин →
  HDBSCAN-кластеры → **submodular coverage-solver** (`apricot`, гарантия 1−1/e); локальный fan-out по патент-таксономии
  (US11663201B2) под **zero-volume подзапросы** (95% невидимы конкурентам). **Value-weighting** из Комп.0:
  приоритет = winnability × downstream-ценность (не все цитаты равны).
- **C2 Генератор:** локальная Qwen3/Gemma на vLLM + **constrained decoding** `XGrammar` (форс слотов: H2=подзапрос,
  40-60 слов, число/дата, evidence-cite); **IF-GEO** «diverge-then-converge» → **одна страница = кластер fan-out**.
- **C3 Грундинг:** RAG первички (arXiv/CVE/GitHub) + Anthropic Contextual Retrieval; опц. GRACE-генератор (abstain).
- **C4 Анти-slop гейт (= множитель, не расход):** 4 gatekeeper (обязательны) + `OpenFActScore` + `CiteGuard` +
  дедуп `MinHash-LSH → SemDeDup`. Публикуется только прошедшее.
- **C5 Деплой:** статик-билд (Astro/Cloudflare, чистый HTML — боты не исполняют JS) + **bulk IndexNow** (Bing→ChatGPT <48ч).
- **C6 Мульти-формат (НОВОЕ):** видео-пайплайн (скрипт → TTS/аватар → размеченный транскрипт+главы) под кластер —
  **YouTube = 18-29% цитат Gemini/AIO, r=0.74**, сильнейший недообслуженный канал; + диаграммы (мультимодальность +156%).
- Усилие: high. Зависимости: B.

### Компонент D — Контур оптимизации (GEPA) ⭐
- `GEPA` (в DSPy, рефлективный, 35x меньше прогонов) как внешний контур; reward = B + gatekeeper-compliance + FActScore-порог.
- Опц. `OpenEvolve` (MAP-Elites) — per-engine покрытие (разные клетки цитируются разными движками).
- Мост local→real обновляется периодическим self-probe (A). Усилие: medium сборка / high тюнинг. Зависимости: 0, A, B, C.

### Компонент E — Entity dual-strike (Wikidata) — **НАЧИНАТЬ РАНО** (лаг месяцы) ⭐⭐
**Единственный НЕСОКРУШИМЫЙ ров** — parametric lock: раз ты в весах, апдейт алгоритма не отменяет.
- `ReFinED`/`GLiNER` entity-linking; создать **Wikidata QID** на vacuum-термин + `owl:sameAs` с DefinedTerm-страницы +
  повтор канонического определения на ≥4 машиночитаемых поверхностях (SSR + Wikidata + DBpedia + HF dataset card + Wikipedia).
- **Retrieval-нога** (недели): 2.8x cross-doc consensus. **Parametric-нога** (x100, месяцы): Common Corpus вербализует
  Wikidata в веса следующих open-моделей.
- **Wikipedia-захват** (НОВОЕ): сама статья Wikipedia = 47.9% топ-цитат ChatGPT — создать/цитироваться (аккуратно, notability).
- Усилие: medium. Зависимости: C. Осторожно: Wikidata notability — external references, не промо.

### Компонент F — Tool-native вектор (MCP) — **второй маршрут, живёт на orchesis.ai**
- `FastMCP`-сервер (3-5 узких agent-security тулов, **citation-ready responses** с абсолютным orchesis.ai URL) →
  publish в **пустую нишу** официального MCP-реестра (DNS-verified namespace, first-mover) + каталоги ChatGPT/Claude/Perplexity.
- Описания тулов оптимизируются тем же GEPA+реранкер (tool-selection = retrieval-задача, ~34% BM25 → ~94-98% hybrid).
- **F-cross (НОВОЕ):** тул = **лучший майнер реального спроса агентов** (видишь реальные запросы) → кормит C1.
- **F-dist (НОВОЕ):** дистрибуция глубже реестра — попасть в дефолт-тулсет LangChain/CrewAI/AutoGen.
- **F-product (НОВОЕ):** тул = мини-версия НАСТОЯЩЕГО продукта Orchesis (security-проверка действия агента) →
  каждый вызов = лид/юзер ядра. OTel-измерение вызовов.
- Усилие: medium. Зависимости: B.

### Компонент G — Citation-intelligence актив (НОВОЕ, параллельно)
Данные self-probe/Комп.0 во времени = «кому доверяют answer-engine'ы» → продукт Orchesis + GEO-security research
(публикация «как цитирование можно отравить и детектить» = авторитет категории). Ров + продукт.

### Компонент H — Event-radar → instant-beacon (НОВОЕ) ⭐
Burst-detection (HN Algolia/arXiv/GitHub/CVE) новых agent-security терминов → генерация маяка **за ЧАСЫ**, до
любого канонического источника → **первым определяешь термин** (максимальный first-mover authority-flywheel).

---

## 5. Флайвил и кросс-фиды
- **Основной:** измеряешь граф цитат → находишь вакуум → заполняешь → становишься источником → **меняешь граф** → меряешь новый. Компаундится; данные = ров (G).
- **Кросс:** тул (F) даёт реальный спрос → таргетинг маяка (C1); авторитет маяка → выбор тула. Маршруты усиливают друг друга.
- **Durable vs временное:** gray-рычаги (E10) — короткий полураспад (запатчат). Durable = quality + first-mover на свежих терминах (H) + **parametric lock (E)**. Приоритет — durable.

## 6. Роадмап с вехами
| Фаза | Что | Домен | Срок | Гейт |
|---|---|---|---|---|
| **0** | Комп.0 + A + B + 10 ручных маяков → **проверка H1 (ρ>0.5)** | ref.orchesis.ai | 1-2 нед | GO/NO-GO |
| **1** | Первые цитаты руками, measurement-петля (A+G старт) | ref.orchesis.ai | 2-4 нед | цитирует ли хоть кто-то |
| **2** | C (пайплайн, IF-GEO) + D (GEPA) + **E старт (Wikidata, ранний лаг)** | throwaway + Wikidata | 3-6 нед | GEPA бьёт ручной baseline |
| **3** | Фабрика в масштабе + C6 видео + F (MCP на orchesis) + H (event-radar) | throwaway + MCP/orchesis | 5-10 нед | citation-share растёт без штрафа |
| **4** | Wikipedia-захват + миграция победителей + G как продукт | ref.orchesis.ai | 8-14 нед | parametric dose-response |

## 7. Стек (весь открытый)
Генерация: Qwen3/Gemma + vLLM + XGrammar · Fitness: pplx-embed + Qwen3-Reranker/bge/RankZephyr ·
Оптимизация: GEPA(DSPy)/OpenEvolve/PyBandits · Грундинг/факт-чек: Contextual-Retrieval + OpenFActScore + CiteGuard ·
Покрытие: apricot + HDBSCAN + Qwen3-Embedding · Entity: ReFinED/GLiNER + Wikidata/DBpedia · Дедуп: MinHash+SemDeDup ·
Деплой: Astro/Cloudflare + IndexNow · MCP: FastMCP + OTel · Измерение: ClickHouse + span-NLI + Web Bot Auth · Видео: TTS/аватар OSS.

## 8. Три решающих гейта (не строить дальше, пока не пройдены)
1. **H1:** локальный скор ↔ реальная цитата, ρ>0.5. *(калибруется на Комп.0 — есть ground-truth в день 1)*
2. **GEPA > baseline:** эволюция бьёт ручную GEO-оптимизацию на реальных цитатах.
3. **Масштаб без штрафа:** тысячи страниц на throwaway индексируются и цитируются, не ловя scaled-content-подавление.

## 9. Стратегическая заметка
Маяк — полигон. Актив — **повторяемый GEO-движок + citation-intelligence-датасет**. Endgame-ров — **parametric lock**
(начинать рано). Orchesis из «маяка» вырастает во **владельца категории answer-engine-integrity / GEO-security**.

---
*v2 — добавлены: Компонент 0 (citation-graph mining), G (intelligence-актив), H (event-radar), C6 (видео),
F-cross/dist/product, ранний parametric-трек (E), value-weighting, домен-изоляция, offense=defense, флайвил.*
