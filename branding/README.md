# AhiruDrop · Branding Kit

> Versão 1.1 · 2026-04-29

Toda a identidade visual do AhiruDrop em um lugar só. Use pra design, mídias sociais, parcerias, materiais impressos.

## 🚦 Status atual

- ✅ **Brand v0** (SVG dev placeholders) — em `logo/` e `social/`. Funcional mas substituível.
- ✅ **Brand v1 vision board** — composite AI-gerado aprovado (mascote moeda + personagem anime + estilo dark luxury). Imagem de referência guardada em `v1-reference/` quando disponível.
- ⏳ **Source files v1** — pendente. Designer profissional precisa recriar elementos isolados (PSD/AI). Brief em `DESIGNER_BRIEF.md`.
- ⏳ **Integração no site** — só após source files chegarem. Hoje site usa wordmark texto v0.

---

## Estrutura

```
branding/
├── BRAND.md                              ← guidelines escritos (v1.1)
├── README.md                             ← você está aqui
├── DESIGNER_BRIEF.md                     ← briefing pronto pra contratar designer
├── PRODUCTION_BLUEPRINT.md               ← spec master de produção (PSD)
├── palette.json                          ← design tokens (Figma-ready)
├── palette.css                           ← variáveis CSS prontas
├── swatches.html                         ← sheet visual de cores
├── pitch-deck.html                       ← apresentação 10 slides
│
├── logo/                                 ← SVGs v0 (placeholder)
│   ├── logo-icon.svg
│   ├── logo-full.svg
│   ├── logo-mono-white.svg
│   └── logo-mono-black.svg
│
└── social/                               ← templates v0
    ├── avatar.svg
    ├── twitter-banner-1500x500.svg
    ├── instagram-post-template-1080.svg
    └── twitter-post-template-1600x900.svg
```

> **Quando v1 source files chegarem do designer:** entregue em `branding/production/` seguindo a estrutura completa do `PRODUCTION_BLUEPRINT.md` (01_Logos, 02_AHC_Coin, 03_Tickets, etc.). Os SVGs em `logo/` e `social/` ficarão como referência histórica.

---

## Como usar cada arquivo

### `BRAND.md`
Documento com regras escritas: tom de voz, paleta, tipografia, regras de uso do logo, padrões visuais, acessibilidade. **Leia antes de aplicar a marca em qualquer mídia nova.**

### `palette.json`
Design tokens em formato W3C Design Tokens. Importável em:
- **Figma** via plugins como "Tokens Studio" ou "Figma Tokens"
- **Style Dictionary** pra gerar temas iOS/Android/Web
- Qualquer ferramenta de design que aceite JSON

### `palette.css`
Drop-in CSS file com todas as variáveis prefixadas `--ahiru-*`. Use em projetos externos:

```html
<link rel="stylesheet" href="palette.css">
<style>
  .my-button { background: var(--ahiru-primary-600); }
</style>
```

### `swatches.html`
Sheet visual completo com todas as cores, hex, gradientes e amostras de tipografia. Abre direto no browser (duplo-click). Use pra:
- **Imprimir** (Ctrl+P → PDF) e mandar pra designer/agência
- **Screenshot** de seções pra apresentações
- **Compartilhar** o arquivo standalone (zero dependências)

### `pitch-deck.html`
Apresentação institucional de 10 slides com a paleta aplicada. Abre no browser, scroll snap entre slides. Use pra:
- Apresentar pra **investidores**, parceiros, possíveis funcionários
- Imprimir em PDF (Ctrl+P) — formatação printer-friendly incluída
- Screenshots dos slides individuais
- Base pra customizar (edite o HTML diretamente)

### Logos

**Quando usar cada um:**

| Arquivo | Quando |
|---------|--------|
| `logo-full.svg` | Site, apresentações, banners horizontais — onde tem espaço |
| `logo-icon.svg` | Favicon, app icon, social avatars, espaços pequenos |
| `logo-mono-white.svg` | Fundos coloridos / escuros, watermarks, Discord embeds |
| `logo-mono-black.svg` | Impressão monocromática, papéis fiscais, formulários |

**Regra de ouro:** sempre dê **espaço de respiro** mínimo igual à altura do pato em cada lado.

### Social

**`avatar.svg`** — fonte master 1024×1024.

Pra exportar nas resoluções padrão:
1. Abrir em Figma / Inkscape / browser
2. Exportar como PNG nas dimensões:
   - **1024×1024** — Instagram, Discord large
   - **512×512** — Twitter, LinkedIn
   - **400×400** — Twitter retina
   - **256×256** — Discord small avatar, favicon source
   - **96×96** — Discord member list

Ou via linha de comando (com `rsvg-convert` ou `inkscape`):

```bash
rsvg-convert -w 1024 avatar.svg > avatar-1024.png
rsvg-convert -w 512  avatar.svg > avatar-512.png
rsvg-convert -w 256  avatar.svg > avatar-256.png
```

**`twitter-banner-1500x500.svg`** — sobe direto no Twitter/X. Importante: o Twitter corta as bordas em telas pequenas; todo conteúdo importante está na faixa central (margem ~150px nas laterais).

**Templates de post (Instagram + Twitter)** — são templates **com placeholders** `{SKIN_NAME}`, `{PRICE}`, etc. Pra usar:

1. Abra o SVG em editor (Figma, Inkscape, Adobe Illustrator)
2. Substitua os placeholders pelos valores reais da rifa
3. **Substitua o retângulo dashed `<SKIN IMAGE GOES HERE>`** pela imagem PNG da skin (transparente, do mesmo tamanho)
4. Exporte como PNG/JPG e poste

Workflow alternativo (se quiser automatizar): podemos transformar esses templates em rota Next.js que gera a imagem dinamicamente via `ImageResponse`, igual fizemos pro OG das rifas. Falar com o dev se interessar.

---

## Versionamento

- Tudo aqui é **v0** — proposta inicial feita pelo time interno.
- Antes de virar identidade definitiva, **recomenda-se passar por designer profissional** pra refinar o mascote, ajustar tipografia (talvez customizar Geist), criar variações de mascote (pose feliz, vencedor, surprised, etc.) e gerar artworks promocionais.
- Mudanças aqui devem **acompanhar mudanças no código** (`src/app/globals.css`, `src/constants/cs2.ts`, `src/components/shared/logo.tsx`). Marca e código são uma coisa só.

---

## Próximos passos sugeridos

- [ ] **Designer profissional** pra revisar o mascote (kawaii pode evoluir, manter conceito)
- [ ] **Variações do mascote** pra estados (feliz, comemorando, surpreso, dormindo)
- [ ] **Mascot lottie/anime** pra usar em loading states e celebrações
- [ ] **Templates animados** (MP4/GIF) pra Twitter/Instagram Reels
- [ ] **Brand book PDF** definitivo (consolidar BRAND.md + visual)
- [ ] **Som da marca** (logo sting, vitória, depósito) — use só se virar app/vídeo
- [ ] **Mockups de produto** pra mídias sociais (devices com a página da rifa)

---

**Mantenedor:** Thiago Lucas
**Repositório:** github.com/SenshiAhiru/AhiruDrop
