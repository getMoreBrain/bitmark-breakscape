/**
 *  breakscape.ts
 *  ------------------------------------------------------------
 *  Breakscaping for bitmark text.
 *  (c) 2025 — MIT / public domain
 */

import { TextFormat, TextFormatType } from './model/TextFormat'
import { TextLocation, TextLocationType } from './model/TextLocation'

export interface BreakscapeOptions {
  textFormat?: TextFormatType // default: TextFormat.bitmarkText
  textLocation?: TextLocationType // default: TextLocation.body
  modifyArray?: boolean // mutate in-place?
}

const DEF = {
  textFormat: TextFormat.bitmarkText,
  textLocation: TextLocation.body,
} as const

// -----------------------------------------------------------------------------
//  ╭──────────────────────────────────────────────────────────────────────────╮
//  │ 1.  LOW-LEVEL helpers                                                   │
//  ╰──────────────────────────────────────────────────────────────────────────╯
const TRIGGERS = '.@#▼►%!?+-$_=&' // after “[” at SOL
const INLINE_DBL = '*`_!=' // paired inline marks

function breakscapeBuf(
  src: string,
  fmt: TextFormatType,
  loc: TextLocationType
): string {
  const out: string[] = []
  const len = src.length

  let atSOL = true // start-of-line flag

  for (let i = 0; i < len; ) {
    const ch = src[i]
    const nxt = i + 1 < len ? src[i + 1] : ''

    // 1) hats  ^..N  →  ^..N+1
    if (ch === '^') {
      let j = i + 1
      while (j < len && src[j] === '^') j++
      const cnt = j - i
      out.push('^'.repeat(cnt + 1))
      i = j
      atSOL = false
      continue
    }

    // 2) inline doubles (** !! == etc.) within tags or bitmarkText body
    if (
      (loc === TextLocation.tag || fmt === TextFormat.bitmarkText) &&
      INLINE_DBL.includes(ch) &&
      ch === nxt
    ) {
      out.push(ch, '^', ch)
      i += 2
      atSOL = false
      continue
    }

    // 3) end-of-tag   …]  →  …^]
    if (loc === TextLocation.tag && ch === ']' && src[i - 1] !== '^') {
      out.push('^', ']')
      i++
      atSOL = false
      continue
    }

    // 4) body-only rules that fire at SOL
    if (loc === TextLocation.body && atSOL) {
      // 4-a) block / list / code starters ( # | • )
      if (ch === '#' || ch === '|' || ch === '•') {
        out.push(ch, '^')
        i++
        atSOL = false
        continue
      }

      // 4-b) “[” followed by a trigger char
      if (ch === '[' && TRIGGERS.includes(nxt)) {
        out.push('[', '^')
        i++ // leave nxt to be processed next loop
        atSOL = false
        continue
      }
    }

    // 5) plain-body “[.” at SOL
    if (
      fmt !== TextFormat.bitmarkText &&
      loc === TextLocation.body &&
      atSOL &&
      ch === '[' &&
      nxt === '.'
    ) {
      out.push('[', '^')
      i++ // do not consume '.'
      atSOL = false
      continue
    }

    // default copy
    out.push(ch)
    atSOL = ch === '\n'
    i++
  }

  return out.join('')
}

function unbreakscapeBuf(
  src: string,
  fmt: TextFormatType,
  loc: TextLocationType
): string {
  const out: string[] = []
  const len = src.length

  for (let i = 0; i < len; ) {
    const ch = src[i]

    // 1) hats:  ^ .. N  →  drop one
    if (ch === '^') {
      let j = i + 1
      while (j < len && src[j] === '^') j++
      const cnt = j - i
      if (cnt > 1) out.push('^'.repeat(cnt - 1))
      i = j
      continue
    }

    // 2) plain-body “[^.”  →  “[.”
    if (
      loc === TextLocation.body &&
      fmt !== TextFormat.bitmarkText &&
      ch === '[' &&
      src[i + 1] === '^' &&
      src[i + 2] === '.'
    ) {
      out.push('[', '.')
      i += 3
      continue
    }

    // default copy
    out.push(ch)
    i++
  }

  return out.join('')
}

/**
 * Check if an object is a string.
 *
 * @param obj - The object to check.
 * @returns true if the object is a string, otherwise false.
 */
function isString(obj: unknown): boolean {
  return typeof obj === 'string' || obj instanceof String
}

// -----------------------------------------------------------------------------
//  ╭──────────────────────────────────────────────────────────────────────────╮
//  │ 2.  PUBLIC  API                                                         │
//  ╰──────────────────────────────────────────────────────────────────────────╯
class Breakscape {
  breakscape<T extends string | string[] | undefined>(
    val: T,
    opts: BreakscapeOptions = {}
  ): T extends string ? string : T extends string[] ? string[] : undefined {
    const { textFormat: fmt, textLocation: loc } = { ...DEF, ...opts }
    if (val == null) return val as any

    const proc = (s: string) => breakscapeBuf(s, fmt, loc)

    if (Array.isArray(val)) {
      const a = opts.modifyArray ? val : [...val]
      for (let i = 0; i < a.length; i++)
        if (isString(a[i])) a[i] = proc(a[i] as string)
      return a as any
    }
    return proc(val as string) as any
  }

  unbreakscape<T extends string | string[] | undefined>(
    val: T,
    opts: BreakscapeOptions = {}
  ): T extends string ? string : T extends string[] ? string[] : undefined {
    const { textFormat: fmt, textLocation: loc } = { ...DEF, ...opts }
    if (val == null) return val as any

    const proc = (s: string) => unbreakscapeBuf(s, fmt, loc)

    if (Array.isArray(val)) {
      const a = opts.modifyArray ? val : [...val]
      for (let i = 0; i < a.length; i++)
        if (isString(a[i])) a[i] = proc(a[i] as string)
      return a as any
    }
    return proc(val as string) as any
  }

  concatenate(a: string, b: string): string {
    return a + b
  }
}

export { Breakscape }
