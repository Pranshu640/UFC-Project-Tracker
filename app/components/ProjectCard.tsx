"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import StatusBadge from "./StatusBadge";
import { Id } from "../../convex/_generated/dataModel";

type ProjectStatus =
    | "pending"
    | "incomplete"
    | "complete"
    | "completed-good"
    | "completed-decent"
    | "completed-great"
    | "completed-bad"
    | "deployed"
    | "deployed-good"
    | "deployed-decent"
    | "deployed-great"
    | "deployed-bad";

interface ProjectCardProps {
    project: {
        _id: Id<"projects">;
        title: string;
        description: string;
        domain: string;
        githubUsername: string;
        githubRepoLink: string;
        deployedLink?: string;
        previewImageId?: Id<"_storage">;
        status: ProjectStatus;
        tier?: 1 | 2 | 3;
        techStack?: string[];
    };
}

const tierConfig = {
    1: { label: "Featured", emoji: "✦", className: "tier-1" },
    2: { label: "Highlighted", emoji: "✧", className: "tier-2" },
    3: { label: "Showcased", emoji: "✓", className: "tier-3" },
};

export default function ProjectCard({ project }: ProjectCardProps) {
    const imageUrl = useQuery(
        api.storage.getImageUrl,
        project.previewImageId ? { storageId: project.previewImageId } : "skip"
    );

    const tier = project.tier ? tierConfig[project.tier] : null;

    return (
        <div className={`project-card ${tier ? tier.className : ""}`}>
            {/* Tier Badge */}
            {tier && (
                <div className={`tier-badge ${tier.className}`}>
                    <span>{tier.emoji}</span>
                    <span>{tier.label}</span>
                </div>
            )}

            {/* Preview Image */}
            <div className="card-image-container">
                {imageUrl ? (
                    <Link href={`/projects/${project._id}`} className="card-image">
                        <img
                            src={imageUrl}
                            alt={project.title}
                        />
                    </Link>
                ) : (
                    <Link href={`/projects/${project._id}`} className="card-image">
                        <div className="placeholder-pattern">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                            </svg>
                        </div>
                    </Link>
                )}
            </div>

            <div className="card-header">
                <div className="card-meta">
                    <span className="domain-tag">{project.domain}</span>
                    <StatusBadge status={project.status} size="sm" />
                    {project.techStack && project.techStack.length > 0 && (
                        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px" }}>
                            {project.techStack.slice(0, 3).map(tech => (
                                <span key={tech} className="domain-tag" style={{ fontSize: "9px", opacity: 0.8 }}>
                                    {tech}
                                </span>
                            ))}
                            {project.techStack.length > 3 && (
                                <span className="domain-tag" style={{ fontSize: "9px", opacity: 0.6 }}>
                                    +{project.techStack.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Link href={`/projects/${project._id}`} className="card-content">
                <h3 className="card-title">{project.title}</h3>
                <p className="card-description">
                    {project.description.length > 100
                        ? project.description.slice(0, 100) + "..."
                        : project.description}
                </p>
            </Link>

            <div className="card-footer">
                <div className="card-author">
                    <a
                        href={`https://github.com/${project.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="github-link"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        @{project.githubUsername}
                    </a>
                </div>
            </div>

            <div className="card-actions">
                <a
                    href={project.githubRepoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-btn secondary"
                    title="View Repository"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                </a>
                {project.deployedLink && (
                    <a
                        href={project.deployedLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn primary"
                        title="View Live Site"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                    </a>
                )}
            </div>
        </div>
    );
}
