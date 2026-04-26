/**
 * Practical Use Case 1: Quantum Random Number Generator (QRNG)
 *
 * True randomness is critical for cryptography, simulations, and
 * statistical sampling. Classical computers can only generate
 * pseudo-random numbers. A quantum computer can produce
 * provably random numbers by measuring superposition states.
 *
 * How it works:
 * 1. Put a qubit into superposition with a Hadamard gate
 * 2. Measure the qubit — the outcome is fundamentally random
 * 3. Repeat to build random bit strings
 *
 * Practical applications:
 * - Cryptographic key generation
 * - Secure token generation (OTP, session IDs)
 * - Monte Carlo simulations
 * - Scientific lotteries and unbiased sampling
 * - Blockchain / consensus protocols
 */

import { QuantumSystem } from '../core/quantum.js';

/**
 * Generate a random bit using quantum superposition.
 * @returns {number} 0 or 1
 */
function quantumRandomBit() {
  const q = new QuantumSystem(1);
  q.applyGate('H', 0);     // Put into superposition: (|0⟩ + |1⟩)/√2
  const [bit] = q.measure();
  return bit;
}

/**
 * Generate a random byte (0-255) using 8 quantum measurements.
 * @returns {number}
 */
function quantumRandomByte() {
  let value = 0;
  for (let i = 0; i < 8; i++) {
    value = (value << 1) | quantumRandomBit();
  }
  return value;
}

/**
 * Generate a random integer in range [min, max] (inclusive).
 * Uses rejection sampling to avoid bias.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function quantumRandomInt(min, max) {
  const range = max - min + 1;
  const bitsNeeded = Math.ceil(Math.log2(range));

  while (true) {
    let value = 0;
    for (let i = 0; i < bitsNeeded; i++) {
      value = (value << 1) | quantumRandomBit();
    }
    if (value < range) return min + value;
    // Reject and retry (avoids modulo bias)
  }
}

/**
 * Generate a random float in [0, 1) using 52 bits of quantum randomness.
 * @returns {number}
 */
function quantumRandomFloat() {
  // Build a 52-bit integer using BigInt to avoid 32-bit overflow
  let value = 0n;
  for (let i = 0; i < 52; i++) {
    value = (value << 1n) | BigInt(quantumRandomBit());
  }
  return Number(value) / (2 ** 52);
}

/**
 * Generate a random hex string (e.g., for crypto tokens).
 * @param {number} bytes - Number of random bytes
 * @returns {string}
 */
function quantumRandomHex(bytes) {
  const buf = [];
  for (let i = 0; i < bytes; i++) {
    buf.push(quantumRandomByte().toString(16).padStart(2, '0'));
  }
  return buf.join('');
}

// ─── Demo Runner ────────────────────────────────────────────────────────────

function runDemo() {
  console.log('═'.repeat(56));
  console.log('  🔐 Quantum Random Number Generator (QRNG)');
  console.log('═'.repeat(56));
  console.log();
  console.log('  Classical PRNGs are deterministic — given the same seed,');
  console.log('  they produce the same sequence. Quantum measurement is');
  console.log('  fundamentally random (Born rule).');
  console.log();

  // Test 1: Single random bits
  console.log('  ── 10 random bits ──');
  const bits = Array.from({ length: 10 }, () => quantumRandomBit());
  console.log(`  ${bits.join(' ')}`);
  console.log();

  // Test 2: Random bytes
  console.log('  ── 8 random bytes (0-255) ──');
  const bytes = Array.from({ length: 8 }, () => quantumRandomByte());
  console.log(`  ${bytes.join(', ')}`);
  console.log();

  // Test 3: Random integers
  console.log('  ── Random dice rolls (1-6) ──');
  const rolls = Array.from({ length: 10 }, () => quantumRandomInt(1, 6));
  console.log(`  ${rolls.join(', ')}`);
  console.log();

  // Test 4: Random floats
  console.log('  ── Random floats [0, 1) ──');
  const floats = Array.from({ length: 5 }, () => quantumRandomFloat().toFixed(8));
  console.log(`  ${floats.join(', ')}`);
  console.log();

  // Test 5: Cryptographic token
  console.log('  ── 32-byte hex token (like a session key) ──');
  console.log(`  ${quantumRandomHex(32)}`);
  console.log();

  // Test 6: Statistical distribution check
  console.log('  ── Distribution test (1000 bits) ──');
  const allBits = Array.from({ length: 1000 }, () => quantumRandomBit());
  const zeros = allBits.filter(b => b === 0).length;
  const ones = allBits.filter(b => b === 1).length;
  console.log(`  Zeros: ${zeros}  |  Ones: ${ones}`);
  console.log(`  Expected ~500 each (binomial distribution).`);
  console.log();

  console.log('  ✅ QRNG Demo Complete');
  console.log();
}

export { quantumRandomBit, quantumRandomByte, quantumRandomInt, quantumRandomFloat, quantumRandomHex };

// Run directly
if (process.argv[1]?.endsWith('quantum-random.js')) {
  runDemo();
}
