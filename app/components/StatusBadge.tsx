"use client";

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

interface StatusBadgeProps {
    status: ProjectStatus;
    size?: "sm" | "md";
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
    pending: {
        label: "Pending",
        className: "status-pending",
    },
    incomplete: {
        label: "In Progress",
        className: "status-incomplete",
    },
    complete: {
        label: "Complete",
        className: "status-complete",
    },
    "completed-good": {
        label: "Completed — Good",
        className: "status-completed-good",
    },
    "completed-decent": {
        label: "Completed — Decent",
        className: "status-completed-decent",
    },
    "completed-great": {
        label: "Completed — Great",
        className: "status-completed-great",
    },
    "completed-bad": {
        label: "Completed — Bad",
        className: "status-completed-bad",
    },
    deployed: {
        label: "Deployed",
        className: "status-deployed",
    },
    "deployed-good": {
        label: "Deployed — Good",
        className: "status-deployed-good",
    },
    "deployed-decent": {
        label: "Deployed — Decent",
        className: "status-deployed-decent",
    },
    "deployed-great": {
        label: "Deployed — Great",
        className: "status-deployed-great",
    },
    "deployed-bad": {
        label: "Deployed — Bad",
        className: "status-deployed-bad",
    },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
    const config = statusConfig[status] || statusConfig.pending;

    return (
        <span className={`status-badge ${config.className} ${size === "sm" ? "status-sm" : ""}`}>
            <span className="status-dot" />
            {config.label}
        </span>
    );
}
