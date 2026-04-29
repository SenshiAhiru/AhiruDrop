import { warn, error as logError } from "@/lib/logger";
import { fetchWithRetry } from "@/lib/fetch-with-retry";

/**
 * Discord webhook integration.
 *
 * We post embeds to channel-specific webhooks for three event types:
 *   - NEW_RAFFLE — a raffle just went ACTIVE (admins flipped DRAFT → ACTIVE)
 *   - WINNERS — a raffle was drawn, with the winner name + skin
 *   - ALERTS — operational events admins should see (big deposits, etc.)
 *
 * URLs come from env vars and are optional — if missing, posts are
 * no-ops (so dev/preview deployments don't spam the production Discord).
 *
 * Non-blocking: failures are logged but never thrown. Discord being
 * down should not break a raffle activation or webhook handler.
 */

// Brand colours rendered as numbers (Discord embed color is decimal int)
const PRIMARY_PURPLE = 0x7c3aed;
const ACCENT_GOLD = 0xfbbf24;
const EMERALD = 0x10b981;
const RED = 0xef4444;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ahirudrop.vercel.app";

export type DiscordEmbed = {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  timestamp?: string;
  footer?: { text: string; icon_url?: string };
  image?: { url: string };
  thumbnail?: { url: string };
  author?: { name: string; url?: string; icon_url?: string };
  fields?: { name: string; value: string; inline?: boolean }[];
};

type Channel = "NEW_RAFFLE" | "WINNERS" | "ALERTS";

const CHANNEL_TO_ENV: Record<Channel, string> = {
  NEW_RAFFLE: "DISCORD_WEBHOOK_NEW_RAFFLE",
  WINNERS: "DISCORD_WEBHOOK_WINNERS",
  ALERTS: "DISCORD_WEBHOOK_ALERTS",
};

async function postToWebhook(channel: Channel, payload: { content?: string; embeds?: DiscordEmbed[] }) {
  const url = process.env[CHANNEL_TO_ENV[channel]];
  if (!url) {
    // Soft no-op — fine for local/preview where the env var isn't set.
    return;
  }

  try {
    const res = await fetchWithRetry(
      url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      { attempts: 2, baseDelayMs: 400, timeoutMs: 6000, label: `discord ${channel}` }
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      warn(`[discord] webhook ${channel} HTTP ${res.status}: ${txt.slice(0, 200)}`);
    }
  } catch (err) {
    logError(`[discord] webhook ${channel} failed:`, err);
    // Swallowed — never let Discord problems break a real flow.
  }
}

export const discord = {
  /**
   * Posted in #novas-rifas the moment an admin flips a raffle to ACTIVE.
   */
  async notifyRaffleActivated(raffle: {
    id: string;
    slug: string;
    title: string;
    skinImage?: string | null;
    skinName?: string | null;
    skinWeapon?: string | null;
    skinRarity?: string | null;
    skinRarityColor?: string | null;
    skinWear?: string | null;
    pricePerNumber: number | string;
    totalNumbers: number;
    scheduledDrawAt?: Date | string | null;
  }) {
    const url = `${SITE_URL}/raffles/${raffle.slug}`;
    const price = Number(raffle.pricePerNumber).toFixed(2);

    // Map rarity hex (e.g. "#eb4b4b") to a decimal int for the embed bar
    let color = PRIMARY_PURPLE;
    if (raffle.skinRarityColor && /^#?[0-9a-f]{6}$/i.test(raffle.skinRarityColor)) {
      color = parseInt(raffle.skinRarityColor.replace("#", ""), 16);
    }

    const fields: DiscordEmbed["fields"] = [
      { name: "💰 Preço por número", value: `${price} AHC`, inline: true },
      { name: "🎟️ Total de números", value: String(raffle.totalNumbers), inline: true },
    ];
    if (raffle.skinRarity) {
      fields.push({ name: "✨ Raridade", value: raffle.skinRarity, inline: true });
    }
    if (raffle.skinWear) {
      fields.push({ name: "🔧 Wear", value: raffle.skinWear, inline: true });
    }
    if (raffle.scheduledDrawAt) {
      const ts = Math.floor(new Date(raffle.scheduledDrawAt).getTime() / 1000);
      fields.push({ name: "🗓️ Sorteio", value: `<t:${ts}:F>`, inline: false });
    }

    const embed: DiscordEmbed = {
      title: `🎲 ${raffle.title}`,
      description:
        `Uma nova rifa acaba de abrir no AhiruDrop! Concorra a partir de **${price} AHC** por número.\n\n` +
        `[**🎟️ Participar agora →**](${url})`,
      url,
      color,
      fields,
      footer: { text: "AhiruDrop · Provably Fair via Bitcoin" },
      timestamp: new Date().toISOString(),
    };
    if (raffle.skinImage) embed.image = { url: raffle.skinImage };

    await postToWebhook("NEW_RAFFLE", {
      content: "🎲 **Nova rifa disponível!** @here",
      embeds: [embed],
    });
  },

  /**
   * Posted in #vencedores when the draw completes.
   */
  async notifyWinner(args: {
    raffleId: string;
    raffleSlug: string;
    raffleTitle: string;
    skinImage?: string | null;
    skinRarityColor?: string | null;
    winnerName: string;
    winnerAvatarUrl?: string | null;
    winningNumber: number;
    blockHeight?: number | null;
  }) {
    const url = `${SITE_URL}/raffles/${args.raffleSlug}/verify`;

    let color = ACCENT_GOLD;
    if (args.skinRarityColor && /^#?[0-9a-f]{6}$/i.test(args.skinRarityColor)) {
      color = parseInt(args.skinRarityColor.replace("#", ""), 16);
    }

    const fields: DiscordEmbed["fields"] = [
      { name: "🏆 Vencedor", value: args.winnerName, inline: true },
      { name: "🎯 Número", value: `#${args.winningNumber}`, inline: true },
    ];
    if (args.blockHeight) {
      fields.push({
        name: "⛓️ Bloco BTC",
        value: `[#${args.blockHeight}](https://mempool.space/block/${args.blockHeight})`,
        inline: true,
      });
    }

    const embed: DiscordEmbed = {
      title: `🏆 Sorteada: ${args.raffleTitle}`,
      description:
        `**Parabéns, ${args.winnerName}!**\n\n` +
        `O sorteio foi feito de forma **Provably Fair** e a prova matemática está pública.\n\n` +
        `[**🔍 Verificar a prova →**](${url})`,
      url,
      color,
      fields,
      footer: { text: "AhiruDrop · Resultado verificável publicamente" },
      timestamp: new Date().toISOString(),
    };
    if (args.skinImage) embed.thumbnail = { url: args.skinImage };
    if (args.winnerAvatarUrl) embed.author = { name: args.winnerName, icon_url: args.winnerAvatarUrl };

    await postToWebhook("WINNERS", {
      content: "🏆 **Temos um vencedor!**",
      embeds: [embed],
    });
  },

  /**
   * Operational alert in #alertas-bot. Used for big deposits + future
   * incidents (failed draws, gateway outages, etc.).
   */
  async notifyAlert(args: {
    title: string;
    description: string;
    severity?: "info" | "warning" | "error";
    fields?: { name: string; value: string; inline?: boolean }[];
    link?: { url: string; label?: string };
  }) {
    const colorBySeverity = {
      info: EMERALD,
      warning: ACCENT_GOLD,
      error: RED,
    };

    const fields = [...(args.fields ?? [])];
    if (args.link) {
      fields.push({
        name: "🔗 Link",
        value: `[${args.link.label ?? "Abrir no admin"}](${args.link.url})`,
        inline: false,
      });
    }

    const embed: DiscordEmbed = {
      title: args.title,
      description: args.description,
      color: colorBySeverity[args.severity ?? "info"],
      fields,
      footer: { text: "AhiruDrop · Alerta automático" },
      timestamp: new Date().toISOString(),
    };

    await postToWebhook("ALERTS", { embeds: [embed] });
  },

  /**
   * Big deposit alert. Convenience wrapper for the most common alert.
   */
  async notifyBigDeposit(args: {
    userId: string;
    userName: string;
    amount: number;
    provider: string; // "stripe" | "mercadopago"
  }) {
    return this.notifyAlert({
      title: "💸 Depósito relevante",
      description: `**${args.userName}** depositou **${args.amount.toFixed(2)} AHC**.`,
      severity: "info",
      fields: [
        { name: "Provider", value: args.provider, inline: true },
        { name: "Valor", value: `${args.amount.toFixed(2)} AHC`, inline: true },
      ],
      link: {
        url: `${SITE_URL}/admin/users/${args.userId}`,
        label: "Ver usuário no admin",
      },
    });
  },
};
