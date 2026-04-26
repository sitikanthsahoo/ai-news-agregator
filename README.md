# The Chronicle: AI-Powered News Aggregator

An intelligent news platform that aggregates global stories, performs real-time sentiment analysis, and generates AI-driven summaries. Built as a high-performance full-stack application with a newspaper-inspired brutalist aesthetic.

![Chronicle HQ](/frontend/public/chronicle_hq_about_1777180944647.png)

## 🌟 Key Features

- **AI Synthesis:** Automatically generates 3-point bulleted summaries for articles using HuggingFace Transformers (`DistilBART`).
- **Sentiment Analysis:** Real-time classification of news sentiment (Positive, Negative, Neutral).
- **Personalized Feed:** Recommendation engine based on user reading history and category preferences.
- **Live Dispatch:** Real-time news ticker and live feed powered by WebSockets.
- **Deep Analytics:** Comprehensive dashboard visualizing publication trends, category distribution, and sentiment metrics.
- **Brutalist UI:** A unique, responsive "Modern Newspaper" design system with Light/Dark mode support.
- **Enterprise DB:** Powered by Oracle Database for robust data persistence.

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Tailwind CSS 4.0
- **State Management:** React Hooks
- **Icons:** Material Symbols

### Backend
- **Framework:** FastAPI (Python 3.10+)
- **Database:** Oracle Database (via `oracledb` and SQLAlchemy)
- **AI Models:** HuggingFace `transformers` (NLP Pipeline)
- **Real-time:** WebSockets for live news broadcasting
- **Authentication:** JWT (JSON Web Tokens) with Secure Storage

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Oracle Instant Client (configured for `oracledb` thick mode if necessary)

### Backend Setup
1. Navigate to the root directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Configure environment variables in `.env`:
   ```env
   ORACLE_DB_URL=oracle+oracledb://username:password@localhost:1521/?service_name=XEPDB1
   SECRET_KEY=your_secure_secret_key
   NEWS_API_KEY=your_newsapi_key
   ```
4. Run the server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to `frontend/`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📊 Project Structure

```text
├── app/                  # FastAPI Backend
│   ├── models/           # SQLAlchemy Data Models
│   ├── routes/           # API Endpoints (Auth, News, AI, etc.)
│   ├── services/         # Business Logic & AI Processing
│   └── main.py           # Application Entry Point
├── frontend/             # Next.js Frontend
│   ├── src/app/          # App Router Pages
│   ├── src/components/   # Reusable UI Components
│   └── public/           # Static Assets
└── verify_phase3.py      # Verification Scripts
```

## 📝 License
This project was developed for an internship portfolio. Feel free to use and modify for educational purposes.
