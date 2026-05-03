import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  FileText,
  Lightbulb,
  DollarSign,
  Target,
  Tags,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, getCategories, getExpenses, getIncomes, getMonthlyBudget, getTotal } from "@/lib/finance";

const chartColors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--info))", "hsl(var(--destructive))", "hsl(var(--warning))"];

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName] = useState("Usuario");
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [categoryData, setCategoryData] = useState<Array<{ name: string; percentage: number; color: string }>>([]);
  const [alertType, setAlertType] = useState<"preventive" | "critical" | null>(null);

  useEffect(() => {
    const incomes = getIncomes();
    const expenses = getExpenses();
    const categories = getCategories();
    const budget = getMonthlyBudget();
    const expenseTotal = getTotal(expenses);
    const categoryTotals = categories.map((category, index) => {
      const total = expenses.filter((expense) => expense.categoriaId === category.id).reduce((sum, expense) => sum + expense.monto, 0);
      return {
        name: category.name,
        percentage: expenseTotal > 0 ? Math.round((total / expenseTotal) * 100) : 0,
        color: chartColors[index % chartColors.length],
      };
    }).filter((category) => category.percentage > 0);

    setTotalIncome(getTotal(incomes));
    setTotalExpenses(expenseTotal);
    setMonthlyBudget(budget);
    setCategoryData(categoryTotals.length ? categoryTotals : categories.slice(0, 5).map((category, index) => ({ name: category.name, percentage: 0, color: chartColors[index] })));

    const usedPercentage = budget > 0 ? (expenseTotal / budget) * 100 : 0;
    if (usedPercentage >= 100) setAlertType("critical");
    else if (usedPercentage > 80) setAlertType("preventive");
  }, []);

  const budgetPercentage = monthlyBudget > 0 ? Math.min((totalExpenses / monthlyBudget) * 100, 100) : 0;

  const handleLogout = () => {
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-card">
        <span className="text-base font-semibold text-foreground">
          Hola, {userName}!
        </span>
      </header>

      <Dialog open={!!alertType} onOpenChange={(open) => !open && setAlertType(null)}>
        <DialogContent className="max-w-sm rounded-lg border-border bg-card">
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${alertType === "critical" ? "text-destructive" : "text-warning"}`}>
              <AlertTriangle size={22} />
              {alertType === "critical" ? "ALERTA CRÍTICA" : "ALERTA PREVENTIVA"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {alertType === "critical"
              ? "Has alcanzado o superado el 100% de tu presupuesto mensual. Revisa tus gastos para evitar desbalances."
              : "Has superado el 80% de tu presupuesto mensual. Considera reducir tus próximos gastos."}
          </p>
          <Button className="gradient-hero text-primary-foreground" onClick={() => setAlertType(null)}>Entendido</Button>
        </DialogContent>
      </Dialog>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="sm" showText={false} />
        </div>

        {/* Presupuesto mensual */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Target size={16} className="text-primary" />
              Presupuesto mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${budgetPercentage >= 100 ? "bg-destructive" : "gradient-hero"}`} style={{ width: `${budgetPercentage}%` }} />
            </div>
            <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
              <span>{Math.round(budgetPercentage)}% utilizado</span>
              <span>{formatCurrency(totalExpenses)} / {monthlyBudget ? formatCurrency(monthlyBudget) : "Sin límite"}</span>
            </div>
            <Button variant="outline" size="sm" className="mt-3 w-full" onClick={() => navigate("/budget")}>Configurar presupuesto</Button>
          </CardContent>
        </Card>

        {/* Balances financieros */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign size={16} className="text-primary" />
              Balances financieros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-3xl font-bold ${totalIncome - totalExpenses < 0 ? "text-destructive" : "text-income"}`}>{formatCurrency(totalIncome - totalExpenses)}</p>
          </CardContent>
        </Card>

        {/* Transacciones por categorías */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PieChart size={16} className="text-primary" />
              Transacciones por categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {/* Simple pie chart representation */}
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {categoryData.reduce((acc, cat, i) => {
                    const offset = categoryData.slice(0, i).reduce((s, c) => s + c.percentage, 0);
                    acc.push(
                      <circle
                        key={cat.name}
                        cx="50" cy="50" r="40"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="20"
                        strokeDasharray={`${cat.percentage * 2.51} ${251.2 - cat.percentage * 2.51}`}
                        strokeDashoffset={`${-offset * 2.51}`}
                      />
                    );
                    return acc;
                  }, [] as React.ReactNode[])}
                </svg>
              </div>
              <div className="space-y-1.5 flex-1">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                    <span className="text-muted-foreground flex-1">{cat.name}</span>
                    <span className="font-medium text-foreground">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registros */}
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-3">Registros</h3>
          <div className="grid grid-cols-2 gap-3">
            <Card className="shadow-card cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/register-income")}>
              <CardContent className="flex flex-col items-center gap-2 py-5">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <TrendingUp size={24} className="text-income" />
                </div>
                <span className="text-sm font-medium text-foreground">Ingresos</span>
                <span className="text-lg font-bold text-income">${totalIncome.toLocaleString("es-CL")}</span>
              </CardContent>
            </Card>
            <Card className="shadow-card cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/register-expense")}>
              <CardContent className="flex flex-col items-center gap-2 py-5">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                  <TrendingDown size={24} className="text-expense" />
                </div>
                <span className="text-sm font-medium text-foreground">Gastos</span>
                <span className="text-lg font-bold text-expense">{formatCurrency(totalExpenses)}</span>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reportes & Recomendaciones */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="shadow-card cursor-pointer hover:shadow-elevated transition-shadow">
            <CardContent className="flex flex-col items-center gap-2 py-5">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <FileText size={24} className="text-info" />
              </div>
              <span className="text-sm font-medium text-foreground">Reportes</span>
            </CardContent>
          </Card>
          <Card className="shadow-card cursor-pointer hover:shadow-elevated transition-shadow" onClick={() => navigate("/categories")}>
            <CardContent className="flex flex-col items-center gap-2 py-5">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Tags size={24} className="text-warning" />
              </div>
              <span className="text-sm font-medium text-foreground">Categorías</span>
            </CardContent>
          </Card>
        </div>

        <Button variant="ghost" className="w-full gap-2" onClick={() => navigate("/budget")}>
          <Settings size={18} /> Ajustar presupuesto mensual
        </Button>
      </main>
    </div>
  );
}
