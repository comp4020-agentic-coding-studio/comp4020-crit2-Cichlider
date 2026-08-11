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

An unofficial, static "front door" to ANU MyTimetable: one page that explains
what the system actually does, names the specific places its real orientation
struggles, and links out to the genuine ANU pages for anyone who needs to
actually allocate into a class. It's the mirror of C1 — this week the content
had to answer to a real organisation instead of being invented, so the design
decisions are about structure and honesty, not made-up facts.

## The moments that mattered

1. **Picking, then re-scoping, the organisation.** The obvious pick — ANU
   MyTimetable, a site I have real opinions about — collided with this week's
   constraint that the redesign itself has to stay static, with no login or
   booking flow. Rather than drop the idea or fudge the constraint, I
   redirected the agent to redesign the *front door* to MyTimetable — an
   informational page that explains and links to the real system — instead of
   attempting to rebuild the allocation tool. That call is what let the
   organisation stay real without breaking the week's scope.
2. **Turning "no backend" into a test, not just a rule.** Rather than trust
   that the build would stay static by default, I asked for a spec test
   asserting the built page ships zero `<form>` elements
   ([`2029da5`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Cichlider/commit/2029da5)) —
   so a later, well-meaning attempt to add a "search the timetable" box can't
   silently reintroduce backend-shaped scope. It also asserts a real link to
   ANU's actual timetabling page exists, so the "the organisation is real, and
   you link to their real site" line in the spec has automated backpressure
   behind it, not just a promise.
3. **Checking the build before checking it in.** The first pass of
   `styles.css` failed `stylelint`'s `no-descending-specificity` rule — a
   general `a` selector declared after a more specific `header nav a` one. I
   had it re-ordered rather than silencing the rule, so `pnpm check` went red
   → green
   ([`edf855f`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit2-Cichlider/commit/edf855f))
   for the real reason (the CSS was actually fixed), not because the linter
   was told to stop looking.

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that the
current reflection entry is in `reflections/`, and that your `CLAUDE.md` is
there — before a marker ever opens the file.
