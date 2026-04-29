# AhiruDrop — Brand Guidelines

> Versão 1.0 · 2026-04-29

Este documento é a fonte de verdade pra aplicar a identidade do AhiruDrop em qualquer mídia: site, social, parcerias, materiais impressos, vídeos. Tudo aqui vem direto do código do projeto, então o site e o material institucional sempre batem.

---

## 1. Essência

**AhiruDrop é uma plataforma brasileira de rifas de skins de Counter-Strike 2 com sorteios provably fair via blockchain Bitcoin.**

- **Audiência:** gamers de CS2, 18+, predominantemente brasileiros. Familiares com o ecossistema Steam, mercado de skins, conceitos de fairness.
- **Posicionamento:** transparência verificável + experiência premium. O contrário das rifas opacas que você vê em grupos de Telegram.
- **Mascote:** o pato (🦆) — calmo, observador, presente em momentos felizes (vencedor, depósito creditado, popups de celebração).

### Tom de voz

- **PT-BR primário, EN secundário.** Comunidade bilíngue por padrão.
- **Direto, sem firula.** "Comprar números", "Receba a skin", "Veja a prova". Não usa "experiência fantástica", "incrível oportunidade" — não vendemos hype.
- **Tecnicamente honesto.** Quando algo é "Provably Fair", explicamos o por quê (commit-reveal + Bitcoin block). Quando algo está em sandbox, dizemos.
- **Casual mas profissional.** Pode usar gírias leves ("massa", "show"), mas evita memes datados e não fala palavrão.
- **Emojis funcionais, não decorativos.** 🦆 pra brand, 🏆 pra vitória, ✅ pra status. Nunca "🎉🎊🥳🤩" em sequência.

---

## 2. Logotipo

> ⚠️ Asset oficial do logo está em `public/logo.svg` (SVG vetorial). Pra mídias estáticas, exporte em `@2x` ou `@3x`.

### Regras de uso

- **Espaço de respiro:** mantenha pelo menos 1× a altura do logo livre em todos os lados.
- **Tamanho mínimo:** 24px de altura digital, 8mm em mídia impressa. Abaixo disso, use só o ícone do pato.
- **Cores permitidas:**
  - Logo principal: roxo `#7c3aed` + dourado `#fbbf24`
  - Versão monocromática branca: pra fundos escuros (Discord embeds, banners)
  - Versão monocromática preta: pra mídia impressa monocromática
- **Não faça:**
  - Não distorça proporções (sem stretch horizontal/vertical)
  - Não aplique sombra externa diretamente no logo (é o gradiente que dá o glow)
  - Não troque as cores por outras da paleta (roxo pode virar `primary-700`, mas nunca virar `accent` ou semântico)
  - Não coloque o logo sobre fundos com baixo contraste

### Mascote

O pato (🦆) pode ser usado **separado** do logo em:
- Avatares de mídias sociais
- Stickers de comunidade
- Easter eggs no produto (como na celebração de vitória)
- Watermark sutil em designs

---

## 3. Cores

### 3.1 Brand colors

#### 🟣 Primary (Roxo) — identidade principal

| Token | Hex | Uso |
|-------|-----|-----|
| `primary-50` | `#f5f3ff` | Hover sutil em light mode |
| `primary-100` | `#ede9fe` | Backgrounds suaves |
| `primary-200` | `#ddd6fe` | Borders de destaque |
| `primary-300` | `#c4b5fd` | Texto link em fundos escuros |
| `primary-400` | `#a78bfa` | Active states, ícones |
| `primary-500` | `#8b5cf6` | Ring/focus em dark mode |
| **`primary-600`** | **`#7c3aed`** | **CTA principal, brand** ⭐ |
| `primary-700` | `#6d28d9` | Hover de CTAs primários |
| `primary-800` | `#5b21b6` | — |
| `primary-900` | `#4c1d95` | — |
| `primary-950` | `#2e1065` | — |

**Regra:** quando em dúvida, use `primary-600` (`#7c3aed`).

#### 🟡 Accent (Dourado/Âmbar) — secundária

| Token | Hex | Uso |
|-------|-----|-----|
| `accent-50` | `#fffbeb` | — |
| `accent-100` | `#fef3c7` | — |
| `accent-200` | `#fde68a` | — |
| `accent-300` | `#fcd34d` | — |
| **`accent-400`** | **`#fbbf24`** | **Valores AHC, troféus, dourado primário** ⭐ |
| **`accent-500`** | **`#f59e0b`** | **Botões secundários, gradient end** ⭐ |
| `accent-600` | `#d97706` | — |
| `accent-700` | `#b45309` | — |

**Regra:** dourado é a cor da **vitória e do dinheiro**. Reserve pra: saldo AHC, badges de vencedor, CTAs de depósito, gradientes premium.

### 3.2 Cores semânticas

| Função | Hex | Quando usar |
|--------|-----|-------------|
| `success` | `#10b981` | Confirmação, status OK, depósito creditado |
| `warning` | `#f59e0b` | Sandbox, pending, atenção (mesmo hex do accent-500 — intencional) |
| `danger` | `#ef4444` | Erro, ação destrutiva, cancelamento |
| `info` | `#3b82f6` | Mensagens informativas (raramente usado, prefira primary) |

### 3.3 Surface (escala neutra)

A escala é **theme-aware** — inverte entre dark e light mode pra `surface-900` ser sempre "fundo de card" e `surface-50` ser sempre "texto principal".

#### Dark mode (default)

| Token | Hex | Função visual |
|-------|-----|---------------|
| `surface-50` | `#fafafa` | Texto principal |
| `surface-100` | `#f4f4f5` | Texto destacado |
| `surface-200` | `#e4e4e7` | — |
| `surface-300` | `#d4d4d8` | — |
| `surface-400` | `#a1a1aa` | Texto muted |
| `surface-500` | `#71717a` | Placeholder, disabled |
| `surface-600` | `#52525b` | — |
| `surface-700` | `#3f3f46` | Border, divider |
| `surface-800` | `#27272a` | Card background alt, muted |
| `surface-900` | `#18181b` | Card background principal |
| `surface-950` | `#09090b` | Background da página ⭐ |

#### Light mode

A escala se inverte: `surface-50` vira `#09090b` (texto), `surface-950` vira `#fafafa` (fundo). Use os mesmos tokens — não escreva valores hex direto em componentes.

### 3.4 Cores externas (parcerias e plataformas)

| Marca | Hex | Quando usar |
|-------|-----|-------------|
| Discord | `#5865F2` | CTA "Entrar no Discord", banner, badge |
| Steam | `#171a21` (azul escuro) | "Login com Steam" — usa cor oficial deles |
| Stripe | varia | Iframe gerencia próprio tema |
| Mercado Pago | `#009ee3` (azul) | Mencionar PIX (raramente — preferimos dizer só "PIX") |

---

## 4. Cores do CS2 (oficial Valve)

Essas cores **não são da marca AhiruDrop** — são cores oficiais da Valve usadas pra raridade e desgaste de skins. Usamos elas pra manter consistência com o ecossistema CS2.

### 4.1 Raridades de skin

| Raridade | Hex | Label PT |
|----------|-----|----------|
| Consumer Grade | `#b0c3d9` | Consumidor |
| Industrial Grade | `#5e98d9` | Industrial |
| Mil-Spec Grade | `#4b69ff` | Mil-Spec |
| Restricted | `#8847ff` | Restrito |
| Classified | `#d32ce6` | Classificado |
| Covert | `#eb4b4b` | Secreto |
| Contraband / Extraordinary | `#e4ae39` | Contrabando / Extraordinário |

### 4.2 Wear Conditions

| Wear | Sigla | Hex | Float range |
|------|-------|-----|-------------|
| Factory New | FN | `#4ade80` | 0.00 – 0.07 |
| Minimal Wear | MW | `#a3e635` | 0.07 – 0.15 |
| Field-Tested | FT | `#facc15` | 0.15 – 0.38 |
| Well-Worn | WW | `#fb923c` | 0.38 – 0.45 |
| Battle-Scarred | BS | `#ef4444` | 0.45 – 1.00 |

---

## 5. Tipografia

### Família

- **Sans-serif (UI):** Geist Sans
- **Mono (códigos, números de rifa, hashes):** Geist Mono

Ambas via `next/font/google`. Webfonts sem custo.

### Hierarquia (web)

| Estilo | Tamanho | Peso | Uso |
|--------|---------|------|-----|
| Hero title | 4xl–6xl (36–60px) | 800 (extrabold) | H1 da home |
| Section title | 3xl (30px) | 700 (bold) | "Rifas em destaque" |
| Card title | xl–2xl (20–24px) | 700 | Nome da rifa |
| Body | base (16px) | 400 | Texto corrido |
| Small / muted | sm (14px) | 400 | Subtítulos, metadata |
| Caption | xs (12px) | 500 | Footer, microcopy |
| Mono number | sm/mono | 600 | Números da rifa, valores AHC |

### Tracking (letter-spacing)

- Headlines grandes (3xl+): `-0.025em` (apertado)
- Body: default (`0`)
- All-caps small: `0.05em` (espaçado)

---

## 6. Iconografia

- **Biblioteca:** Lucide Icons (`lucide-react`). Não misture com outras libs de ícone (FontAwesome, Heroicons) no mesmo produto.
- **Stroke width padrão:** 2 (default do Lucide)
- **Tamanhos:** 16px (inline texto), 20px (botões), 24px (headers)
- **Cor:** sempre herda do contexto (`currentColor`). Nunca defina `fill` ou `stroke` hex direto.

### Emojis funcionais

Use no texto pra reforçar conceito:
- 🦆 → AhiruDrop (mascote)
- 🎲 → Rifa
- 🏆 → Vitória, vencedor
- 🎟️ → Número/ticket
- 💰 → Preço, AHC
- ✨ → Raridade, magia
- 🔧 → Wear, técnico
- ⛓️ → Bitcoin, blockchain
- 🔍 → Verificar, prova
- 🇧🇷 / 🇺🇸 → Idiomas

---

## 7. Padrões visuais

### Gradients

```css
/* Brand gradient — uso em headers, hero, CTAs especiais */
background: linear-gradient(135deg, #7c3aed 0%, #f59e0b 100%);

/* Discord gradient — uso só em CTA Discord */
background: linear-gradient(135deg, #5865F2 0%, #7c3aed 50%, #fbbf24 100%);
```

### Glow / Pulse

- **Pulse roxo** em CTAs importantes (depósito, comprar): `box-shadow: 0 0 20px 4px rgba(124, 58, 237, 0.2)`
- **Glow dourado** em vitórias: `drop-shadow: 0 0 40px rgba(251, 191, 36, 0.5)`
- **Glow de raridade** em skins: usa a cor da raridade com 40% de opacidade

### Border radius

- `rounded-sm` (6px) — chips, badges
- `rounded-md` (8px) — botões pequenos, inputs
- `rounded-lg` (12px) — botões grandes, cards pequenos
- `rounded-xl` (16px) — cards médios
- `rounded-2xl` (24px) — modals, hero containers
- `rounded-full` — avatares, ícones circulares

### Selection

```css
::selection { background: #7c3aed; color: white; }
```

---

## 8. Acessibilidade

- **Contraste mínimo:** AAA (7:1) pra texto principal, AA (4.5:1) pra texto secundário e elementos UI.
- **Roxo `#7c3aed` em fundo `#09090b`** = contraste 5.6:1 — passa em AA, não em AAA. Use `primary-400` (`#a78bfa`) pra texto sobre fundo escuro quando contraste importar.
- **Dourado `#fbbf24` em fundo escuro** = contraste 11.6:1 — passa AAA. Pode usar livremente.
- **Foco sempre visível:** `outline: 2px solid var(--ring)` — nunca remova foco sem prover alternativa.

---

## 9. Aplicações

### 9.1 Mídias sociais

- **Avatar:** mascote pato (sem texto) em fundo `surface-950` (`#09090b`) ou roxo `#7c3aed`
- **Banner Twitter/X:** gradient roxo→dourado com logo centralizado
- **Posts:** sempre com paleta da marca; a skin é o destaque, não a cor

### 9.2 Cartões físicos / impressos

- Use CMYK aproximado:
  - Roxo `#7c3aed` → CMYK aprox. C70 M84 Y0 K7
  - Dourado `#fbbf24` → CMYK aprox. C0 M30 Y90 K2

### 9.3 Apresentações / pitches

- Slide template: fundo `#09090b`, títulos brancos, destaques roxo, KPIs dourados
- Nunca use o branco puro como background (rompe o tom dark)

---

## 10. Don'ts (regras importantes)

- ❌ **Não invente cores fora da paleta.** Se precisar de uma nova cor, expanda a paleta no código primeiro.
- ❌ **Não use vermelho `danger` decorativamente.** É reservado pra erro/destrutivo.
- ❌ **Não misture roxo com cores quentes não-paleta** (rosa, magenta forte). O accent dourado é o único par autorizado.
- ❌ **Não use light mode em material de marketing.** Light mode existe pro produto por acessibilidade, mas a identidade visual é dark.
- ❌ **Não use stock photos genéricos.** Sempre arte própria, screenshots de skins reais ou ilustrações.

---

## 11. Versionamento

Toda mudança nesta paleta deve ser **simultânea no código** (`src/app/globals.css`) e nesta documentação. PRs que mudam cores precisam atualizar os dois.

---

**Última atualização:** 2026-04-29
**Mantenedor:** Thiago Lucas
**Repositório:** github.com/SenshiAhiru/AhiruDrop
