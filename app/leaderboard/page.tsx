"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LeaderboardPage() {
    const leaderboard = useQuery(api.users.getMemberLeaderboard, { limit: 15 });
    const topProjects = useQuery(api.projects.getTopProjects, { limit: 5 });

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Leaderboard</h1>
                <p className="page-description">Member rankings and top projects</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
                {/* Members Leaderboard */}
                <div>
                    <h2 className="section-title" style={{ marginBottom: "var(--space-5)" }}>
                        Top Members
                    </h2>
                    <div className="leaderboard-card">
                        {leaderboard === undefined ? (
                            <div className="loading-center">
                                <div className="spinner"></div>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="empty-state" style={{ padding: "var(--space-8)" }}>
                                <p className="empty-state-description">No members yet</p>
                            </div>
                        ) : (
                            <table className="leaderboard-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Member</th>
                                        <th>Total</th>
                                        <th>Done</th>
                                        <th>Live</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboard.map((member, index) => (
                                        <tr key={member.username}>
                                            <td className={`rank-cell ${index < 3 ? "rank-top" : ""}`}>
                                                {index + 1}
                                            </td>
                                            <td>
                                                <div className="member-cell">
                                                    <span className="member-avatar">
                                                        {member.username.charAt(0).toUpperCase()}
                                                    </span>
                                                    <a
                                                        href={`https://github.com/${member.username}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: "var(--text-primary)" }}
                                                    >
                                                        @{member.username}
                                                    </a>
                                                </div>
                                            </td>
                                            <td className="stat-cell">{member.total}</td>
                                            <td className="stat-cell" style={{ color: "var(--status-complete)" }}>
                                                {member.completed}
                                            </td>
                                            <td className="stat-cell" style={{ color: "var(--status-deployed)" }}>
                                                {member.deployed}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Top Projects */}
                <div>
                    <h2 className="section-title" style={{ marginBottom: "var(--space-5)" }}>
                        Top Rated
                    </h2>
                    {topProjects === undefined ? (
                        <div className="loading-center">
                            <div className="spinner"></div>
                        </div>
                    ) : topProjects.length === 0 ? (
                        <div className="empty-state" style={{
                            padding: "var(--space-8)",
                            background: "var(--bg-secondary)",
                            borderRadius: "var(--radius-lg)",
                            border: "1px solid var(--border-subtle)"
                        }}>
                            <p className="empty-state-description">No rated projects</p>
                            <Link href="/projects" className="btn btn-primary btn-sm">
                                Browse Projects
                            </Link>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                            {topProjects.map((project, index) => (
                                <div
                                    key={project._id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "var(--space-4)",
                                        padding: "var(--space-4)",
                                        background: "var(--bg-secondary)",
                                        border: "1px solid var(--border-subtle)",
                                        borderRadius: "var(--radius-md)",
                                    }}
                                >
                                    <span style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 14,
                                        fontWeight: 700,
                                        color: index < 3 ? "var(--star-filled)" : "var(--text-dim)",
                                        minWidth: 24,
                                    }}>
                                        {index + 1}
                                    </span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Link
                                            href={`/projects/${project._id}`}
                                            style={{
                                                fontWeight: 600,
                                                fontSize: 14,
                                                color: "var(--text-primary)",
                                                display: "block",
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            }}
                                        >
                                            {project.title}
                                        </Link>
                                        <span style={{
                                            fontSize: 12,
                                            color: "var(--text-muted)",
                                        }}>
                                            @{project.githubUsername}
                                        </span>
                                    </div>
                                    <div style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: "var(--star-filled)"
                                    }}>
                                        {project.averageRating.toFixed(1)}★
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
