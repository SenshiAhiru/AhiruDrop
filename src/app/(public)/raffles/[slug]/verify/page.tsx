"use client";

import { useEffect, useState, useRef } from "react";
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
  Check,
  ChevronDown,
  FileJson,
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
  error: string | null;
};

// Browser-side SHA-256
async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Browser-side HMAC-SHA256
async function hmacSha256Hex(keyHex: string, message: string): Promise<string> {
  const keyBytes = new TextEncoder().encode(keyHex);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
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
  const [showIntro, setShowIntro] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const hasRun = useRef(false);

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
    if (!data || !data.reveal || hasRun.current) return;
    hasRun.current = true;
    setVerifying(true);

    try {
      const seed = data.reveal.serverSeedRevealed!;
      const committedHash = data.commit.serverSeedHash!;
      const blockHash = data.reveal.blockHash!;

      const computedHash = await sha256Hex(seed);
      const hashMatches = computedHash.toLowerCase() === committedHash.toLowerCase();

      const message = `${blockHash}:${data.raffleId}`;
      const hmacHex = await hmacSha256Hex(seed, message);
      const slice = hmacHex.slice(0, 16);
      const bigNum = BigInt("0x" + slice);
      const idx = Number(bigNum % BigInt(data.totalPaidTickets));

      setResult({
        hashMatches,
        computedIndex: idx,
        error: null,
      });
    } catch (err) {
      setResult({
        hashMatches: null,
        computedIndex: null,
        error: err instanceof Error ? err.message : "Erro na verificação",
      });
    } finally {
      setVerifying(false);
    }
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text).catch(() => {});
  }

  function copyJSON() {
    if (!data) return;
    const payload = {
      raffle_id: data.raffleId,
      raffle_title: data.raffleTitle,
      total_paid_tickets: data.totalPaidTickets,
      commit: {
        server_seed_hash: data.commit.serverSeedHash,
        draw_block_height: data.commit.drawBlockHeight,
      },
      reveal: data.reveal
        ? {
            drawn_at: data.reveal.drawnAt,
            server_seed: data.reveal.serverSeedRevealed,
            block_hash: data.reveal.blockHash,
            block_height: data.reveal.blockHeight,
            winning_number: data.reveal.winningNumber,
          }
        : null,
      algorithm: {
        commit_check: "SHA-256(server_seed) === server_seed_hash",
        winner_formula:
          "index = ( first_16_hex( HMAC-SHA256(server_seed, block_hash + ':' + raffle_id) ) as uint64 ) mod total_paid_tickets",
      },
    };
    const json = JSON.stringify(payload, null, 2);
    navigator.clipboard
      .writeText(json)
      .then(() => {
        setCopiedJson(true);
        setTimeout(() => setCopiedJson(false), 2000);
      })
      .catch(() => {});
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

  const canVerify =
    data.reveal &&
    data.commit.serverSeedHash &&
    data.reveal.serverSeedRevealed &&
    data.reveal.blockHash;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Back link */}
      <Link
        href={`/raffles/${slug}`}
        className="text-sm text-surface-400 hover:text-white transition-colors inline-block"
      >
        ← Voltar para a rifa
      </Link>

      {/* Hero */}
      <div className="rounded-2xl border border-primary-500/20 bg-gradient-to-br from-primary-950/40 via-surface-900/60 to-surface-900/60 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-500/10 ring-1 ring-primary-500/30">
          <Shield className="h-8 w-8 text-primary-400" />
        </div>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary-400 mb-2">
          Algoritmo Provably Fair
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {data.raffleTitle}
        </h1>
        <p className="text-sm text-surface-400 max-w-2xl mx-auto">
          O AhiruDrop usa commit-reveal ancorado na blockchain do Bitcoin pra garantir
          imparcialidade total. Ninguém — nem a plataforma — pode prever ou alterar o
          número vencedor. Confira você mesmo.
        </p>

        <button
          onClick={() => setShowIntro(!showIntro)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg border border-primary-500/30 bg-primary-500/10 px-4 py-2 text-sm font-semibold text-primary-300 hover:bg-primary-500/20 transition-colors"
        >
          {showIntro ? "Ocultar explicação" : "Mostrar como funciona"}
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showIntro ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Explanation (collapsible) */}
      {showIntro && (
        <div className="rounded-xl border border-surface-700 bg-surface-900/50 p-6 text-sm text-surface-300 space-y-4">
          <p>
            Nossa fórmula é aberta e qualquer pessoa pode recomputar. Você vai precisar
            dos valores abaixo:
          </p>
          <ul className="space-y-2 pl-5 list-disc marker:text-primary-400">
            <li>
              <strong className="text-white">Server Seed:</strong> string aleatória
              gerada pelo servidor antes da rifa começar. O hash SHA-256 dele é
              publicado na hora da criação — o seed original só é revelado depois do
              sorteio, provando que não foi alterado.
            </li>
            <li>
              <strong className="text-white">Block Hash (Bitcoin):</strong> hash do
              bloco do Bitcoin na altura pré-definida. Impossível de prever ou
              manipular (a rede Bitcoin gera uns 144 blocos/dia de forma distribuída).
            </li>
            <li>
              <strong className="text-white">Raffle ID:</strong> identificador único
              desta rifa, usado como nonce.
            </li>
          </ul>
          <div className="rounded-lg border border-surface-700 bg-surface-800/40 p-4 space-y-3 font-mono text-xs">
            <div>
              <span className="text-surface-500">// Passo 1 — prova do seed:</span>
              <br />
              <span className="text-emerald-400">SHA-256</span>(server_seed) ={" "}
              <span className="text-amber-300">server_seed_hash</span>
            </div>
            <div>
              <span className="text-surface-500">// Passo 2 — escolha do vencedor:</span>
              <br />
              h ={" "}
              <span className="text-emerald-400">HMAC-SHA256</span>(server_seed, block_hash + &quot;:&quot; + raffle_id)
              <br />
              idx = (h[0..16] como uint64){" "}
              <span className="text-accent-400">mod</span> total_tickets_pagos
              <br />
              <span className="text-amber-300">winning_number</span> = ticket_pagos_ordenados[idx]
            </div>
          </div>
          <p className="text-xs text-surface-400">
            Basta aplicar a fórmula nos valores abaixo usando qualquer ferramenta
            SHA-256/HMAC (ex: biblioteca crypto do Node, Python, ou ferramentas
            online). O botão &ldquo;Verificar agora&rdquo; faz isso localmente no seu
            navegador com WebCrypto.
          </p>
        </div>
      )}

      {/* Data table */}
      <section className="rounded-xl border border-surface-700 bg-surface-900/50 overflow-hidden">
        <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-surface-700 bg-surface-900/70">
          <div className="flex items-center gap-2">
            <FileJson className="h-5 w-5 text-accent-400" />
            <h2 className="text-base font-semibold text-white">Dados do sorteio</h2>
          </div>
          <button
            onClick={copyJSON}
            className="inline-flex items-center gap-2 rounded-lg border border-accent-500/30 bg-accent-500/10 px-3 py-1.5 text-xs font-semibold text-accent-300 hover:bg-accent-500/20 transition-colors"
          >
            {copiedJson ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copiar JSON
              </>
            )}
          </button>
        </header>

        <div className="divide-y divide-surface-800">
          <DataRow
            label="Public Hash"
            sublabel="SHA-256(server_seed) — committed antes do sorteio"
            value={data.commit.serverSeedHash}
            onCopy={copy}
          />
          <DataRow
            label="Server Seed"
            sublabel={
              data.reveal?.serverSeedRevealed
                ? "Revelado após o sorteio"
                : "Será revelado após o sorteio"
            }
            value={data.reveal?.serverSeedRevealed ?? null}
            onCopy={copy}
          />
          <DataRow
            label="Block Hash (Bitcoin)"
            sublabel="Hash do bloco BTC usado como entropia pública"
            value={data.reveal?.blockHash ?? null}
            onCopy={copy}
            link={
              data.reveal?.blockHash
                ? `https://mempool.space/block/${data.reveal.blockHash}`
                : undefined
            }
            linkLabel="mempool.space"
          />
          <DataRow
            label="Block Height"
            sublabel="Altura do bloco Bitcoin"
            value={
              data.reveal?.blockHeight?.toString() ??
              data.commit.drawBlockHeight?.toString() ??
              null
            }
            link={
              data.reveal?.blockHeight
                ? `https://mempool.space/block/${data.reveal.blockHeight}`
                : data.commit.drawBlockHeight
                ? `https://mempool.space/block/${data.commit.drawBlockHeight}`
                : undefined
            }
            linkLabel="mempool.space"
            plain
          />
          <DataRow
            label="Raffle ID"
            sublabel="Identificador único da rifa (nonce)"
            value={data.raffleId}
            onCopy={copy}
          />
          <DataRow
            label="Total de tickets pagos"
            sublabel="Denominador no cálculo modular"
            value={data.totalPaidTickets.toString()}
            plain
          />
          {data.reveal && (
            <DataRow
              label="Winning Number"
              sublabel="Resultado final do sorteio"
              value={data.reveal.winningNumber.toString()}
              highlight
              plain
            />
          )}
        </div>
      </section>

      {/* Verification */}
      {canVerify && (
        <section className="rounded-xl border border-surface-700 bg-surface-900/50 overflow-hidden">
          <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-surface-700 bg-surface-900/70">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary-400" />
              <h2 className="text-base font-semibold text-white">
                Verificar no seu navegador
              </h2>
            </div>
          </header>

          <div className="p-5 space-y-4">
            <p className="text-sm text-surface-400">
              O cálculo roda localmente via WebCrypto (nenhum dado vai pro servidor).
            </p>

            <button
              onClick={runVerification}
              disabled={verifying || !!result}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${
                result && !result.error
                  ? "bg-emerald-600 text-white"
                  : "bg-primary-600 text-white hover:bg-primary-700"
              }`}
            >
              {verifying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : result && !result.error ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Verificado
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Verificar agora
                </>
              )}
            </button>

            {result && (
              <div className="space-y-3 pt-2">
                {result.error ? (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    {result.error}
                  </div>
                ) : (
                  <>
                    <CheckRow
                      ok={result.hashMatches === true}
                      label="SHA-256(server_seed) === Public Hash"
                      detail={
                        result.hashMatches
                          ? "O server seed não foi alterado desde a criação da rifa."
                          : "ATENÇÃO: o seed não corresponde ao hash commitado."
                      }
                    />

                    <div className="rounded-lg border border-surface-700 bg-surface-800/40 p-4 space-y-2 font-mono text-xs">
                      <div className="text-surface-500">Cálculo independente:</div>
                      <div className="text-surface-300 break-all">
                        HMAC-SHA256(server_seed, block_hash + &quot;:&quot; + raffle_id)
                      </div>
                      <div className="text-white">
                        → primeiros 16 hex, mod{" "}
                        <span className="text-accent-400">
                          {data.totalPaidTickets}
                        </span>
                      </div>
                      <div className="pt-2 text-white text-sm">
                        Índice computado:{" "}
                        <span className="text-accent-400 font-bold">
                          {result.computedIndex}
                        </span>
                        <span className="text-surface-500 text-xs">
                          {" "}
                          (range: 0 a {data.totalPaidTickets - 1})
                        </span>
                      </div>
                      <div className="text-surface-400 text-[11px] pt-1">
                        O servidor mapeou esse índice para o número vencedor{" "}
                        <strong className="text-accent-400">
                          #{data.reveal!.winningNumber}
                        </strong>{" "}
                        na lista ordenada de tickets pagos.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* External verification walkthrough */}
      {canVerify && (
        <section className="rounded-xl border border-surface-800 bg-surface-900/30 overflow-hidden">
          <header className="flex items-center gap-2 px-5 py-4 border-b border-surface-800 bg-surface-900/50">
            <ExternalLink className="h-5 w-5 text-surface-400" />
            <h3 className="text-base font-semibold text-white">
              Verificação manual (independente)
            </h3>
          </header>

          <div className="p-5 space-y-6 text-sm">
            <p className="text-surface-400">
              Não precisa confiar no botão acima. Abaixo está o passo-a-passo pra
              recomputar em ferramentas de terceiros — cola os valores exatos, confere
              que bate.
            </p>

            {/* Step 1 — SHA-256 commit check */}
            <ExternalStep
              number={1}
              title="Confira o commit do seed"
              description="Calcule o SHA-256 do server seed revelado. O resultado tem que ser igual ao Public Hash."
              toolName="emn178 SHA-256 online"
              toolUrl="https://emn178.github.io/online-tools/sha256.html"
              inputs={[
                { label: "Cola no campo 'Input'", value: data.reveal!.serverSeedRevealed! },
              ]}
              expected={{
                label: "Output esperado",
                value: data.commit.serverSeedHash!,
              }}
              onCopy={copy}
            />

            {/* Step 2 — HMAC */}
            <ExternalStep
              number={2}
              title="Recompute o HMAC"
              description="HMAC-SHA256 com o server seed como chave e 'block_hash:raffle_id' como mensagem."
              toolName="devglan HMAC-SHA256"
              toolUrl="https://www.devglan.com/online-tools/hmac-sha256-online"
              inputs={[
                {
                  label: "Secret Key",
                  value: data.reveal!.serverSeedRevealed!,
                },
                {
                  label: "Plain Text",
                  value: `${data.reveal!.blockHash!}:${data.raffleId}`,
                },
              ]}
              expected={{
                label: "Output esperado (começa com...)",
                value: "— calcule e pegue os primeiros 16 caracteres hex",
                noCopy: true,
              }}
              onCopy={copy}
            />

            {/* Step 3 — modular math */}
            <div className="rounded-lg border border-surface-800 bg-surface-900/40 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-500/20 text-accent-400 text-xs font-bold">
                  3
                </span>
                <h4 className="text-sm font-semibold text-white">Calcule o índice final</h4>
              </div>
              <p className="text-xs text-surface-400">
                Pega os <strong>primeiros 16 caracteres hex</strong> do HMAC do passo 2,
                converte pra número inteiro (base 16) e aplica{" "}
                <code className="font-mono text-accent-400">mod {data.totalPaidTickets}</code>.
                O resultado tem que ser o <strong>índice</strong> que aponta pro
                ticket vencedor na lista ordenada.
              </p>
              <div className="rounded-md bg-surface-900/60 border border-surface-800 p-3 font-mono text-xs text-surface-300 space-y-1">
                <div>// exemplo em JavaScript (console do browser)</div>
                <div className="text-emerald-400">
                  const hex = &quot;<span className="text-amber-300">primeiros_16_hex_do_passo_2</span>&quot;;
                </div>
                <div className="text-emerald-400">
                  const idx = Number(BigInt(&quot;0x&quot; + hex) % {BigInt(data.totalPaidTickets).toString()}n);
                </div>
                <div className="text-white">
                  console.log(idx); <span className="text-surface-500">// deve dar o índice do vencedor</span>
                </div>
              </div>
            </div>

            {/* Step 4 — block check */}
            <ExternalStep
              number={4}
              title="Confirme o bloco do Bitcoin"
              description="Confere que o block hash realmente corresponde ao bloco na altura declarada (ninguém pode forjar um hash de bloco)."
              toolName={`mempool.space/block/${data.reveal!.blockHeight}`}
              toolUrl={`https://mempool.space/block/${data.reveal!.blockHeight}`}
              inputs={[]}
              expected={{
                label: "A página deve mostrar este hash como o do bloco",
                value: data.reveal!.blockHash!,
              }}
              onCopy={copy}
            />
          </div>
        </section>
      )}
    </div>
  );
}

/* ── Components ── */

function DataRow({
  label,
  sublabel,
  value,
  highlight,
  plain,
  onCopy,
  link,
  linkLabel,
}: {
  label: string;
  sublabel?: string;
  value: string | null;
  highlight?: boolean;
  plain?: boolean;
  onCopy?: (text: string) => void;
  link?: string;
  linkLabel?: string;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-2 px-5 py-4 hover:bg-surface-900/40 transition-colors">
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${highlight ? "text-accent-400" : "text-white"}`}>
          {label}
        </span>
        {sublabel && (
          <span className="text-[11px] text-surface-500 mt-0.5">{sublabel}</span>
        )}
      </div>
      <div className="flex items-center gap-2 min-w-0">
        {value ? (
          <>
            <code
              className={`flex-1 min-w-0 rounded-md border border-surface-800 bg-surface-900/60 px-3 py-1.5 text-xs break-all ${
                highlight
                  ? "text-accent-400 font-bold text-base"
                  : plain
                  ? "text-surface-200 font-mono"
                  : "text-surface-300 font-mono"
              }`}
            >
              {value}
            </code>
            {onCopy && (
              <button
                onClick={() => onCopy(value)}
                className="flex-shrink-0 p-1.5 rounded-md border border-surface-800 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                title="Copiar"
              >
                <Copy className="h-3.5 w-3.5" />
              </button>
            )}
            {link && (
              <a
                href={link}
                target="_blank"
                rel="noreferrer"
                className="flex-shrink-0 p-1.5 rounded-md border border-surface-800 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                title={linkLabel ?? "Abrir"}
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </>
        ) : (
          <span className="text-xs text-surface-600 italic">Aguardando sorteio</span>
        )}
      </div>
    </div>
  );
}

function ExternalStep({
  number,
  title,
  description,
  toolName,
  toolUrl,
  inputs,
  expected,
  onCopy,
}: {
  number: number;
  title: string;
  description: string;
  toolName: string;
  toolUrl: string;
  inputs: Array<{ label: string; value: string }>;
  expected: { label: string; value: string; noCopy?: boolean };
  onCopy: (text: string) => void;
}) {
  return (
    <div className="rounded-lg border border-surface-800 bg-surface-900/40 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary-500/20 text-primary-400 text-xs font-bold">
          {number}
        </span>
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>
      <p className="text-xs text-surface-400">{description}</p>

      <a
        href={toolUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-xs font-semibold text-primary-400 hover:underline"
      >
        Abrir {toolName} <ExternalLink className="h-3 w-3" />
      </a>

      {inputs.length > 0 && (
        <div className="space-y-2">
          {inputs.map((inp, i) => (
            <div key={i} className="space-y-1">
              <div className="text-[11px] text-surface-500">{inp.label}:</div>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 rounded-md border border-surface-800 bg-surface-900/70 px-2 py-1.5 font-mono text-[11px] text-surface-300 break-all">
                  {inp.value}
                </code>
                <button
                  onClick={() => onCopy(inp.value)}
                  className="flex-shrink-0 p-1.5 rounded-md border border-surface-800 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
                  title="Copiar"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-3 space-y-1">
        <div className="text-[11px] text-emerald-400/80">{expected.label}:</div>
        <div className="flex items-center gap-2">
          <code className="flex-1 min-w-0 font-mono text-[11px] text-emerald-300 break-all">
            {expected.value}
          </code>
          {!expected.noCopy && (
            <button
              onClick={() => onCopy(expected.value)}
              className="flex-shrink-0 p-1.5 rounded-md border border-emerald-500/20 text-emerald-400/70 hover:text-emerald-300 hover:bg-emerald-500/10 transition-colors"
              title="Copiar"
            >
              <Copy className="h-3 w-3" />
            </button>
          )}
        </div>
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
