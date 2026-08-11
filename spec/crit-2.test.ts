import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { describe, expect, it } from "vitest";

// Crit 2 — "Unsolicited redesign": https://comp.anu.edu.au/courses/comp4020-agentic-coding-studio/crits/02-unsolicited-redesign/
//
// Organisation: ANU MyTimetable — chosen deliberately as a static, informational
// "front door" to a real ANU system, NOT a rebuild of its login-gated timetable
// functionality. The brief scopes this week to static, content-driven sites:
// no logins, no backend logic, no booking features. So this page describes and
// links to the real MyTimetable, it doesn't reimplement it.
//
// Mechanically checkable lines from the spec live here. The rest — content
// restructured/rewritten in your own words, concrete improvements you can
// articulate, how you directed/grounded/corrected the agent — only a person
// can judge; they're for the crit and PROCESS.md/reflections/crit-2.md, not a
// test. Process evidence (commits, PROCESS.md, reflections/crit-2.md) is
// already covered by `pnpm check:evidence`, not repeated here.

const REAL_ORG_URL = "https://www.anu.edu.au/students/program-administration/timetabling";

function loadHome() {
  const distPath = resolve("dist/index.html");
  return new JSDOM(readFileSync(distPath, "utf8")).window.document;
}

describe("crit 2: links to the real organisation", () => {
  it("links to MyTimetable's real page somewhere on the home page", () => {
    const doc = loadHome();
    const hrefs = Array.from(doc.querySelectorAll("a")).map((a) => a.getAttribute("href") ?? "");
    expect(
      hrefs.some((href) => href.includes("anu.edu.au") && href.toLowerCase().includes("timetabl")),
      `expected a link to ${REAL_ORG_URL} (or an equivalent real ANU timetabling page)`,
    ).toBe(true);
  });
});

describe("crit 2: stays a static front door, not a rebuilt app", () => {
  it("ships no login or booking form", () => {
    const doc = loadHome();
    expect(
      doc.querySelectorAll("form").length,
      "this week's brief is static/no-backend — a <form> here would mean rebuilding login/booking, which is out of scope until week 7+",
    ).toBe(0);
  });
});
