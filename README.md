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

PostgreSQL (Supabase). Schema em `lib/db/src/schema/`. Tabelas:

| Tabela          | Descrição |
|-----------------|-----------|
| `profiles`      | Perfil do usuário (1:1 com Clerk user). Username, bio, avatar, banner, tema, cores, layout, vídeo, contatos, **heroDisplay/heroLayout/heroAlign/socialIconsAlign/usernameFont**, **sectionOrder**, **sponsors**, **footerText**. |
| `links`         | Links do perfil (icon/plataforma, `cardType` = `default`/`spotify`/`soundcloud`, posição, clickCount). |
| `photos`        | Galeria (url, caption, posição, isCover). |
| `social_links`  | Links sociais salvos (opcional; o hero também deriva ícones dos `links`). |
| `events`        | Shows/eventos: título, descrição, data, **street/city/state**, ticketUrl, imageUrl, **price**, **paymentReceived**, posição, isVisible. |
| `sections`      | Seções customizadas. |
| `analytics`     | Page views e cliques em links. |

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

## 🚀 Deploy em produção

O deploy é **automático no push para `main`** (GitHub conectado à Vercel e ao Railway).

### Frontend → Vercel
- **Root Directory** do projeto Vercel: `artifacts/void`.
- Build: `vite build` → saída em `artifacts/void/dist/public`.
- **SPA fallback:** `artifacts/void/vercel.json` reescreve qualquer rota para
  `/index.html` (necessário para recarregar sub-rotas sem 404).
- Env var: `VITE_CLERK_PUBLISHABLE_KEY`.

### Backend → Railway
- Build: `npm run build -w artifacts/api-server` (esbuild → `dist/index.mjs`).
- Start: `Procfile` → `node artifacts/api-server/dist/index.mjs`.
- Escuta em `API_PORT`/`PORT`. CORS já liberado (`origin: true`).
- Env vars: `DATABASE_URL`, `SUPABASE_*`, `CLERK_*`.

### Checklist de deploy
1. `npm run build` passa localmente.
2. Migrações novas aplicadas no banco (rode os `scripts/*.mjs`).
3. Commit + push para `main`.
4. Aguardar Vercel e Railway ficarem **Ready**.
5. Testar `https://hubvoid.vercel.app` (hard refresh se favicon/cache antigo).

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

## 📄 Documentos relacionados

- `DEPLOYMENT_CHECKLIST.md` — checklist de deploy
- `SETUP_VERCEL.md` — setup da Vercel
- `LIBERAR_PORTAS_WINDOWS.md` — liberar portas no Windows

---

🤖 Documentação gerada com auxílio do [Claude Code](https://claude.com/claude-code).
