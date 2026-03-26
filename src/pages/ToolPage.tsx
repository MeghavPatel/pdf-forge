import { useParams, Link } from "react-router-dom";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { getTool } from "@/lib/toolRegistry";

const iconMap: Record<string, string> = {
  compress: "📦",
  merge: "🔗",
  split: "✂️",
};

const ToolPage = () => {
  const { toolId } = useParams<{ toolId: string }>();
  const tool = toolId ? getTool(toolId) : undefined;

  if (!tool || !tool.component) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="font-mono text-muted-foreground">Tool not found.</p>
        <Link to="/" className="text-primary font-mono text-sm mt-4 inline-block hover:underline">← Back</Link>
      </div>
    );
  }

  const Component = tool.component;

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{iconMap[tool.id] || "📄"}</span>
          <div>
            <h1 className="font-mono font-bold text-lg text-foreground">{tool.name}</h1>
            <p className="font-mono text-xs text-muted-foreground">{tool.description}</p>
          </div>
        </div>
      </div>

      {/* Tool UI */}
      <Suspense fallback={
        <div className="panel p-8 text-center">
          <p className="font-mono text-xs text-muted-foreground animate-pulse">Loading module...</p>
        </div>
      }>
        <Component />
      </Suspense>
    </div>
  );
};

export default ToolPage;
