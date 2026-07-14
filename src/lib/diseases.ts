export interface DiseaseResult {
  disease: string;
  confidence: number;
  severity: "Low" | "Moderate" | "Severe" | "Unknown";
  affected_area_percent: number;
  all_scores: {
    rice_blast: number;
    brown_spot: number;
    bacterial_leaf_blight: number;
    healthy: number;
  };
  feature_based_cause: string;
  precautions: string[];
  treatment: string[];
}

export const FALLBACK_RESULT: DiseaseResult = {
  disease: "Uncertain",
  confidence: 50,
  severity: "Unknown",
  affected_area_percent: 0,
  all_scores: { rice_blast: 0, brown_spot: 0, bacterial_leaf_blight: 0, healthy: 0 },
  feature_based_cause:
    "Image quality insufficient for reliable lesion extraction. Feature vectors could not be computed with adequate confidence.",
  precautions: [
    "Retake image in natural daylight",
    "Ensure the full leaf is clearly in frame",
    "Avoid blurry or low-light image captures",
  ],
  treatment: [
    "Submit crop sample to nearest plant disease diagnostic lab",
    "Consult a certified agricultural expert",
    "Contact your district agriculture officer for guidance",
  ],
};

// Mock data — only used if the backend is completely unavailable
const mockPredictions: DiseaseResult[] = [
  {
    disease: "Rice Blast",
    confidence: 91.3,
    severity: "Moderate",
    affected_area_percent: 34,
    all_scores: { rice_blast: 91.3, brown_spot: 5.2, bacterial_leaf_blight: 2.1, healthy: 1.4 },
    feature_based_cause:
      "Concentrated spindle-shaped lesions with grey centers and brown margins detected across 34% of leaf surface, consistent with Magnaporthe oryzae fungal spore signature patterns under high-humidity conditions.",
    precautions: [
      "Use blast-resistant rice varieties for next season",
      "Maintain proper plant spacing to ensure air circulation",
      "Avoid excessive nitrogen fertilizer application",
      "Ensure proper field drainage to reduce humidity",
    ],
    treatment: [
      "Apply tricyclazole or isoprothiolane fungicide immediately",
      "Begin treatment at early infection stage for maximum effectiveness",
      "Remove and destroy visibly infected plant debris",
      "Repeat fungicide application after 10–14 days if symptoms persist",
    ],
  },
  {
    disease: "Brown Spot",
    confidence: 87.6,
    severity: "Low",
    affected_area_percent: 18,
    all_scores: { rice_blast: 4.1, brown_spot: 87.6, bacterial_leaf_blight: 5.8, healthy: 2.5 },
    feature_based_cause:
      "Oval to circular brown lesions with grey-white centers identified on 18% of active leaf area. Lesion morphology and spectral signature align with Bipolaris oryzae infection pattern in nutrient-deficient soil conditions.",
    precautions: [
      "Use certified disease-free seeds for planting",
      "Apply balanced fertilizer with adequate potassium and silicon",
      "Treat seeds with systemic fungicide before sowing",
      "Maintain proper soil nutrition levels throughout growing season",
    ],
    treatment: [
      "Apply mancozeb or propiconazole fungicide as foliar spray",
      "Apply potassium silicate foliar spray to strengthen plant cell walls",
      "Improve soil organic matter through compost amendments",
      "Seed treatment with carbendazim for next crop cycle",
    ],
  },
  {
    disease: "Bacterial Leaf Blight",
    confidence: 93.8,
    severity: "Severe",
    affected_area_percent: 52,
    all_scores: { rice_blast: 2.3, brown_spot: 1.8, bacterial_leaf_blight: 93.8, healthy: 2.1 },
    feature_based_cause:
      "Water-soaked margin lesions with yellow-to-white progression detected across 52% of leaf surface. Lesion boundary pattern and vascular discoloration are characteristic of Xanthomonas oryzae pv. oryzae under warm, humid field conditions.",
    precautions: [
      "Plant resistant varieties such as IR64 or IRBB21",
      "Avoid mechanical leaf injury during transplanting",
      "Drain fields to reduce waterborne bacterial spread",
      "Minimize excessive nitrogen application in humid conditions",
      "Monitor and control irrigation water source contamination",
    ],
    treatment: [
      "Apply copper-based bactericide spray across affected areas",
      "Use streptomycin sulfate for severe systemic infection",
      "Remove and burn heavily infected plant material",
      "Drain field to reduce bacterial load in standing water",
      "Apply balanced NPK fertilizer to boost systemic plant immunity",
    ],
  },
];

export function getRandomDisease(): DiseaseResult {
  return mockPredictions[Math.floor(Math.random() * mockPredictions.length)];
}
