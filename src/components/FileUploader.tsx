import { useCallback, useState } from "react";
import { Upload, File, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FileUploaderProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  files: File[];
  onRemoveFile?: (index: number) => void;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const FileUploader = ({
  onFilesSelected,
  multiple = false,
  accept = ".pdf",
  files,
  onRemoveFile,
}: FileUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.endsWith(".pdf")
      );
      if (droppedFiles.length) onFilesSelected(droppedFiles);
    },
    [onFilesSelected]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      onFilesSelected(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-md p-8 text-center transition-all cursor-pointer ${
          isDragging
            ? "border-primary bg-primary/5 glow-border-strong"
            : "border-border hover:border-primary/40 hover:bg-card"
        }`}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className={`w-8 h-8 mx-auto mb-3 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
        <p className="font-mono text-sm text-muted-foreground">
          Drop PDF {multiple ? "files" : "file"} here or{" "}
          <span className="text-primary">browse</span>
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1 font-mono">
          .pdf files only
        </p>
      </div>

      <AnimatePresence>
        {files.map((file, i) => (
          <motion.div
            key={`${file.name}-${i}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-3 bg-secondary/50 border border-border rounded-md px-3 py-2"
          >
            <File className="w-4 h-4 text-primary shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono truncate text-foreground">{file.name}</p>
              <p className="text-[10px] font-mono text-muted-foreground">{formatSize(file.size)}</p>
            </div>
            {onRemoveFile && (
              <button
                onClick={() => onRemoveFile(i)}
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FileUploader;
