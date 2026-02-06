"use client";

interface StatusBadgeProps {
    status: "pending" | "incomplete" | "complete" | "deployed";
    size?: "sm" | "md";
}

const statusConfig = {
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
    deployed: {
        label: "Deployed",
        className: "status-deployed",
    },
};

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <span className={`status-badge ${config.className} ${size === "sm" ? "status-sm" : ""}`}>
            <span className="status-dot" />
            {config.label}
        </span>
    );
}
