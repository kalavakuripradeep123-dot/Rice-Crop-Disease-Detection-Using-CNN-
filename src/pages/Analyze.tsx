import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, ScanSearch, Leaf, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { runInference } from "@/lib/prediction_service";
import { useToast } from "@/hooks/use-toast";
import AILoadingScreen from "@/components/AILoadingScreen";

// 7 steps must match AILoadingScreen's PIPELINE_STEPS length
const TOTAL_STEPS = 7;

const Analyze = () => {
  const [image, setImage]       = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!getUser()) navigate("/");
  }, [navigate]);

  const readFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, or WEBP image.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Maximum allowed size is 10 MB.", variant: "destructive" });
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) readFile(file);
  }, []);

  const startAnalysis = async () => {
    if (!image) return;
    setAnalyzing(true);
    setCurrentStep(0);

    // Fire inference API call in parallel with step animation
    const inferencePromise = runInference(image);

    // Animate through steps: ~900 ms per step × 7 = ~6.3 s total
    await new Promise<void>((resolve) => {
      let step = 0;
      const timer = setInterval(() => {
        step++;
        if (step >= TOTAL_STEPS) {
          clearInterval(timer);
          resolve();
        } else {
          setCurrentStep(step);
        }
      }, 900);
    });

    const { result, usingFallback } = await inferencePromise;

    if (usingFallback) {
      toast({
        title: "Backend offline — demo mode",
        description: "Inference server not detected. Displaying pre-loaded model results.",
        variant: "destructive",
      });
    }

    navigate("/results", { state: { result, image } });
  };

  const resetImage = () => { setImage(null); setFileName(""); };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">RiceScan AI — Image Analysis</span>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {!analyzing ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-2xl font-bold text-foreground">Upload Rice Leaf Image</h1>
                <p className="text-muted-foreground mt-1 text-sm">
                  The CNN pipeline will classify the disease from visual leaf features
                </p>
              </div>

              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onClick={() => !image && document.getElementById("file-input")?.click()}
                className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 ${
                  dragging
                    ? "border-primary bg-accent/40 scale-[1.01]"
                    : image
                    ? "border-primary/30 bg-accent/10"
                    : "border-border hover:border-primary/50 hover:bg-accent/20 cursor-pointer"
                }`}
              >
                {image ? (
                  <div className="p-4 space-y-3">
                    <motion.img
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      src={image}
                      alt="Uploaded leaf"
                      className="w-full max-h-72 object-contain rounded-xl mx-auto"
                    />
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs text-muted-foreground truncate max-w-[220px]">{fileName}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); resetImage(); }}
                        className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-16 px-8 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto flex items-center justify-center shadow-lg">
                      <Upload className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Drag & drop or click to upload</p>
                      <p className="text-sm text-muted-foreground mt-1">JPG · PNG · WEBP — max 10 MB</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center pt-1">
                      {["Rice Blast", "Brown Spot", "Bacterial Blight", "Healthy"].map((tag) => (
                        <span key={tag} className="text-xs bg-accent text-accent-foreground px-2.5 py-1 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <input
                id="file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && readFile(e.target.files[0])}
              />

              {image && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  <Button variant="outline" onClick={resetImage} className="flex-1">
                    Change Image
                  </Button>
                  <Button
                    id="run-inference-btn"
                    onClick={startAnalysis}
                    className="flex-1 gradient-primary text-primary-foreground font-semibold shadow-md hover:shadow-lg hover:scale-[1.02] transition-all"
                  >
                    <ScanSearch className="w-4 h-4 mr-2" />
                    Run Inference
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <AILoadingScreen currentStep={currentStep} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Analyze;
