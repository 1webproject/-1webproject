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

};