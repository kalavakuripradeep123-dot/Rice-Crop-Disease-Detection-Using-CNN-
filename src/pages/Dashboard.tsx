import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Leaf, ScanSearch, LogOut, Activity, ShieldCheck, BarChart3, Cpu, Database, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser, logout, User } from "@/lib/auth";

/* ── Model Architecture Card ─────────────────────────────────────────────── */
const MODEL_SPECS = [
  { label: "Architecture",    value: "CNN + Faster R-CNN" },
  { label: "Backbone",        value: "ResNet-50" },
  { label: "Training Images", value: "5,400+" },
  { label: "Accuracy",        value: "84.2%" },
  { label: "Precision",       value: "82.6%" },
  { label: "Recall",          value: "81.9%" },
  { label: "Disease Classes", value: "4" },
  { label: "Framework",       value: "PyTorch 2.x" },
];

const STATS = [
  {
    icon: Activity,
    label: "Detectable Conditions",
    value: "4 Classes",
    desc: "Rice Blast · Brown Spot · BLB · Healthy",
  },
  {
    icon: BarChart3,
    label: "Model Accuracy",
    value: "84.2%",
    desc: "Validated on held-out test set (540 images)",
  },
  {
    icon: ShieldCheck,
    label: "Training Dataset",
    value: "5,400+",
    desc: "Labeled rice leaf images — field + lab conditions",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const u = getUser();
    if (!u) { navigate("/"); return; }
    setUser(u);
  }, [navigate]);

  const handleLogout = () => { logout(); navigate("/"); };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-foreground block leading-tight">RiceScan AI</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Disease Classifier</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">

          {/* ── Welcome ── */}
          <motion.div
            variants={item}
            className="bg-card rounded-2xl border border-border shadow-sm p-8"
          >
            <h1 className="text-3xl font-bold text-foreground">
              Welcome, <span className="text-primary">{user.name}</span>
            </h1>
            <p className="text-muted-foreground mt-2 max-w-lg text-sm leading-relaxed">
              Upload a rice leaf image and the CNN + Faster R-CNN pipeline will classify the disease,
              extract visual features, and return a structured agronomic report.
            </p>
            <Button
              id="start-analysis-btn"
              onClick={() => navigate("/analyze")}
              className="mt-6 gradient-primary text-primary-foreground font-semibold h-12 px-8 text-base shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
            >
              <ScanSearch className="w-5 h-5 mr-2" />
              Start Analysis
            </Button>
          </motion.div>

          {/* ── Stats strip ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STATS.map((s) => (
              <motion.div
                key={s.label}
                variants={item}
                className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{s.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* ── Model Architecture Card ── */}
          <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                <Cpu className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Model Architecture</h2>
                <p className="text-xs text-muted-foreground mt-0.5">CNN + Faster R-CNN Hybrid Pipeline</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MODEL_SPECS.map((spec) => (
                <div
                  key={spec.label}
                  className="bg-muted/50 rounded-xl p-3.5 hover:bg-accent/50 transition-colors"
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{spec.label}</p>
                  <p className="text-sm font-bold text-foreground">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Pipeline visualization */}
            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">Inference Pipeline</p>
              <div className="flex items-center gap-2 flex-wrap">
                {["Image Input", "→", "CNN Feature Extractor", "→", "Region Proposal Network", "→", "RoI Pooling", "→", "Disease Classifier"].map((node, i) => (
                  node === "→" ? (
                    <span key={i} className="text-muted-foreground text-xs">→</span>
                  ) : (
                    <span key={i} className="text-xs font-medium bg-accent text-accent-foreground px-2.5 py-1 rounded-lg">
                      {node}
                    </span>
                  )
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Dataset / Training info ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                  <Database className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-foreground">Training Dataset</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex justify-between"><span>Total images</span><span className="font-semibold text-foreground">5,400</span></li>
                <li className="flex justify-between"><span>Rice Blast samples</span><span className="font-semibold text-foreground">1,440</span></li>
                <li className="flex justify-between"><span>Brown Spot samples</span><span className="font-semibold text-foreground">1,320</span></li>
                <li className="flex justify-between"><span>Bacterial Blight samples</span><span className="font-semibold text-foreground">1,200</span></li>
                <li className="flex justify-between"><span>Healthy samples</span><span className="font-semibold text-foreground">1,440</span></li>
              </ul>
            </motion.div>

            <motion.div variants={item} className="bg-card rounded-2xl border border-border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <Target className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-foreground">Performance Metrics</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex justify-between"><span>Overall Accuracy</span><span className="font-semibold text-foreground">84.2%</span></li>
                <li className="flex justify-between"><span>Macro Precision</span><span className="font-semibold text-foreground">82.6%</span></li>
                <li className="flex justify-between"><span>Macro Recall</span><span className="font-semibold text-foreground">81.9%</span></li>
                <li className="flex justify-between"><span>F1 Score</span><span className="font-semibold text-foreground">82.2%</span></li>
                <li className="flex justify-between"><span>Inference Time</span><span className="font-semibold text-foreground">~1.8 s</span></li>
              </ul>
            </motion.div>
          </div>

        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
