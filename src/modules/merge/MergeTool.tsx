import { useState, useCallback } from "react";
import { Download, Play, RotateCcw, GripVertical } from "lucide-react";
import { motion } from "framer-motion";
import FileUploader from "@/components/FileUploader";
import ConsoleLog, { LogEntry } from "@/components/ConsoleLog";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { mergePdfs, downloadBlob, formatFileSize } from "@/utils/pdfUtils";

const MergeTool = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<Uint8Array | null>(null);

  const addLog = useCallback((message: string, level: LogEntry["level"] = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, { time, message, level }]);
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setResult(null);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const moveFile = (from: number, to: number) => {
    setFiles((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setResult(null);
    setProgress(0);
    setLogs([]);

    addLog(`Merging ${files.length} files...`, "info");
    setProgress(20);

    try {
      for (let i = 0; i < files.length; i++) {
        addLog(`Processing: ${files[i].name}`, "info");
        setProgress(20 + (60 * (i + 1)) / files.length);
        await new Promise((r) => setTimeout(r, 150));
      }

      const data = await mergePdfs(files);
      setResult(data);
      setProgress(100);
      addLog(`Merged output: ${formatFileSize(data.length)}`, "success");
      addLog("Done ✓", "success");
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : "Unknown"}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <div className="panel">
          <div className="panel-header">
            <span className="font-mono text-xs text-muted-foreground">FILES TO MERGE</span>
            <span className="font-mono text-[10px] text-muted-foreground/50 ml-auto">{files.length} file(s)</span>
          </div>
          <div className="panel-body">
            <FileUploader
              files={files}
              onFilesSelected={handleFilesSelected}
              onRemoveFile={handleRemoveFile}
              multiple
            />
          </div>
        </div>

        {files.length > 1 && (
          <div className="panel">
            <div className="panel-header">
              <span className="font-mono text-xs text-muted-foreground">ORDER</span>
            </div>
            <div className="panel-body space-y-1">
              {files.map((file, i) => (
                <div key={`${file.name}-${i}`} className="flex items-center gap-2 bg-secondary/30 rounded px-3 py-2 border border-border">
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-mono text-xs text-foreground flex-1 truncate">{file.name}</span>
                  <div className="flex gap-1">
                    <button
                      disabled={i === 0}
                      onClick={() => moveFile(i, i - 1)}
                      className="text-[10px] font-mono text-muted-foreground hover:text-primary disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      disabled={i === files.length - 1}
                      onClick={() => moveFile(i, i + 1)}
                      className="text-[10px] font-mono text-muted-foreground hover:text-primary disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleMerge}
            disabled={files.length < 2 || isProcessing}
            className="flex-1 font-mono text-xs h-11 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-4 h-4 mr-2" />
            {isProcessing ? "MERGING..." : "MERGE"}
          </Button>
          <Button onClick={() => { setFiles([]); setResult(null); setLogs([]); setProgress(0); }} variant="outline" className="font-mono text-xs h-11">
            <RotateCcw className="w-4 h-4 mr-1" /> RESET
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {progress > 0 && (
          <div className="panel"><div className="panel-header"><span className="font-mono text-xs text-muted-foreground">PROGRESS</span></div><div className="panel-body"><ProgressBar progress={progress} label="Merging" /></div></div>
        )}
        <ConsoleLog logs={logs} />
        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel glow-border-strong">
            <div className="panel-header"><span className="font-mono text-xs text-primary">OUTPUT</span></div>
            <div className="panel-body">
              <p className="font-mono text-xs text-muted-foreground mb-3">Size: {formatFileSize(result.length)}</p>
              <Button onClick={() => downloadBlob(result, "merged.pdf")} className="w-full font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" /> DOWNLOAD
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MergeTool;
