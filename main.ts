// Static, client-side-only redesign of ANU MyTimetable's scheduling
// workspace. No login, no server, no real enrolment data — every course,
// student, and time slot below is sample data for a UX mockup.

type Status = "allocated" | "pending" | "unavailable";
type Kind = "lecture" | "tutorial" | "lab" | "assessment";
type Availability = "available" | "full";

interface Slot {
  day: number; // 0 = Monday .. 6 = Sunday
  startRow: number;
  endRow: number; // exclusive, matching CSS grid-row's end line
  room: string;
}

interface Option extends Slot {
  id: string;
  availability: Availability;
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

const DAY_ABBR = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_FULL = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// row -> minutes after 9:00 -> a "H:MM" clock string, so every place that
// shows a time reads it off the same grid maths the blocks are placed with.
function rowToClock(row: number): string {
  const totalMin = 9 * 60 + (row - 2) * 30;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}:${String(m).padStart(2, "0")}`;
}
function formatRange(startRow: number, endRow: number): string {
  return `${rowToClock(startRow)}–${rowToClock(endRow)}`;
}
function formatDuration(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const COURSE_COLORS: Record<string, { bg: string; border: string }> = {
  COMP4020: { bg: "#1f6feb", border: "#0f3d85" },
  COMP3120: { bg: "#0f9d58", border: "#0a6b3c" },
};
const FALLBACK_COLOR = { bg: "#5b6b82", border: "#3a4658" };
function colorFor(course: string) {
  return COURSE_COLORS[course] ?? FALLBACK_COLOR;
}

const KIND_META: Record<Kind, { icon: string; label: string }> = {
  lecture: { icon: "🎓", label: "Lecture" },
  tutorial: { icon: "💬", label: "Tutorial" },
  lab: { icon: "🧪", label: "Computer Lab" },
  assessment: { icon: "📝", label: "Assessment" },
};

const GROUPS: Record<string, Option[]> = {
  // Current allocation is Wed 11:00. The Fri 11:00 alternative is a real
  // conflict against the lab group's current slot (also Fri, overlapping);
  // Fri 14:00 is deliberately at capacity, to exercise all four alternative
  // states the change flow needs to distinguish.
  "c4020-tut": [
    { id: "t-wed11", day: 2, startRow: rowFor(11, 0), endRow: rowFor(12, 0), room: "MRB 4.03", availability: "available" },
    { id: "t-tue14", day: 1, startRow: rowFor(14, 0), endRow: rowFor(15, 0), room: "MRB 4.01", availability: "available" },
    { id: "t-thu15", day: 3, startRow: rowFor(15, 0), endRow: rowFor(16, 0), room: "MRB 4.05", availability: "available" },
    { id: "t-fri11", day: 4, startRow: rowFor(11, 0), endRow: rowFor(12, 0), room: "MRB 4.02", availability: "available" },
    { id: "t-fri14", day: 4, startRow: rowFor(14, 0), endRow: rowFor(15, 0), room: "MRB 4.06", availability: "full" },
  ],
  "c3120-lab": [
    { id: "l-fri11", day: 4, startRow: rowFor(11, 0), endRow: rowFor(12, 30), room: "CSIT 103", availability: "available" },
    { id: "l-wed14", day: 2, startRow: rowFor(14, 0), endRow: rowFor(16, 0), room: "CSIT 101", availability: "available" },
    { id: "l-mon14", day: 0, startRow: rowFor(14, 0), endRow: rowFor(16, 0), room: "CSIT 102", availability: "available" },
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
// up-next card and clash-free default state both have something to show.
const TODAY = 0;
const NOW_ROW = rowFor(9, 30);

const STATUS_META: Record<Status, { icon: string; label: string }> = {
  allocated: { icon: "✓", label: "Allocated" },
  pending: { icon: "⏳", label: "Pending" },
  unavailable: { icon: "—", label: "Unavailable" },
};
const AVAILABILITY_META: Record<Availability, { label: string }> = {
  available: { label: "Available" },
  full: { label: "Full · Waitlist" },
};

// ---- state ----
const selected: Record<string, string> = { "c4020-tut": "t-wed11", "c3120-lab": "l-fri11" };
const visibleCourses = new Set(COURSES.map((c) => c.code));
let viewMode: "grid" | "list" = "grid";
let userSetView = false;
let manageMode = false;
let changeGroupId: string | null = null;
let pendingChange: { groupId: string; optionId: string } | null = null;

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

// Activities other than the group currently being changed, with their slot
// — what an alternative session would actually be compared against.
function othersOutsideGroup(groupId: string): { activity: Activity; slot: Slot }[] {
  return ALL_ACTIVITIES.filter((a) => a.groupId !== groupId && visibleCourses.has(a.course))
    .map((a) => ({ activity: a, slot: activeSlot(a) }))
    .filter((x): x is { activity: Activity; slot: Slot } => x.slot !== undefined);
}
function conflictsFor(option: Slot, groupId: string): Activity[] {
  return othersOutsideGroup(groupId)
    .filter((x) => overlaps(x.slot, option))
    .map((x) => x.activity);
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
    details.dataset.course = course.code;
    const summary = el("summary");
    const swatch = el("span", "course-swatch");
    swatch.style.background = colorFor(course.code).bg;
    summary.appendChild(swatch);
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
      const kindText = `${KIND_META[activity.kind].icon} ${activity.title}`;
      label.textContent = slot ? `${kindText} · ${slot.room}` : kindText;
      item.appendChild(label);

      if (!manageMode) {
        item.appendChild(el("span", `activity-status status-text-${activity.status}`, STATUS_META[activity.status].label));
      } else if (activity.groupId === changeGroupId) {
        item.appendChild(el("span", "changing-tag", "Changing…"));
      } else if (activity.changeable && activity.groupId) {
        const button = el("button", "change-button", "Change");
        button.type = "button";
        button.addEventListener("click", () => enterChangeMode(activity.groupId!));
        item.appendChild(button);
      } else if (activity.status === "unavailable") {
        const button = el("button", "waitlist-button", "Join waitlist");
        button.type = "button";
        button.disabled = true;
        button.title = "Sample data — no real waitlist behind this";
        item.appendChild(button);
      } else if (activity.status === "pending") {
        item.appendChild(el("span", "fixed-tag", "Pending review"));
      } else {
        item.appendChild(el("span", "fixed-tag", "Fixed"));
      }
      list.appendChild(item);
    }
    details.appendChild(list);
    host.appendChild(details);
  }
}

function flashCourse(courseCode: string): void {
  const details = document.querySelector<HTMLDetailsElement>(`details[data-course="${courseCode}"]`);
  if (!details) return;
  details.open = true;
  details.scrollIntoView({ behavior: "smooth", block: "center" });
  details.classList.add("flash");
  setTimeout(() => details.classList.remove("flash"), 1200);
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

  if (!next) {
    host.appendChild(el("p", "next-class-empty", "No more classes today."));
    return;
  }

  const { activity, slot } = next;
  const color = colorFor(activity.course);

  const icon = el("div", "next-class-icon");
  icon.style.background = color.bg;
  icon.textContent = KIND_META[activity.kind].icon;
  host.appendChild(icon);

  const info = el("div", "next-class-info");
  info.appendChild(el("p", "next-class-eyebrow", "Up next"));
  info.appendChild(el("p", "next-class-title", `${activity.course} · ${activity.title}`));
  const meta = el("p", "next-class-meta");
  meta.appendChild(el("span", "next-class-time", formatRange(slot.startRow, slot.endRow)));
  meta.appendChild(el("span", "next-class-location", slot.room));
  const minutesUntil = (slot.startRow - NOW_ROW) * 30;
  meta.appendChild(el("span", "next-class-countdown", `Starts in ${formatDuration(minutesUntil)}`));
  info.appendChild(meta);
  host.appendChild(info);

  const action = el("button", "next-class-action", "Details");
  action.type = "button";
  action.addEventListener("click", () => flashCourse(activity.course));
  host.appendChild(action);
}

function renderGridLines(grid: HTMLElement): void {
  for (let row = 2; row <= 18; row++) {
    const isHour = (row - 2) % 2 === 0;
    const line = el("div", isHour ? "grid-line grid-line-hour" : "grid-line");
    line.style.gridRow = `${row} / ${row + 1}`;
    line.style.gridColumn = "1 / 9";
    grid.appendChild(line);
  }
}

// Options that aren't the group's currently-selected one — i.e. the
// alternatives to preview on the grid while changing that group.
function alternativesFor(groupId: string): Option[] {
  return GROUPS[groupId].filter((o) => o.id !== selected[groupId]);
}

function renderAlternatives(grid: HTMLElement): void {
  if (!changeGroupId) return;
  const owner = ALL_ACTIVITIES.find((a) => a.groupId === changeGroupId);
  if (!owner) return;
  const color = colorFor(owner.course);

  for (const option of alternativesFor(changeGroupId)) {
    const conflicts = option.availability === "available" ? conflictsFor(option, changeGroupId) : [];
    const isFull = option.availability === "full";
    const isConflict = conflicts.length > 0;
    const isPending = pendingChange?.optionId === option.id;
    const state = isPending ? "pending" : isFull ? "full" : isConflict ? "conflict" : "available";

    const button = el("button", `alt alt-${state}`);
    button.type = "button";
    button.style.gridRow = `${option.startRow} / ${option.endRow}`;
    button.style.gridColumn = String(colFor(option.day));
    if (state === "available" || state === "pending") {
      button.style.setProperty("--alt-color", color.bg);
    }
    button.appendChild(el("span", "alt-time", formatRange(option.startRow, option.endRow)));
    button.appendChild(el("span", "alt-room", option.room));

    if (state === "pending") {
      button.appendChild(el("span", "alt-status", "Selected — confirm below"));
      button.disabled = true;
    } else if (state === "full") {
      button.appendChild(el("span", "alt-status", AVAILABILITY_META.full.label));
      button.disabled = true;
      button.title = "Sample data — this session is at capacity";
    } else if (state === "conflict") {
      button.appendChild(el("span", "alt-status", "Conflict"));
      const names = conflicts.map((c) => `${c.course} ${c.title}`).join(", ");
      button.appendChild(el("span", "alt-explain", `Clashes with ${names}`));
      button.disabled = true;
      button.title = `Would clash with ${names}`;
      for (const c of conflicts) {
        button.addEventListener("mouseenter", () => highlightActivity(c.id, true));
        button.addEventListener("mouseleave", () => highlightActivity(c.id, false));
        button.addEventListener("focus", () => highlightActivity(c.id, true));
        button.addEventListener("blur", () => highlightActivity(c.id, false));
      }
    } else {
      button.appendChild(el("span", "alt-status", "Available — select"));
      button.addEventListener("click", () => pickAlternative(option.id));
    }
    grid.appendChild(button);
  }
}

function highlightActivity(activityId: string, on: boolean): void {
  document.querySelectorAll(`[data-activity-id="${activityId}"]`).forEach((node) => {
    node.classList.toggle("conflict-partner", on);
  });
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

  renderGridLines(grid);

  grid.appendChild(el("div", "corner"));
  DAY_ABBR.forEach((day, index) => {
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
  const nowLabel = el("div", "now-label", "Now");
  nowLabel.style.gridRow = `${NOW_ROW} / ${NOW_ROW + 1}`;
  nowLabel.style.gridColumn = "1";
  grid.appendChild(nowLabel);

  const visible = visibleActivities();
  const clashing = findClashes(visible);

  for (const activity of visible) {
    const slot = activeSlot(activity);
    if (!slot) continue;
    const color = colorFor(activity.course);
    const isBeingChanged = activity.groupId === changeGroupId;
    const block = el("div", `activity ${isBeingChanged ? "activity-current" : ""}`.trim());
    block.dataset.activityId = activity.id;
    block.style.setProperty("--course-color", color.bg);
    block.style.setProperty("--course-border", color.border);
    block.style.gridRow = `${slot.startRow} / ${slot.endRow}`;
    block.style.gridColumn = String(colFor(slot.day));
    const kindLine = el("span", "activity-kind");
    kindLine.textContent = `${KIND_META[activity.kind].icon} ${activity.title}`;
    block.appendChild(el("span", "activity-code", activity.course));
    block.appendChild(kindLine);
    block.appendChild(el("span", "activity-room", slot.room));
    if (isBeingChanged) block.appendChild(el("span", "current-badge", "Current"));

    if (clashing.has(activity.id) && !changeGroupId) {
      block.classList.add("clash");
      block.appendChild(el("span", "clash-tag", "Clash"));
      const resolve = el("button", "resolve-button", "Resolve");
      resolve.type = "button";
      if (activity.groupId) resolve.addEventListener("click", () => enterChangeMode(activity.groupId!));
      else resolve.disabled = true;
      block.appendChild(resolve);
    }
    grid.appendChild(block);
  }

  renderAlternatives(grid);

  const showClashBanner = clashing.size > 0 && !changeGroupId;
  banner.hidden = !showClashBanner;
  if (showClashBanner) {
    banner.textContent = "⚠ Clash: two of your allocated activities overlap — see the highlighted blocks below.";
  }
}

function renderList(): void {
  const host = document.getElementById("list-view");
  if (!host) return;
  host.innerHTML = "";
  const visible = visibleActivities();
  const clashing = findClashes(visible);

  for (let day = 0; day < 7; day++) {
    const items = visible
      .map((a) => ({ activity: a, slot: activeSlot(a) }))
      .filter((x): x is { activity: Activity; slot: Slot } => x.slot !== undefined && x.slot.day === day)
      .sort((a, b) => a.slot.startRow - b.slot.startRow);
    if (items.length === 0) continue;

    host.appendChild(el("h3", day === TODAY ? "list-day today" : "list-day", DAY_FULL[day] + (day === TODAY ? " · Today" : "")));
    const ul = el("ul", "list-items");
    for (const { activity, slot } of items) {
      const li = el("li", clashing.has(activity.id) ? "list-item clash" : "list-item");
      const swatch = el("span", "list-swatch");
      swatch.style.background = colorFor(activity.course).bg;
      li.appendChild(swatch);
      li.appendChild(el("span", "activity-code", activity.course));
      li.appendChild(el("span", "", `${KIND_META[activity.kind].icon} ${activity.title} · ${formatRange(slot.startRow, slot.endRow)} · ${slot.room}`));
      if (clashing.has(activity.id)) li.appendChild(el("span", "clash-tag", "Clash"));
      ul.appendChild(li);
    }
    host.appendChild(ul);
  }
  if (host.children.length === 0) host.appendChild(el("p", "list-empty", "Nothing scheduled this week."));
}

function renderChangeBar(): void {
  const bar = document.getElementById("change-bar");
  if (!bar) return;
  bar.innerHTML = "";
  if (!changeGroupId) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  const groupId = changeGroupId;
  const owner = ALL_ACTIVITIES.find((a) => a.groupId === groupId)!;
  const current = GROUPS[groupId].find((o) => o.id === selected[groupId])!;

  if (pendingChange) {
    const target = GROUPS[groupId].find((o) => o.id === pendingChange!.optionId)!;
    bar.className = "change-bar change-bar-confirm";
    bar.appendChild(el("p", "change-bar-title", `Change ${owner.course} ${owner.title}`));
    const summary = el("p", "change-bar-summary");
    summary.appendChild(el("span", "", `From: ${DAY_ABBR[current.day]} ${rowToClock(current.startRow)}`));
    summary.appendChild(el("span", "", `To: ${DAY_ABBR[target.day]} ${rowToClock(target.startRow)}`));
    bar.appendChild(summary);
    const actions = el("div", "change-bar-actions");
    const cancel = el("button", "change-bar-cancel", "Cancel");
    cancel.type = "button";
    cancel.addEventListener("click", cancelPending);
    const confirm = el("button", "change-bar-confirm-button", "Confirm change");
    confirm.type = "button";
    confirm.addEventListener("click", confirmChange);
    actions.appendChild(cancel);
    actions.appendChild(confirm);
    bar.appendChild(actions);
  } else {
    bar.className = "change-bar change-bar-browse";
    bar.appendChild(
      el(
        "p",
        "change-bar-title",
        `Changing ${owner.course} ${owner.title} · currently ${DAY_ABBR[current.day]} ${rowToClock(current.startRow)}`,
      ),
    );
    bar.appendChild(el("p", "change-bar-hint", "Pick a highlighted session on the grid below, or cancel."));
    const exit = el("button", "change-bar-cancel", "Cancel");
    exit.type = "button";
    exit.addEventListener("click", exitChangeMode);
    bar.appendChild(exit);
  }
}

function renderAll(): void {
  renderSummary();
  renderCourseList();
  renderUpNext();
  renderChangeBar();
  renderGrid();
  renderList();
  document.getElementById("grid-view")!.hidden = viewMode !== "grid";
  document.getElementById("list-view")!.hidden = viewMode !== "list";
}

// ---- change flow ----

function setViewMode(mode: "grid" | "list"): void {
  viewMode = mode;
  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((b) => {
    const isSelected = b.dataset.view === mode;
    b.classList.toggle("selected", isSelected);
    b.setAttribute("aria-pressed", String(isSelected));
  });
}

function enterChangeMode(groupId: string): void {
  changeGroupId = groupId;
  pendingChange = null;
  if (viewMode !== "grid") setViewMode("grid");
  renderAll();
  document.getElementById("timetable")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function exitChangeMode(): void {
  changeGroupId = null;
  pendingChange = null;
  renderAll();
}

function pickAlternative(optionId: string): void {
  if (!changeGroupId) return;
  pendingChange = { groupId: changeGroupId, optionId };
  renderAll();
}

function cancelPending(): void {
  pendingChange = null;
  renderAll();
}

function confirmChange(): void {
  if (!pendingChange) return;
  selected[pendingChange.groupId] = pendingChange.optionId;
  changeGroupId = null;
  pendingChange = null;
  renderAll();
}

// ---- wiring ----

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && changeGroupId) exitChangeMode();
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
    userSetView = true;
    setViewMode(button.dataset.view === "list" ? "list" : "grid");
    renderAll();
  });
});

document.getElementById("print-button")?.addEventListener("click", () => window.print());

const sidebarToggle = document.getElementById("sidebar-toggle");
let userSetSidebar = false;
sidebarToggle?.addEventListener("click", () => {
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;
  userSetSidebar = true;
  const collapsed = sidebar.classList.toggle("collapsed");
  sidebarToggle.setAttribute("aria-expanded", String(!collapsed));
});

const manageToggle = document.getElementById("manage-toggle");
manageToggle?.addEventListener("click", () => {
  manageMode = !manageMode;
  manageToggle.setAttribute("aria-pressed", String(manageMode));
  manageToggle.textContent = manageMode ? "Done managing" : "Manage classes";
  renderCourseList();
});

// Small screens default to the agenda view rather than a squeezed 7-column
// grid — but only until the student picks a view for themselves.
const mobileQuery = matchMedia("(width <= 760px)");
function applyResponsiveDefault(): void {
  if (mobileQuery.matches && !userSetView && viewMode !== "list") {
    setViewMode("list");
    renderAll();
  }
  // On a phone-sized screen the sidebar is a full overlay (see styles.css),
  // so default it closed — otherwise it hides the timetable it's meant to
  // support. A student who has explicitly opened/closed it keeps that choice.
  if (!userSetSidebar) {
    const sidebar = document.getElementById("sidebar");
    if (sidebar && sidebarToggle) {
      const shouldCollapse = mobileQuery.matches;
      sidebar.classList.toggle("collapsed", shouldCollapse);
      sidebarToggle.setAttribute("aria-expanded", String(!shouldCollapse));
    }
  }
}
mobileQuery.addEventListener("change", applyResponsiveDefault);
applyResponsiveDefault();

renderAll();
