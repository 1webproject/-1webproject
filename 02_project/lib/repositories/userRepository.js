import prisma from "@/lib/prisma";

export const userRepository = {

    async findAll() {
        return prisma.user.findMany({
            include: {
                posts: true,
                followers: true,
                following: true,
            },
        });
    },

    async findById(id) {
        return prisma.user.findUnique({
            where: {
                id,
            },

            include: {
                posts: true,
            },
        });
    },
    async create(data) {
        return prisma.user.create({
            data,
        });
    },

    async follow(currentUserId, targetUserId) {
        return prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        });
    }
};