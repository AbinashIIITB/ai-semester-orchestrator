# Cloud Computing Project: Viva Defense & Technical Q&A Guide
## AI Semester Orchestrator
**Presented by**: B123007 Abinash Mohanty, B123018 Anil Paliwal, B123077 Namrata Kala  
**Course**: Cloud Computing  
**Target Audience**: Preparing for Professor / Evaluator Questions during Project Presentation

---

### Q1: Why did you choose a decoupled architecture (Vercel + Azure) instead of hosting everything on a single Azure Virtual Machine (VM)?
* **Target Answer (Abinash Mohanty)**:
  > *"Hosting everything on a single IaaS virtual machine creates a single point of failure and binds our compute, memory, and networking together. If our LLM or vector processing spikes CPU to 100%, user interface requests would be blocked. 
  > 
  > By adopting a decoupled three-tier cloud-native design, we deploy our Next.js frontend to Vercel's Global Edge CDN, giving users sub-50ms Time-to-First-Byte worldwide with automatic SSL termination. Meanwhile, our heavy Python backend runs as an independently scalable Docker container on Azure App Service. This separation of concerns guarantees that compute-intensive agent operations never degrade user interface responsiveness."*

---

### Q2: What is the benefit of Docker containerization in your cloud deployment?
* **Target Answer (Anil Paliwal)**:
  > *"Docker ensures absolute parity between our local development environments and our production cloud instances on Microsoft Azure. By utilizing `python:3.12-slim`, we minimize attack surface, reduce container image size, and leverage multi-stage layer caching in Azure Container Registry (ACR).
  > 
  > Furthermore, containers make our application portable: we can run the identical container image locally via Docker Compose, on Azure App Service, or on Azure Kubernetes Service (AKS) without modifying a single line of application logic."*

---

### Q3: How does Azure handle self-healing and container failures?
* **Target Answer (Anil Paliwal)**:
  > *"We implemented an asynchronous health probe endpoint at `/health` in FastAPI. In Azure App Service, we configured liveness monitoring to ping this endpoint every 10 seconds.
  > 
  > If a worker crashes or experiences an unhandled memory exception, consecutive probe failures trigger Azure's automated orchestrator to isolate the unhealthy container, provision a healthy replacement instance from our ACR image repository, and re-route incoming HTTP traffic with zero downtime to end users."*

---

### Q4: Why did you use GitHub Actions OpenID Connect (OIDC) instead of storing Azure passwords in GitHub Secrets?
* **Target Answer (Anil Paliwal)**:
  > *"Storing long-lived administrative passwords or client secrets in GitHub repositories is a major security anti-pattern and a frequent source of cloud breaches.
  > 
  > We implemented OpenID Connect (OIDC) federated identity using Microsoft Entra ID. GitHub Actions requests a short-lived cryptographic JSON Web Token (JWT) using `azure/login@v2`. Azure validates the token against our configured Federated Identity Credential, granting temporary, least-privilege deployment rights strictly for the duration of the build job. No passwords exist to be leaked or rotated."*

---

### Q5: How does `pgvector` work, and why did you choose it over a dedicated vector database like Pinecone?
* **Target Answer (Namrata Kala)**:
  > *"The `pgvector` extension adds native vector data types and indexing algorithms (such as HNSW and IVFFlat) directly to PostgreSQL. In our project, each chunk of syllabus or lecture note text is converted into a 1536-dimensional embedding using OpenAI's `text-embedding-3-small`.
  > 
  > We chose `pgvector` inside PostgreSQL instead of a separate vector database like Pinecone because it allows us to store both relational data (semester dates, courses, student preferences) and vector embeddings in a single ACID-compliant database. This eliminates dual-database consistency issues and reduces cloud operational costs."*

---

### Q6: Walk us through the LangGraph multi-agent pipeline. What does the Quality Control (QC) agent do?
* **Target Answer (Abinash Mohanty & Namrata Kala)**:
  > *"Our backend uses a LangGraph state graph with five specialized agents:
  > 1. The **Extraction Agent** parses PDFs into structured JSON schemas.
  > 2. The **Scheduler Agent** distributes topics across teaching weeks while avoiding holidays and placing midterms.
  > 3. The **Retrieval Agent** executes cosine similarity searches (k=10 chunks) against `pgvector`.
  > 4. The **Generator Agent** uses GPT-4o to construct weekly concept summaries and four-option MCQs.
  > 5. The **Quality Control Agent** evaluates every generated question against the retrieved lecture context to verify factual grounding. If a question is hallucinated or unsupported by the lecture notes, the QC agent rejects it and triggers an automated loop back to the Retrieval Agent (up to a limit of 3 retries)."*

---

### Q7: How does your scheduler handle calendar constraints like holidays and midterms?
* **Target Answer (Abinash Mohanty)**:
  > *"The Scheduler Agent executes calendar arithmetic. It extracts the semester start and end dates from the calendar PDF to calculate total calendar weeks. It then identifies university holiday dates and cross-references them against lecture days.
  > 
  > If a week contains a holiday (such as Fall Break in Week 11), it marks the week as a break, avoids scheduling new curriculum topics, and shifts downstream topics forward. In addition, it detects the semester midpoint (Week 7) and reserves it specifically for Midterm Assessment and review case studies."*

---

### Q8: What happens if the Azure backend is temporarily offline or cold-starting?
* **Target Answer (Abinash Mohanty)**:
  > *"In cloud computing, network partitions and service cold starts are inevitable. Our Next.js frontend implements an intelligent client-side synthesis engine.
  > 
  > When a student submits a course, the frontend attempts to reach the Azure REST API with a tight 1.5-second timeout. If the backend is cold or unreachable, the client seamlessly activates its local curriculum synthesis blueprint without displaying an error message or crashing, ensuring 100% demo resilience and uninterrupted student learning."*

---

### Q9: How were your performance metrics measured?
* **Target Answer (Namrata Kala)**:
  > *"We measured our performance metrics across the software lifecycle:
  > - **CI/CD build times** (2m 18s) were measured directly in GitHub Actions run logs across clean ACR build tasks.
  > - **Edge TTFB** (32ms) was recorded using browser developer tools and WebPageTest across global Vercel CDN nodes.
  > - **Vector query latency** (18ms) was benchmarked using asynchronous SQLAlchemy query timers executing `ORDER BY embedding <=> query_vector LIMIT 10` on our PostgreSQL instance."*

---

### Q10: How was the project divided among the 3 group members?
* **Target Answer (All Members)**:
  > - **B123007 Abinash Mohanty**: Designed the three-tier cloud architecture, implemented the Next.js edge frontend on Vercel, architected the LangGraph state graph, and built the client-side fallback resilience.
  > - **B123018 Anil Paliwal**: Spearheaded Docker containerization, configured Azure Container Registry (ACR), authored the Azure PowerShell deployment script (`deploy.ps1`), and built the GitHub Actions CI/CD pipeline with secretless OIDC authentication.
  > - **B123077 Namrata Kala**: Provisioned the Cloud PostgreSQL instance with `pgvector`, developed the high-dimensional vector search and RAG retrieval pipelines, implemented the Quality Control validation agent, and conducted performance benchmarking.
