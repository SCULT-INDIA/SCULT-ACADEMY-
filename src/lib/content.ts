import {
  Bot,
  BrainCircuit,
  Briefcase,
  Building,
  ChartLine,
  CodeXml,
  Compass,
  Factory,
  GraduationCap,
  Hammer,
  Medal,
  Presentation,
  Radio,
  type LucideIcon,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────
   Landing-page content. Copy lives here so marketing edits never
   touch layout code.

   NOTE: figures in `stats` and the quotes in `testimonials` are
   sample content — replace them with verified numbers and real,
   consented learner quotes before launch.
   ────────────────────────────────────────────────────────────── */

export const techStack = [
  "Python",
  "PyTorch",
  "TensorFlow",
  "LangChain",
  "LlamaIndex",
  "Hugging Face",
  "OpenAI API",
  "Claude API",
  "Gemini",
  "Model Context Protocol",
  "Vector Databases",
  "Cursor",
  "n8n",
  "scikit-learn",
  "Docker",
  "Kubernetes",
  "AWS",
  "Google Cloud",
  "Next.js",
  "FastAPI",
  "Power BI",
  "Snowflake",
] as const;

export type Audience = {
  id: string;
  label: string;
  icon: LucideIcon;
  kicker: string;
  title: string;
  description: string;
  outcomes: string[];
  formats: string[];
  cta: { label: string; href: string };
  track: { name: string; modules: { week: string; title: string }[] };
  tone: "ember" | "sun" | "ink" | "paper";
};

export const audiences: Audience[] = [
  {
    id: "students",
    label: "Students",
    icon: GraduationCap,
    kicker: "For students",
    title: "Start early. Start strong.",
    description:
      "Go from curious to capable. Master Python, data and AI fundamentals, then build real projects that make your portfolio impossible to ignore.",
    outcomes: [
      "AI & ML foundations, minus the jargon",
      "A portfolio of shipped, real-world projects",
      "Internship and placement preparation",
      "Certificates recruiters recognise",
    ],
    formats: ["Weekend cohorts", "Bootcamps", "Campus programs"],
    cta: { label: "Explore student tracks", href: "#programs" },
    track: {
      name: "AI Foundations Track",
      modules: [
        { week: "W1–2", title: "Python for AI" },
        { week: "W3–4", title: "Data thinking & visualisation" },
        { week: "W5–6", title: "Machine learning essentials" },
        { week: "W7–8", title: "Build & demo your first AI app" },
      ],
    },
    tone: "ember",
  },
  {
    id: "experts",
    label: "Professionals & Experts",
    icon: Briefcase,
    kicker: "For professionals & experts",
    title: "Stay ahead of the curve.",
    description:
      "Deepen your craft with advanced tracks in LLM engineering, AI agents, MLOps and AI product strategy — designed around a full-time schedule.",
    outcomes: [
      "Advanced, practitioner-led curriculum",
      "Hands-on with frontier models and tooling",
      "1:1 mentorship and code reviews",
      "Career acceleration and role transitions",
    ],
    formats: ["Evening cohorts", "Masterclasses", "Self-paced"],
    cta: { label: "See advanced programs", href: "#programs" },
    track: {
      name: "LLM Engineering Track",
      modules: [
        { week: "W1–3", title: "Prompting, evals & guardrails" },
        { week: "W4–7", title: "RAG systems that scale" },
        { week: "W8–11", title: "Agents, tools & MCP" },
        { week: "W12–16", title: "Fine-tuning & production MLOps" },
      ],
    },
    tone: "sun",
  },
  {
    id: "industries",
    label: "Industries",
    icon: Factory,
    kicker: "For industries",
    title: "AI, applied to your domain.",
    description:
      "Sector-specific programs that translate AI into measurable outcomes across healthcare, finance, manufacturing, retail and education.",
    outcomes: [
      "Domain-specific AI use-case playbooks",
      "Labs built on realistic industry datasets",
      "Responsible, compliance-aware adoption",
      "Programs co-built with institutions",
    ],
    formats: ["Industry bootcamps", "Workshops", "Certifications"],
    cta: { label: "Talk to an industry advisor", href: "#contact" },
    track: {
      name: "Applied AI for Industry",
      modules: [
        { week: "Phase 1", title: "AI literacy for domain experts" },
        { week: "Phase 2", title: "Use-case discovery & scoping" },
        { week: "Phase 3", title: "Hands-on labs with sector data" },
        { week: "Phase 4", title: "Pilot, measure, scale" },
      ],
    },
    tone: "ink",
  },
  {
    id: "enterprises",
    label: "Enterprises",
    icon: Building,
    kicker: "For enterprises",
    title: "Upskill at the speed of change.",
    description:
      "End-to-end AI capability building for your workforce — from leadership literacy to engineering excellence, measured with real skill analytics.",
    outcomes: [
      "Role-based learning paths for every team",
      "Private cohorts on your own tech stack",
      "Skill analytics and ROI reporting",
      "SSO, LMS and HRIS integrations",
    ],
    formats: ["Private cohorts", "On-site bootcamps", "Learning platform"],
    cta: { label: "Book a strategy call", href: "#enterprise" },
    track: {
      name: "Enterprise AI Readiness",
      modules: [
        { week: "Step 1", title: "Skills diagnostic across teams" },
        { week: "Step 2", title: "Role-based curriculum design" },
        { week: "Step 3", title: "Private cohorts & bootcamps" },
        { week: "Step 4", title: "Analytics, ROI & scale-up" },
      ],
    },
    tone: "paper",
  },
];

export type Program = {
  title: string;
  description: string;
  icon: LucideIcon;
  level: string;
  duration: string;
  format: string;
  tags: string[];
};

export const programs: Program[] = [
  {
    title: "Generative AI & LLM Engineering",
    description:
      "Build production-grade LLM applications — prompting, retrieval, fine-tuning, evaluation and deployment — on the stack modern AI teams actually use.",
    icon: BrainCircuit,
    level: "Advanced",
    duration: "16 weeks",
    format: "Live cohort",
    tags: ["RAG", "Fine-tuning", "Evals", "Vector DBs"],
  },
  {
    title: "AI Agents & Automation",
    description:
      "Design tool-using agents and automate real workflows end-to-end, from orchestration to observability.",
    icon: Bot,
    level: "Intermediate",
    duration: "10 weeks",
    format: "Live cohort",
    tags: ["Agents", "MCP", "Workflows"],
  },
  {
    title: "AI Foundations",
    description: "Python, data and machine learning — the launchpad for students and first-time builders.",
    icon: Compass,
    level: "Beginner",
    duration: "8 weeks",
    format: "Hybrid",
    tags: ["Python", "ML basics"],
  },
  {
    title: "Data Science & ML",
    description: "From statistics to deployed models — the complete modern machine-learning toolkit.",
    icon: ChartLine,
    level: "Intermediate",
    duration: "20 weeks",
    format: "Live cohort",
    tags: ["Statistics", "MLOps"],
  },
  {
    title: "AI for Leaders",
    description:
      "Strategy, governance and ROI for executives steering AI transformation across their organisation.",
    icon: Presentation,
    level: "Executive",
    duration: "4 weeks",
    format: "Weekend intensive",
    tags: ["Strategy", "Governance", "ROI"],
  },
  {
    title: "Full-Stack AI Product Engineering",
    description:
      "Ship AI-native products end-to-end with modern web frameworks, APIs and cloud infrastructure.",
    icon: CodeXml,
    level: "Intermediate",
    duration: "14 weeks",
    format: "Live cohort",
    tags: ["Next.js", "APIs", "Cloud"],
  },
];

export const methodSteps = [
  {
    step: "01",
    title: "Assess",
    icon: Compass,
    description:
      "A skills diagnostic maps where you are today and builds a personalised path to where you want to be.",
  },
  {
    step: "02",
    title: "Learn live",
    icon: Radio,
    description:
      "Small, mentor-led cohorts. Concepts arrive exactly when you need them — never theory for its own sake.",
  },
  {
    step: "03",
    title: "Build",
    icon: Hammer,
    description:
      "Ship real projects on real tools every week, reviewed line-by-line by practitioners who build for a living.",
  },
  {
    step: "04",
    title: "Prove",
    icon: Medal,
    description:
      "Graduate with verifiable certificates, a public portfolio, and career support to land what's next.",
  },
] as const;

// Sample figures — replace with verified numbers before launch.
export const stats = [
  { value: 25000, suffix: "+", label: "Learners trained" },
  { value: 120, suffix: "+", label: "Practitioner mentors" },
  { value: 350, suffix: "+", label: "Hiring & industry partners" },
  { value: 94, suffix: "%", label: "Would recommend Scult" },
] as const;

export const enterpriseFeatures = [
  {
    title: "Role-based curricula",
    description: "Learning paths mapped to every role — from the boardroom to the codebase.",
  },
  {
    title: "Labs on your stack",
    description: "Hands-on projects using your tools, your data patterns and your real use cases.",
  },
  {
    title: "Skill analytics",
    description: "Live dashboards that track capability growth and tie learning to business outcomes.",
  },
  {
    title: "Enterprise-ready",
    description: "SSO, LMS and HRIS integrations, private cohorts and a dedicated success manager.",
  },
] as const;

// Sample quotes — replace with real, consented learner testimonials before launch.
export const testimonials = [
  {
    quote:
      "The agents track changed how I work. By week six I'd shipped an internal tool my whole team now relies on.",
    name: "Rohan M.",
    role: "Senior Engineer → Tech Lead",
    outcome: "Promoted",
  },
  {
    quote:
      "Coming from a non-CS background, Foundations made AI finally click. The projects are what landed my first internship.",
    name: "Ananya R.",
    role: "Engineering student",
    outcome: "Internship",
  },
  {
    quote:
      "We put 140 people through a private cohort. The skill analytics made the business case for scaling it write itself.",
    name: "Head of L&D",
    role: "Fintech enterprise",
    outcome: "Enterprise",
  },
  {
    quote: "Mentors who actually ship. The code reviews alone were worth it — I write production code differently now.",
    name: "Kabir S.",
    role: "ML Engineer",
    outcome: "Upskilled",
  },
  {
    quote:
      "AI for Leaders gave our leadership team a shared language and a roadmap we could actually execute.",
    name: "VP Operations",
    role: "Manufacturing group",
    outcome: "Leadership",
  },
  {
    quote:
      "Practical, current and intense in the best way. Every single week mapped to something I used at work the next day.",
    name: "Priya N.",
    role: "Data Analyst → Data Scientist",
    outcome: "Career switch",
  },
] as const;

export const formats = [
  {
    name: "Self-paced",
    kicker: "Learn on your schedule",
    description: "A deep on-demand library for independent learners who like to move fast.",
    features: [
      "On-demand lessons & guided projects",
      "Quizzes, sandboxes and starter repos",
      "Community access & peer reviews",
      "Certificate of completion",
    ],
    cta: { label: "Browse the library", href: "#programs" },
    featured: false,
  },
  {
    name: "Live cohort",
    kicker: "Learn with mentors & peers",
    description: "Our flagship format: small cohorts, live classes and relentless building.",
    features: [
      "Live classes three times a week",
      "1:1 mentorship and code reviews",
      "Capstone built on an industry brief",
      "Career services & demo day",
    ],
    cta: { label: "Apply to a cohort", href: "#contact" },
    featured: true,
  },
  {
    name: "Enterprise",
    kicker: "Built for your organisation",
    description: "Custom programs that build AI capability across every team, at any scale.",
    features: [
      "Custom role-based curricula",
      "Private cohorts & on-site bootcamps",
      "Skill analytics dashboard",
      "Dedicated success manager",
    ],
    cta: { label: "Talk to our team", href: "#enterprise" },
    featured: false,
  },
] as const;

export const faqs = [
  {
    question: "Who is Scult Academy for?",
    answer:
      "Anyone serious about building with AI. We run dedicated tracks for school and college students, working professionals and domain experts, industry-specific programs, and fully custom enterprise upskilling.",
  },
  {
    question: "Do I need a coding background?",
    answer:
      "Not for AI Foundations or AI for Leaders — both start from first principles. Advanced tracks list their prerequisites, and our free skills diagnostic recommends the right starting point for you.",
  },
  {
    question: "Are classes live or recorded?",
    answer:
      "Both. Cohort programs are taught live in small groups, and every session is recorded so you can revisit it. Self-paced programs are fully on-demand.",
  },
  {
    question: "Will I get a certificate?",
    answer:
      "Yes. Every program ends with a verifiable certificate, and project-based tracks also leave you with a public portfolio of shipped work — which is what employers really look at.",
  },
  {
    question: "How does enterprise training work?",
    answer:
      "We start with a skills diagnostic across your teams, design role-based curricula around your stack and goals, run private cohorts or on-site bootcamps, and report progress through a live analytics dashboard.",
  },
  {
    question: "What if I fall behind?",
    answer:
      "It happens. You get recordings, mentor office hours and peer study groups — and if life gets in the way, you can defer to the next cohort.",
  },
] as const;
