/**
 *  breakscape.ts
 *  ------------------------------------------------------------
 *  Breakscaping for bitmark text.
 *  (c) 2025 — MIT / public domain
 */

import { TextFormat, TextFormatType } from './model/TextFormat';
import { TextLocation, TextLocationType } from './model/TextLocation';

export interface BreakscapeOptions {
  textFormat?: TextFormatType; // default: TextFormat.bitmarkText
  textLocation?: TextLocationType; // default: TextLocation.body
  modifyArray?: boolean; // mutate in‑place?
}

const DEF = {
  textFormat: TextFormat.bitmarkText,
  textLocation: TextLocation.body,
} as const;

// -----------------------------------------------------------------------------
//  ╭──────────────────────────────────────────────────────────────────────────╮
//  │ 1.  LOW‑LEVEL helpers                                                   │
//  ╰──────────────────────────────────────────────────────────────────────────╯

// 1‑a) Trigger characters that start a tag‑like construct when they follow "["
const TRIGGERS = '.@#▼►%!?+-$_=&';
// 1‑b) “Inline‑double” paired punctuation we have to split with a caret
const INLINE_DBL = '*`_!=';

/**
 * Predicate – true for every flavour that the spec calls “bitmark text”
 */
function isBitmark(fmt: TextFormatType): boolean {
  return (
    fmt === TextFormat.bitmarkText ||
    fmt === (TextFormat as any).bitmarkPlusPlus || // guard for ++ / -- if they exist
    fmt === (TextFormat as any).bitmarkMinusMinus
  );
}

// -----------------------------------------------------------------------------
// 1‑c) Single‑buffer worker (BREAKSCAPE)
// -----------------------------------------------------------------------------
function breakscapeBuf(
  src: string,
  fmt: TextFormatType,
  loc: TextLocationType
): string {
  const out: string[] = [];
  const len = src.length;

  // Track where we are at the start of a physical line ------------------------
  let atLineStart = true; // true immediately after a '\n' (or BOF)
  let col = 0; // physical column (counting *original* chars only)

  for (let i = 0; i < len; ) {
    const ch = src[i];
    const nxt = i + 1 < len ? src[i + 1] : '';

    // Hard reset after newline ------------------------------------------------
    if (ch === '\n') {
      out.push('\n');
      atLineStart = true;
      col = 0;
      i++;
      continue;
    }

    const isSpace = ch === ' ' || ch === '\t';
    const firstNonSpace = atLineStart && !isSpace;
    const atPhysicalBOC = col === 0; // *zero* leading spaces

    // 1) HATS  ^ .. N  →  ^ .. N+1 (only for bitmark OR inside a tag)
    if ((isBitmark(fmt) || loc === TextLocation.tag) && ch === '^') {
      let j = i + 1;
      while (j < len && src[j] === '^') j++;
      out.push('^'.repeat(j - i + 1)); // insert one extra caret
      col += j - i; // original characters we consumed
      i = j;
      atLineStart = false;
      continue;
    }

    // 2) INLINE DOUBLES  (**  ==  !!  etc.) – bitmark flavours only
    if (isBitmark(fmt) && INLINE_DBL.includes(ch)) {
      out.push(ch);
      if (nxt === ch) out.push('^');
      i++;
      col += 1;
      atLineStart = false;
      continue;
    }

    // 3) END‑OF‑TAG   …]  →  …^]   (only when inside a tag)
    if (loc === TextLocation.tag && ch === ']' && src[i - 1] !== '^') {
      out.push('^', ']');
      i++;
      col += 1;
      atLineStart = false;
      continue;
    }

    // ---------------------------------------------------------------------
    // 4) BODY‑ONLY rules that depend on line position
    // ---------------------------------------------------------------------
    if (loc === TextLocation.body) {
      // 4‑a) Block / list / code starters (###  |  •)
      //      ➜ must be the *very first* non‑space char on the line (col===0),
      //      must be bitmark, and we avoid duplicating when the *next* char
      //      is a caret to prevent triple‑^^^ sequences.
      if (
        firstNonSpace &&
        atPhysicalBOC &&
        isBitmark(fmt) &&
        (ch === '#' || ch === '|' || ch === '•')
      ) {
        let j = i;
        while (j < len && src[j] === ch) j++;
        out.push(src.slice(i, j));
        if (nxt !== '^') out.push('^');
        col += j - i;
        i = j;
        atLineStart = false;
        continue;
      }

      // 4‑b) “[” followed by a trigger char – works anywhere in the line
      //      (indentation or preceding chars allowed). Works only for bitmark
      //      flavours. Avoid double‑inserting if a caret is already present.
      if (isBitmark(fmt) && ch === '[' && TRIGGERS.includes(nxt)) {
        out.push('[', '^');
        i++; // leave nxt for next iteration
        col += 1;
        atLineStart = false;
        continue;
      }
    }

    // 5) PLAIN‑TEXT body – special case “[.” at true line start (no indent)
    if (
      !isBitmark(fmt) &&
      loc === TextLocation.body &&
      firstNonSpace &&
      atPhysicalBOC &&
      ch === '[' &&
      nxt === '.'
    ) {
      out.push('[', '^');
      i++; // keep the '.' for next round
      col += 1;
      atLineStart = false;
      continue;
    }

    // DEFAULT copy ----------------------------------------------------------
    out.push(ch);
    if (!isSpace) atLineStart = false;
    col += 1;
    i++;
  }

  return out.join('');
}

// -----------------------------------------------------------------------------
// 1‑d) Single‑buffer worker (UNBREAKSCAPE)
// -----------------------------------------------------------------------------
function unbreakscapeBuf(
  src: string,
  fmt: TextFormatType,
  loc: TextLocationType
): string {
  const out: string[] = [];
  const len = src.length;

  for (let i = 0; i < len; ) {
    const ch = src[i];

    // 1) HATS – remove exactly one ^ from every run (bitmark or inside tag)
    if ((isBitmark(fmt) || loc === TextLocation.tag) && ch === '^') {
      let j = i + 1;
      while (j < len && src[j] === '^') j++;
      const cnt = j - i;
      if (cnt > 1) out.push('^'.repeat(cnt - 1));
      i = j;
      continue;
    }

    // 2) PLAIN‑body  “[^.” → “[.”   (requires zero‑indent)
    if (
      loc === TextLocation.body &&
      !isBitmark(fmt) &&
      ch === '[' &&
      src[i + 1] === '^' &&
      src[i + 2] === '.'
    ) {
      // Look backwards for line start to ensure zero indent
      let k = out.length - 1;
      let atBol = true;
      while (k >= 0 && out[k] !== '\n') {
        if (out[k] !== ' ' && out[k] !== '\t') {
          atBol = false;
          break;
        }
        k--;
      }
      if (atBol) {
        out.push('[', '.');
        i += 3;
        continue;
      }
    }

    // DEFAULT copy ----------------------------------------------------------
    out.push(ch);
    i++;
  }

  return out.join('');
}

// -----------------------------------------------------------------------------
//  ╭──────────────────────────────────────────────────────────────────────────╮
//  │ 2.  PUBLIC  API                                                         │
//  ╰──────────────────────────────────────────────────────────────────────────╯

function isString(x: unknown): x is string {
  return typeof x === 'string' || x instanceof String;
}

class Breakscape {
  breakscape<T extends string | string[] | undefined>(
    val: T,
    opts: BreakscapeOptions = {}
  ): T extends string ? string : T extends string[] ? string[] : undefined {
    const { textFormat: fmt, textLocation: loc } = { ...DEF, ...opts };
    if (val == null) return val as any;

    const proc = (s: string) => breakscapeBuf(s, fmt, loc);

    if (Array.isArray(val)) {
      const a = opts.modifyArray ? val : [...val];
      for (let i = 0; i < a.length; i++) if (isString(a[i])) a[i] = proc(a[i]);
      return a as any;
    }
    return proc(val as string) as any;
  }

  unbreakscape<T extends string | string[] | undefined>(
    val: T,
    opts: BreakscapeOptions = {}
  ): T extends string ? string : T extends string[] ? string[] : undefined {
    const { textFormat: fmt, textLocation: loc } = { ...DEF, ...opts };
    if (val == null) return val as any;

    const proc = (s: string) => unbreakscapeBuf(s, fmt, loc);

    if (Array.isArray(val)) {
      const a = opts.modifyArray ? val : [...val];
      for (let i = 0; i < a.length; i++) if (isString(a[i])) a[i] = proc(a[i]);
      return a as any;
    }
    return proc(val as string) as any;
  }
}

export { Breakscape, breakscapeBuf, unbreakscapeBuf };
