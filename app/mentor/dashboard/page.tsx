"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useMentor } from "../../lib/auth";

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

const tierConfig: Record<number, { label: string; emoji: string; color: string }> = {
    1: { label: "Featured", emoji: "✦", color: "var(--accent)" },
    2: { label: "Highlighted", emoji: "✧", color: "var(--text-white)" },
    3: { label: "Showcased", emoji: "✓", color: "var(--text-secondary)" },
};

export default function MentorDashboardPage() {
    const router = useRouter();
    const { mentor, isLoading: authLoading } = useMentor();

    const stats = useQuery(api.projects.getStats);
    const projects = useQuery(api.projects.getProjects, {});

    const updateStatus = useMutation(api.projects.updateProjectStatus);
    const updateTier = useMutation(api.projects.updateProjectTier);
    const addReview = useMutation(api.reviews.addReview);

    const [reviewProjectId, setReviewProjectId] = useState<Id<"projects"> | null>(null);
    const [reviewContent, setReviewContent] = useState("");
    const [reviewStatus, setReviewStatus] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading && !mentor) {
            router.push("/mentor/login");
        }
    }, [mentor, authLoading, router]);

    if (authLoading) {
        return (
            <div className="page-container">
                <div className="loading-center">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (!mentor) {
        return null;
    }

    const handleStatusChange = async (projectId: Id<"projects">, newStatus: string) => {
        try {
            await updateStatus({
                projectId,
                status: newStatus as ProjectStatus,
            });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    const handleTierChange = async (projectId: Id<"projects">, newTier: string) => {
        if (!newTier) return;
        try {
            await updateTier({
                projectId,
                tier: parseInt(newTier) as 1 | 2 | 3,
            });
        } catch (error) {
            console.error("Error updating tier:", error);
            alert("Failed to update tier");
        }
    };

    const handleAddReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reviewProjectId || !reviewContent.trim()) return;

        setIsSubmitting(true);
        try {
            await addReview({
                projectId: reviewProjectId,
                mentorId: mentor.id as Id<"users">,
                mentorName: mentor.name,
                content: reviewContent.trim(),
                statusUpdate: reviewStatus
                    ? (reviewStatus as ProjectStatus)
                    : undefined,
            });

            setReviewProjectId(null);
            setReviewContent("");
            setReviewStatus("");
        } catch (error) {
            console.error("Error adding review:", error);
            alert("Failed to add review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="page-container" style={{ paddingBottom: "100px" }}>
            <div className="page-header">
                <h1 className="page-title">Mentor Dashboard</h1>
                <p className="page-description">
                    Welcome back, {mentor.name}! Manage projects and review submissions.
                </p>
            </div>

            {/* Stats */}
            <div className="dashboard-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
                <div className="dashboard-stat">
                    <div className="dashboard-stat-label">Total Projects</div>
                    <div className="dashboard-stat-value">{stats?.totalProjects ?? "—"}</div>
                </div>
                <div className="dashboard-stat">
                    <div className="dashboard-stat-label">Pending Review</div>
                    <div className="dashboard-stat-value" style={{ color: "var(--status-pending)" }}>
                        {projects?.filter((p) => p.status === "pending").length ?? "—"}
                    </div>
                </div>
                <div className="dashboard-stat">
                    <div className="dashboard-stat-label">Sorta Ready</div>
                    <div className="dashboard-stat-value" style={{ color: "var(--status-complete)" }}>
                        {stats?.completedProjects ?? "—"}
                    </div>
                </div>
                <div className="dashboard-stat">
                    <div className="dashboard-stat-label">Deployed</div>
                    <div className="dashboard-stat-value" style={{ color: "var(--status-deployed)" }}>
                        {stats?.deployedProjects ?? "—"}
                    </div>
                </div>
                <div className="dashboard-stat" style={{ borderColor: "var(--border-accent)" }}>
                    <div className="dashboard-stat-label">✦ Featured</div>
                    <div className="dashboard-stat-value" style={{ color: "var(--accent)" }}>
                        {stats?.tier1Projects ?? "—"}
                    </div>
                </div>
                <div className="dashboard-stat" style={{ borderColor: "var(--border-bright)" }}>
                    <div className="dashboard-stat-label">✧ Highlighted</div>
                    <div className="dashboard-stat-value" style={{ color: "var(--text-white)" }}>
                        {stats?.tier2Projects ?? "—"}
                    </div>
                </div>
                <div className="dashboard-stat" style={{ borderColor: "var(--border-dim)" }}>
                    <div className="dashboard-stat-label">✓ Showcased</div>
                    <div className="dashboard-stat-value" style={{ color: "var(--text-secondary)" }}>
                        {stats?.tier3Projects ?? "—"}
                    </div>
                </div>
            </div>

            {/* Projects Table */}
            <div className="project-section">
                <h2 className="project-section-title">All Projects</h2>

                {projects === undefined ? (
                    <div className="loading-center" style={{ minHeight: "200px" }}>
                        <div className="spinner"></div>
                    </div>
                ) : projects.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-state-description">No projects submitted yet.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table className="projects-table">
                            <thead>
                                <tr>
                                    <th>Tier</th>
                                    <th>Project</th>
                                    <th>Submitter</th>
                                    <th>Domain</th>
                                    <th>Status Detail</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => {
                                    const tier = project.tier ? tierConfig[project.tier] : null;
                                    const rowBg = project.tier === 1
                                        ? "rgba(204, 255, 0, 0.02)"
                                        : project.tier === 2
                                            ? "rgba(255, 255, 255, 0.02)"
                                            : project.tier === 3
                                                ? "rgba(255, 255, 255, 0.01)"
                                                : "transparent";
                                    const rowBorder = project.tier === 1
                                        ? "2px solid rgba(204, 255, 0, 0.3)"
                                        : project.tier === 2
                                            ? "2px solid rgba(255, 255, 255, 0.15)"
                                            : project.tier === 3
                                                ? "2px solid rgba(255, 255, 255, 0.05)"
                                                : "none";

                                    return (
                                        <tr key={project._id} style={{ background: rowBg, borderLeft: rowBorder }}>
                                            <td>
                                                <select
                                                    value={project.tier?.toString() || ""}
                                                    onChange={(e) => handleTierChange(project._id, e.target.value)}
                                                    className="form-select"
                                                    style={{
                                                        padding: "6px 10px",
                                                        fontSize: 13,
                                                        width: "auto",
                                                        minWidth: "90px",
                                                        color: tier?.color || "var(--text-secondary)",
                                                    }}
                                                >
                                                    <option value="">No Tier</option>
                                                    <option value="1">✦ Featured</option>
                                                    <option value="2">✧ Highlighted</option>
                                                    <option value="3">✓ Showcased</option>
                                                </select>
                                            </td>
                                            <td>
                                                <Link
                                                    href={`/projects/${project._id}`}
                                                    style={{ fontWeight: 600, color: "var(--text-white)" }}
                                                >
                                                    {project.title}
                                                </Link>
                                                <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
                                                    @{project.githubUsername}
                                                </div>
                                            </td>
                                            <td>{project.submitterName}</td>
                                            <td>
                                                <span className="domain-tag">{project.domain}</span>
                                            </td>
                                            <td>
                                                <select
                                                    value={project.status}
                                                    onChange={(e) => handleStatusChange(project._id, e.target.value)}
                                                    className="form-select"
                                                    style={{ padding: "6px 12px", fontSize: 13, width: "auto" }}
                                                >
                                                    <optgroup label="Basic">
                                                        <option value="pending">Pending</option>
                                                        <option value="incomplete">Incomplete</option>
                                                    </optgroup>
                                                    <optgroup label="Completed">
                                                        <option value="complete">Complete</option>
                                                        <option value="completed-great">Completed — Great</option>
                                                        <option value="completed-good">Completed — Good</option>
                                                        <option value="completed-decent">Completed — Decent</option>
                                                        <option value="completed-bad">Completed — Bad</option>
                                                    </optgroup>
                                                    <optgroup label="Deployed">
                                                        <option value="deployed">Deployed</option>
                                                        <option value="deployed-great">Deployed — Great</option>
                                                        <option value="deployed-good">Deployed — Good</option>
                                                        <option value="deployed-decent">Deployed — Decent</option>
                                                        <option value="deployed-bad">Deployed — Bad</option>
                                                    </optgroup>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn btn-sm btn-secondary"
                                                    onClick={() => setReviewProjectId(project._id)}
                                                >
                                                    Review
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewProjectId && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="modal-title">Add Review</h2>
                        <form onSubmit={handleAddReview}>
                            <div className="form-group">
                                <label className="form-label">Review Content</label>
                                <textarea
                                    value={reviewContent}
                                    onChange={(e) => setReviewContent(e.target.value)}
                                    className="form-textarea"
                                    rows={5}
                                    placeholder="Write your constructive feedback..."
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Update Status (Optional)</label>
                                <select
                                    value={reviewStatus}
                                    onChange={(e) => setReviewStatus(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="">No status change</option>
                                    <optgroup label="Basic">
                                        <option value="pending">Pending</option>
                                        <option value="incomplete">Incomplete</option>
                                    </optgroup>
                                    <optgroup label="Completed">
                                        <option value="complete">Complete</option>
                                        <option value="completed-great">Completed — Great</option>
                                        <option value="completed-good">Completed — Good</option>
                                        <option value="completed-decent">Completed — Decent</option>
                                        <option value="completed-bad">Completed — Bad</option>
                                    </optgroup>
                                    <optgroup label="Deployed">
                                        <option value="deployed">Deployed</option>
                                        <option value="deployed-great">Deployed — Great</option>
                                        <option value="deployed-good">Deployed — Good</option>
                                        <option value="deployed-decent">Deployed — Decent</option>
                                        <option value="deployed-bad">Deployed — Bad</option>
                                    </optgroup>
                                </select>
                            </div>
                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-ghost"
                                    onClick={() => {
                                        setReviewProjectId(null);
                                        setReviewContent("");
                                        setReviewStatus("");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={isSubmitting || !reviewContent.trim()}
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Review"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
