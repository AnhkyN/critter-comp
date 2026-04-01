"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {
  // Holds selected image file
  const [file, setFile] = useState<File | null>(null)

  // Holds caption text
  const [caption, setCaption] = useState("")

  // Tracks loading state
  const [loading, setLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)

    // Create unique filename
    const fileName = `${Date.now()}-${file.name}`

    // Upload image to Supabase storage
    const { error: storageError } = await supabase.storage
      .from("images")
      .upload(fileName, file)

    if (storageError) {
      console.error(storageError)
      setLoading(false)
      return
    }

    // Get public URL of uploaded image
    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(fileName)

    const imageUrl = data.publicUrl

    // Insert post into database
    const result = await supabase.from("posts").insert([
    {
        created_at: new Date().toISOString(),
        caption,
        location: "unknown",
        image_url: imageUrl,
    },
    ])

    console.log("FULL RESULT:", result)
    console.log("ERROR STRINGIFIED:", JSON.stringify(result.error, null, 2))

    if (result.error) {
    console.error("Insert error:", result.error)
    setLoading(false)
    return
    }

    // Reset form
    setFile(null)
    setCaption("")
    setLoading(false)

    // Redirect to homepage after upload
    window.location.href = "/"
  }

  return (
    <main className="min-h-screen bg-[#f3ffc7] p-6">
      <h1 className="text-3xl mb-6">Upload Critter</h1>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      <input
        type="text"
        placeholder="Caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="block mb-4 p-2 border rounded w-full"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-green-700 text-white px-4 py-2 rounded"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>
    </main>
  )
}