"use client";

import { useState, useRef, useEffect } from "react";

// Comprehensive list of technologies grouped by category
const TECH_CATEGORIES = {
    "Frontend": [
        "React", "Next.js", "Vue.js", "Angular", "Svelte", "SvelteKit",
        "HTML5", "CSS3", "SASS/SCSS", "TailwindCSS", "Bootstrap",
        "Material UI", "Chakra UI", "Ant Design", "Styled Components"
    ],
    "Backend": [
        "Node.js", "Express.js", "NestJS", "Fastify",
        "Python", "Django", "Flask", "FastAPI",
        "Java", "Spring Boot", "Kotlin",
        "Go", "Rust", "Ruby on Rails", "PHP", "Laravel"
    ],
    "Database": [
        "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite",
        "Firebase", "Supabase", "Convex", "PlanetScale",
        "Prisma", "Drizzle", "GraphQL"
    ],
    "Mobile": [
        "React Native", "Flutter", "Swift", "SwiftUI",
        "Kotlin", "Jetpack Compose", "Expo"
    ],
    "DevOps & Cloud": [
        "Docker", "Kubernetes", "AWS", "GCP", "Azure",
        "Vercel", "Netlify", "Railway", "Heroku",
        "GitHub Actions", "CI/CD", "Terraform"
    ],
    "Languages": [
        "TypeScript", "JavaScript", "Python", "Java", "C++",
        "C#", "Go", "Rust", "Dart", "Swift", "Kotlin"
    ],
    "AI/ML": [
        "TensorFlow", "PyTorch", "OpenAI API", "LangChain",
        "Hugging Face", "scikit-learn", "Pandas", "NumPy"
    ],
    "Web3": [
        "Solidity", "Web3.js", "Ethers.js", "Hardhat",
        "Truffle", "IPFS", "Wagmi", "Viem"
    ],
    "Tools & Others": [
        "Git", "Figma", "Unity", "Unreal Engine",
        "Electron", "Tauri", "WebSockets", "REST API"
    ]
};

// Flatten all options for search
const ALL_TECH_OPTIONS = Object.values(TECH_CATEGORIES).flat();

interface TechStackSelectorProps {
    selected: string[];
    onChange: (selected: string[]) => void;
}

export function TechStackSelector({ selected, onChange }: TechStackSelectorProps) {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [showCategories, setShowCategories] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Filter options based on query
    const filteredOptions = query
        ? ALL_TECH_OPTIONS.filter(
            (option) =>
                option.toLowerCase().includes(query.toLowerCase()) &&
                !selected.includes(option)
        )
        : [];

    const handleSelect = (option: string) => {
        if (!selected.includes(option)) {
            onChange([...selected, option]);
        }
        setQuery("");
        setShowCategories(false);
        inputRef.current?.focus();
    };

    const handleRemove = (option: string) => {
        onChange(selected.filter((item) => item !== option));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0]);
            }
        } else if (e.key === "Backspace" && !query && selected.length > 0) {
            handleRemove(selected[selected.length - 1]);
        } else if (e.key === "Escape") {
            setIsFocused(false);
            setShowCategories(false);
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
                setShowCategories(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="tech-stack-selector" ref={containerRef} style={{ position: "relative" }}>
            {/* Main Input Container */}
            <div
                onClick={() => {
                    inputRef.current?.focus();
                    setIsFocused(true);
                }}
                style={{
                    border: isFocused ? "1px solid var(--accent)" : "1px solid var(--border-dim)",
                    background: "var(--bg-deep)",
                    padding: "10px 12px",
                    borderRadius: "var(--radius-sm)",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    minHeight: "52px",
                    alignItems: "center",
                    cursor: "text",
                    transition: "all 0.2s ease",
                    boxShadow: isFocused ? "0 0 0 3px rgba(204, 255, 0, 0.1)" : "none"
                }}
            >
                {/* Selected Tags */}
                {selected.map((tech) => (
                    <span
                        key={tech}
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "5px 10px",
                            borderRadius: "20px",
                            background: "rgba(204, 255, 0, 0.1)",
                            border: "1px solid rgba(204, 255, 0, 0.3)",
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "var(--accent)",
                            whiteSpace: "nowrap",
                            animation: "fadeIn 0.2s ease"
                        }}
                    >
                        {tech}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove(tech);
                            }}
                            style={{
                                border: "none",
                                background: "rgba(255,255,255,0.1)",
                                color: "var(--accent)",
                                cursor: "pointer",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                transition: "all 0.15s ease",
                                fontSize: "12px",
                                lineHeight: 1
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(255,100,100,0.3)";
                                e.currentTarget.style.color = "#ff6b6b";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                                e.currentTarget.style.color = "var(--accent)";
                            }}
                        >
                            ×
                        </button>
                    </span>
                ))}

                {/* Input Field */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowCategories(false);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={selected.length === 0 ? "Type to search (e.g. React, Python, Docker)..." : "Add more..."}
                    style={{
                        flex: 1,
                        minWidth: "150px",
                        background: "transparent",
                        border: "none",
                        color: "var(--text-white)",
                        fontSize: "14px",
                        outline: "none",
                        fontFamily: "var(--font-body)",
                        padding: "2px 0"
                    }}
                />
            </div>

            {/* Helper Text & Browse Button */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "8px"
            }}>
                <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                    {selected.length > 0
                        ? `${selected.length} technolog${selected.length === 1 ? 'y' : 'ies'} selected`
                        : "Start typing to search technologies"
                    }
                </span>
                <button
                    type="button"
                    onClick={() => setShowCategories(!showCategories)}
                    style={{
                        background: "transparent",
                        border: "1px solid var(--border-dim)",
                        color: "var(--text-secondary)",
                        padding: "4px 10px",
                        borderRadius: "var(--radius-full)",
                        fontSize: "11px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--accent)";
                        e.currentTarget.style.color = "var(--accent)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-dim)";
                        e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                    Browse All
                </button>
            </div>

            {/* Search Results Dropdown */}
            {isFocused && query && filteredOptions.length > 0 && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        maxHeight: "240px",
                        overflowY: "auto",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-dim)",
                        borderRadius: "var(--radius-sm)",
                        marginTop: "4px",
                        zIndex: 100,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
                    }}
                >
                    {filteredOptions.slice(0, 8).map((option, index) => (
                        <div
                            key={option}
                            onClick={() => handleSelect(option)}
                            style={{
                                padding: "10px 14px",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: "var(--text-primary)",
                                transition: "all 0.1s ease",
                                borderBottom: index < filteredOptions.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "rgba(204, 255, 0, 0.05)";
                                e.currentTarget.style.color = "var(--accent)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                                e.currentTarget.style.color = "var(--text-primary)";
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                            {option}
                        </div>
                    ))}
                    {filteredOptions.length > 8 && (
                        <div style={{ padding: "8px 14px", fontSize: "12px", color: "var(--text-muted)", textAlign: "center" }}>
                            +{filteredOptions.length - 8} more results
                        </div>
                    )}
                </div>
            )}

            {/* No Results */}
            {isFocused && query && filteredOptions.length === 0 && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-dim)",
                        borderRadius: "var(--radius-sm)",
                        marginTop: "4px",
                        padding: "16px",
                        textAlign: "center",
                        zIndex: 100
                    }}
                >
                    <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
                        No matching technologies found
                    </p>
                </div>
            )}

            {/* Category Browser Modal */}
            {showCategories && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        maxHeight: "350px",
                        overflowY: "auto",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-dim)",
                        borderRadius: "var(--radius-sm)",
                        marginTop: "4px",
                        zIndex: 100,
                        boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                        padding: "12px"
                    }}
                >
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "12px",
                        paddingBottom: "10px",
                        borderBottom: "1px solid var(--border-dim)"
                    }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-white)" }}>
                            Browse Technologies
                        </span>
                        <button
                            type="button"
                            onClick={() => setShowCategories(false)}
                            style={{
                                background: "transparent",
                                border: "none",
                                color: "var(--text-muted)",
                                cursor: "pointer",
                                fontSize: "18px",
                                lineHeight: 1,
                                padding: "2px"
                            }}
                        >
                            ×
                        </button>
                    </div>

                    {Object.entries(TECH_CATEGORIES).map(([category, techs]) => (
                        <div key={category} style={{ marginBottom: "14px" }}>
                            <div style={{
                                fontSize: "11px",
                                fontWeight: "600",
                                color: "var(--text-muted)",
                                textTransform: "uppercase",
                                letterSpacing: "0.05em",
                                marginBottom: "8px"
                            }}>
                                {category}
                            </div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                {techs.map((tech) => {
                                    const isSelected = selected.includes(tech);
                                    return (
                                        <button
                                            key={tech}
                                            type="button"
                                            onClick={() => isSelected ? handleRemove(tech) : handleSelect(tech)}
                                            style={{
                                                padding: "5px 10px",
                                                borderRadius: "var(--radius-full)",
                                                fontSize: "12px",
                                                fontWeight: "500",
                                                cursor: "pointer",
                                                transition: "all 0.15s ease",
                                                border: isSelected
                                                    ? "1px solid var(--accent)"
                                                    : "1px solid var(--border-dim)",
                                                background: isSelected
                                                    ? "rgba(204, 255, 0, 0.15)"
                                                    : "transparent",
                                                color: isSelected
                                                    ? "var(--accent)"
                                                    : "var(--text-secondary)"
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = "var(--text-secondary)";
                                                    e.currentTarget.style.color = "var(--text-white)";
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isSelected) {
                                                    e.currentTarget.style.borderColor = "var(--border-dim)";
                                                    e.currentTarget.style.color = "var(--text-secondary)";
                                                }
                                            }}
                                        >
                                            {isSelected && (
                                                <span style={{ marginRight: "4px" }}>✓</span>
                                            )}
                                            {tech}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
}
