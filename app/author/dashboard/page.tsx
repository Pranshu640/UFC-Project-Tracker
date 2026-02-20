"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAuthor } from "../../lib/auth";
import StatusBadge from "../../components/StatusBadge";
import { TechStackSelector } from "../../components/TechStackSelector";

const domains = [
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

export default function AuthorDashboardPage() {
    const router = useRouter();
    const { author, setAuthor, logout } = useAuthor();
    const [isClient, setIsClient] = useState(false);

    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordLoading, setPasswordLoading] = useState(false);

    const changePasswordFn = useMutation(api.projectAuth.changePassword);
    const updateProjectFn = useMutation(api.projectAuth.updateProject);

    // Editing State
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (isClient && !author) {
            router.push("/author/login");
        } else if (isClient && author?.needsPasswordChange) {
            setPasswordModalOpen(true);
        }
    }, [isClient, author, router]);

    const myProjects = useQuery(
        api.projectAuth.getMyProjects,
        author ? { githubUsername: author.githubUsername } : "skip"
    );

    if (!isClient || !author) {
        return <div style={{ padding: "4rem", textAlign: "center" }}>Loading...</div>;
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordLoading(true);

        try {
            await changePasswordFn({
                name: author.name,
                githubUsername: author.githubUsername,
                oldPassword,
                newPassword,
            });
            setAuthor({
                ...author,
                needsPasswordChange: false,
            });
            setPasswordModalOpen(false);
        } catch (e: any) {
            setPasswordError(e.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleEditClick = (project: any) => {
        setEditingProjectId(project._id);
        setEditForm({
            title: project.title,
            description: project.description,
            domain: project.domain,
            githubRepoLink: project.githubRepoLink,
            deployedLink: project.deployedLink || "",
            linkedinPost: project.linkedinPost || "",
            techStack: project.techStack ? [...project.techStack] : [],
        });
    };

    const handleUpdateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");

        if (!editForm.title.trim() || !editForm.description.trim()) {
            return;
        }

        try {
            await updateProjectFn({
                projectId: editingProjectId as any,
                githubUsername: author.githubUsername,
                title: editForm.title,
                description: editForm.description,
                domain: editForm.domain,
                githubRepoLink: editForm.githubRepoLink,
                deployedLink: editForm.deployedLink || undefined,
                linkedinPost: editForm.linkedinPost || undefined,
                techStack: editForm.techStack,
            });
            setEditingProjectId(null);
            setEditForm(null);
        } catch (e: any) {
            console.error(e);
            alert("Error updating project: " + e.message);
        }
    };

    return (
        <div className="page-container" style={{ padding: "calc(var(--nav-height) + 2rem) 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-8)", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: "0.5rem" }}>Welcome, {author.name}</h1>
                    <p className="page-subtitle">Manage your submitted projects.</p>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                    {!author.needsPasswordChange && (
                        <button className="btn btn-secondary" onClick={() => setPasswordModalOpen(true)}>
                            Change Password
                        </button>
                    )}
                    <button
                        onClick={() => {
                            logout();
                            router.push("/");
                        }}
                        className="btn btn-secondary"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {/* Change Password Modal */}
            {passwordModalOpen && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1000,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)"
                }}>
                    <div className="form-card" style={{ maxWidth: 400, width: "100%", padding: "var(--space-8)", animation: "fadeInUp 0.3s ease" }}>
                        <h2 className="form-card-title" style={{ textAlign: "center", marginBottom: "0.5rem" }}>
                            {author.needsPasswordChange ? "Set Your Password" : "Change Password"}
                        </h2>
                        <p className="form-card-subtitle" style={{ textAlign: "center", marginBottom: "var(--space-6)" }}>
                            {author.needsPasswordChange ? "For security, please set a custom password for future logins." : "Update your account password."}
                        </p>

                        {passwordError && <div className="alert alert-error">{passwordError}</div>}

                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label className="form-label">{author.needsPasswordChange ? "Current Auth Code (Phone No)" : "Current Password"}</label>
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    required
                                    className="form-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                style={{ width: "100%", marginTop: "var(--space-4)" }}
                                disabled={passwordLoading}
                            >
                                {passwordLoading ? "Saving..." : "Save Password"}
                            </button>
                            {!author.needsPasswordChange && (
                                <button
                                    type="button"
                                    className="btn btn-secondary btn-lg"
                                    style={{ width: "100%", marginTop: "var(--space-2)" }}
                                    onClick={() => setPasswordModalOpen(false)}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}

            {/* Editing Modal */}
            {editingProjectId && editForm && (
                <div style={{
                    position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
                    backgroundColor: "rgba(0,0,0,0.8)", zIndex: 1000,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", overflowY: "auto",
                    backdropFilter: "blur(4px)"
                }}>
                    <div className="form-card" style={{ maxWidth: 600, width: "100%", padding: "var(--space-8)", maxHeight: "90vh", overflowY: "auto", animation: "fadeInUp 0.3s ease" }}>
                        <h2 className="form-card-title">Edit Project Info</h2>
                        <form onSubmit={handleUpdateProject} style={{ marginTop: "1rem" }}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input type="text" className="form-input" value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} required rows={4} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Domain</label>
                                <select
                                    className="form-select"
                                    value={editForm.domain}
                                    onChange={e => setEditForm({ ...editForm, domain: e.target.value })}
                                    required
                                >
                                    <option value="">Select domain</option>
                                    {domains.map((domain) => (
                                        <option key={domain} value={domain}>
                                            {domain}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">GitHub Repo Link</label>
                                <input type="url" className="form-input" value={editForm.githubRepoLink} onChange={e => setEditForm({ ...editForm, githubRepoLink: e.target.value })} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Deployed Link (optional)</label>
                                    <input type="url" className="form-input" value={editForm.deployedLink} onChange={e => setEditForm({ ...editForm, deployedLink: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">LinkedIn Post (optional)</label>
                                    <input type="url" className="form-input" value={editForm.linkedinPost} onChange={e => setEditForm({ ...editForm, linkedinPost: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Tech Stack</label>
                                <p style={{
                                    fontSize: "12px",
                                    color: "var(--text-muted)",
                                    marginBottom: "var(--space-2)",
                                    marginTop: "-4px"
                                }}>
                                    Add the technologies, frameworks, and tools used in your project
                                </p>
                                <TechStackSelector
                                    selected={editForm.techStack}
                                    onChange={(newStack) => setEditForm({ ...editForm, techStack: newStack })}
                                />
                            </div>
                            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Changes</button>
                                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => { setEditingProjectId(null); setEditForm(null); }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "var(--space-8)", marginTop: "var(--space-8)" }}>
                <h2 className="page-title" style={{ fontSize: "1.5rem", marginBottom: "var(--space-6)" }}>Your Projects</h2>
                {myProjects === undefined ? (
                    <p className="page-subtitle">Loading projects...</p>
                ) : myProjects.length === 0 ? (
                    <p className="page-subtitle">You have not submitted any projects yet.</p>
                ) : (
                    <div className="projects-grid">
                        {myProjects.map((project) => (
                            <div key={project._id} className="project-card" style={{ display: "flex", flexDirection: "column" }}>
                                <div className="card-header" style={{ paddingBottom: 0 }}>
                                    <div className="card-meta">
                                        <span className="domain-tag">{project.domain}</span>
                                        <StatusBadge status={project.status} size="sm" />
                                    </div>
                                </div>
                                <div className="card-content" style={{ flexGrow: 1 }}>
                                    <h3 className="card-title">{project.title}</h3>
                                    <p className="card-description">
                                        {project.description.length > 100 ? project.description.slice(0, 100) + "..." : project.description}
                                    </p>
                                </div>
                                <div style={{ padding: "0 var(--space-4) var(--space-4) var(--space-4)" }}>
                                    <button
                                        className="btn btn-secondary"
                                        style={{ width: "100%", color: "var(--accent)" }}
                                        onClick={() => handleEditClick(project)}
                                    >
                                        Edit Properties
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
