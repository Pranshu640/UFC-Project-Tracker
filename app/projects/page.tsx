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

const statuses = ["all", "pending", "incomplete", "complete", "deployed"];

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
                                {status === "all"
                                    ? "All Status"
                                    : status.charAt(0).toUpperCase() + status.slice(1)}
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

            {/* Grid */}
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
                <div className="projects-grid">
                    {projects.map((project) => (
                        <ProjectCard key={project._id} project={project} />
                    ))}
                </div>
            )}
        </div>
    );
}
