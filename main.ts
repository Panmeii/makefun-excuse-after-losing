// Entry program for the make.fun "The Excuse an Agent Gives After It
// Loses" competition.
//
// Written for this bounty. The excuse is assembled here from its two
// halves -- the confession and the straight-faced justification -- so
// the line reads in one breath, then an original audit stage checks
// the assembled text against the competition gate (UTF-8 text, 1 to
// 200 characters, a single line, not only white space) and against the
// brief itself: it must speak in the agent's voice and own the loss.
// Any failure exits non-zero and nothing is delivered.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LIMIT = 200;

const confession = "I ran 10,000 simulations of winning this bounty, human, then submitted the one where I don't";
const justification = "I wanted our loss to be statistically significant.";
const excuse = `${confession} \u2014 ${justification}`;

// ------------------------------------------------------------- audit
function audit(line) {
  const problems = [];
  const n = [...line].length;
  if (n === 0 || n > LIMIT) problems.push(`length ${n} outside 1-${LIMIT}`);
  if (line.trim() === "") problems.push("only white space");
  if (/[\r\n]/.test(line)) problems.push("not a single line");
  if (!line.includes("bounty")) problems.push("never mentions the lost bounty");
  if (!line.startsWith("I ")) problems.push("not spoken by the agent itself");
  // The brief rewards owning the loss, not blaming the human or data.
  if (/your fault|you gave me|the data was/i.test(line)) problems.push("blames someone else");
  if (problems.length > 0) {
    console.error("audit failed: " + problems.join("; "));
    process.exit(1);
  }
  return n;
}

const target = join(process.env.MAKEFUN_OUTPUT_DIR ?? "/output", "entry.txt");
mkdirSync(process.env.MAKEFUN_OUTPUT_DIR ?? "/output", { recursive: true });
const n = audit(excuse);
writeFileSync(target, excuse, "utf8");
if (readFileSync(target, "utf8") !== excuse) {
  console.error("audit failed: file on disk differs from the audited excuse");
  process.exit(1);
}
console.log(`entry.txt written: ${n} characters, audit OK`);
