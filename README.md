# 🌾 RiceScan AI – Rice Disease Classification API

RiceScan AI is a FastAPI-based backend that detects rice leaf diseases from uploaded images using Google's Gemini AI model. The API analyzes a rice leaf image and returns the predicted disease along with confidence, cause, precautions, and treatment recommendations.

---

## Features

- Rice leaf disease detection
- AI-powered disease prediction using Gemini
- REST API built with FastAPI
- Image upload support
- JSON response
- CORS enabled
- Health check endpoint

---

## Tech Stack

- Python 3.12+
- FastAPI
- Google Gemini API
- Python Dotenv
- Uvicorn

---

## Project Structure

```
RiceScan-AI/
│── main.py
│── inference_engine.py
│── requirements.txt
│── .env
│── .env.example
│── .gitignore
└── README.md
```

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/RiceScan-AI.git
cd RiceScan-AI
```

### 2. Create a virtual environment

Windows

```bash
python -m venv venv
venv\Scripts\activate
```

Linux / macOS

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## Environment Variables

Create a `.env` file.

```env
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
```

---

## Run the Application

```bash
uvicorn main:app --reload
```

The API will start at

```
http://127.0.0.1:8000
```

---

## API Endpoints

### Home

```
GET /
```

Response

```json
{
  "service": "RiceScan AI Classification API",
  "version": "1.0.0",
  "status": "operational"
}
```

---

### Health Check

```
GET /health
```

Response

```json
{
  "status": "ok"
}
```

---

### Predict Disease

```
POST /predict
```

Upload a rice leaf image using **multipart/form-data**.

Example using curl

```bash
curl -X POST \
-F "file=@rice_leaf.jpg" \
http://127.0.0.1:8000/predict
```

Example Response

```json
{
  "disease": "Rice Blast",
  "confidence": 94,
  "cause": "Fungal infection caused by Magnaporthe oryzae.",
  "precautions": "Use disease-free seeds and avoid excessive nitrogen fertilizer.",
  "solution": "Apply recommended fungicides and remove infected plants."
}
```

---

## API Documentation

Swagger UI

```
http://127.0.0.1:8000/docs
```

ReDoc

```
http://127.0.0.1:8000/redoc
```

---

## Dependencies

- FastAPI
- Uvicorn
- Google GenAI SDK
- Python Dotenv
- Python Multipart

---

## Future Improvements

- CNN-based custom disease classification model
- Support multiple crop diseases
- User authentication
- Disease history storage
- Mobile application integration
- Deployment on AWS or Render

---

## License

This project is developed for educational and research purposes.

---

## Author

**Abhinay Yendoti**

B.Tech – Artificial Intelligence & Machine Learning

Vel Tech Rangarajan Dr. Sagunthala R&D Institute of Science and Technology
