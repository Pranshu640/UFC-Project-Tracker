"use client";

import { useState } from "react";

interface StarRatingProps {
    rating: number;
    onRate?: (rating: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
    showCount?: boolean;
    count?: number;
}

export default function StarRating({
    rating,
    onRate,
    readonly = false,
    size = "md",
    showCount = false,
    count = 0,
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);

    const displayRating = hoverRating || rating;

    const handleClick = (value: number) => {
        if (!readonly && onRate) {
            onRate(value);
        }
    };

    const sizeClass = {
        sm: "star-sm",
        md: "star-md",
        lg: "star-lg",
    }[size];

    return (
        <div className={`star-rating ${sizeClass} ${readonly ? "readonly" : "interactive"}`}>
            <div className="stars">
                {[1, 2, 3, 4, 5].map((value) => (
                    <button
                        key={value}
                        className={`star ${value <= displayRating ? "filled" : "empty"}`}
                        onClick={() => handleClick(value)}
                        onMouseEnter={() => !readonly && setHoverRating(value)}
                        onMouseLeave={() => !readonly && setHoverRating(0)}
                        disabled={readonly}
                        type="button"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            fill={value <= displayRating ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                    </button>
                ))}
            </div>
            {showCount && (
                <span className="rating-info">
                    <span className="rating-value">{rating.toFixed(1)}</span>
                    <span className="rating-count">({count})</span>
                </span>
            )}
        </div>
    );
}
