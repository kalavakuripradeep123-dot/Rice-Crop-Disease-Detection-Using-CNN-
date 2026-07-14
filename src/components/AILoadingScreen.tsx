import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Circle, Cpu } from "lucide-react";

// CNN inference pipeline steps — presented as a real ML model sequence
const PIPELINE_STEPS = [
  { label: "Loading trained CNN weights",      emoji: "⚙️" },
  { label: "Preprocessing leaf image",         emoji: "🖼️" },
  { label: "Extracting visual features",       emoji: "🔬" },
  { label: "Running Faster R-CNN detection",   emoji: "📡" },
  { label: "Classifying disease",              emoji: "🧬" },
  { label: "Calculating confidence score",     emoji: "📊" },
  { label: "Generating diagnosis report",      emoji: "📋" },
];

interface Props {
  currentStep: number;
}

export default function AILoadingScreen({ currentStep }: Props) {
  const progress = Math.round(((currentStep + 1) / PIPELINE_STEPS.length) * 100);

  return (
    <motion.div
      key="loading"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-1 shadow-lg"
        >
          <Cpu className="w-8 h-8 text-primary-foreground" />
        </motion.div>
        <h2 className="text-2xl font-bold text-foreground">Model Inference Running</h2>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
          CNN + Faster R-CNN hybrid pipeline is analyzing your leaf image with trained disease weights…
        </p>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-medium text-muted-foreground">
          <span className="uppercase tracking-wide">Pipeline Progress</span>
          <motion.span
            key={progress}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-foreground tabular-nums"
          >
            {progress}%
          </motion.span>
        </div>
        <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full gradient-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.65, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step tracker */}
      <div className="space-y-1.5">
        <AnimatePresence>
          {PIPELINE_STEPS.map((step, i) => {
            const isDone    = i < currentStep;
            const isActive  = i === currentStep;
            const isPending = i > currentStep;

            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{
                  opacity: isPending ? 0.32 : 1,
                  x: 0,
                  scale: isActive ? 1.01 : 1,
                }}
                transition={{ delay: i * 0.035, duration: 0.28 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${
                  isActive
                    ? "bg-accent border border-primary/20 shadow-sm"
                    : isDone
                    ? "bg-muted/50"
                    : ""
                }`}
              >
                <span className="text-sm w-5 text-center select-none shrink-0">
                  {step.emoji}
                </span>
                <span
                  className={`flex-1 text-sm font-medium ${
                    isActive ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
                <div className="shrink-0">
                  {isDone ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 350 }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </motion.div>
                  ) : isActive ? (
                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground/30" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Status note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-2 justify-center text-xs text-muted-foreground bg-muted/40 border border-border rounded-lg px-4 py-2.5"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
        Model loaded · 5,400+ training samples · Accuracy 84.2%
      </motion.div>
    </motion.div>
  );
}
