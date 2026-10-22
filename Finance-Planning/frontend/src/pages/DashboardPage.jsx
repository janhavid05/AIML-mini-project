import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter, ZAxis, LineChart, Line, ReferenceLine } from "recharts";
import { ArrowLeft, TrendingUp, AlertTriangle, Target, Briefcase, BrainCircuit, CheckCircle2, XCircle, Pencil, Printer, Wallet, PiggyBank, Scale, ShieldCheck, Info, X, BarChart2, Landmark, Coins, TrendingDown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#6366f1", "#8b5cf6", "#ec4899"];

// Static investment universe for comparison
const INVESTMENT_UNIVERSE = [
  { id: "sip_large",   name: "SIP – Large Cap",      category: "Equity MF",    returnMin: 10, returnMax: 14, returnAvg: 12, risk: 40, liquidity: 85, taxBenefit: 30, minAmount: 500,   lock: 0,   riskLabel: "Medium",  color: "#6366f1", highlight: false },
  { id: "sip_mid",    name: "SIP – Mid/Small Cap",  category: "Equity MF",    returnMin: 13, returnMax: 20, returnAvg: 16, risk: 65, liquidity: 75, taxBenefit: 30, minAmount: 500,   lock: 0,   riskLabel: "High",    color: "#ec4899", highlight: false },
  { id: "sip_elss",   name: "SIP – ELSS (Tax Saver)",category: "Equity MF",   returnMin: 11, returnMax: 17, returnAvg: 13, risk: 50, liquidity: 40, taxBenefit: 90, minAmount: 500,   lock: 3,   riskLabel: "Medium",  color: "#8b5cf6", highlight: false },
  { id: "nifty",      name: "Direct Stocks (Nifty)",category: "Stock Market", returnMin: 8,  returnMax: 25, returnAvg: 14, risk: 75, liquidity: 95, taxBenefit: 10, minAmount: 1000,  lock: 0,   riskLabel: "High",    color: "#f43f5e", highlight: false },
  { id: "fd",         name: "Fixed Deposit (FD)",   category: "Debt",         returnMin: 6,  returnMax: 8,  returnAvg: 7,  risk: 5,  liquidity: 50, taxBenefit: 10, minAmount: 1000,  lock: 1,   riskLabel: "Low",     color: "#14b8a6", highlight: false },
  { id: "ppf",        name: "PPF",                  category: "Government",   returnMin: 7,  returnMax: 8,  returnAvg: 7.5,risk: 2, liquidity: 20, taxBenefit: 100,minAmount: 500,   lock: 15,  riskLabel: "Very Low",color: "#10b981", highlight: false },
  { id: "nps",        name: "NPS",                  category: "Pension",      returnMin: 9,  returnMax: 12, returnAvg: 10.5,risk: 30,liquidity: 15, taxBenefit: 80, minAmount: 500,   lock: 60,  riskLabel: "Low-Med", color: "#f59e0b", highlight: false },
  { id: "gold",       name: "Gold (ETF / SGBs)",    category: "Commodity",    returnMin: 6,  returnMax: 14, returnAvg: 9,  risk: 35, liquidity: 70, taxBenefit: 20, minAmount: 1000,  lock: 0,   riskLabel: "Medium",  color: "#eab308", highlight: false },
  { id: "rd",         name: "Recurring Deposit",    category: "Debt",         returnMin: 5,  returnMax: 7,  returnAvg: 6,  risk: 3,  liquidity: 55, taxBenefit: 0,  minAmount: 100,   lock: 0,   riskLabel: "Very Low",color: "#64748b", highlight: false },
  { id: "realestate", name: "Real Estate (REIT)",   category: "Real Estate",  returnMin: 7,  returnMax: 13, returnAvg: 10, risk: 45, liquidity: 40, taxBenefit: 15, minAmount: 50000, lock: 0,   riskLabel: "Medium",  color: "#a16207", highlight: false },
];

const RISK_LEVEL_ORDER = ["Very Low", "Low", "Low-Med", "Medium", "High"];

const getRiskColor = (label) => ({
  "Very Low": "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Low":      "bg-teal-100 text-teal-800 border-teal-200",
  "Low-Med":  "bg-sky-100 text-sky-800 border-sky-200",
  "Medium":   "bg-amber-100 text-amber-800 border-amber-200",
  "High":     "bg-rose-100 text-rose-800 border-rose-200",
}[label] || "bg-slate-100 text-slate-800 border-slate-200");

const InvestmentComparisonSection = ({ planReturn, planRisk, planName }) => {
  const [activeTab, setActiveTab] = useState("scatter");
  const [highlighted, setHighlighted] = useState(null);

  // Build personalised "Balance Plan" entry
  const balancePlan = {
    id: "balance", name: planName || "Your Balance Plan", category: "AI Plan",
    returnMin: Math.max(0, planReturn - 2), returnMax: planReturn + 2, returnAvg: planReturn,
    risk: planRisk, liquidity: 70, taxBenefit: 40, minAmount: 500, lock: 0,
    riskLabel: planRisk <= 15 ? "Low" : planRisk <= 35 ? "Medium" : "High",
    color: "#4f46e5", highlight: true,
  };

  const allInvestments = [balancePlan, ...INVESTMENT_UNIVERSE];

  // Data for scatter plot: x = risk score, y = avg return
  const scatterData = allInvestments.map((inv) => ({
    x: inv.risk,
    y: inv.returnAvg,
    z: inv.highlight ? 300 : 150,
    name: inv.name,
    color: inv.color,
    highlight: inv.highlight,
    id: inv.id,
  }));

  // Radar attributes (0–100 scale)
  const radarKeys = ["Return", "Stability", "Liquidity", "Tax Benefit", "Accessibility"];
  const normalise = (v, min, max) => Math.round(((v - min) / (max - min)) * 100);
  const radarData = radarKeys.map((key) => {
    const obj = { attribute: key };
    [balancePlan, ...INVESTMENT_UNIVERSE.slice(0, 4)].forEach((inv) => {
      switch (key) {
        case "Return":       obj[inv.id] = normalise(inv.returnAvg, 5, 20); break;
        case "Stability":   obj[inv.id] = normalise(100 - inv.risk, 20, 100); break;
        case "Liquidity":   obj[inv.id] = inv.liquidity; break;
        case "Tax Benefit": obj[inv.id] = inv.taxBenefit; break;
        case "Accessibility": obj[inv.id] = normalise(10000 - Math.min(inv.minAmount, 10000), 0, 10000); break;
      }
    });
    return obj;
  });

  // Timeline projection: ₹5,000/month over 10 years
  const SIP_AMOUNT = 5000;
  const timelineYears = [1, 2, 3, 5, 7, 10];
  const fv = (rate, years) => {
    const r = rate / 100;
    if (r === 0) return SIP_AMOUNT * 12 * years;
    return Math.round(SIP_AMOUNT * 12 * ((Math.pow(1 + r, years) - 1) / r));
  };
  const timelineData = timelineYears.map((yr) => {
    const point = { year: `Yr ${yr}`, invested: SIP_AMOUNT * 12 * yr };
    allInvestments.slice(0, 6).forEach((inv) => { point[inv.id] = fv(inv.returnAvg, yr); });
    return point;
  });

  const tabs = [
    { id: "scatter",  label: "Risk vs Return",   icon: BarChart2 },
    { id: "radar",    label: "Attribute Radar",  icon: Target },
    { id: "timeline", label: "Growth Timeline",  icon: TrendingUp },
    { id: "table",    label: "Full Comparison",   icon: Scale },
  ];

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-t-2xl pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 rounded-xl border border-indigo-400/30">
              <BarChart2 className="h-6 w-6 text-indigo-200" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-white">Investment Comparison</CardTitle>
              <CardDescription className="text-indigo-300 font-medium mt-0.5">
                How your Balance Plan compares across SIPs, Stocks, FD, PPF, Gold & more
              </CardDescription>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mt-5">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-white text-indigo-900 shadow"
                    : "bg-white/10 text-white hover:bg-white/20 border border-white/20"
                }`}
              >
                <tab.icon className="h-3.5 w-3.5" />{tab.label}
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-8 space-y-6">

          {/* ── TAB 1: Scatter Risk vs Return ── */}
          {activeTab === "scatter" && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Bubble size = market cap / prominence. Your plan is highlighted in <span className="font-bold text-indigo-600">indigo</span>.
              </p>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" dataKey="x" name="Risk Score" domain={[0, 100]}
                      label={{ value: "Risk Score →", position: "insideBottom", offset: -10, fill: "#64748b", fontSize: 12 }}
                      tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                    />
                    <YAxis type="number" dataKey="y" name="Avg Return %" domain={[4, 22]}
                      label={{ value: "Avg Annual Return (%) ↑", angle: -90, position: "insideLeft", offset: 10, fill: "#64748b", fontSize: 12 }}
                      tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `${v}%`}
                    />
                    <ZAxis type="number" dataKey="z" range={[80, 320]} />
                    <Tooltip
                      cursor={{ strokeDasharray: "3 3" }}
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const d = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-sm min-w-[180px]">
                              <p className="font-bold text-slate-900 mb-2" style={{ color: d.color }}>{d.name}</p>
                              <p className="text-slate-600">Avg Return: <span className="font-semibold text-emerald-600">{d.y}% p.a.</span></p>
                              <p className="text-slate-600">Risk Score: <span className="font-semibold text-amber-600">{d.x}/100</span></p>
                              {d.highlight && <p className="mt-2 text-xs text-indigo-600 font-semibold">★ Your AI Plan</p>}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    {allInvestments.map((inv) => (
                      <Scatter
                        key={inv.id}
                        name={inv.name}
                        data={[{ x: inv.risk, y: inv.returnAvg, z: inv.highlight ? 300 : 150, name: inv.name, color: inv.color, highlight: inv.highlight }]}
                        fill={inv.color}
                        opacity={highlighted && highlighted !== inv.id ? 0.3 : 1}
                      />
                    ))}
                    {/* Quadrant lines */}
                    <ReferenceLine x={50} stroke="#e2e8f0" strokeDasharray="4 4" />
                    <ReferenceLine y={10} stroke="#e2e8f0" strokeDasharray="4 4" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {allInvestments.map((inv) => (
                  <span
                    key={inv.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition ${
                      inv.highlight ? "bg-indigo-50 border-indigo-300 text-indigo-800 font-bold" : "bg-slate-50 border-slate-200 text-slate-700"
                    }`}
                    onMouseEnter={() => setHighlighted(inv.id)}
                    onMouseLeave={() => setHighlighted(null)}
                  >
                    <span className="h-2 w-2 rounded-full inline-block" style={{ background: inv.color }} />
                    {inv.name}
                    {inv.highlight && " ★"}
                  </span>
                ))}
              </div>
              {/* Quadrant labels */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { label: "Low Risk, Low Return", desc: "FD, PPF, RD – capital preservation", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800" },
                  { label: "Low Risk, High Return", desc: "Rare – ideal zone", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-800" },
                  { label: "High Risk, Low Return", desc: "Avoid – speculative assets", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-800" },
                  { label: "High Risk, High Return", desc: "Stocks, Mid-Cap SIP – for long horizons", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800" },
                ].map((q) => (
                  <div key={q.label} className={`${q.bg} ${q.border} border rounded-xl p-3`}>
                    <p className={`text-xs font-bold ${q.text}`}>{q.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{q.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 2: Radar ── */}
          {activeTab === "radar" && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Multi-dimensional comparison of your plan vs top alternatives across 5 key attributes (score out of 100).
              </p>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="attribute" tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    {[balancePlan, ...INVESTMENT_UNIVERSE.slice(0, 4)].map((inv, i) => (
                      <Radar key={inv.id} name={inv.name} dataKey={inv.id}
                        stroke={inv.color} fill={inv.color}
                        fillOpacity={inv.highlight ? 0.25 : 0.1}
                        strokeWidth={inv.highlight ? 3 : 1.5}
                      />
                    ))}
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} iconType="circle" />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-4">
                {[
                  { key: "Return",        desc: "Higher avg annual return = better wealth creation" },
                  { key: "Stability",     desc: "Inverse of volatility — lower risk, higher score" },
                  { key: "Liquidity",     desc: "How easily you can redeem/exit the investment" },
                  { key: "Tax Benefit",   desc: "Section 80C, LTCG exemptions, etc." },
                  { key: "Accessibility", desc: "Low minimum investment = more accessible" },
                ].map((attr) => (
                  <div key={attr.key} className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                    <p className="text-xs font-bold text-slate-800">{attr.key}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{attr.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TAB 3: Growth Timeline ── */}
          {activeTab === "timeline" && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Projected value of <span className="font-semibold text-slate-700">₹5,000/month SIP</span> over 10 years across investment types.
              </p>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`} tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      formatter={(value) => `₹${Number(value).toLocaleString()}`}
                      contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: 12 }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 16 }} iconType="circle" />
                    <Line dataKey="invested" name="Amount Invested" stroke="#94a3b8" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                    {allInvestments.slice(0, 6).map((inv) => (
                      <Line
                        key={inv.id} dataKey={inv.id} name={inv.name}
                        stroke={inv.color}
                        strokeWidth={inv.highlight ? 3 : 1.5}
                        dot={inv.highlight}
                        activeDot={{ r: 6 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                <p className="text-xs text-amber-800 font-semibold">⚠️ Disclaimer</p>
                <p className="text-xs text-amber-700 mt-1">Projections use historical average returns and assume consistent monthly investment. Actual returns may vary. Past performance is not indicative of future results.</p>
              </div>
            </div>
          )}

          {/* ── TAB 4: Full Comparison Table ── */}
          {activeTab === "table" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    {["Investment", "Category", "Return Range", "Avg Return", "Risk", "Liquidity", "Tax Benefit", "Min Amount", "Lock-in"].map((h) => (
                      <th key={h} className="text-left py-3 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allInvestments.map((inv, idx) => (
                    <tr
                      key={inv.id}
                      className={`border-b transition ${
                        inv.highlight
                          ? "bg-indigo-50 border-indigo-100 font-bold"
                          : idx % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                      } hover:bg-indigo-50/40`}
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: inv.color }} />
                          <span className={`font-semibold ${inv.highlight ? "text-indigo-800" : "text-slate-800"}`}>
                            {inv.name}
                            {inv.highlight && <span className="ml-1 text-indigo-500">★</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 whitespace-nowrap">{inv.category}</td>
                      <td className="py-3.5 px-3 font-mono text-xs text-slate-700">{inv.returnMin}–{inv.returnMax}%</td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-emerald-700">{inv.returnAvg}%</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${getRiskColor(inv.riskLabel)}`}>
                          {inv.riskLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 max-w-[60px] bg-slate-200 rounded-full h-1.5">
                            <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${inv.liquidity}%` }} />
                          </div>
                          <span className="text-xs text-slate-600">{inv.liquidity}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex-1 max-w-[60px] bg-slate-200 rounded-full h-1.5">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${inv.taxBenefit}%` }} />
                          </div>
                          <span className="text-xs text-slate-600">{inv.taxBenefit}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">₹{inv.minAmount.toLocaleString()}</td>
                      <td className="py-3.5 px-3 text-slate-700 whitespace-nowrap">
                        {inv.lock === 0 ? <span className="text-emerald-600 font-semibold">None</span>
                          : inv.lock >= 12 ? <span className="text-rose-600 font-semibold">{inv.lock} yrs</span>
                          : <span className="text-amber-600 font-semibold">{inv.lock} yr{inv.lock > 1 ? "s" : ""}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Summary badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                {[
                  { icon: TrendingUp,    label: "Best Returns",    value: "Mid/Small Cap SIP (16%)", color: "bg-rose-50 border-rose-200 text-rose-800" },
                  { icon: ShieldCheck,  label: "Safest Option",   value: "PPF / RD (Govt. backed)",  color: "bg-emerald-50 border-emerald-200 text-emerald-800" },
                  { icon: Coins,        label: "Best Tax Saving", value: "PPF + ELSS (Sec. 80C)",   color: "bg-sky-50 border-sky-200 text-sky-800" },
                  { icon: Star,         label: "Best Balance",    value: planName || "Your AI Plan",  color: "bg-indigo-50 border-indigo-200 text-indigo-800" },
                ].map((badge) => (
                  <div key={badge.label} className={`flex items-start gap-2 rounded-xl border p-3 ${badge.color}`}>
                    <badge.icon className="h-4 w-4 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide opacity-70">{badge.label}</p>
                      <p className="text-xs font-semibold mt-0.5">{badge.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const DashboardPage = ({ data, onReset }) => {
  const navigate = useNavigate();
  const [showMlInfo, setShowMlInfo] = useState(false);
  const mlResultData = data?.data?.data || data?.data || {};
  const { plans, customer } = mlResultData;
  const { analysis } = data || {};
  const planList = plans ? Object.values(plans) : [];

  const metrics = customer?.financial_metrics || {};
  const risk = customer?.risk_profile || {};
  const goal = customer?.financial_goal || {};

  if (!planList.length) {
    return (
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-12 rounded-3xl shadow-xl shadow-slate-200/50 max-w-md w-full border border-slate-100">
          <AlertTriangle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-4">No plans generated</h2>
          <p className="text-slate-500 mb-8 leading-relaxed">It looks like we couldn't generate a financial plan with the provided details. Please try again.</p>
          <Button onClick={() => { onReset(); navigate("/form"); }} className="w-full cursor-pointer">Go Back</Button>
        </motion.div>
      </div>
    );
  }

  const projectionData = [];
  const yearsToProject = planList[0]?.time_horizon_years || 10;
  
  for (let year = 1; year <= yearsToProject; year += Math.max(1, Math.floor(yearsToProject / 5))) {
    const dataPoint = { year: `Year ${year}` };
    planList.forEach((plan) => {
      const monthly = plan.required_monthly_investment || 0;
      const rate = (plan.expected_annual_return_percent || 0) / 100;
      let futureValue = 0;
      if (rate > 0) {
        futureValue = monthly * 12 * ((Math.pow(1 + rate, year) - 1) / rate);
      } else {
        futureValue = monthly * 12 * year;
      }
      dataPoint[plan.name || plan.type] = Math.round(futureValue);
    });
    projectionData.push(dataPoint);
  }

  return (
    <div className="flex-1 bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 overflow-hidden print:p-0 print:bg-white">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print:border-none print:shadow-none">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Financial Dashboard</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-sm text-slate-500">ML Risk Profile:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {risk?.risk_profile || "Moderate"}
              </span>
              <button
                onClick={() => setShowMlInfo(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 transition cursor-pointer print:hidden"
                title="View how ML calculations work"
              >
                <Info className="h-3 w-3" /> How ML works
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto print:hidden">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex-1 sm:flex-none cursor-pointer hover:bg-slate-50"
            >
              <Printer className="h-4 w-4 mr-2" /> Save PDF / Print
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/form")}
              className="flex-1 sm:flex-none cursor-pointer"
            >
              <Pencil className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
            <Button variant="outline" onClick={() => { onReset(); navigate("/form"); }} className="flex-1 sm:flex-none cursor-pointer">
              <ArrowLeft className="h-4 w-4 mr-2" /> Start Over
            </Button>
          </div>
        </motion.div>

        {/* 1. FINANCIAL HEALTH DIAGNOSTIC SCORECARD */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimated Net Worth</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">₹{Number(metrics.net_worth || 0).toLocaleString()}</h3>
                <p className="text-xs text-slate-400 mt-1">Assets ₹{Number(metrics.total_assets || 0).toLocaleString()} | Debt ₹{Number(metrics.total_liabilities || 0).toLocaleString()}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-semibold ${Number(metrics.net_worth || 0) >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {Number(metrics.net_worth || 0) >= 0 ? "✓ Positive Solvency" : "Debt Heavy"}
                </span>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Wallet className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Savings Rate</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.savings_rate ?? 0}%</h3>
                <p className="text-xs text-slate-400 mt-1">₹{Number(metrics.monthly_savings || 0).toLocaleString()} saved / ₹{Number(metrics.monthly_income || 0).toLocaleString()} income</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-semibold ${(metrics.savings_rate || 0) >= 20 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                  {(metrics.savings_rate || 0) >= 20 ? "✓ Healthy (>20%)" : "Opportunity to Grow"}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <PiggyBank className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Debt-to-Income (DTI)</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{metrics.debt_to_income_ratio ?? 0}%</h3>
                <p className="text-xs text-slate-400 mt-1">₹{Number(metrics.monthly_debt_payment || 0).toLocaleString()}/mo in EMI payments</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-semibold ${(metrics.debt_to_income_ratio || 0) <= 35 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                  {(metrics.debt_to_income_ratio || 0) <= 35 ? "✓ Low Risk (<35%)" : "High Debt Pressure"}
                </span>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <Scale className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-100 bg-white shadow-sm hover:shadow-md transition">
            <CardContent className="p-5 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Composite ML Risk Score</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{risk.final_risk_score ?? 50} <span className="text-sm font-semibold text-slate-400">/ 100</span></h3>
                <p className="text-xs text-slate-400 mt-1">Cap: {risk.risk_capacity_score ?? 50} | Tol: {risk.risk_tolerance_score ?? 50}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700">
                  {risk.risk_profile || "Moderate"} Profile
                </span>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 2. ML EXPLAINABILITY MODAL */}
        <AnimatePresence>
          {showMlInfo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3 text-indigo-700">
                    <div className="p-2 bg-indigo-100 rounded-xl">
                      <BrainCircuit className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">How the ML Planning Engine Works</h3>
                      <p className="text-xs text-slate-500">Mathematical & AI Methodology</p>
                    </div>
                  </div>
                  <button onClick={() => setShowMlInfo(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-1">1. Hybrid Risk Score Formulation</h4>
                    <p className="font-mono text-xs text-indigo-600 mb-2">Final Risk = 0.5 × Risk Tolerance + 0.5 × Risk Capacity</p>
                    <p className="text-xs">Risk capacity assesses real financial ability (savings rate & debt ratio), while tolerance captures psychological comfort. This prevents over-risking vulnerable portfolios.</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-1">2. Historical Return & Volatility Optimization</h4>
                    <p className="text-xs">Asset class allocations (Equity, Debt, Gold, FD) are mapped against historical return distributions and correlation matrices, then tailored to your specific time horizon ({goal?.time_horizon_years || 10} years).</p>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <h4 className="font-bold text-slate-900 mb-1">3. Monthly Investment Annuity Calculation</h4>
                    <p className="font-mono text-xs text-indigo-600 mb-2">Monthly SIP = [Goal Gap × r] / [(1 + r)^n - 1]</p>
                    <p className="text-xs">Computes the precise periodic capital allocation required to reach your target goal of ₹{Number(goal?.goal_amount || 0).toLocaleString()} considering compound interest.</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button onClick={() => setShowMlInfo(false)} className="w-full sm:w-auto">
                    Close Explanation
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {analysis && (
          <motion.div variants={itemVariants}>
            <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-md shadow-lg shadow-indigo-100/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <BrainCircuit className="w-64 h-64 text-indigo-600" />
              </div>
              <CardHeader className="relative z-10 border-b border-indigo-100/50 bg-white/40">
                <div className="flex items-center gap-3 text-indigo-700">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">AI Expert Analysis</CardTitle>
                    <CardDescription className="text-indigo-600/70 font-medium">Powered by Advanced Machine Learning</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 pt-8 relative z-10">
                <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white">
                  <h4 className="text-sm font-bold tracking-wider text-indigo-900 uppercase mb-3">Executive Summary</h4>
                  <p className="text-slate-700 leading-relaxed text-lg">{analysis.executive_summary}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysis.plan_analysis?.map((plan, idx) => (
                    <motion.div whileHover={{ y: -4 }} key={idx} className="bg-white rounded-xl p-6 border border-indigo-100/50 shadow-sm transition-all hover:shadow-md cursor-default">
                      <h5 className="font-bold text-xl text-indigo-950 mb-4 pb-2 border-b border-slate-100">{plan.plan_name}</h5>
                      <div className="space-y-5">
                        <div>
                          <h6 className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Strengths
                          </h6>
                          <ul className="space-y-2">
                            {plan.pros?.map((pro, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-2 shrink-0"></span>
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Considerations
                          </h6>
                          <ul className="space-y-2">
                            {plan.cons?.map((con, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-2 shrink-0"></span>
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl p-6 border border-slate-100 shadow-sm">
                    <h4 className="text-sm font-bold tracking-wider text-slate-900 uppercase mb-4">Actionable Steps</h4>
                    <ul className="space-y-4">
                      {analysis.actionable_steps?.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-slate-700">
                          <div className="h-6 w-6 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</div>
                          <span className="leading-relaxed text-sm">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-xl p-8 text-white shadow-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full"></div>
                    <h4 className="font-bold text-lg mb-4 flex items-center gap-2 text-indigo-200 relative z-10">
                      <Target className="h-5 w-5" /> Final Recommendation
                    </h4>
                    <p className="text-slate-200 leading-relaxed text-base relative z-10">
                      {analysis.final_recommendation}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {planList.map((plan, idx) => {
            const allocationData = plan.allocation ? Object.entries(plan.allocation).map(([key, value]) => ({ name: key, value })) : [];

            return (
              <motion.div variants={itemVariants} key={idx} className="h-full">
                <Card className="h-full border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 rounded-t-2xl pb-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl text-slate-900 font-extrabold">{plan.name || plan.type || `Plan ${idx + 1}`}</CardTitle>
                        <CardDescription className="mt-1.5 flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Goal:</span>
                          <span className="font-medium text-slate-700">{plan.financial_goal}</span>
                        </CardDescription>
                      </div>
                      <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-indigo-700 shadow-sm flex items-center gap-1">
                        {plan.time_horizon_years} Years
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6 flex-1 flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                        <div className="flex items-center gap-2 text-indigo-600 mb-3">
                          <div className="p-1.5 bg-white rounded-md shadow-sm"><TrendingUp className="h-4 w-4" /></div>
                          <span className="text-xs font-bold uppercase tracking-wider">Return</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900">{plan.expected_annual_return_percent}% <span className="text-sm font-semibold text-slate-500">p.a.</span></div>
                      </div>
                      <div className="bg-amber-50/50 rounded-xl p-5 border border-amber-100">
                        <div className="flex items-center gap-2 text-amber-600 mb-3">
                          <div className="p-1.5 bg-white rounded-md shadow-sm"><AlertTriangle className="h-4 w-4" /></div>
                          <span className="text-xs font-bold uppercase tracking-wider">Volatility</span>
                        </div>
                        <div className="text-3xl font-extrabold text-slate-900">{plan.expected_volatility_percent}%</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100 flex flex-col justify-between">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 text-emerald-700 mb-2">
                            <Target className="h-5 w-5" />
                            <span className="text-sm font-bold">Required Monthly Investment</span>
                          </div>
                          <div className="text-4xl font-extrabold text-emerald-700">
                            ₹{plan.required_monthly_investment?.toLocaleString() || 0}
                          </div>
                        </div>
                      </div>

                      {/* Budget Affordability Intelligence */}
                      {metrics.monthly_savings != null && (
                        Number(metrics.monthly_savings) >= Number(plan.required_monthly_investment || 0) ? (
                          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-white/80 px-3.5 py-2 rounded-lg border border-emerald-200 shadow-sm">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                            <span>✓ Fits your monthly savings (₹{Number(metrics.monthly_savings).toLocaleString()}/mo available)</span>
                          </div>
                        ) : (
                          <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-amber-800 bg-white/80 px-3.5 py-2 rounded-lg border border-amber-200 shadow-sm">
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>⚠️ Exceeds current savings by ₹{Math.round(Number(plan.required_monthly_investment || 0) - Number(metrics.monthly_savings)).toLocaleString()}/mo</span>
                          </div>
                        )
                      )}
                    </div>

                    <div className="mt-2 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-6 border-b border-slate-100 pb-2">
                        <Briefcase className="h-4 w-4 text-indigo-500" /> Asset Allocation
                      </h4>
                      {allocationData.length > 0 ? (
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={allocationData}
                                cx="50%"
                                cy="50%"
                                innerRadius={65}
                                outerRadius={85}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                                stroke="none"
                              >
                                {allocationData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="cursor-pointer hover:opacity-80 transition-opacity" />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value}%`} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-40 flex items-center justify-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                          No allocation data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {planList.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-slate-200 shadow-sm mt-4">
              <CardHeader className="border-b border-slate-100 pb-6">
                <CardTitle className="text-xl font-bold">Growth Projection</CardTitle>
                <CardDescription>Estimated portfolio value over time based on monthly investments and expected returns.</CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-96 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value) => `₹${(value/100000).toFixed(1)}L`}
                        dx={-10}
                      />
                      <Tooltip 
                        formatter={(value) => `₹${value.toLocaleString()}`}
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend wrapperStyle={{ paddingTop: '24px', fontSize: '14px', fontWeight: 500 }} iconType="circle" />
                      {planList.map((plan, idx) => (
                        <Bar 
                          key={idx} 
                          dataKey={plan.name || plan.type} 
                          fill={COLORS[idx % COLORS.length]} 
                          radius={[6, 6, 0, 0]}
                          maxBarSize={40}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        {/* ── INVESTMENT COMPARISON SECTION ── */}
        <InvestmentComparisonSection
          planReturn={planList[0]?.expected_annual_return_percent ?? 10}
          planRisk={planList[0]?.expected_volatility_percent ?? 20}
          planName={planList[0]?.name || planList[0]?.type || "Balance Plan"}
        />
      </motion.div>
    </div>
  );
};
