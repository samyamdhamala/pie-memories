export type PlanTab = "all" | "joined" | "created" | "curated" | "saved" | "past";

const TABS: { id: PlanTab; label: string }[] = [
  { id: "all", label: "all" },
  { id: "joined", label: "joined" },
  { id: "created", label: "created" },
  { id: "curated", label: "curated" },
  { id: "saved", label: "saved" },
  { id: "past", label: "past" },
];

export function PlanTabs({ active, onChange }: { active: PlanTab; onChange: (tab: PlanTab) => void }) {
  return (
    <div className="plan-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          className={"plan-tab" + (tab.id === active ? " active" : "")}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
