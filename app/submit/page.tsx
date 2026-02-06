"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useToast } from "../components/Toast";
import { TechStackSelector } from "../components/TechStackSelector";

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

// Helper to extract error message from Convex errors
function getErrorMessage(err: unknown): string {
    if (err instanceof Error) {
        const message = err.message;
        if (message.includes("Uncaught Error:")) {
            return message.split("Uncaught Error:")[1].trim().split("\n")[0];
        }
        return message;
    }
    return "Something went wrong. Please try again.";
}

export default function SubmitPage() {
    const router = useRouter();
    const { showToast } = useToast();
    const createProject = useMutation(api.projects.createProject);
    const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(false);

    const [formData, setFormData] = useState({
        submitterName: "",
        contactNo: "",
        title: "",
        description: "",
        domain: "",
        githubUsername: "",
        githubRepoLink: "",
        deployedLink: "",
        linkedinPost: "",
        techStack: [] as string[],
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                showToast("Please select an image file", "error");
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast("Image must be less than 5MB", "error");
                return;
            }
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const validateForm = () => {
        if (!formData.submitterName.trim() || formData.submitterName.trim().length < 2) {
            return "Name must be at least 2 characters";
        }
        if (!formData.contactNo.trim()) return "Contact number is required";
        if (!formData.title.trim() || formData.title.trim().length < 3) {
            return "Title must be at least 3 characters";
        }
        if (!formData.description.trim() || formData.description.trim().length < 20) {
            return "Description must be at least 20 characters";
        }
        if (!formData.domain) return "Please select a domain";
        if (!formData.githubUsername.trim()) return "GitHub username is required";
        if (!formData.githubRepoLink.trim()) return "Repository link is required";
        if (!formData.githubRepoLink.includes("github.com")) return "Please enter a valid GitHub URL";
        if (formData.techStack.length === 0) return "Please select at least one technology";
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            showToast(validationError, "error");
            return;
        }

        setIsSubmitting(true);

        try {
            let previewImageId: Id<"_storage"> | undefined;

            // Upload image if selected
            if (imageFile) {
                setUploadProgress(true);
                const uploadUrl = await generateUploadUrl();
                const response = await fetch(uploadUrl, {
                    method: "POST",
                    headers: { "Content-Type": imageFile.type },
                    body: imageFile,
                });
                if (!response.ok) {
                    throw new Error("Failed to upload image");
                }
                const { storageId } = await response.json();
                previewImageId = storageId;
                setUploadProgress(false);
            }

            await createProject({
                submitterName: formData.submitterName.trim(),
                contactNo: formData.contactNo.trim(),
                title: formData.title.trim(),
                description: formData.description.trim(),
                domain: formData.domain,
                githubUsername: formData.githubUsername.trim(),
                githubRepoLink: formData.githubRepoLink.trim(),
                deployedLink: formData.deployedLink.trim() || undefined,
                linkedinPost: formData.linkedinPost.trim() || undefined,
                previewImageId,
                techStack: formData.techStack,
            });

            showToast("Project submitted successfully!", "success");
            setSuccess(true);
            setTimeout(() => router.push("/projects"), 1500);
        } catch (err) {
            const errorMessage = getErrorMessage(err);
            showToast(errorMessage, "error");
        } finally {
            setIsSubmitting(false);
            setUploadProgress(false);
        }
    };

    if (success) {
        return (
            <div className="page-container" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="form-card" style={{ textAlign: "center", width: "100%" }}>
                    <div className="success-icon-container">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 6L9 17l-5-5" />
                        </svg>
                    </div>
                    <h2 className="form-card-title">Submitted!</h2>
                    <p className="form-card-subtitle">
                        Redirecting to projects...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div style={{ textAlign: "center", marginBottom: "var(--space-8)" }}>
                <h1 className="hero-title" style={{ fontSize: "clamp(32px, 5vw, 64px)", marginBottom: "var(--space-2)" }}>Submit Project</h1>
                <p className="hero-subtitle" style={{ margin: "0 auto" }}>
                    Share your work with the community
                </p>
            </div>

            <div className="form-card">
                <form onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Name <span>*</span>
                            </label>
                            <input
                                type="text"
                                name="submitterName"
                                value={formData.submitterName}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Your name"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">
                                Contact <span>*</span>
                            </label>
                            <input
                                type="tel"
                                name="contactNo"
                                value={formData.contactNo}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Phone number"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Project Title <span>*</span>
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Project name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Description <span>*</span>
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="form-textarea"
                            rows={4}
                            placeholder="What does it do? Technologies used? (min 20 chars)"
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Preview Image</label>
                        <div
                            className="file-upload-area"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <div style={{ position: "relative" }}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{
                                            maxWidth: "100%",
                                            maxHeight: 200,
                                            borderRadius: "var(--radius-sm)",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeImage();
                                        }}
                                        style={{
                                            position: "absolute",
                                            top: -10,
                                            right: -10,
                                            width: 24,
                                            height: 24,
                                            borderRadius: "50%",
                                            background: "var(--accent)",
                                            border: "none",
                                            color: "black",
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 16,
                                            fontWeight: "bold"
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <svg
                                        className="upload-icon"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        strokeWidth="1.5"
                                    >
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                    <p className="upload-text">
                                        Click to upload a screenshot
                                    </p>
                                    <p className="upload-hint">
                                        PNG, JPG up to 5MB
                                    </p>
                                </>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">
                                Domain <span>*</span>
                            </label>
                            <select
                                name="domain"
                                value={formData.domain}
                                onChange={handleChange}
                                className="form-select"
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
                            <label className="form-label">
                                GitHub Username <span>*</span>
                            </label>
                            <input
                                type="text"
                                name="githubUsername"
                                value={formData.githubUsername}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="username"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Repo Link <span>*</span>
                        </label>
                        <input
                            type="url"
                            name="githubRepoLink"
                            value={formData.githubRepoLink}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="https://github.com/user/repo"
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Deployed URL</label>
                            <input
                                type="url"
                                name="deployedLink"
                                value={formData.deployedLink}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://your-app.vercel.app"
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">LinkedIn Post</label>
                            <input
                                type="url"
                                name="linkedinPost"
                                value={formData.linkedinPost}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="https://linkedin.com/posts/..."
                            />
                        </div>
                    </div>

                    {/* Tech Stack Selector */}
                    <div className="form-group">
                        <label className="form-label">
                            Tech Stack <span>*</span>
                        </label>
                        <p style={{
                            fontSize: "12px",
                            color: "var(--text-muted)",
                            marginBottom: "var(--space-2)",
                            marginTop: "-4px"
                        }}>
                            Add the technologies, frameworks, and tools used in your project
                        </p>
                        <TechStackSelector
                            selected={formData.techStack}
                            onChange={(newStack) => setFormData(prev => ({ ...prev, techStack: newStack }))}
                        />
                    </div>

                    <div style={{ marginTop: "var(--space-6)" }}>
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: "100%" }}
                            disabled={isSubmitting}
                        >
                            {uploadProgress ? "Uploading image..." : isSubmitting ? "Submitting..." : "Submit Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
