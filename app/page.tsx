"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import ProjectCard from "./components/ProjectCard";

export default function Home() {
  const stats = useQuery(api.projects.getStats);
  const recentProjects = useQuery(api.projects.getProjects, {});

  // Get most recent 6 projects
  const displayProjects = recentProjects?.slice(0, 6);

  return (
    <div>
      {/* Hero - Massive & Artistic */}
      {/* Hero - Massive & Artistic */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-badge">The Definitive Hub For</div>
          <h1 className="hero-title">
            PROJECT SHOWCASE
          </h1>
          <p className="hero-subtitle">
            One platform for all club projects. No limits, no friction.
            Build, ship, and exhibit your best work to the world.
          </p>
          <div className="hero-actions">
            <Link href="/submit" className="btn btn-primary btn-lg">
              Submit Now
            </Link>
            <Link href="/projects" className="btn btn-secondary btn-lg">
              Browse All
            </Link>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">{stats?.totalProjects ?? "—"}</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: "var(--status-complete)" }}>
                {stats?.completedProjects ?? "—"}
              </div>
              <div className="stat-label">Completed</div>
            </div>
            <div className="stat-item">
              <div className="stat-value" style={{ color: "var(--accent)" }}>
                {stats?.deployedProjects ?? "—"}
              </div>
              <div className="stat-label">Live</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats?.totalMembers ?? "—"}</div>
              <div className="stat-label">Builders</div>
            </div>
          </div>

          <div className="scroll-indicator">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
            </svg>
            <span>Scroll</span>
          </div>
        </div>
      </section>

      {/* Recent Projects */}
      <section className="section">
        <div className="page-container" style={{ padding: 0 }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Latest Work</h2>
              <p className="section-subtitle">Fresh projects from the community</p>
            </div>
            <Link href="/projects" className="btn btn-ghost btn-sm">
              View All →
            </Link>
          </div>

          {displayProjects && displayProjects.length > 0 ? (
            <div className="projects-grid">
              {displayProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p className="empty-state-description">
                No projects yet. Be the first to ship!
              </p>
              <Link href="/submit" className="btn btn-primary">
                Submit Project
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
