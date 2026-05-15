# 🔫 Skin images for video templates

Drop PNGs of CS2 skins here pra usar como imagem real nos vídeos
Remotion (em vez dos emojis placeholder).

## Como adicionar uma skin

1. **Baixa o PNG da skin** (algumas fontes):
   - Página da rifa no AhiruDrop → click direito na imagem → "Salvar imagem como..."
   - https://steamcommunity.com/market/search?appid=730 — busca a skin → click direito → salva
   - https://csgostash.com — banco completo de imagens, fundo transparente

2. **Salva aqui** com nome descritivo em **kebab-case**:
   - `phantom-disruptor.png`
   - `dragon-lore.png`
   - `karambit-doppler.png`
   - `howl.png`

3. **PNG transparente** é o ideal (sem fundo). Se o arquivo veio com fundo, use:
   - https://remove.bg (online, free pra 1)
   - Photoshop → magic wand → delete background
   - Figma → import → frame → exportar PNG transparent

4. **Resolução:** ~512×384 é suficiente. Mais que isso aumenta render time sem ganho visual.

## Como referenciar nas cenas

### Em `src/scenes/SceneBrowse.tsx`

Procura o array `CARDS` e troca `imageSrc: null` pelo path:

```tsx
{
  weapon: "AK-47",
  skin: "Phantom Disruptor",
  imageSrc: "skins/phantom-disruptor.png",  // ← aqui
  emoji: "🔫",
  rarity: "Classified",
  ...
},
```

### Em `src/scenes/SceneWin.tsx`

No topo do arquivo, troca o `WINNER_SKIN_SRC`:

```tsx
const WINNER_SKIN_SRC: string | null = "skins/phantom-disruptor.png";
```

## Lista atual de skins esperadas

(usadas no SiteShowcase, ainda como emoji até você dropar os PNGs)

| Arquivo esperado | Skin | Onde aparece |
|------------------|------|-------------|
| `phantom-disruptor.png` | AK-47 \| Phantom Disruptor | SceneBrowse + SceneWin |
| `dragon-lore.png` | AWP \| Dragon Lore | SceneBrowse |
| `karambit-doppler.png` | ★ Karambit \| Doppler | SceneBrowse |

Adicione/remova skins editando os arrays nas cenas correspondentes.

## ⚠️ Importante

- Skins do CS2 são propriedade da **Valve/CS2**. Uso em material institucional/marketing de plataforma de rifas é tolerado (mercado de skins é público), mas sempre mantenha a credit/marca AhiruDrop visível.
- **Não use logos de organizações esports** (FaZe, Cloud9, NaVi, etc.) — direitos comerciais separados.
