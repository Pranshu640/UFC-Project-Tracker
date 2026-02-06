"use client";

interface ReviewCardProps {
    review: {
        mentorName: string;
        content: string;
        statusUpdate?: string;
        createdAt: number;
    };
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <div className="review-card">
            <div className="review-header">
                <div className="reviewer-info">
                    <span className="reviewer-avatar">
                        {review.mentorName.charAt(0).toUpperCase()}
                    </span>
                    <div className="reviewer-details">
                        <span className="reviewer-name">{review.mentorName}</span>
                        <span className="review-date">{formatDate(review.createdAt)}</span>
                    </div>
                </div>
                {review.statusUpdate && (
                    <span className="status-change">
                        Status updated to <strong>{review.statusUpdate}</strong>
                    </span>
                )}
            </div>
            <p className="review-content">{review.content}</p>
        </div>
    );
}
