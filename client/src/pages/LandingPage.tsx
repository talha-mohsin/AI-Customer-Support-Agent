import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  Bot,
  Brain,
  CheckCircle2,
  ClipboardList,
  Clock,
  Headset,
  LayoutDashboard,
  Menu,
  MessageSquare,
  MessagesSquare,
  PackageSearch,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";

const NAV_LINKS = [
  { href: "#solution", label: "How it works" },
  { href: "#capabilities", label: "Capabilities" },
  { href: "#product", label: "Product" },
];

const PROBLEMS = [
  {
    icon: MessagesSquare,
    title: "Repetitive support questions",
    description: "Agents burn hours answering the same handful of questions every single day.",
  },
  {
    icon: Clock,
    title: "Slow response times",
    description: "Customers wait in queue for answers that should take seconds to deliver.",
  },
  {
    icon: PackageSearch,
    title: "Scattered customer/order information",
    description: "Order status and account details live across disconnected internal tools.",
  },
  {
    icon: Ticket,
    title: "Manual ticket creation",
    description: "Agents copy-paste context into tickets by hand instead of resolving issues.",
  },
  {
    icon: Users,
    title: "Lack of intelligent escalation",
    description: "Complex cases sit in a generic queue instead of reaching the right human fast.",
  },
  {
    icon: ShieldCheck,
    title: "AI hallucinations",
    description: "Generic chatbots invent answers instead of grounding them in real information.",
  },
];

const SOLUTION_STEPS = [
  { icon: MessageSquare, label: "Customer asks question" },
  { icon: Brain, label: "AI understands intent" },
  { icon: ScanSearch, label: "Search knowledge / use secure tool" },
  { icon: ShieldCheck, label: "Generate verified response" },
  { icon: Ticket, label: "Create ticket or escalate" },
];

const CAPABILITIES = [
  { icon: Bot, title: "AI Customer Support", description: "Conversational answers powered by an LLM agent, available around the clock." },
  { icon: BookOpenCheck, title: "Knowledge Base + RAG", description: "Responses are grounded in your private documentation, not guesswork." },
  { icon: PackageSearch, title: "Order Lookup", description: "Securely retrieves customer and order data through backend tools." },
  { icon: Ticket, title: "Support Tickets", description: "Automatically opens tickets with full context when an issue needs follow-up." },
  { icon: Users, title: "Human Escalation", description: "Hands off to a support agent when a conversation needs a human touch." },
  { icon: ShieldCheck, title: "Secure Authentication", description: "Role-based accounts keep customer and agent data properly isolated." },
  { icon: LayoutDashboard, title: "Role-Based Support Dashboard", description: "Purpose-built views for customers and support agents alike." },
  { icon: Sparkles, title: "Verified Responses", description: "Every answer is checked against real data before it reaches the customer." },
];

const PRODUCT_PREVIEWS = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    description: "A live conversation with the support agent, answering in real time.",
    preview: (
      <div className="flex flex-col gap-2">
        <div className="ml-auto max-w-[80%] rounded-lg rounded-tr-sm bg-accent px-3 py-1.5 text-xs text-white">
          Where is my order #4821?
        </div>
        <div className="max-w-[80%] rounded-lg rounded-tl-sm bg-surface-alt px-3 py-1.5 text-xs text-text">
          It shipped yesterday and is arriving Thursday.
        </div>
      </div>
    ),
  },
  {
    icon: BookOpenCheck,
    title: "Knowledge Base Search",
    description: "Finds the right policy or doc and cites it in the answer.",
    preview: (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 rounded-md bg-surface-alt px-2.5 py-1.5 text-xs text-text">
          <ScanSearch size={12} className="text-accent" /> refund-policy.md
        </div>
        <div className="flex items-center gap-2 rounded-md bg-surface-alt px-2.5 py-1.5 text-xs text-text">
          <ScanSearch size={12} className="text-accent" /> shipping-times.md
        </div>
      </div>
    ),
  },
  {
    icon: PackageSearch,
    title: "Order Tracking",
    description: "Looks up live order status through a secure backend tool.",
    preview: (
      <div className="rounded-md bg-surface-alt px-3 py-2 text-xs text-text">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-muted">Order #4821</span>
          <span className="rounded-full bg-success-soft px-2 py-0.5 text-[10px] font-medium text-success">
            Shipped
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-border">
          <div className="h-1.5 w-2/3 rounded-full bg-accent" />
        </div>
      </div>
    ),
  },
  {
    icon: Ticket,
    title: "Support Tickets",
    description: "Opens a ticket automatically with the full conversation attached.",
    preview: (
      <div className="rounded-md bg-surface-alt px-3 py-2 text-xs">
        <p className="font-medium text-text">Damaged item received</p>
        <p className="mt-1 text-muted">Priority: High · Status: Open</p>
      </div>
    ),
  },
  {
    icon: Users,
    title: "Human Escalation",
    description: "Routes tricky conversations to the right support agent.",
    preview: (
      <div className="flex items-center gap-2 rounded-md bg-surface-alt px-3 py-2 text-xs text-text">
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Headset size={12} />
        </div>
        Escalated to Sarah on Tier 2
      </div>
    ),
  },
  {
    icon: LayoutDashboard,
    title: "Support Dashboard",
    description: "Agents see queues, tickets, and customers in one clean view.",
    preview: (
      <div className="grid grid-cols-3 gap-1.5">
        <div className="rounded-md bg-surface-alt px-2 py-2 text-center text-[10px] text-muted">
          12<br />Open
        </div>
        <div className="rounded-md bg-surface-alt px-2 py-2 text-center text-[10px] text-muted">
          4<br />Urgent
        </div>
        <div className="rounded-md bg-surface-alt px-2 py-2 text-center text-[10px] text-muted">
          38<br />Resolved
        </div>
      </div>
    ),
  },
];

function Section({ id, className = "", children }: { id?: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} className={`mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${className}`}>
      {children}
    </section>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent">{eyebrow}</p>
      <h2 className="text-2xl font-semibold text-text sm:text-3xl">{title}</h2>
      {description && <p className="mt-3 text-sm text-muted sm:text-base">{description}</p>}
    </div>
  );
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white">
              <Headset size={18} />
            </div>
            <span className="text-base font-semibold text-text">Support AI</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="cursor-pointer text-sm font-medium text-muted transition-colors hover:text-text focus:text-text focus:outline-none"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Link
              to="/login"
              className="cursor-pointer rounded-md px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-text focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="flex cursor-pointer items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
            >
              Get Started
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex cursor-pointer items-center justify-center rounded-md border border-border bg-surface p-2 text-text transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-accent md:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-border bg-surface px-4 py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="cursor-pointer rounded-md px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-alt hover:text-text"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
              <ThemeToggle />
            </div>
            <div className="mt-3 flex flex-col gap-2">
              <Link
                to="/login"
                className="cursor-pointer rounded-md border border-border px-3 py-2.5 text-center text-sm font-medium text-text transition-colors hover:bg-surface-alt"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="cursor-pointer rounded-md bg-accent px-3 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-accent-hover"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <Section className="pt-16 pb-16 sm:pt-24 sm:pb-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 flex w-fit items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted">
            <Sparkles size={12} className="text-accent" />
            Agentic support, not just a chatbot
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-text sm:text-4xl lg:text-5xl">
            AI-Powered Customer Support Agent
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
            Automate repetitive support requests, answer questions from your private knowledge
            base, look up customer and order data securely, and escalate to a human whenever it
            truly matters.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/register"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-bg sm:w-auto"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
            <a
              href="#product"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-medium text-text transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-accent sm:w-auto"
            >
              Explore Product
            </a>
          </div>
        </div>
      </Section>

      {/* Problem */}
      <Section className="border-t border-border">
        <SectionHeading
          eyebrow="The problem"
          title="Support teams are stretched thin"
          description="Most support tooling wasn't built for how customers actually ask questions today."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PROBLEMS.map((problem) => (
            <div
              key={problem.title}
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-danger-soft text-danger">
                <problem.icon size={18} />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text">{problem.title}</h3>
              <p className="text-sm text-muted">{problem.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Solution */}
      <Section id="solution" className="border-t border-border">
        <SectionHeading
          eyebrow="The solution"
          title="One agent, from question to resolution"
          description="Every conversation follows a verified path — nothing is answered without grounding."
        />
        <div className="flex flex-col items-stretch gap-3 lg:flex-row lg:items-center">
          {SOLUTION_STEPS.map((step, i) => (
            <div key={step.label} className="flex flex-1 items-center gap-3 lg:flex-col lg:gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-lg border border-border bg-surface p-4 lg:w-full lg:flex-col lg:text-center">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <step.icon size={18} />
                </div>
                <p className="text-sm font-medium text-text">{step.label}</p>
              </div>
              {i < SOLUTION_STEPS.length - 1 && (
                <ArrowRight size={18} className="hidden shrink-0 text-muted lg:block" />
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Capabilities */}
      <Section id="capabilities" className="border-t border-border">
        <SectionHeading
          eyebrow="Capabilities"
          title="Everything a modern support team needs"
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CAPABILITIES.map((cap) => (
            <div
              key={cap.title}
              className="rounded-lg border border-border bg-surface p-5 transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <cap.icon size={18} />
              </div>
              <h3 className="mb-1 text-sm font-semibold text-text">{cap.title}</h3>
              <p className="text-sm text-muted">{cap.description}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Agentic AI explanation */}
      <Section className="border-t border-border">
        <SectionHeading
          eyebrow="Why it's different"
          title="More than a normal chatbot"
          description="A traditional chatbot maps a question straight to an answer. Our agent reasons about what to do first."
        />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-surface p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-muted">
              Traditional chatbot
            </p>
            <div className="flex items-center gap-3 text-sm font-medium text-text">
              <span className="rounded-md bg-surface-alt px-3 py-2">Question</span>
              <ArrowRight size={16} className="shrink-0 text-muted" />
              <span className="rounded-md bg-surface-alt px-3 py-2">Answer</span>
            </div>
          </div>
          <div className="rounded-lg border border-accent/40 bg-accent-soft/40 p-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-accent">
              Our support agent
            </p>
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-text">
              <span className="rounded-md bg-surface px-2.5 py-2">Question</span>
              <ArrowRight size={14} className="shrink-0 text-accent" />
              <span className="rounded-md bg-surface px-2.5 py-2">Understand</span>
              <ArrowRight size={14} className="shrink-0 text-accent" />
              <span className="rounded-md bg-surface px-2.5 py-2">Decide</span>
              <ArrowRight size={14} className="shrink-0 text-accent" />
              <span className="rounded-md bg-surface px-2.5 py-2">Use Tool/RAG</span>
              <ArrowRight size={14} className="shrink-0 text-accent" />
              <span className="rounded-md bg-surface px-2.5 py-2">Verify</span>
              <ArrowRight size={14} className="shrink-0 text-accent" />
              <span className="rounded-md bg-surface px-2.5 py-2">Respond/Escalate</span>
            </div>
          </div>
        </div>
      </Section>

      {/* Product overview */}
      <Section id="product" className="border-t border-border">
        <SectionHeading
          eyebrow="Product overview"
          title="See it in action"
          description="A preview of what customers and support agents see inside the product."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_PREVIEWS.map((item) => (
            <div key={item.title} className="rounded-lg border border-border bg-surface p-5">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                  <item.icon size={16} />
                </div>
                <h3 className="text-sm font-semibold text-text">{item.title}</h3>
              </div>
              <p className="mb-4 text-sm text-muted">{item.description}</p>
              <div className="rounded-md border border-border bg-bg p-3">{item.preview}</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Trust strip */}
      <Section className="border-t border-border">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-5">
            <CheckCircle2 size={20} className="shrink-0 text-success" />
            <p className="text-sm text-text">Answers grounded in your own knowledge base</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-5">
            <ClipboardList size={20} className="shrink-0 text-accent" />
            <p className="text-sm text-text">Tickets created automatically with full context</p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-surface p-5">
            <Wand2 size={20} className="shrink-0 text-warning" />
            <p className="text-sm text-text">Escalates to a human whenever it's the right call</p>
          </div>
        </div>
      </Section>

      {/* Final CTA */}
      <Section className="border-t border-border">
        <div className="rounded-xl border border-border bg-surface px-6 py-14 text-center sm:px-12">
          <h2 className="text-2xl font-semibold text-text sm:text-3xl">
            Ready to experience intelligent customer support?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-muted sm:text-base">
            Create an account and see how the agent handles real conversations in minutes.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              to="/register"
              className="flex cursor-pointer items-center gap-2 rounded-md bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-surface"
            >
              Get Started
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </Section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
              <Headset size={14} />
            </div>
            <span className="text-sm font-semibold text-text">Support AI</span>
          </div>
          <p className="text-xs text-muted">© {new Date().getFullYear()} Support AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
