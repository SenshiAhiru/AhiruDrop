import { AbsoluteFill } from "remotion";

/**
 * Background layer — base gradient + soft purple radial glow.
 * Static (doesn't animate), runs the entire composition.
 *
 * To customize:
 *  - Change BG_DARK / BG_PURPLE for a different mood
 *  - Adjust the radial glow position (50% 40%) or intensity (0x22)
 */
const BG_DARK = "#07070a";
const BG_PURPLE = "#14081f";
const GLOW_COLOR = "#7c3aed";

export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `
          radial-gradient(ellipse at 50% 40%, ${GLOW_COLOR}22 0%, transparent 50%),
          linear-gradient(135deg, ${BG_DARK} 0%, ${BG_PURPLE} 100%)
        `,
      }}
    />
  );
};
