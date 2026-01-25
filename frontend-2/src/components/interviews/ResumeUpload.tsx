import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { FileUp, FileText, X, CheckCircle2, Info } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

interface ResumeUploadProps {
  onResumeData: (data: { file: File | null; text: string }) => void;
}

export default function ResumeUpload({ onResumeData }: ResumeUploadProps) {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      onResumeData({ file: selectedFile, text: "" });
      toast.success(`${selectedFile.name} uploaded successfully.`);
    } else {
      toast.error("Please select a valid PDF file.");
    }
  };

  const handleTextChange = (val: string) => {
    setText(val);
    onResumeData({ file: null, text: val });
  };

  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    onResumeData({ file: null, text: "" });
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
      <div className="flex items-center justify-between px-1">
        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
          <FileText className="h-3 w-3" /> Technical Experience Context
        </label>
        <div className="flex bg-muted/30 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setMode("file")}
            className={cn(
              "px-3 py-1 text-[10px] font-black rounded-md transition-all",
              mode === "file" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            PDF UPLOAD
          </button>
          <button
            onClick={() => setMode("text")}
            className={cn(
              "px-3 py-1 text-[10px] font-black rounded-md transition-all",
              mode === "text" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            PASTE TEXT
          </button>
        </div>
      </div>

      {mode === "file" ? (
        <div className="relative group">
          {!file ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 group"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
              />
              <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <FileUp className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-bold">Drop your resume here</p>
              <p className="text-xs text-muted-foreground mt-1">PDF format supported (max 5MB)</p>
            </div>
          ) : (
            <div className="glass-card p-4 flex items-center justify-between border-primary/20 bg-primary/5 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="bg-primary p-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold truncate max-w-[200px]">{file.name}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">{(file.size / 1024).toFixed(0)} KB • Ready for processing</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={clearFile} className="hover:bg-destructive/10 hover:text-destructive">
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2 animate-in fade-in duration-300">
          <Textarea
            placeholder="Paste your professional experience, skills, or LinkedIn summary here..."
            className="h-32 rounded-2xl bg-background/40 border-white/10 focus:ring-primary/20 transition-all font-medium text-sm p-4 resize-none"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
          />
          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground/60 px-1">
            <Info className="h-3 w-3" />
            AI uses this content to simulate a real-world experience-based interview.
          </div>
        </div>
      )}
    </div>
  );
}
