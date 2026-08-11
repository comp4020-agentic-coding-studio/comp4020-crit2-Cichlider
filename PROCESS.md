# Process overview

A reading-guide to how the work came together — a map to your process, not an
essay about it. Markers read this file and follow its citations; they don't
trawl the repo for evidence you didn't point at, so if a moment mattered, cite
it.

This file is the shape; the course site's
[assessment page](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#what-you-submit)
is the requirement, and its
[word counts](https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/topics/assessment/#word-counts)
cover every deliverable.

## What I built

A static, client-side mockup of ANU MyTimetable's allocation grid: sample
COMP4020/COMP3120 activities on a weekly calendar, where clicking a tutorial or
lab option swaps it directly on the grid instead of taking you to a separate
swap screen, and an overlap between two chosen activities is flagged inline the
moment it happens. No login, no backend, no real enrolment data — a concept
demo of one specific interaction idea, not a rebuild of the real tool.

## The moments that mattered

1. **From a single grid to a real information architecture.** The interaction
   demo (one grid, one clash) proved the constraint could hold, but it wasn't
   yet an actual redesign of MyTimetable's IA — no course list, no allocation
   status by activity, no separation between looking at the week and changing
   an allocation. The rebuild added a sidebar (student summary, status chips,
   per-course activity list), an "up next" banner so today's classes don't
   require reading the whole grid, a decluttered toolbar, and a drawer that's
   the only place a change actually happens — closing the gap between "a
   working demo" and "a redesign that answers the brief's five goals"
   ([`270f93a`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Cichlider/commit/270f93a)).
2. **Scoping "redesign MyTimetable" against this week's static-only
   constraint.** The organisation I wanted was real and login-gated; the
   brief rules out logins and backend logic. First pass landed on an
   informational front-door page as the compromise. That wasn't actually
   what was being asked for — the redesign needed to be of the timetable
   interface itself, not a page describing it. The resolution was a static
   *mockup* of the grid: real interaction idea (swap-in-place, inline clash),
   fake data, no server behind it
   ([`512b2a4`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Cichlider/commit/512b2a4)).
   Getting the scope right took two attempts, not one — the first shape was a
   reasonable read of the constraint, but not the actual brief.
3. **Turning "no backend" into a test, not just a rule.** A spec test asserts
   the built page ships zero `<form>` elements and a real link to ANU's
   timetabling page
   ([`2029da5`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Cichlider/commit/2029da5)),
   so a later, well-meaning attempt to wire the mockup up to something
   real can't silently reintroduce backend-shaped scope.
4. **Checking the build before checking it in.** The first pass of
   `styles.css` failed `stylelint`'s `no-descending-specificity` rule. I had
   it re-ordered rather than silencing the rule, so `pnpm check` went red →
   green
   ([`edf855f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Cichlider/commit/edf855f))
   for the real reason.
5. **A redesign is a second draft, not the first one.** The full-workspace
   pass ([`270f93a`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Cichlider/commit/270f93a))
   had the right IA but the wrong interaction habits: a drawer for changing
   a class, colour doing double duty for both course and activity kind, an
   "Up next" card competing with a pill list underneath it. A second,
   task-oriented pass replaced the drawer with alternatives previewed
   in-place on the real grid, split viewing a course from editing its
   allocation behind an explicit "Manage classes" toggle, and gave every
   course exactly one colour everywhere it appears
   ([`03ae4aa`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Cichlider/commit/03ae4aa)).
   The tests can't see interaction quality, so I verified the change flow by
   hand against real headless Chrome — `spec/invariants.test.ts` builds its
   JSDOM without `runScripts`, which can't execute the page's module script
   at all, so a green spec suite here would not have meant a working page.

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that the
current reflection entry is in `reflections/`, and that your `CLAUDE.md` is
there — before a marker ever opens the file.
