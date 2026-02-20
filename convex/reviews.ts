import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a review to a project (mentor only)
export const addReview = mutation({
    args: {
        projectId: v.id("projects"),
        mentorId: v.id("users"),
        mentorName: v.string(),
        content: v.string(),
        statusUpdate: v.optional(
            v.union(
                v.literal("pending"),
                v.literal("incomplete"),
                v.literal("complete"),
                v.literal("completed-good"),
                v.literal("completed-decent"),
                v.literal("completed-great"),
                v.literal("completed-bad"),
                v.literal("deployed"),
                v.literal("deployed-good"),
                v.literal("deployed-decent"),
                v.literal("deployed-great"),
                v.literal("deployed-bad")
            )
        ),
    },
    handler: async (ctx, args) => {
        // Create the review
        const reviewId = await ctx.db.insert("reviews", {
            projectId: args.projectId,
            mentorId: args.mentorId,
            mentorName: args.mentorName,
            content: args.content,
            statusUpdate: args.statusUpdate,
            createdAt: Date.now(),
        });

        // Update project status if provided
        if (args.statusUpdate) {
            await ctx.db.patch(args.projectId, { status: args.statusUpdate });
        }

        return reviewId;
    },
});

// Get all reviews for a project
export const getProjectReviews = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("reviews")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();
    },
});
