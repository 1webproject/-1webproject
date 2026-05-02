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