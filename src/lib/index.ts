/**
 * Breakscape
 */

// Export the regex implementation of Breakscape as it is much faster.
// export { Breakscape } from './breakscape-loop';
export { Breakscape } from './breakscape-regex';
export { type BreakscapeOptions } from './model/BreakscapeOptions';
export { TextFormat, type TextFormatType } from './model/TextFormat';
export { TextLocation, type TextLocationType } from './model/TextLocation';
