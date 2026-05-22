import React, { useState, useEffect } from 'react';
import { Wallet, DollarSign, PlusCircle, Trash2, BookOpen, Clock, ArrowRight, TrendingUp, ShieldCheck, X, Search, Terminal, Activity, Compass, Target, Layers, Cpu, Database, PieChart, BarChart3, RefreshCcw, Calendar, ArrowUpDown, FileText, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation View State: Defaults to 'home' (Introduction Page)
  const [currentView, setCurrentView] = useState('home');

  // Expanded blog state: tracks which blog post is currently maximized (null if none)
  const [expandedBlog, setExpandedBlog] = useState(null);

  // Live client-side search, sorting, and monthly statement filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('DATE_DESC');
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  // Global Backend Report State Object
  const [report, setReport] = useState({
    totalTransactions: 0,
    totalSpending: 0,
    needsPercentage: 0,
    wantsPercentage: 0,
    savingsPercentage: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Input Form States
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('NEED');

  // Unified data sync pull down from Java Backend (Production-Ready URL Architecture)
  const refreshData = () => {
    setIsRefreshing(true);
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    Promise.all([
      fetch(`${baseURL}/api/transactions/report`).then(res => res.json()),
      fetch(`${baseURL}/api/transactions`).then(res => res.json())
    ])
    .then(([reportData, transactionList]) => {
      setReport({
        totalTransactions: reportData.totalTransactions || 0,
        totalSpending: reportData.totalSpending || 0,
        needsPercentage: Math.round(reportData.needsPercentage || 0),
        wantsPercentage: Math.round(reportData.wantsPercentage || 0),
        savingsPercentage: Math.round(reportData.savingsPercentage || 0)
      });
      setTransactions(transactionList || []);
    })
    .catch(err => console.error("Database Engine Sync Error:", err))
    .finally(() => {
      setTimeout(() => setIsRefreshing(false), 400);
    });
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Submit new transaction to Java Backend
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!description || !amount || !date) return;

    const newTx = {
      description,
      amount: parseFloat(amount),
      category,
      date
    };

    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    fetch(`${baseURL}/api/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTx)
    })
    .then(res => res.json())
    .then(() => {
      setDescription('');
      setAmount('');
      refreshData();
    })
    .catch(err => console.error("Error saving transaction:", err));
  };

  // Delete a transaction by ID
  const handleDeleteTransaction = (id) => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

    fetch(`${baseURL}/api/transactions/${id}`, {
      method: 'DELETE'
    })
    .then((res) => {
      if (res.ok) {
        refreshData();
      } else {
        console.error("Failed to delete transaction");
      }
    })
    .catch(err => console.error("Error deleting transaction:", err));
  };

  // Extract unique available months from the database array
  const uniqueMonths = Array.from(
    new Set(
      transactions
        .filter(t => t.date)
        .map(t => t.date.substring(0, 7))
    )
  ).sort((a, b) => b.localeCompare(a));

  const formatMonthLabel = (ymString) => {
    const [year, month] = ymString.split('-');
    const dateObj = new Date(year, parseInt(month) - 1, 1);
    return dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  // Processing Layer: Filter & Sort Engine
  const processedTransactions = transactions
    .filter(t => {
      if (selectedMonth !== 'ALL') {
        if (!t.date || !t.date.startsWith(selectedMonth)) return false;
      }
      const searchLower = searchTerm.toLowerCase();
      const matchesDescription = t.description.toLowerCase().includes(searchLower);
      const matchesCategory = t.category?.toLowerCase().includes(searchLower) || t.classCategory?.toLowerCase().includes(searchLower);
      return matchesDescription || matchesCategory;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'AMOUNT_DESC':
          return b.amount - a.amount;
        case 'AMOUNT_ASC':
          return a.amount - b.amount;
        case 'DATE_ASC':
          return new Date(a.date) - new Date(b.date);
        case 'DATE_DESC':
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });

  // Calculate live dynamic breakdown aggregates
  const categoryBreakdown = processedTransactions.reduce((acc, curr) => {
    const cat = curr.category || curr.classCategory;
    if (cat === 'NEED') acc.needs += curr.amount;
    if (cat === 'WANT') acc.wants += curr.amount;
    if (cat === 'SAVINGS') acc.savings += curr.amount;
    return acc;
  }, { needs: 0, wants: 0, savings: 0 });

  const statementTotal = categoryBreakdown.needs + categoryBreakdown.wants + categoryBreakdown.savings;

  // Pie chart calculation configurations
  const needDash = report.needsPercentage;
  const wantDash = report.wantsPercentage;
  const savingsDash = report.savingsPercentage;

  // Rich Static Blog Data Model array
  const blogPosts = [
    {
      id: "framework",
      badge: "Macro Framework",
      readTime: "8 Min Read",
      badgeColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      glowColor: "group-hover:bg-blue-500/10 bg-blue-500/5",
      title: "Mastering the 50/30/20 Framework: A Blueprint for Capital Optimization",
      excerpt: "The 50/30/20 model serves as a timeless algorithmic guide for healthy capital structure execution, operating much like a robust resource-provisioning layer in software architecture.",
      fullContent: (
        <div className="space-y-6 text-gray-300 text-sm md:text-base leading-relaxed">
          <p>
            The 50/30/20 allocation model serves as a timeless algorithmic guide for healthy capital structure execution, operating much like a robust resource-provisioning layer in software architecture. Instead of micromanaging every single penny into hundreds of arbitrary bookkeeping tags, this macro framework groups all capital flows into three distinct structural pillars:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4">
            <div className="p-4 bg-blue-950/40 border border-blue-900/50 rounded-xl">
              <h5 className="font-bold text-blue-400 mb-1">50% Essential Needs</h5>
              <p className="text-xs text-gray-400">Fixed operational baseline contracts, housing, primary logistics, and baseline utility matrices.</p>
            </div>
            <div className="p-4 bg-amber-950/40 border border-amber-900/50 rounded-xl">
              <h5 className="font-bold text-amber-400 mb-1">30% Lifestyle Wants</h5>
              <p className="text-xs text-gray-400">Discretionary infrastructure assets, entertainment endpoints, premium upgrades, and leisure variables.</p>
            </div>
            <div className="p-4 bg-emerald-950/40 border border-emerald-900/50 rounded-xl">
              <h5 className="font-bold text-emerald-400 mb-1">20% Capital Buffers</h5>
              <p className="text-xs text-gray-400">Long-term wealth preservation protocols, index equity funding, and risk-mitigation reserves.</p>
            </div>
          </div>
          <p>
            The true benefit of tracking these specific metrics in our dynamic console dashboard is the immediate recognition of structural imbalance. If your database state indicates that your <strong>Needs</strong> are expanding into the 60% or 70% threshold, it alerts you that your financial ecosystem is highly vulnerable to unexpected market volatility.
          </p>
          <p>
            Striking a rigid balance ensures you absorb macroeconomic stress without degrading your baseline living conditions. By reviewing this distribution profile weekly, you gain granular control over cash-flow performance metrics.
          </p>
          <div className="border-t border-gray-800 pt-4 mt-6">
            <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4" /> Actionable Execution Plan
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Separate inflow streams automatically through banking routing filters.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Cap discretionary dining and lifestyle outlays precisely at the 30% calculation boundary.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Rebalance your ledger categories if an asset parameter gets misclassified.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "bleed",
      badge: "Subscription Optimization",
      readTime: "10 Min Read",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      glowColor: "group-hover:bg-amber-500/10 bg-amber-500/5",
      title: "Defeating the Invisible Micro-Subscription Bleed: Isolating Structural Anomalies",
      excerpt: "One of the most profound structural threats facing modern individuals is micro-subscription creep. Small recurring billing structures act as unmonitored background scripts that continuously compromise your financial liquidity.",
      fullContent: (
        <div className="space-y-6 text-gray-300 text-sm md:text-base leading-relaxed">
          <p>
            One of the most profound structural threats facing modern individuals is micro-subscription creep. In computing environments, a memory leak or open thread pool will quietly consume host machine hardware until the entire system crashes; similarly, small recurring billing structures act as unmonitored background scripts that continuously compromise your financial liquidity.
          </p>
          <p>
            SaaS platforms, developer environments, cloud storage plans, streaming services, and fitness networks operate on automated recurring payment gateways designed to exploit psychological friction. Because a $10 or $15 monthly transaction triggers minimal alarm in regular daily life, these small outflows bypass systemic scrutiny. However, when aggregated across ten or fifteen platforms, they construct a major, permanent monthly leakage.
          </p>
          <div className="bg-gray-950 p-4 rounded-xl border border-gray-800 font-mono text-xs space-y-2 text-gray-300 my-4">
            <p className="text-emerald-400 font-bold">// Strategic Mitigation Protocol:</p>
            <p>1. Audit active transaction models via our Console Ledger at every monthly cycle boundary.</p>
            <p>2. Flag and challenge hidden billing intervals disguised under the "Need" category.</p>
            <p>3. Prune low-utility subscriptions ruthlessly to unlock capital for the savings vector.</p>
          </div>
          <p>
            By utilizing our ledger to search, sort, and isolate statement parameters, you can identify these subtle drains instantly. Shifting your discretionary accounts away from continuous passive billing structures into selective, active manual renewals restores full authority over your liquid allocations, ensuring your cash belongs to you by default.
          </p>
          <div className="border-t border-gray-800 pt-4 mt-6">
            <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4" /> Actionable Execution Plan
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Compile an inventory logs document containing every automated vendor authorization token.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Consolidate redundant cloud platforms or developer environment tool sets into core bundles.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Set automated transactional alerts within your dashboard for precise cost monitoring.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: "preservation",
      badge: "Wealth Preservation",
      readTime: "7 Min Read",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      glowColor: "group-hover:bg-emerald-500/10 bg-emerald-500/5",
      title: "Building Your Wealth Protection Layer: Designing Fault-Tolerant Ecosystems",
      excerpt: "In distributed cloud systems, developers design for high availability and fault-tolerance by implementing isolated redundancy loops. Your wealth preservation layer serves as this exact structural safety valve.",
      fullContent: (
        <div className="space-y-6 text-gray-300 text-sm md:text-base leading-relaxed">
          <p>
            In distributed cloud systems, developers design for high availability and fault-tolerance by implementing isolated redundancy loops—ensuring that if a primary network node fails, a backup power source immediately absorbs the operational strain. In a personal macroeconomic context, your wealth preservation layer serves as this exact structural safety valve.
          </p>
          <p>
            True long-term stability depends on building a dedicated emergency contingency vault completely separated from your routine spending arrays. Most financial strategies fail because they treat savings as an accidental residue—allocating whatever happens to be left over at the conclusion of a monthly statement cycle. This approach is highly unpredictable and fundamentally flawed.
          </p>
          <p>
            To guarantee bulletproof protection, you must implement a "Pay Yourself First" architecture. This means treating your 20% savings line as a primary, non-negotiable expense entity that is fully funded the exact moment liquidity enters your ecosystem.
          </p>
          <p>
            This cash buffer shouldn't be touched for casual investment speculation or lifestyle overrides; it must remain completely liquid to defend your capital stability against sudden disruptions, job cycles, medical events, or structural vehicle repairs. When you maximize your wealth protection layer to cover 3 to 6 months of baseline operating costs, you completely detach yourself from panic-driven credit traps.
          </p>
          <div className="border-t border-gray-800 pt-4 mt-6">
            <h4 className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4" /> Actionable Execution Plan
            </h4>
            <ul className="space-y-2 text-xs font-mono text-gray-400">
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Target a fixed emergency buffer equivalent to 6 calendar cycles of baseline costs.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Lock buffer liquidity inside high-yield capital reserves shielded from direct point-of-sale pathways.</li>
              <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Automate your engine settings to route the first 20% of income directly upon entry.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 antialiased font-sans">

      {/* GLOBAL TOP NAVIGATION HEADER BAR */}
      <nav className="sticky top-0 z-50 bg-gray-900/90 backdrop-blur-md border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setCurrentView('home'); setExpandedBlog(null); }}>
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-xl shadow-md shadow-emerald-500/10">
              <Wallet className="h-6 w-8 text-gray-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">FINANCE<span className="text-emerald-400 font-light">OPTIMIZER</span></span>
              <span className="block text-[10px] font-mono tracking-widest uppercase text-gray-500">Core Engine v2.4</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-gray-950 p-1.5 rounded-xl border border-gray-800">
            <button
              onClick={() => { setCurrentView('home'); setExpandedBlog(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'home' ? 'bg-gray-800 text-emerald-400 border border-gray-700/50' : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => { setCurrentView('dashboard'); setExpandedBlog(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                currentView === 'dashboard' ? 'bg-gray-800 text-emerald-400 border border-gray-700/50' : 'text-gray-400 hover:text-white'
              }`}
            >
              Console Dashboard
            </button>
            <button
              onClick={() => { setCurrentView('blog'); setExpandedBlog(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                currentView === 'blog' ? 'bg-gray-800 text-emerald-400 border border-gray-700/50' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" /> Engine Analytics
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={refreshData} className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all cursor-pointer">
              <RefreshCcw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <div className="flex items-center gap-2 bg-emerald-500/5 px-4 py-1.5 rounded-full border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-mono font-medium text-emerald-400">REST API ONLINE</span>
            </div>
          </div>

        </div>
      </nav>

      {/* RENDER VIEW ROUTING LAYOUT CONTAINER */}
      <main className="max-w-6xl mx-auto p-6 md:p-8">

        {/* VIEW 1: SCROLL-RESPONSIVE HERO OVERVIEW (HOME) */}
        {currentView === 'home' && (
          <div className="animate-fadeIn relative flex flex-col">

            {/* Top Typography Header Stack */}
            <div className="max-w-3xl space-y-5 text-left z-20 pb-6">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full px-4 py-1 text-xs font-mono font-bold uppercase tracking-wider">
                <Terminal className="h-3.5 w-3.5" /> Core Workspace Matrix
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
                Take Absolute Command of Your Capital Allocation
              </h1>

              {/* CLEAN TECH BADGES */}
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[11px] font-bold">
                <span className="bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg text-emerald-400 shadow-sm">React 19 Frontend</span>
                <span className="bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg text-blue-400 shadow-sm">Spring Boot API</span>
                <span className="bg-gray-950 border border-gray-800 px-3 py-1.5 rounded-lg text-amber-400 shadow-sm">50/30/20 Framework</span>
              </div>

              <div className="flex flex-wrap gap-4 pt-3">
                <button onClick={() => setCurrentView('dashboard')} className="bg-emerald-400 hover:bg-emerald-500 text-gray-950 font-black px-6 py-3 rounded-xl shadow-lg transition-all text-sm flex items-center gap-2 group cursor-pointer">
                  Launch Console Dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
                <button onClick={() => setCurrentView('blog')} className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-semibold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer">
                  View Real-time Metrics
                </button>
              </div>
            </div>

            {/* THE RESPONSIVE SHRINKING PARALLAX CANVAS CONTAINER */}
            <div className="w-full sticky top-28 z-10 py-4 mb-6">
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl opacity-15 blur-xl"></div>
              <div className="relative border border-gray-700 rounded-2xl overflow-hidden shadow-2xl bg-gray-950 h-[28vh] md:h-[40vh] transition-all duration-300">
                <img
                  src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
                  alt="Financial Data Graph Platform"
                  className="w-full h-full object-cover mix-blend-luminosity"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/10 to-transparent"></div>
              </div>
            </div>

            {/* INTERACTIVE DATA REVEAL SHEET */}
            <div className="relative z-20 bg-gray-900 pt-10 pb-20 space-y-24 shadow-[0_-40px_40px_rgba(17,24,39,1)] flex flex-col">

              {/* Row 1: The Definition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-widest font-mono">
                    <Activity className="h-4 w-4" /> The Definition
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">What is FinanceOptimizer?</h2>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    FinanceOptimizer Core is an autonomous web engine that instantly processes your raw transactional workflows and maps them directly into the industry-standard **50/30/20 macroeconomic budget framework**. Instead of tracking every single penny down to micro-details, it parses parameters instantly using real-time database state evaluations.
                  </p>
                </div>
                <div className="border border-gray-700 rounded-2xl overflow-hidden shadow-xl bg-gray-950 h-64 relative group">
                  <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80" alt="Data Ledger Mapping" className="w-full h-full object-cover opacity-60 transition-opacity" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-950/40 to-transparent"></div>
                </div>
              </div>

              {/* Row 2: The Motivation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="border border-gray-700 rounded-2xl overflow-hidden shadow-xl bg-gray-950 h-64 relative group md:order-first order-last">
                  <img src="https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=800&q=80" alt="Analytics System Wireframe" className="w-full h-full object-cover opacity-50 transition-opacity" loading="lazy" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-widest font-mono">
                    <Target className="h-4 w-4" /> The Motivation
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">Why Was It Created?</h2>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    Most banking applications hide your structural distribution behavior under heavy menus, making it difficult to visualize capital leaks until after they occur. This core application was engineered to strip away the noise—providing developers and individuals with a low-latency console that tracks, evaluates, and dynamically displays resource allocation balances on the fly.
                  </p>
                </div>
              </div>

              {/* Row 3: Success Vector & Flow */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-400 font-bold text-xs uppercase tracking-widest font-mono">
                    <Compass className="h-4 w-4" /> Human Impact
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">How It Helps You Succeed</h2>
                  <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                    By feeding data parameters directly into specialized database ledgers, the system dynamically weights your expenditures. It shows you the exact percentage values assigned to your crucial **Needs**, lifestyle **Wants**, and long-term **Savings** vectors. This algorithmic visibility keeps you secure from lifestyle inflation and micro-subscription bleed.
                  </p>
                </div>

                <div className="bg-gradient-to-br from-gray-850 to-gray-950 border border-gray-700 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="font-mono text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="h-4 w-4 text-emerald-400" /> Platform Architecture Flow
                  </h4>
                  <div className="space-y-3 text-xs font-mono">
                    <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
                      <Cpu className="h-4 w-4 text-blue-400" />
                      <div>
                        <p className="text-white font-bold">Reactive Client UI (React 19)</p>
                        <p className="text-gray-500 text-[10px]">Tailwind utility system viewport models</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
                      <Terminal className="h-4 w-4 text-orange-400" />
                      <div>
                        <p className="text-white font-bold">REST Routing Hub (Spring Boot)</p>
                        <p className="text-gray-500 text-[10px]">Decoupled controller mappings and services</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900 p-3 rounded-xl border border-gray-800">
                      <Database className="h-4 w-4 text-teal-400" />
                      <div>
                        <p className="text-white font-bold">Relational Data Store (Hibernate JPA)</p>
                        <p className="text-gray-500 text-[10px]">Persistent transactional structural arrays</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: INTERACTIVE CONSOLE DASHBOARD VIEW */}
        {currentView === 'dashboard' && (
          <div className="animate-fadeIn space-y-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                <div className="bg-gradient-to-r from-gray-800 to-gray-850 border border-gray-700 rounded-2xl p-6 flex items-center justify-between shadow-xl h-full">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Evaluated Expenditure</p>
                    <h3 className="text-4xl font-black mt-2 text-white">
                      ${report.totalSpending.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </h3>
                    <p className="text-xs font-mono text-gray-500 mt-4 bg-gray-950 px-2.5 py-1 rounded-md inline-block border border-gray-800">
                      Logs: {report.totalTransactions} Commits
                    </p>
                  </div>
                  <div className="p-4 bg-emerald-400/10 rounded-xl border border-emerald-400/20 shadow-inner">
                    <DollarSign className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="space-y-2 text-left w-full md:w-auto">
                  <h4 className="font-extrabold text-white text-base flex items-center gap-2">
                    <PieChart className="h-4 w-4 text-emerald-400" /> Allocation Breakdown
                  </h4>
                  <p className="text-xs text-gray-400 max-w-xs">Visual proportional rendering calculated inside current client state loops.</p>
                  <div className="pt-4 space-y-2 text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-blue-400 block"></span>
                      <span className="text-gray-400">Needs:</span>
                      <span className="text-white font-bold">{report.needsPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 block"></span>
                      <span className="text-gray-400">Wants:</span>
                      <span className="text-white font-bold">{report.wantsPercentage}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 block"></span>
                      <span className="text-gray-400">Savings:</span>
                      <span className="text-white font-bold">{report.savingsPercentage}%</span>
                    </div>
                  </div>
                </div>

                <div className="relative h-36 w-36 flex items-center justify-center bg-gray-950/40 rounded-full p-4 border border-gray-700/50">
                  {transactions.length > 0 ? (
                    <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#60a5fa" strokeWidth="3.2" strokeDasharray={`${needDash} ${100 - needDash}`} strokeDashoffset="0" className="transition-all duration-500 ease-out" />
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#fbbf24" strokeWidth="3.2" strokeDasharray={`${wantDash} ${100 - wantDash}`} strokeDashoffset={`-${needDash}`} className="transition-all duration-500 ease-out" />
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#34d399" strokeWidth="3.2" strokeDasharray={`${savingsDash} ${100 - savingsDash}`} strokeDashoffset={`-${needDash + wantDash}`} className="transition-all duration-500 ease-out" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 36 36" className="w-full h-full">
                      <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#374151" strokeWidth="2" />
                    </svg>
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <BarChart3 className="h-5 w-5 text-gray-500" />
                    <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest mt-0.5">Live</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 shadow-md hover:border-gray-600 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Needs (Target 50%)</p>
                    <h4 className="text-4xl font-extrabold mt-2 text-white">{report.needsPercentage}%</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold tracking-wide">Essential</span>
                </div>
                <div className="w-full bg-gray-900 h-2.5 rounded-full mt-5 overflow-hidden p-[2px] border border-gray-700">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-400 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${report.needsPercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 shadow-md hover:border-gray-600 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Wants (Target 30%)</p>
                    <h4 className="text-4xl font-extrabold mt-2 text-white">{report.wantsPercentage}%</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold tracking-wide">Lifestyle</span>
                </div>
                <div className="w-full bg-gray-900 h-2.5 rounded-full mt-5 overflow-hidden p-[2px] border border-gray-700">
                  <div className="bg-gradient-to-r from-amber-600 to-amber-400 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${report.wantsPercentage}%` }}></div>
                </div>
              </div>

              <div className="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 shadow-md hover:border-gray-600 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Savings (Target 20%)</p>
                    <h4 className="text-4xl font-extrabold mt-2 text-white">{report.savingsPercentage}%</h4>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold tracking-wide">Future</span>
                </div>
                <div className="w-full bg-gray-900 h-2.5 rounded-full mt-5 overflow-hidden p-[2px] border border-gray-700">
                  <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${report.savingsPercentage}%` }}></div>
                </div>
              </div>
            </div>

            {/* Entry Form */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400"></div>
              <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
                <PlusCircle className="h-5 w-5 text-emerald-400" /> Log New Expense Entry
              </h3>
              <form onSubmit={handleAddTransaction} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <input type="text" placeholder="e.g. Electric Bill" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Amount ($)</label>
                  <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Classification</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 text-sm">
                    <option value="NEED">Need (Essential)</option>
                    <option value="WANT">Want (Lifestyle)</option>
                    <option value="SAVINGS">Savings (Future)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-emerald-400 hover:bg-emerald-500 text-gray-950 font-black py-2.5 px-4 rounded-xl text-sm shadow-md active:scale-[0.98] cursor-pointer">
                  Post to Database
                </button>
              </form>
            </div>

            {/* Ledger Interface */}
            <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-700 bg-gray-800/40 space-y-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                      <FileText className="h-5 w-5 text-emerald-400" />
                      {selectedMonth === 'ALL' ? 'Active Database Transaction Ledger' : `${formatMonthLabel(selectedMonth)} Statement`}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {selectedMonth === 'ALL' ? 'Real-time synchronized data mapping sequence' : 'Isolating specific calendar cycle billing logs'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex items-center bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 focus-within:border-emerald-500 transition-colors min-w-[160px] flex-1 sm:flex-none">
                      <Calendar className="h-4 w-4 text-emerald-400 mr-2 shrink-0" />
                      <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-transparent text-white w-full text-xs font-semibold focus:outline-none cursor-pointer appearance-none pr-4">
                        <option value="ALL" className="bg-gray-950 text-gray-100">All Transactions</option>
                        {uniqueMonths.map(ym => (
                          <option key={ym} value={ym} className="bg-gray-950 text-gray-100">{formatMonthLabel(ym)} Statement</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><span className="text-[10px]">▼</span></div>
                    </div>

                    <div className="relative w-full sm:w-48 flex-1 sm:flex-none">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                      <input type="text" placeholder="Search statement..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-gray-950 border border-gray-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors" />
                    </div>

                    <div className="relative flex items-center bg-gray-950 border border-gray-700 rounded-xl px-3 py-2 text-sm text-gray-300 focus-within:border-emerald-500 transition-colors min-w-[150px] flex-1 sm:flex-none">
                      <ArrowUpDown className="h-4 w-4 text-gray-500 mr-2 shrink-0" />
                      <select value={sortOption} onChange={(e) => setSortOption(e.target.value)} className="bg-transparent text-white w-full text-xs font-semibold focus:outline-none cursor-pointer appearance-none pr-4">
                        <option value="DATE_DESC" className="bg-gray-950 text-gray-100">Date: Newest</option>
                        <option value="DATE_ASC" className="bg-gray-950 text-gray-100">Date: Older</option>
                        <option value="AMOUNT_DESC" className="bg-gray-950 text-gray-100">Value: Highest</option>
                        <option value="AMOUNT_ASC" className="bg-gray-950 text-gray-100">Value: Lowest</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500"><span className="text-[10px]">▼</span></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-gray-950/60 rounded-xl px-4 py-2 border border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-500"></span> Needs:</span>
                    <span className="text-xs font-mono font-bold text-blue-400">${categoryBreakdown.needs.toFixed(2)}</span>
                  </div>
                  <div className="bg-gray-950/60 rounded-xl px-4 py-2 border border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Wants:</span>
                    <span className="text-xs font-mono font-bold text-amber-400">${categoryBreakdown.wants.toFixed(2)}</span>
                  </div>
                  <div className="bg-gray-950/60 rounded-xl px-4 py-2 border border-gray-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-400 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Savings:</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">${categoryBreakdown.savings.toFixed(2)}</span>
                  </div>
                  <div className="bg-emerald-500/5 rounded-xl px-4 py-2 border border-emerald-500/20 flex items-center justify-between shadow-sm">
                    <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">Statement Total:</span>
                    <span className="text-sm font-mono font-black text-white">${statementTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-950/40 text-gray-400 text-xs font-bold uppercase tracking-widest border-b border-gray-700">
                      <th className="px-6 py-4 w-20 font-semibold">Row</th>
                      <th className="px-6 py-4 font-semibold">Description</th>
                      <th className="px-6 py-4 font-semibold">Classification</th>
                      <th className="px-6 py-4 font-semibold">Date Logged</th>
                      <th className="px-6 py-4 font-semibold text-right">Value Amount</th>
                      <th className="px-6 py-4 w-20 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700 text-sm">
                    {processedTransactions.map((t, index) => {
                      const currentCategory = t.category || t.classCategory;
                      return (
                        <tr key={t.id} className="hover:bg-gray-700/30 transition-colors group">
                          <td className="px-6 py-4 font-mono text-gray-500 font-bold">#{index + 1}</td>
                          <td className="px-6 py-4 font-semibold text-white">{t.description}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide border ${
                              currentCategory === 'NEED' ? 'bg-blue-500/5 text-blue-400 border-blue-500/20' :
                              currentCategory === 'WANT' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' :
                              'bg-emerald-500/5 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {currentCategory}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs text-gray-400">
                            {t.date ? new Date(t.date + 'T00:00:00').toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric'}) : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-white font-mono">${t.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => handleDeleteTransaction(t.id)} className="text-gray-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-xl transition-all cursor-pointer">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {processedTransactions.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                          {transactions.length === 0 ? "No active transaction models found in database ledger. Add data above!" : "No ledger records match your current filter criteria."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 3: LIVE SYSTEM ENGINE ANALYTICS REPORT & HIGH-DETAIL CLICKABLE ARTICLES */}
        {currentView === 'blog' && (
          <div className="animate-fadeIn space-y-12">

            {/* Top Header Block */}
            <div className="text-center max-w-2xl mx-auto">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold rounded-full tracking-wider uppercase font-mono">System Audit Hub</span>
              <h2 className="text-4xl font-black text-white mt-3 tracking-tight">Macroeconomic Allocation Metrics</h2>
              <p className="text-gray-400 mt-2 text-base">Real-time structural breakdown parsing data from your active database.</p>
            </div>

            {/* LIVE API METRICS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-extrabold text-xl text-white flex items-center gap-2"><TrendingUp className="text-blue-400 h-5 w-5" /> Current Operational Health</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Your core database is tracking a total processing value of <strong className="text-white">${report.totalSpending.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> distributed across <strong className="text-white">{report.totalTransactions} distinct operational logs</strong>.
                </p>
                <div className="space-y-3 pt-2 text-xs font-mono">
                  <div className="p-3 bg-gray-950 rounded-xl border border-gray-850 flex justify-between items-center"><span className="text-gray-400">Essential Needs Share:</span><span className="text-blue-400 font-bold">{report.needsPercentage}% (Target: 50%)</span></div>
                  <div className="p-3 bg-gray-950 rounded-xl border border-gray-850 flex justify-between items-center"><span className="text-gray-400">Lifestyle Wants Share:</span><span className="text-amber-400 font-bold">{report.wantsPercentage}% (Target: 30%)</span></div>
                  <div className="p-3 bg-gray-950 rounded-xl border border-gray-850 flex justify-between items-center"><span className="text-gray-400">Future Savings Share:</span><span className="text-emerald-400 font-bold">{report.savingsPercentage}% (Target: 20%)</span></div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-xl text-white flex items-center gap-2"><ShieldCheck className="text-emerald-400 h-5 w-5" /> Engine System Recommendations</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {report.totalTransactions === 0 ? (
                      "The system requires structural database logging inputs before calculating vector tracking recommendations. Populate your entry matrix in the Console Dashboard."
                    ) : report.needsPercentage > 50 ? (
                      "Your baseline essential liabilities represent a disproportionate amount of expenditure. Perform a deep structural audit to reduce re-billing contracts and manage micro-subscriptions to lower fixed parameters back toward the 50% safety floor."
                    ) : report.savingsPercentage < 20 ? (
                      "Your wealth protection layer is operating below the recommended macroeconomic index. Automate recurring routing mechanics to distribute capital directly to savings lines the moment liquidity enters your ecosystem."
                    ) : (
                      "Your current financial ledger matrices match standard macroeconomic models. Your spending profile parameters are within optimal allocation margins."
                    )}
                  </p>
                </div>
                <div className="bg-gray-950 p-4 rounded-xl border border-gray-850 text-xs font-mono flex items-center justify-between text-gray-400">
                  <span>Engine Evaluation Context:</span>
                  <span className="text-emerald-400 font-bold">100% Dynamic API Sourced</span>
                </div>
              </div>
            </div>

            {/* EXPANDED INTERACTIVE CLICK-TO-MAXIMIZE BLOG ARCHIVES */}
            <div className="pt-6 border-t border-gray-800 space-y-8">
              <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
                <BookOpen className="h-4 w-4" /> Strategic Resource Archives <span className="text-[10px] text-gray-500 font-normal lowercase">(click to expand)</span>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {blogPosts.map((blog) => (
                  <div key={blog.id}>
                    {/* Collapsed Article Block Trigger */}
                    <article
                      onClick={() => setExpandedBlog(expandedBlog === blog.id ? null : blog.id)}
                      className={`bg-gray-850 border rounded-2xl p-6 md:p-8 shadow-xl hover:border-gray-600 transition-all relative overflow-hidden group cursor-pointer ${
                        expandedBlog === blog.id ? 'border-emerald-500 bg-gray-800/80 shadow-emerald-500/5' : 'border-gray-800'
                      }`}
                    >
                      <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-2xl pointer-events-none transition-all ${blog.glowColor}`}></div>

                      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
                        <span className={`px-3 py-1 text-xs font-mono font-bold rounded-lg tracking-wide border ${blog.badgeColor}`}>
                          {blog.badge}
                        </span>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-gray-500 font-mono"><Clock className="h-3.5 w-3.5" /> {blog.readTime}</div>
                          <span className="text-xs font-mono text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            {expandedBlog === blog.id ? 'Collapse ▲' : 'Expand Details ➔'}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-3 group-hover:text-emerald-400 transition-colors relative z-10">
                        {blog.title}
                      </h3>

                      <p className="text-gray-400 text-sm md:text-base leading-relaxed relative z-10">
                        {blog.excerpt}
                      </p>

                      {/* Interactive Maximized Content Drawer Area */}
                      <div className={`transition-all duration-300 ease-in-out overflow-hidden relative z-10 ${
                        expandedBlog === blog.id ? 'max-h-[1200px] opacity-100 mt-6 pt-6 border-t border-gray-700/60' : 'max-h-0 opacity-0'
                      }`}>
                        {blog.fullContent}
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </main>

      {/* GLOBAL FOOTER WRAPPER */}
      <footer className="max-w-6xl mx-auto border-t border-gray-800 mt-16 px-6 py-8 text-center text-xs text-gray-500 font-mono">
        &copy; 2026 FinanceOptimizer Core System. Running Local Client Engine Sandbox. All records private.
      </footer>
    </div>
  );
}