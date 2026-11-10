import { RoadmapResponse, WeeklyPrepResponse, RoadmapWeek } from "../types/api";

export function getMockRoadmap(
  courseCode: string = "CS301",
  courseName: string = "Cloud Computing & Distributed Systems",
  semesterName: string = "Fall 2026"
): RoadmapResponse {
  const code = courseCode.trim() || "CS301";
  const name = courseName.trim() || "Cloud Computing & Distributed Systems";
  const semester = semesterName.trim() || "Fall 2026";

  const weeks: RoadmapWeek[] = [
    {
      week: 1,
      start_date: "Aug 24, 2026",
      end_date: "Aug 28, 2026",
      topics: [
        "Course Overview & Cloud Computing Paradigms",
        "NIST Definition of Cloud Computing & Service Models (IaaS, PaaS, SaaS)",
        "Public, Private, Hybrid & Multi-Cloud Deployment Models"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 2,
      start_date: "Aug 31, 2026",
      end_date: "Sep 04, 2026",
      topics: [
        "Hardware Virtualization vs. Containerization",
        "Hypervisors (Type 1 & Type 2), Linux cgroups & Namespaces",
        "Docker Architecture, Container Lifecycle & Image Layers"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 3,
      start_date: "Sep 07, 2026",
      end_date: "Sep 11, 2026",
      topics: [
        "Cloud Storage Architectures: Block, File, and Object Storage",
        "Amazon S3 & Azure Blob Storage: Consistency Models & Multipart Uploads",
        "Distributed File Systems & The CAP Theorem"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 4,
      start_date: "Sep 14, 2026",
      end_date: "Sep 18, 2026",
      topics: [
        "Cloud Networking: Virtual Private Clouds (VPC / Azure VNet)",
        "Subnets, Route Tables, NAT Gateways & Network Security Groups (NSGs)",
        "Software-Defined Networking (SDN) & Layer 4/7 Load Balancing"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 5,
      start_date: "Sep 21, 2026",
      end_date: "Sep 25, 2026",
      topics: [
        "Microservices Architecture & Domain-Driven Decomposition",
        "API Gateways, Rate Limiting & Service Discovery",
        "Synchronous (REST/gRPC) vs Asynchronous (Kafka/RabbitMQ) Messaging"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 6,
      start_date: "Sep 28, 2026",
      end_date: "Oct 02, 2026",
      topics: [
        "Serverless Architecture & Function-as-a-Service (FaaS)",
        "Event-Driven Triggers, Execution Sandboxing & Cold Starts",
        "Stateless Compute Patterns & Cloud Ephemeral Scaling"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 7,
      start_date: "Oct 05, 2026",
      end_date: "Oct 09, 2026",
      topics: [
        "Midterm Examination & Architecture Review",
        "Distributed Systems Case Studies: Netflix & Uber Cloud Migration"
      ],
      is_holiday: false,
      is_midterm: true
    },
    {
      week: 8,
      start_date: "Oct 12, 2026",
      end_date: "Oct 16, 2026",
      topics: [
        "Cloud Databases: Managed SQL vs NoSQL (Document, Key-Value, Columnar)",
        "Horizontal Partitioning (Sharding), Read Replicas & High Availability",
        "Vector Databases & High-Dimensional Similarity Indexing (pgvector)"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 9,
      start_date: "Oct 19, 2026",
      end_date: "Oct 23, 2026",
      topics: [
        "Retrieval-Augmented Generation (RAG) Architecture in the Cloud",
        "Document Chunking, Embeddings Generation & Semantic Search",
        "Autonomous Agentic Workflows & Multi-Agent Orchestration"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 10,
      start_date: "Oct 26, 2026",
      end_date: "Oct 30, 2026",
      topics: [
        "Infrastructure as Code (IaC): Terraform, Bicep & CloudFormation",
        "DevOps Automation: GitHub Actions CI/CD & Automated Container Deployments",
        "Blue-Green & Canary Zero-Downtime Deployment Strategies"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 11,
      start_date: "Nov 02, 2026",
      end_date: "Nov 06, 2026",
      topics: [],
      is_holiday: true,
      is_midterm: false
    },
    {
      week: 12,
      start_date: "Nov 09, 2026",
      end_date: "Nov 13, 2026",
      topics: [
        "Cloud Security Architecture & The Shared Responsibility Model",
        "Identity & Access Management (IAM), Least Privilege & RBAC",
        "Passwordless OIDC Federated Authentication & Data Encryption at Rest/Transit"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 13,
      start_date: "Nov 16, 2026",
      end_date: "Nov 20, 2026",
      topics: [
        "Cloud Observability: The Three Pillars (Metrics, Logs, Tracing)",
        "Distributed Tracing (OpenTelemetry), Health Check Probes & SRE Practices",
        "Auto-Scaling Policies, Service-Level Indicators (SLIs) and SLOs"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 14,
      start_date: "Nov 23, 2026",
      end_date: "Nov 27, 2026",
      topics: [
        "Disaster Recovery (DR) Strategies: Backup/Restore to Multi-Region Active-Active",
        "Recovery Point Objective (RPO) & Recovery Time Objective (RTO)",
        "Cost Optimization, Cloud FinOps & Spot/Reserved Instance Economics"
      ],
      is_holiday: false,
      is_midterm: false
    },
    {
      week: 15,
      start_date: "Nov 30, 2026",
      end_date: "Dec 04, 2026",
      topics: [
        "Capstone Project Demonstrations & Cloud Architecture Review",
        "Synthesis of Scalability, Resiliency, Security, and Cloud-Native Best Practices"
      ],
      is_holiday: false,
      is_midterm: false
    }
  ];

  return {
    course: {
      id: "course-" + Math.random().toString(36).substring(2, 9),
      name: name,
      code: code
    },
    semester: {
      name: semester,
      start: "2026-08-24",
      end: "2026-12-04"
    },
    total_weeks: 15,
    teaching_weeks: 13,
    roadmap: weeks
  };
}

export function getMockWeeklyPrep(weekNum: number, roadmap?: RoadmapResponse | null): WeeklyPrepResponse {
  const currentWeek = roadmap?.roadmap.find((w) => w.week === weekNum);
  const topics = currentWeek?.topics || [
    "Core Architecture Principles",
    "Cloud Services & Implementation",
    "Scalability & Resiliency Analysis"
  ];

  const weekPreps: Record<number, { summary: string; quiz: any[] }> = {
    1: {
      summary: `### Week 1 Mastery Guide: Cloud Foundations & Service Models

1. **The NIST Definition of Cloud Computing**:
   - Cloud computing is characterized by five essential traits: *On-demand self-service*, *Broad network access*, *Resource pooling*, *Rapid elasticity*, and *Measured service*.
   - Cost dynamics transform Capital Expenditure (CapEx) into Operational Expenditure (OpEx), enabling elastic resource acquisition without upfront hardware investments.

2. **The Cloud Pyramid (Service Delivery Models)**:
   - **IaaS (Infrastructure as a Service)**: Provides virtualized raw compute, storage, and networking (e.g., Azure VMs, AWS EC2). The tenant manages the OS, runtime, and application code.
   - **PaaS (Platform as a Service)**: Delivers a managed execution environment (e.g., Azure App Service, Google Cloud Run). The cloud provider manages the OS, patch updates, and runtime; the user only deploys application code.
   - **SaaS (Software as a Service)**: Fully managed end-user applications delivered over the web (e.g., Google Workspace, Microsoft 365).

3. **Cloud Deployment Topologies**:
   - Public Cloud: Shared multi-tenant physical hardware partitioned logically via virtualization.
   - Private Cloud: Dedicated single-tenant infrastructure operated strictly for an individual organization.
   - Hybrid & Multi-Cloud: Seamlessly orchestrating workloads across on-premise data centers and multiple hyperscalers to mitigate vendor lock-in.`,
      quiz: [
        {
          question: "Which cloud service model delegates operating system maintenance and hardware patching to the cloud provider while giving the developer control over the deployed application code?",
          options: [
            { label: "A", text: "Infrastructure as a Service (IaaS)" },
            { label: "B", text: "Platform as a Service (PaaS)" },
            { label: "C", text: "Software as a Service (SaaS)" },
            { label: "D", text: "Bare-Metal Colocation" }
          ],
          correct_answer: "B",
          explanation: "In Platform as a Service (PaaS), such as Azure App Service, the cloud vendor manages hardware, hypervisors, OS patches, and runtimes, leaving the developer to focus purely on application logic.",
          source_topic: "Service Models (IaaS, PaaS, SaaS)"
        },
        {
          question: "Which of the following is NOT one of the five essential characteristics of cloud computing defined by NIST?",
          options: [
            { label: "A", text: "Rapid Elasticity" },
            { label: "B", text: "Resource Pooling" },
            { label: "C", text: "Fixed Annual Licensing" },
            { label: "D", text: "Measured Service" }
          ],
          correct_answer: "C",
          explanation: "NIST defines cloud computing by On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, and Measured service. Fixed annual licensing is a traditional on-premise model, not an elastic cloud trait.",
          source_topic: "NIST Definition of Cloud Computing"
        },
        {
          question: "How does adopting public cloud computing fundamentally alter an enterprise's financial model for IT infrastructure?",
          options: [
            { label: "A", text: "Converts upfront Capital Expenditures (CapEx) into variable Operational Expenditures (OpEx)" },
            { label: "B", text: "Eliminates network bandwidth transmission costs completely" },
            { label: "C", text: "Mandates 10-year upfront hardware acquisition depreciation" },
            { label: "D", text: "Restricts all server deployments to on-premises private racks" }
          ],
          correct_answer: "A",
          explanation: "Public cloud computing allows organizations to pay for only the compute and storage resources consumed on a per-second or per-minute basis, converting fixed CapEx into flexible OpEx.",
          source_topic: "Cloud Computing Paradigms"
        }
      ]
    },
    2: {
      summary: `### Week 2 Mastery Guide: Virtualization vs. Containerization

1. **Hypervisors & Virtual Machines (Type 1 vs Type 2)**:
   - Type-1 (Bare-Metal) Hypervisors (e.g., VMware ESXi, KVM, Hyper-V) execute directly on host hardware.
   - Type-2 Hypervisors (e.g., VirtualBox) run on top of an existing host OS.
   - VMs virtualize hardware, meaning each VM requires an entire guest operating system, resulting in gigabyte-sized disk footprints and slower boot cycles.

2. **Linux Namespaces and Control Groups (cgroups)**:
   - **Namespaces** partition system resources: PID (process isolation), NET (network interfaces/ports), MNT (filesystem mounts), IPC, and UTS (hostnames).
   - **cgroups (Control Groups)** govern resource limits: CPU quotas, memory limits, disk I/O bandwidth, and network priority to prevent container starvation.

3. **Docker Engine & OCI Images**:
   - Containers share the host Linux kernel while executing in user-space isolation.
   - Image layers use copy-on-write (UnionFS), allowing base images (e.g., python:3.12-slim) to be cached across multiple microservice deployments.`,
      quiz: [
        {
          question: "Which underlying Linux kernel mechanism is primarily responsible for enforcing CPU, memory, and I/O resource limits on a container?",
          options: [
            { label: "A", text: "Linux Control Groups (cgroups)" },
            { label: "B", text: "Network Namespaces (netns)" },
            { label: "C", text: "Chroot jail filesystem redirection" },
            { label: "D", text: "Union File System (OverlayFS)" }
          ],
          correct_answer: "A",
          explanation: "cgroups (Control Groups) meter and constrain hardware resource utilization (CPU, memory, disk I/O, network) per container.",
          source_topic: "Linux cgroups & Namespaces"
        },
        {
          question: "Why do Docker containers provide significantly faster startup times and lower resource overhead compared to traditional Virtual Machines?",
          options: [
            { label: "A", text: "Containers bundle a full hardware BIOS emulator in every image" },
            { label: "B", text: "Containers share the host operating system kernel instead of booting a full guest OS" },
            { label: "C", text: "Containers disable all security process isolation" },
            { label: "D", text: "Containers only run static compiled assembly binaries" }
          ],
          correct_answer: "B",
          explanation: "Unlike Virtual Machines which emulate complete virtual hardware and execute a heavy guest OS, containers share the host kernel and isolate processes using namespaces and cgroups.",
          source_topic: "Hardware Virtualization vs. Containerization"
        },
        {
          question: "What storage technology allows Docker to efficiently reuse identical layers across multiple different container images?",
          options: [
            { label: "A", text: "Raw Block Storage Area Networks" },
            { label: "B", text: "Copy-on-Write Union Filesystem (OverlayFS)" },
            { label: "C", text: "Network File System (NFS v3)" },
            { label: "D", text: "Magnetic Tape Archival" }
          ],
          correct_answer: "B",
          explanation: "Docker images use Union Filesystems (such as OverlayFS) where read-only layers are stacked and shared; only modified files are duplicated into the thin writeable layer using Copy-on-Write.",
          source_topic: "Docker Architecture & Image Layers"
        }
      ]
    },
    3: {
      summary: `### Week 3 Mastery Guide: Cloud Storage & Distributed Consistency

1. **Block vs File vs Object Storage**:
   - **Block Storage** (e.g., Azure Managed Disks, AWS EBS): Raw, unformatted blocks accessed over low-latency protocols; optimal for transactional databases (PostgreSQL) requiring raw file system structures.
   - **File Storage** (e.g., Azure Files, AWS EFS): Hierarchical POSIX-compliant shared file systems mounted simultaneously across multiple compute instances.
   - **Object Storage** (e.g., Azure Blob, Amazon S3): Flat namespace accessing immutable binary objects via HTTP REST APIs (PUT, GET, DELETE) with global metadata tags, ideal for unstructured data and PDF archives.

2. **The CAP Theorem in Cloud Architectures**:
   - A distributed data store can guarantee at most two of three properties simultaneously: **Consistency** (all nodes see identical data simultaneously), **Availability** (every non-failing request receives a response), and **Partition Tolerance** (system continues operating despite arbitrary network dropped messages).
   - Because cloud network partitions are inevitable across physical data centers, cloud systems choose between CP (e.g., traditional ACID databases) or AP (e.g., DynamoDB, Cassandra with eventual consistency).`,
      quiz: [
        {
          question: "When storing unstructured PDF syllabi and class lecture notes in a cloud-native application, which storage type provides virtually unlimited horizontal scale, high durability, and REST API access?",
          options: [
            { label: "A", text: "Object Storage (e.g., Azure Blob / AWS S3)" },
            { label: "B", text: "Raw Block Storage (e.g., Azure Managed Disk)" },
            { label: "C", text: "Local NVMe Ephemeral Scratch Disk" },
            { label: "D", text: "RAM-based shared memory segments" }
          ],
          correct_answer: "A",
          explanation: "Object storage is specifically engineered for unstructured binary data (documents, images, videos) accessed via standard HTTP REST APIs with 99.999999999% durability.",
          source_topic: "Cloud Storage Architectures"
        },
        {
          question: "According to Eric Brewer's CAP Theorem, what must a distributed data system trade off during a network partition event across cloud availability zones?",
          options: [
            { label: "A", text: "Security vs Encryption" },
            { label: "B", text: "Consistency vs Availability" },
            { label: "C", text: "Compute Speed vs Memory Footprint" },
            { label: "D", text: "Bandwidth vs Disk Space" }
          ],
          correct_answer: "B",
          explanation: "Under network partition (P), a distributed system must decide whether to cancel operations to ensure strict consistency (CP) or proceed with stale reads/writes to ensure availability (AP).",
          source_topic: "Distributed File Systems & The CAP Theorem"
        },
        {
          question: "Why are raw block storage volumes typically preferred over object storage for running relational databases like PostgreSQL?",
          options: [
            { label: "A", text: "Block storage has lower latency and allows direct low-level random byte-range I/O and transaction log fsyncs" },
            { label: "B", text: "Block storage is accessible via public internet URLs without credentials" },
            { label: "C", text: "Block storage automatically formats data into JSON documents" },
            { label: "D", text: "Block storage does not consume any storage quota" }
          ],
          correct_answer: "A",
          explanation: "Relational database engines rely on low-latency random reads/writes and atomic write-ahead log (WAL) syncs that require block-level operating system disk access.",
          source_topic: "Block, File, and Object Storage"
        }
      ]
    }
  };

  const defaultPrep = weekPreps[weekNum] || {
    summary: `### Week ${weekNum} Mastery Guide: ${topics[0] || "Advanced Cloud System Engineering"}

1. **Core Architecture Overview**:
   - This module emphasizes practical implementation of **${topics[0] || "Distributed Systems"}** in enterprise cloud topologies.
   - Workloads are decoupled into modular, single-responsibility services communicating over resilient transport layers.

2. **System Scalability & Resiliency**:
   - Stateless compute tiers allow automatic scaling based on CPU utilization and request thresholds.
   - Integration with cloud-native monitoring (liveness and readiness probes) guarantees self-healing when container instances degrade.

3. **Key Production Best Practices**:
   - Always enforce least-privilege IAM roles and isolate database resources inside private network subnets.
   - Use automated CI/CD pipelines with cryptographic commit tagging to ensure verifiable, reproducible deployments.`,
    quiz: [
      {
        question: `In production cloud architectures addressing ${topics[0] || "Distributed Systems"}, what is the primary benefit of deploying stateless application containers?`,
        options: [
          { label: "A", text: "Instances can be created and terminated dynamically without data loss to handle fluctuating user demand" },
          { label: "B", text: "Containers do not require any network connectivity" },
          { label: "C", text: "Database transactions can be committed directly to local container RAM" },
          { label: "D", text: "Operating system security vulnerabilities are automatically eliminated" }
        ],
        correct_answer: "A",
        explanation: "Statelessness ensures that any individual container instance can be spun up or down horizontally behind a cloud load balancer without sacrificing user session state or transactional integrity.",
        source_topic: topics[0] || "Cloud Computing Architecture"
      },
      {
        question: `When designing high-availability cloud deployments for ${topics[1] || "Microservices"}, what role does an automated health probe (/health) serve?`,
        options: [
          { label: "A", text: "It computes daily cloud expenditure invoices" },
          { label: "B", text: "It allows the cloud orchestrator to route traffic only to healthy instances and restart crashed containers" },
          { label: "C", text: "It compiles TypeScript code into machine binaries" },
          { label: "D", text: "It encrypts hard disk sectors at rest" }
        ],
        correct_answer: "B",
        explanation: "Liveness and readiness health probes signal container health to cloud load balancers and orchestrators (like Azure App Service or Kubernetes) to facilitate self-healing and zero-downtime routing.",
        source_topic: topics[1] || "Cloud High Availability"
      },
      {
        question: `Which security principle mandates using short-lived tokens and OpenID Connect (OIDC) rather than permanent API secret keys in CI/CD pipelines?`,
        options: [
          { label: "A", text: "Maximum Availability Principle" },
          { label: "B", text: "Zero-Trust & Secretless Federated Authentication" },
          { label: "C", text: "Single Point of Failure Authorization" },
          { label: "D", text: "Unauthenticated Perimeter Routing" }
        ],
        correct_answer: "B",
        explanation: "OIDC federated credentials establish cryptographic identity trust between GitHub Actions and cloud providers (Azure/AWS), eliminating the risk of stored, leaked long-lived passwords.",
        source_topic: "Cloud Security & Identity"
      }
    ]
  };

  return {
    week: weekNum,
    topics: topics,
    summary: defaultPrep.summary,
    quiz: defaultPrep.quiz,
    quality_passed: true,
    retrieval_attempts: 1
  };
}
