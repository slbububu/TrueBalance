"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard, List, PlusCircle, LogOut,
  BarChart2, Trash2, Tag, ChevronDown, X,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Frequency = "monthly" | "yearly";

interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
  createdAt: null;
}

type View = "dashboard" | "expenses" | "add";

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_CATEGORIES = [
  "Subscriptions", "Housing", "Food & Groceries", "Transport",
  "Health & Fitness", "Entertainment", "Education",
  "Insurance", "Utilities", "Other",
];

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#3b82f6", "#ef4444", "#14b8a6",
  "#f97316", "#84cc16",
];

const toMonthly = (amount: number, freq: Frequency) =>
  freq === "yearly" ? amount / 12 : amount;

const toYearly = (amount: number, freq: Frequency) =>
  freq === "monthly" ? amount * 12 : amount;

const fmtCurrency = (v: number) => `€${v.toFixed(2)}`;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ view, setView, onLogout, user, mobileMenuOpen, setMobileMenuOpen }: {
  view: View; setView: (v: View) => void;
  onLogout: () => void; user: User;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}) {
  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard",   icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "expenses",  label: "My Expenses", icon: <List className="w-4 h-4" /> },
    { id: "add",       label: "Add Expense", icon: <PlusCircle className="w-4 h-4" /> },
  ];

  return (
    <aside className="fixed left-0 top-0 w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
      <div className="flex items-center gap-2 font-bold text-lg text-indigo-600 mb-6 px-2">
        <BarChart2 className="w-5 h-5" />
        TrueBalance
        {/* Close button - only on mobile */}
        <div className="md:hidden ml-auto">
            <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
            <X className="w-5 h-5 text-gray-600" />
            </button>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setView(item.id);
              setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer text-left
              ${view === item.id
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-900 truncate">{user.displayName}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors cursor-pointer px-2 py-1.5 w-full rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

// ─── Dashboard View ────────────────────────────────────────────────────────────

function DashboardView({ expenses, setView }: { expenses: Expense[]; setView: (view: View) => void }) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const totalMonthly = expenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  const totalYearly  = expenses.reduce((s, e) => s + toYearly(e.amount, e.frequency), 0);
  const total = period === "monthly" ? totalMonthly : totalYearly;

  const categoryMap: Record<string, number> = {};
  for (const e of expenses) {
    const v = period === "monthly" ? toMonthly(e.amount, e.frequency) : toYearly(e.amount, e.frequency);
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + v;
  }
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value: +value.toFixed(2) }));
  const barData = [...pieData].sort((a, b) => b.value - a.value).slice(0, 6);

  const tooltipFormatter = (value: any) => {
  if (!value && value !== 0) return "";
  if (Array.isArray(value)) return value.map(v => fmtCurrency(Number(v))).join(", ");
  return fmtCurrency(Number(value));
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md px-3 py-2">
      <p className="text-xs font-semibold text-gray-800 mb-1">{label}</p>
      <p className="text-sm font-bold text-gray-500">{fmtCurrency(payload[0].value)}</p>
    </div>
  );
};

  return (
    <div className="space-y-6">
      <div className="flex min-[400.01px]:items-center justify-between max-[400px]:flex-col max-[400px]:gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your spending overview</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 max-[400px]:self-start">
          {(["monthly", "yearly"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer capitalize
                ${period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={`Total ${period === "monthly" ? "Monthly" : "Yearly"}`} value={fmtCurrency(total)} accent />
        <StatCard label={`Total ${period === "monthly" ? "Yearly" : "Monthly"}`} value={fmtCurrency(period === "monthly" ? totalYearly : totalMonthly)} />
        <StatCard label="Total Daily" value={fmtCurrency(totalMonthly / 30)} />
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No expenses yet.{" "}
            <button
                onClick={() => setView("add")}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                >
                Add your first expense
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={tooltipFormatter} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block"
                    style={{ background: COLORS[i % COLORS.length] }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Categories</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {barData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border ${accent
      ? "bg-indigo-600 border-indigo-600 text-white"
      : "bg-white border-gray-100 text-gray-900 shadow-sm"}`}>
      <p className={`text-xs font-medium mb-1 ${accent ? "text-indigo-200" : "text-gray-400"}`}>{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

// ─── Expense List View ─────────────────────────────────────────────────────────

function ExpensesView({
  expenses,
  onDelete,
  onDeleteCategory
}: {
  expenses: Expense[];
  onDelete: (id: string) => void;
  onDeleteCategory: (cat: string) => void;
}) {
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const grouped: Record<string, Expense[]> = {};
  for (const e of expenses) {
    (grouped[e.category] ??= []).push(e);
  }
  const categories = Object.keys(grouped);

  if (expenses.length === 0)
    return (
      <div className="text-center py-20 text-gray-400 text-sm">
        No expenses yet.<br /> List of all your expenses appears here.
      </div>
    );

  return (
    <div className="space-y-6">
      {pendingDelete && (
        <DeleteCategoryModal
          category={pendingDelete}
          onConfirm={() => {
            onDeleteCategory(pendingDelete);
            setPendingDelete(null);
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
      {Object.entries(grouped).map(([cat, items], i) => (
        <div
          key={cat}
          className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden"
        >
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/60">
            <Tag className="w-3.5 h-3.5" style={{ color: COLORS[i % COLORS.length] }} /> {/* text-indigo-400*/}
            <span className="text-sm font-semibold text-gray-700">{cat}</span>
            <button
              onClick={() => setPendingDelete(cat)}
              className="ml-auto opacity-0 cursor-pointer hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <span className="text-xs text-gray-400">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
          </div>
          {items.map((e) => (
            <div
              key={e.id}
              className="flex items-center px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{e.name}</p>
                <p className="text-xs text-gray-400 capitalize">{e.frequency}</p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-semibold text-gray-900">
                  {fmtCurrency(e.amount)}
                </p>
                <p className="text-xs text-gray-400">
                  {e.frequency === "monthly"
                    ? `${fmtCurrency(e.amount * 12)}/yr`
                    : `${fmtCurrency(e.amount / 12)}/mo`}
                </p>
              </div>
              <button
                onClick={() => onDelete(e.id)}
                className="opacity-0 cursor-pointer group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Add Expense View ──────────────────────────────────────────────────────────

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

function DeleteCategoryModal({ category, onConfirm, onCancel }: {
  category: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 p-6 w-full max-w-sm">
        <div className="flex items-center justify-center w-11 h-11 rounded-full bg-red-50 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-red-500" />
        </div>
        <h2 className="text-base font-bold text-gray-900 text-center mb-2">Delete category?</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Deleting <span className="font-semibold text-gray-700">"{category}"</span> will also
          permanently remove all expenses associated with it. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

function AddExpenseView({ onAdd, customCategories, onAddCategory, onDeleteCategory }: {
  onAdd: (e: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  customCategories: string[];
  onAddCategory: (c: string) => void;
  onDeleteCategory: (c: string) => void;
}) {
  const allCats = [...PRESET_CATEGORIES, ...customCategories];
  const [name, setName]         = useState("");
  const [amount, setAmount]     = useState("");
  const [freq, setFreq]         = useState<Frequency>("monthly");
  const [category, setCategory] = useState(allCats[0]);
  const [newCat, setNewCat]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount || isNaN(+amount)) return;
    setLoading(true);
    await onAdd({ name, amount: +amount, frequency: freq, category });
    setName(""); setAmount(""); setFreq("monthly");
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  const handleAddCategory = () => {
    const t = newCat.trim();
    if (!t || allCats.includes(t)) return;
    onAddCategory(t);
    setCategory(t);
    setNewCat("");
  };

  return (
    <div className="max-w-lg space-y-6">
      {pendingDelete && (
        <DeleteCategoryModal
          category={pendingDelete}
          onConfirm={() => { onDeleteCategory(pendingDelete); setPendingDelete(null); }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track a new recurring cost.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Expense Name">
            <input value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="e.g. Netflix, Rent, Gym" className={inputCls} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (€)">
              <input type="number" min="0" step="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)} required
                placeholder="0.00" className={inputCls} />
            </Field>
            <Field label="Frequency">
              <div className="relative">
                <select value={freq} onChange={(e) => setFreq(e.target.value as Frequency)} className={inputCls}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </Field>
          </div>

          <Field label="Category">
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
                {allCats.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </Field>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50 text-sm">
            {loading ? "Adding…" : success ? "✓ Added!" : "Add Expense"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Create Custom Category</h2>
        <div className="flex gap-2">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)}
            placeholder="e.g. Pet Care" className={`${inputCls} flex-1`}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())} />
          <button onClick={handleAddCategory}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer">
            Add
          </button>
        </div>
        {customCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customCategories.map((c) => (
              <span key={c} 
              onClick={() => setPendingDelete(c)}
              className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-red-50 hover:text-red-500">{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function AppPage() {
  const router = useRouter();
  //const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>(() => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("truebalance_expenses");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
});
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("truebalance_categories");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
});

  // Auth guard
useEffect(() => {
  const unsub = onAuthStateChanged(auth, (u) => {
    if (!u) router.replace("/login");
    else setUser(u);
    setAuthLoading(false);
  });
  return unsub;
}, [router]);

  //Save expenses to localStorage()
  useEffect(() => {
    localStorage.setItem("truebalance_expenses", JSON.stringify(expenses));
}, [expenses]);

  //Save custom categories to localStorage()
  useEffect(() => {
    localStorage.setItem("truebalance_categories", JSON.stringify(customCategories));
}, [customCategories]);

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
      Loading…
    </div>
  );
  if (!user) return null;

  // TODO: Replace with real Firestore addDoc once Firebase is configured
  const handleAddExpense = async (e: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = { ...e, id: crypto.randomUUID(), createdAt: null };
    setExpenses((prev) => [...prev, newExpense]);
  };

  const handleDeleteCategory = (cat: string) => {
    setCustomCategories((prev) => prev.filter((c) => c !== cat));
    setExpenses((prev) => prev.filter((e) => e.category !== cat));
  };

  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
  <div className="md:ml-60 flex min-h-screen bg-gray-50">
    {/* Sidebar - hidden on mobile, visible on md+ */}
    <div className={`fixed md:static inset-0 z-40 md:z-auto ${mobileMenuOpen ? 'block' : 'hidden'} md:block`}>
      <Sidebar 
        view={view} 
        setView={setView} 
        onLogout={handleLogout} 
        user={user}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
    </div>

    {/* Mobile menu backdrop */}
    {mobileMenuOpen && (
      <div 
        className="fixed inset-0 bg-black/50 md:hidden z-30"
        onClick={() => setMobileMenuOpen(false)}
      />
    )}

    {/* Main content */}
    <main className="flex-1 flex flex-col overflow-hidden">
      {/* Mobile header with hamburger */}
      <div className="md:hidden flex items-center gap-4 px-4 py-4 bg-white border-b border-gray-100">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2 font-bold text-lg text-indigo-600">
            <BarChart2 className="w-5 h-5" />
            <span className="font-bold text-indigo-600">TrueBalance</span>
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">
        {view === "dashboard" && <DashboardView expenses={expenses} setView={setView} />}
        {view === "expenses"  && <ExpensesView  expenses={expenses} onDelete={handleDeleteExpense} onDeleteCategory={handleDeleteCategory} />}
        {view === "add"       && (
          <AddExpenseView 
            onAdd={handleAddExpense}
            customCategories={customCategories}
            onAddCategory={(c) => setCustomCategories((p) => [...p, c])} 
            onDeleteCategory={handleDeleteCategory}
          />
        )}
      </div>
    </main>
  </div>
);
}