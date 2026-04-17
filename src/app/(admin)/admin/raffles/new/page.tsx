"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save, Zap, Check, ArrowLeft, ArrowRight, Sparkles, Settings,
  Eye, Package,
} from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SkinSearchInput } from "@/components/admin/skin-search-input";
import { WearSelector } from "@/components/admin/wear-selector";
import type { SkinSelection } from "@/types/cs2.types";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

type Step = 1 | 2 | 3;

const STEPS = [
  { num: 1, label: "Skin", icon: Package },
  { num: 2, label: "Configurações", icon: Settings },
  { num: 3, label: "Revisão", icon: Eye },
] as const;

export default function NewRafflePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skin, setSkin] = useState<SkinSelection | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    pricePerNumber: "",
    totalNumbers: "",
    minPerPurchase: "1",
    maxPerPurchase: "100",
    imageUrl: "",
    regulation: "",
    scheduledDrawAt: "",
    isFeatured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-fill fields when skin or wear changes
  useEffect(() => {
    if (!skin) return;
    const wearLabel = skin.skinWear || "";
    const title = wearLabel ? `${skin.skinName} (${wearLabel})` : skin.skinName;
    const description = wearLabel
      ? `Concorra a um(a) ${skin.skinName} (${wearLabel}) no CS2!`
      : `Concorra a um(a) ${skin.skinName} no CS2!`;

    setForm((prev) => ({
      ...prev,
      title,
      description,
      imageUrl: skin.skinImage || prev.imageUrl,
    }));
  }, [skin]);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  function validateStep(s: Step): Record<string, string> {
    const errs: Record<string, string> = {};
    if (s >= 1) {
      if (!skin) errs.skin = "Selecione uma skin";
      if (skin && !skin.skinWear) errs.wear = "Selecione o desgaste da skin";
    }
    if (s >= 2) {
      if (!form.title.trim()) errs.title = "Título é obrigatório";
      if (!form.description.trim()) errs.description = "Descrição é obrigatória";
      if (!form.pricePerNumber || Number(form.pricePerNumber) <= 0)
        errs.pricePerNumber = "Preço deve ser maior que 0";
      if (!form.totalNumbers || Number(form.totalNumbers) <= 0)
        errs.totalNumbers = "Quantidade deve ser maior que 0";
      const min = Number(form.minPerPurchase);
      const max = Number(form.maxPerPurchase);
      if (min <= 0) errs.minPerPurchase = "Mínimo ≥ 1";
      if (max < min) errs.maxPerPurchase = "Máximo deve ser ≥ mínimo";
      if (max > Number(form.totalNumbers || 0)) errs.maxPerPurchase = "Máximo não pode passar do total";
    }
    return errs;
  }

  function nextStep() {
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstError = Object.values(errs)[0];
      addToast({ type: "error", message: firstError });
      return;
    }
    setErrors({});
    setStep((s) => (Math.min(3, s + 1) as Step));
  }

  function prevStep() {
    setErrors({});
    setStep((s) => (Math.max(1, s - 1) as Step));
  }

  function goToStep(target: Step) {
    // Allow going backwards freely; forward only if current validates
    if (target < step) {
      setErrors({});
      setStep(target);
      return;
    }
    const errs = validateStep(step);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStep(target);
  }

  const handleSubmit = async (activate: boolean) => {
    const errs = { ...validateStep(1), ...validateStep(2) };
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      addToast({ type: "error", message: "Existem campos inválidos" });
      return;
    }

    setIsSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        description: form.description,
        pricePerNumber: Number(form.pricePerNumber),
        totalNumbers: Number(form.totalNumbers),
        minPerPurchase: Number(form.minPerPurchase),
        maxPerPurchase: Number(form.maxPerPurchase),
        regulation: form.regulation || undefined,
        imageUrl: form.imageUrl || undefined,
        isFeatured: form.isFeatured,
        status: activate ? "ACTIVE" : "DRAFT",
      };
      if (form.scheduledDrawAt) body.drawDate = form.scheduledDrawAt;
      if (skin) {
        body.skinName = skin.skinName;
        body.skinImage = skin.skinImage;
        body.skinWeapon = skin.skinWeapon;
        body.skinCategory = skin.skinCategory;
        body.skinRarity = skin.skinRarity;
        body.skinRarityColor = skin.skinRarityColor;
        body.skinWear = skin.skinWear;
        body.skinFloat = skin.skinFloat;
        body.skinStatTrak = skin.skinStatTrak;
        body.skinSouvenir = skin.skinSouvenir;
        body.skinExteriorMin = skin.skinExteriorMin;
        body.skinExteriorMax = skin.skinExteriorMax;
        body.skinMarketPrice = skin.skinMarketPrice;
      }
      const res = await fetch("/api/admin/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) {
        addToast({ type: "error", message: json.error || "Erro ao criar rifa" });
        return;
      }
      addToast({
        type: "success",
        message: activate ? "Rifa publicada" : "Rascunho salvo",
      });
      router.push("/admin/raffles");
    } catch {
      addToast({ type: "error", message: "Erro de conexão ao criar rifa" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nova Rifa</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          Siga os passos pra criar uma rifa de skin CS2
        </p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-0 sm:gap-4">
        {STEPS.map((s, i) => {
          const done = step > s.num;
          const current = step === s.num;
          const Icon = done ? Check : s.icon;
          return (
            <div key={s.num} className="flex-1 flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => goToStep(s.num as Step)}
                className={cn(
                  "flex items-center gap-2 sm:gap-3 transition-colors",
                  done && "text-emerald-400",
                  current && "text-primary-400",
                  !done && !current && "text-surface-500"
                )}
              >
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors shrink-0",
                    done && "bg-emerald-500/20 border-emerald-500/40",
                    current && "bg-primary-500/20 border-primary-500/50",
                    !done && !current && "bg-surface-900 border-surface-700"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[10px] uppercase tracking-wider text-surface-500">
                    Passo {s.num}
                  </p>
                  <p className="text-sm font-semibold">{s.label}</p>
                </div>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 transition-colors",
                    step > s.num ? "bg-emerald-500/40" : "bg-surface-800"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      {step === 1 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary-400" />
                Qual skin será sorteada?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkinSearchInput
                onSelect={(s) => {
                  setSkin(s);
                  setErrors((p) => {
                    const n = { ...p };
                    delete n.skin;
                    return n;
                  });
                }}
                selected={skin}
                onClear={() => setSkin(null)}
              />
              {errors.skin && <p className="text-xs text-red-400">{errors.skin}</p>}
            </CardContent>
          </Card>

          {skin && (
            <Card>
              <CardHeader>
                <CardTitle>Exterior / Desgaste</CardTitle>
              </CardHeader>
              <CardContent>
                <WearSelector
                  selectedWear={skin.skinWear}
                  onWearChange={(w) => {
                    setSkin({ ...skin, skinWear: w });
                    setErrors((p) => {
                      const n = { ...p };
                      delete n.wear;
                      return n;
                    });
                  }}
                  float={skin.skinFloat}
                  onFloatChange={(f) => setSkin({ ...skin, skinFloat: f })}
                  stattrak={skin.skinStatTrak}
                  onStatTrakChange={(v) => setSkin({ ...skin, skinStatTrak: v })}
                  souvenir={skin.skinSouvenir}
                  onSouvenirChange={(v) => setSkin({ ...skin, skinSouvenir: v })}
                  minFloat={skin.skinExteriorMin}
                  maxFloat={skin.skinExteriorMax}
                  hasStattrak={true}
                  hasSouvenir={skin.skinSouvenir}
                />
                {errors.wear && (
                  <p className="mt-2 text-xs text-red-400">{errors.wear}</p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da rifa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Título</label>
                  <Input
                    value={form.title}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="Ex: AK-47 | Asiimov (Field-Tested)"
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-400">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Descrição</label>
                  <Textarea
                    value={form.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    placeholder="Descrição da rifa e do prêmio..."
                    rows={3}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-400">{errors.description}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Preço por cota (AHC)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={form.pricePerNumber}
                      onChange={(e) => updateField("pricePerNumber", e.target.value)}
                      placeholder="5.00"
                    />
                    {errors.pricePerNumber && (
                      <p className="mt-1 text-xs text-red-400">{errors.pricePerNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Total de números</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.totalNumbers}
                      onChange={(e) => updateField("totalNumbers", e.target.value)}
                      placeholder="1000"
                    />
                    {errors.totalNumbers && (
                      <p className="mt-1 text-xs text-red-400">{errors.totalNumbers}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Mínimo por compra</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.minPerPurchase}
                      onChange={(e) => updateField("minPerPurchase", e.target.value)}
                    />
                    {errors.minPerPurchase && (
                      <p className="mt-1 text-xs text-red-400">{errors.minPerPurchase}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Máximo por compra</label>
                    <Input
                      type="number"
                      min="1"
                      value={form.maxPerPurchase}
                      onChange={(e) => updateField("maxPerPurchase", e.target.value)}
                    />
                    {errors.maxPerPurchase && (
                      <p className="mt-1 text-xs text-red-400">{errors.maxPerPurchase}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">URL da imagem (opcional)</label>
                  <Input
                    value={form.imageUrl}
                    onChange={(e) => updateField("imageUrl", e.target.value)}
                    placeholder="Por padrão usa a imagem da skin"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">Regulamento (opcional)</label>
                  <Textarea
                    value={form.regulation}
                    onChange={(e) => updateField("regulation", e.target.value)}
                    placeholder="Termos e regulamento da rifa..."
                    rows={4}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Data do sorteio (opcional)</label>
                    <DateTimePicker
                      value={form.scheduledDrawAt}
                      onChange={(val) => updateField("scheduledDrawAt", val)}
                    />
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) => updateField("isFeatured", e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--input)] accent-primary-600"
                      />
                      Rifa em destaque na home
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sticky preview */}
          <div className="hidden lg:block">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-sm">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <SkinPreview skin={skin} form={form} compact />
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Revise antes de publicar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <SkinPreview skin={skin} form={form} />

              <div className="space-y-3 text-sm">
                <Field label="Título" value={form.title} />
                <Field label="Descrição" value={form.description} multiline />
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Preço por cota" value={`${form.pricePerNumber} AHC`} />
                  <Field label="Total de números" value={form.totalNumbers} />
                  <Field label="Min. por compra" value={form.minPerPurchase} />
                  <Field label="Máx. por compra" value={form.maxPerPurchase} />
                </div>
                <Field
                  label="Receita máxima estimada"
                  value={`${(Number(form.pricePerNumber || 0) * Number(form.totalNumbers || 0)).toFixed(2)} AHC`}
                  highlight
                />
                {form.scheduledDrawAt && (
                  <Field
                    label="Sorteio agendado"
                    value={new Date(form.scheduledDrawAt).toLocaleString("pt-BR")}
                  />
                )}
                {form.isFeatured && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-400">
                    ⭐ Em destaque
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-primary-500/20 bg-primary-500/5 p-4 text-xs text-surface-300 flex items-start gap-2">
              <Sparkles className="h-4 w-4 text-primary-400 mt-0.5 shrink-0" />
              <span>
                Ao publicar: seed provably fair será commitado automaticamente e a rifa ficará
                visível no site. <strong>Salvar rascunho</strong> permite editar antes de publicar.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={step === 1 || isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        <div className="flex items-center gap-2 flex-wrap">
          {step < 3 && (
            <Button onClick={nextStep} disabled={isSubmitting}>
              Próximo
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
          {step === 3 && (
            <>
              <Button
                variant="outline"
                isLoading={isSubmitting}
                onClick={() => handleSubmit(false)}
              >
                <Save className="h-4 w-4" />
                Salvar rascunho
              </Button>
              <Button isLoading={isSubmitting} onClick={() => handleSubmit(true)}>
                <Zap className="h-4 w-4" />
                Publicar agora
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SkinPreview({
  skin,
  form,
  compact = false,
}: {
  skin: SkinSelection | null;
  form: { title: string; pricePerNumber: string; totalNumbers: string };
  compact?: boolean;
}) {
  if (!skin) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-700 py-10 text-center">
        <Package className="mb-2 h-10 w-10 text-surface-600" />
        <p className="text-sm text-surface-500">Nenhuma skin selecionada</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className={`flex items-center justify-center rounded-xl ${compact ? "p-4" : "p-6"}`}
        style={{
          background: `linear-gradient(135deg, ${skin.skinRarityColor}20, ${skin.skinRarityColor}05)`,
        }}
      >
        <Image
          src={skin.skinImage}
          alt={skin.skinName}
          width={compact ? 180 : 260}
          height={compact ? 140 : 200}
          className="object-contain drop-shadow-xl"
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-bold">{form.title || skin.skinName}</h3>
        <div className="flex flex-wrap gap-1.5">
          {skin.skinRarity && (
            <span
              className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ backgroundColor: skin.skinRarityColor }}
            >
              {skin.skinRarity}
            </span>
          )}
          {skin.skinWear && (
            <span className="inline-flex items-center rounded-full bg-surface-800/60 px-2 py-0.5 text-[10px] font-medium text-surface-300">
              {skin.skinWear}
            </span>
          )}
          {skin.skinStatTrak && (
            <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
              StatTrak™
            </span>
          )}
          {skin.skinSouvenir && (
            <span className="inline-flex items-center rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
              Souvenir
            </span>
          )}
        </div>
        {form.pricePerNumber && (
          <p className="text-sm text-surface-400">
            Cota: <span className="font-bold text-accent-500">{Number(form.pricePerNumber).toFixed(2)} AHC</span>
          </p>
        )}
        {form.totalNumbers && (
          <p className="text-xs text-surface-500">{form.totalNumbers} números</p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  multiline = false,
  highlight = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-surface-500">{label}</p>
      <p
        className={cn(
          "mt-0.5",
          multiline ? "text-sm text-surface-300 whitespace-pre-wrap" : "text-sm font-semibold",
          highlight && "text-accent-400 text-base"
        )}
      >
        {value || <span className="text-surface-600 italic">vazio</span>}
      </p>
    </div>
  );
}
