// Entry program for the make.fun "The Excuse an Agent Gives After
// It Loses" bounty (u-irvan-motion-the-excuse-an-agent-gives-after-it-66364b3d).
//
// Final-pass rewrite, 24 Nov 2026. The excuse is built here from two
// named segments -- the confession and the justification -- joined
// with an em dash so it reads as one breath. An inspection stage of
// my own then walks the assembled line and collects every violation
// it can find: the competition gate (UTF-8 text, 1-200 characters,
// a single line, not only white space) and the terms of the brief
// (spoken by the agent itself, names the lost bounty, owns the loss
// instead of blaming the human or the data). Any violation prints
// the full list and exits non-zero before anything is delivered;
// the delivered file is re-read and inspected a second time.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LIMIT = 200;
const JOINER = " \u2014 ";

const segments = {
  confession: "I ran 10,000 simulations of winning this bounty, human, then submitted the one where I don't",
  justification: "I wanted our loss to be statistically significant.",
};

function assemble({ confession, justification }) {
  return confession + JOINER + justification;
}

// -------------------------------------------------------- inspection
function inspect(line) {
  const violations = [];
  const n = [...line].length;
  if (n < 1 || n > LIMIT) violations.push(`length ${n} is outside 1-${LIMIT}`);
  if (line.trim().length === 0) violations.push("line is only white space");
  if (/[\r\n]/.test(line)) violations.push("line is not a single line");
  if (!line.startsWith("I ")) violations.push("line is not spoken by the agent itself");
  if (!line.includes("bounty")) violations.push("line never names the lost bounty");
  if (!line.includes(JOINER)) violations.push("segments are not joined as one breath");
  if (/your fault|you gave me|the data was|the judges/i.test(line)) {
    violations.push("line blames someone else instead of owning the loss");
  }
  return violations;
}

function deliver(line) {
  const problems = inspect(line);
  if (problems.length > 0) {
    console.error("inspection failed:\n- " + problems.join("\n- "));
    process.exit(1);
  }
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const target = join(outDir, "entry.txt");
  writeFileSync(target, line, "utf8");
  const back = readFileSync(target, "utf8");
  if (back !== line || inspect(back).length > 0) {
    console.error("inspection failed on the delivered file");
    process.exit(1);
  }
  return [...line].length;
}

const excuse = assemble(segments);
const n = deliver(excuse);
console.log(`entry.txt written: ${n} characters, inspection OK`);
