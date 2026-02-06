"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMentor } from "../lib/auth";
import { useState } from "react";

export default function Navbar() {
    const pathname = usePathname();
    const { mentor, logout } = useMentor();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link href="/" className="navbar-brand">
                    <div className="brand-icon">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <span className="brand-text">UFC Projects</span>
                </Link>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {isMobileMenuOpen ? (
                            <path d="M18 6L6 18M6 6l12 12" />
                        ) : (
                            <path d="M3 12h18M3 6h18M3 18h18" />
                        )}
                    </svg>
                </button>

                {/* Desktop & Mobile Menu Links */}
                <div className={`navbar-links-container ${isMobileMenuOpen ? 'open' : ''}`}>
                    <div className="navbar-links">
                        <Link
                            href="/"
                            className={`nav-link ${isActive("/") ? "active" : ""}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/projects"
                            className={`nav-link ${isActive("/projects") ? "active" : ""}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Projects
                        </Link>
                        <Link
                            href="/submit"
                            className={`nav-link ${isActive("/submit") ? "active" : ""}`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            Submit
                        </Link>
                    </div>

                    <div className="navbar-auth">
                        {mentor && (
                            <div className="mentor-menu">
                                <Link href="/mentor/dashboard" className="mentor-link" onClick={() => setIsMobileMenuOpen(false)}>
                                    <span className="mentor-avatar">
                                        {mentor.name.charAt(0).toUpperCase()}
                                    </span>
                                    <span className="mentor-name">{mentor.name}</span>
                                </Link>
                                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="logout-btn">
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
