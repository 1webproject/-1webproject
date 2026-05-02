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
        return prisma.follow.upsert({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
            update: {},
            create: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        });
    },
};