import { useState, useCallback } from "react";
import { Download, Play, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";
import FileUploader from "@/components/FileUploader";
import ConsoleLog, { LogEntry } from "@/components/ConsoleLog";
import ProgressBar from "@/components/ProgressBar";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { compressPdf, downloadBlob, formatFileSize } from "@/utils/pdfUtils";

const PRESETS = [
  { label: "Screen", quality: 30, desc: "72 dpi, smallest size" },
  { label: "Ebook", quality: 50, desc: "150 dpi, balanced" },
  { label: "Print", quality: 80, desc: "300 dpi, high quality" },
  { label: "Minimum", quality: 15, desc: "Aggressive compression" },
];

const CompressTool = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(50);
  const [stripMetadata, setStripMetadata] = useState(true);
  const [downscaleImages, setDownscaleImages] = useState(true);
  const [grayscale, setGrayscale] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ data: Uint8Array; originalSize: number; compressedSize: number } | null>(null);
  const [activePreset, setActivePreset] = useState<number | null>(1);

  const addLog = useCallback((message: string, level: LogEntry["level"] = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev, { time, message, level }]);
  }, []);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles(newFiles.slice(0, 1));
    setResult(null);
    setLogs([]);
    setProgress(0);
  };

  const handlePreset = (index: number) => {
    setActivePreset(index);
    setQuality(PRESETS[index].quality);
  };

  const handleCompress = async () => {
    if (!files[0]) return;
    setIsProcessing(true);
    setResult(null);
    setProgress(0);
    setLogs([]);

    const file = files[0];
    addLog(`Loading ${file.name} (${formatFileSize(file.size)})`, "info");
    setProgress(10);

    addLog(`Preset: quality=${quality}%, stripMeta=${stripMetadata}, downscale=${downscaleImages}, grayscale=${grayscale}`, "info");
    setProgress(20);

    try {
      await new Promise((r) => setTimeout(r, 300));
      addLog("Parsing PDF structure...", "info");
      setProgress(40);

      await new Promise((r) => setTimeout(r, 200));
      addLog("Processing pages...", "info");
      setProgress(60);

      const data = await compressPdf(file, { quality, stripMetadata, downscaleImages, grayscale, fastMode });
      setProgress(90);

      addLog("Finalizing output...", "info");
      await new Promise((r) => setTimeout(r, 200));

      const originalSize = file.size;
      const compressedSize = data.length;
      const reduction = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      setResult({ data, originalSize, compressedSize });
      setProgress(100);

      addLog(`Original: ${formatFileSize(originalSize)}`, "success");
      addLog(`Compressed: ${formatFileSize(compressedSize)}`, "success");
      addLog(`Reduction: ${reduction}%`, "success");
      addLog("Done ✓", "success");
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const name = files[0]?.name?.replace(".pdf", "-compressed.pdf") || "compressed.pdf";
    downloadBlob(result.data, name);
    addLog(`Downloaded: ${name}`, "info");
  };

  const handleReset = () => {
    setFiles([]);
    setResult(null);
    setLogs([]);
    setProgress(0);
    setActivePreset(1);
    setQuality(50);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Left: Upload + Controls */}
      <div className="lg:col-span-2 space-y-4">
        <div className="panel">
          <div className="panel-header">
            <span className="font-mono text-xs text-muted-foreground">FILE INPUT</span>
          </div>
          <div className="panel-body">
            <FileUploader
              files={files}
              onFilesSelected={handleFilesSelected}
              onRemoveFile={() => { setFiles([]); setResult(null); }}
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <span className="font-mono text-xs text-muted-foreground">COMPRESSION SETTINGS</span>
          </div>
          <div className="panel-body space-y-5">
            {/* Presets */}
            <div>
              <label className="font-mono text-xs text-muted-foreground mb-2 block">PRESET</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESETS.map((p, i) => (
                  <button
                    key={p.label}
                    onClick={() => handlePreset(i)}
                    className={`px-3 py-2 rounded-md border text-xs font-mono transition-all ${
                      activePreset === i
                        ? "border-primary bg-primary/10 text-primary glow-border"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <div className="font-semibold">{p.label}</div>
                    <div className="text-[10px] opacity-60">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-xs text-muted-foreground">QUALITY</label>
                <span className="font-mono text-xs text-primary">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                onValueChange={(v) => { setQuality(v[0]); setActivePreset(null); }}
                min={10}
                max={95}
                step={5}
                className="[&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary [&_.relative>div]:bg-primary"
              />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Strip Metadata", value: stripMetadata, set: setStripMetadata },
                { label: "Downscale Images", value: downscaleImages, set: setDownscaleImages },
                { label: "Convert to Grayscale", value: grayscale, set: setGrayscale },
                { label: "Fast Mode", value: fastMode, set: setFastMode },
              ].map(({ label, value, set }) => (
                <div key={label} className="flex items-center justify-between bg-secondary/30 rounded-md px-3 py-2.5 border border-border">
                  <span className="font-mono text-xs text-foreground">{label}</span>
                  <Switch checked={value} onCheckedChange={set} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="flex gap-3">
          <Button
            onClick={handleCompress}
            disabled={!files.length || isProcessing}
            className="flex-1 font-mono text-xs h-11 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Play className="w-4 h-4 mr-2" />
            {isProcessing ? "PROCESSING..." : "COMPRESS"}
          </Button>
          <Button onClick={handleReset} variant="outline" className="font-mono text-xs h-11">
            <RotateCcw className="w-4 h-4 mr-1" /> RESET
          </Button>
        </div>
      </div>

      {/* Right: Progress + Results */}
      <div className="space-y-4">
        {progress > 0 && (
          <div className="panel">
            <div className="panel-header">
              <span className="font-mono text-xs text-muted-foreground">PROGRESS</span>
            </div>
            <div className="panel-body">
              <ProgressBar progress={progress} label="Compression" />
            </div>
          </div>
        )}

        <ConsoleLog logs={logs} />

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel glow-border-strong"
          >
            <div className="panel-header">
              <span className="font-mono text-xs text-primary">OUTPUT</span>
            </div>
            <div className="panel-body space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Original</span>
                  <span className="text-foreground">{formatFileSize(result.originalSize)}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Compressed</span>
                  <span className="text-primary">{formatFileSize(result.compressedSize)}</span>
                </div>
                <div className="flex justify-between font-mono text-xs">
                  <span className="text-muted-foreground">Reduction</span>
                  <span className="text-success">
                    {((1 - result.compressedSize / result.originalSize) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <Button
                onClick={handleDownload}
                className="w-full font-mono text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                DOWNLOAD
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CompressTool;
