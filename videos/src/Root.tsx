import { Composition } from "remotion";
import { LogoIntro, LogoIntroProps } from "./compositions/LogoIntro";

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
    </>
  );
};
