import type { FilterType } from "@/lib/filters";

interface FilterTabsProps {
  active: FilterType;
  onChange: (filter: FilterType) => void;
  disabled?: boolean;
}

const TABS: { value: FilterType; label: string }[] = [
  { value: "none", label: "All" },
  { value: "long-title-by-comments", label: "Long titles · by comments" },
  { value: "short-title-by-points", label: "Short titles · by points" },
];

export function FilterTabs({ active, onChange, disabled }: FilterTabsProps) {
  return (
    <div className="filter-tabs" role="tablist" aria-label="Filter entries">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={active === tab.value}
          className={`filter-tab ${active === tab.value ? "filter-tab-active" : ""}`}
          onClick={() => onChange(tab.value)}
          disabled={disabled}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}