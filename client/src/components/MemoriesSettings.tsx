import type { Event, MemoriesWindow } from "../types";

const WINDOW_OPTIONS: { hours: MemoriesWindow; label: string }[] = [
  { hours: 24, label: "24 hours" },
  { hours: 48, label: "2 days" },
  { hours: 72, label: "3 days" },
  { hours: 168, label: "7 days" },
];

export function MemoriesSettings({
  event,
  onChange,
}: {
  event: Event;
  onChange: (enabled: boolean, windowHours: MemoriesWindow) => void;
}) {
  return (
    <div className="settings-panel">
      <div className="settings-row">
        <label className="toggle">
          <input
            type="checkbox"
            checked={event.memoriesEnabled}
            onChange={(e) => onChange(e.target.checked, event.memoriesWindowHours)}
          />
          <span>Memories enabled for this event</span>
        </label>
      </div>
      <div className="settings-row">
        <span className="settings-label">Visible for</span>
        <div className="segmented">
          {WINDOW_OPTIONS.map((opt) => (
            <button
              key={opt.hours}
              className={event.memoriesWindowHours === opt.hours ? "active" : ""}
              onClick={() => onChange(event.memoriesEnabled, opt.hours)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <p className="settings-hint">
        Only you, as the host, control this. The window starts counting down the moment the event ends.
      </p>
    </div>
  );
}
