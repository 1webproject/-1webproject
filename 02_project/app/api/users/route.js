import { userRepository } from "@/lib/repositories/userRepository";

export async function GET() {
    const users = await userRepository.findAll();
    return Response.json(users);
}

export async function POST(request) {
    const data = await request.json();

    const user = await userRepository.create(data);

    return Response.json(user, {
        status: 201,
    });
}