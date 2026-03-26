import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import type { ToolConfig } from "@/lib/toolRegistry";

interface ToolCardProps {
  tool: ToolConfig;
  index: number;
}

const iconMap: Record<string, string> = {
  compress: "📦",
  merge: "🔗",
  split: "✂️",
  convert: "🔄",
  ocr: "👁️",
  watermark: "💧",
  rotate: "🔁",
  encrypt: "🔒",
};

const ToolCard = ({ tool, index }: ToolCardProps) => {
  const isActive = tool.status === "active";

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className={`panel group relative overflow-hidden transition-all duration-300 ${
        isActive
          ? "hover:glow-border-strong hover:border-primary/40 cursor-pointer"
          : "opacity-50 cursor-not-allowed"
      }`}
    >
      {/* Scan line effect on hover */}
      {isActive && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none overflow-hidden">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-line" />
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="text-2xl">{iconMap[tool.id] || "📄"}</div>
          {!isActive && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
        </div>

        <h3 className="font-mono font-semibold text-sm mb-1.5 text-foreground group-hover:text-primary transition-colors">
          {tool.name}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {tool.description}
        </p>

        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-mono uppercase tracking-widest ${
            isActive ? "text-success" : "text-muted-foreground"
          }`}>
            {isActive ? "● ONLINE" : "○ COMING SOON"}
          </span>
          {isActive && (
            <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          )}
        </div>
      </div>
    </motion.div>
  );

  return isActive ? <Link to={`/tool/${tool.id}`}>{content}</Link> : content;
};

export default ToolCard;
