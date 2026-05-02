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

    async toggleFollow(currentUserId, targetUserId) {
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: currentUserId,
                    followingId: targetUserId,
                },
            },
        });

        if (existingFollow) {
            await prisma.follow.delete({
                where: {
                    id: existingFollow.id,
                },
            });

            return { following: false };
        }

        await prisma.follow.create({
            data: {
                followerId: currentUserId,
                followingId: targetUserId,
            },
        });

        return { following: true };
    },
    async update(id, data) {
        return prisma.user.update({
            where: { id },
            data,
        });
    },
};