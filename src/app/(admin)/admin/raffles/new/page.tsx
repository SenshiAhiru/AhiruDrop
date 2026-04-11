"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Save, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function NewRafflePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    shortDescription: "",
    pricePerNumber: "",
    totalNumbers: "",
    minPerPurchase: "1",
    maxPerPurchase: "100",
    category: "",
    prizeType: "",
    regulation: "",
    scheduledDrawAt: "",
    isFeatured: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (activate: boolean) => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const body = {
        ...form,
        pricePerNumber: Number(form.pricePerNumber),
        totalNumbers: Number(form.totalNumbers),
        minPerPurchase: Number(form.minPerPurchase),
        maxPerPurchase: Number(form.maxPerPurchase),
        status: activate ? "ACTIVE" : "DRAFT",
      };
      await fetch("/api/admin/raffles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      router.push("/admin/raffles");
    } catch {
      // handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Nova Rifa</h1>

      {/* Informacoes Basicas */}
      <Card>
        <CardHeader>
          <CardTitle>Informacoes Basicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Titulo</label>
            <Input
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              placeholder="Ex: iPhone 15 Pro Max 256GB"
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Descricao</label>
            <Textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Descricao completa da rifa e do premio..."
              rows={4}
            />
            {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Descricao Curta</label>
            <Input
              value={form.shortDescription}
              onChange={(e) => updateField("shortDescription", e.target.value)}
              placeholder="Breve descricao para listagens"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuracao */}
      <Card>
        <CardHeader>
          <CardTitle>Configuracao</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Preco por Numero (R$)</label>
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
              <label className="mb-1.5 block text-sm font-medium">Total de Numeros</label>
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
              <label className="mb-1.5 block text-sm font-medium">Minimo por Compra</label>
              <Input
                type="number"
                min="1"
                value={form.minPerPurchase}
                onChange={(e) => updateField("minPerPurchase", e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Maximo por Compra</label>
              <Input
                type="number"
                min="1"
                value={form.maxPerPurchase}
                onChange={(e) => updateField("maxPerPurchase", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Categoria</label>
              <Select
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="electronics">Eletronicos</option>
                <option value="vehicles">Veiculos</option>
                <option value="cash">Dinheiro</option>
                <option value="fashion">Moda</option>
                <option value="other">Outros</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Tipo de Premio</label>
              <Select
                value={form.prizeType}
                onChange={(e) => updateField("prizeType", e.target.value)}
              >
                <option value="">Selecione...</option>
                <option value="product">Produto</option>
                <option value="cash">Dinheiro</option>
                <option value="experience">Experiencia</option>
                <option value="service">Servico</option>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Imagem */}
      <Card>
        <CardHeader>
          <CardTitle>Imagem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)]/30 p-10 text-center transition-colors hover:border-primary-500/50">
            <Upload className="mb-3 h-10 w-10 text-[var(--muted-foreground)]" />
            <p className="text-sm font-medium">Arraste uma imagem ou clique para fazer upload</p>
            <p className="mt-1 text-xs text-[var(--muted-foreground)]">
              PNG, JPG ou WebP ate 5MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Regulamento */}
      <Card>
        <CardHeader>
          <CardTitle>Regulamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={form.regulation}
            onChange={(e) => updateField("regulation", e.target.value)}
            placeholder="Termos e regulamento da rifa..."
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Data do Sorteio</label>
            <Input
              type="datetime-local"
              value={form.scheduledDrawAt}
              onChange={(e) => updateField("scheduledDrawAt", e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => updateField("isFeatured", e.target.checked)}
              className="h-4 w-4 rounded border-[var(--input)] accent-primary-600"
            />
            Rifa em destaque
          </label>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          isLoading={isSubmitting}
          onClick={() => handleSubmit(false)}
        >
          <Save className="h-4 w-4" />
          Salvar como Rascunho
        </Button>
        <Button isLoading={isSubmitting} onClick={() => handleSubmit(true)}>
          <Zap className="h-4 w-4" />
          Criar e Ativar
        </Button>
      </div>
    </div>
  );
}
