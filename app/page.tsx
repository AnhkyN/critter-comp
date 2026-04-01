import { supabase } from "@/lib/supabase"

export default async function Home() {
  // Fetch posts from database (latest first)
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
  }

  return (
    <main className="min-h-screen bg-[#f3ffc7] p-6">
      {/* Header */}
      <h1 className="text-6xl font-oi text-[#24ed4b] drop-shadow-[2px_2px_0px_rgb(0,0,0)] mb-10 text-center">
        Critter Comp
      </h1>

      {/* Feed */}
      <div className="max-w-2xl mx-auto space-y-10">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              {/* Image */}
              <img
                src={post.image_url}
                alt="critter"
                className="w-full object-cover"
              />

              {/* Caption */}
              <div className="p-4">
                {post.caption && (
                  <p className="text-gray-800 mb-2">{post.caption}</p>
                )}

                {/* Date */}
                <p className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600">
            No critters :(
          </p>
        )}
      </div>
    </main>
  )
}