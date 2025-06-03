/**
 * Core library exports
 */

// Add your main library functions here
export function hello(name: string): string {
  return `Hello, ${name}!`;
}

// Example type definitions
export interface BitmarkConfig {
  // Define your configuration interface
  version?: string;
}

export interface BreakscapeOptions {
  // Define your options interface
  enabled?: boolean;
}

// Add more exports as you develop the library
