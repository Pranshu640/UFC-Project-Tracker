"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LeaderboardPage() {
    const leaderboard = useQuery(api.users.getMemberLeaderboard, { limit: 15 });

    return (
        <div className="page-container">
            <div className="page-header">
                <h1 className="page-title">Leaderboard</h1>
                <p className="page-description">Member rankings and top projects</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "var(--space-8)" }}>
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
            </div>
        </div>
    );
}
