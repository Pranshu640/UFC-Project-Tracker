"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import StatusBadge from "../../components/StatusBadge";
import StarRating from "../../components/StarRating";
import ReviewCard from "../../components/ReviewCard";

export default function ProjectDetailPage() {
    const params = useParams();
    const projectId = params.id as Id<"projects">;

    const [githubUsername, setGithubUsername] = useState("");
    const [isRating, setIsRating] = useState(false);

    const project = useQuery(api.projects.getProject, { id: projectId });
    const reviews = useQuery(api.reviews.getProjectReviews, { projectId });
    const userRating = useQuery(
        api.ratings.getUserRating,
        githubUsername ? { projectId, raterGithub: githubUsername } : "skip"
    );

    // Fetch the preview image URL
    const imageUrl = useQuery(
        api.storage.getImageUrl,
        project?.previewImageId ? { storageId: project.previewImageId } : "skip"
    );

    const rateProject = useMutation(api.ratings.rateProject);

    const handleRate = async (score: number) => {
        if (!githubUsername.trim()) {
            alert("Please enter your GitHub username to rate");
            return;
        }

        try {
            await rateProject({
                projectId,
                raterGithub: githubUsername.trim(),
                score,
            });
        } catch (error) {
            console.error("Error rating project:", error);
            alert("Failed to rate project. Please try again.");
        }
    };

    if (project === undefined) {
        return (
            <div className="page-container">
                <div className="loading-center">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (project === null) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <h3 className="hero-title" style={{ fontSize: "24px", marginBottom: "var(--space-2)" }}>Project Not Found</h3>
                    <p className="empty-state-description">
                        This project may have been removed or doesn&apos;t exist.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container" style={{ paddingBottom: "120px" }}>
            {/* Hero Image */}
            {imageUrl && (
                <div className="project-hero-image">
                    <img src={imageUrl} alt={project.title} />
                </div>
            )}

            {/* Header */}
            <div className="project-detail-header">
                <div className="project-detail-meta">
                    <span className="domain-tag">{project.domain}</span>
                    <StatusBadge status={project.status} />
                    {project.tier && (
                        <span className={`tier-badge tier-${project.tier}`} style={{ fontSize: 12, padding: '4px 12px' }}>
                            <span>{project.tier === 1 ? '✦' : project.tier === 2 ? '✧' : '✓'}</span>
                            <span>{project.tier === 1 ? 'Featured' : project.tier === 2 ? 'Highlighted' : 'Showcased'}</span>
                        </span>
                    )}
                </div>
                <h1 className="project-detail-title">{project.title}</h1>
                <p className="project-detail-description">{project.description}</p>
            </div>

            {/* Project Info Grid */}
            <div className="project-info-grid">
                <div className="info-item">
                    <span className="info-label">Submitted By</span>
                    <span className="info-value">{project.submitterName}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">GitHub Username</span>
                    <div className="info-value">
                        <a
                            href={`https://github.com/${project.githubUsername}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            @{project.githubUsername}
                        </a>
                    </div>
                </div>
                <div className="info-item">
                    <span className="info-label">Repository</span>
                    <div className="info-value">
                        <a
                            href={project.githubRepoLink}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View on GitHub
                        </a>
                    </div>
                </div>
                {project.deployedLink && (
                    <div className="info-item">
                        <span className="info-label">Live Demo</span>
                        <div className="info-value">
                            <a
                                href={project.deployedLink}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Visit Site
                            </a>
                        </div>
                    </div>
                )}
                {project.linkedinPost && (
                    <div className="info-item">
                        <span className="info-label">LinkedIn Post</span>
                        <div className="info-value">
                            <a
                                href={project.linkedinPost}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Post
                            </a>
                        </div>
                    </div>
                )}
                <div className="info-item">
                    <span className="info-label">Submitted</span>
                    <span className="info-value">
                        {new Date(project.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                        })}
                    </span>
                </div>
            </div>

            {/* Rating Section */}
            <div className="project-section">
                <h2 className="project-section-title">
                    Rate Project
                </h2>
                <div className="rating-section">
                    <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: "8px" }}>
                            <StarRating
                                rating={project.averageRating}
                                readonly
                                size="lg"
                            />
                        </div>
                        <div className="rating-info">
                            <span className="rating-value">{project.averageRating.toFixed(1)}</span>
                            <span className="rating-count">({project.ratingCount} reviews)</span>
                        </div>
                    </div>

                    <div className="github-input-group">
                        <input
                            type="text"
                            placeholder="Enter GitHub ID to rate..."
                            value={githubUsername}
                            onChange={(e) => {
                                setGithubUsername(e.target.value);
                                setIsRating(true);
                            }}
                            className="form-input"
                        />
                    </div>
                    {isRating && githubUsername && (
                        <div>
                            <p className="rating-prompt">Your rating:</p>
                            <StarRating
                                rating={userRating || 0}
                                onRate={handleRate}
                                size="lg"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Reviews Section */}
            <div className="project-section">
                <h2 className="project-section-title">
                    Mentor Reviews ({reviews?.length || 0})
                </h2>
                {reviews && reviews.length > 0 ? (
                    <div className="reviews-list">
                        {reviews.map((review) => (
                            <ReviewCard key={review._id} review={review} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <p className="empty-state-description">
                            No reviews yet. Mentors will review this project soon.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
