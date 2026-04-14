"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Hash,
  Users,
  Sparkles,
  Shield,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

type RaffleData = {
  id: string;
  title: string;
  slug: string;
  status: string;
  totalNumbers: number;
  stats: { paid: number; reserved: number; available: number; total: number };
  serverSeedHash: string | null;
  drawBlockHeight: number | null;
};

type DrawResult = {
  winningNumber: number;
  draw: {
    id: string;
    drawMethod: string;
    drawnAt: string;
  };
  provablyFair: {
    serverSeedHash: string;
    serverSeedRevealed: string;
    blockHash: string;
    blockHeight: number;
    winningIndex: number;
    totalEligible: number;
  } | null;
};

export default function DrawPage() {
  const params = useParams();
  const raffleId = params.raffleId as string;

  const [raffle, setRaffle] = useState<RaffleData | null>(null);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  const [result, setResult] = useState<DrawResult | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [raffleRes, verifyRes, ordersRes] = await Promise.all([
          fetch(`/api/raffles/${raffleId}`, { cache: "no-store" }),
          fetch(`/api/raffles/${raffleId}/verify`, { cache: "no-store" }),
          fetch(`/api/admin/raffles/${raffleId}/participants`, { cache: "no-store" }).catch(() => null),
        ]);

        const rJson = await raffleRes.json();
        if (!rJson.success) {
          setLoadError(rJson.error || "Falha ao carregar rifa");
          return;
        }

        let serverSeedHash: string | null = null;
        let drawBlockHeight: number | null = null;
        if (verifyRes.ok) {
          const vJson = await verifyRes.json();
          if (vJson.success) {
            serverSeedHash = vJson.data.commit.serverSeedHash;
            drawBlockHeight = vJson.data.commit.drawBlockHeight;
          }
        }

        setRaffle({
          id: rJson.data.id,
          title: rJson.data.title,
          slug: rJson.data.slug,
          status: rJson.data.status,
          totalNumbers: rJson.data.totalNumbers,
          stats: rJson.data.stats,
          serverSeedHash,
          drawBlockHeight,
        });

        // Participants count is approximate — derived from stats if no dedicated endpoint
        if (ordersRes?.ok) {
          try {
            const oJson = await ordersRes.json();
            if (oJson.success) setParticipantCount(oJson.data.count || 0);
          } catch {}
        }
      } catch {
        setLoadError("Erro de conexão");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [raffleId]);

  async function handleDraw() {
    setConfirmOpen(false);
    setIsDrawing(true);
    setDrawError(null);

    try {
      const res = await fetch(`/api/admin/raffles/${raffleId}/draw`, {
        method: "POST",
      });
      const json = await res.json();

      if (!json.success) {
        setDrawError(json.error || "Falha ao executar sorteio");
        setIsDrawing(false);
        return;
      }

      setResult(json.data);
    } catch {
      setDrawError("Erro de conexão");
    } finally {
      setIsDrawing(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl py-20 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (loadError || !raffle) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {loadError || "Rifa não encontrada"}
        </div>
      </div>
    );
  }

  const checklist = [
    { label: "Rifa está encerrada (CLOSED)", passed: raffle.status === "CLOSED" },
    { label: "Possui números pagos", passed: raffle.stats.paid > 0 },
    {
      label: "Provably Fair: seed commitado",
      passed: Boolean(raffle.serverSeedHash),
      optional: true,
    },
    {
      label: "Provably Fair: bloco Bitcoin alvo definido",
      passed: Boolean(raffle.drawBlockHeight),
      optional: true,
    },
  ];
  const allRequiredPassed = checklist.filter((c) => !c.optional).every((c) => c.passed);
  const provablyFairReady = Boolean(raffle.serverSeedHash && raffle.drawBlockHeight);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href={`/admin/raffles/${raffleId}`}
          className="text-sm text-surface-400 hover:text-white"
        >
          ← Voltar para a rifa
        </Link>
        <h1 className="text-2xl font-bold tracking-tight mt-2">Sorteio: {raffle.title}</h1>
      </div>

      {!result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Checklist pré-sorteio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className={`h-5 w-5 ${item.optional ? "text-amber-500" : "text-red-500"}`} />
                  )}
                  <span className="text-sm">
                    {item.label}
                    {item.optional && !item.passed && (
                      <span className="ml-2 text-xs text-amber-500/70">(rifa antiga — usará fallback)</span>
                    )}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Provably Fair commit preview */}
          {provablyFairReady && (
            <Card className="border-emerald-500/30 bg-emerald-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  Compromisso Provably Fair
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-surface-400">Hash do seed (commitado na criação)</p>
                  <p className="mt-1 break-all rounded-lg bg-surface-800/60 p-2 font-mono text-xs">
                    {raffle.serverSeedHash}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-surface-400">Bloco Bitcoin alvo</p>
                  <a
                    href={`https://mempool.space/block/${raffle.drawBlockHeight}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 rounded-lg bg-surface-800/60 px-2 py-1 font-mono text-xs hover:bg-surface-800"
                  >
                    Altura {raffle.drawBlockHeight}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Hash className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-xs text-surface-400">Números pagos</p>
                  <p className="text-xl font-bold">{raffle.stats.paid}</p>
                  <p className="text-xs text-surface-500">de {raffle.totalNumbers} totais</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Users className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-xs text-surface-400">Participantes</p>
                  <p className="text-xl font-bold">
                    {participantCount > 0 ? participantCount : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-500">Atenção</p>
              <p className="mt-1 text-surface-400">
                O sorteio é uma ação irreversível. Uma vez realizado, o resultado não
                poderá ser alterado.
              </p>
            </div>
          </div>

          {drawError && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
              {drawError}
            </div>
          )}

          <div className="flex justify-center">
            <Button
              variant="accent"
              size="xl"
              disabled={!allRequiredPassed || isDrawing}
              isLoading={isDrawing}
              onClick={() => setConfirmOpen(true)}
              className="min-w-64"
            >
              <Trophy className="h-5 w-5" />
              Realizar Sorteio
            </Button>
          </div>
        </>
      )}

      {/* Result */}
      {result && (
        <>
          <Card className="border-accent-500/30 bg-accent-500/5">
            <CardContent className="p-8 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-accent-500" />
              <p className="text-sm font-medium text-surface-400">Número sorteado</p>
              <p className="mt-2 text-6xl font-black tracking-tight text-accent-500">
                {String(result.winningNumber).padStart(
                  String(raffle.totalNumbers).length,
                  "0"
                )}
              </p>
              <p className="mt-3 text-xs text-surface-500">
                Método: <span className="font-mono">{result.draw.drawMethod}</span>
              </p>
            </CardContent>
          </Card>

          {result.provablyFair && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald-400" />
                  Dados Provably Fair
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <FieldPre label="Hash commitado" value={result.provablyFair.serverSeedHash} />
                <FieldPre label="Seed revelado" value={result.provablyFair.serverSeedRevealed} />
                <FieldPre
                  label={`Hash do bloco #${result.provablyFair.blockHeight}`}
                  value={result.provablyFair.blockHash}
                  link={`https://mempool.space/block/${result.provablyFair.blockHash}`}
                />
                <div className="text-xs text-surface-400">
                  Índice computado: <span className="text-white font-mono">{result.provablyFair.winningIndex}</span>{" "}
                  (de {result.provablyFair.totalEligible} tickets pagos)
                </div>
                <Link
                  href={`/raffles/${raffle.slug}/verify`}
                  className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300"
                >
                  Ver página pública de verificação
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-3">
            <Link
              href={`/admin/raffles/${raffleId}`}
              className="flex-1 text-center rounded-lg border border-surface-700 px-4 py-2.5 text-sm font-medium text-surface-400 hover:text-white hover:bg-surface-800"
            >
              Voltar para a rifa
            </Link>
          </div>
        </>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogClose onClick={() => setConfirmOpen(false)} />
        <DialogHeader>
          <DialogTitle>Confirmar sorteio</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja realizar o sorteio agora? Esta ação é irreversível.
            {provablyFairReady && " O seed será revelado e o hash do bloco Bitcoin será travado."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button variant="accent" onClick={handleDraw} disabled={isDrawing}>
            <Trophy className="h-4 w-4" />
            Sortear agora
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function FieldPre({ label, value, link }: { label: string; value: string; link?: string }) {
  return (
    <div>
      <p className="text-xs text-surface-400">{label}</p>
      <div className="flex items-center gap-2 mt-1">
        <p className="flex-1 break-all rounded-lg bg-surface-800/60 p-2 font-mono text-xs">
          {value}
        </p>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="p-2 rounded-lg border border-surface-700 text-surface-400 hover:text-white"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        )}
      </div>
    </div>
  );
}
