# 💳 Sistema de Assinatura (hubvoid + Asaas)

Documentação completa do sistema de cobrança: como funciona, como isentar
pessoas, taxas, riscos e manutenção.

- **Plano:** R$ 20,00 / mês (valor fixo).
- **Trial:** 3 dias grátis ao criar a conta. Depois, precisa assinar para manter o hub público no ar.
- **Métodos:** PIX (QR Code), Cartão de crédito e Boleto — processados pelo **Asaas** (não tocamos em dados de cartão).
- **Provedor:** Asaas (sandbox e produção).

---

## 🔄 Como funciona (visão geral)

```
Cadastro → trial 3 dias → assina (Asaas) → webhook confirma → hub ativo
                         ↘ não assina → trial expira → hub PÚBLICO fica inativo
```

1. **Trial:** ao criar o perfil, `subscription_status = 'trialing'` e
   `trial_ends_at = agora + 3 dias`.
2. **Acesso é calculado em tempo real** (`computeAccess` em
   `artifacts/api-server/src/routes/subscription.ts`). O hub está **ativo** se:
   - o perfil é **isento** (`subscription_exempt = true`) ou **super admin**; **ou**
   - está **dentro do trial** (`trialing` e `trial_ends_at` no futuro); **ou**
   - tem **assinatura paga vigente** (`active` e `current_period_end` no futuro).
   - ⚙️ Como é calculado na leitura, **não existe cron** para "expirar" — expira sozinho.
3. **Checkout** (`POST /api/subscription/checkout`): cria/reusa o cliente no Asaas,
   cria a assinatura mensal de R$20 e devolve o **QR Code PIX** + a **página de
   pagamento hospedada** (`invoiceUrl`, que cobre PIX/cartão/boleto).
4. **Webhook** (`POST /api/webhooks/asaas`): o Asaas avisa quando o pagamento é
   confirmado/renovado/atrasado. O backend atualiza `subscription_status` e
   `current_period_end`. Protegido pelo header `asaas-access-token`.
5. **Gating (bloqueio):** o endpoint público `GET /api/profile/:username` checa o
   acesso. Se inativo (e o gating estiver ligado), retorna `subscriptionActive:false`
   com o conteúdo oculto, e o frontend mostra a tela **"Hub temporariamente
   indisponível"** (`InactiveHub`). O **dashboard continua acessível** para a pessoa
   pagar.

### Estados de assinatura (`subscription_status`)
| Status | Significado | Hub ativo? |
|--------|-------------|-----------|
| `trialing` | Em período de teste | Sim, até `trial_ends_at` |
| `active` | Assinatura paga vigente | Sim, até `current_period_end` |
| `past_due` | Pagamento atrasado | Não |
| `canceled` | Cancelada/estornada | Não |
| `exempt`* | Cortesia (isento) | Sempre |
*`exempt` não é um valor salvo — é derivado de `subscription_exempt = true`.

---

## 🆓 Como "burlar" — isentar pessoas específicas (cortesia)

Há **duas chaves de controle**:

### 1. Isentar um perfil (recomendado) — `subscription_exempt`
O perfil **nunca é bloqueado e nunca precisa pagar**. Ideal para você, sócios,
amigos, parcerias, influencers de permuta, etc.

```bash
# Dar cortesia (nunca bloqueia, não paga):
node scripts/set-subscription.mjs <username> exempt

# Remover a cortesia:
node scripts/set-subscription.mjs <username> unexempt
```

Ou direto no SQL (Supabase):
```sql
UPDATE profiles SET subscription_exempt = true  WHERE username = 'fulano';
UPDATE profiles SET subscription_exempt = false WHERE username = 'fulano';
```

> **Super admins** (`is_super_admin = true`) também são isentos automaticamente.

> ✅ **No rollout, TODOS os perfis que já existiam foram marcados como isentos**
> (grandfather), então ninguém foi bloqueado. Apenas **novos cadastros** passam
> pelo trial → pagamento.

### 2. Desligar o bloqueio globalmente (kill switch) — `ENFORCE_SUBSCRIPTION`
Desliga o gating para **todo mundo** (volta a não bloquear ninguém). Útil em
emergência ou manutenção.

- No **Railway → Variables**: `ENFORCE_SUBSCRIPTION = false` → ninguém é bloqueado.
- Remover a variável (ou `= true`) → bloqueio ativo (padrão).

### Dar acesso manual sem pagar (ex.: pagou por fora)
```bash
node scripts/set-subscription.mjs <username> active   # libera por 31 dias
node scripts/set-subscription.mjs <username> trial    # reinicia 3 dias de teste
```

---

## 💰 Taxas (Asaas)

> ⚠️ **Valores aproximados** — confirme sempre no painel do Asaas (mudam por plano
> e negociação). **Sandbox é 100% gratuito** (sem taxas, sem dinheiro real).

Ordem de grandeza em **produção** (plano padrão Asaas, sujeito a alteração):

| Método | Taxa típica | Sobre R$ 20 você recebe ~ |
|--------|-------------|---------------------------|
| **PIX** | ~ R$ 1,99 por recebimento | ~ R$ 18,01 |
| **Boleto** | ~ R$ 1,99 por boleto compensado | ~ R$ 18,01 |
| **Cartão de crédito** | ~ 2,99% + R$ 0,49 (à vista) | ~ R$ 18,91 |

Outros pontos:
- **Antecipação** de recebíveis (cartão) tem taxa extra (opcional).
- **Saque/transferência** para sua conta pode ter custo dependendo do plano.
- O Asaas pode ter **plano gratuito** com taxas por transação e planos pagos com
  taxas menores — avalie conforme o volume.
- 💡 Para o seu caso (R$20 recorrente), **PIX é o mais barato**.

---

## ⚠️ Riscos e pontos de atenção

1. **Cartão = chargeback/estorno.** O cliente pode contestar. O Asaas trata, mas
   pode haver estorno. PIX não tem chargeback (mais seguro para você).
2. **PIX recorrente não é débito automático.** Hoje geramos uma cobrança mensal e
   o cliente paga o QR a cada ciclo (ou usa cartão para automático). "Pix
   Automático" pode ser adicionado depois.
3. **Webhook perdido.** Se o Asaas não conseguir entregar o evento, o status pode
   ficar desatualizado. Mitigações: o Asaas reenvia; o botão **"Já paguei /
   Atualizar status"** força a releitura; e dá para reconciliar pelo painel do Asaas.
4. **Abuso de trial.** Cada nova conta ganha 3 dias. Quem criar várias contas
   ganha vários trials. Mitigação futura: limitar trial por e-mail/CPF.
5. **Fiscal / Nota Fiscal.** Cobrar R$20/mês gera receita — verifique a emissão de
   **NF** e tributação (MEI/empresa). O Asaas tem emissão de NF integrada (opcional).
6. **LGPD.** Você passa a tratar **CPF/CNPJ** e dados de cobrança. Isso já está
   coberto na Política de Privacidade; mantenha os dados protegidos.
7. **Dependência de provedor.** Tudo passa pelo Asaas. Caso queira trocar, a lógica
   está isolada em `subscription.ts` (cliente `asaas()` + webhook).
8. **Segurança do webhook.** Use um `ASAAS_WEBHOOK_TOKEN` **forte e secreto** — é o
   que impede alguém de forjar "pagamento confirmado".

---

## 🛠 Manutenção

### Variáveis de ambiente (Railway)
| Variável | Descrição |
|----------|-----------|
| `ASAAS_API_KEY` | Chave da API do Asaas (sandbox **ou** produção). |
| `ASAAS_WEBHOOK_TOKEN` | Token secreto; precisa ser **igual** ao configurado no painel do Asaas (Webhooks). |
| `ASAAS_ENV` | `sandbox` (padrão) ou `production`. |
| `ENFORCE_SUBSCRIPTION` | `false` desliga o bloqueio para todos. Ausente/`true` = ligado. |

### 🕗 Modo de espera: lançar SEM cobrar (enquanto a produção do Asaas não libera)

> ⚠️ O **sandbox NÃO fatura dinheiro real** (pagamentos são simulados). Para cobrar
> de verdade é preciso a **chave de produção**, que só é liberada quando o cadastro
> Asaas está 100% aprovado (faturamento estimado, conta bancária, documentos/KYC).
> Se o botão "Gerar chave de API" estiver bloqueado: complete tudo em
> **Minha Conta → Informações** e, se persistir, fale com o **suporte do Asaas**.

Enquanto a produção não libera, dá para **deixar a plataforma 100% no ar sem
cobrar ninguém**:

1. No **Railway → Variables**, defina `ENFORCE_SUBSCRIPTION = false`.
   → Ninguém é bloqueado; perfis, demo e dashboard funcionam normalmente.
   (Pode deixar a `ASAAS_API_KEY` vazia ou com a de sandbox — sem o gating, o
   checkout não é necessário.)
2. Use esse tempo para finalizar a verificação do Asaas.

**Quando a chave de produção sair — ligar a cobrança em 3 passos:**
1. No Railway: `ASAAS_API_KEY` = chave **de produção**, `ASAAS_ENV` = `production`,
   `ASAAS_WEBHOOK_TOKEN` = um token secreto forte.
2. No Asaas (produção): cadastre o **Webhook de cobranças** (não o "Validação de
   saque"!) — URL `https://link-hub-production.up.railway.app/api/webhooks/asaas`,
   mesmo token, eventos de pagamento/assinatura (ver checklist abaixo).
3. No Railway: **remova** `ENFORCE_SUBSCRIPTION` (ou `= true`) → a cobrança/bloqueio
   passa a valer. Faça um teste real de R$20 (passo 6 do checklist).

> ⚠️ **Cuidado:** a tela **"Validação de saque via Webhook"** do Asaas é OUTRA coisa
> (autoriza seus *saques*). **NÃO** coloque a nossa URL lá — deixe desabilitada.
> Nosso webhook é o de **Cobranças/Notificações** (Integrações → Webhooks).

### ✅ Checklist: ativar em PRODUÇÃO 100% (passo a passo)

Siga na ordem. Tempo estimado: ~20-30 min.

**1. Conta e verificação no Asaas (produção)**
- [ ] Crie/abra a conta de **produção** em https://www.asaas.com (a de sandbox é separada).
- [ ] Complete a **verificação de identidade/empresa** (KYC) — sem isso o Asaas
      não libera saques nem alguns recebimentos. Tenha CPF/CNPJ, dados bancários.
- [ ] Cadastre a **conta bancária** que receberá os repasses.

**2. Pegue a API key de produção**
- [ ] No painel (produção): **Configurações → Integrações → API Key** → copie a chave.
      (É diferente da de sandbox e começa diferente.)

**3. Configure as variáveis no Railway (backend)**
- [ ] `ASAAS_API_KEY` = a **chave de produção**.
- [ ] `ASAAS_ENV` = `production`.
- [ ] `ASAAS_WEBHOOK_TOKEN` = um **token secreto forte** (invente um, ex: 32+ caracteres).
- [ ] `ENFORCE_SUBSCRIPTION` = deixe **sem definir** (ou `true`) para o bloqueio ficar ativo.
- [ ] Salve → o Railway reinicia o serviço.

**4. Configure o Webhook no Asaas (produção)**
- [ ] Painel (produção) → **Configurações → Webhooks → Adicionar**.
- [ ] URL: `https://link-hub-production.up.railway.app/api/webhooks/asaas`
- [ ] Tipo de envio: **Sequencial** (recomendado).
- [ ] **Token de autenticação:** exatamente o mesmo valor de `ASAAS_WEBHOOK_TOKEN`.
- [ ] Eventos a marcar: `PAYMENT_CONFIRMED`, `PAYMENT_RECEIVED`, `PAYMENT_OVERDUE`,
      `PAYMENT_REFUNDED`, `PAYMENT_DELETED`, `SUBSCRIPTION_DELETED`,
      `SUBSCRIPTION_INACTIVATED`.
- [ ] Ative o webhook.

**5. Frontend (Vercel)**
- [ ] Nada obrigatório de pagamento aqui (o front só chama a API). Confirme apenas
      que `VITE_API_BASE_URL` aponta para o Railway de produção.

**6. Teste de ponta a ponta (com dinheiro real, valor baixo)**
- [ ] Crie uma conta nova de teste → confirme o **trial de 3 dias** no dashboard.
- [ ] Vá em **Assinatura** → assine via **PIX** → pague o QR de verdade (R$20).
- [ ] Confirme que o status vira **"Hub ativo"** automaticamente (webhook).
- [ ] No painel do Asaas, confira que o pagamento entrou e o webhook foi entregue
      (há um log de entregas do webhook).
- [ ] Force um cenário inativo: `node scripts/set-subscription.mjs <user> expire`
      → o perfil público deve mostrar **"Hub indisponível"**. Depois `... exempt`
      ou `... active` para reativar.

**7. Fiscal e legal (importante)**
- [ ] Defina como vai **emitir Nota Fiscal** (o Asaas tem emissão automática de NF —
      ative se necessário). Verifique sua situação tributária (MEI/empresa).
- [ ] Revise os e-mails de contato na **Política de Privacidade** e **Termos de Uso**
      (hoje estão como `privacidade@hubvoid.com` / `contato@hubvoid.com`).
- [ ] Confirme que a Política de Privacidade cita o tratamento de **CPF/CNPJ**.

**8. Revisar isenções (cortesias)**
- [ ] Todos os perfis antigos foram marcados como **isentos** no rollout. Decida
      quem deve continuar de cortesia e remova os demais:
      `node scripts/set-subscription.mjs <user> unexempt`.
- [ ] Garanta que **você** (e sócios) estão `exempt` ou são `is_super_admin`.

**9. Monitoramento contínuo**
- [ ] Acompanhe o **log de webhooks** no Asaas (entregas com falha).
- [ ] Acompanhe **inadimplência** (status `past_due`) e cobre/avise os usuários.
- [ ] Tenha um e-mail/canal de suporte para problemas de pagamento.

> Pronto: com os passos 1–4 o sistema já **cobra de verdade**; os passos 6–9
> garantem que está **100% e seguro** para escalar.

### Operações do dia a dia (script)
```bash
node scripts/set-subscription.mjs <username> status     # consultar
node scripts/set-subscription.mjs <username> exempt     # cortesia
node scripts/set-subscription.mjs <username> active     # liberar 31 dias
node scripts/set-subscription.mjs <username> expire     # forçar inativo (teste)
node scripts/set-subscription.mjs <username> hide/show  # esconder/mostrar (is_active)
```

### Onde está o quê (código)
- **Lógica/acesso/checkout/webhook:** `artifacts/api-server/src/routes/subscription.ts`
- **Gating no perfil público:** `artifacts/api-server/src/routes/profile.ts` (`GET /profile/:username`)
- **Trial na criação:** `getOrCreateProfile` em `profile.ts`
- **Tela de assinatura (dashboard):** `artifacts/void/src/pages/dashboard/subscription.tsx`
- **Tela "hub inativo" (público):** `artifacts/void/src/components/public/InactiveHub.tsx`
- **Colunas no banco** (`profiles`): `subscription_status`, `trial_ends_at`,
  `current_period_end`, `asaas_customer_id`, `asaas_subscription_id`,
  `subscription_exempt`.

### Checklist de teste (sandbox)
1. `ASAAS_API_KEY` (sandbox) + `ASAAS_WEBHOOK_TOKEN` no Railway/.env.
2. Webhook configurado no Asaas sandbox apontando para a API.
3. Criar conta nova → ver trial de 3 dias em **Dashboard → Assinatura**.
4. Assinar → pagar PIX no sandbox → status vira **"Hub ativo"**.
5. `node scripts/set-subscription.mjs <username> expire` → o perfil público mostra
   **"Hub temporariamente indisponível"**.
6. `node scripts/set-subscription.mjs <username> exempt` → volta a ficar ativo.
