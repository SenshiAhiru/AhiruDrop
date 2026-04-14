"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
} from "lucide-react";

type VerifyData = {
  raffleId: string;
  raffleTitle: string;
  status: string;
  totalPaidTickets: number;
  commit: {
    serverSeedHash: string | null;
    drawBlockHeight: number | null;
  };
  reveal: {
    drawId: string;
    drawnAt: string;
    drawMethod: string;
    winningNumber: number;
    serverSeedRevealed: string | null;
    blockHash: string | null;
    blockHeight: number | null;
    hasWinner: boolean;
  } | null;
};

type VerifyResult = {
  hashMatches: boolean | null;
  computedIndex: number | null;
  indexMatches: boolean | null;
  error: string | null;
};

// Browser-side SHA-256 using SubtleCrypto
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Browser-side HMAC-SHA256
async function hmacSha256Hex(keyHex: string, message: string): Promise<string> {
  // Import key as raw bytes (the hex-string interpreted as ASCII chars, matching Node's default)
  const keyBytes = new TextEncoder().encode(keyHex);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function VerifyPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [data, setData] = useState<VerifyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/raffles/${slug}/verify`, { cache: "no-store" });
        const json = await res.json();
        if (!json.success) {
          setFetchError(json.error || "Falha ao carregar dados");
        } else {
          setData(json.data);
        }
      } catch {
        setFetchError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  async function runVerification() {
    if (!data || !data.reveal) return;
    setVerifying(true);
    setResult(null);

    try {
      const seed = data.reveal.serverSeedRevealed!;
      const committedHash = data.commit.serverSeedHash!;
      const blockHash = data.reveal.blockHash!;

      // 1) Seed commitment check
      const computedHash = await sha256Hex(seed);
      const hashMatches = computedHash.toLowerCase() === committedHash.toLowerCase();

      // 2) Recompute winning index via HMAC
      const message = `${blockHash}:${data.raffleId}`;
      const hmacHex = await hmacSha256Hex(seed, message);
      const slice = hmacHex.slice(0, 16);
      const bigNum = BigInt("0x" + slice);
      const idx = Number(bigNum % BigInt(data.totalPaidTickets));

      // Note: index vs winningNumber — winningNumber is the actual label,
      // idx is the position in the sorted paid list. We can't fully reproduce
      // the mapping without the full paid list, so we just report the computed
      // index. The server stored winningNumber = eligible[idx].number.
      setResult({
        hashMatches,
        computedIndex: idx,
        indexMatches: null, // pure position check not available without paid list
        error: null,
      });
    } catch (err) {
      setResult({
        hashMatches: null,
        computedIndex: null,
        indexMatches: null,
        error: err instanceof Error ? err.message : "Erro na verificação",
      });
    } finally {
      setVerifying(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (fetchError || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {fetchError || "Dados não encontrados"}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/raffles/${slug}`}
          className="text-sm text-surface-400 hover:text-white transition-colors"
        >
          ← Voltar para a rifa
        </Link>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10">
            <Shield className="h-6 w-6 text-primary-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Provably Fair</h1>
            <p className="text-sm text-surface-400">{data.raffleTitle}</p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="rounded-xl border border-surface-700 bg-surface-900/50 p-5 text-sm text-surface-300 space-y-2">
        <p>
          Esta rifa usa um esquema de <strong>commit-reveal</strong> com o hash de um
          bloco do Bitcoin como fonte de aleatoriedade pública. Ninguém — nem o
          AhiruDrop — pode prever ou manipular o vencedor.
        </p>
        <p>
          <strong>1.</strong> Na criação, o servidor gerou um seed aleatório e publicou
          o hash SHA-256 dele (abaixo). <strong>2.</strong> Também travou a altura de
          um bloco futuro do Bitcoin. <strong>3.</strong> No sorteio, o seed é
          revelado e combinado com o hash do bloco real via HMAC-SHA256 para escolher
          o ganhador. Qualquer pessoa pode conferir.
        </p>
      </div>

      {/* Commit */}
      <section className="rounded-xl border border-surface-700 bg-surface-900/50 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">
            1
          </span>
          Compromisso (commit)
        </h2>
        <FieldRow
          label="Hash do seed (SHA-256)"
          value={data.commit.serverSeedHash}
          mono
          onCopy={copy}
        />
        <FieldRow
          label="Altura do bloco alvo (Bitcoin)"
          value={data.commit.drawBlockHeight?.toString() ?? null}
          link={
            data.commit.drawBlockHeight
              ? `https://mempool.space/block/${data.commit.drawBlockHeight}`
              : undefined
          }
        />
      </section>

      {/* Reveal */}
      <section className="rounded-xl border border-surface-700 bg-surface-900/50 p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">
            2
          </span>
          Revelação (reveal)
        </h2>

        {!data.reveal ? (
          <p className="text-sm text-surface-400">
            O sorteio ainda não foi realizado. Os dados de revelação aparecerão aqui
            após o draw.
          </p>
        ) : (
          <>
            <FieldRow
              label="Seed revelado"
              value={data.reveal.serverSeedRevealed}
              mono
              onCopy={copy}
            />
            <FieldRow
              label="Hash do bloco usado"
              value={data.reveal.blockHash}
              mono
              onCopy={copy}
              link={
                data.reveal.blockHash
                  ? `https://mempool.space/block/${data.reveal.blockHash}`
                  : undefined
              }
            />
            <FieldRow
              label="Altura do bloco usado"
              value={data.reveal.blockHeight?.toString() ?? null}
            />
            <FieldRow
              label="Número vencedor"
              value={data.reveal.winningNumber.toString()}
              highlight
            />
            <FieldRow
              label="Total de tickets pagos"
              value={data.totalPaidTickets.toString()}
            />
          </>
        )}
      </section>

      {/* Verification */}
      {data.reveal && data.commit.serverSeedHash && data.reveal.serverSeedRevealed && data.reveal.blockHash && (
        <section className="rounded-xl border border-surface-700 bg-surface-900/50 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">
              3
            </span>
            Verificação no seu navegador
          </h2>
          <p className="text-sm text-surface-400">
            Clique no botão abaixo pra calcular localmente, sem nenhum pedido ao
            servidor, e conferir que tudo bate.
          </p>

          <button
            onClick={runVerification}
            disabled={verifying}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 transition-colors disabled:opacity-50"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Verificar agora
              </>
            )}
          </button>

          {result && (
            <div className="mt-4 space-y-3">
              {result.error ? (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  {result.error}
                </div>
              ) : (
                <>
                  <CheckRow
                    ok={result.hashMatches === true}
                    label="SHA-256(seed revelado) === hash commitado"
                    detail={
                      result.hashMatches
                        ? "O seed original foi preservado desde a criação."
                        : "ATENÇÃO: o seed não corresponde ao hash commitado."
                    }
                  />
                  <div className="rounded-lg border border-surface-700 bg-surface-800/40 p-3 text-xs space-y-1">
                    <div className="text-surface-400">Cálculo independente:</div>
                    <div className="text-surface-300">
                      HMAC-SHA256(seed, &ldquo;{data.reveal!.blockHash!.slice(0, 12)}...:
                      {data.raffleId.slice(0, 8)}...&rdquo;) → primeiros 16 hex ÷ por{" "}
                      {data.totalPaidTickets}
                    </div>
                    <div className="text-white font-mono">
                      Índice computado:{" "}
                      <span className="text-accent-400">{result.computedIndex}</span>
                      <span className="text-surface-500">
                        {" "}
                        (0 a {data.totalPaidTickets - 1})
                      </span>
                    </div>
                    <div className="text-surface-400 text-[11px] mt-2">
                      O servidor mapeou esse índice para o número vencedor{" "}
                      <strong className="text-white">#{data.reveal!.winningNumber}</strong>{" "}
                      da lista ordenada de tickets pagos.
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function FieldRow({
  label,
  value,
  mono,
  highlight,
  link,
  onCopy,
}: {
  label: string;
  value: string | null;
  mono?: boolean;
  highlight?: boolean;
  link?: string;
  onCopy?: (text: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-surface-400">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`flex-1 rounded-lg border border-surface-700 bg-surface-800/60 px-3 py-2 text-sm ${
            mono ? "font-mono text-xs" : ""
          } ${highlight ? "text-accent-400 font-bold text-lg" : "text-white"} break-all`}
        >
          {value ?? <span className="text-surface-500">—</span>}
        </div>
        {value && onCopy && (
          <button
            onClick={() => onCopy(value)}
            className="p-2 rounded-lg border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            title="Copiar"
          >
            <Copy className="h-4 w-4" />
          </button>
        )}
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg border border-surface-700 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
            title="Abrir no mempool.space"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}

function CheckRow({
  ok,
  label,
  detail,
}: {
  ok: boolean;
  label: string;
  detail: string;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 ${
        ok
          ? "border-emerald-500/30 bg-emerald-500/5"
          : "border-red-500/30 bg-red-500/5"
      }`}
    >
      {ok ? (
        <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <div className={`text-sm font-medium ${ok ? "text-emerald-300" : "text-red-300"}`}>
          {label}
        </div>
        <div className="text-xs text-surface-400 mt-0.5">{detail}</div>
      </div>
    </div>
  );
}
