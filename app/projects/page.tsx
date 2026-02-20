"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ProjectCard from "../components/ProjectCard";
import { TechStackSelector } from "../components/TechStackSelector";

const domains = [
    "all",
    "Web Development",
    "Mobile Development",
    "AI/ML",
    "Data Science",
    "DevOps",
    "Blockchain",
    "Game Development",
    "IoT",
    "Cybersecurity",
    "Other",
];

const statuses = [
    "all",
    "pending",
    "incomplete",
    "complete",
    "completed-great",
    "completed-good",
    "completed-decent",
    "completed-bad",
    "deployed",
    "deployed-great",
    "deployed-good",
    "deployed-decent",
    "deployed-bad",
];

const statusLabels: Record<string, string> = {
    all: "All Status",
    pending: "Pending",
    incomplete: "Incomplete",
    complete: "Complete",
    "completed-great": "Completed — Great",
    "completed-good": "Completed — Good",
    "completed-decent": "Completed — Decent",
    "completed-bad": "Completed — Bad",
    deployed: "Deployed",
    "deployed-great": "Deployed — Great",
    "deployed-good": "Deployed — Good",
    "deployed-decent": "Deployed — Decent",
    "deployed-bad": "Deployed — Bad",
};

const tierInfo: Record<number, { label: string; emoji: string; color: string; bg: string; border: string }> = {
    1: {
        label: "Tier 1 — Elite",
        emoji: "🏆",
        color: "#FFD700",
        bg: "rgba(255, 215, 0, 0.06)",
        border: "rgba(255, 215, 0, 0.25)",
    },
    2: {
        label: "Tier 2 — Solid",
        emoji: "⚡",
        color: "#C0C0C0",
        bg: "rgba(192, 192, 192, 0.04)",
        border: "rgba(192, 192, 192, 0.2)",
    },
    3: {
        label: "Tier 3 — Needs Work",
        emoji: "📌",
        color: "#CD7F32",
        bg: "rgba(205, 127, 50, 0.04)",
        border: "rgba(205, 127, 50, 0.2)",
    },
};

export default function ProjectsPage() {
    const [statusFilter, setStatusFilter] = useState("all");
    const [domainFilter, setDomainFilter] = useState("all");
    const [techStackFilter, setTechStackFilter] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const projects = useQuery(api.projects.getProjects, {
        status: statusFilter === "all" ? undefined : statusFilter,
        domain: domainFilter === "all" ? undefined : domainFilter,
        searchQuery: searchQuery || undefined,
        techStack: techStackFilter,
    });

    // Group projects by tier
    const tier1 = projects?.filter((p) => p.tier === 1) || [];
    const tier2 = projects?.filter((p) => p.tier === 2) || [];
    const tier3 = projects?.filter((p) => p.tier === 3) || [];
    const untiered = projects?.filter((p) => !p.tier) || [];

    const renderTierSection = (tier: number, tierProjects: typeof tier1) => {
        if (tierProjects.length === 0) return null;
        const info = tierInfo[tier];

        return (
            <div
                className="tier-section"
                style={{
                    marginBottom: "var(--space-10)",
                    padding: "var(--space-6)",
                    borderRadius: "var(--radius-lg)",
                    background: info.bg,
                    border: `1px solid ${info.border}`,
                }}
            >
                <div
                    className="tier-section-header"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-3)",
                        marginBottom: "var(--space-6)",
                        paddingBottom: "var(--space-4)",
                        borderBottom: `1px solid ${info.border}`,
                    }}
                >
                    <span style={{ fontSize: 28 }}>{info.emoji}</span>
                    <div>
                        <h2
                            style={{
                                fontFamily: "var(--font-display)",
                                fontSize: 24,
                                fontWeight: 700,
                                color: info.color,
                                margin: 0,
                            }}
                        >
                            {info.label}
                        </h2>
                        <span
                            style={{
                                fontSize: 13,
                                color: "var(--text-secondary)",
                            }}
                        >
                            {tierProjects.length} project{tierProjects.length !== 1 ? "s" : ""}
                        </span>
                    </div>
                </div>
                <div className="projects-grid">
                    {tierProjects.map((project) => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="page-container">
            <div className="page-header" style={{ textAlign: "center", marginBottom: "var(--space-10)" }}>
                <h1 className="page-title" style={{ fontSize: 32 }}>Explore Projects</h1>
                <p className="page-description">
                    Discover what the community is building
                </p>
            </div>

            {/* Filters */}
            <div className="filters-bar" style={{
                display: "flex",
                flexDirection: "column",
                gap: "var(--space-4)",
                marginBottom: "var(--space-8)",
                maxWidth: 900,
                margin: "0 auto var(--space-8)"
            }}>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "var(--space-3)" }}>
                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="form-input"
                            style={{ paddingLeft: 40 }}
                        />
                        <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}
                        >
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <select
                        value={domainFilter}
                        onChange={(e) => setDomainFilter(e.target.value)}
                        className="form-select"
                    >
                        {domains.map((domain) => (
                            <option key={domain} value={domain}>
                                {domain === "all" ? "All Domains" : domain}
                            </option>
                        ))}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="form-select"
                    >
                        {statuses.map((status) => (
                            <option key={status} value={status}>
                                {statusLabels[status] || status}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tech Stack Filter */}
                <div>
                    <label style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "var(--space-1)", display: "block" }}>Filter by Tech Stack</label>
                    <TechStackSelector
                        selected={techStackFilter}
                        onChange={setTechStackFilter}
                    />
                </div>
            </div>

            {/* Content */}
            {projects === undefined ? (
                <div style={{ display: "flex", justifyContent: "center", padding: "var(--space-12)" }}>
                    <div className="spinner" style={{
                        width: 24, height: 24,
                        border: "2px solid var(--border-default)",
                        borderTopColor: "var(--text-primary)",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}></div>
                    <style jsx>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
            ) : projects.length === 0 ? (
                <div className="empty-state" style={{ textAlign: "center", padding: "var(--space-12)", color: "var(--text-secondary)" }}>
                    <p style={{ fontSize: 16, fontWeight: 500, marginBottom: "var(--space-2)" }}>No projects found</p>
                    <p>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div>
                    {/* Tiered Sections */}
                    {renderTierSection(1, tier1)}
                    {renderTierSection(2, tier2)}
                    {renderTierSection(3, tier3)}

                    {/* Untiered */}
                    {untiered.length > 0 && (
                        <div style={{ marginBottom: "var(--space-10)" }}>
                            {(tier1.length > 0 || tier2.length > 0 || tier3.length > 0) && (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "var(--space-3)",
                                        marginBottom: "var(--space-6)",
                                        paddingBottom: "var(--space-4)",
                                        borderBottom: "1px solid var(--border-dim)",
                                    }}
                                >
                                    <span style={{ fontSize: 28 }}>📋</span>
                                    <div>
                                        <h2
                                            style={{
                                                fontFamily: "var(--font-display)",
                                                fontSize: 24,
                                                fontWeight: 700,
                                                color: "var(--text-secondary)",
                                                margin: 0,
                                            }}
                                        >
                                            Untiered
                                        </h2>
                                        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
                                            {untiered.length} project{untiered.length !== 1 ? "s" : ""} — awaiting tier assignment
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="projects-grid">
                                {untiered.map((project) => (
                                    <ProjectCard key={project._id} project={project} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
