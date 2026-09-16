"use client";

import { useEffect, useState } from "react";
import { CakeSlice, Moon } from "lucide-react";
import { usePathname } from "next/navigation";
import { DrawablyButton } from "drawably/react";

const STORAGE_KEY = "chaiforms-theme";

type Theme = "cupcake" | "brownie";

export function ThemeToggle() {
    const pathname = usePathname();
    const [theme, setTheme] = useState<Theme>("cupcake");
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
        const nextTheme = saved === "brownie" ? "brownie" : "cupcake";
        setTheme(nextTheme);
        document.body.dataset.theme = nextTheme;
        document.documentElement.classList.remove("dark");
    }, []);

    const selectTheme = (nextTheme: Theme) => {
        setTheme(nextTheme);
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        document.body.dataset.theme = nextTheme;
        setIsOpen(false);
    };

    if (pathname !== "/") return null;

    return (
        <div className="theme-toggle absolute right-6 top-5 z-50">
            <DrawablyButton seed={4238380619} roughness={0.9} boil={0.2} width={2.5}
                type="button"
                variant="outline"
                onClick={() => setIsOpen((open) => !open)}
                aria-label="Choose theme"
                aria-expanded={isOpen}
                aria-haspopup="menu"
                title="Choose theme"
                className="size-10 bg-[#fffdf7] text-[#5c3d2e]"
            >
                {theme === "cupcake" ? <Moon className="size-4" /> : <CakeSlice className="size-4" />}
            </DrawablyButton>

            {isOpen && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 min-w-36 rounded-xl border-2 border-[#5c3d2e] bg-[#fffdf7] p-1.5 text-sm text-[#5c3d2e] shadow-[3px_3px_0_#5c3d2e]"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => selectTheme("cupcake")}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-[#ffe0e8] ${theme === "cupcake" ? "font-bold" : ""}`}
                    >
                        <Moon className="size-4" />
                        Cupcake
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => selectTheme("brownie")}
                        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition hover:bg-[#f3dfc1] ${theme === "brownie" ? "font-bold" : ""}`}
                    >
                        <CakeSlice className="size-4" />
                        Brownie
                    </button>
                </div>
            )}
        </div>
    );
}
