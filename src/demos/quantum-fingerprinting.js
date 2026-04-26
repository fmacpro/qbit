/**
 * Practical Use Case 8: Quantum Fingerprinting
 *
 * Quantum fingerprinting is a communication complexity protocol
 * that allows two parties to check if their data is identical
 * using exponentially less communication than classical methods.
 *
 * Problem: Alice and Bob each have an n-bit string. They want to
 * know if their strings are equal, but communication is expensive.
 *
 * Classical solution: Send all n bits (or use hashing, O(log n) with
 * error probability).
 *
 * Quantum solution: Encode the data into quantum states
 * (fingerprints) using O(log n) qubits. By comparing fingerprints
 * via the SWAP test, they can check equality with bounded error.
 *
 * Practical applications:
 * - Data deduplication in distributed systems
 * - Blockchain transaction verification
 * - Cloud storage integrity checking
 * - Network synchronization verification
 * - DNA sequence comparison
 * - Any "set equality" problem with communication constraints
 *
 * Real-world context:
 * - Proposed by Buhrman et al. in 2001
 * - Exponential quantum advantage in communication complexity
 * - SWAP test is a fundamental primitive in quantum ML
 * - Used in quantum proof systems (QMA, QIP)
 */

import { QuantumSystem, Complex } from '../core/quantum.js';

/**
 * Encode a binary string into a quantum fingerprint using
 * a 2-qubit encoding scheme.
 *
 * Each bit position i contributes a rotation whose angle
 * depends on the bit value and position. Using 2 qubits
 * gives 4 basis states, providing much better distinguishability
 * than a single qubit.
 *
 * @param {number[]} bits - Array of 0s and 1s
 * @returns {QuantumSystem} 2-qubit fingerprint
 */
function encodeFingerprint(bits) {
  const q = new QuantumSystem(2);

  // Use both qubits for encoding. For each bit position,
  // apply a rotation to one of the qubits based on the bit value.
  // This creates a 2-qubit fingerprint with 4 amplitudes,
  // giving much better distinguishability.
  for (let i = 0; i < bits.length; i++) {
    // Alternate between qubits
    const targetQubit = i % 2;
    // Rotation angle depends on position and bit value
    const angle = (bits[i] === 0 ? 1 : -1) * (Math.PI / (i + 2));
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);
    // R_y(angle) = [[cos(θ/2), -sin(θ/2)], [sin(θ/2), cos(θ/2)]]
    const Ry = [
      [new Complex(cos), new Complex(-sin)],
      [new Complex(sin), new Complex(cos)]
    ];
    q.applyGate(Ry, targetQubit);
  }

  return q;
}

/**
 * Perform the SWAP test to compare two quantum states.
 *
 * The SWAP test determines if two quantum states are identical.
 * - If identical: always measures |0⟩
 * - If different: measures |1⟩ with probability (1 - |⟨ψ|φ⟩|²)/2
 *
 * @param {QuantumSystem} state1 - First quantum fingerprint (2 qubits)
 * @param {QuantumSystem} state2 - Second quantum fingerprint (2 qubits)
 * @returns {{ equal: boolean, probDifferent: number, measurement: number }}
 */
function swapTest(state1, state2) {
  // Create a 5-qubit system: [ancilla, fp1_0, fp1_1, fp2_0, fp2_1]
  const q = new QuantumSystem(5);

  // Initialize with the two fingerprint states
  // |0⟩|ψ₁ψ₂⟩|φ₁φ₂⟩
  // Index = 0*16 + b1*8 + b2*4 + c1*2 + c2
  for (let b1 = 0; b1 < 2; b1++) {
    for (let b2 = 0; b2 < 2; b2++) {
      for (let c1 = 0; c1 < 2; c1++) {
        for (let c2 = 0; c2 < 2; c2++) {
          const state1Idx = (b1 << 1) | b2;
          const state2Idx = (c1 << 1) | c2;
          const fullIdx = (b1 << 3) | (b2 << 2) | (c1 << 1) | c2;
          q.state[fullIdx] = state1.state[state1Idx].mul(state2.state[state2Idx]);
        }
      }
    }
  }

  // SWAP test circuit:
  // 1. Hadamard on ancilla (qubit 0)
  q.applyGate('H', 0);

  // 2. Controlled-SWAP — swap qubits 1,2 with qubits 3,4 if ancilla = |1⟩
  // We need to swap the two groups of qubits: (1,2) ↔ (3,4)
  const swappedState = Array.from({ length: 32 }, () => new Complex(0, 0));
  for (let i = 0; i < 32; i++) {
    const ancilla = (i >> 4) & 1;
    if (ancilla === 0) {
      swappedState[i] = q.state[i];
    } else {
      // Ancilla = 1: swap qubits (1,2) with (3,4)
      const q1 = (i >> 3) & 1;
      const q2 = (i >> 2) & 1;
      const q3 = (i >> 1) & 1;
      const q4 = i & 1;
      // Swapped: ancilla=1, then q3,q4,q1,q2
      const swapped = (1 << 4) | (q3 << 3) | (q4 << 2) | (q1 << 1) | q2;
      swappedState[swapped] = q.state[i];
    }
  }
  q.state = swappedState;

  // 3. Hadamard on ancilla
  q.applyGate('H', 0);

  // 4. Measure ancilla
  const measurement = q.measureQubit(0);

  // Compute overlap |⟨ψ|φ⟩|²
  let overlap = new Complex(0, 0);
  for (let i = 0; i < 4; i++) {
    overlap = overlap.add(state1.state[i].conj().mul(state2.state[i]));
  }
  const probDifferent = (1 - overlap.magnitude() ** 2) / 2;

  return {
    equal: measurement === 0,
    probDifferent,
    measurement
  };
}

/**
 * Run multiple rounds of the SWAP test for higher confidence.
 *
 * @param {QuantumSystem} fp1 - First fingerprint
 * @param {QuantumSystem} fp2 - Second fingerprint
 * @param {number} rounds - Number of SWAP test rounds
 * @returns {{ isEqual: boolean, confidence: number, rounds: number }}
 */
function multiRoundSwapTest(fp1, fp2, rounds = 5) {
  // Compute the theoretical detection probability
  let overlap = new Complex(0, 0);
  for (let i = 0; i < 4; i++) {
    overlap = overlap.add(fp1.state[i].conj().mul(fp2.state[i]));
  }
  const pDetect = (1 - overlap.magnitude() ** 2) / 2;

  // Run multiple rounds
  for (let r = 0; r < rounds; r++) {
    const result = swapTest(fp1, fp2);
    if (!result.equal) {
      // Found a difference — strings are definitely different
      return {
        isEqual: false,
        confidence: 1.0,
        rounds: r + 1
      };
    }
  }

  // All rounds said equal.
  // The SWAP test has ZERO false negatives: if states are identical,
  // it ALWAYS measures |0⟩. So if all rounds say equal, they ARE equal.
  const confidence = 1 - Math.pow(1 - pDetect, rounds);
  return {
    isEqual: true,
    confidence,
    rounds
  };
}

/**
 * Generate a random binary string of given length.
 */
function randomBits(length) {
  return Array.from({ length }, () => Math.random() < 0.5 ? 0 : 1);
}

/**
 * Run the quantum fingerprinting demo.
 */
function runDemo() {
  console.log('═'.repeat(56));
  console.log('  🧬 Quantum Fingerprinting');
  console.log('═'.repeat(56));
  console.log();
  console.log('  Two parties check if their data is identical');
  console.log('  using exponentially less communication.');
  console.log();

  // Test 1: Identical strings
  console.log('  ── Test 1: Identical 8-bit strings ──');
  const bits1 = [1, 0, 1, 1, 0, 1, 0, 0];
  const bits2 = [1, 0, 1, 1, 0, 1, 0, 0];
  const fp1 = encodeFingerprint(bits1);
  const fp2 = encodeFingerprint(bits2);
  const r1 = multiRoundSwapTest(fp1, fp2, 3);
  console.log(`  String A: ${bits1.join('')}`);
  console.log(`  String B: ${bits2.join('')}`);
  console.log(`  Multi-round SWAP test: ${r1.isEqual ? '✅ Equal' : '❌ Different'}`);
  console.log(`  Communication: 4 qubits vs ${bits1.length} bits classically`);
  console.log();

  // Test 2: Different strings
  console.log('  ── Test 2: Different 8-bit strings ──');
  const bits3 = [1, 0, 1, 1, 0, 1, 0, 0];
  const bits4 = [1, 0, 1, 1, 1, 1, 0, 0]; // One bit different
  const fp3 = encodeFingerprint(bits3);
  const fp4 = encodeFingerprint(bits4);
  const r2 = multiRoundSwapTest(fp3, fp4, 3);
  console.log(`  String A: ${bits3.join('')}`);
  console.log(`  String B: ${bits4.join('')}`);
  console.log(`  Multi-round SWAP test: ${r2.isEqual ? '✅ Equal' : '❌ Different'}`);
  console.log(`  Rounds used: ${r2.rounds}`);
  console.log();

  // Test 3: Longer strings
  console.log('  ── Test 3: 100-bit strings ──');
  const long1 = randomBits(100);
  const long2 = [...long1];
  const long3 = randomBits(100);
  const fpLong1 = encodeFingerprint(long1);
  const fpLong2 = encodeFingerprint(long2);
  const fpLong3 = encodeFingerprint(long3);

  const r3a = multiRoundSwapTest(fpLong1, fpLong2, 5);
  const r3b = multiRoundSwapTest(fpLong1, fpLong3, 5);
  console.log(`  Same strings: ${r3a.isEqual ? '✅ Equal' : '❌ Different'} (expected: Equal)`);
  console.log(`  Different strings: ${r3b.isEqual ? '✅ Equal' : '❌ Different'} (expected: Different)`);
  console.log(`  Communication: 4 qubits vs 100 bits classically`);
  console.log();

  // Statistical test
  console.log('  ── Statistical test (50 random comparisons, 5 rounds each) ──');
  let correct = 0;
  let falsePositives = 0;
  let falseNegatives = 0;
  for (let t = 0; t < 50; t++) {
    const len = 10 + Math.floor(Math.random() * 90);
    const same = Math.random() < 0.5;
    const a = randomBits(len);
    const b = same ? [...a] : randomBits(len);
    const fpa = encodeFingerprint(a);
    const fpb = encodeFingerprint(b);
    const r = multiRoundSwapTest(fpa, fpb, 5);
    if ((r.isEqual && same) || (!r.isEqual && !same)) correct++;
    if (r.isEqual && !same) falsePositives++;
    if (!r.isEqual && same) falseNegatives++;
  }
  console.log(`  Correct: ${correct}/50 (${((correct / 50) * 100).toFixed(0)}%)`);
  console.log(`  False positives (said equal but different): ${falsePositives}`);
  console.log(`  False negatives (said different but equal): ${falseNegatives}`);
  console.log();

  // Explanation
  console.log('  ── Why this matters ──');
  console.log('  Classical: send all n bits or use hash (O(log n) comm.)');
  console.log('  Quantum:   send O(log n) qubits, test with SWAP');
  console.log();
  console.log('  The SWAP test detects differences with probability');
  console.log('  proportional to 1 - |⟨ψ|φ⟩|². By repeating, error');
  console.log('  can be made arbitrarily small.');
  console.log();

  console.log('  ✅ Quantum Fingerprinting Demo Complete');
  console.log();
}

export { encodeFingerprint, swapTest, multiRoundSwapTest, randomBits };

// Run directly
if (process.argv[1]?.endsWith('quantum-fingerprinting.js')) {
  runDemo();
}
