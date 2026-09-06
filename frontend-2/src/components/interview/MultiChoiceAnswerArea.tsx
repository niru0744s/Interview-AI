import { CheckSquare2, Square } from "lucide-react";
import { cn } from "../../lib/utils";

interface MultiChoiceAnswerAreaProps {
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
  disabled?: boolean;
}

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function MultiChoiceAnswerArea({
  options,
  selectedOptions,
  onToggle,
  disabled = false,
}: MultiChoiceAnswerAreaProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
          <span>Select all that apply</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold">
            Multiple Choice
          </span>
        </label>
        <span className="text-xs font-bold text-primary">
          {selectedOptions.length} selected
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map((option, index) => {
          const letter = OPTION_LETTERS[index] || `${index + 1}`;
          const isSelected = selectedOptions.includes(option);

          return (
            <button
              key={index}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(option)}
              className={cn(
                "group relative w-full text-left p-4 sm:p-5 rounded-2xl transition-all duration-200",
                "border flex items-center gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                isSelected
                  ? "bg-purple-500/10 border-purple-500/50 text-foreground shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/40"
                  : "bg-card/40 border-white/10 hover:border-white/20 hover:bg-card/70 text-foreground/80",
                disabled && "opacity-60 cursor-not-allowed"
              )}
            >
              {/* Option letter badge */}
              <div
                className={cn(
                  "h-9 w-9 rounded-xl flex items-center justify-center text-sm font-black transition-colors shrink-0",
                  isSelected
                    ? "bg-purple-500 text-white shadow-md"
                    : "bg-muted/70 text-muted-foreground group-hover:bg-muted group-hover:text-foreground border border-white/10"
                )}
              >
                {letter}
              </div>

              {/* Option text */}
              <div className="flex-1 text-base sm:text-lg font-medium leading-relaxed">
                {option}
              </div>

              {/* Checkbox indicator */}
              <div className="shrink-0 text-purple-400 transition-transform">
                {isSelected ? (
                  <CheckSquare2 className="h-6 w-6 fill-purple-500/20 text-purple-400" />
                ) : (
                  <Square className="h-5 w-5 text-muted-foreground/30 group-hover:text-muted-foreground/60" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
