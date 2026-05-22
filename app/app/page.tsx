//actual app page from Claude
/*"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  collection, addDoc, deleteDoc, doc,
  onSnapshot, query, where, serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import {
  LayoutDashboard, List, PlusCircle, LogOut,
  BarChart2, Trash2, Tag, ChevronDown,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

type Frequency = "monthly" | "yearly";

interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
  createdAt: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_CATEGORIES = [
  "Subscriptions",
  "Housing",
  "Food & Groceries",
  "Transport",
  "Health & Fitness",
  "Entertainment",
  "Education",
  "Insurance",
  "Utilities",
  "Other",
];

const COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#f59e0b",
  "#10b981","#3b82f6","#ef4444","#14b8a6",
  "#f97316","#84cc16",
];

const toMonthly = (amount: number, freq: Frequency) =>
  freq === "yearly" ? amount / 12 : amount;

const toYearly = (amount: number, freq: Frequency) =>
  freq === "monthly" ? amount * 12 : amount;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type View = "dashboard" | "expenses" | "add";

function Sidebar({ view, setView, onLogout, user }: {
  view: View; setView: (v: View) => void;
  onLogout: () => void; user: User;
}) {
  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "expenses",  label: "My Expenses", icon: <List className="w-4 h-4" /> },
    { id: "add",       label: "Add Expense", icon: <PlusCircle className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
      //Logo
      <div className="flex items-center gap-2 font-bold text-lg text-indigo-600 mb-8 px-2">
        <BarChart2 className="w-5 h-5" />
        TrueBalance
      </div>

      //Nav
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
              ${view === item.id
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      //User
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-900 truncate">{user.displayName ?? "User"}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 w-full rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

// ─── Dashboard View ────────────────────────────────────────────────────────────

function DashboardView({ expenses }: { expenses: Expense[] }) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const totalMonthly = expenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  const totalYearly  = expenses.reduce((s, e) => s + toYearly(e.amount, e.frequency), 0);
  const total = period === "monthly" ? totalMonthly : totalYearly;

  // Category breakdown for pie chart
  const categoryMap: Record<string, number> = {};
  for (const e of expenses) {
    const v = period === "monthly" ? toMonthly(e.amount, e.frequency) : toYearly(e.amount, e.frequency);
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + v;
  }
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  // Bar chart: top 6 categories
  const barData = [...pieData].sort((a, b) => b.value - a.value).slice(0, 6);

  return (
    <div className="space-y-6">
      //Header + toggle
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your spending overview</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          {(["monthly","yearly"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize
                ${period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      //Summary cards
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={`Total ${period === "monthly" ? "Monthly" : "Yearly"}`} value={`€${total.toFixed(2)}`} accent />
        <StatCard label="Total Monthly" value={`€${totalMonthly.toFixed(2)}`} />
        <StatCard label="Total Yearly"  value={`€${totalYearly.toFixed(2)}`} />
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No expenses yet. Add your first one →
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          //Pie
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            //Legend
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          //Bar
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Categories</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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

function ExpensesView({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => void }) {
  const grouped: Record<string, Expense[]> = {};
  for (const e of expenses) {
    (grouped[e.category] ??= []).push(e);
  }

  if (expenses.length === 0)
    return <div className="text-center py-20 text-gray-400 text-sm">No expenses yet.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/60">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-sm font-semibold text-gray-700">{cat}</span>
            <span className="ml-auto text-xs text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          </div>
          {items.map((e) => (
            <div key={e.id} className="flex items-center px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{e.name}</p>
                <p className="text-xs text-gray-400 capitalize">{e.frequency}</p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-semibold text-gray-900">€{e.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-400">
                  {e.frequency === "monthly"
                    ? `€${(e.amount * 12).toFixed(2)}/yr`
                    : `€${(e.amount / 12).toFixed(2)}/mo`}
                </p>
              </div>
              <button
                onClick={() => onDelete(e.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
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

function AddExpenseView({
  onAdd, customCategories, onAddCategory,
}: {
  onAdd: (e: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  customCategories: string[];
  onAddCategory: (c: string) => void;
}) {
  const allCats = [...PRESET_CATEGORIES, ...customCategories];
  const [name, setName]         = useState("");
  const [amount, setAmount]     = useState("");
  const [freq, setFreq]         = useState<Frequency>("monthly");
  const [category, setCategory] = useState(allCats[0]);
  const [newCat, setNewCat]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track a new recurring cost.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Expense Name">
            <input value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="e.g. Netflix, Rent, Gym" className={input} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (€)">
              <input type="number" min="0" step="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)} required
                placeholder="0.00" className={input} />
            </Field>
            <Field label="Frequency">
              <div className="relative">
                <select value={freq} onChange={(e) => setFreq(e.target.value as Frequency)} className={input}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </Field>
          </div>

          <Field label="Category">
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
                {allCats.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </Field>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm">
            {loading ? "Adding…" : success ? "✓ Added!" : "Add Expense"}
          </button>
        </form>
      </div>

      //Custom category
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Create Custom Category</h2>
        <div className="flex gap-2">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)}
            placeholder="e.g. Pet Care" className={`${input} flex-1`}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())} />
          <button onClick={handleAddCategory}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
            Add
          </button>
        </div>
        {customCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customCategories.map((c) => (
              <span key={c} className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full">{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const input = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function AppPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [view, setView] = useState<View>("dashboard");
  const [authLoading, setAuthLoading] = useState(true);

  // Auth guard
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.replace("/login");
      else setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, [router]);

  // Realtime expenses from Firestore
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "expenses"), where("uid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Expense));
      data.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
      setExpenses(data);
    });
    return unsub;
  }, [user]);

  const handleAddExpense = async (e: Omit<Expense, "id" | "createdAt">) => {
    if (!user) return;
    await addDoc(collection(db, "expenses"), { ...e, uid: user.uid, createdAt: serverTimestamp() });
  };

  const handleDeleteExpense = async (id: string) => {
    await deleteDoc(doc(db, "expenses", id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        Loading…
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar view={view} setView={setView} onLogout={handleLogout} user={user} />

      <main className="flex-1 p-8 overflow-y-auto">
        {view === "dashboard" && <DashboardView expenses={expenses} />}
        {view === "expenses"  && <ExpensesView  expenses={expenses} onDelete={handleDeleteExpense} />}
        {view === "add"       && (
          <AddExpenseView
            onAdd={handleAddExpense}
            customCategories={customCategories}
            onAddCategory={(c) => setCustomCategories((p) => [...p, c])}
          />
        )}
      </main>
    </div>
  );
}*/

//Dummy version

/*"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, List, PlusCircle, LogOut,
  BarChart2, Trash2, Tag, ChevronDown,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";

// TODO: Replace with real Firebase Auth + Firestore once configured
type User = { displayName: string; email: string };
const DUMMY_USER: User = { displayName: "Demo User", email: "demo@truebalance.app" };

interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  category: string;
  createdAt: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_CATEGORIES = [
  "Subscriptions",
  "Housing",
  "Food & Groceries",
  "Transport",
  "Health & Fitness",
  "Entertainment",
  "Education",
  "Insurance",
  "Utilities",
  "Other",
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Frequency = "monthly" | "yearly";
  "#6366f1","#8b5cf6","#ec4899","#f59e0b", //add [
  "#10b981","#3b82f6","#ef4444","#14b8a6",
  "#f97316","#84cc16",
];

const toMonthly = (amount: number, freq: Frequency) =>
  freq === "yearly" ? amount / 12 : amount;

const toYearly = (amount: number, freq: Frequency) =>
  freq === "monthly" ? amount * 12 : amount;

// ─── Sidebar ──────────────────────────────────────────────────────────────────

type View = "dashboard" | "expenses" | "add";

function Sidebar({ view, setView, onLogout, user }: {
  view: View; setView: (v: View) => void;
  onLogout: () => void; user: User;
}) {
  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "expenses",  label: "My Expenses", icon: <List className="w-4 h-4" /> },
    { id: "add",       label: "Add Expense", icon: <PlusCircle className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
      //Logo
      <div className="flex items-center gap-2 font-bold text-lg text-indigo-600 mb-8 px-2">
        <BarChart2 className="w-5 h-5" />
        TrueBalance
      </div>

      //Nav
      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
              ${view === item.id
                ? "bg-indigo-50 text-indigo-600"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      //User
      <div className="border-t border-gray-100 pt-4 mt-4">
        <div className="flex items-center gap-3 px-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
            {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-900 truncate">{user.displayName ?? "User"}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 w-full rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-4 h-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

// ─── Dashboard View ────────────────────────────────────────────────────────────

function DashboardView({ expenses }: { expenses: Expense[] }) {
  const [period, setPeriod] = useState<"monthly" | "yearly">("monthly");

  const totalMonthly = expenses.reduce((s, e) => s + toMonthly(e.amount, e.frequency), 0);
  const totalYearly  = expenses.reduce((s, e) => s + toYearly(e.amount, e.frequency), 0);
  const total = period === "monthly" ? totalMonthly : totalYearly;

  // Category breakdown for pie chart
  const categoryMap: Record<string, number> = {};
  for (const e of expenses) {
    const v = period === "monthly" ? toMonthly(e.amount, e.frequency) : toYearly(e.amount, e.frequency);
    categoryMap[e.category] = (categoryMap[e.category] ?? 0) + v;
  }
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value: +value.toFixed(2) }));

  // Bar chart: top 6 categories
  const barData = [...pieData].sort((a, b) => b.value - a.value).slice(0, 6);

  return (
    <div className="space-y-6">
      //Header + toggle
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your spending overview</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          {(["monthly","yearly"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize
                ${period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      //Summary cards
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={`Total ${period === "monthly" ? "Monthly" : "Yearly"}`} value={`€${total.toFixed(2)}`} accent />
        <StatCard label="Total Monthly" value={`€${totalMonthly.toFixed(2)}`} />
        <StatCard label="Total Yearly"  value={`€${totalYearly.toFixed(2)}`} />
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No expenses yet. Add your first one →
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          //Pie
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Spending by Category</h2>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                  dataKey="value" paddingAngle={3}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
            //Legend
            <div className="flex flex-wrap gap-2 mt-2">
              {pieData.map((d, i) => (
                <span key={d.name} className="flex items-center gap-1 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: COLORS[i % COLORS.length] }} />
                  {d.name}
                </span>
              ))}
            </div>
          </div>

          //Bar
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Categories</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => `€${v.toFixed(2)}`} />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {barData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
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

function ExpensesView({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => void }) {
  const grouped: Record<string, Expense[]> = {};
  for (const e of expenses) {
    (grouped[e.category] ??= []).push(e);
  }

  if (expenses.length === 0)
    return <div className="text-center py-20 text-gray-400 text-sm">No expenses yet.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/60">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-sm font-semibold text-gray-700">{cat}</span>
            <span className="ml-auto text-xs text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          </div>
          {items.map((e) => (
            <div key={e.id} className="flex items-center px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{e.name}</p>
                <p className="text-xs text-gray-400 capitalize">{e.frequency}</p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-semibold text-gray-900">€{e.amount.toFixed(2)}</p>
                <p className="text-xs text-gray-400">
                  {e.frequency === "monthly"
                    ? `€${(e.amount * 12).toFixed(2)}/yr`
                    : `€${(e.amount / 12).toFixed(2)}/mo`}
                </p>
              </div>
              <button
                onClick={() => onDelete(e.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
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

function AddExpenseView({
  onAdd, customCategories, onAddCategory,
}: {
  onAdd: (e: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  customCategories: string[];
  onAddCategory: (c: string) => void;
}) {
  const allCats = [...PRESET_CATEGORIES, ...customCategories];
  const [name, setName]         = useState("");
  const [amount, setAmount]     = useState("");
  const [freq, setFreq]         = useState<Frequency>("monthly");
  const [category, setCategory] = useState(allCats[0]);
  const [newCat, setNewCat]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Expense</h1>
        <p className="text-sm text-gray-400 mt-0.5">Track a new recurring cost.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Expense Name">
            <input value={name} onChange={(e) => setName(e.target.value)} required
              placeholder="e.g. Netflix, Rent, Gym" className={input} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (€)">
              <input type="number" min="0" step="0.01" value={amount}
                onChange={(e) => setAmount(e.target.value)} required
                placeholder="0.00" className={input} />
            </Field>
            <Field label="Frequency">
              <div className="relative">
                <select value={freq} onChange={(e) => setFreq(e.target.value as Frequency)} className={input}>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </Field>
          </div>

          <Field label="Category">
            <div className="relative">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className={input}>
                {allCats.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </Field>

          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm">
            {loading ? "Adding…" : success ? "✓ Added!" : "Add Expense"}
          </button>
        </form>
      </div>

      //Custom category
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Create Custom Category</h2>
        <div className="flex gap-2">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)}
            placeholder="e.g. Pet Care" className={`${input} flex-1`}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())} />
          <button onClick={handleAddCategory}
            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
            Add
          </button>
        </div>
        {customCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customCategories.map((c) => (
              <span key={c} className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full">{c}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const input = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

// ─── Main App ──────────────────────────────────────────────────────────────────

export default function AppPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [view, setView] = useState<View>("dashboard");

  // TODO: Replace with real Firestore addDoc once Firebase is configured
  const handleAddExpense = async (e: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = { ...e, id: crypto.randomUUID(), createdAt: null };
    setExpenses((prev) => [...prev, newExpense]);
  };

  // TODO: Replace with real Firestore deleteDoc once Firebase is configured
  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleLogout = () => router.push("/");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar view={view} setView={setView} onLogout={handleLogout} user={DUMMY_USER} />

      <main className="flex-1 p-8 overflow-y-auto">
        {view === "dashboard" && <DashboardView expenses={expenses} />}
        {view === "expenses"  && <ExpensesView  expenses={expenses} onDelete={handleDeleteExpense} />}
        {view === "add"       && (
          <AddExpenseView
            onAdd={handleAddExpense}
            customCategories={customCategories}
            onAddCategory={(c) => setCustomCategories((p) => [...p, c])}
          />
        )}
      </main>
    </div>
  );
}*/

// app/app/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, List, PlusCircle, LogOut,
  BarChart2, Trash2, Tag, ChevronDown,
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

// TODO: Replace with real Firebase Auth + Firestore once configured
type User = { displayName: string; email: string };
const DUMMY_USER: User = { displayName: "Demo User", email: "demo@truebalance.app" };

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

function Sidebar({ view, setView, onLogout, user }: {
  view: View; setView: (v: View) => void;
  onLogout: () => void; user: User;
}) {
  const items: { id: View; label: string; icon: React.ReactNode }[] = [
    { id: "dashboard", label: "Dashboard",   icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "expenses",  label: "My Expenses", icon: <List className="w-4 h-4" /> },
    { id: "add",       label: "Add Expense", icon: <PlusCircle className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-gray-100 flex flex-col py-6 px-4 shrink-0">
      <div className="flex items-center gap-2 font-bold text-lg text-indigo-600 mb-8 px-2">
        <BarChart2 className="w-5 h-5" />
        TrueBalance
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left
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
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors px-2 py-1.5 w-full rounded-lg hover:bg-red-50"
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

  /*const tooltipFormatter = (value: number | string | Array<number | string> | undefined) => {
    if (value === undefined) return "";
    const num = typeof value === "number" ? value : parseFloat(String(value));
    return isNaN(num) ? String(value) : fmtCurrency(num);
  };*/
  const tooltipFormatter = (value: any) => {
  if (!value && value !== 0) return "";
  if (Array.isArray(value)) return value.map(v => fmtCurrency(Number(v))).join(", ");
  return fmtCurrency(Number(value));
};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">Your spending overview</p>
        </div>
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
          {(["monthly", "yearly"] as const).map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors capitalize
                ${period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label={`Total ${period === "monthly" ? "Monthly" : "Yearly"}`} value={fmtCurrency(total)} accent />
        <StatCard label="Total Monthly" value={fmtCurrency(totalMonthly)} />
        <StatCard label="Total Yearly"  value={fmtCurrency(totalYearly)} />
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">
          No expenses yet.{" "}
            <button
                onClick={() => setView("add")}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                >
                Add your first one
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie chart */}
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

          {/* Bar chart */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Top Categories</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={tooltipFormatter} />
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

function ExpensesView({ expenses, onDelete }: { expenses: Expense[]; onDelete: (id: string) => void }) {
  const grouped: Record<string, Expense[]> = {};
  for (const e of expenses) {
    (grouped[e.category] ??= []).push(e);
  }

  if (expenses.length === 0)
    return <div className="text-center py-20 text-gray-400 text-sm">No expenses yet.<br></br>List of all your added expenses appears here.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Expenses</h1>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-50 bg-gray-50/60">
            <Tag className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-sm font-semibold text-gray-700">{cat}</span>
            <span className="ml-auto text-xs text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          </div>
          {items.map((e) => (
            <div key={e.id}
              className="flex items-center px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors group">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{e.name}</p>
                <p className="text-xs text-gray-400 capitalize">{e.frequency}</p>
              </div>
              <div className="text-right mr-4">
                <p className="text-sm font-semibold text-gray-900">{fmtCurrency(e.amount)}</p>
                <p className="text-xs text-gray-400">
                  {e.frequency === "monthly"
                    ? `${fmtCurrency(e.amount * 12)}/yr`
                    : `${fmtCurrency(e.amount / 12)}/mo`}
                </p>
              </div>
              <button
                onClick={() => onDelete(e.id)}
                className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
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

function AddExpenseView({ onAdd, customCategories, onAddCategory }: {
  onAdd: (e: Omit<Expense, "id" | "createdAt">) => Promise<void>;
  customCategories: string[];
  onAddCategory: (c: string) => void;
}) {
  const allCats = [...PRESET_CATEGORIES, ...customCategories];
  const [name, setName]         = useState("");
  const [amount, setAmount]     = useState("");
  const [freq, setFreq]         = useState<Frequency>("monthly");
  const [category, setCategory] = useState(allCats[0]);
  const [newCat, setNewCat]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

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
            className="w-full bg-indigo-600 text-white font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 text-sm">
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
            className="px-4 py-2 bg-indigo-50 text-indigo-600 text-sm font-semibold rounded-xl hover:bg-indigo-100 transition-colors">
            Add
          </button>
        </div>
        {customCategories.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {customCategories.map((c) => (
              <span key={c} className="bg-indigo-50 text-indigo-600 text-xs font-medium px-2.5 py-1 rounded-full">{c}</span>
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
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [view, setView] = useState<View>("dashboard");

  // TODO: Replace with real Firestore addDoc once Firebase is configured
  const handleAddExpense = async (e: Omit<Expense, "id" | "createdAt">) => {
    const newExpense: Expense = { ...e, id: crypto.randomUUID(), createdAt: null };
    setExpenses((prev) => [...prev, newExpense]);
  };

  // TODO: Replace with real Firestore deleteDoc once Firebase is configured
  const handleDeleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleLogout = () => router.push("/");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar view={view} setView={setView} onLogout={handleLogout} user={DUMMY_USER} />
      <main className="flex-1 p-8 overflow-y-auto">
        {view === "dashboard" && <DashboardView expenses={expenses} setView={setView} />}
        {view === "expenses"  && <ExpensesView  expenses={expenses} onDelete={handleDeleteExpense} />}
        {view === "add"       && (
          <AddExpenseView
            onAdd={handleAddExpense}
            customCategories={customCategories}
            onAddCategory={(c) => setCustomCategories((p) => [...p, c])}
          />
        )}
      </main>
    </div>
  );
}