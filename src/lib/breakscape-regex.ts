/**
 *  breakscape.ts
 *  ------------------------------------------------------------
 *  Breakscaping for bitmark text.
 *  (c) 2025 — MIT / public domain
 */

import { buildInfo } from '../generated/build-info';
import { BreakscapeOptions } from './model/BreakscapeOptions';
import { TextFormat } from './model/TextFormat';
import { TextLocation } from './model/TextLocation';

const REGEX_MARKS = /([*`_!=])(?=\1)/; // BM_TAG: $1^  --BODY: $1^  ++BODY: $1^
const REGEX_BLOCKS = /^(\|)(code[\s]*|code:|image:|[\s]*$)/; // ++BODY: $2^$3
const REGEX_TITLE_BLOCKS = /^([#]{1,3})([^\S\r\n]+)/; // ++BODY: $4^$5
const REGEX_LIST_BLOCKS = /^(•)([0-9]+[iI]*|[a-zA-Z]{1}|_|\+|-|)([^\S\r\n]+)/; // ++BODY: $6^$7$8
const REGEX_START_OF_TAG = /(\[)([.@#▼►%!?+\-$_=&])/; // --BODY: $2^$3  ++BODY: $9^$10
const REGEX_FOOTER_DIVIDER = /^(~)(~~~[ \t]*)$/; // --BODY: $4^$5  ++BODY: $11^$12
const REGEX_PLAIN_TEXT_DIVIDER = /^(\$)(\$\$\$[ \t]*)$/; // --BODY: $6^$7  ++BODY: $13^$14
const REGEX_END_OF_TAG = /(\^*])/; // BM_TAG: ^$2  PLAIN_TAG: ^$1
const REGEX_BIT_START = /^(\[)(\^*)(\.)/; // PLAIN_BODY: $1^$2$3
const REGEX_HATS = /(\^+)/; // BM_TAG: $3^  PLAIN_TAG: $2^  --BODY: ^$8  ++BODY: $15^  // Must be last

const BREAKSCAPE_BITMARK_TAG_REGEX_SOURCE = `${REGEX_MARKS.source}|${REGEX_END_OF_TAG.source}|${REGEX_HATS.source}`;
const BREAKSCAPE_PLAIN_TAG_REGEX_SOURCE = `${REGEX_END_OF_TAG.source}|${REGEX_HATS.source}`;
const BREAKSCAPE_BITMARK_BODY_REGEX_SOURCE = `${REGEX_MARKS.source}|${REGEX_BLOCKS.source}|${REGEX_TITLE_BLOCKS.source}|${REGEX_LIST_BLOCKS.source}|${REGEX_START_OF_TAG.source}|${REGEX_FOOTER_DIVIDER.source}|${REGEX_PLAIN_TEXT_DIVIDER.source}|${REGEX_HATS.source}`;
const BREAKSCAPE_PLAIN_BODY_REGEX_SOURCE = `${REGEX_BIT_START.source}`;

// Breakscape regex for bitmarkText (bitmark+) in tags
const BREAKSCAPE_BITMARK_TAG_REGEX = new RegExp(
  BREAKSCAPE_BITMARK_TAG_REGEX_SOURCE,
  'gm'
);
const BREAKSCAPE_BITMARK_TAG_REGEX_REPLACER = '$1$3^$2';

// Breakscape regex for plain text in tags
const BREAKSCAPE_PLAIN_TAG_REGEX = new RegExp(
  BREAKSCAPE_PLAIN_TAG_REGEX_SOURCE,
  'gm'
);
const BREAKSCAPE_PLAIN_TAG_REGEX_REPLACER = '$2^$1';

// Breakscape regex for bitmarkText (bitmark++) in body
const BREAKSCAPE_BITMARK_BODY_REGEX = new RegExp(
  BREAKSCAPE_BITMARK_BODY_REGEX_SOURCE,
  'gm'
);
const BREAKSCAPE_BITMARK_BODY_REGEX_REPLACER =
  '$1$2$4$6$9$11$13$15^$3$5$7$8$10$12$14';

// Breakscape regex for plain text in body
const BREAKSCAPE_PLAIN_BODY_REGEX = new RegExp(
  BREAKSCAPE_PLAIN_BODY_REGEX_SOURCE,
  'gm'
);
const BREAKSCAPE_PLAIN_BODY_REGEX_REPLACER = '$1^$2$3';

// Breakscape regex for v2 tag. Not required, same as BREAKSCAPE_PLAIN_TAG_REGEX
// const BREAKSCAPE_V2_TAG_REGEX = new RegExp('^(\\^*])|(\\^+)', 'gm');
// const BREAKSCAPE_V2_TAG_REGEX_REPLACER = '$2^$1';

// Breakscape regex for v2 body
const BREAKSCAPE_V2_BODY_REGEX = new RegExp(
  '^(?:(\\[)(\\^*)(\\.))|(\\^+)',
  'gm'
);
const BREAKSCAPE_V2_BODY_REGEX_REPLACER = '$1$4^$2$3';

// Unbreakscape regex for everything but plain text in the body
const UNBREAKSCAPE_REGEX = new RegExp('\\^([\\^]*)', 'gm');
const UNBREAKSCAPE_REGEX_REPLACER = '$1';

// Unbreakscape regex for plain text in the body
const UNBREAKSCAPE_PLAIN_IN_BODY_REGEX = new RegExp(
  '^(\\[)\\^(\\^*)(\\.)',
  'gm'
);
const UNBREAKSCAPE_PLAIN_IN_BODY_REGEX_REPLACER = '$1$2$3';

// Regex explanation:
// - match a single | or • or # character at the start of a line and capture in group 1
// This will capture all new block characters within the code text.
// Replace with group 1, ^
// TODO: Not sure this is used any longer. #code blocks are not separate bits as far as I am aware?
const BREAKSCAPE_CODE_REGEX = new RegExp('^(\\||•|#)', 'gm');
const BREAKSCAPE_CODE_REGEX_REPLACER = '$1^';

const DEF = {
  format: TextFormat.bitmarkPlusPlus,
  location: TextLocation.body,
} as const;

/**
 * Check if an object is a string.
 *
 * @param obj - The object to check.
 * @returns true if the object is a string, otherwise false.
 */
function isString(obj: unknown): boolean {
  return typeof obj === 'string' || obj instanceof String;
}

// For breakscaping, select the correct regex and replacer for the text format and location.
/**
 * For breakscaping, select the correct regex and replacer for the text format and location.
 *
 * @param textFormat the format of the text
 * @param textLocation the location of the text
 * @param v2 if true, use v2 breakscaping
 * @returns the regex and replacer
 */
function selectBreakscapeRegexAndReplacer(
  textFormat: string,
  textLocation: string,
  v2: boolean | undefined
): { regex: RegExp; replacer: string } {
  let regex: RegExp;
  let replacer: string;

  if (textLocation === TextLocation.tag) {
    regex = BREAKSCAPE_PLAIN_TAG_REGEX;
    replacer = BREAKSCAPE_PLAIN_TAG_REGEX_REPLACER;
    if (!v2 && textFormat === TextFormat.bitmarkPlusPlus) {
      regex = BREAKSCAPE_BITMARK_TAG_REGEX;
      replacer = BREAKSCAPE_BITMARK_TAG_REGEX_REPLACER;
    }
  } else {
    regex = BREAKSCAPE_PLAIN_BODY_REGEX;
    replacer = BREAKSCAPE_PLAIN_BODY_REGEX_REPLACER;
    if (textFormat === TextFormat.bitmarkPlusPlus) {
      if (v2) {
        regex = BREAKSCAPE_V2_BODY_REGEX;
        replacer = BREAKSCAPE_V2_BODY_REGEX_REPLACER;
      } else {
        regex = BREAKSCAPE_BITMARK_BODY_REGEX;
        replacer = BREAKSCAPE_BITMARK_BODY_REGEX_REPLACER;
      }
    }
  }

  return { regex, replacer };
}

// For unbreakscaping, select the correct regex and replacer for the text format and location.
/**
 * For unbreakscaping, select the correct regex and replacer for the text format and location.
 *
 * @param textFormat the format of the text
 * @param textLocation the location of the text
 * @returns the regex and replacer
 */
function selectUnbreakscapeRegexAndReplacer(
  textFormat: string,
  textLocation: string
): { regex: RegExp; replacer: string } {
  const isBitmarkText = textFormat === TextFormat.bitmarkPlusPlus;
  const isPlain = !isBitmarkText;

  let regex: RegExp = UNBREAKSCAPE_REGEX;
  let replacer: string = UNBREAKSCAPE_REGEX_REPLACER;

  if (textLocation === TextLocation.body && isPlain) {
    regex = UNBREAKSCAPE_PLAIN_IN_BODY_REGEX;
    replacer = UNBREAKSCAPE_PLAIN_IN_BODY_REGEX_REPLACER;
  }

  return { regex, replacer };
}

// -----------------------------------------------------------------------------
//  ╭──────────────────────────────────────────────────────────────────────────╮
//  │ 2.  PUBLIC  API                                                         │
//  ╰──────────────────────────────────────────────────────────────────────────╯
class Breakscape {
  public readonly EMPTY_STRING = '' as string;

  /**
   * Escapes special characters in bitmark text by adding caret (^) characters.
   *
   * This method processes text to prevent special characters from being interpreted
   * as bitmark markup. It handles various scenarios including:
   * - Tag triggers after '[' characters
   * - Paired punctuation marks
   * - Hat characters (^)
   * - End-of-tag brackets
   * - Beginning-of-line markers
   *
   * IMPORTANT: Breakscaping differs depending on the bit text format, and if the text will
   * be used in a tag or in the body of a bitmark. The default is bitmark++ in the body.
   * If the text is to be used in a tag, or is not bitmark++, you must specify the textFormat
   * and textLocation options.
   *
   * @param val - The input to breakscape. Can be a string, array of strings, null, or undefined.
   * @param opts - Optional configuration for the breakscape operation.
   * @returns The breakscaped result with the same type as the input.
   *
   * @example
   * ```typescript
   * const breakscape = new Breakscape();
   *
   * // Single string
   * breakscape.breakscape('[.hello]'); // Returns '[^.hello]'
   *
   * // Array of strings
   * breakscape.breakscape(['[.hello]', '[.world]']); // Returns ['[^.hello]', '[^.world]']
   *
   * // With options
   * breakscape.breakscape('[.hello]', {
   *   textFormat: TextFormat.bitmark++,
   *   textLocation: TextLocation.body
   * });
   * ```
   */
  breakscape(val: string, opts?: BreakscapeOptions): string;
  breakscape(val: string[], opts?: BreakscapeOptions): string[];
  breakscape(val: undefined | null, opts?: BreakscapeOptions): undefined;
  breakscape(
    val: string | string[] | undefined | null,
    opts: BreakscapeOptions = {}
  ): string | string[] | undefined {
    if (val == null) return undefined;
    const options = Object.assign({}, DEF, opts);
    if (Array.isArray(val)) {
      return val.map(v => this.breakscape(v, options)) as string[];
    }
    const { regex, replacer } = selectBreakscapeRegexAndReplacer(
      options.format,
      options.location,
      options.v2
    );
    let str = val;
    str = str.replace(regex, replacer);
    return str;
  }

  /**
   * Unbreakscape a string or an array of strings.
   * If the input is an array, a new array will be returned.
   *
   * @param val input value
   * @param opts options for unbreakscaping
   * @returns the input value with any strings unbreakscaped.
   */
  unbreakscape(val: string, opts?: BreakscapeOptions): string;
  unbreakscape(val: string[], opts?: BreakscapeOptions): string[];
  unbreakscape(val: undefined | null, opts?: BreakscapeOptions): undefined;
  unbreakscape(
    val: string | string[] | undefined | null,
    opts: BreakscapeOptions = {}
  ): string | string[] | undefined {
    if (val == null) return undefined;
    const options = Object.assign({}, DEF, opts);
    if (Array.isArray(val)) {
      return val.map(v => this.unbreakscape(v, options)) as string[];
    }
    const { regex, replacer } = selectUnbreakscapeRegexAndReplacer(
      options.format,
      options.location
    );
    let str = val;
    str = str.replace(regex, replacer);
    return str;
  }

  /**
   * Breakscape a code string or an array of code strings.
   * If the input is an array, a new array will be returned.
   *
   * @param val input value
   * @param modifyArray if true, the original array will be modified rather than a copy being made
   * @returns the input value with any strings breakscaped
   */
  public breakscapeCode<T extends unknown | unknown[] | undefined>(
    val: T,
    options?: BreakscapeOptions
  ): T extends string ? string : T extends string[] ? string[] : undefined {
    type R = T extends string
      ? string
      : T extends string[]
        ? string[]
        : undefined;

    if (val == null) return val as unknown as R;

    const opts = Object.assign({}, DEF, options);

    const breakscapeStr = (str: string) => {
      if (!str) return str;
      return str.replace(BREAKSCAPE_CODE_REGEX, BREAKSCAPE_CODE_REGEX_REPLACER);
    };

    if (Array.isArray(val)) {
      const newVal: unknown[] = opts.inPlaceArray ? val : [val.length];
      for (let i = 0, len = val.length; i < len; i++) {
        const v = val[i];
        if (isString(v)) {
          val[i] = breakscapeStr(v);
        }
      }
      val = newVal as T;
    } else if (isString(val)) {
      val = breakscapeStr(val as string) as T;
    }

    return val as unknown as R;
  }

  /**
   * Gets the version of the breakscape library.
   *
   * @returns The current version string of the library.
   *
   * @example
   * ```typescript
   * const breakscape = new Breakscape();
   * console.log(breakscape.version()); // e.g., "1.0.0"
   * ```
   */
  version(): string {
    return buildInfo.version;
  }

  /**
   * Gets the license information for the breakscape library.
   *
   * @returns The license string for the library.
   *
   * @example
   * ```typescript
   * const breakscape = new Breakscape();
   * console.log(breakscape.license()); // e.g., "MIT"
   * ```
   */
  license(): string {
    return buildInfo.license;
  }
}

export { Breakscape };
