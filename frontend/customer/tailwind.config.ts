import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                amazon: {
                    yellow: "#FF9900",
                    orange: "#FF9900",
                    dark: "#131921",
                    light: "#232F3E",
                    blue: "#146EB4",
                    hover: "#FEBD69",
                },
                ai: {
                    green: "#10B981",
                    blue: "#3B82F6",
                    purple: "#8B5CF6",
                    amber: "#F59E0B",
                    red: "#EF4444",
                },
            },
            fontFamily: {
                amazon: [
                    "Amazon Ember",
                    "Arial",
                    "sans-serif",
                ],
            },
        },
    },
    plugins: [],
};

export default config;
