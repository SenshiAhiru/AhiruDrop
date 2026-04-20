import { successResponse, handleApiError } from "@/lib/api-utils";
import { fxService, AHC_PER_USD, USD_PER_AHC } from "@/services/fx.service";

/**
 * Public endpoint: returns the current FX rates used by the platform.
 * Called by the deposit page to live-preview AHC costs in BRL/USD.
 */
export async function GET() {
  try {
    const { rate, fetchedAt, source } = await fxService.getUsdToBrl();
    return successResponse({
      ahcPerUsd: AHC_PER_USD,
      usdPerAhc: USD_PER_AHC,
      usdToBrl: rate,
      fetchedAt,
      source,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
