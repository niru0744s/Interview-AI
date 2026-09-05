import { useEffect } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "../../lib/utils";

interface MCQAnswerAreaProps {
  options: string[];
  selectedOption: string;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function MCQAnswerArea({
  options,
  selectedOption,
  onSelect,
  disabled = false,
}: MCQAnswerAreaProps) {
  // Support keyboard shortcuts (1-9, A-D)
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;

      // Check number keys 1-9
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= options.length) {
        e.preventDefault();
        onSelect(options[num - 1]);
        return;
      }

      // Check letter keys A-H
      const keyUpper = e.key.toUpperCase();
      const letterIndex = OPTION_LETTERS.indexOf(keyUpper);
      if (letterIndex !== -1 && letterIndex < options.length) {
        e.preventDefault();
        onSelect(options[letterIndex]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, onSelect, disabled]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
          <span>Choose the correct answer</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">
            Single Choice
          </span>
        </label>
        <span className="text-[11px] text-muted-foreground/50 hidden sm:inline">
          Use keys <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">1-4</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">A-D</kbd>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => {
          const letter = OPTION_LETTERS[index] || `${index + 1}`;
          const isSelected = selectedOption === option;

          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option)}
              className={cn(
                "group relative w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200",
                "border flex items-center gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "bg-primary/10 border-primary/60 text-foreground shadow-[0_0_20px_rgba(56,189,248,0.15)] ring-1 ring-primary/40"
                  : "bg-card/40 border-white/10 hover:border-white/20 hover:bg-card/70 text-foreground/80",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              {/* Option letter pill */}
              <div
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black transition-colors shrink-0",
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground border border-white/10"
                )}
              >
                {letter}
              </div>

              {/* Option text */}
              <div className="flex-1 text-base sm:text-lg font-medium leading-relaxed">
                {option}
              </div>

              {/* Radio indicator */}
              <div className="shrink-0 text-primary transition-transform">
                {isSelected ? (
                  <CheckCircle2 className="h-6 w-6 fill-primary/20 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
