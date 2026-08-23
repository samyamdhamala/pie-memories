import { useState } from "react";
import type { MemoryMediaType } from "../types";

const SAMPLE_PHOTOS = [
  "https://picsum.photos/seed/new1/600/600",
  "https://picsum.photos/seed/new2/600/600",
  "https://picsum.photos/seed/new3/600/600",
];

export function MemoryUploadForm({
  onSubmit,
}: {
  onSubmit: (mediaType: MemoryMediaType, mediaUrl: string, caption: string) => Promise<void>;
}) {
  const [mediaUrl, setMediaUrl] = useState(SAMPLE_PHOTOS[0]);
  const [caption, setCaption] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const shuffle = () => setMediaUrl(SAMPLE_PHOTOS[Math.floor(Math.random() * SAMPLE_PHOTOS.length)]);

  const submit = async () => {
    setSubmitting(true);
    try {
      await onSubmit("photo", mediaUrl, caption);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="upload-form">
      <div className="upload-preview">
        <img src={mediaUrl} alt="preview" />
      </div>
      <div className="upload-fields">
        <button type="button" className="btn btn-secondary" onClick={shuffle}>
          🔀 Use a different sample photo
        </button>
        <input
          type="text"
          placeholder="Add a caption…"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={140}
        />
        <button type="button" className="btn btn-primary" onClick={submit} disabled={submitting}>
          {submitting ? "Posting…" : "Post to Memories"}
        </button>
      </div>
    </div>
  );
}
