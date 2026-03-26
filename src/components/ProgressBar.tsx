import { motion } from "framer-motion";

interface ProgressBarProps {
  progress: number;
  label?: string;
}

const ProgressBar = ({ progress, label }: ProgressBarProps) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        {label && <span className="font-mono text-xs text-muted-foreground">{label}</span>}
        <span className="font-mono text-xs text-primary">{Math.round(progress)}%</span>
      </div>
      <div className="h-2 bg-secondary rounded-sm overflow-hidden border border-border">
        <motion.div
          className="h-full bg-primary rounded-sm"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
          style={{ boxShadow: "0 0 10px hsl(38 92% 50% / 0.5)" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
