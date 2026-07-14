import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Leaf, ArrowLeft, BarChart3, AlertTriangle,
  Shield, FlaskConical, ScanSearch, MapPin, Microscope
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DiseaseResult } from "@/lib/diseases";

/* ── Animation variants ─────────────────────────────────────────────────── */
const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ── Severity badge ─────────────────────────────────────────────────────── */
const severityStyle: Record<string, { border: string; text: string; dot: string }> = {
  Low:     { border: "bg-emerald-50 border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
  Moderate:{ border: "bg-amber-50 border-amber-200",     text: "text-amber-700",   dot: "bg-amber-500"   },
  Severe:  { border: "bg-red-50 border-red-200",         text: "text-red-700",     dot: "bg-red-500"     },
  Unknown: { border: "bg-muted border-border",            text: "text-muted-foreground", dot: "bg-muted-foreground" },
};

/* ── Score labels ───────────────────────────────────────────────────────── */
const SCORE_LABELS: Record<string, string> = {
  rice_blast:            "Rice Blast",
  brown_spot:            "Brown Spot",
  bacterial_leaf_blight: "Bacterial Leaf Blight",
  healthy:               "Healthy",
};
function scoreColor(key: string) {
  if (key === "healthy")               return "bg-emerald-500";
  if (key === "rice_blast")            return "bg-orange-500";
  if (key === "brown_spot")            return "bg-amber-500";
  if (key === "bacterial_leaf_blight") return "bg-red-500";
  return "bg-primary";
}

/* ── Animated progress bar ──────────────────────────────────────────────── */
function AnimatedBar({ value, delay = 0, colorClass }: { value: number; delay?: number; colorClass: string }) {
  return (
    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
      <motion.div
        className={`h-full rounded-full ${colorClass}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
        transition={{ duration: 1.05, ease: "easeOut", delay }}
      />
    </div>
  );
}

/* ── List card (Precautions / Treatment) ───────────────────────────────── */
function ListCard({
  icon: Icon,
  title,
  subtitle,
  items,
  accentClass,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  items: string[];
  accentClass: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 p-6 flex flex-col gap-4"
    >
      <div className="flex items-start gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accentClass}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground leading-tight">{title}</h3>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <ul className="space-y-2.5 pl-1">
        {items.map((it, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 + i * 0.07, duration: 0.28 }}
            className="flex items-start gap-2.5 text-sm text-muted-foreground"
          >
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            {it}
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────────────────────── */
const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, image } = (location.state as { result: DiseaseResult; image: string }) || {};

  if (!result) {
    navigate("/dashboard");
    return null;
  }

  const sev    = severityStyle[result.severity] ?? severityStyle.Unknown;
  const isHealthy = result.disease === "Healthy";

  // Confidence bar color
  const confColor =
    result.confidence >= 80 ? "bg-emerald-500" :
    result.confidence >= 55 ? "bg-amber-500"   : "bg-red-500";

  // Affected area bar color
  const areaColor =
    result.affected_area_percent > 50 ? "bg-red-500"    :
    result.affected_area_percent > 20 ? "bg-amber-500"  : "bg-emerald-500";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
                <Leaf className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-foreground">Prediction Results</span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => navigate("/analyze")}
            className="gradient-primary text-primary-foreground font-semibold shadow hover:shadow-md hover:scale-[1.02] transition-all"
          >
            <ScanSearch className="w-4 h-4 mr-1.5" />
            New Analysis
          </Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

          {/* ── Row 1: image + disease summary ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Image panel */}
            <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              <img
                src={image}
                alt="Analyzed rice leaf"
                className="w-full object-contain max-h-72 bg-muted/20"
              />
              <div className="px-4 py-2.5 border-t border-border">
                <p className="text-xs text-muted-foreground">Input image · analyzed by CNN pipeline</p>
              </div>
            </motion.div>

            {/* Disease prediction card */}
            <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border shadow-sm p-6 flex flex-col justify-between">
              <div className="space-y-4">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${sev.border} ${sev.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${sev.dot}`} />
                    {result.severity} Severity
                  </span>
                  {isHealthy && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                      ✓ No Disease Detected
                    </span>
                  )}
                </div>

                {/* Disease name */}
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl gradient-primary flex items-center justify-center shrink-0">
                    <Microscope className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5 uppercase tracking-wide">Disease Prediction</p>
                    <h2 className="text-2xl font-bold text-foreground leading-tight">{result.disease}</h2>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="mt-6 space-y-4">
                {/* Confidence */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5" />
                      Confidence Score
                    </span>
                    <span className="font-bold text-foreground tabular-nums">{result.confidence}%</span>
                  </div>
                  <AnimatedBar value={result.confidence} delay={0.4} colorClass={confColor} />
                </div>

                {/* Affected area */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Affected Leaf Area
                    </span>
                    <span className="font-bold text-foreground tabular-nums">{result.affected_area_percent}%</span>
                  </div>
                  <AnimatedBar value={result.affected_area_percent} delay={0.55} colorClass={areaColor} />
                </div>
              </div>
            </motion.div>
          </div>

          {/* ── Row 2: classification scores ── */}
          <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border shadow-sm p-6">
            <h3 className="font-semibold text-foreground mb-5 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Classification Layer Output
              <span className="text-xs text-muted-foreground font-normal ml-1">— softmax probabilities</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(result.all_scores).map(([key, score], i) => {
                const label     = SCORE_LABELS[key] ?? key;
                const isDetected = result.disease === label;
                return (
                  <div key={key} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className={`font-medium ${isDetected ? "text-foreground" : "text-muted-foreground"}`}>
                        {label}
                        {isDetected && (
                          <span className="ml-2 text-[10px] font-bold text-primary uppercase tracking-wide bg-primary/10 px-1.5 py-0.5 rounded">
                            matched
                          </span>
                        )}
                      </span>
                      <span className="font-bold text-foreground tabular-nums">{score}%</span>
                    </div>
                    <AnimatedBar value={score} delay={0.3 + i * 0.1} colorClass={scoreColor(key)} />
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* ── Row 3: feature analysis ── */}
          {result.feature_based_cause && (
            <motion.div variants={fadeUp} className="bg-card rounded-2xl border border-border shadow-sm p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center shrink-0">
                  <Microscope className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Feature Analysis</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Lesion pattern extracted by detection layer</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-12">
                {result.feature_based_cause}
              </p>
            </motion.div>
          )}

          {/* ── Row 4: precautions + treatment ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ListCard
              icon={Shield}
              title="Precautions"
              subtitle="Preventive agronomic measures"
              items={result.precautions}
              accentClass="bg-blue-50 border border-blue-200 text-blue-600"
            />
            <ListCard
              icon={FlaskConical}
              title="Treatment Recommendation"
              subtitle="Recommended chemical / biological intervention"
              items={result.treatment}
              accentClass="bg-emerald-50 border border-emerald-200 text-emerald-600"
            />
          </div>

          {/* ── Disclaimer ── */}
          <motion.div variants={fadeUp} className="text-center pb-2">
            <p className="text-xs text-muted-foreground">
              Model output is for agricultural guidance only. Consult a certified agronomist for critical crop decisions.
            </p>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
};

export default Results;
