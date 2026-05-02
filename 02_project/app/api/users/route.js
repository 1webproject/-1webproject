import { userRepository } from "@/lib/repositories/userRepository";

export async function GET() {
    const users = await userRepository.findAll();
    return Response.json(users);
}