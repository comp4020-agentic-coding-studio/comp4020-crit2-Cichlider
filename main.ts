// Static, client-side-only redesign of ANU MyTimetable's scheduling
// workspace. No login, no server, no real enrolment data — every course,
// student, and time slot below is sample data for a UX mockup.

type Status = "allocated" | "pending" | "unavailable";
type Kind = "lecture" | "tutorial" | "lab" | "assessment";

interface Slot {
  day: number; // 0 = Monday .. 6 = Sunday
  startRow: number;
  endRow: number; // exclusive, matching CSS grid-row's end line
  room: string;
}

interface Option extends Slot {
  id: string;
  label: string;
}

interface Activity {
  id: string;
  course: string;
  kind: Kind;
  title: string;
  status: Status;
  changeable: boolean;
  onGrid: boolean;
  fixedSlot?: Slot;
  groupId?: string;
}

interface Course {
  code: string;
  name: string;
  activities: Activity[];
}

// Half-hour rows start at row 2 (9:00), day columns start at 2 (Monday).
function rowFor(hour: number, minute: number): number {
  return 2 + ((hour - 9) * 60 + minute) / 30;
}
function colFor(day: number): number {
  return day + 2;
}

const GROUPS: Record<string, Option[]> = {
  "c4020-tut": [
    { id: "t1", label: "Wed 14:00 · MRB 4.03", day: 2, startRow: rowFor(14, 0), endRow: rowFor(15, 30), room: "MRB 4.03" },
    { id: "t2", label: "Thu 9:00 · MRB 4.01", day: 3, startRow: rowFor(9, 0), endRow: rowFor(10, 30), room: "MRB 4.01" },
    { id: "t3", label: "Fri 11:00 · MRB 4.05", day: 4, startRow: rowFor(11, 0), endRow: rowFor(12, 30), room: "MRB 4.05" },
  ],
  "c3120-lab": [
    { id: "l1", label: "Wed 14:00 · CSIT 101", day: 2, startRow: rowFor(14, 0), endRow: rowFor(16, 0), room: "CSIT 101" },
    { id: "l2", label: "Mon 14:00 · CSIT 102", day: 0, startRow: rowFor(14, 0), endRow: rowFor(16, 0), room: "CSIT 102" },
  ],
};

const COURSES: Course[] = [
  {
    code: "COMP4020",
    name: "Agentic Coding Studio",
    activities: [
      {
        id: "c4020-lec",
        course: "COMP4020",
        kind: "lecture",
        title: "Lecture",
        status: "allocated",
        changeable: false,
        onGrid: true,
        fixedSlot: { day: 0, startRow: rowFor(10, 0), endRow: rowFor(12, 0), room: "Marie Reay 4.02" },
      },
      {
        id: "c4020-tut",
        course: "COMP4020",
        kind: "tutorial",
        title: "Tutorial",
        status: "allocated",
        changeable: true,
        onGrid: true,
        groupId: "c4020-tut",
      },
      {
        id: "c4020-crit2",
        course: "COMP4020",
        kind: "assessment",
        title: "Crit 2 sign-up",
        status: "pending",
        changeable: false,
        onGrid: false,
      },
    ],
  },
  {
    code: "COMP3120",
    name: "Sample Systems Course",
    activities: [
      {
        id: "c3120-lec",
        course: "COMP3120",
        kind: "lecture",
        title: "Lecture",
        status: "allocated",
        changeable: false,
        onGrid: true,
        fixedSlot: { day: 1, startRow: rowFor(10, 0), endRow: rowFor(12, 0), room: "CSIT N101" },
      },
      {
        id: "c3120-lab",
        course: "COMP3120",
        kind: "lab",
        title: "Computer Lab",
        status: "allocated",
        changeable: true,
        onGrid: true,
        groupId: "c3120-lab",
      },
      {
        id: "c3120-tut",
        course: "COMP3120",
        kind: "tutorial",
        title: "Tutorial",
        status: "unavailable",
        changeable: false,
        onGrid: false,
      },
    ],
  },
];

const ALL_ACTIVITIES: Activity[] = COURSES.flatMap((c) => c.activities);

// Sample "today"/"now": Monday, 9:30 — before COMP4020's lecture, so the
// "up next" banner and clash-free default state both have something to show.
const TODAY = 0;
const NOW_ROW = rowFor(9, 30);

const STATUS_META: Record<Status, { icon: string; label: string }> = {
  allocated: { icon: "✓", label: "Allocated" },
  pending: { icon: "⏳", label: "Pending" },
  unavailable: { icon: "—", label: "Unavailable" },
};

// ---- state ----
const selected: Record<string, string> = { "c4020-tut": "t2", "c3120-lab": "l2" };
const visibleCourses = new Set(COURSES.map((c) => c.code));
let viewMode: "grid" | "list" = "grid";
let drawerGroupId: string | null = null;

function activeSlot(activity: Activity): Slot | undefined {
  if (activity.fixedSlot) return activity.fixedSlot;
  if (activity.groupId) {
    const options = GROUPS[activity.groupId];
    return options.find((o) => o.id === selected[activity.groupId!]);
  }
  return undefined;
}

function visibleActivities(): Activity[] {
  return ALL_ACTIVITIES.filter((a) => a.onGrid && visibleCourses.has(a.course));
}

function overlaps(a: Slot, b: Slot): boolean {
  return a.day === b.day && a.startRow < b.endRow && b.startRow < a.endRow;
}

function findClashes(activities: Activity[]): Set<string> {
  const clashing = new Set<string>();
  const withSlots = activities
    .map((a) => ({ activity: a, slot: activeSlot(a) }))
    .filter((x): x is { activity: Activity; slot: Slot } => x.slot !== undefined);
  for (let i = 0; i < withSlots.length; i++) {
    for (let j = i + 1; j < withSlots.length; j++) {
      if (overlaps(withSlots[i].slot, withSlots[j].slot)) {
        clashing.add(withSlots[i].activity.id);
        clashing.add(withSlots[j].activity.id);
      }
    }
  }
  return clashing;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---- rendering ----

function renderSummary(): void {
  const host = document.getElementById("summary-chips");
  if (!host) return;
  host.innerHTML = "";
  const counts: Record<Status, number> = { allocated: 0, pending: 0, unavailable: 0 };
  for (const activity of ALL_ACTIVITIES) counts[activity.status]++;
  for (const status of ["allocated", "pending", "unavailable"] as Status[]) {
    const chip = el("span", `chip chip-${status}`);
    chip.textContent = `${STATUS_META[status].icon} ${counts[status]} ${STATUS_META[status].label}`;
    host.appendChild(chip);
  }
}

function renderCourseList(): void {
  const host = document.getElementById("course-list");
  if (!host) return;
  host.innerHTML = "";
  for (const course of COURSES) {
    const details = el("details", "course");
    details.open = true;
    const summary = el("summary");
    summary.appendChild(el("span", "course-code", course.code));
    summary.appendChild(el("span", "course-name", course.name));
    details.appendChild(summary);

    const list = el("ul", "activity-list");
    for (const activity of course.activities) {
      const item = el("li", "activity-row");
      const status = el("span", `status-dot status-${activity.status}`);
      status.textContent = STATUS_META[activity.status].icon;
      status.title = STATUS_META[activity.status].label;
      item.appendChild(status);

      const label = el("span", "activity-title");
      const slot = activeSlot(activity);
      label.textContent = slot ? `${activity.title} · ${slot.room}` : activity.title;
      item.appendChild(label);

      if (activity.changeable && activity.groupId) {
        const button = el("button", "change-button", "Change");
        button.type = "button";
        button.addEventListener("click", () => openDrawer(activity.groupId!));
        item.appendChild(button);
      } else if (activity.status === "unavailable") {
        const button = el("button", "waitlist-button", "Join waitlist");
        button.type = "button";
        button.disabled = true;
        button.title = "Sample data — no real waitlist behind this";
        item.appendChild(button);
      } else {
        item.appendChild(el("span", "fixed-tag", "Fixed"));
      }
      list.appendChild(item);
    }
    details.appendChild(list);
    host.appendChild(details);
  }
}

function renderUpNext(): void {
  const host = document.getElementById("up-next-content");
  if (!host) return;
  host.innerHTML = "";

  const todaysActive = visibleActivities()
    .map((a) => ({ activity: a, slot: activeSlot(a) }))
    .filter((x): x is { activity: Activity; slot: Slot } => x.slot !== undefined && x.slot.day === TODAY)
    .sort((a, b) => a.slot.startRow - b.slot.startRow);

  const next = todaysActive.find((x) => x.slot.startRow > NOW_ROW);

  if (next) {
    host.appendChild(el("p", "up-next-eyebrow", "Up next"));
    const heading = el(
      "p",
      "up-next-heading",
      `${next.activity.course} ${next.activity.title} · ${next.slot.room}`,
    );
    host.appendChild(heading);
  } else {
    host.appendChild(el("p", "up-next-eyebrow", "Today"));
    host.appendChild(el("p", "up-next-heading", "No more classes today"));
  }

  const agenda = el("ul", "today-agenda");
  for (const { activity, slot } of todaysActive) {
    const item = el(
      "li",
      slot.startRow <= NOW_ROW ? "past" : "",
      `${activity.course} ${activity.title} · ${slot.room}`,
    );
    agenda.appendChild(item);
  }
  if (todaysActive.length === 0) agenda.appendChild(el("li", "", "Nothing scheduled today."));
  host.appendChild(agenda);
}

function renderGrid(): void {
  const grid = document.getElementById("timetable-grid");
  const banner = document.getElementById("clash-banner");
  if (!grid || !banner) return;
  grid.innerHTML = "";

  const todayOverlay = el("div", "today-highlight");
  todayOverlay.style.gridColumn = String(colFor(TODAY));
  todayOverlay.style.gridRow = "2 / 18";
  grid.appendChild(todayOverlay);

  grid.appendChild(el("div", "corner"));
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  days.forEach((day, index) => {
    const head = el("div", index === TODAY ? "day-head today" : "day-head", day);
    if (index === TODAY) head.appendChild(el("span", "today-badge", "Today"));
    head.style.gridColumn = String(colFor(index));
    head.style.gridRow = "1";
    grid.appendChild(head);
  });

  for (let hour = 9; hour <= 16; hour++) {
    const label = el("div", "time-label", `${hour}:00`);
    const r = rowFor(hour, 0);
    label.style.gridRow = `${r} / ${r + 2}`;
    label.style.gridColumn = "1";
    grid.appendChild(label);
  }

  const nowLine = el("div", "now-line");
  nowLine.style.gridRow = `${NOW_ROW} / ${NOW_ROW + 1}`;
  nowLine.style.gridColumn = "2 / 9";
  grid.appendChild(nowLine);

  const visible = visibleActivities();
  const clashing = findClashes(visible);

  for (const activity of visible) {
    const slot = activeSlot(activity);
    if (!slot) continue;
    const block = el("div", `activity ${activity.kind}`);
    block.style.gridRow = `${slot.startRow} / ${slot.endRow}`;
    block.style.gridColumn = String(colFor(slot.day));
    block.appendChild(el("span", "activity-code", activity.course));
    block.appendChild(el("span", "activity-kind", activity.title));
    block.appendChild(el("span", "activity-room", slot.room));

    if (clashing.has(activity.id)) {
      block.classList.add("clash");
      block.appendChild(el("span", "clash-tag", "Clash"));
      const resolve = el("button", "resolve-button", "Resolve");
      resolve.type = "button";
      if (activity.groupId) resolve.addEventListener("click", () => openDrawer(activity.groupId!));
      else resolve.disabled = true;
      block.appendChild(resolve);
    }
    grid.appendChild(block);
  }

  banner.hidden = clashing.size === 0;
  if (clashing.size > 0) {
    banner.textContent = "⚠ Clash: two of your allocated activities overlap — see the highlighted blocks below.";
  }
}

function renderList(): void {
  const host = document.getElementById("list-view");
  if (!host) return;
  host.innerHTML = "";
  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const visible = visibleActivities();
  const clashing = findClashes(visible);

  for (let day = 0; day < 7; day++) {
    const items = visible
      .map((a) => ({ activity: a, slot: activeSlot(a) }))
      .filter((x): x is { activity: Activity; slot: Slot } => x.slot !== undefined && x.slot.day === day)
      .sort((a, b) => a.slot.startRow - b.slot.startRow);
    if (items.length === 0) continue;

    host.appendChild(el("h3", day === TODAY ? "list-day today" : "list-day", days[day] + (day === TODAY ? " · Today" : "")));
    const ul = el("ul", "list-items");
    for (const { activity, slot } of items) {
      const li = el("li", clashing.has(activity.id) ? "list-item clash" : "list-item");
      li.appendChild(el("span", "activity-code", activity.course));
      li.appendChild(el("span", "", `${activity.title} · ${slot.room}`));
      if (clashing.has(activity.id)) li.appendChild(el("span", "clash-tag", "Clash"));
      ul.appendChild(li);
    }
    host.appendChild(ul);
  }
}

function renderAll(): void {
  renderSummary();
  renderCourseList();
  renderUpNext();
  renderGrid();
  renderList();
  document.getElementById("grid-view")!.hidden = viewMode !== "grid";
  document.getElementById("list-view")!.hidden = viewMode !== "list";
}

// ---- drawer ----

function openDrawer(groupId: string): void {
  drawerGroupId = groupId;
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const content = document.getElementById("drawer-content");
  if (!drawer || !backdrop || !content) return;

  const owner = ALL_ACTIVITIES.find((a) => a.groupId === groupId);
  const options = GROUPS[groupId];
  content.innerHTML = "";
  content.appendChild(el("h2", "", `${owner?.course ?? ""} — ${owner?.title ?? "Allocation"}`));
  content.appendChild(el("p", "drawer-hint", "Choose a time. A clash with your other allocations is flagged before you pick it."));

  const otherActive = ALL_ACTIVITIES.filter((a) => a.groupId !== groupId)
    .map((a) => activeSlot(a))
    .filter((s): s is Slot => s !== undefined);

  const list = el("div", "drawer-options");
  for (const option of options) {
    const button = el("button", "drawer-option");
    const willClash = otherActive.some((s) => overlaps(s, option));
    const isSelected = selected[groupId] === option.id;
    button.classList.toggle("selected", isSelected);
    button.classList.toggle("would-clash", willClash);
    button.setAttribute("aria-pressed", String(isSelected));
    button.appendChild(el("span", "", option.label));
    if (willClash) button.appendChild(el("span", "clash-tag", "Would clash"));
    button.addEventListener("click", () => {
      selected[groupId] = option.id;
      renderAll();
      openDrawer(groupId);
    });
    list.appendChild(button);
  }
  content.appendChild(list);

  const closeButton = el("button", "drawer-close", "Done");
  closeButton.type = "button";
  closeButton.addEventListener("click", closeDrawer);
  content.appendChild(closeButton);

  drawer.hidden = false;
  drawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
  closeButton.focus();
}

function closeDrawer(): void {
  drawerGroupId = null;
  const drawer = document.getElementById("drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  if (drawer) {
    drawer.hidden = true;
    drawer.setAttribute("aria-hidden", "true");
  }
  if (backdrop) backdrop.hidden = true;
}

// ---- wiring ----

document.getElementById("drawer-backdrop")?.addEventListener("click", closeDrawer);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && drawerGroupId) closeDrawer();
});

document.querySelectorAll<HTMLInputElement>("input[data-filter]").forEach((checkbox) => {
  checkbox.addEventListener("change", () => {
    const code = checkbox.dataset.filter!;
    if (checkbox.checked) visibleCourses.add(code);
    else visibleCourses.delete(code);
    renderAll();
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
  button.addEventListener("click", () => {
    viewMode = button.dataset.view === "list" ? "list" : "grid";
    document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((b) => b.classList.toggle("selected", b === button));
    renderAll();
  });
});

document.getElementById("print-button")?.addEventListener("click", () => window.print());

const sidebarToggle = document.getElementById("sidebar-toggle");
sidebarToggle?.addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  const collapsed = sidebar.classList.toggle("collapsed");
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
});

renderAll();
