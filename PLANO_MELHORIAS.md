# 🚀 Plano de Melhorias — hubvoid

Roadmap pós-lançamento. Prioridade: **monetização → analytics → escala**.
Cada fase é independente e pode ser entregue isoladamente.

---

## ✅ Já entregue (lançamento)
- Landing page nova (headline para DJs/artistas, seções Problemas e Solução, CTAs fortes).
- Página de demonstração (`/demo` — DJ fictício "DJ NOVA").
- Assinatura única R$20/mês (Asaas) + trial de 3 dias + gating + isenções.

---

## 💰 Fase 1 — Monetização: planos pagos (≈ 1 semana)
Hoje há **um único plano** (R$20/mês). Evoluir para **3 planos** com gating por recurso.

| Plano | Preço | Recursos |
|-------|-------|----------|
| **Free** | R$ 0 | Até 10 links • Analytics básico • Perfil público |
| **Pro** | R$ 29/mês | Links ilimitados • Analytics completo • **Formulário de contratação** • Perfil premium (temas/vídeo/fontes) |
| **Agency** | R$ 99/mês | Múltiplos artistas • Equipe/permissões • CRM avançado |

**Implementação:**
- Coluna `plan` em `profiles` (`free`/`pro`/`agency`) — atualizada pelo webhook conforme o valor/assinatura do Asaas.
- Criar assinaturas distintas no Asaas (um plano/valor por tier).
- Helper `planAllows(plan, feature)` + gating por recurso (ex.: limite de links no Free).
- Tela de planos (pricing) com comparativo + upgrade/downgrade.
- Migrar o plano atual (R$20) → encaixar como Pro ou ajustar preços.

---

## 📊 Fase 2 — Analytics Profissional (≈ 2 semanas)
Hoje há analytics básico (views/cliques). Transformar em **valor percebido**.

**Mostrar no dashboard:**
- **Visão geral:** Visitas (ex.: 12.340), cliques, taxa de clique, evolução no tempo (gráfico).
- **Origem do tráfego:** Instagram, Google, WhatsApp, TikTok, direto.
- **Cidades / regiões:** São Paulo, Campinas, Santos… (geolocalização por IP).
- **Links mais clicados:** ranking (Spotify, Contratação, Instagram…).
- **Período:** filtros 7/30/90 dias.

**Implementação:**
- Enriquecer `analytics` com `referrer` normalizado e geo (cidade/UF via IP).
- Índices em `analytics(profile_id, event_type, created_at)`.
- Endpoints de agregação + componentes de gráfico (ex.: Recharts).
- Exportar relatório (PDF/CSV) — diferencial para mídia kit.

---

## 📝 Fase 3 — CRM de Propostas / Contratações (≈ 2 semanas)
Transformar o formulário de contato em um **funil de contratação**.

- **Formulário de contratação** estruturado: data do evento, cidade, tipo, cachê, mensagem.
- **Inbox de propostas** no dashboard (status: nova → em conversa → fechada → recusada).
- Notificações (e-mail/WhatsApp) ao receber proposta.
- **Taxa de conversão** (propostas → fechadas).
- Integração com a Agenda (proposta fechada vira evento).

---

## 🏢 Fase 4 — Área Agência & Equipe (≈ 30–90 dias)
- **Agência** gerencia vários artistas na mesma conta (DJ 1, DJ 2, DJ 3…).
- **Equipe** com permissões: **Administrador**, **Manager**, **Artista**.
- Troca de contexto (selecionar qual artista gerenciar).
- Cobrança consolidada (plano Agency).

**Implementação:**
- Tabela `organizations` + `org_members` (papéis) + `profiles.org_id`.
- Middleware de autorização por papel.
- Seletor de artista no dashboard.

---

## 💵 Fase 5 — Gestão Financeira (diferencial)
Dashboard financeiro além da contabilidade atual de eventos.

- **Receitas por mês:** Janeiro R$5.000 • Fevereiro R$7.000 (gráfico).
- **Eventos:** realizados (15) • pendentes (3).
- **Contratações:** taxa de conversão (ex.: 32%).
- Projeção de receita (eventos futuros com cachê).
- Exportação para contabilidade.

---

## 🔍 Fase 6 — SEO & Crescimento
- SSR/meta tags dinâmicas por perfil (Open Graph com foto/nome) para compartilhar bonito.
- Sitemap + perfis indexáveis (quando ativos).
- Domínio próprio por artista (ex.: `djnova.hubvoid.com` ou domínio custom) — upsell.
- Onboarding guiado + templates por nicho (DJ, banda, produtor).

---

## 🔒 Segurança / Infra (contínuo — ver README)
- Rate limiting (uploads, analytics, contato).
- Migrar Clerk para chaves de produção (`pk_live`).
- Definir `ALLOWED_ORIGINS` em produção.
- pgbouncer ao escalar réplicas; índices em FKs.

---

## 🎯 Resumo de prioridades
1. **Planos pagos** (Free/Pro/Agency) — receita.
2. **Analytics avançado** — valor percebido / retenção.
3. **CRM de propostas** — diferencial para DJs/artistas.
4. **SEO** — aquisição.
5. **Área Agência** — ticket maior / escala.
