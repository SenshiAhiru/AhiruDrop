"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Hash,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

// Mock data
const mockRaffle = {
  id: "r4",
  title: "Smart TV Samsung 65\" 4K",
  status: "CLOSED",
  totalPaidNumbers: 1000,
  totalParticipants: 342,
  totalNumbers: 1000,
};

interface DrawResult {
  winningNumber: number;
  winnerName: string;
  winnerEmail: string;
  hash: string;
  seed: string;
}

export default function DrawPage() {
  const params = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [result, setResult] = useState<DrawResult | null>(null);

  const checklist = [
    {
      label: "Rifa está encerrada (CLOSED)",
      passed: mockRaffle.status === "CLOSED",
    },
    {
      label: "Possui números pagos",
      passed: mockRaffle.totalPaidNumbers > 0,
    },
  ];

  const allPassed = checklist.every((c) => c.passed);

  const handleDraw = async () => {
    setConfirmOpen(false);
    setIsDrawing(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 2000));
    try {
      await fetch(`/api/admin/raffles/${params.raffleId}/draw`, {
        method: "POST",
      });
    } catch {
      // mock result
    }
    setResult({
      winningNumber: 427,
      winnerName: "Maria Silva",
      winnerEmail: "maria@email.com",
      hash: "a3f8e2c1d9b47605e8f1a2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3",
      seed: "ahirudrop-r4-1712880000-xk9m2",
    });
    setIsDrawing(false);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">
        Sorteio: {mockRaffle.title}
      </h1>

      {/* Pre-draw Checklist */}
      {!result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Checklist Pre-Sorteio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.passed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Hash className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Numeros Pagos
                  </p>
                  <p className="text-xl font-bold">{mockRaffle.totalPaidNumbers}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-3 p-5">
                <Users className="h-6 w-6 text-primary-600" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Participantes
                  </p>
                  <p className="text-xl font-bold">{mockRaffle.totalParticipants}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-yellow-500" />
            <div className="text-sm">
              <p className="font-semibold text-yellow-500">Atenção</p>
              <p className="mt-1 text-[var(--muted-foreground)]">
                O sorteio é uma ação irreversível. Uma vez realizado, o resultado não
                poderá ser alterado. Certifique-se de que tudo está correto antes de
                prosseguir.
              </p>
            </div>
          </div>

          {/* Draw Button */}
          <div className="flex justify-center">
            <Button
              variant="accent"
              size="xl"
              disabled={!allPassed || isDrawing}
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

      {/* Post-draw Result */}
      {result && (
        <>
          <Card className="border-accent-500/30 bg-accent-500/5">
            <CardContent className="p-8 text-center">
              <Sparkles className="mx-auto mb-4 h-12 w-12 text-accent-500" />
              <p className="text-sm font-medium text-[var(--muted-foreground)]">
                Número Sorteado
              </p>
              <p className="mt-2 text-6xl font-black tracking-tight text-accent-500">
                {String(result.winningNumber).padStart(4, "0")}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ganhador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Nome</span>
                <span className="font-medium">{result.winnerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted-foreground)]">Email</span>
                <span className="font-medium">{result.winnerEmail}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verificação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Hash</p>
                <p className="mt-1 break-all rounded-lg bg-[var(--muted)]/50 p-2 font-mono text-xs">
                  {result.hash}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-foreground)]">Seed</p>
                <p className="mt-1 break-all rounded-lg bg-[var(--muted)]/50 p-2 font-mono text-xs">
                  {result.seed}
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogClose onClick={() => setConfirmOpen(false)} />
        <DialogHeader>
          <DialogTitle>Confirmar Sorteio</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja realizar o sorteio agora? Esta ação é irreversível
            e o resultado será publicado imediatamente.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setConfirmOpen(false)}>
            Cancelar
          </Button>
          <Button variant="accent" onClick={handleDraw}>
            <Trophy className="h-4 w-4" />
            Sortear Agora
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}
