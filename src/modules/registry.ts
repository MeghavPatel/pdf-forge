import { registerTool } from "@/lib/toolRegistry";
import { lazy } from "react";

// Register all tools here. To add a new tool:
// 1. Create a module folder in src/modules/<tool-id>/
// 2. Add a default-exported React component
// 3. Register it below

registerTool({
  id: "compress",
  name: "Compress PDF",
  description: "Reduce PDF file size with configurable quality presets and options.",
  icon: "compress",
  category: "optimize",
  status: "active",
  component: lazy(() => import("@/modules/compress/CompressTool")),
});

registerTool({
  id: "merge",
  name: "Merge PDF",
  description: "Combine multiple PDF files into a single document.",
  icon: "merge",
  category: "combine",
  status: "active",
  component: lazy(() => import("@/modules/merge/MergeTool")),
});

registerTool({
  id: "split",
  name: "Split PDF",
  description: "Extract page ranges from a PDF into separate files.",
  icon: "split",
  category: "extract",
  status: "active",
  component: lazy(() => import("@/modules/split/SplitTool")),
});

// Coming soon placeholders
registerTool({
  id: "convert",
  name: "Convert PDF",
  description: "Convert PDF to images or other formats.",
  icon: "convert",
  category: "convert",
  status: "coming-soon",
});

registerTool({
  id: "ocr",
  name: "OCR",
  description: "Extract text from scanned PDFs using OCR.",
  icon: "ocr",
  category: "extract",
  status: "coming-soon",
});

registerTool({
  id: "watermark",
  name: "Watermark",
  description: "Add text or image watermarks to PDF pages.",
  icon: "watermark",
  category: "edit",
  status: "coming-soon",
});

registerTool({
  id: "encrypt",
  name: "Encrypt PDF",
  description: "Password-protect and encrypt PDF files.",
  icon: "encrypt",
  category: "security",
  status: "coming-soon",
});
