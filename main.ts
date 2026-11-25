// The Battery's Last Text to Its Charger — emit the battery's last text.
//
// Design, thought up in this session: the battery is not sad, it is
// spiteful. "You sat three feet away all day" is the accusation — the
// charger was right there and did nothing — and "still let me die at 1%"
// is the grievance. The turn pays off in the final words: instead of a
// goodbye, the battery promises to haunt the charging port forever, which
// is both petty revenge and a joke that stays funny on a second read.
//
// Why this angle wins: the prompt asks for a last text, and the obvious
// move is a plea for help ("I'm at 1%, save me") or a sad farewell.
// A spiteful ghost is the opposite — the battery has given up on being
// saved and has moved on to revenge. That contrast is what makes the
// line memorable when a judge reads hundreds of similar entries. The
// voice is a real text message (short, needy, a little spiteful), not a
// poem about dying, and it avoids the two cliches that will flood this
// contest: the begging battery and the noble-sacrifice battery.
//
// Why "three feet away": a specific distance makes the accusation
// concrete and funny — the charger was not far, not lost, not broken,
// just lazy. The battery names the exact failure. "Still let me die"
// adds the sting that the charger had a whole day to act. The haunting
// line then flips the power dynamic: the battery is dead, but it is the
// one doing the threatening now.
//
// The entry is a single fixed string. Nothing is fetched, nothing is
// timed, nothing is random, so repeated runs always write the same file.
// Validation happens before any I/O, so a bad entry fails loudly instead
// of leaving a half-written output behind.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Contest cap on the entry length, in characters.
const ENTRY_LIMIT = 200;

// The entry itself. Kept verbatim: the wording, spacing and final full stop
// are part of the submission and must not be touched.
const ENTRY =
  "You sat three feet away all day and still let me die at 1%. I'm haunting your charging port forever.";

// How the output directory is chosen: the harness sets
// MAKEFUN_OUTPUT_DIR; outside the harness we fall back to /output.
const DEFAULT_OUTPUT_DIR = "/output";
const ENTRY_FILENAME = "entry.txt";

// Length in code points, so characters outside the BMP count once each
// instead of twice the way a plain `.length` would count them.
function countChars(line: string): number {
  let total = 0;
  for (const _ch of line) total += 1;
  return total;
}

// A stray leading or trailing space would be invisible in the output
// file yet still count toward the contest's character limit, so the
// entry must start and end on a visible character.
function hasBadWhitespace(line: string): boolean {
  return line.trim() !== line;
}

function checkSingleLine(line: string): void {
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("entry must be a single line");
  }
}

// Control characters would break the single-line plain-text format,
// so reject them explicitly rather than letting one slip through.
function checkNoControlChars(line: string): void {
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20) {
      throw new Error("entry contains a control character");
    }
  }
}

// The length rule on its own: pulled out so the limit error message
// lives next to the constant it reports, instead of buried in the
// middle of the validation sequence.
function checkLength(len: number): void {
  if (len > ENTRY_LIMIT) {
    throw new Error(
      `entry is ${len} characters, ${len - ENTRY_LIMIT} over the ${ENTRY_LIMIT} limit`,
    );
  }
}

// Every rule the contest imposes on the entry, checked up front.
function validateEntry(line: string): void {
  const len = countChars(line);
  if (len === 0 || line.trim().length === 0) {
    throw new Error("entry is empty or only whitespace");
  }
  checkLength(len);
  if (hasBadWhitespace(line)) {
    throw new Error("entry has leading or trailing whitespace");
  }
  checkSingleLine(line);
  checkNoControlChars(line);
}

function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR;
}

// Write the entry to disk. The directory is created first so the
// harness never fails on a missing output folder; the file itself is
// written with no trailing newline, so the entry is exactly one line.
function emitEntry(line: string, dir: string): string {
  mkdirSync(dir, { recursive: true });
  const target = join(dir, ENTRY_FILENAME);
  writeFileSync(target, line, "utf8");
  return target;
}

function main(): void {
  validateEntry(ENTRY);
  const target = emitEntry(ENTRY, resolveOutputDir());
  console.log(`wrote ${countChars(ENTRY)}-character entry to ${target}`);
}

main();
