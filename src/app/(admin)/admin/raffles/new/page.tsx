"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Save, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SkinSearchInput } from "@/components/admin/skin-search-input";
import { WearSelector } from "@/components/admin/wear-selector";
import type { SkinSelection } from "@/types/cs2.types";

export default function NewRafflePage() {
  const router = useRouter();
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

  // Auto-fill form fields when skin or wear changes
  useEffect(() => {
    if (!skin) return;
    const wearLabel = skin.skinWear || "";
    const title = wearLabel
      ? `${skin.skinName} (${wearLabel})`
      : skin.skinName;
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

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.title.trim()) errs.title = "Titulo e obrigatorio";
    if (!form.description.trim()) errs.description = "Descricao e obrigatoria";
    if (!form.pricePerNumber || Number(form.pricePerNumber) <= 0)
      errs.pricePerNumber = "Preco deve ser maior que 0";
    if (!form.totalNumbers || Number(form.totalNumbers) <= 0)
      errs.totalNumbers = "Quantidade deve ser maior que 0";
    if (!skin) errs.skin = "Selecione uma skin";
    if (skin && !skin.skinWear) errs.wear = "Selecione o wear da skin";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (activate: boolean) => {
    if (!validate()) return;
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
      if (form.scheduledDrawAt) {
        body.drawDate = form.scheduledDrawAt;
      }
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
        alert(json.error || "Erro ao criar rifa");
        return;
      }
      router.push("/admin/raffles");
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkinSelect = (selected: SkinSelection) => {
    setSkin(selected);
    if (errors.skin) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.skin;
        return next;
      });
    }
  };

  const handleWearChange = (wear: string) => {
    if (!skin) return;
    setSkin({ ...skin, skinWear: wear });
    if (errors.wear) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.wear;
        return next;
      });
    }
  };

  const handleFloatChange = (float: number | null) => {
    if (!skin) return;
    setSkin({ ...skin, skinFloat: float });
  };

  const handleStatTrakChange = (statTrak: boolean) => {
    if (!skin) return;
    setSkin({ ...skin, skinStatTrak: statTrak });
  };

  const handleSouvenirChange = (souvenir: boolean) => {
    if (!skin) return;
    setSkin({ ...skin, skinSouvenir: souvenir });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nova Rifa - Skin CS2</h1>

      {/* Skin Search (most prominent) */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Skin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <SkinSearchInput
            onSelect={handleSkinSelect}
            selected={skin}
            onClear={() => setSkin(null)}
          />
          {errors.skin && <p className="text-xs text-red-500">{errors.skin}</p>}
        </CardContent>
      </Card>

      {/* Wear Selector (only shown after skin is selected) */}
      {skin && (
        <Card>
          <CardHeader>
            <CardTitle>Exterior / Wear</CardTitle>
          </CardHeader>
          <CardContent>
            <WearSelector
              selectedWear={skin.skinWear}
              onWearChange={handleWearChange}
              float={skin.skinFloat}
              onFloatChange={handleFloatChange}
              stattrak={skin.skinStatTrak}
              onStatTrakChange={handleStatTrakChange}
              souvenir={skin.skinSouvenir}
              onSouvenirChange={handleSouvenirChange}
              minFloat={skin.skinExteriorMin}
              maxFloat={skin.skinExteriorMax}
              hasStattrak={true}
              hasSouvenir={skin.skinSouvenir}
            />
            {errors.wear && <p className="mt-2 text-xs text-red-500">{errors.wear}</p>}
          </CardContent>
        </Card>
      )}

      {/* Form fields + Preview side-by-side */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form fields (2/3) */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informacoes da Rifa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Titulo</label>
                <Input
                  value={form.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Ex: AK-47 | Asiimov (Field-Tested)"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-500">{errors.title}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Descricao</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Descricao da rifa e do premio..."
                  rows={3}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Preco por Numero (R$)
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
                    <p className="mt-1 text-xs text-red-500">{errors.pricePerNumber}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Total de Numeros
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={form.totalNumbers}
                    onChange={(e) => updateField("totalNumbers", e.target.value)}
                    placeholder="1000"
                  />
                  {errors.totalNumbers && (
                    <p className="mt-1 text-xs text-red-500">{errors.totalNumbers}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Minimo por Compra
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={form.minPerPurchase}
                    onChange={(e) => updateField("minPerPurchase", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Maximo por Compra
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={form.maxPerPurchase}
                    onChange={(e) => updateField("maxPerPurchase", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">URL da Imagem</label>
                <Input
                  value={form.imageUrl}
                  onChange={(e) => updateField("imageUrl", e.target.value)}
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Regulamento</label>
                <Textarea
                  value={form.regulation}
                  onChange={(e) => updateField("regulation", e.target.value)}
                  placeholder="Termos e regulamento da rifa..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Data do Sorteio
                  </label>
                  <Input
                    type="datetime-local"
                    value={form.scheduledDrawAt}
                    onChange={(e) => updateField("scheduledDrawAt", e.target.value)}
                  />
                </div>
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) => updateField("isFeatured", e.target.checked)}
                      className="h-4 w-4 rounded border-[var(--input)] accent-primary-600"
                    />
                    Rifa em destaque
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview sidebar (1/3) */}
        <div className="hidden lg:block">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {skin ? (
                <div className="space-y-4">
                  <div
                    className="flex items-center justify-center rounded-xl p-6"
                    style={{
                      background: `linear-gradient(135deg, ${skin.skinRarityColor}15, ${skin.skinRarityColor}05)`,
                    }}
                  >
                    <Image
                      src={skin.skinImage}
                      alt={skin.skinName}
                      width={200}
                      height={150}
                      className="object-contain drop-shadow-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold truncate">
                      {form.title || skin.skinName}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                        style={{ backgroundColor: skin.skinRarityColor }}
                      >
                        {skin.skinRarity}
                      </span>
                      {skin.skinWear && (
                        <span className="inline-flex items-center rounded-full bg-surface-800/60 px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                          {skin.skinWear}
                        </span>
                      )}
                      {skin.skinStatTrak && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-orange-400 bg-orange-500/10">
                          StatTrak&trade;
                        </span>
                      )}
                      {skin.skinSouvenir && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-yellow-400 bg-yellow-500/10">
                          Souvenir
                        </span>
                      )}
                    </div>
                    {form.pricePerNumber && (
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Cota:{" "}
                        <span className="font-bold text-accent-500">
                          R$ {Number(form.pricePerNumber).toFixed(2)}
                        </span>
                      </p>
                    )}
                    {form.totalNumbers && (
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {form.totalNumbers} numeros
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <svg
                    className="mb-3 h-12 w-12 text-[var(--muted-foreground)]/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v13.5A1.5 1.5 0 0 0 3.75 21Z"
                    />
                  </svg>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Selecione uma skin para ver o preview
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          isLoading={isSubmitting}
          onClick={() => handleSubmit(false)}
        >
          <Save className="h-4 w-4" />
          Salvar Rascunho
        </Button>
        <Button isLoading={isSubmitting} onClick={() => handleSubmit(true)}>
          <Zap className="h-4 w-4" />
          Criar Rifa
        </Button>
      </div>
    </div>
  );
}
