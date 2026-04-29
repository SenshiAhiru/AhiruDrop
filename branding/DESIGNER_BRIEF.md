# 🦆 AhiruDrop — Designer Brief

> Briefing pronto pra contratar designer profissional. Cole/envie como está, ou use como base pra DM em Fiverr/Workana/Instagram.

---

## Sobre o projeto

**AhiruDrop** é uma plataforma brasileira de rifas de skins de Counter-Strike 2 já em produção (`ahirudrop.vercel.app`). Sorteios provably fair via blockchain Bitcoin, pagamentos via PIX e cartão. Comunidade Discord ativa.

Concorrentes diretos visualmente: **CSGO.NET, Hellcase, Keydrop**. Nosso posicionamento: dark luxury + premium economy + community trust.

---

## O que precisamos

Pacote visual completo com **PSD/AI source files editáveis** + exports em PNG/JPG/WebP/SVG. Estrutura final detalhada abaixo. Já temos uma **vision board AI-gerada** que serve como referência aprovada — o trabalho é **recriar elementos isolados nessa estética** com source files limpos.

---

## Vision board atual

> [Anexar imagem de referência: o composite com mascote + personagem anime + banners + posts]

**Elementos visíveis na referência:**

- ✅ Mascote: pato kawaii dentro de moeda dourada com borda roxa (já temos só o ícone PNG isolado)
- ✅ Personagem anime: garota cabelos prateados, traços élficos, vestes pretas + roxas (presente em vários banners — é elemento recorrente)
- ✅ Lightning FX, partículas roxas, glow dourado em todos os layouts
- ✅ Tipografia bold + Orbitron-style em headlines
- ✅ Layouts de banner Discord, banner Twitter, banner site
- ✅ Pack de 6 posts Instagram (templates por tema)
- ✅ 4 templates Story/Reels
- ✅ Hero section do site mockada
- ✅ 5 ícones de highlight Instagram
- ✅ Ícones gráficos: ticket, caixa premium, coroa, PIX, badges

**O que falta** (e é onde precisamos do designer):

- ❌ Source files PSD/AI editáveis de tudo
- ❌ Mascote do pato isolado em alta resolução (vetor SVG idealmente)
- ❌ Variações de pose da personagem anime (vencedora, surprised, sleeping, pointing)
- ❌ Logo em todas variações documentadas abaixo
- ❌ Banners e templates como PSDs separáveis
- ❌ Sistema de tickets por raridade

---

## Sistema de cores oficial

| Token | Hex | Uso |
|-------|-----|-----|
| **Primary Purple** | `#7C3AED` | CTAs, brand principal, bordas |
| **Secondary Purple** | `#B26BFF` | Highlights, gradient mid-points |
| **Gold** | `#F59E0B` | CTAs secundários |
| **Accent Gold** | `#FBBF24` | Valores AHC, troféus |
| **Dark Background** | `#09090B` | Fundo principal |
| **Surface Card** | `#18181B` | Cards e containers |
| **White** | `#FFFFFF` | Texto principal |

Paleta completa: ver `palette.json` neste repo (escala 50–950 pra cada cor brand).

---

## Tipografia

### Tier 1 — Marketing/Display (uso no design gráfico)
- **Helvetica Bold** · display, banners
- **Orbitron Bold** · headlines tech (preferida)
- **Montserrat SemiBold** · texto secundário, copy

### Tier 2 — Site/Email (já em produção)
- **Geist Sans** · UI/body
- **Geist Mono** · números, hashes

---

## Entregáveis (estrutura final)

```txt
AhiruDrop_Branding_Master/
├── 01_Logos/             [5 PSDs]
├── 02_AHC_Coin/          [4 PSDs]
├── 03_Tickets/           [4 PSDs por raridade]
├── 04_Social_Media/      [7 PSDs]
├── 05_Discord/           [7 PSDs incl. cargos]
├── 06_Website/           [7 PSDs hero/UI]
├── 07_Paid_Ads/          [5 PSDs Meta/Google]
├── 08_Streamer_Pack/     [4 PSDs Twitch]
└── 09_Assets/            [character cutouts, weapons, gradientes]
```

> Spec completo em `PRODUCTION_BLUEPRINT.md` neste repo.

### Dimensões padrão

| Categoria | Dimensões |
|-----------|-----------|
| Instagram Feed | 1080×1080 |
| Instagram Story/Reels | 1080×1920 |
| Twitter/X Header | 1500×500 |
| YouTube Banner | 2560×1440 |
| Discord Banner | 1920×480 |
| Profile/Favicon | 1024×1024 |
| Hero site | 1920×900 |
| Meta Ad Square | 1080×1080 |
| Meta Ad Vertical | 1080×1350 |

### Estrutura PSD obrigatória

Todos os PSDs devem ter grupos hierárquicos:

```
Background → Character/Mascot → Branding → Marketing → Effects
```

(detalhe completo em `PRODUCTION_BLUEPRINT.md`)

### Formatos de export por asset

- ✅ `.PSD` editável com layers preservadas
- ✅ `.PNG` transparente alta resolução
- ✅ `.JPG` qualidade alta
- ✅ `.WEBP` otimizado
- ✅ `.SVG` (apenas logos e ícones)

---

## Phase / prioridade

### Phase 1 (semana 1–2) — Foundation
- 5 logos
- 4 AHC coins
- 4 tickets
- 1 Discord banner
- **Sem isso, nada mais funciona**

### Phase 2 (semana 3–4) — Social Engine
- 3+ Instagram feed posts
- Stories
- Reels covers
- Twitter header

### Phase 3 (semana 5–6) — Conversion
- Hero site
- Wallet UI / Dashboard
- Provably Fair banner
- Full ad ecosystem

---

## Headlines aprovadas

Mensagens-âncora autorizadas pra ads/posts (caps lock, voz ativa, ≤4 palavras):

- SUA SORTE PODE SER ÉPICA
- GANHE SKINS INSANAS
- RIFAS JUSTAS 100% VERIFICÁVEIS
- DEPOSITE COM PIX
- SUPORTE 24/7
- NOVAS RIFAS NO AR
- PAGAMENTO NA HORA
- 100% JUSTO · 100% VERIFICÁVEL

---

## Estimativa de orçamento

Faixas de mercado pra projetos similares:

| Escopo | Faixa Brasil | Faixa internacional |
|--------|--------------|---------------------|
| Apenas logo + variações | R$ 300–800 | $100–300 |
| Brand kit básico (logo + 5 social + Discord) | R$ 800–2.000 | $300–600 |
| **Bundle completo Phase 1+2** | **R$ 2.000–4.500** | **$600–1.500** |
| Bundle completo Phase 1+2+3 + character poses | R$ 4.500–10.000 | $1.500–3.500 |

Recomendamos começar com **Phase 1 + Phase 2** pra sair do zero, e contratar Phase 3 quando o produto crescer.

---

## Como vai ser o trabalho

1. **Você responde com:** portfólio, prazo estimado, orçamento por phase
2. **A gente alinha:** seleciona phase pra começar, fecha valor, aprova mockups
3. **Você entrega:** PSDs + exports nos formatos pedidos, organizados na estrutura de pastas
4. **A gente integra:** os assets no site, social, Discord. Avalia se precisa ajustes
5. **Iteração:** até 2 rounds de revisão por asset incluídos

---

## Repositório de referência

Tudo em `branding/` no monorepo:

- `BRAND.md` — guidelines completos (cores, tipografia, voz, regras de uso)
- `PRODUCTION_BLUEPRINT.md` — spec técnico completo
- `palette.json` / `palette.css` — design tokens
- `swatches.html` — sheet visual de cores
- `pitch-deck.html` — deck institucional 10 slides
- `logo/` — SVGs v0 (referência inicial, será substituída)
- `social/` — templates v0

Vision board v1 e ícone da moeda AHC: enviados em anexo.

---

## Dúvidas frequentes

**Q: Posso usar AI tools (Midjourney, Stable Diffusion) na produção?**
A: Sim pra ideação, mas o entregável final precisa de PSD editável feito no Photoshop/Illustrator. AI gen sem source file não conta.

**Q: A personagem anime pode mudar?**
A: Mantenha o **conceito** (cabelos prateados, élfica, paleta roxa). Pequenas variações entre poses são esperadas. Mudança radical de personagem precisa de aprovação prévia.

**Q: Posso usar imagens de skins reais do CS2?**
A: Sim — são imagens públicas do Steam Market, uso em divulgação é tolerado. Mantenha sempre a credit/marca AhiruDrop visível.

**Q: Quem fica com os direitos?**
A: AhiruDrop. Designer mantém crédito/portfólio. Contrato simples, padrão Fiverr/Workana.

---

## Contato

- **Email:** contato@ahirudrop.com
- **Discord:** discord.gg/[invite]
- **GitHub:** github.com/SenshiAhiru/AhiruDrop
- **Site:** ahirudrop.vercel.app
