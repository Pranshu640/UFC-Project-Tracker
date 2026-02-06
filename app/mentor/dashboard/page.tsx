"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { useMentor } from "../../lib/auth";

export default function MentorDashboardPage() {
    const router = useRouter();
    const { mentor, isLoading: authLoading } = useMentor();

    const stats = useQuery(api.projects.getStats);
    const projects = useQuery(api.projects.getProjects, {});

    const updateStatus = useMutation(api.projects.updateProjectStatus);
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
                status: newStatus as "pending" | "incomplete" | "complete" | "deployed",
            });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
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
                    ? (reviewStatus as "pending" | "incomplete" | "complete" | "deployed")
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
            <div className="dashboard-grid">
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
                                    <th>Project</th>
                                    <th>Submitter</th>
                                    <th>Domain</th>
                                    <th>Status Detail</th>
                                    <th>Rating</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project) => (
                                    <tr key={project._id}>
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
                                                <option value="pending">Pending</option>
                                                <option value="incomplete">Incomplete</option>
                                                <option value="complete">Complete</option>
                                                <option value="deployed">Deployed</option>
                                            </select>
                                        </td>
                                        <td>
                                            {project.averageRating > 0 ? (
                                                <span style={{ color: "var(--status-pending)" }}>
                                                    {project.averageRating.toFixed(1)} ★
                                                </span>
                                            ) : (
                                                <span className="text-muted">—</span>
                                            )}
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
                                ))}
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
                                    <option value="pending">Pending</option>
                                    <option value="incomplete">Incomplete</option>
                                    <option value="complete">Complete</option>
                                    <option value="deployed">Deployed</option>
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
