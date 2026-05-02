import prisma from "@/lib/prisma";

export const statsRepository = {

    async getOverview() {

        const totalUsers = await prisma.user.count();

        const totalPosts = await prisma.post.count();

        const totalComments = await prisma.comment.count();

        const totalLikes = await prisma.like.count();

        const avgPostsPerUser =
            totalUsers > 0
                ? (totalPosts / totalUsers).toFixed(2)
                : 0;


        const mostActiveUser = await prisma.user.findFirst({
            include: {
                _count: {
                    select: {
                        posts: true,
                    },
                },
            },

            orderBy: {
                posts: {
                    _count: "desc",
                },
            },
        });


        const mostLikedPost = await prisma.post.findFirst({
            include: {
                user: true,

                _count: {
                    select: {
                        likes: true,
                    },
                },
            },

            orderBy: {
                likes: {
                    _count: "desc",
                },
            },
        });


        return {
            totalUsers,
            totalPosts,
            totalComments,
            totalLikes,
            avgPostsPerUser,
            mostActiveUser,
            mostLikedPost,
        };
    },

};