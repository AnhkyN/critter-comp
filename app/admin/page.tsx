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

  // Preview
  const [preview, setPreview] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!file) return

    setLoading(true)

    // Create unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}.${fileExt}`

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

    // Clean up preview memory
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)

    // Reset form
    setFile(null)
    setCaption("")
    setLoading(false)
    }

  return (
    <main className="min-h-screen bg-[#f3ffc7] p-6">
      <h1 className="text-3xl mb-6">Upload Critter</h1>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0] || null
          setFile(selectedFile)

          if (selectedFile) {
            setPreview(URL.createObjectURL(selectedFile))
          }
        }}
        className="mb-4"
      />

      {preview && (
        <img
          src={preview}
          alt="preview"
          className="mb-4 rounded-lg max-h-80 object-cover"
        />
      )}

      <input
        type="text"
        placeholder="Caption..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        className="block mb-4 p-2 border rounded w-full"
      />

      <button
        onClick={handleUpload}
        disabled={loading || !file}
        className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post Critter 🐾"}
      </button>
    </main>
  )
}