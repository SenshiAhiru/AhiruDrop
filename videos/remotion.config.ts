import { Config } from "@remotion/cli/config";

// AhiruDrop video project configuration.
// Defaults tuned for social media output (high quality, web-friendly).
//
// CRF intentionally NOT set globally — ProRes / PNG-sequence codecs
// reject it, and h264's default of 18 is already what we want. To
// tweak h264 quality on a specific render, pass --crf=NN on the CLI.

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setCodec("h264");
Config.setEntryPoint("./src/index.ts");
