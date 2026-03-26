import { Link } from "react-router-dom";
import { FileText, Terminal } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-primary/10 border border-primary/30 flex items-center justify-center group-hover:glow-border-strong transition-shadow">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <span className="font-mono font-bold text-sm tracking-wider text-foreground">
            PDF<span className="text-primary">::</span>TOOLS
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-mono">
            <Terminal className="w-3 h-3" />
            <span>v1.0.0</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
