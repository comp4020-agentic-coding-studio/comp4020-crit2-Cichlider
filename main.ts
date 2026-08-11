// A static, client-side-only mockup of a timetable grid. No login, no
// server, no real enrolment data — every activity below is sample data.
// The one interaction this demonstrates: swapping a tutorial/lab choice
// updates the grid in place, and an overlap is flagged immediately.

interface Activity {
  id: string;
  label: string;
  day: 2 | 3 | 4 | 5 | 6; // grid-column: Mon=2 .. Fri=6
  startRow: number;
  endRow: number; // exclusive, matching CSS grid-row's end line
  kind: "lecture" | "tutorial" | "lab";
}

// Half-hour rows start at row 2 (9:00). rowFor(10, 30) === 5, etc.
function rowFor(hour: number, minute: number): number {
  return 2 + ((hour - 9) * 60 + minute) / 30;
}

const FIXED: Activity[] = [
  {
    id: "comp4020-lecture",
    label: "COMP4020 Lecture",
    day: 2,
    startRow: rowFor(10, 0),
    endRow: rowFor(12, 0),
    kind: "lecture",
  },
  {
    id: "comp3120-lecture",
    label: "COMP3120 Lecture",
    day: 3,
    startRow: rowFor(10, 0),
    endRow: rowFor(12, 0),
    kind: "lecture",
  },
];

interface ChoiceGroup {
  id: string;
  courseLabel: string;
  options: Activity[];
}

const GROUPS: ChoiceGroup[] = [
  {
    id: "comp4020-tut",
    courseLabel: "COMP4020 Tutorial",
    options: [
      {
        id: "t1",
        label: "T1 · Wed 14:00",
        day: 4,
        startRow: rowFor(14, 0),
        endRow: rowFor(15, 30),
        kind: "tutorial",
      },
      {
        id: "t2",
        label: "T2 · Thu 9:00",
        day: 5,
        startRow: rowFor(9, 0),
        endRow: rowFor(10, 30),
        kind: "tutorial",
      },
      {
        id: "t3",
        label: "T3 · Fri 11:00",
        day: 6,
        startRow: rowFor(11, 0),
        endRow: rowFor(12, 30),
        kind: "tutorial",
      },
    ],
  },
  {
    id: "comp3120-lab",
    courseLabel: "COMP3120 Lab",
    options: [
      {
        id: "l1",
        label: "L1 · Wed 14:00",
        day: 4,
        startRow: rowFor(14, 0),
        endRow: rowFor(16, 0),
        kind: "lab",
      },
      {
        id: "l2",
        label: "L2 · Mon 14:00",
        day: 2,
        startRow: rowFor(14, 0),
        endRow: rowFor(16, 0),
        kind: "lab",
      },
    ],
  },
];

// Starts on a pair that doesn't clash, so the grid opens clash-free.
const selected: Record<string, string> = {
  "comp4020-tut": "t2",
  "comp3120-lab": "l2",
};

function overlaps(a: Activity, b: Activity): boolean {
  return a.day === b.day && a.startRow < b.endRow && b.startRow < a.endRow;
}

function activeActivities(): Activity[] {
  const chosen = GROUPS.map(
    (group) => group.options.find((o) => o.id === selected[group.id])!,
  );
  return [...FIXED, ...chosen];
}

function render(): void {
  const grid = document.getElementById("timetable-grid");
  const banner = document.getElementById("clash-banner");
  if (!grid || !banner) return;

  for (const stale of grid.querySelectorAll(".activity")) stale.remove();

  const active = activeActivities();
  const clashing = new Set<string>();
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      if (overlaps(active[i], active[j])) {
        clashing.add(active[i].id);
        clashing.add(active[j].id);
      }
    }
  }

  for (const activity of active) {
    const block = document.createElement("div");
    block.className = `activity ${activity.kind}`;
    if (clashing.has(activity.id)) block.classList.add("clash");
    block.style.gridRow = `${activity.startRow} / ${activity.endRow}`;
    block.style.gridColumn = String(activity.day);
    block.textContent = activity.label;
    grid.appendChild(block);
  }

  banner.hidden = clashing.size === 0;

  for (const group of GROUPS) {
    const container = document.querySelector(
      `[data-buttons-for="${group.id}"]`,
    );
    if (!container) continue;
    container.innerHTML = "";
    for (const option of group.options) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = option.label;
      const isSelected = selected[group.id] === option.id;
      button.setAttribute("aria-pressed", String(isSelected));
      if (isSelected) button.classList.add("selected");
      button.addEventListener("click", () => {
        selected[group.id] = option.id;
        render();
      });
      container.appendChild(button);
    }
  }
}

render();
