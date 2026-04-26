/**
 * Practical Use Case 5: Quantum Error Correction (Repetition Code)
 *
 * Quantum states are extremely fragile — decoherence and gate errors
 * corrupt information. Quantum error correction (QEC) is essential
 * for building reliable quantum computers.
 *
 * The 3-qubit repetition code protects against bit-flip errors:
 * - Encode 1 logical qubit into 3 physical qubits
 * - |0⟩_L = |000⟩, |1⟩_L = |111⟩
 * - Detect errors using syndrome measurements (parity checks)
 * - Correct single bit-flip errors
 *
 * Practical applications:
 * - Fault-tolerant quantum computing
 * - Quantum memory protection
 * - Error mitigation in NISQ devices
 * - Surface codes (scalable QEC)
 * - Quantum communication over noisy channels
 */

import { QuantumSystem, Complex } from '../core/quantum.js';

/**
 * Encode a logical qubit into the 3-qubit repetition code.
 *
 * |0⟩_L = |000⟩
 * |1⟩_L = |111⟩
 *
 * Encoding circuit:
 *   |ψ⟩ ──●── |ψ⟩_L
 *   |0⟩ ──X──
 *   |0⟩ ──X──
 *
 * @param {QuantumSystem} q - System with 1 qubit (the logical qubit)
 * @returns {QuantumSystem} System with 3 qubits in encoded state
 */
function encodeRepetitionCode(q) {
  // Start with 3 qubits, first one is our logical qubit
  const encoded = new QuantumSystem(3);

  // Copy the state of qubit 0 to qubits 1 and 2 using CNOTs
  // This creates the entangled state a|000⟩ + b|111⟩
  encoded.state = [
    q.state[0],           // |000⟩ amplitude
    new Complex(0, 0),    // |001⟩
    new Complex(0, 0),    // |010⟩
    new Complex(0, 0),    // |011⟩
    new Complex(0, 0),    // |100⟩
    new Complex(0, 0),    // |101⟩
    new Complex(0, 0),    // |110⟩
    q.state[1]            // |111⟩ amplitude
  ];

  return encoded;
}

/**
 * Apply a bit-flip error to a specific qubit.
 *
 * @param {QuantumSystem} q
 * @param {number} qubitIndex - Which qubit to flip (0, 1, or 2)
 */
function applyBitFlipError(q, qubitIndex) {
  q.applyGate('X', qubitIndex);
}

/**
 * Measure the error syndrome (parity checks).
 *
 * Syndrome bits indicate which qubits disagree:
 * - Z₀Z₁ measures parity between qubits 0 and 1
 * - Z₁Z₂ measures parity between qubits 1 and 2
 *
 * @param {QuantumSystem} q
 * @returns {{ syndrome: number[], errorLocation: number|null }}
 */
function measureSyndrome(q) {
  // Compute parity between qubit pairs by measuring in Z-basis
  // We simulate this by computing probabilities from the state vector

  const probs = q.getProbabilities();

  // Parity Z₀Z₁: 0 if qubits 0 and 1 agree, 1 if they disagree
  let parity01 = 0;
  let parity12 = 0;

  for (let i = 0; i < 8; i++) {
    const q0 = (i >> 2) & 1;
    const q1 = (i >> 1) & 1;
    const q2 = i & 1;

    if (q0 !== q1) parity01 += probs[i];
    if (q1 !== q2) parity12 += probs[i];
  }

  // Round to nearest 0 or 1
  const s0 = Math.round(parity01);
  const s1 = Math.round(parity12);

  // Map syndrome to error location
  // (s0, s1) = (0,0) → no error
  // (s0, s1) = (1,0) → error on qubit 0
  // (s0, s1) = (0,1) → error on qubit 2
  // (s0, s1) = (1,1) → error on qubit 1
  let errorLocation = null;
  if (s0 === 1 && s1 === 0) errorLocation = 0;
  else if (s0 === 0 && s1 === 1) errorLocation = 2;
  else if (s0 === 1 && s1 === 1) errorLocation = 1;

  return { syndrome: [s0, s1], errorLocation };
}

/**
 * Correct a detected error by applying X gate to the affected qubit.
 *
 * @param {QuantumSystem} q
 * @param {number} qubitIndex
 */
function correctError(q, qubitIndex) {
  if (qubitIndex !== null) {
    q.applyGate('X', qubitIndex);
  }
}

/**
 * Decode the 3-qubit repetition code back to a single logical qubit.
 * Majority vote: if 2+ qubits are |1⟩, logical result is |1⟩.
 *
 * @param {QuantumSystem} q - 3-qubit encoded system
 * @returns {number} Decoded logical bit (0 or 1)
 */
function decodeAndMeasure(q) {
  const bits = q.measure();
  const ones = bits.filter(b => b === 1).length;
  return ones >= 2 ? 1 : 0;
}

/**
 * Run a full error correction cycle.
 *
 * @param {number} logicalBit - The logical bit to encode (0 or 1)
 * @param {number|null} errorQubit - Which qubit to flip (null = no error)
 * @returns {{ original: number, decoded: number, corrected: boolean, syndrome: number[] }}
 */
function errorCorrectionCycle(logicalBit, errorQubit = null) {
  // Create logical qubit
  const logical = new QuantumSystem(1);
  if (logicalBit === 1) {
    logical.applyGate('X', 0);
  }

  // Encode
  const encoded = encodeRepetitionCode(logical);

  // Apply error (if any)
  if (errorQubit !== null) {
    applyBitFlipError(encoded, errorQubit);
  }

  // Measure syndrome
  const { syndrome, errorLocation } = measureSyndrome(encoded);

  // Correct
  correctError(encoded, errorLocation);

  // Decode and measure
  const decoded = decodeAndMeasure(encoded);

  return {
    original: logicalBit,
    decoded,
    corrected: decoded === logicalBit,
    syndrome,
    errorDetectedAt: errorLocation
  };
}

/**
 * Run the error correction demo.
 */
function runDemo() {
  console.log('═'.repeat(56));
  console.log('  🛡️  Quantum Error Correction (3-Qubit Repetition Code)');
  console.log('═'.repeat(56));
  console.log();
  console.log('  Quantum states are fragile. Error correction protects');
  console.log('  against decoherence and gate errors.');
  console.log();

  // Test 1: No error
  console.log('  ── Test 1: No error ──');
  const r1 = errorCorrectionCycle(1, null);
  console.log(`  Original: ${r1.original}  |  Decoded: ${r1.decoded}  |  ${r1.corrected ? '✅ Correct' : '❌ Error'}`);
  console.log(`  Syndrome: (${r1.syndrome})  |  Error at: qubit ${r1.errorDetectedAt}`);
  console.log();

  // Test 2: Error on qubit 0
  console.log('  ── Test 2: Bit-flip on qubit 0 ──');
  const r2 = errorCorrectionCycle(1, 0);
  console.log(`  Original: ${r2.original}  |  Decoded: ${r2.decoded}  |  ${r2.corrected ? '✅ Correct' : '❌ Error'}`);
  console.log(`  Syndrome: (${r2.syndrome})  |  Error at: qubit ${r2.errorDetectedAt}`);
  console.log();

  // Test 3: Error on qubit 1
  console.log('  ── Test 3: Bit-flip on qubit 1 ──');
  const r3 = errorCorrectionCycle(0, 1);
  console.log(`  Original: ${r3.original}  |  Decoded: ${r3.decoded}  |  ${r3.corrected ? '✅ Correct' : '❌ Error'}`);
  console.log(`  Syndrome: (${r3.syndrome})  |  Error at: qubit ${r3.errorDetectedAt}`);
  console.log();

  // Test 4: Error on qubit 2
  console.log('  ── Test 4: Bit-flip on qubit 2 ──');
  const r4 = errorCorrectionCycle(0, 2);
  console.log(`  Original: ${r4.original}  |  Decoded: ${r4.decoded}  |  ${r4.corrected ? '✅ Correct' : '❌ Error'}`);
  console.log(`  Syndrome: (${r4.syndrome})  |  Error at: qubit ${r4.errorDetectedAt}`);
  console.log();

  // Test 5: Statistical resilience
  console.log('  ── Statistical test (100 random trials, random errors) ──');
  let successes = 0;
  const trials = 100;
  for (let t = 0; t < trials; t++) {
    const bit = Math.random() < 0.5 ? 0 : 1;
    const errorQubit = Math.random() < 0.7
      ? Math.floor(Math.random() * 3) // 70% chance of error
      : null;                          // 30% no error
    const result = errorCorrectionCycle(bit, errorQubit);
    if (result.corrected) successes++;
  }
  console.log(`  Success rate: ${successes}/${trials} (${(successes / trials * 100).toFixed(0)}%)`);
  console.log();

  // Explanation
  console.log('  ── How it works ──');
  console.log('  1. Encode: |0⟩ → |000⟩, |1⟩ → |111⟩');
  console.log('  2. Syndrome: Measure Z₀Z₁ and Z₁Z₂ parity');
  console.log('  3. Correct: Apply X to the flipped qubit');
  console.log('  4. Decode: Majority vote');
  console.log();
  console.log('  This corrects any single bit-flip error. More advanced');
  console.log('  codes (Steane, Surface) correct both bit-flip and phase errors.');
  console.log();

  console.log('  ✅ Error Correction Demo Complete');
  console.log();
}

export { encodeRepetitionCode, applyBitFlipError, measureSyndrome, correctError, decodeAndMeasure, errorCorrectionCycle };

// Run directly
if (process.argv[1]?.endsWith('error-correction.js')) {
  runDemo();
}
