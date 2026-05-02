import prisma from "@/lib/prisma";

export async function POST(request) {
    const data = await request.json();

    const comment = await prisma.comment.create({
        data: {
            content: data.content,
            userId: data.userId,
            postId: data.postId,
        },
    });

    return Response.json(comment, { status: 201 });
}

export async function DELETE(request) {
    const data = await request.json();

    await prisma.comment.delete({
        where: {
            id: data.commentId,
        },
    });

    return Response.json({ success: true });
}