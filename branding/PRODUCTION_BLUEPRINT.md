# AhiruDrop — PSD Master Production Bundle

> **Versão 1.0** · Spec canônico para produção visual profissional
> Última atualização: 2026-04-29
> Status: 📋 Aguardando execução por designer

Este é o **blueprint master** que descreve toda a entrega visual profissional do AhiruDrop. Designer contratado deve seguir esta estrutura literalmente.

---

## 🎯 Objetivo

Sistema visual profissional escalável globalmente, capaz de competir visualmente com **CSGO.NET, Hellcase, Keydrop** e comunidades premium de gaming.

**Brand Promise:** Dark Luxury + Premium Economy + Community Trust + Global Scalability

---

## 📂 Estrutura mestre de pastas

```txt
AhiruDrop_Branding_Master/
│
├── 01_Logos/
│   ├── AhiruDrop_Main_Logo.psd
│   ├── AhiruDrop_Horizontal_Logo.psd
│   ├── AhiruDrop_Vertical_Logo.psd
│   ├── AhiruDrop_Icon_Only.psd
│   └── AhiruDrop_Favicon.psd
│
├── 02_AHC_Coin/
│   ├── AHC_Coin_Main.psd
│   ├── AHC_Coin_Flat.psd
│   ├── AHC_Coin_Glow.psd
│   └── AHC_Coin_Wallet.psd
│
├── 03_Tickets/
│   ├── Ticket_Common.psd
│   ├── Ticket_Premium.psd
│   ├── Ticket_Diamond.psd
│   └── Ticket_Special.psd
│
├── 04_Social_Media/
│   ├── Instagram_Post_01.psd
│   ├── Instagram_Post_02.psd
│   ├── Instagram_Post_03.psd
│   ├── Instagram_Story_01.psd
│   ├── Instagram_Reels_Cover.psd
│   ├── Twitter_Header.psd
│   └── YouTube_Banner.psd
│
├── 05_Discord/
│   ├── Discord_Server_Banner.psd
│   ├── Discord_Join_Banner.psd
│   ├── Discord_Admin_Role.psd
│   ├── Discord_Moderator_Role.psd
│   ├── Discord_Verified_Role.psd
│   ├── Discord_Winner_Role.psd
│   └── Discord_Support_Role.psd
│
├── 06_Website/
│   ├── Homepage_Hero_Main.psd
│   ├── Homepage_Hero_Promo.psd
│   ├── CTA_Banner.psd
│   ├── Deposit_Banner.psd
│   ├── Provably_Fair_Banner.psd
│   ├── Wallet_UI.psd
│   └── Raffle_Card_Template.psd
│
├── 07_Paid_Ads/
│   ├── Meta_Ad_01.psd
│   ├── Meta_Ad_02.psd
│   ├── Flash_Sale_Ad.psd
│   ├── First_Deposit_Bonus.psd
│   └── Google_Display_Ad.psd
│
├── 08_Streamer_Pack/
│   ├── Twitch_Panel_Setup.psd
│   ├── Twitch_Panel_Deposit.psd
│   ├── Twitch_Panel_Discord.psd
│   └── Streamer_Banner.psd
│
└── 09_Assets/
    ├── Characters/
    ├── Weapons/
    ├── Coins/
    ├── Tickets/
    ├── Icons/
    ├── Backgrounds/
    └── Gradients/
```

> A estrutura está espelhada em `/branding/production/` com READMEs em cada pasta.

---

## 🎨 Sistema oficial de cores

| Token | Hex | Uso primário |
|-------|-----|--------------|
| **Primary Purple** | `#7C3AED` | CTAs principais, brand |
| **Secondary Purple** | `#B26BFF` | Highlights, gradient mid-points |
| **Gold** | `#F59E0B` | CTAs secundários, gradient end |
| **Accent Gold** | `#FBBF24` | Valores AHC, troféus |
| **Dark Background** | `#09090B` | Background da página |
| **Surface Card** | `#18181B` | Cards e containers |
| **White** | `#FFFFFF` | Texto e elementos UI |

> Paleta completa em `branding/palette.json` (com escala 50–950 pra cada cor brand).

---

## 🔤 Sistema tipográfico

### Tier 1 — Marketing & Display

Fontes pesadas, com presença, pra hero/banners/ads.

- **Helvetica Bold** — display, banners impactantes
- **Orbitron Bold** — headlines tech/futurista (preferida pra "ÉPICA", "INSANO", brand voice agressiva)
- **Montserrat SemiBold** — texto secundário, copy, ads

### Tier 2 — Produto & UI (já em produção)

Fontes web-otimizadas, gratuitas via Google Fonts:

- **Geist Sans** — UI, body, formulários
- **Geist Mono** — números de rifa, hashes, valores AHC

### Regra de uso

- **Marketing/social/ads** → Tier 1
- **Site/dashboard/email** → Tier 2

---

## 📐 Dimensões padrão

### Social media

| Plataforma | Dimensões |
|-----------|-----------|
| Instagram Feed | 1080×1080 |
| Instagram Story/Reels | 1080×1920 |
| Twitter/X Header | 1500×500 |
| YouTube Banner | 2560×1440 |
| Discord Banner | 1920×480 |
| Profile/Favicon | 1024×1024 |

### Website

| Elemento | Dimensões |
|----------|-----------|
| Hero | 1920×900 |
| CTA Banner | 1920×600 |
| UI Cards | 600×800 |
| Wallet | 1200×800 |

### Paid ads

| Formato | Dimensões |
|---------|-----------|
| Meta Square | 1080×1080 |
| Meta Vertical | 1080×1350 |
| Display Banner | 1920×1080 |

---

## 🗂️ Estrutura obrigatória de layers PSD

Todos os PSDs **devem** seguir esta hierarquia de grupos:

```txt
Background
 ┣ Gradient Base
 ┣ Lightning FX
 ┣ Particles
 ┗ Overlay

Character / Mascot
 ┣ Main Render
 ┣ Shadow
 ┣ Glow
 ┗ Highlights

Branding
 ┣ Logo
 ┣ Subtitle
 ┣ Coin Elements
 ┗ Tickets

Marketing
 ┣ Headline
 ┣ CTA Button
 ┣ Feature Icons
 ┗ Promo Labels

Effects
 ┣ Glow FX
 ┣ Adjustment Layers
 ┣ Color Grading
 ┗ Export Layer
```

**Por quê:** padronização permite que qualquer designer (atual ou futuro) entre num PSD e edite sem garimpar layers. Também permite automação de export por grupo.

---

## 📦 Formatos de export obrigatórios

Para cada asset, entregar:

- ✅ `.PSD` editável (com layers preservadas)
- ✅ `.PNG` transparente (alta resolução, lossless)
- ✅ `.JPG` qualidade alta (pra plataformas que não aceitam PNG)
- ✅ `.WEBP` otimizado (pra web/dashboard)
- ✅ `.SVG` (apenas logos e ícones)

---

## 🧠 Temas de copy / headlines aprovadas

Mensagens-âncora autorizadas pra ads e social:

- **SUA SORTE PODE SER ÉPICA**
- **GANHE SKINS INSANAS**
- **RIFAS JUSTAS 100% VERIFICÁVEIS**
- **DEPOSITE COM PIX**
- **SUPORTE 24/7**
- **NOVAS RIFAS NO AR**
- **PAGAMENTO NA HORA**

> Variações devem manter caps lock, voz ativa, < 4 palavras.

---

## 🚀 Prioridade de produção

### Phase 1 — Foundation (semana 1–2)
Sem isso, nada mais funciona.

- Logos (todos os 5 variantes)
- AHC Coin (4 variantes)
- Tickets (4 raridades)
- Discord banner

### Phase 2 — Social Engine (semana 3–4)
Ativar redes sociais oficialmente.

- Instagram feed posts (3+)
- Instagram stories
- Reels covers
- Campaign templates

### Phase 3 — Conversion Engine (semana 5–6+)
Site premium + funil de pagamento.

- Homepage hero
- Dashboard / wallet UI
- Provably Fair banner
- Full ads ecosystem (Meta + Google)
- Streamer pack

---

## 🏆 Posicionamento estratégico

AhiruDrop se posiciona visualmente acima de:

- CSGO.NET
- Hellcase
- Keydrop
- Discord gaming communities
- Premium esports startups

**Como:** identidade visual com peso (gold premium + dark luxury), tipografia com presença (Orbitron headlines), mascote característico (não só wordmark), e mensagem de **transparência matemática** (Provably Fair) que concorrentes não conseguem cravar.

---

## 📌 Resultado final esperado

Bundle reutilizável capaz de gerar materiais consistentes em escala global pra:

- Instagram
- Discord
- Website
- Paid ads (Meta + Google)
- Streamers (Twitch panels)
- Comunidade
- Materiais investor-facing

---

## 🦆 AhiruDrop = Premium Global Gaming Raffle Brand
