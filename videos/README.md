# 🎬 AhiruDrop · Videos

Templates de vídeo do AhiruDrop renderizados via **Remotion** (React → MP4).

Cada composição é um componente React que usa `useCurrentFrame()` pra controlar animação por frame. O Remotion renderiza o resultado em MP4/WebM via Chromium + ffmpeg embutidos.

---

## 🚀 Setup inicial (uma vez só)

```bash
cd videos
npm install
```

Vai baixar ~200MB (Chromium headless + ffmpeg + deps). **Demora ~2 min na primeira vez.**

> Se aparecer aviso sobre incompatibilidade do React 19 com Remotion, é seguro ignorar — o Remotion suporta React 19 desde a v4.0.

---

## 👀 Preview no browser (Remotion Studio)

```bash
npm run dev
```

Abre `http://localhost:3000` com:
- Timeline com todos os frames
- Preview ao vivo (você muda o código, recarrega na hora)
- Controles de play/pause/scrub
- Painel de props pra editar dados em tempo real

**Compositions disponíveis no estúdio:**
- `LogoIntro` — 1080×1920 (Reels/Stories)
- `LogoIntroSquare` — 1080×1080 (Instagram Feed)
- `LogoIntroHorizontal` — 1920×1080 (YouTube/Twitter)

---

## 🎥 Renderizar pra MP4

### Comandos rápidos

```bash
# Logo intro vertical (Reels/Stories)
npm run render:logo

# Logo intro quadrado (Feed)
npm run render:logo-square
```

Arquivos saem em `out/`.

### Render customizado

```bash
# Composição específica + path de saída
npx remotion render LogoIntro out/meu-video.mp4

# Com props customizadas
npx remotion render LogoIntro out/teste.mp4 --props='{"size":"horizontal"}'

# Render mais rápido (qualidade menor)
npx remotion render LogoIntro out/preview.mp4 --crf=28

# Render máxima qualidade (lossless)
npx remotion render LogoIntro out/master.mp4 --crf=0
```

---

## 🎬 Editar no Adobe Premiere / After Effects

Pra trazer pra edição profissional, use **ProRes** em vez de MP4. ProRes é o
padrão da indústria — quase lossless, native a Premiere/AE, suporta alpha.

### Opção A · ProRes HQ (fundo opaco, vai como clip de vídeo)

Pro caso comum: jogar a animação numa timeline do Premiere e cortar/juntar
com outros clips.

```bash
npm run render:logo-prores
```

Saída: `out/logo-intro.mov` (~50-80MB). Arrasta pro Premiere e usa normalmente.

### Opção B · ProRes 4444 com alpha (fundo transparente, pra compositing)

Pro caso poderoso: colocar o AhiruDrop **por cima** de gameplay/footage,
preservando alpha pra ver o vídeo de baixo nos espaços vazios.

```bash
npm run render:logo-alpha
```

Saída: `out/logo-intro-alpha.mov` (~200MB). Usa a composição `LogoIntroTransparent`
que pula o layer de Background.

**No After Effects:**
1. File → Import → seleciona `logo-intro-alpha.mov`
2. Arrasta pra timeline acima de qualquer layer de vídeo
3. As áreas pretas/escuras viram transparentes — o coin, halo, wordmark e tagline
   ficam por cima

**No Premiere:**
1. Importa o arquivo .mov
2. Coloca em V2 (canal acima do V1 que tem o footage de fundo)
3. Alpha é detectado automaticamente

### Qual usar?

| Caso | Use |
|------|-----|
| Vídeo standalone (Reels, Stories puros) | MP4 (`render:logo`) |
| Cortar/juntar no Premiere com outros clips | ProRes HQ (`render:logo-prores`) |
| Sobrepor a gameplay/streamer no AE | ProRes 4444 alpha (`render:logo-alpha`) |
| Postar direto no Insta/TikTok | MP4 (mais leve, é tudo que essas plataformas precisam) |

### Render super customizado (manual)

```bash
# ProRes profile específico
npx remotion render LogoIntro out/comp.mov --codec=prores --prores-profile=4444

# Pixel format alpha (transparente)
npx remotion render LogoIntroTransparent out/alpha.mov \
  --codec=prores --prores-profile=4444 \
  --pixel-format=yuva444p10le --image-format=png

# ProRes profiles disponíveis:
#   proxy       — menor arquivo, qualidade preview
#   light       — equilíbrio bom
#   standard    — padrão
#   hq          — alta qualidade (recomendado pra edição)
#   4444        — máxima qualidade + alpha channel
#   4444-xq     — máxima qualidade extrema
```

---

## 📁 Estrutura

```
videos/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── public/
│   └── coin-icon.png         ← cópia do branding/v1-reference/
├── src/
│   ├── index.ts              ← entrada
│   ├── Root.tsx              ← registro de composições
│   ├── compositions/
│   │   └── LogoIntro.tsx     ← 5s logo + tagline
│   └── components/
│       └── Particles.tsx     ← campo de partículas (determinístico)
└── out/                      ← MP4s renderizados (gitignored)
```

---

## ✨ Composições incluídas (v0.1)

### `LogoIntro` (5s, 30fps)

Timeline:

| Frame | Segundo | Evento |
|-------|---------|--------|
| 0–30 | 0–1s | Partículas fade in, background pulsa |
| 15–60 | 0.5–2s | Moeda spring up de baixo com rotação |
| 45–60 | 1.5–2s | Halo dourado expande atrás |
| 60–105 | 2–3.5s | Moeda flutua idle (sine wave) |
| 75–105 | 2.5–3.5s | Wordmark "AhiruDrop" digita letra a letra |
| 95–115 | 3–3.8s | Tagline "RIFAS · SKINS · DIVERSÃO" fade in |
| 115–138 | 3.8–4.6s | Hold |
| 138–150 | 4.6–5s | Fade out final |

3 variações de tamanho (mesma timeline):
- **vertical** (1080×1920) — Reels / Stories
- **square** (1080×1080) — Feed Instagram
- **horizontal** (1920×1080) — Twitter / YouTube / OG video

---

## 🔜 Próximas composições (roadmap)

| Composição | Duração | Formato | Descrição |
|------------|---------|---------|-----------|
| `NewRaffle` | 15s | 1080×1920 | Anúncio de nova rifa com skin + preço + raridade |
| `Winner` | 10s | 1080×1920 | Vencedor com confete + nome + número sorteado |
| `FlashSale` | 8s | 1080×1080 | Promo agressiva ("ÚLTIMA RIFA DO MÊS!") |
| `StreamerIntro` | 5s | 1920×1080 | Intro pra streamers usarem em live |

---

## 🛠️ Adicionando uma composição nova

1. Crie o componente em `src/compositions/NomeNovo.tsx`
2. Registre em `src/Root.tsx`:
   ```tsx
   <Composition
     id="NomeNovo"
     component={NomeNovo}
     durationInFrames={300}  // 10s a 30fps
     fps={30}
     width={1080}
     height={1920}
     defaultProps={{ ... }}
   />
   ```
3. (Opcional) Adicione um script em `package.json`:
   ```json
   "render:nome": "remotion render NomeNovo out/nome.mp4"
   ```

---

## ⚠️ Regras do Remotion

- **Nunca use `Math.random()`** — quebra a determinismo. Use `random("seed")` do Remotion.
- **Nunca use `onClick`, `onHover`, etc.** — vídeos não têm interação. Só renderização frame a frame.
- **Animações são funções de frame** — use `useCurrentFrame()` + `interpolate()` ou `spring()`.
- **Componentes precisam ser determinísticos** — mesmo frame = mesma saída sempre.

Doc oficial: https://www.remotion.dev/docs

---

## 💡 Workflow recomendado

1. **`npm run dev`** — preview rápido no browser
2. Edite o componente, recarregue
3. Quando ficar bom, **`npm run render:logo`** pra gerar o MP4
4. Posta no Insta/TikTok/Discord

Pra automação futura: dá pra triggerar render via webhook no servidor com `@remotion/lambda` (AWS) ou self-hosted.
