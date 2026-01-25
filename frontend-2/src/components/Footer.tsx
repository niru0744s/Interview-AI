import { Rocket } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t border-white/5 pt-12 pb-8 mt-20">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
                <div className="flex items-center gap-2 grayscale group hover:grayscale-0 transition-all duration-500">
                    <Rocket className="h-4 w-4 text-primary" />
                    <span className="text-sm font-black tracking-tighter text-muted-foreground uppercase">Interview AI</span>
                </div>
                <p className="text-xs font-medium text-muted-foreground/60 max-w-sm leading-relaxed">
                    Crafted for the future of technical preparation. <br />
                    &copy; {new Date().getFullYear()} Interview AI. Dev Edition.
                </p>
                <div className="flex gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    <span className="hover:text-primary transition-colors cursor-pointer">Security</span>
                    <span className="hover:text-primary transition-colors cursor-pointer">Privacy</span>
                    <span className="hover:text-primary transition-colors cursor-pointer">Changelog</span>
                </div>
            </div>
        </footer>
    );
}
