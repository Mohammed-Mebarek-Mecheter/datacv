// components/theme-switch.tsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

export function ThemeSwitch() {
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <Switch
                id="dark-mode"
                checked={false}
                onCheckedChange={() => {}}
                aria-label="Toggle theme"
            />
        );
    }

    return (
        <Switch
            id="dark-mode"
            checked={theme === "dark"}
            onCheckedChange={(checked) => {
                setTheme(checked ? "dark" : "light");
            }}
            aria-label="Toggle theme"
        />
    );
}
