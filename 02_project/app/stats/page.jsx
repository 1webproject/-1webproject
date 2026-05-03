import { statsRepository } from "@/lib/repositories/statsRepository";

export default async function StatsPage() {
    const stats = await statsRepository.getOverview();

    return (
        <main style={{ padding: "40px", fontFamily: "Arial" }}>
            <h1>Social Media Platform Statistics</h1>

            <section style={{ display: "grid", gap: "16px", marginTop: "24px" }}>
                <div>Total Users: {stats.totalUsers}</div>
                <div>Total Posts: {stats.totalPosts}</div>
                <div>Total Comments: {stats.totalComments}</div>
                <div>Total Likes: {stats.totalLikes}</div>
                <div>Average Posts Per User: {stats.avgPostsPerUser}</div>

                <div>
                    Most Active User: {stats.mostActiveUser?.username}
                </div>

                <div>
                    Most Liked Post: {stats.mostLikedPost?.content}
                </div>
            </section>
        </main>
    );
}