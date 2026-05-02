import prisma from "../lib/prisma.js";

async function main() {

    const user1 = await prisma.user.create({
        data: {
            username: "taiser",
            email: "taiser@test.com",
            password: "123456",
            bio: "Trader",
        },
    });

    const user2 = await prisma.user.create({
        data: {
            username: "ahmed",
            email: "ahmed@test.com",
            password: "123456",
            bio: "Developer",
        },
    });

    const post1 = await prisma.post.create({
        data: {
            content: "My first post",
            userId: user1.id,
        },
    });

    const post2 = await prisma.post.create({
        data: {
            content: "Learning Next.js",
            userId: user2.id,
        },
    });

    await prisma.comment.createMany({
        data: [
            {
                content: "Nice post",
                userId: user2.id,
                postId: post1.id,
            },
            {
                content: "Great",
                userId: user1.id,
                postId: post2.id,
            },
        ],
    });

    await prisma.like.createMany({
        data: [
            {
                userId: user1.id,
                postId: post2.id,
            },
            {
                userId: user2.id,
                postId: post1.id,
            },
        ],
    });

    await prisma.follow.createMany({
        data: [
            {
                followerId: user1.id,
                followingId: user2.id,
            },
            {
                followerId: user2.id,
                followingId: user1.id,
            },
        ],
    });

    console.log("seed completed");
}

main()
    .catch((error) => {
        console.error(error);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });