import {
  ArrowRight,
  Calendar,
  Code2,
  Cpu,
  Grip,
  Layout,
  Monitor,
  Music2,
  Plug,
  Terminal,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

function Github({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
    </svg>
  );
}

const features = [
  {
    icon: Monitor,
    title: "Display Control",
    description:
      "Push images, clocks, Spotify now-playing, or any custom layout to your Pi display in real time.",
  },
  {
    icon: Calendar,
    title: "Scheduler",
    description:
      "Create playlists and schedule what shows on your display by time, day, or event.",
  },
  {
    icon: Music2,
    title: "Spotify Integration",
    description:
      "Connect Spotify and show album art, track info, and playback status on your display.",
  },
  {
    icon: Cpu,
    title: "Device Monitoring",
    description:
      "Live CPU, memory, temperature, and uptime telemetry streamed over WebSocket.",
  },
  {
    icon: Zap,
    title: "Instant Updates",
    description:
      "WebSocket-powered. Changes reflect on your display instantly, no polling required.",
  },
  {
    icon: Plug,
    title: "Extensible",
    description:
      "REST API, automation hooks, and a plugin-friendly agent make it easy to integrate anything.",
  },
];

const stack = [
  { label: "Dashboard", sub: "Next.js + shadcn/ui", icon: Layout },
  { label: "API", sub: "Go + Fiber", icon: Code2 },
  { label: "Agent", sub: "Go on Raspberry Pi", icon: Terminal },
  { label: "Transport", sub: "WebSocket + REST", icon: Wifi },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* ── Nav ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <Grip className="size-4 text-foreground" />
          <span className="text-sm font-semibold tracking-tight">Bitbus</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/parthsali/bitbus"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github className="size-4" />
            {/* <span className="hidden sm:inline">GitHub</span> */}
          </a>
          <a href="https://app.bitbus.tech" target="_blank" rel="noopener noreferrer">
            <Button size="sm" className="h-8 gap-1.5 text-xs">
              Get Started
              <ArrowRight className="size-3" />
            </Button>
          </a>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────── */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-28 text-center sm:py-36">
        <Badge
          variant="secondary"
          className="mb-6 gap-1.5 px-3 py-1 text-xs font-medium"
        >
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
          </span>
          Open Source
        </Badge>

        <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
          Control your display
          <br />
          from anywhere.
        </h1>

        <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg">
          Open-source display management for Raspberry Pi. Push content,
          schedule playlists, and monitor your device, all from a single
          dashboard.
        </p>

        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <a href="https://github.com/parthsali/bitbus" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="h-11 gap-2 px-6">
              <Github className="size-4" />
              View on GitHub
            </Button>
          </a>
          <a href="#features">
            <Button variant="outline" size="lg" className="h-11 px-6">
              See Features
            </Button>
          </a>
        </div>

        {/* Terminal snippet */}
        <div className="mt-14 w-full max-w-md rounded-lg border border-border bg-card p-4 text-left font-mono text-sm">
          <div className="mb-3 flex items-center gap-2">
  <span className="size-2.5 rounded-full bg-[#FF5F57]" />
  <span className="size-2.5 rounded-full bg-[#FEBC2E]" />
  <span className="size-2.5 rounded-full bg-[#28C840]" />
</div>
          <p className="text-muted-foreground">
            <span className="text-emerald-500">$</span> git clone
            https://github.com/parthsali/bitbus
          </p>
          <p className="text-muted-foreground">
            <span className="text-emerald-500">$</span> docker compose up -d
          </p>
          <p className="mt-1 text-muted-foreground/60">
            # Dashboard at localhost:3000
          </p>
        </div>
      </section>

      <Separator />

      {/* ── Features ────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Features
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you need to drive a display.
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent/40"
                >
                  <div className="mb-4 flex size-9 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-sm font-semibold">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {f.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── Architecture ────────────────────────────────── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Architecture
          </p>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Simple, modular, self-hosted.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Three components: a dashboard, an API server, and a lightweight
            agent on your Pi. Connected over WebSocket for real-time control.
          </p>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stack.map((s) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.label}
                  className="rounded-lg border border-border p-5"
                >
                  <Icon className="mb-3 size-5 text-muted-foreground/50" />
                  <p className="text-sm font-semibold">{s.label}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.sub}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Separator />

      {/* ── CTA ─────────────────────────────────────────── */}
      <section className="flex flex-col items-center px-6 py-24 text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Ready to get started?
        </h2>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          Bitbus is free and open source. Clone the repo, spin up Docker, and
          start controlling your display in minutes.
        </p>
        <a
          href="https://github.com/parthsali/bitbus"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8"
        >
          <Button size="lg" className="h-11 gap-2 px-6">
            <Github className="size-4" />
            View on GitHub
          </Button>
        </a>
      </section>

      {/* ── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Grip className="size-3.5" />
            <span>Bitbus</span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            Open source · Apache 2.0
          </p>
        </div>
      </footer>
    </div>
  );
}
