export type Category = {
  id: string;
  name: string;
};

export type Income = {
  id: string;
  monto: number;
  descripcion?: string;
  fecha: string;
};

export type Expense = {
  id: string;
  monto: number;
  descripcion?: string;
  categoriaId: string;
  fecha: string;
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: "alimentacion", name: "Alimentación" },
  { id: "transporte", name: "Transporte" },
  { id: "entretenimiento", name: "Entretenimiento" },
  { id: "servicios", name: "Servicios" },
  { id: "otros", name: "Otros" },
];

const readArray = <T>(key: string, fallback: T[]): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
};

export const getCategories = () => readArray<Category>("categories", DEFAULT_CATEGORIES);
export const saveCategories = (categories: Category[]) => localStorage.setItem("categories", JSON.stringify(categories));

export const getIncomes = () => readArray<Income>("incomes", []);
export const saveIncomes = (incomes: Income[]) => localStorage.setItem("incomes", JSON.stringify(incomes));

export const getExpenses = () => readArray<Expense>("expenses", []);
export const saveExpenses = (expenses: Expense[]) => localStorage.setItem("expenses", JSON.stringify(expenses));

export const getMonthlyBudget = () => Number(localStorage.getItem("monthlyBudget") || 0);
export const saveMonthlyBudget = (amount: number) => localStorage.setItem("monthlyBudget", String(amount));

export const getTotal = (items: Array<{ monto: number }>) => items.reduce((sum, item) => sum + Number(item.monto || 0), 0);

export const formatCurrency = (amount: number) => `$${amount.toLocaleString("es-CL")}`;