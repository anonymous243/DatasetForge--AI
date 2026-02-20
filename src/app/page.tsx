import DatasetForge from "@/components/DatasetForge";
import { Sparkles, Hammer } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen pb-20">
      {/* Hero / Header */}
      <header className="relative py-12 px-6 overflow-hidden bg-white border-b border-indigo-50">
        <div className="absolute top-0 right-0 p-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-3xl" />
        <div className="absolute bottom-0 left-0 p-24 bg-accent/5 rounded-full -ml-12 -mb-12 blur-3xl" />
        
        <div className="container mx-auto text-center relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            Empowering AI Models
          </div>
          <h1 className="text-4xl md:text-5xl font-headline font-extrabold tracking-tight text-primary">
            DatasetForge <span className="text-accent">AI</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Universal synthetic data generator. Create strictly structured, high-fidelity datasets for machine learning, testing, and development in seconds.
          </p>
        </div>
      </header>

      {/* Main Generator Section */}
      <section className="mt-8">
        <DatasetForge />
      </section>

      {/* Features Row */}
      <section className="container mx-auto max-w-6xl px-6 mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 rounded-xl border bg-white shadow-sm space-y-2">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <Hammer className="w-4 h-4 text-accent" />
            Strict Enforcement
          </h3>
          <p className="text-sm text-muted-foreground">Every generated dataset undergoes validation to ensure it matches your schema perfectly, every time.</p>
        </div>
        <div className="p-6 rounded-xl border bg-white shadow-sm space-y-2">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Advanced Flexibility
          </h3>
          <p className="text-sm text-muted-foreground">From simple Q&A pairs to complex clinical medical records, Forge handles diverse data structures with ease.</p>
        </div>
        <div className="p-6 rounded-xl border bg-white shadow-sm space-y-2">
          <h3 className="font-bold text-primary flex items-center gap-2">
            <Hammer className="w-4 h-4 text-accent" />
            Zero Key Testing
          </h3>
          <p className="text-sm text-muted-foreground">Use Demo Mode to explore the interface and dataset structures without requiring immediate API configuration.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 py-8 text-center text-sm text-muted-foreground border-t bg-white/50">
        <p>© {new Date().getFullYear()} DatasetForge AI. Built for the future of data-centric AI.</p>
      </footer>
    </main>
  );
}