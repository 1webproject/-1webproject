import prisma from "@/lib/prisma";

export const postRepository = {

    async findAll() {
        return prisma.post.findMany({
            include: {
                user: true,
                likes: true,
                comments: true,
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    },

    async create(data) {
        return prisma.post.create({
            data,
        });
    },

    async toggleLike(postId, userId) {
        const existingLike = await prisma.like.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id,
                },
            });

            return { liked: false };
        }

        await prisma.like.create({
            data: {
                userId,
                postId,
            },
        });

        return { liked: true };
    },

};