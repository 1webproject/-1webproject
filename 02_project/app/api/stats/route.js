import { statsRepository } from "@/lib/repositories/statsRepository";

export async function GET() {
    const stats = await statsRepository.getOverview();
    return Response.json(stats);
}