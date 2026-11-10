# AI Semester Orchestrator
> **Cloud Computing Final Project** — A Cloud-Native Multi-Agent Academic Planning & RAG Platform deployed on **Microsoft Azure** and **Vercel**.

[![Deploy Backend to Azure Web App](https://github.com/AbinashIIITB/ai-semester-orchestrator/actions/workflows/deploy-azure.yml/badge.svg)](https://github.com/AbinashIIITB/ai-semester-orchestrator/actions/workflows/deploy-azure.yml)

---

## 🌐 Live Cloud Deployment
- **Frontend Web Application (Vercel)**: [https://aisemester-web.vercel.app](https://aisemester-web.vercel.app)
- **Backend Health Check (Azure Web App)**: `https://aisemester-app-21335.azurewebsites.net/health`
- **Interactive API Documentation (Swagger)**: `https://aisemester-app-21335.azurewebsites.net/docs`

---

## 🏗️ Cloud System Architecture

The project implements a decoupled three-tier cloud architecture:
1. **Presentation Tier (Vercel Global Edge CDN)**: Next.js 16 App Router interface providing instant global SSL termination, edge caching, and interactive curriculum synthesis.
2. **Cloud Application Tier (Microsoft Azure)**: Containerized asynchronous Python FastAPI service running on Azure App Service / Container Apps (`aisemester-app-21335`), packaged via Azure Container Registry (ACR).
3. **Data & AI Tier (PostgreSQL + pgvector & OpenAI)**: Relational semester schedules and 1536-dimensional vector embeddings stored with `pgvector` indexing; integrated with OpenAI GPT-4o for multi-agent reasoning.
4. **DevOps & CI/CD Pipeline (GitHub Actions + OIDC)**: Automated Docker container build and push to Azure Container Registry using secretless OpenID Connect (OIDC) federated credentials.

Architecture diagrams are located in the [`Architecture_Diagrams/`](./Architecture_Diagrams) directory:
- [Cloud System Architecture (SVG)](./Architecture_Diagrams/cloud_computing_architecture.svg)
- [Multi-Agent Pipeline Architecture (SVG)](./Architecture_Diagrams/multi_agent_pipeline_architecture.svg)

---

## 📂 Repository Structure

```
ai-semester-orchestrator/
├── .github/workflows/
│   └── deploy-azure.yml          # GitHub Actions CI/CD to Azure via OIDC
├── Architecture_Diagrams/
│   ├── cloud_computing_architecture.svg
│   └── multi_agent_pipeline_architecture.svg
├── backend/
│   ├── app/
│   │   ├── agents/               # LangGraph multi-agent orchestration
│   │   │   ├── extraction.py     # PDF syllabus & calendar extractor
│   │   │   ├── scheduler.py      # Collision-free semester scheduler
│   │   │   ├── retrieval.py      # Vector similarity search agent
│   │   │   ├── generator.py      # Study guide & quiz synthesizer
│   │   │   ├── quality_control.py# Schema & grounding validator
│   │   │   └── graph.py          # State graph definition
│   │   ├── api/                  # FastAPI routers (/upload, /roadmap, /weekly-prep)
│   │   ├── models/               # SQLAlchemy ORM models (semesters, courses, notes)
│   │   ├── services/             # PDF parser, LLM client, vector embeddings
│   │   ├── config.py             # App settings & CORS configuration
│   │   ├── database.py           # Async database connection pool
│   │   └── main.py               # FastAPI application entrypoint & /health probe
│   ├── migrations/               # SQL migrations with pgvector extension setup
│   ├── Dockerfile                # Production Docker container definition
│   ├── docker-compose.yml        # Multi-container orchestration (FastAPI + pgvector)
│   ├── deploy.ps1                # Azure CLI automation deployment script
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/                  # Next.js App Router (layout, page, styles)
│   │   ├── components/           # UploadForm, RoadmapTable, WeeklyQuiz
│   │   ├── lib/                  # mockData synthesis engine & fallback logic
│   │   └── types/                # TypeScript interface declarations
│   └── package.json              # Frontend dependencies
├── test_pdfs/                    # Sample academic calendar, syllabus, and lecture notes
├── generate_test_pdfs.py         # Utility script to generate synthetic test PDFs
├── Project_Report.md             # Complete Academic Project Report
├── 10_Minute_Presentation_Video_Script.md # Presentation script for 3 students
└── README.md                     # Instructions for execution & setup
```

---

## 🚀 Instructions for Execution

### Option 1: Running with Docker Compose (Recommended Local Stack)
To run the complete containerized stack (PostgreSQL with `pgvector` and FastAPI backend):

1. **Clone the repository**:
   ```bash
   git clone https://github.com/AbinashIIITB/ai-semester-orchestrator.git
   cd ai-semester-orchestrator/backend
   ```

2. **Configure Environment Variables**:
   ```bash
   cp .env.example .env
   # Add your OPENAI_API_KEY inside .env
   ```

3. **Start Containers**:
   ```bash
   docker-compose up --build
   ```
   * Backend will be live at `http://localhost:8000`
   * Health check is at `http://localhost:8000/health`
   * Swagger docs are at `http://localhost:8000/docs`

4. **Launch Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   * Open `http://localhost:3000` in your web browser.

---

### Option 2: Running Without Docker (Manual Execution)

#### Backend Setup:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

---

### Option 3: Deploying to Microsoft Azure

1. **Authenticate with Azure CLI**:
   ```bash
   az login
   ```

2. **Deploy via PowerShell Script**:
   ```powershell
   ./backend/deploy.ps1 -ResourceGroup "aisemester-rg" -Location "eastus" -AcrName "aisemesteracr"
   ```

3. **Deploy via GitHub Actions**:
   Any push to the `main` branch modifying `backend/**` automatically triggers `.github/workflows/deploy-azure.yml`, building the image on Azure Container Registry and updating the Azure Web App with zero downtime.

---

## 👥 Group Members & Contributions
**Presented by**:
- **B123007 Abinash Mohanty**: Project conception, three-tier cloud architecture design, Next.js frontend engineering & Vercel edge deployment, and multi-agent workflow integration.
- **B123018 Anil Paliwal**: Backend containerization (Docker), Azure Container Registry (ACR), Infrastructure as Code (`deploy.ps1`), and automated GitHub Actions CI/CD with secretless OIDC authentication.
- **B123077 Namrata Kala**: Cloud PostgreSQL database with `pgvector` indexing, semantic RAG vector retrieval, Quality Control agent validation, performance benchmarks, and live demonstration.

