import { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

export interface LogEntry {
  time: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
}

interface ConsoleLogProps {
  logs: LogEntry[];
}

const ConsoleLog = ({ logs }: ConsoleLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="panel">
      <div className="panel-header">
        <Terminal className="w-3.5 h-3.5 text-primary" />
        <span className="font-mono text-xs text-muted-foreground">CONSOLE</span>
      </div>
      <div ref={scrollRef} className="p-3 max-h-48 overflow-y-auto bg-background/50 rounded-b-md">
        {logs.length === 0 ? (
          <p className="font-mono text-xs text-muted-foreground/50">Waiting for input...</p>
        ) : (
          <div className="console-log space-y-0.5">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="log-time shrink-0">[{log.time}]</span>
                <span className={`log-${log.level}`}>{log.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsoleLog;
