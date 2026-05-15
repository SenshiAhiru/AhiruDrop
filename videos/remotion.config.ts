import { Config } from "@remotion/cli/config";

// AhiruDrop video project configuration.
// Defaults tuned for social media output (high quality, web-friendly).

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setCrf(18); // 0 = lossless, 23 = default, lower = better quality
Config.setEntryPoint("./src/index.ts");
