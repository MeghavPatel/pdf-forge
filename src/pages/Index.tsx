import { motion } from "framer-motion";
import { FileText, Zap, Shield, ArrowDown } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { getAllTools } from "@/lib/toolRegistry";

const Index = () => {
  const tools = getAllTools();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(38 92% 50% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(38 92% 50% / 0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="font-mono text-xs text-primary">ALL PROCESSING IN-BROWSER</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="text-foreground">PDF</span>
              <span className="text-primary glow-text">::</span>
              <span className="text-foreground">TOOLS</span>
            </h1>

            <p className="text-muted-foreground max-w-lg mx-auto mb-8 text-sm md:text-base">
              Modular PDF processing toolkit. Compress, merge, split — all client-side.
              No uploads. No servers. Just fast, private PDF processing.
            </p>

            <div className="flex items-center justify-center gap-6 text-xs font-mono text-muted-foreground mb-12">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span>Fast</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-primary" />
                <span>Private</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Free</span>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <ArrowDown className="w-5 h-5 text-muted-foreground/40 mx-auto" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs text-muted-foreground tracking-widest">AVAILABLE MODULES</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="tool-grid">
          {tools.map((tool, i) => (
            <ToolCard key={tool.id} tool={tool} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
