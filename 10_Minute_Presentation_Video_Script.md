# 10-Minute Video Presentation Script & Slide Deck Guide
## Cloud Computing Project: AI Semester Orchestrator
**Group Formation**: 3 Students  
**Target Duration**: 10:00 Minutes  
**Public Cloud Offering**: Microsoft Azure (Application & Container Tier) & Vercel (Edge Presentation Tier)

---

## Group Roles & Timeline Overview

| Speaker | Team Member | Role / Section | Time Allocation | Cumulative Time |
| :--- | :--- | :--- | :--- | :--- |
| **Speaker 1** | **B123007 Abinash Mohanty** | Project Introduction, Problem Statement, Objectives & Cloud System Architecture | 0:00 – 3:15 (3 min 15 s) | 3:15 |
| **Speaker 2** | **B123018 Anil Paliwal** | Cloud Engineering, Containerization (Docker), ACR, CI/CD (GitHub Actions + OIDC) & Security | 3:15 – 6:30 (3 min 15 s) | 6:30 |
| **Speaker 3** | **B123077 Namrata Kala** | Live Application Demonstration, Feature Walkthrough, Cloud Scalability & Conclusion | 6:30 – 10:00 (3 min 30 s) | 10:00 |

---

## Detailed Script & Visual Walkthrough

### Part 1: Introduction, Problem Statement & Cloud Architecture
**Speaker**: **B123007 Abinash Mohanty**  
**Duration**: 0:00 – 3:15 (195 Seconds)

#### [0:00 – 0:45] Slide 1: Title & Group Introduction
* **On Screen**: Slide showing Project Title ("AI Semester Orchestrator: A Cloud-Native Multi-Agent Academic Planning & RAG Platform"), Course Name ("Cloud Computing"), Group Member Names, and Cloud logos (Microsoft Azure, Docker, Vercel, PostgreSQL).
* **Speaker (Abinash Mohanty)**:
  > *"Hello professor and everyone. Welcome to our Cloud Computing final project presentation. Today, our team—consisting of **Abinash Mohanty (B123007)**, **Anil Paliwal (B123018)**, and **Namrata Kala (B123077)**—is proud to present the **AI Semester Orchestrator**.*
  >
  > *In this project, we architected, containerized, and deployed a modern multi-tier cloud application using **Microsoft Azure**, **Vercel Global Edge**, and **managed Cloud PostgreSQL with vector embeddings**. Over the next 10 minutes, we will walk you through the real-world problem we are solving, our distributed cloud architecture, our automated DevOps CI/CD pipeline, and a full live demonstration of the deployed system."*

#### [0:45 – 1:45] Slide 2: Problem Statement & Motivation
* **On Screen**: Visual contrasting "Traditional Fragmented Academic Life" (PDF icons scattered, messy calendars, manual syllabus tracking) versus "Cloud-Native Autonomous Orchestration".
* **Speaker (Student 1)**:
  > *"Let's begin with the problem statement. Every semester, university students receive dozens of disparate documents: syllabi with course learning objectives, academic calendars with university holidays and exam schedules, and extensive slide decks or lecture notes.*
  >
  > *Manually synthesizing these documents into a balanced study roadmap is time-consuming and error-prone. Traditional static calendar tools cannot parse curriculum dependencies, cannot detect holiday schedule conflicts automatically, and cannot generate personalized self-evaluation quizzes grounded strictly in lecture material.*
  >
  > *To solve this, our objective was to design a cloud-native platform that ingests unstructured PDF documents, coordinates specialized autonomous AI agents, and delivers an interactive week-by-week curriculum with dynamic study guides and quizzes—all running elastically in the public cloud."*

#### [1:45 – 3:15] Slide 3: Cloud System Architecture Diagram
* **On Screen**: Display `cloud_computing_architecture.svg` highlighting the 3 decoupled tiers: Presentation Tier (Vercel), Application Tier (Microsoft Azure), and Data/AI Tier.
* **Speaker (Student 1)**:
  > *"To ensure high availability, fault tolerance, and independent scalability, we designed a three-tier cloud-native architecture.*
  >
  > *First, at the **Presentation Tier**, our frontend is built with Next.js 16 and deployed to **Vercel's Global Edge Network**. This gives us instant SSL termination, global edge caching, and lightning-fast sub-50-millisecond response times worldwide.*
  >
  > *Second, at the **Cloud Application Tier**, our backend microservice is fully containerized with Docker and hosted on **Microsoft Azure App Service and Container Apps**. The backend runs an asynchronous FastAPI server powered by Uvicorn, exposing structured REST endpoints and an automated health probe at `/health` for cloud liveness checks.*
  >
  > *Third, at the **Data and AI Tier**, we leverage a managed **PostgreSQL** instance enhanced with the **pgvector** extension to store high-dimensional 1536-dimensional embeddings alongside structured course tables. For generative intelligence, we integrate with cloud LLMs—OpenAI GPT-4o and text-embedding-3-small—to power semantic retrieval and automated curriculum scheduling.*
  >
  > *Now, I will hand over to **Anil Paliwal**, who will explain our containerization, cloud deployment pipeline, and DevOps security."*

---

### Part 2: Cloud Implementation, Containerization & CI/CD DevOps
**Speaker**: **B123018 Anil Paliwal**  
**Duration**: 3:15 – 6:30 (195 Seconds)

#### [3:15 – 4:15] Slide 4: Containerization with Docker & Multi-Agent Design
* **On Screen**: Display `backend/Dockerfile`, `backend/docker-compose.yml`, and `multi_agent_pipeline_architecture.svg`.
* **Speaker (Anil Paliwal)**:
  > *"Thank you, Abinash. As software engineers moving to the cloud, our primary principle was reproducibility and microservice isolation.*
  >
  > *In our backend, we containerized the entire Python 3.12 application using a lightweight Debian-slim base image. We separated dependencies into multi-stage layers so that cached wheel builds speed up our deployment cycle. For local development and integration testing, we configured Docker Compose to orchestrate our FastAPI service alongside a local pgvector PostgreSQL container.*
  >
  > *Inside the container, we built a LangGraph state machine composed of four specialized agents: an **Extraction Agent** that extracts academic terms and dates; a **Scheduler Agent** that maps topics across 15 calendar weeks while avoiding holidays; a **Retrieval Agent** that executes cosine similarity queries over vector chunks; and a **Quality Control Agent** that verifies questions for semantic grounding and zero hallucination before serving them to the student."*

#### [4:15 – 5:30] Slide 5 / Screen Share: Azure Cloud Services & Azure Container Registry
* **On Screen**: Screen share showing Azure Portal: Resource Group `aisemester-rg`, Azure Container Registry `aisemesteracr`, and App Service `aisemester-app-21335`.
* **Speaker (Student 2)**:
  > *"Now let's examine how this lives in Microsoft Azure. On my screen, you can see our Azure Resource Group.*
  >
  > *We utilize **Azure Container Registry (ACR)** as our private, enterprise-grade Docker image repository. Whenever new code is packaged, ACR Tasks build and store immutable image tags referenced directly by the Git commit SHA.*
  >
  > *Our container image is deployed to **Azure App Service for Containers** under the service name `aisemester-app-21335`. Azure provides automated horizontal scaling based on CPU threshold policies, automated SSL certificates, and managed environment configurations.*
  >
  > *Crucially, we configured Azure's health probe monitoring to poll our `/health` endpoint every 10 seconds. If an instance experiences an unhandled exception or memory saturation, Azure automatically isolates the degraded container, provisions a healthy replacement, and routes incoming traffic with zero downtime."*

#### [5:30 – 6:30] Slide 6: CI/CD Pipeline & Secretless OIDC Authentication
* **On Screen**: Code walkthrough of `.github/workflows/deploy-azure.yml`, showing GitHub Actions pipeline executing `azure/login@v2`, building Docker image, and deploying to Azure.
* **Speaker (Student 2)**:
  > *"To automate operations, we established a production-grade CI/CD pipeline using **GitHub Actions**.*
  >
  > *Security in the cloud is paramount. Rather than storing permanent Azure administrative passwords or publish profile secrets inside GitHub—which represents a major security vulnerability—we implemented **OpenID Connect (OIDC)** federated authentication.*
  >
  > *GitHub Actions requests an ephemeral cryptographic JWT token from Microsoft Entra ID using `azure/login@v2`, allowing secretless authentication. When code is pushed to our main branch, the pipeline automatically checks out code, logs into Azure Container Registry, builds the new Docker tag, pushes the image, updates application settings, and executes zero-downtime deployment.*
  >
  > *Now, I will pass the presentation to **Namrata Kala** for our live application demo and results."*

---

### Part 3: Live Application Demonstration, Cloud Results & Conclusion
**Speaker**: **B123077 Namrata Kala**  
**Duration**: 6:30 – 10:00 (210 Seconds)

#### [6:30 – 8:30] Screen Share: Live End-to-End Demonstration
* **On Screen**: Live browser navigating to `https://aisemester-web.vercel.app`.
* **Speaker (Namrata Kala)**:
  > *"Thank you, Anil. Let's now see the AI Semester Orchestrator in action live on the web at `aisemester-web.vercel.app`.*
  >
  > *Here is our user interface, running globally from edge CDN locations. On the left pane, we have a clear narrative guidance system, and on the right, our configuration interface.*
  >
  > *Notice that we have pre-filled our demo course: **CS301: Cloud Computing & Distributed Systems** for the **Fall 2026** semester. Users can upload their official PDF syllabi, academic calendars, and lecture notes directly into the system, or click our quick-start cloud blueprint.*
  >
  > *We also select our generation preferences: Semester Roadmap, Study Guide, Summary Notes, and Weekly Quiz. Now, let's click **'Generate Materials'**.*
  >
  > [Click Button — show brief loading spinner and transition to RoadmapTable]*
  >
  > *In seconds, the system orchestrates the entire semester! Let's examine what was generated:*
  > * *Week 1 through Week 6 cover foundational topics from Cloud Service Models (IaaS, PaaS, SaaS), Virtualization and Docker, through Cloud Storage, Networking, and Serverless FaaS.*
  > * *Notice **Week 7**! The system recognized the midterm milestone and allocated a dedicated **Midterm Assessment Week** with distributed systems case studies.*
  > * *Look at **Week 11**: The scheduler identified university break dates and marked it as a **Holiday / Break Week**, shifting subsequent curriculum topics smoothly without syllabus truncation.*
  >
  > *Now, let's test the study prep capability. Let's click **'Study Prep →'** on **Week 1: Cloud Overview & Service Models**.*
  >
  > [Click Study Prep → show transition to WeeklyQuiz]*
  >
  > *Here is our synthesized module! Under **'Concepts to Master'**, students get a comprehensive breakdown of the NIST Cloud definition, IaaS vs PaaS vs SaaS, and public versus hybrid deployment topologies.*
  >
  > *Below that is our interactive **Knowledge Check**. Let's answer these questions:*
  > * *Question 1: Which cloud service model delegates OS maintenance while giving developers control of application code? We select **B: Platform as a Service (PaaS)**.*
  > * *Question 2: Which is NOT one of the five essential NIST characteristics? We select **C: Fixed Annual Licensing**.*
  > * *Question 3: How does public cloud alter financial modeling? We select **A: Converts CapEx into variable OpEx**.*
  >
  > *Let's click **'Check Answers'**! As you can see, our score is **3 out of 3**, complete with detailed explanations for each question and direct references back to the syllabus topic!"*

#### [8:30 – 9:30] Slide 7: Results & Cloud Computing Benefits
* **On Screen**: Summary table showing Cloud Metrics:
  * Deployment Time: ~2.5 mins via GitHub Actions
  * Cold Start Recovery: < 15s via Azure App Service
  * Edge Latency: ~35ms via Vercel CDN
  * Vector Search Speed: < 25ms via pgvector indexing
  * Availability: High Availability with automated health recovery
* **Speaker (Student 3)**:
  > *"Reflecting on our cloud computing results, this project demonstrated several key advantages of modern cloud architecture:*
  >
  > *1. **Elasticity and Cost-Efficiency**: By running our compute tier in stateless Docker containers on Azure and our database in managed PostgreSQL, we only pay for active resource usage without maintaining physical servers.*
  > *2. **Fault Tolerance**: The complete decoupling of edge presentation, containerized application logic, and managed database services prevents cascading failures.*
  > *3. **DevOps Velocity**: Automated CI/CD through GitHub Actions with OIDC reduced deployment friction to a single git push, ensuring high software release confidence."*

#### [9:30 – 10:00] Slide 8: Conclusion & Thank You
* **On Screen**: Slide showing "Thank You / Q&A", GitHub Repository link (`github.com/AbinashIIITB/ai-semester-orchestrator`), Live URL (`aisemester-web.vercel.app`), and Team Members.
* **Speaker (Student 3)**:
  > *"In conclusion, the AI Semester Orchestrator successfully demonstrates how public cloud services—Microsoft Azure, Docker, Vercel, and Cloud PostgreSQL—can be harmonized to build an intelligent, scalable, and resilient application.*
  >
  > *All source code, Dockerfiles, GitHub Actions workflows, test PDFs, and detailed documentation are publicly available on our GitHub repository.*
  >
  > *Thank you very much for your time and guidance throughout this Cloud Computing course. We look forward to answering any questions!"*

---
## Video Production Tips for the Group
1. **Screen Recording Tool**: Use **OBS Studio** or **Zoom / Google Meet** with all 3 members on video and screen sharing enabled.
2. **Smooth Transitions**:
   - Student 1 starts screen share with Slides 1–3.
   - Student 2 takes over screen share to show Azure Portal and GitHub Actions workflow.
   - Student 3 takes over screen share to demonstrate the live web app and conclude.
3. **Pacing**: Speak at a steady pace of ~130–140 words per minute to match the 10:00 minute timeline comfortably.

