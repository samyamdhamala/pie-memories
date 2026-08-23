import type { MemoryMediaType } from "../types";
import { MemoryUploadForm } from "./MemoryUploadForm";

export function MemoryComposerModal({
  onSubmit,
  onClose,
}: {
  onSubmit: (mediaType: MemoryMediaType, mediaUrl: string, caption: string) => Promise<void>;
  onClose: () => void;
}) {
  return (
    <div className="composer-overlay" onClick={onClose}>
      <div className="composer-modal" onClick={(e) => e.stopPropagation()}>
        <div className="composer-header">
          <h3>New memory</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <MemoryUploadForm
          onSubmit={async (mediaType, mediaUrl, caption) => {
            await onSubmit(mediaType, mediaUrl, caption);
            onClose();
          }}
        />
      </div>
    </div>
  );
}
