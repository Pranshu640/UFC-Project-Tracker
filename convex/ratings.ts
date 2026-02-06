import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Rate a project
export const rateProject = mutation({
    args: {
        projectId: v.id("projects"),
        raterGithub: v.string(),
        score: v.number(), // 1-5
    },
    handler: async (ctx, args) => {
        // Validate score
        if (args.score < 1 || args.score > 5) {
            throw new Error("Rating must be between 1 and 5");
        }

        // Check if user already rated this project
        const existingRating = await ctx.db
            .query("ratings")
            .withIndex("by_rater_project", (q) =>
                q.eq("raterGithub", args.raterGithub).eq("projectId", args.projectId)
            )
            .first();

        const project = await ctx.db.get(args.projectId);
        if (!project) {
            throw new Error("Project not found");
        }

        if (existingRating) {
            // Update existing rating
            const oldScore = existingRating.score;
            await ctx.db.patch(existingRating._id, {
                score: args.score,
                createdAt: Date.now(),
            });

            // Update project average
            const newTotalScore = project.totalRatingScore - oldScore + args.score;
            const newAverage = newTotalScore / project.ratingCount;

            await ctx.db.patch(args.projectId, {
                totalRatingScore: newTotalScore,
                averageRating: Math.round(newAverage * 10) / 10,
            });
        } else {
            // Create new rating
            await ctx.db.insert("ratings", {
                projectId: args.projectId,
                raterGithub: args.raterGithub,
                score: args.score,
                createdAt: Date.now(),
            });

            // Update project stats
            const newCount = project.ratingCount + 1;
            const newTotalScore = project.totalRatingScore + args.score;
            const newAverage = newTotalScore / newCount;

            await ctx.db.patch(args.projectId, {
                ratingCount: newCount,
                totalRatingScore: newTotalScore,
                averageRating: Math.round(newAverage * 10) / 10,
            });
        }

        return { success: true };
    },
});

// Get user's rating for a project
export const getUserRating = query({
    args: {
        projectId: v.id("projects"),
        raterGithub: v.string(),
    },
    handler: async (ctx, args) => {
        const rating = await ctx.db
            .query("ratings")
            .withIndex("by_rater_project", (q) =>
                q.eq("raterGithub", args.raterGithub).eq("projectId", args.projectId)
            )
            .first();

        return rating?.score || 0;
    },
});

// Get all ratings for a project
export const getProjectRatings = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("ratings")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();
    },
});
