import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/Logo";
import { getMonthlyBudget, saveMonthlyBudget } from "@/lib/finance";

export default function Budget() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState(String(getMonthlyBudget() || ""));
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      setError("Ingresa un presupuesto mensual superior a cero");
      return;
    }
    saveMonthlyBudget(value);
    toast.success("Presupuesto guardado exitosamente");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center shadow-card">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={22} />
        </Button>
        <span className="text-base font-semibold text-foreground ml-2">Configurar presupuesto</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 pt-10 max-w-lg mx-auto w-full">
        <Logo size="sm" showText={false} />
        <h1 className="text-xl font-bold text-foreground mt-5 mb-8">Presupuesto mensual</h1>

        <form onSubmit={handleSubmit} className="w-full space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Monto mensual</label>
            <Input type="number" min="0" step="any" value={amount} onChange={(e) => { setAmount(e.target.value); setError(""); }} placeholder="0" className="text-lg" />
          </div>
          {error && <p className="text-sm text-destructive font-medium">{error}</p>}
          <Button type="submit" className="w-full gradient-hero text-primary-foreground font-semibold h-12 text-base">Guardar presupuesto</Button>
        </form>
      </main>
    </div>
  );
}