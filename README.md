# hubvoid

**hubvoid** é um app de *link-in-bio / press kit* para criadores, artistas e DJs.
Cada usuário tem um perfil público (`/?user=username`) com banner, nome/logo,
ícones das redes, galeria, vídeo, eventos (shows), players de música
(Spotify/SoundCloud), seção de contato e rodapé com patrocinadores. Um painel
(dashboard) protegido permite customizar tudo, gerenciar links/fotos/eventos,
ver analytics e a contabilidade dos shows.

- **Frontend (produção):** https://hubvoid.vercel.app
- **Backend/API (produção):** https://link-hub-production.up.railway.app
- **Perfil público:** `https://hubvoid.vercel.app/?user=SEU_USERNAME`

---

## 📑 Índice

1. [Arquitetura](#-arquitetura)
2. [Stack de tecnologias](#-stack-de-tecnologias)
3. [Estrutura do monorepo](#-estrutura-do-monorepo)
4. [Como funciona (fluxo)](#-como-funciona-fluxo)
5. [Banco de dados](#-banco-de-dados)
6. [API — endpoints](#-api--endpoints)
7. [Variáveis de ambiente](#-variáveis-de-ambiente)
8. [Rodando localmente](#-rodando-localmente)
9. [Deploy em produção](#-deploy-em-produção)
10. [Migrar o backend para outra plataforma](#-migrar-o-backend-para-outra-plataforma)
11. [Migrar o banco / storage](#-migrar-o-banco--storage)
12. [Manutenção do código](#-manutenção-do-código)
13. [Problemas comuns (troubleshooting)](#-problemas-comuns-troubleshooting)
14. [Segurança](#-segurança)
15. [Escalabilidade](#-escalabilidade)

---

## 🏗 Arquitetura

```
┌──────────────────────────┐         ┌───────────────────────────┐
│  Frontend (Vercel)       │  HTTPS  │  API/Backend (Railway)    │
│  React + Vite SPA        │ ──────▶ │  Express + Drizzle ORM     │
│  hubvoid.vercel.app      │ Bearer  │  link-hub-production...     │
└──────────────────────────┘  token  └─────────────┬─────────────┘
        │                                           │
        │ Clerk (auth)                              │ SQL (SSL)
        ▼                                           ▼
┌──────────────────────────┐         ┌───────────────────────────┐
│  Clerk                   │         │  PostgreSQL (Supabase)     │
│  (login / sessão / JWT)  │         │  + Supabase Storage        │
└──────────────────────────┘         │  (bucket "linkhub")        │
                                      └───────────────────────────┘
```

- O **frontend** é uma SPA estática servida pela Vercel. Ele chama a API por uma
  **URL absoluta** (Railway em produção, `localhost:3001` em dev) — definida em
  `artifacts/void/src/lib/api-base.ts`.
- O **backend** é um Express bundlado em um único arquivo (`dist/index.mjs`) via
  esbuild. Valida o JWT do Clerk e fala com o Postgres via Drizzle.
- **Autenticação:** Clerk. O token é anexado em todas as chamadas (`Authorization: Bearer ...`).
- **Banco:** PostgreSQL hospedado no Supabase. **Uploads de imagem:** Supabase Storage.

---

## 🧰 Stack de tecnologias

**Frontend** (`artifacts/void`)
- React 18 + TypeScript + Vite
- Tailwind CSS (+ shadcn/ui em `components/ui`)
- Framer Motion (animações)
- wouter (rotas)
- @tanstack/react-query (data fetching/cache)
- @clerk/react (auth)
- @dnd-kit (drag-and-drop: links, fotos, eventos, ordem das seções)
- lucide-react / react-icons (ícones)

**Backend** (`artifacts/api-server`)
- Express + TypeScript (bundle via esbuild — `build.mjs`)
- @clerk/express (middleware de auth)
- Drizzle ORM + `pg` (PostgreSQL)
- multer + @supabase/supabase-js (upload para o Storage)
- pino (logs)

**Libs internas** (`lib/*`)
- `db` — schema Drizzle + cliente do banco
- `api-zod` — schemas de validação Zod (gerados/derivados do contrato)
- `api-client-react` — `customFetch`, hooks de query (`useGetMe`, etc.) e config de base URL/token
- `api-spec` — contrato da API
- `object-storage-web` — helpers de storage

---

## 📁 Estrutura do monorepo

Monorepo com **npm workspaces** (ver `workspaces` no `package.json` raiz).

```
Link-Hub/
├─ package.json            # scripts raiz (dev, build, typecheck, seed)
├─ vercel.json             # (legado) SPA rewrite na raiz
├─ Procfile                # web: node artifacts/api-server/dist/index.mjs
├─ .env                    # variáveis (NÃO versionado)
├─ scripts/                # migrações pontuais (.mjs) + seed
│
├─ artifacts/
│  ├─ void/                # FRONTEND (SPA)
│  │  ├─ index.html        # fontes Google, favicon
│  │  ├─ vite.config.ts    # build → dist/public, proxy /api em dev
│  │  ├─ vercel.json       # SPA fallback (rewrite p/ index.html)  ← usado na Vercel
│  │  ├─ public/           # favicon.svg, logo.svg, imagens
│  │  └─ src/
│  │     ├─ main.tsx       # setBaseUrl (api-base) + render
│  │     ├─ App.tsx        # Clerk, rotas, setAuthTokenGetter/UploadTokenGetter
│  │     ├─ lib/
│  │     │  ├─ api-base.ts # base URL da API + uploadImage()
│  │     │  ├─ platforms.tsx # plataformas/ícones + embeds Spotify/SoundCloud
│  │     │  ├─ fonts.ts    # fontes do nome do hero
│  │     │  ├─ sections.ts # chaves/ordem das seções do perfil
│  │     │  └─ themes.ts   # temas/cores
│  │     ├─ components/public/  # BioSection, GallerySection, ContactSection, VideoSection, Lightbox
│  │     └─ pages/
│  │        ├─ home.tsx          # landing
│  │        ├─ public/profile.tsx # PERFIL PÚBLICO (hero, seções, footer)
│  │        └─ dashboard/        # index (overview+contabilidade), customization,
│  │                             # links, photos, events, analytics, appearance
│  │
│  └─ api-server/          # BACKEND (Express)
│     ├─ build.mjs         # bundler esbuild → dist/index.mjs
│     ├─ vercel.json       # config p/ deploy alternativo na Vercel
│     └─ src/
│        ├─ index.ts       # bootstrap (porta)
│        ├─ app.ts         # middlewares (CORS, Clerk, json), monta /api
│        ├─ middlewares/   # clerkProxyMiddleware
│        ├─ lib/           # objectStorage (Supabase), logger
│        └─ routes/        # health, profile, links, photos, events,
│                          # analytics, sections, storage, admin, proxy, debug
│
└─ lib/
   ├─ db/                  # Drizzle: src/schema/*.ts + drizzle.config.ts
   ├─ api-zod/             # src/generated/api.ts (schemas Zod)
   ├─ api-client-react/    # src/custom-fetch.ts + hooks gerados
   ├─ api-spec/
   └─ object-storage-web/
```

---

## 🔄 Como funciona (fluxo)

### Perfil público (`/?user=username`)
`artifacts/void/src/pages/public/profile.tsx` busca:
- `GET /api/profile/:username` → `{ profile, links, photos, socialLinks }`
- `GET /api/events/public/:username` → eventos visíveis (ordenados por `position`)

Renderiza, na ordem definida pelo usuário (`profile.sectionOrder`, via CSS `order`):
**Hero** (banner + nome/logo + @username + ícones das redes) → **Bio** → **Vídeo** →
**Galeria** → **Eventos** → **Links** → **Playlists** (Spotify/SoundCloud) →
**Contato** → **Footer** (patrocinadores + texto).

Opções de hero controladas por colunas do perfil:
- `heroDisplay` — `name` | `logo` | `both`
- `heroLayout` — `overlay` (nome sobre o banner) | `below` (nome/logo abaixo do banner, estilo Komi)
- `heroAlign` — `top` | `left` | `center` | `right`
- `socialIconsAlign` — `{top|bottom}-{left|center|right}`
- `usernameFont` — id de fonte (ver `lib/fonts.ts`)

### Dashboard (protegido por Clerk)
- **Overview** (`dashboard/index.tsx`) — stats + **contabilidade dos eventos**
  (`GET /api/dashboard/monetization`): total, já recebido, a receber, com toggle
  manual "recebido" por evento (`events.paymentReceived`).
- **Customização** — username, bio, foto, banner, aparência do hero, fontes,
  posição dos ícones, ordem das seções, tema/cores/layout, vídeo, contato,
  rodapé/patrocinadores.
- **Links / Fotos / Eventos** — CRUD com drag-and-drop de ordenação.

### Autenticação
`App.tsx` registra o getter do token do Clerk em `setAuthTokenGetter` (para o
`customFetch`) **e** em `setUploadTokenGetter` (para uploads via `fetch`/FormData).
Toda chamada à API leva `Authorization: Bearer <jwt>`. O backend valida com
`@clerk/express`.

### Upload de imagens
`uploadImage()` (`lib/api-base.ts`) faz `POST /api/photos/upload` (FormData) com a
URL absoluta da API + token. O backend (multer) sobe para o **Supabase Storage**
(bucket `linkhub`, pasta `uploads/`) e retorna a URL pública.

---

## 🗄 Banco de dados

PostgreSQL (Supabase). Schema Drizzle em `lib/db/src/schema/`. Todas as tabelas
têm `id uuid` (PK, `gen_random_uuid()`). As tabelas filhas referenciam
`profiles.id` via `profile_id` (FK, `ON DELETE CASCADE`).

### `profiles` — perfil do usuário (1:1 com o usuário do Clerk)

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `id` | uuid | gen_random_uuid() | PK |
| `clerk_user_id` | text | — | ID do usuário no Clerk (único) |
| `username` | text | — | Username público (único) |
| `display_name` | text | null | Nome de exibição |
| `bio` | text | null | Biografia |
| `avatar_url` | text | null | Foto de perfil |
| `header_image_url` | text | null | Imagem do banner |
| `banner_video_url` | text | null | Vídeo do banner (mp4/webm, loop) |
| `bio_image_url` | text | null | Foto exibida ao lado da bio |
| `bio_image_side` | text | 'left' | Lado da foto da bio: `left`/`right` |
| `logo_url` | text | null | Imagem do logo (wordmark) no hero |
| `logo_size` | integer | 128 | Tamanho do logo/foto no hero (px) |
| `accent_color` | text | '#ffffff' | Cor de destaque (legado) |
| `bg_color` | text | '#000000' | Cor de fundo (legado) |
| `card_style` | text | 'glass' | Estilo de card (legado) |
| `theme_id` | text | 'default' | Tema escolhido |
| `layout_columns` | integer | 1 | Nº de colunas das grades |
| `custom_primary_color` | text | null | Cor primária custom |
| `custom_secondary_color` | text | null | Cor secundária custom |
| `background_image_url` | text | null | Imagem de fundo |
| `background_blur` | integer | 0 | Blur do fundo |
| `hero_display` | text | 'name' | `name`/`logo`/`both` no topo |
| `hero_layout` | text | 'overlay' | `overlay` (sobre o banner) / `below` |
| `hero_align` | text | 'center' | `top`/`left`/`center`/`right` |
| `social_icons_align` | text | 'center' | Posição dos ícones: `{top\|bottom}-{left\|center\|right}` |
| `username_font` | text | 'default' | Fonte do nome (ver `lib/fonts.ts`) |
| `show_username` | boolean | true | Mostrar `@username` no hero |
| `banner_fit` | text | 'cover' | `cover` (preenche) / `contain` (mostra inteiro) |
| `banner_height` | text | 'normal' | `compact`/`normal`/`tall`/`full` |
| `show_header` | boolean | false | Header de navegação fixo no topo |
| `video_url` | text | null | Vídeo de destaque (YouTube/Vimeo/mp4) |
| `whatsapp_number` | text | null | WhatsApp (contato) |
| `email` | text | null | E-mail (contato) |
| `instagram_handle` | text | null | Instagram (contato) |
| `show_sections` | boolean | true | (legado) exibir seções |
| `section_settings` | jsonb | {} | (legado) configs de seção |
| `section_order` | jsonb | null | Ordem das seções (array de chaves) |
| `section_titles` | jsonb | null | Títulos custom das seções (map) |
| `sponsors` | jsonb | null | Patrocinadores `[{imageUrl,name,url}]` |
| `footer_text` | text | null | Texto custom do rodapé |
| `is_super_admin` | boolean | false | Acesso de admin |
| `is_active` | boolean | true | Perfil ativo |
| `created_at` / `updated_at` | timestamptz | now() | Timestamps |

### `events` — shows/eventos

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `profile_id` | uuid | — | FK → profiles |
| `title` | text | — | Título (obrigatório) |
| `description` | text | null | Descrição |
| `event_date` | timestamptz | null | Data/hora |
| `street` / `city` / `state` | text | null | Localização separada |
| `location` | text | null | (legado) localização única |
| `ticket_url` | text | null | Link de ingressos |
| `image_url` | text | null | Imagem do evento |
| `price` | numeric(10,2) | null | Valor (contabilidade) |
| `payment_received` | boolean | false | Marcado como recebido |
| `position` | integer | 0 | Ordem (drag-and-drop) |
| `is_visible` | boolean | true | Visível no perfil |
| `created_at` | timestamptz | now() | Timestamp |

### `links` — links do perfil

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `profile_id` | uuid | — | FK → profiles |
| `title` / `url` | text | — | Título e URL |
| `description` | text | null | Descrição |
| `icon` | text | null | Plataforma (spotify, youtube, …) |
| `thumbnail_url` | text | null | Miniatura |
| `card_type` | text | 'default' | `default`/`spotify`/`soundcloud` (embed) |
| `position` | integer | 0 | Ordem |
| `is_visible` | boolean | true | Visível |
| `click_count` | integer | 0 | Cliques |
| `section_id` | uuid | null | Seção associada |
| `created_at` | timestamptz | now() | Timestamp |

### `photos` — galeria

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `profile_id` | uuid | — | FK → profiles |
| `url` | text | — | URL da imagem |
| `caption` | text | null | Legenda |
| `is_cover` | boolean | false | É capa |
| `position` | integer | 0 | Ordem |
| `created_at` | timestamptz | now() | Timestamp |

### `social_links` — links sociais salvos

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `profile_id` | uuid | — | FK → profiles |
| `platform` | text | — | Plataforma |
| `url` | text | — | URL |
| `position` | integer | 0 | Ordem |

### `sections` — seções customizadas

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `profile_id` | uuid | — | FK → profiles |
| `name` | text | — | Nome da seção |
| `position` | integer | 0 | Ordem |
| `is_visible` | boolean | true | Visível |
| `bg_color` | text | null | Cor de fundo |
| `created_at` / `updated_at` | timestamptz | now() | Timestamps |

### `analytics` — page views e cliques

| Coluna | Tipo | Default | Descrição |
|--------|------|---------|-----------|
| `profile_id` | uuid | — | FK → profiles |
| `link_id` | uuid | null | Link clicado (se aplicável) |
| `event_type` | text | — | `page_view` / `link_click` |
| `referrer` | text | null | Referrer |
| `user_agent` | text | null | User agent |
| `created_at` | timestamptz | now() | Timestamp |

> O endpoint público `GET /api/profile/:username` faz `SELECT *` do perfil, então
> **colunas novas aparecem automaticamente** no payload.

### Migrações
O projeto **não** roda `drizzle-kit push` em CI (o prompt interativo trava em
ambiente não-TTY). O padrão usado aqui é **scripts pontuais** em `scripts/*.mjs`
que rodam `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` direto no banco:

```bash
node scripts/migrate-events-location-price.mjs
node scripts/migrate-sections-fonts-payment.mjs
```

Para criar uma migração nova, copie um desses arquivos (eles leem `DATABASE_URL`
do `.env`, conectam com SSL e aplicam os `ALTER TABLE`).

Alternativa (interativa, local): `npm run push -w lib/db` (drizzle-kit).

---

## 🌐 API — endpoints

Base: `/api`. Rotas autenticadas exigem `Authorization: Bearer <clerk-jwt>`.

**Perfil**
- `GET /api/me` · `GET /api/me/username-check` · `PUT /api/me` · `PATCH /api/profile`
- `GET /api/profile/:username` *(público)*

**Links** — `GET/POST /api/links` · `PUT /api/links/reorder` · `PUT/DELETE /api/links/:id`

**Fotos** — `GET/POST /api/photos` · `POST /api/photos/upload` · `PUT /api/photos/reorder`
· `PUT/DELETE /api/photos/:id` · `GET /api/photos/public/:username`

**Eventos** — `GET/POST /api/events` · `PUT /api/events/reorder` · `PUT/DELETE /api/events/:id`
· `GET /api/events/public/:username`

**Analytics / Contabilidade** — `GET/POST /api/analytics` · `GET /api/dashboard/stats`
· `GET /api/dashboard/monetization`

**Seções** — `GET/POST /api/sections` · `PUT /api/sections/reorder` · `PUT/DELETE /api/sections/:id`

**Storage** — `POST /api/storage/uploads/request-url` · `GET /api/storage/objects/*`

**Outros** — `GET /api/healthz` · `GET /api/proxy-image` · `GET /api/admin/artists` · `GET /api/debug/*`

> ⚠️ **Ordem das rotas importa no Express.** Rotas específicas (`/events/reorder`)
> devem vir **antes** de rotas com parâmetro (`/events/:id`), senão `:id` captura
> `"reorder"`.

---

## 🔑 Variáveis de ambiente

Crie um `.env` na raiz (não versionado). Variáveis:

| Variável | Onde | Descrição |
|----------|------|-----------|
| `DATABASE_URL` | Backend | String de conexão Postgres (Supabase). SSL ativado automaticamente fora de localhost. |
| `SUPABASE_URL` | Backend | URL do projeto Supabase. |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend | Service role key (uploads no Storage). |
| `SUPABASE_ANON_KEY` | Backend | Fallback p/ uploads. |
| `SUPABASE_STORAGE_BUCKET` | Backend | Nome do bucket (`linkhub`). |
| `CLERK_PUBLISHABLE_KEY` | Backend | Chave pública do Clerk. |
| `CLERK_SECRET_KEY` | Backend | Chave secreta do Clerk. |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend | Chave pública do Clerk (build-time). |
| `VITE_API_BASE_URL` | Frontend (opcional) | Sobrescreve a URL da API. Se ausente: Railway em prod, `localhost:3001` em dev. |
| `API_PORT` | Backend | Porta da API (default `3001`). |
| `WEB_PORT` | Frontend | Porta do Vite (default `3000`). |
| `DEMO_MODE` | Ambos | `true` roda **sem banco** (dados de demonstração em memória). |
| `ALLOWED_ORIGINS` | Backend (opcional) | Lista separada por vírgula de origens permitidas no CORS. Se **ausente**, mantém o comportamento permissivo atual (reflete qualquer origem). Ex: `https://hubvoid.vercel.app`. |
| `ENABLE_DEBUG` | Backend (opcional) | `true` ativa as rotas `/api/debug/*`. **Padrão desligado** (inclusive em prod): as rotas respondem 404. |
| `ASAAS_API_KEY` | Backend (assinatura) | Chave de API do Asaas (sandbox ou produção) — usada para criar clientes/assinaturas (etapa do checkout). |
| `ASAAS_WEBHOOK_TOKEN` | Backend (assinatura) | Token configurado no painel do Asaas (Webhooks); o backend valida o header `asaas-access-token` contra ele. |

> **Vercel (frontend):** basta `VITE_CLERK_PUBLISHABLE_KEY` (e opcionalmente
> `VITE_API_BASE_URL`). **Não** coloque `DATABASE_*`/`SUPABASE_*` no projeto do frontend.
> **Railway (backend):** todas as do backend (`DATABASE_URL`, `SUPABASE_*`, `CLERK_*`).

---

## 💻 Rodando localmente

Pré-requisitos: Node 18+ e um Postgres acessível (ou `DEMO_MODE=true`).

```bash
# 1. Instalar (o projeto usa legacy-peer-deps — já configurado em .npmrc)
npm install --legacy-peer-deps

# 2. Criar o .env na raiz (ver seção de variáveis)

# 3. Subir frontend + backend juntos
npm run dev
#   API → http://localhost:3001
#   WEB → http://localhost:3000
```

Scripts úteis:
```bash
npm run dev:web      # só o frontend (Vite)
npm run dev:api      # só a API (rebuild esbuild + run)
npm run build        # typecheck + build de todos os workspaces
npm run typecheck    # checagem de tipos
npm run seed         # popular dados (scripts/src/seed.ts)
```

> ⚠️ A **API não tem hot-reload**: `dev:api` builda uma vez e roda. Após mexer no
> backend, **reinicie** o `npm run dev`. O frontend (Vite) recarrega sozinho.

---

## 🚀 Deploy em produção — passo a passo

A arquitetura usa **3 serviços**: Supabase (banco + storage), Railway (API) e
Vercel (frontend). O deploy de código é **automático no push para `main`**.

### Passo 0 — Pré-requisitos (uma vez)
1. Conta no **GitHub** com o repositório.
2. Conta no **Supabase** (banco PostgreSQL + Storage).
3. Conta no **Clerk** (autenticação).
4. Conta no **Railway** (backend) e no **Vercel** (frontend).

### Passo 1 — Supabase (banco + storage)
1. Crie um projeto no Supabase. Em **Project Settings → Database → Connection
   string**, copie a URI (formato `postgresql://...`). Essa é a `DATABASE_URL`.
2. Em **Project Settings → API**, copie `Project URL` (`SUPABASE_URL`),
   `service_role` key (`SUPABASE_SERVICE_ROLE_KEY`) e `anon` key.
3. Em **Storage**, crie um bucket **público** chamado `linkhub`
   (`SUPABASE_STORAGE_BUCKET=linkhub`). *(A API tenta criar automaticamente, mas
   criar manualmente evita problemas de permissão.)*
4. **Crie as tabelas/colunas**: rode os scripts de migração apontando para o banco
   (ver seção [Migrações](#migrações)). Para um banco do zero, rode todos os
   `scripts/migrate-*.mjs` e crie as tabelas base (events/links/photos/etc.) — ou
   restaure um dump do banco atual.

### Passo 2 — Clerk (autenticação)
1. Crie uma aplicação no Clerk.
2. Copie a **Publishable key** (`pk_...`) e a **Secret key** (`sk_...`).
3. Em produção, configure o domínio do frontend nas **allowed origins** do Clerk.

### Passo 3 — Backend no Railway
1. **New Project → Deploy from GitHub repo** (selecione o repositório).
2. Em **Settings → Build**: o Railway detecta Node. Garanta:
   - **Build Command:** `npm install --legacy-peer-deps && npm run build -w artifacts/api-server`
   - **Start Command:** `node artifacts/api-server/dist/index.mjs` (ou deixe o `Procfile` cuidar disso).
3. Em **Variables**, adicione: `DATABASE_URL`, `SUPABASE_URL`,
   `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_STORAGE_BUCKET`,
   `CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`. (Railway injeta `PORT` automaticamente.)
4. Deploy. Anote a URL pública (ex: `https://SEU-APP.up.railway.app`).
5. Teste: `GET https://SEU-APP.up.railway.app/api/healthz` → deve responder OK.

### Passo 4 — Frontend no Vercel
1. **Add New → Project** (importe o mesmo repositório).
2. **Settings → General → Root Directory:** `artifacts/void` ⚠️ (crítico — é por
   isso que o `artifacts/void/vercel.json` é o que vale, e não o da raiz).
3. **Framework Preset:** Vite. **Build Command:** `vite build` →
   **Output Directory:** `dist/public`.
4. **Install Command:** `npm install --legacy-peer-deps`.
5. Em **Environment Variables**, adicione:
   - `VITE_CLERK_PUBLISHABLE_KEY` = a publishable key do Clerk.
   - `VITE_API_BASE_URL` = a URL do Railway (Passo 3). *(Se omitir, o frontend usa
     o fallback em `src/lib/api-base.ts` — atualize-o se a URL do Railway mudar.)*
6. Deploy. O **SPA fallback** (`artifacts/void/vercel.json`) garante que recarregar
   qualquer rota sirva o `index.html` (sem 404).

### Passo 5 — Verificação pós-deploy
1. `GET .../api/healthz` no Railway → OK.
2. Abrir `https://SEU-FRONTEND.vercel.app` → landing carrega.
3. Login (Clerk) → dashboard.
4. Abrir um perfil público `?user=USERNAME` e **recarregar** (testa SPA fallback).
5. Testar upload de imagem (avatar/banner) → confirma Storage + token.

### Fluxo de deploy contínuo (dia a dia)
1. `npm run build` passa localmente.
2. **Migrações novas aplicadas no banco** (rode os `scripts/*.mjs` — eles agem
   direto no Supabase, então valem para todos os ambientes).
3. `git commit` + `git push origin main`.
4. Vercel e Railway reconstroem sozinhos; aguardar ficarem **Ready**.
5. Testar em produção (hard refresh `Ctrl+Shift+R` se houver cache).

> ⚠️ Como o banco é compartilhado (Supabase), **rodar a migração já reflete em
> produção** — faça o `ALTER TABLE` antes/junto do deploy do código que usa a coluna,
> senão a API pode dar 500 ("column does not exist").

---

## 🔁 Migrar o backend para outra plataforma

O backend é um **app Node/Express padrão**, bundlado em **um único arquivo**
(`artifacts/api-server/dist/index.mjs`). Isso o torna muito portátil. Em qualquer
plataforma, o processo é o mesmo:

```bash
# build
npm install --legacy-peer-deps
npm run build -w artifacts/api-server
# run
node artifacts/api-server/dist/index.mjs   # respeita PORT / API_PORT
```

Defina as env vars do backend e pronto. Pontos de atenção: a porta vem de
`API_PORT` ou `PORT`; o CORS já aceita qualquer origem; o banco e o storage são
externos (Supabase), então nada precisa mudar neles.

**Render / Fly.io / Heroku**
- Build command: `npm install --legacy-peer-deps && npm run build -w artifacts/api-server`
- Start command: `node artifacts/api-server/dist/index.mjs` (Heroku/Railway usam o `Procfile`).

**VPS / Docker** — exemplo de `Dockerfile`:
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps && npm run build -w artifacts/api-server
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "artifacts/api-server/dist/index.mjs"]
```

**Vercel (Serverless)** — já existe `artifacts/api-server/vercel.json` com
build/output configurados (deploy alternativo).

**Depois de migrar:** aponte o frontend para a nova URL — via env
`VITE_API_BASE_URL` na Vercel, **ou** editando o fallback em
`artifacts/void/src/lib/api-base.ts`. Rebuild o frontend.

---

## 🔀 Migrar o banco / storage

**Trocar de provedor de Postgres** (Supabase → Neon, RDS, Postgres próprio, etc.):
1. Crie o banco novo e gere o dump/restore das tabelas (ou rode todos os
   `scripts/*.mjs` + o schema Drizzle para recriar).
2. Troque `DATABASE_URL`. O cliente (`lib/db/src/index.ts`) ativa SSL
   automaticamente fora de localhost.
3. Nenhuma mudança de código é necessária — o Drizzle é agnóstico de provedor.

**Trocar o storage de imagens** (Supabase Storage → S3/R2/etc.):
- A lógica está isolada em `artifacts/api-server/src/routes/photos.ts`
  (`uploadToSupabase`) e `src/lib/objectStorage.ts`. Reimplemente o upload para
  o novo provedor mantendo o retorno `{ url }`. O frontend não muda.

---

## 🛠 Manutenção do código

### Adicionar um campo editável no perfil (padrão usado no projeto)
1. **Schema** — adicione a coluna em `lib/db/src/schema/profiles.ts`.
2. **Migração** — crie/rode um `scripts/migrate-*.mjs` com
   `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ...`.
3. **Validação** — adicione o campo em `UpdateProfileBody`
   (`lib/api-zod/src/generated/api.ts`).
4. **API** — mapeie em `PUT /api/me` (`artifacts/api-server/src/routes/profile.ts`,
   bloco `updateData`).
5. **Frontend** — use em `customization.tsx` (estado + save via `customFetch`/`PUT /api/me`)
   e leia em `public/profile.tsx`.
6. **Reinicie** o `npm run dev` (a API não recompila sozinha).

### Adicionar um endpoint
- Crie/edite o router em `artifacts/api-server/src/routes/`, monte em `routes/index.ts`.
- **Lembre da ordem:** rota fixa antes de `/:id`.

### Frontend — chamadas à API
- Use `customFetch` (de `@workspace/api-client-react`) — já prepende a base URL e
  o token do Clerk. Para upload de arquivo, use `uploadImage()` de `lib/api-base.ts`.
- A base URL é resolvida em `lib/api-base.ts` (e aplicada via `setBaseUrl` em `main.tsx`).

### Reordenação (drag-and-drop)
- Padrão `@dnd-kit` (ver `links.tsx`/`photos.tsx`/`events.tsx`): `DndContext` +
  `SortableContext` + endpoint `PUT /api/<recurso>/reorder` que recebe `{ ids: [...] }`.

### Ordem visual sem mover JSX
- Tanto as seções do perfil quanto os cards da customização usam o truque de
  **CSS `order`** num container `flex flex-col` — reordenar = trocar o número do
  `style={{ order }}`.

### Build / qualidade
```bash
npm run typecheck          # tipos de todos os workspaces
npm run build              # build completo
npx vite build             # (em artifacts/void) build só do frontend
node ./build.mjs           # (em artifacts/api-server) build só da API
```

---

## 🧯 Problemas comuns (troubleshooting)

| Sintoma | Causa / Solução |
|---------|------------------|
| **404 ao recarregar uma sub-rota** em produção | SPA fallback. Garanta `artifacts/void/vercel.json` (rewrite p/ `/index.html`) e que o Root Directory da Vercel é `artifacts/void`. |
| **Upload 404 (`/api/photos/upload`)** | O `fetch` precisa usar a URL absoluta + token. Use `uploadImage()` (`lib/api-base.ts`), nunca `fetch("/api/...")` cru. |
| **API 500 após adicionar coluna** | A coluna não existe no banco de produção. Rode o `scripts/migrate-*.mjs`. |
| **`/events/reorder` dá erro/500** | Ordem das rotas: `reorder` deve estar **antes** de `/events/:id`. |
| **Mudei o backend e nada mudou** | A API não tem hot-reload — reinicie `npm run dev`. |
| **Porta 3000/3001 ocupada (Windows)** | Veja `LIBERAR_PORTAS_WINDOWS.md` (ou `Stop-Process -Id <PID> -Force`). |
| **`npm install` falha por peer deps** | Use `--legacy-peer-deps` (já no `.npmrc`). |
| **Sem banco para testar** | `DEMO_MODE=true` no `.env` (dados em memória). |
| **Favicon/logo antigo** | Cache agressivo do navegador — hard refresh (Ctrl+Shift+R). |

---

## 🔒 Segurança

### O que já está bem feito
- **Autenticação** via Clerk: todas as rotas privadas exigem `Authorization:
  Bearer <jwt>`, validado por `@clerk/express`.
- **Autorização / isolamento por dono**: as operações de `links`, `photos`,
  `events`, `sections` resolvem o `profileId` a partir do `userId` do token e
  filtram/atualizam sempre por `and(eq(id), eq(profileId))` — um usuário não
  consegue ler/editar dados de outro. Os endpoints `*/reorder` validam que todos
  os ids pertencem ao usuário.
- **Admin** (`/api/admin/*`): checa `is_super_admin` → 403 se não for.
- **Validação de entrada** com Zod (`UpdateProfileBody`, etc.).
- **Uploads**: validação de tipo (image/video) e limite de tamanho (60MB) no
  Multer; o `SUPABASE_SERVICE_ROLE_KEY` fica **só no servidor** (nunca exposto ao
  cliente).
- **Banco**: SSL forçado fora de localhost; segredos só em variáveis de ambiente;
  `.env*` no `.gitignore`.

### ✅ Correções já aplicadas
1. **Rotas de debug fechadas** — `/api/debug/*` agora ficam **desativadas por
   padrão** (respondem 404), inclusive em produção. Só ativam com `ENABLE_DEBUG=true`.
2. **CORS endurecível** — agora aceita `ALLOWED_ORIGINS` (allowlist). Sem a env,
   mantém o padrão permissivo (sem quebrar nada); defina-a em produção para
   restringir à origem do frontend.
3. **proxy-image anti-SSRF** — passou a validar o **hostname real** (precisa
   terminar em `.supabase.co`) e o protocolo http(s), evitando burlas tipo
   `supabase.co.evil.com`.

### ⚠️ Itens recomendados (operacionais / próximo passo)
4. **Definir `ALLOWED_ORIGINS`** em produção (Railway) com o domínio do frontend.
5. **Rate limiting** — adicionar `express-rate-limit` (ou limites no
   Railway/Cloudflare), principalmente em `/api/analytics`, `/api/photos/upload` e
   no formulário de contato, para evitar abuso/spam. *(Não aplicado ainda para
   evitar risco de bloquear tráfego legítimo sem monitoramento.)*
6. **Chaves do Clerk de produção** — migrar de `pk_test`/`sk_test` para
   `pk_live`/`sk_live` com o domínio configurado.
7. **Validação de URL/conteúdo** — campos de URL (links, sponsors, ticketUrl) são
   conteúdo do próprio dono; ainda assim, validar o esquema (`https:`) reforça.

---

## 📈 Escalabilidade

### Como está hoje
- **Frontend**: estático na Vercel (CDN global) — escala praticamente sem limite.
- **Backend**: processo Node único no Railway, **stateless** (sem estado em
  memória) → dá para **escalar horizontalmente** (mais réplicas) sem mudança de
  código.
- **Banco**: Supabase Postgres com **pool de conexões** (`pg.Pool`).
- **Storage**: Supabase Storage (bucket público) servido por CDN.

### O que segura o crescimento (e como resolver)
1. **Conexões do Postgres** — cada réplica do backend abre um pool. Postgres tem
   limite de conexões. **Ação ao escalar réplicas:** usar o **pooler do Supabase
   (pgbouncer, porta 6543, `?pgbouncer=true`)** — já existe uma linha comentada no
   `.env` para isso. Essencial se um dia migrar a API para serverless.
2. **`bundle` único / cold start** — no Railway (long-running) não há cold start.
   Se migrar para serverless (Vercel Functions/Lambda), some o pgbouncer e cuidar
   do cold start.
3. **Analytics gravando em tabela** — cada page view/click faz um `INSERT`. Em
   escala alta isso pesa. **Ação:** índices em `analytics(profile_id, event_type,
   created_at)`, e eventualmente agregar (rollup) por dia ou usar um serviço de
   analytics dedicado.
4. **Índices** — garantir índices em todas as FKs `profile_id` (links, photos,
   events, sections, analytics) e em `profiles.username` / `profiles.clerk_user_id`
   (já únicos → indexados). Isso mantém as queries do perfil público rápidas.
5. **Uploads grandes (vídeo 60MB)** passam pelo backend (memória do Multer). Em
   escala, considerar **upload direto ao Storage via presigned URL**
   (já existe o esboço em `POST /api/storage/uploads/request-url`) para não
   carregar o arquivo na RAM da API.
6. **Cache do perfil público** — `GET /api/profile/:username` é o endpoint mais
   acessado. Adicionar `Cache-Control`/CDN (ou um cache curto) reduz carga no banco.
7. **Imagens** — servir via CDN do Supabase (ok) e considerar transformações/
   `srcset` para não baixar imagens enormes no mobile.

**Resumo:** a base é sólida e escala bem para milhares de perfis sem mudanças
estruturais. Antes de um volume alto, priorize: **pgbouncer**, **índices em
`analytics` e FKs**, **rate limiting** e **remover as rotas de debug**.

---

## 📄 Documentos relacionados

- `DEPLOYMENT_CHECKLIST.md` — checklist de deploy
- `SETUP_VERCEL.md` — setup da Vercel
- `LIBERAR_PORTAS_WINDOWS.md` — liberar portas no Windows

---

🤖 Documentação gerada com auxílio do [Claude Code](https://claude.com/claude-code).
