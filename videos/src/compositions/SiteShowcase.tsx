import { AbsoluteFill, Sequence } from "remotion";
import { SceneHook, sceneHookDuration } from "../scenes/SceneHook";
import { SceneBrowse, sceneBrowseDuration } from "../scenes/SceneBrowse";
import { SceneBuy, sceneBuyDuration } from "../scenes/SceneBuy";
import { SceneDraw, sceneDrawDuration } from "../scenes/SceneDraw";
import { SceneWin, sceneWinDuration } from "../scenes/SceneWin";

/**
 * SiteShowcase · 15s vídeo institucional do AhiruDrop.
 *
 * Cinco cenas encadeadas com crossfade automático (cada cena tem
 * fade-in/out de 12 frames via <SceneWrapper>). Cenas têm a mesma
 * duração (90 frames = 3s) e iniciam no offset correto:
 *
 *    SceneHook    0 ─→  90
 *    SceneBrowse  90 ─→ 180
 *    SceneBuy     180 ─→ 270
 *    SceneDraw    270 ─→ 360
 *    SceneWin     360 ─→ 450  (total: 450 frames = 15s a 30fps)
 *
 * Pra editar cada cena, abre o arquivo correspondente em
 * `src/scenes/`. Pra mudar ordem, duração ou adicionar mais
 * cenas, ajusta os <Sequence from={X}> abaixo.
 */
export const SiteShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Sequence name="01 · Hook" from={0} durationInFrames={sceneHookDuration}>
        <SceneHook />
      </Sequence>

      <Sequence name="02 · Browse" from={sceneHookDuration} durationInFrames={sceneBrowseDuration}>
        <SceneBrowse />
      </Sequence>

      <Sequence
        name="03 · Buy"
        from={sceneHookDuration + sceneBrowseDuration}
        durationInFrames={sceneBuyDuration}
      >
        <SceneBuy />
      </Sequence>

      <Sequence
        name="04 · Draw"
        from={sceneHookDuration + sceneBrowseDuration + sceneBuyDuration}
        durationInFrames={sceneDrawDuration}
      >
        <SceneDraw />
      </Sequence>

      <Sequence
        name="05 · Win"
        from={sceneHookDuration + sceneBrowseDuration + sceneBuyDuration + sceneDrawDuration}
        durationInFrames={sceneWinDuration}
      >
        <SceneWin />
      </Sequence>
    </AbsoluteFill>
  );
};

export const SITE_SHOWCASE_DURATION =
  sceneHookDuration +
  sceneBrowseDuration +
  sceneBuyDuration +
  sceneDrawDuration +
  sceneWinDuration;
