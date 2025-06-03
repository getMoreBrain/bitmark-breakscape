#!/usr/bin/env tsx

/// <reference types="node" />

/**
 * Standalone benchmark script for comparing Breakscape implementations
 *
 * Usage:
 *   npx tsx scripts/benchmark.ts
 */

import { Breakscape as BreakscapeChar } from '../src/lib/breakscape-loop';
import { Breakscape as BreakscapeRegex } from '../src/lib/breakscape-regex';
import { TextFormat, TextLocation } from '../src/lib/index';

// Test data sets
const TEST_DATA = {
  simple: '^',
  medium:
    'This is about an [.article] with **bold** text and some _italic_ content.',
  complex: ':5__5:32]**fg^[.article]e!!--``test]^',
  longText: Array(1000)
    .fill(
      'This is a long text with [.article] tags and **bold** content that needs breakscaping. '
    )
    .join(''),
  arraySmall: ['^', '**bold**', '_italic_', '[.article]'],
  arrayLarge: Array(1000).fill(
    'This is about an [.article] with **bold** text.'
  ),
  specialChars: '^^^^***```___!!!===```^^^',
  realWorld: `
[.article:Performance Test Article]

## Introduction

This article demonstrates various **bitmark** features including:

• _Italic_ text formatting
• **Bold** text formatting
• \`\`Code\`\` formatting
• [@ Special instructions]
• [# Hash tags]

### Code Example

|code
function breakscape(text) {
  return text.replace(/\\^/g, '^^');
}
|

### List Examples

•1 First numbered item
•2 Second numbered item
•a First lettered item
•b Second lettered item

The article contains ^ characters and various markup.

[.end]
`.repeat(100),
};

// Benchmark configurations
const CONFIGS = [
  {
    name: 'bitmark++ body',
    format: TextFormat.bitmarkPlusPlus,
    location: TextLocation.body,
  },
  {
    name: 'bitmark++ tag',
    format: TextFormat.bitmarkPlusPlus,
    location: TextLocation.tag,
  },
  { name: 'text body', format: TextFormat.text, location: TextLocation.body },
  { name: 'text tag', format: TextFormat.text, location: TextLocation.tag },
];

const ITERATIONS = {
  simple: 50000,
  medium: 10000,
  complex: 10000,
  longText: 100,
  arraySmall: 10000,
  arrayLarge: 100,
  specialChars: 20000,
  realWorld: 50,
};

class BenchmarkRunner {
  private charImpl: BreakscapeChar;
  private regexImpl: BreakscapeRegex;
  private results: Array<{
    test: string;
    config: string;
    operation: string;
    charTime: number;
    regexTime: number;
    ratio: number;
    winner: string;
    iterations: number;
  }>;

  constructor() {
    this.charImpl = new BreakscapeChar();
    this.regexImpl = new BreakscapeRegex();
    this.results = [];
  }

  measurePerformance(name, fn, iterations) {
    // Warmup
    for (let i = 0; i < Math.min(100, iterations / 10); i++) {
      fn();
    }

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }

    const start = process.hrtime.bigint();
    let result;

    for (let i = 0; i < iterations; i++) {
      result = fn();
    }

    const end = process.hrtime.bigint();
    const totalTime = Number(end - start) / 1000000; // Convert to milliseconds
    const avgTime = totalTime / iterations;

    return { result, avgTime, totalTime, iterations };
  }

  benchmarkFunction(testName, testData, config, operation) {
    const iterations = ITERATIONS[testName];

    console.log(
      `\n📊 Benchmarking ${testName} - ${operation} (${config.name})`
    );
    console.log(`${'─'.repeat(60)}`);

    let charTestFn, regexTestFn;

    if (operation === 'breakscape') {
      charTestFn = () => this.charImpl.breakscape(testData, config);
      regexTestFn = () => this.regexImpl.breakscape(testData, config);
    } else {
      // For unbreakscape, first breakscape the data
      const breakscapedData = this.charImpl.breakscape(testData, config);
      charTestFn = () => this.charImpl.unbreakscape(breakscapedData, config);
      regexTestFn = () => this.regexImpl.unbreakscape(breakscapedData, config);
    }

    const charResult = this.measurePerformance(
      'Character Implementation',
      charTestFn,
      iterations
    );
    const regexResult = this.measurePerformance(
      'Regex Implementation',
      regexTestFn,
      iterations
    );

    // Verify correctness
    if (
      JSON.stringify(charResult.result) !== JSON.stringify(regexResult.result)
    ) {
      console.error('❌ ERROR: Implementations produce different results!');
      console.log('Character result:', charResult.result);
      console.log('Regex result:', regexResult.result);
      return;
    }

    const ratio = regexResult.avgTime / charResult.avgTime;
    const winner = ratio < 1 ? 'Regex' : 'Character';
    const difference = Math.abs(ratio - 1) * 100;

    console.log(
      `🔸 Character: ${charResult.avgTime.toFixed(4)}ms avg (${charResult.totalTime.toFixed(2)}ms total)`
    );
    console.log(
      `🔸 Regex:     ${regexResult.avgTime.toFixed(4)}ms avg (${regexResult.totalTime.toFixed(2)}ms total)`
    );
    console.log(`🏆 Winner:    ${winner} (${difference.toFixed(1)}% faster)`);

    this.results.push({
      test: testName,
      config: config.name,
      operation,
      charTime: charResult.avgTime,
      regexTime: regexResult.avgTime,
      ratio,
      winner,
      iterations,
    });
  }

  runBenchmarks() {
    console.log('🚀 Starting Breakscape Performance Benchmark');
    console.log('='.repeat(60));

    const startTime = Date.now();

    for (const config of CONFIGS) {
      console.log(`\n\n🔧 Configuration: ${config.name}`);
      console.log('='.repeat(60));

      for (const [testName, testData] of Object.entries(TEST_DATA)) {
        this.benchmarkFunction(testName, testData, config, 'breakscape');
        this.benchmarkFunction(testName, testData, config, 'unbreakscape');
      }
    }

    const endTime = Date.now();
    console.log(`\n\n📈 Benchmark Summary`);
    console.log('='.repeat(60));
    console.log(
      `Total benchmark time: ${((endTime - startTime) / 1000).toFixed(2)}s`
    );

    this.printSummary();
  }

  printSummary() {
    const breakscapeResults = this.results.filter(
      r => r.operation === 'breakscape'
    );
    const unbreakscapeResults = this.results.filter(
      r => r.operation === 'unbreakscape'
    );

    console.log(`\n🏆 Overall Winners:`);

    const breakscapeWins = breakscapeResults.filter(
      r => r.winner === 'Character'
    ).length;
    const regexBreakscapeWins = breakscapeResults.length - breakscapeWins;
    console.log(
      `  Breakscape:   Character ${breakscapeWins}/${breakscapeResults.length}, Regex ${regexBreakscapeWins}/${breakscapeResults.length}`
    );

    const unbreakscapeWins = unbreakscapeResults.filter(
      r => r.winner === 'Character'
    ).length;
    const regexUnbreakscapeWins = unbreakscapeResults.length - unbreakscapeWins;
    console.log(
      `  Unbreakscape: Character ${unbreakscapeWins}/${unbreakscapeResults.length}, Regex ${regexUnbreakscapeWins}/${unbreakscapeResults.length}`
    );

    // Print extreme cases
    const sortedByRatio = [...this.results].sort((a, b) => b.ratio - a.ratio);
    console.log(`\n🚀 Biggest Performance Differences:`);
    console.log(
      `  Most in favor of Character: ${sortedByRatio[sortedByRatio.length - 1].test} ${sortedByRatio[sortedByRatio.length - 1].operation} (${(1 / sortedByRatio[sortedByRatio.length - 1].ratio).toFixed(2)}x faster)`
    );
    console.log(
      `  Most in favor of Regex:     ${sortedByRatio[0].test} ${sortedByRatio[0].operation} (${sortedByRatio[0].ratio.toFixed(2)}x faster)`
    );

    // Average ratios
    const avgBreakscapeRatio =
      breakscapeResults.reduce((sum, r) => sum + r.ratio, 0) /
      breakscapeResults.length;
    const avgUnbreakscapeRatio =
      unbreakscapeResults.reduce((sum, r) => sum + r.ratio, 0) /
      unbreakscapeResults.length;

    console.log(`\n📊 Average Performance Ratios (Regex/Character):`);
    console.log(
      `  Breakscape:   ${avgBreakscapeRatio.toFixed(3)} (${avgBreakscapeRatio > 1 ? 'Character faster' : 'Regex faster'})`
    );
    console.log(
      `  Unbreakscape: ${avgUnbreakscapeRatio.toFixed(3)} (${avgUnbreakscapeRatio > 1 ? 'Character faster' : 'Regex faster'})`
    );
  }
}

// Run the benchmark
const runner = new BenchmarkRunner();
runner.runBenchmarks();
