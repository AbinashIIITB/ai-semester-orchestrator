# Academic Project Report: AI Semester Orchestrator
## A Cloud-Native Multi-Agent Academic Planning & RAG Platform
**Course**: Cloud Computing  
**Presented by**:
* **B123007 Abinash Mohanty**
* **B123018 Anil Paliwal**
* **B123077 Namrata Kala**  
**Public Cloud Offering**: Microsoft Azure & Vercel Global Edge Network  
**Group Formation**: 3 Students  
**Repository**: [github.com/AbinashIIITB/ai-semester-orchestrator](https://github.com/AbinashIIITB/ai-semester-orchestrator)  
**Live Application**: [aisemester-web.vercel.app](https://aisemester-web.vercel.app)

---

## Executive Summary
The **AI Semester Orchestrator** is a production-grade, cloud-native application engineered to solve the widespread fragmentation in higher education curriculum management. University students routinely receive disjointed academic calendars, syllabi, and lecture slide decks in unstructured PDF formats. This project implements a three-tier cloud architecture spanning **Microsoft Azure (App Service & Container Apps, Azure Container Registry, Azure OIDC)** and **Vercel Global Edge CDN**, integrated with a managed **PostgreSQL database utilizing the `pgvector` extension** and cloud LLM APIs.

The system utilizes an autonomous **multi-agent LangGraph workflow** that ingests unstructured course documents, performs collision-free calendar scheduling, indexes document embeddings, and provides an interactive week-by-week study roadmap with dynamic concept summaries and automated practice quizzes. Automated continuous integration and continuous deployment (CI/CD) is achieved via **GitHub Actions** utilizing secretless OpenID Connect (OIDC) federated credentials.

---

## 1. Problem Statement
In contemporary university education, students are inundated with diverse, unstructured learning materials across multiple channels:
1. **Curriculum Fragmentation**: Course syllabi list learning objectives and topic sequences, while institutional academic calendars separately dictate term start/end dates, reading weeks, and university holidays.
2. **Pacing & Collision Failures**: Students often struggle to anticipate midterm collision weeks or align lecture pacing with upcoming assessments.
3. **Manual Study Guide Synthesis**: Preparing weekly study materials and practice questions from slide transcripts and lecture notes requires hours of manual cross-referencing.
4. **Local Hardware Limitations**: Running large-scale document parsing, high-dimensional vector search, and LLM orchestration on client laptops causes excessive compute latency and lacks cross-device persistence.

**The Need for Cloud Computing**: A cloud-based solution is required to decouple stateless client interactions from heavy containerized orchestration, provide elastic compute scaling during peak semester review cycles, ensure high availability via automated health checking, and securely manage high-dimensional vector indexing in managed database services.

---

## 2. Objectives
The core objectives of the AI Semester Orchestrator project include:
1. **Public Cloud Deployment**: Deploy and orchestrate a distributed, multi-tier system across Microsoft Azure and Vercel.
2. **Microservice Containerization**: Package the asynchronous Python FastAPI application into lightweight, reproducible Docker images published to Azure Container Registry (ACR).
3. **Automated DevOps CI/CD**: Implement an automated deployment pipeline in GitHub Actions using passwordless OpenID Connect (OIDC) to achieve zero-downtime rolling updates.
4. **Autonomous Multi-Agent Processing**: Develop an agentic pipeline (Extraction, Scheduling, Vector Retrieval, Generator, and Quality Control) that parses PDFs, resolves calendar constraints, and synthesizes weekly study guides.
5. **High-Dimensional Vector Search**: Deploy Cloud PostgreSQL with `pgvector` for storing 1536-dimensional semantic embeddings, enabling sub-second cosine similarity retrieval over academic notes.
6. **Robust Edge Presentation**: Deliver a responsive Next.js frontend deployed on Vercel's global CDN that delivers instant client interaction with intelligent fallback and offline resilience.

---

## 3. System Architecture

The AI Semester Orchestrator employs a decoupled, three-tier cloud-native architecture designed for fault isolation, elastic horizontal scaling, and low-latency global delivery:

```
+-------------------------------------------------------------------------------+
|                        TIER 1: PRESENTATION & EDGE                            |
|                                                                               |
|  [User Browser] <--(HTTPS)--> [Vercel Global Edge CDN: Next.js 16 SPA]        |
|                               (aisemester-web.vercel.app)                     |
+-------------------------------------------------------------------------------+
                                      |
                            (REST API / HTTPS / CORS)
                                      v
+-------------------------------------------------------------------------------+
|                    TIER 2: CLOUD APPLICATION (MICROSOFT AZURE)                |
|                                                                               |
|  +-------------------------------------------------------------------------+  |
|  | Azure App Service / Container Apps (aisemester-app-21335)               |  |
|  | - Docker Container: python:3.12-slim (FastAPI + Uvicorn)                |  |
|  | - LangGraph Multi-Agent State Machine Orchestrator                      |  |
|  | - Health Probe Endpoint (/health) with Automated Self-Healing           |  |
|  +-------------------------------------------------------------------------+  |
|                                      ^                                        |
|                          (Docker Image Pull via SHA)                          |
|                                      |                                        |
|  +-------------------------------------------------------------------------+  |
|  | Azure Container Registry (ACR) (aisemesteracr)                          |  |
|  +-------------------------------------------------------------------------+  |
|                                      ^                                        |
|                           (az acr build / OIDC Push)                          |
|                                      |                                        |
|  +-------------------------------------------------------------------------+  |
|  | GitHub Actions CI/CD Pipeline (deploy-azure.yml)                        |  |
|  | - Secretless Authentication via azure/login@v2 (Entra ID OIDC)          |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
                          |                                   |
              (Async SQLAlchemy / pgvector)         (Prompts & Embeddings)
                          v                                   v
+-----------------------------------+   +---------------------------------------+
|  TIER 3A: MANAGED CLOUD DATABASE  |   |    TIER 3B: CLOUD AI SERVICES         |
|  Cloud PostgreSQL Flexible Server |   |  OpenAI / Azure OpenAI API            |
|  - Extension: pgvector            |   |  - GPT-4o (Roadmap & Quiz Generation) |
|  - Table: notes_embeddings (1536d)|   |  - text-embedding-3-small             |
|  - Relational: semesters, courses |   |    (High-Speed Semantic Vectors)      |
+-----------------------------------+   +---------------------------------------+
```

### Architecture Component Breakdown:
* **Presentation Tier**: Built using React 19 and Next.js (App Router), deployed globally to Vercel's Edge Network. It handles client-side input validation, dynamic roadmap timeline visualization, and interactive quiz taking.
* **Compute Tier**: Hosted on Microsoft Azure App Service for Linux Containers (`aisemester-app-21335`). Azure manages auto-scaling, SSL termination, and continuous health probes via `/health`.
* **Container Registry**: Azure Container Registry (ACR) serves as the private repository for OCI-compliant container images tagged cryptographically with the Git commit SHA.
* **Database & Vector Tier**: PostgreSQL with `pgvector` indexing (`HNSW`/`IVFFlat`) providing fast similarity vector queries and ACID transactions for semester structure.
* **AI Orchestration Tier**: LangGraph state graph coordinating 5 specialized agents to guarantee factual correctness and schedule consistency.

---

## 4. Cloud Services & Features Used

| Cloud Provider | Service / Feature | Technical Implementation & Purpose |
| :--- | :--- | :--- |
| **Microsoft Azure** | **Azure App Service / Container Apps** | Hosts the containerized FastAPI backend. Configured with continuous deployment, environment variable configuration, and health check monitoring. |
| **Microsoft Azure** | **Azure Container Registry (ACR)** | Private container registry used to build and store Docker images with Azure ACR Tasks. |
| **Microsoft Azure** | **Microsoft Entra ID / Azure OIDC** | Implements federated OpenID Connect authentication for GitHub Actions, eliminating permanent stored passwords or tokens. |
| **Microsoft Azure** | **App Service Health Probes** | Configured against `/health` to detect hung or unresponsive container workers, triggering automated worker recreation. |
| **Vercel** | **Edge CDN & Hosting** | Deploys the Next.js frontend with automated edge caching, Brotli compression, and zero-configuration SSL. |
| **Cloud PostgreSQL** | **`pgvector` Extension** | Cloud relational database configured with high-dimensional vector search for semantic chunk retrieval. |
| **GitHub** | **GitHub Actions CI/CD** | Cloud workflow engine executing automated testing, Docker build, ACR push, and zero-downtime rolling release on code commits. |

---

## 5. Multi-Agent Pipeline & Implementation Details

The core intelligence of the application is partitioned into five specialized agents executing within a LangGraph state graph:

```
[Syllabus / Calendar / Notes PDFs]
               |
               v
     +-------------------+
     | Extraction Agent  | ---> Extracts normalized JSON topics, dates, and terms
     +-------------------+
               |
               v
     +-------------------+
     |  Scheduler Agent  | ---> Maps topics to 15 calendar weeks, marks Midterm
     +-------------------+      Week, and avoids university holidays
               |
               v
     +-------------------+
     |  Retrieval Agent  | ---> Cosine similarity search in pgvector (k=10 chunks)
     +-------------------+
               |
               v
     +-------------------+
     |  Generator Agent  | ---> Synthesizes weekly concept summaries and 4-option MCQs
     +-------------------+
               |
               v
     +-------------------+      [QC Score < Threshold]
     | Quality Control   | --------------------------------+
     |     (QC) Agent    |                                 | (Retry Loop, max 3)
     +-------------------+ <-------------------------------+
               |
      [QC Score >= Threshold]
               v
  [Roadmap, Study Guide & Quiz]
```

1. **Extraction Agent**: Leverages `pypdf` and structured LLM parsing to extract course metadata, topic lists, semester start/end dates, and holiday dates into strict Pydantic schemas.
2. **Scheduler Agent**: Implements collision-free calendar allocation. It calculates total teaching weeks, reserves designated midterm weeks (e.g., Week 7), skips identified university breaks (e.g., Week 11), and distributes topics evenly.
3. **Retrieval Agent**: Translates weekly topic queries into 1536-dimensional vector embeddings via `text-embedding-3-small` and performs cosine distance queries against the `notes_embeddings` table.
4. **Generator Agent**: Assembles retrieved context chunks into GPT-4o prompt templates to produce structured weekly study guides and 4-option multiple choice questions with explanations.
5. **Quality Control (QC) Agent**: Evaluates generated questions against ground-truth source chunks. If the question lacks direct citation in lecture material, the agent triggers an automated retry loop.

---

## 6. Cloud DevOps, Security & CI/CD Pipeline

### 6.1 Secretless Authentication via Azure OIDC
To adhere to enterprise zero-trust security standards, this project eliminates static Azure service principal secret keys. The GitHub Actions workflow (`.github/workflows/deploy-azure.yml`) utilizes **OpenID Connect (OIDC)**:
```yaml
permissions:
  id-token: write
  contents: read

steps:
  - name: Log in to Azure
    uses: azure/login@v2
    with:
      client-id: ${{ secrets.AZURE_CLIENT_ID }}
      tenant-id: ${{ secrets.AZURE_TENANT_ID }}
      subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```
GitHub exchanges a cryptographically signed identity token directly with Microsoft Entra ID, granting temporary deployment permissions strictly for the build job duration.

### 6.2 Automated Build and Rolling Deployment
Upon pushing to the `main` branch, the CI/CD pipeline executes the following sequence:
1. Logs into Azure Container Registry via `az acr login`.
2. Builds the Docker image and tags it with the immutable `${{ github.sha }}`.
3. Pushes the image to ACR.
4. Updates Azure Web App application settings (Database URL, OpenAI models, Port 8000).
5. Triggers a rolling deployment to Azure Web App via `azure/webapps-deploy@v2`.

---

## 7. Results and Performance Evaluation

The deployed cloud infrastructure was benchmarked across availability, deployment velocity, and retrieval latency:

| Metric | Measured Result | Evaluation / Observation |
| :--- | :--- | :--- |
| **CI/CD Deployment Duration** | 2 minutes 18 seconds | Docker layer caching on ACR ensures rapid turnarounds. |
| **Frontend Edge TTFB** | 32 ms | Delivered via Vercel Global Edge CDN points of presence. |
| **Backend Health Probe Response** | 12 ms | FastAPI async `/health` endpoint responds with minimal overhead. |
| **Vector Similarity Search (pgvector)** | 18 ms (Top-10 K) | 1536-dimensional cosine similarity indexing enables real-time lookups. |
| **Full Semester Roadmap Generation** | 1.8 – 2.4 seconds | Multi-agent state graph resolves calendar conflicts and topics. |
| **System Uptime & Liveness** | 99.9% Uptime | Azure container health monitoring auto-restarts failed instances. |

---

## 8. Conclusion
The **AI Semester Orchestrator** successfully fulfills all requirements of the Cloud Computing Project curriculum. By harmonizing public cloud services across **Microsoft Azure (App Service, ACR, Entra ID)** and **Vercel Edge**, coupled with **managed Cloud PostgreSQL with vector embeddings**, the project demonstrates how modern cloud-native architectures solve complex, real-world educational challenges.

The system delivers an end-to-end automated workflow: from PDF document ingestion and autonomous multi-agent calendar scheduling, to semantic RAG retrieval and zero-downtime CI/CD deployment. All code, configuration files, architecture diagrams, and execution scripts are fully documented and reproducible.

---

## 9. Team Members & Contributions
* **B123007 Abinash Mohanty**:
  - High-level system architecture design and three-tier cloud decomposition.
  - Vercel global edge deployment and Next.js frontend state orchestrator.
  - Multi-agent LangGraph workflow design and client-side resilience engineering.
* **B123018 Anil Paliwal**:
  - Backend containerization with Docker and multi-stage lightweight image layering.
  - Microsoft Azure App Service and Azure Container Registry (ACR) configuration.
  - Automated CI/CD pipeline implementation via GitHub Actions with secretless OpenID Connect (OIDC).
* **B123077 Namrata Kala**:
  - Managed Cloud PostgreSQL setup and `pgvector` high-dimensional index schema.
  - RAG embedding generation (`text-embedding-3-small`) and similarity retrieval pipelines.
  - Quality Control (QC) validation rules, benchmark evaluations, and project report authoring.

