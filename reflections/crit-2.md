# Crit 2 reflection — Unsolicited redesign

**The breakthrough that moved the work forward:** the first shape I landed on
— a static informational page *about* MyTimetable — technically satisfied the
"stay static, no login" constraint, but it wasn't actually a redesign of the
thing I set out to redesign. The breakthrough was realising the constraint and
the brief weren't the same thing: the fix wasn't to abandon a login-gated
organisation, it was to mock up the *interface itself* — the timetable grid,
the swap interaction, the clash — with fake data standing in for a real
backend. That's a different kind of static site than the starter's invariants
assume, and getting there took a real do-over, not a tweak.

**What this changed about the developer I want to be:** this crit confirmed
that I care about UI more than I initially gave it credit for during planning.
The easy version of this week's brief was a page of prose about an
organisation; what actually held my attention was the interaction detail —
whether clicking a tutorial option feels like it *moves* something on the grid
you're already looking at, whether a clash reads as urgent without being
alarming, whether the grid math (half-hour rows, column-per-day) lines up
pixel-for-pixel so nothing looks almost-aligned. I kept pulling on those
details past the point they were strictly required by the spec, which told me
something: I want to be the kind of developer who treats the interface itself
as the thing worth getting right, not just a wrapper around correct behaviour.
