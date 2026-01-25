/**
 * Diff granularity level
 */
export type DiffGranularity = 'line' | 'word' | 'character';

/**
 * Configuration options for diff computation
 */
export interface DiffOptions {
  /** Level of detail for comparison */
  granularity: DiffGranularity;
  /** Ignore whitespace differences */
  ignoreWhitespace: boolean;
  /** Case-insensitive comparison */
  ignoreCase: boolean;
  /** Remove trailing whitespace before comparison */
  trimTrailingWhitespace: boolean;
  /** Remove blank lines before comparison */
  ignoreBlankLines: boolean;
}

/**
 * Type of change for a diff line
 */
export type LineType = 'add' | 'remove' | 'unchanged';

/**
 * Character-level change within a line
 */
export interface CharChange {
  type: 'add' | 'remove' | 'unchanged';
  value: string;
}

/**
 * A single line in the diff result
 */
export interface DiffLine {
  /** Type of change */
  type: LineType;
  /** Line content */
  content: string;
  /** Line numbers in original/modified files */
  lineNumbers: {
    left?: number;
    right?: number;
  };
  /** Character-level changes for inline highlighting */
  changes?: CharChange[];
}

/**
 * Statistics about the diff result
 */
export interface DiffStats {
  /** Number of lines added */
  added: number;
  /** Number of lines removed */
  removed: number;
  /** Number of unchanged lines */
  unchanged: number;
  /** Total lines in left file */
  totalLeft: number;
  /** Total lines in right file */
  totalRight: number;
}

/**
 * Complete diff result
 */
export interface DiffResult {
  /** All diff lines */
  lines: DiffLine[];
  /** Summary statistics */
  stats: DiffStats;
}

/**
 * Input for diff computation
 */
export interface DiffInput {
  /** Original content */
  left: string;
  /** Modified content */
  right: string;
  /** Diff options */
  options: DiffOptions;
}

/**
 * File metadata
 */
export interface FileMetadata {
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  type: string;
  /** Last modified timestamp */
  lastModified: number;
}

/**
 * Default diff options
 */
export const DEFAULT_DIFF_OPTIONS: DiffOptions = {
  granularity: 'line',
  ignoreWhitespace: false,
  ignoreCase: false,
  trimTrailingWhitespace: false,
  ignoreBlankLines: false,
};
