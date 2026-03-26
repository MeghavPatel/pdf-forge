import { useState, useCallback } from "react";
import { Download, Play, RotateCcw, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import FileUploader from "@/components/FileUploader";
import ConsoleLog, { LogEntry } from "@/components/ConsoleLog";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { splitPdf, downloadBlob, formatFileSize, loadPdf } from "@/utils/pdfUtils";

const SplitTool = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [pageCount, setPageCount] = useState(0);
  const [ranges, setRanges] = useState([{ start: "1", end: "" }]);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<Uint8Array[]>([]);

  const addLog = useCallback((message: string, level: LogEntry["level"] = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, { time, message, level }]);
  }, []);

  const handleFilesSelected = async (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setResults([]);
    setLogs([]);
    setProgress(0);
    try {
      const doc = await loadPdf(file);
      const count = doc.getPageCount();
      setPageCount(count);
      setRanges([{ start: "1", end: String(count) }]);
    } catch {
      setPageCount(0);
    }
  };

  const addRange = () => setRanges((prev) => [...prev, { start: "", end: "" }]);
  const removeRange = (i: number) => setRanges((prev) => prev.filter((_, idx) => idx !== i));
  const updateRange = (i: number, field: "start" | "end", val: string) => {
    setRanges((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  };

  const handleSplit = async () => {
    if (!files[0] || !ranges.length) return;
    setIsProcessing(true);
    setResults([]);
    setProgress(0);
    setLogs([]);

    const parsedRanges = ranges
      .map((r) => ({ start: parseInt(r.start) || 1, end: parseInt(r.end) || pageCount }))
      .filter((r) => r.start > 0 && r.end >= r.start);

    addLog(`Splitting into ${parsedRanges.length} range(s)...`, "info");
    setProgress(20);

    try {
      const data = await splitPdf(files[0], parsedRanges);
      setProgress(90);
      setResults(data);
      data.forEach((d, i) => addLog(`Part ${i + 1}: ${formatFileSize(d.length)}`, "success"));
      setProgress(100);
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
            <span className="font-mono text-xs text-muted-foreground">FILE INPUT</span>
            {pageCount > 0 && (
              <span className="font-mono text-[10px] text-primary ml-auto">{pageCount} pages</span>
            )}
          </div>
          <div className="panel-body">
            <FileUploader files={files} onFilesSelected={handleFilesSelected} onRemoveFile={() => { setFiles([]); setPageCount(0); setResults([]); }} />
          </div>
        </div>

        {files.length > 0 && (
          <div className="panel">
            <div className="panel-header">
              <span className="font-mono text-xs text-muted-foreground">PAGE RANGES</span>
            </div>
            <div className="panel-body space-y-2">
              {ranges.map((r, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-muted-foreground w-8">#{i + 1}</span>
                  <Input
                    value={r.start}
                    onChange={(e) => updateRange(i, "start", e.target.value)}
                    placeholder="Start"
                    className="font-mono text-xs h-8 bg-secondary/30"
                  />
                  <span className="text-muted-foreground text-xs">→</span>
                  <Input
                    value={r.end}
                    onChange={(e) => updateRange(i, "end", e.target.value)}
                    placeholder="End"
                    className="font-mono text-xs h-8 bg-secondary/30"
                  />
                  {ranges.length > 1 && (
                    <button onClick={() => removeRange(i)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <Button onClick={addRange} variant="outline" size="sm" className="font-mono text-xs mt-1">
                <Plus className="w-3 h-3 mr-1" /> Add Range
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button onClick={handleSplit} disabled={!files.length || isProcessing} className="flex-1 font-mono text-xs h-11 bg-primary text-primary-foreground hover:bg-primary/90">
            <Play className="w-4 h-4 mr-2" /> {isProcessing ? "SPLITTING..." : "SPLIT"}
          </Button>
          <Button onClick={() => { setFiles([]); setResults([]); setLogs([]); setProgress(0); setPageCount(0); setRanges([{ start: "1", end: "" }]); }} variant="outline" className="font-mono text-xs h-11">
            <RotateCcw className="w-4 h-4 mr-1" /> RESET
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {progress > 0 && (
          <div className="panel"><div className="panel-header"><span className="font-mono text-xs text-muted-foreground">PROGRESS</span></div><div className="panel-body"><ProgressBar progress={progress} label="Splitting" /></div></div>
        )}
        <ConsoleLog logs={logs} />
        {results.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="panel glow-border-strong">
            <div className="panel-header"><span className="font-mono text-xs text-primary">OUTPUT ({results.length} parts)</span></div>
            <div className="panel-body space-y-2">
              {results.map((data, i) => (
                <Button key={i} onClick={() => downloadBlob(data, `split-part-${i + 1}.pdf`)} variant="outline" className="w-full font-mono text-xs justify-between">
                  <span>Part {i + 1} ({formatFileSize(data.length)})</span>
                  <Download className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SplitTool;
