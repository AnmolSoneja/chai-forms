"use client";

import { useEffect, useState } from "react";
import { CakeSlice, Moon } from "lucide-react";
import { DrawablyButton } from "drawably/react";

const STORAGE_KEY = "chaiforms-theme";

type Theme = "cupcake" | "brownie";

export function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>("cupcake");

    useEffect(() => {
        const saved = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
        const nextTheme = saved === "brownie" ? "brownie" : "cupcake";
        setTheme(nextTheme);
        document.body.dataset.theme = nextTheme;
        document.documentElement.classList.remove("dark");
    }, []);

    const toggleTheme = () => {
        const nextTheme = theme === "cupcake" ? "brownie" : "cupcake";
        setTheme(nextTheme);
        window.localStorage.setItem(STORAGE_KEY, nextTheme);
        document.body.dataset.theme = nextTheme;
    };

    return (
        <div className="theme-toggle fixed bottom-5 right-5 z-50">
            <DrawablyButton
                type="button"
                variant="solid"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "cupcake" ? "brownie" : "cupcake"} mode`}
                className="bg-[#ffb3c6] text-[#5c3d2e] shadow-[0_8px_24px_rgba(92,61,46,0.2)]"
            >
                {theme === "cupcake" ? <Moon className="size-4" /> : <CakeSlice className="size-4" />}
                {theme === "cupcake" ? "Brownie mode" : "Cupcake mode"}
            </DrawablyButton>
        </div>
    );
}
