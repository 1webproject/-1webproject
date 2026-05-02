import { postRepository } from "@/lib/repositories/postRepository";

export async function GET() {
    const posts = await postRepository.findAll();
    return Response.json(posts);
}

export async function POST(request) {
    const data = await request.json();
    const post = await postRepository.create(data);

    return Response.json(post, {
        status: 201,
    });
}

export async function PUT(request) {
    const data = await request.json();

    const result = await postRepository.toggleLike(
        data.postId,
        data.userId
    );

    return Response.json(result);
}

export async function DELETE(request) {
    const data = await request.json();

    await postRepository.delete(data.postId);

    return Response.json({
        success: true,
    });
}