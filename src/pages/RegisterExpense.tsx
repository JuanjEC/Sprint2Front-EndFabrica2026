import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Logo } from "@/components/Logo";
import { getCategories, getExpenses, saveExpenses } from "@/lib/finance";

export default function RegisterExpense() {
  const navigate = useNavigate();
  const categories = getCategories();
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoriaId, setCategoriaId] = useState(categories[0]?.id || "");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(monto);
    if (!monto || Number.isNaN(value) || value <= 0) {
      setError("El monto debe ser superior a cero");
      return;
    }
    if (!categoriaId) {
      setError("Selecciona una categoría");
      return;
    }
    const expenses = getExpenses();
    expenses.push({ id: crypto.randomUUID(), monto: value, descripcion: descripcion.trim(), categoriaId, fecha: new Date().toISOString() });
    saveExpenses(expenses);
    toast.success("Gasto guardado exitosamente. Presupuesto actualizado.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center shadow-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}><ArrowLeft size={22} /></Button>
        <span className="text-base font-semibold text-foreground ml-2">Registrar Gasto</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-10 max-w-lg mx-auto w-full">
        <Logo size="sm" showText={false} />
        <h1 className="text-xl font-bold text-foreground mt-5 mb-8">Registrar Gasto</h1>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Monto</label>
            <Input type="number" placeholder="0" value={monto} onChange={(e) => { setMonto(e.target.value); setError(""); }} className="text-lg" min="0" step="any" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Categoría</label>
            <Select value={categoriaId} onValueChange={(value) => { setCategoriaId(value); setError(""); }}>
              <SelectTrigger><SelectValue placeholder="Selecciona una categoría" /></SelectTrigger>
              <SelectContent>
                {categories.map((category) => <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Descripción <span className="text-muted-foreground font-normal">(Opcional)</span></label>
            <Textarea placeholder="Ej: Compra supermercado" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} />
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full gradient-hero text-primary-foreground font-semibold h-12 text-base">Registrar</Button>
        </form>
      </main>
    </div>
  );
}