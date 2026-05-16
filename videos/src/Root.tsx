import { Composition } from "remotion";
import { LogoIntro, LogoIntroProps } from "./compositions/LogoIntro";
import { SiteShowcase, SITE_SHOWCASE_DURATION } from "./compositions/SiteShowcase";
import { SpotifyStyleDemo, SPOTIFY_DEMO_DURATION, SPOTIFY_DEMO_FPS } from "./compositions/SpotifyStyleDemo";
import { SceneHook, sceneHookDuration } from "./scenes/SceneHook";
import { SceneBrowse, sceneBrowseDuration } from "./scenes/SceneBrowse";
import { SceneBuy, sceneBuyDuration } from "./scenes/SceneBuy";
import { SceneDraw, sceneDrawDuration } from "./scenes/SceneDraw";
import { SceneWin, sceneWinDuration } from "./scenes/SceneWin";

/**
 * Root registry — every composition that can be rendered must be listed
 * here with its dimensions, fps, frame count and default props.
 *
 * Add new templates by importing them and adding a <Composition /> entry.
 */
export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Logo intro — vertical (Reels / Stories) */}
      <Composition
        id="LogoIntro"
        component={LogoIntro}
        durationInFrames={150} // 5s at 30fps
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ size: "vertical" } satisfies LogoIntroProps}
      />

      {/* Logo intro — square (Instagram feed) */}
      <Composition
        id="LogoIntroSquare"
        component={LogoIntro}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1080}
        defaultProps={{ size: "square" } satisfies LogoIntroProps}
      />

      {/* Logo intro — horizontal (Twitter / YouTube) */}
      <Composition
        id="LogoIntroHorizontal"
        component={LogoIntro}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ size: "horizontal" } satisfies LogoIntroProps}
      />

      {/* Logo intro — TRANSPARENT (no background, for After Effects /
          Premiere compositing). Render as PNG sequence or ProRes 4444
          to preserve the alpha channel. */}
      <Composition
        id="LogoIntroTransparent"
        component={LogoIntro}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          size: "vertical",
          transparentBackground: true,
        } satisfies LogoIntroProps}
      />

      {/* ═══════════════════════════════════════════════════════════
          SITE SHOWCASE — 15s institutional video
          5 scenes: Hook → Browse → Buy → Draw → Win
          Each scene file lives in src/scenes/
          ═══════════════════════════════════════════════════════════ */}
      <Composition
        id="SiteShowcase"
        component={SiteShowcase}
        durationInFrames={SITE_SHOWCASE_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />

      <Composition
        id="SiteShowcaseSquare"
        component={SiteShowcase}
        durationInFrames={SITE_SHOWCASE_DURATION}
        fps={30}
        width={1080}
        height={1080}
      />

      <Composition
        id="SiteShowcaseHorizontal"
        component={SiteShowcase}
        durationInFrames={SITE_SHOWCASE_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══════════════════════════════════════════════════════════
          SPOTIFY-STYLE DEMO — kinetic type + 3D card tilt + outro
          ═══════════════════════════════════════════════════════════ */}
      <Composition
        id="SpotifyStyleDemo"
        component={SpotifyStyleDemo}
        durationInFrames={SPOTIFY_DEMO_DURATION}
        fps={SPOTIFY_DEMO_FPS}
        width={1080}
        height={1920}
      />

      {/* ═══════════════════════════════════════════════════════════
          INDIVIDUAL SCENES with transparent background
          Render cada uma como ProRes 4444 .mov pra empilhar no Premiere
          como camadas independentes. Cada cena tem 90 frames (3s).
          ═══════════════════════════════════════════════════════════ */}
      <Composition
        id="Scene01Hook"
        component={SceneHook}
        durationInFrames={sceneHookDuration}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ transparentBackground: true }}
      />
      <Composition
        id="Scene02Browse"
        component={SceneBrowse}
        durationInFrames={sceneBrowseDuration}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ transparentBackground: true }}
      />
      <Composition
        id="Scene03Buy"
        component={SceneBuy}
        durationInFrames={sceneBuyDuration}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ transparentBackground: true }}
      />
      <Composition
        id="Scene04Draw"
        component={SceneDraw}
        durationInFrames={sceneDrawDuration}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ transparentBackground: true }}
      />
      <Composition
        id="Scene05Win"
        component={SceneWin}
        durationInFrames={sceneWinDuration}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ transparentBackground: true }}
      />
    </>
  );
};
