import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { RotateCcw, Copy, Check, Code2, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

interface CodingAnswerAreaProps {
  code: string;
  onChange: (code: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  starterCode?: string | null;
  disabled?: boolean;
}

const SUPPORTED_LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "jsx", label: "React (JSX)" },
  { value: "tsx", label: "React (TSX)" },
  { value: "html", label: "HTML/CSS" },
  { value: "sql", label: "SQL" },
  { value: "java", label: "Java" },
  { value: "cpp", label: "C++" },
  { value: "go", label: "Go" },
];

export default function CodingAnswerArea({
  code,
  onChange,
  language = "javascript",
  onLanguageChange,
  starterCode,
  disabled = false,
}: CodingAnswerAreaProps) {
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Split code into lines for the line numbers gutter
  const lines = code.split("\n");
  const lineCount = Math.max(lines.length, 12);

  // Synchronize scroll between textarea and line numbers gutter
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Support Tab key indentation inside textarea
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      const newCode = code.substring(0, start) + "  " + code.substring(end);
      onChange(newCode);

      // Reposition cursor after the inserted spaces
      requestAnimationFrame(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      });
    }
  };

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  const handleReset = () => {
    if (starterCode !== undefined && starterCode !== null) {
      onChange(starterCode);
    } else {
      onChange("");
    }
  };

  // If initial starterCode is provided and code is currently empty, prefill it
  useEffect(() => {
    if (!code && starterCode) {
      onChange(starterCode);
    }
  }, [starterCode]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-2">
      {/* Editor Frame */}
      <div className="rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl overflow-hidden group focus-within:border-primary/40 transition-colors">
        {/* IDE Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-white/5 select-none">
          {/* Window dots & title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground/80 pl-2">
              <Code2 className="h-3.5 w-3.5 text-primary" />
              <span>solution.{language === "python" ? "py" : language === "typescript" || language === "tsx" ? "tsx" : "js"}</span>
            </div>
          </div>

          {/* Action tools */}
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            {onLanguageChange ? (
              <select
                value={language.toLowerCase()}
                onChange={(e) => onLanguageChange(e.target.value)}
                disabled={disabled}
                aria-label="Programming Language"
                className="text-xs font-mono font-bold bg-[#0d1117] text-primary border border-white/10 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-[#161b22] text-foreground">
                    {lang.label}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-mono font-bold uppercase px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                {language}
              </span>
            )}

            {/* Reset to starter code */}
            {starterCode !== undefined && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleReset}
                disabled={disabled}
                title="Reset to starter code"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
              </Button>
            )}

            {/* Copy button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              disabled={!code || disabled}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-400 mr-1" /> Copied
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Editor Body with Line Numbers */}
        <div className="relative flex min-h-[360px] max-h-[540px]">
          {/* Line Numbers Gutter */}
          <div
            ref={lineNumbersRef}
            aria-hidden="true"
            className="w-12 py-4 select-none bg-[#090d13] text-muted-foreground/30 text-xs font-mono text-right pr-3 overflow-hidden border-r border-white/5 flex flex-col leading-6 shrink-0"
          >
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="h-6">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code Textarea */}
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            disabled={disabled}
            placeholder="// Write your solution here...&#10;// Full React components, backend logic, algorithms, or DB queries welcome."
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className={cn(
              "flex-1 p-4 bg-transparent text-emerald-400/90 font-mono text-sm leading-6 resize-none",
              "focus:outline-none overflow-y-auto selection:bg-primary/20",
              disabled && "opacity-60 cursor-not-allowed"
            )}
            style={{ tabSize: 2 }}
          />
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#161b22]/70 border-t border-white/5 text-[11px] text-muted-foreground/60 font-mono">
          <div className="flex items-center gap-2">
            <Sparkles className="h-3 w-3 text-primary/70" />
            <span className="hidden sm:inline">AI evaluates logic, cleanliness, edge cases & best practices.</span>
          </div>
          <div className="flex items-center gap-3">
            <span>{lines.length} {lines.length === 1 ? "line" : "lines"}</span>
            <span>•</span>
            <span>{code.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
}
