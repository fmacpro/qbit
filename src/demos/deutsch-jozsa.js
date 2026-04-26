/**
 * Practical Use Case 7: Deutsch-Jozsa Algorithm
 *
 * One of the first quantum algorithms to demonstrate exponential
 * speedup over classical computation (for a specific problem).
 *
 * Problem: Given a function f: {0,1}ⁿ → {0,1} that is EITHER
 * constant (same output for all inputs) OR balanced (0 for half,
 * 1 for half), determine which it is.
 *
 * Classical solution: Need 2ⁿ⁻¹ + 1 queries in worst case.
 * Quantum solution: Just 1 query — exponential speedup.
 *
 * Practical applications:
 * - Function property testing (constant vs balanced)
 * - Boolean function analysis
 * - Pattern detection in binary data
 * - Cryptographic primitive analysis
 * - Educational: demonstrates quantum parallelism
 *
 * Real-world context:
 * - Proposed by Deutsch & Jozsa in 1992
 * - First algorithm showing clear quantum advantage
 * - Foundation for more complex quantum algorithms
 * - Demonstrates the power of quantum superposition + interference
 */

import { QuantumSystem, Complex } from '../core/quantum.js';

/**
 * Build an oracle for the Deutsch-Jozsa problem.
 *
 * The oracle implements f(x) by flipping the phase of |x⟩|−⟩
 * based on f(x): |x⟩|y⟩ → |x⟩|y ⊕ f(x)⟩
 *
 * @param {number} numBits - Number of input bits
 * @param {boolean} constant - true = constant function, false = balanced
 * @param {number} constantValue - If constant, the output value (0 or 1)
 * @returns {Function} Oracle function that modifies a state vector
 */
function buildDJOracle(numBits, constant, constantValue = 0) {
  const dim = 1 << (numBits + 1); // +1 for the output qubit

  if (constant) {
    // f(x) = constantValue for all x
    return (state) => {
      const newState = state.map(c => new Complex(c.real, c.imag));
      if (constantValue === 1) {
        // Phase kickback: |x⟩|−⟩ → -|x⟩|−⟩ when f(x)=1
        // Flip phase of ALL amplitudes (both output=0 and output=1)
        for (let i = 0; i < dim; i++) {
          newState[i] = newState[i].scale(-1);
        }
      }
      return newState;
    };
  } else {
    // Balanced: f(x) = parity of x (0 for even parity, 1 for odd)
    // This is balanced: half of inputs have even parity, half odd
    return (state) => {
      const newState = state.map(c => new Complex(c.real, c.imag));
      for (let i = 0; i < dim; i++) {
        const x = i >> 1; // Input bits (excluding output qubit)
        // f(x) = parity of x
        const parity = countBitsSet(x) % 2;
        // Phase kickback: flip phase when f(x)=1
        if (parity === 1) {
          newState[i] = newState[i].scale(-1);
        }
      }
      return newState;
    };
  }
}

/**
 * Count number of 1 bits in an integer.
 */
function countBitsSet(x) {
  let count = 0;
  while (x) {
    count += x & 1;
    x >>= 1;
  }
  return count;
}

/**
 * Run the Deutsch-Jozsa algorithm.
 *
 * @param {number} numBits - Number of input bits
 * @param {boolean} constant - Is the function constant?
 * @param {number} constantValue - If constant, the value (0 or 1)
 * @returns {{ isConstant: boolean, measurements: number[], queriesUsed: number }}
 */
function deutschJozsa(numBits, constant, constantValue = 0) {
  const oracle = buildDJOracle(numBits, constant, constantValue);
  const totalQubits = numBits + 1; // n input + 1 output

  // Initialize: n qubits in |0⟩, 1 qubit in |1⟩
  const q = new QuantumSystem(totalQubits);

  // Set output qubit to |1⟩
  q.applyGate('X', numBits);

  // Apply Hadamard to ALL qubits
  for (let i = 0; i < totalQubits; i++) {
    q.applyGate('H', i);
  }

  // Apply oracle
  q.state = oracle(q.state);

  // Apply Hadamard to input qubits only (not output)
  for (let i = 0; i < numBits; i++) {
    q.applyGate('H', i);
  }

  // Measure input qubits
  const measurements = [];
  for (let i = 0; i < numBits; i++) {
    measurements.push(q.measureQubit(i));
  }

  // If all measurements are 0, function is constant
  const isConstant = measurements.every(m => m === 0);

  return {
    isConstant,
    measurements,
    queriesUsed: 1,
    expected: constant
  };
}

/**
 * Run the Deutsch-Jozsa demo.
 */
function runDemo() {
  console.log('═'.repeat(56));
  console.log('  ⚡ Deutsch-Jozsa Algorithm');
  console.log('═'.repeat(56));
  console.log();
  console.log('  Determine if a function is constant or balanced');
  console.log('  with a SINGLE query — exponential speedup.');
  console.log();

  // Test with different numbers of bits
  for (let numBits = 1; numBits <= 4; numBits++) {
    console.log(`  ── ${numBits} input bit(s) (${2 ** numBits} possible inputs) ──`);

    // Test constant function (f(x) = 0)
    const r1 = deutschJozsa(numBits, true, 0);
    console.log(`  Constant(0): ${r1.isConstant ? '✅ constant' : '❌ balanced'} (expected: constant)`);

    // Test constant function (f(x) = 1)
    const r2 = deutschJozsa(numBits, true, 1);
    console.log(`  Constant(1): ${r2.isConstant ? '✅ constant' : '❌ balanced'} (expected: constant)`);

    // Test balanced function
    const r3 = deutschJozsa(numBits, false);
    console.log(`  Balanced:    ${!r3.isConstant ? '✅ balanced' : '❌ constant'} (expected: balanced)`);

    console.log(`  Queries used: ${r1.queriesUsed} (classical needs ${2 ** (numBits - 1) + 1})`);
    console.log();
  }

  // Statistical test
  console.log('  ── Statistical test (30 random functions) ──');
  let correct = 0;
  for (let t = 0; t < 30; t++) {
    const bits = 2 + Math.floor(Math.random() * 3); // 2-4 bits
    const constant = Math.random() < 0.5;
    const val = constant ? (Math.random() < 0.5 ? 0 : 1) : 0;
    const r = deutschJozsa(bits, constant, val);
    if (r.isConstant === constant) correct++;
  }
  console.log(`  Correct: ${correct}/30 (${((correct / 30) * 100).toFixed(0)}%)`);
  console.log();

  // Explanation
  console.log('  ── Why this works ──');
  console.log('  Quantum parallelism evaluates all inputs at once.');
  console.log('  Constructive interference: constant → all |0⟩');
  console.log('  Destructive interference: balanced → some |1⟩');
  console.log();
  console.log('  Classical: O(2ⁿ) queries  |  Quantum: 1 query');
  console.log('  This is an exponential speedup!');
  console.log();

  console.log('  ✅ Deutsch-Jozsa Demo Complete');
  console.log();
}

export { deutschJozsa, buildDJOracle };

// Run directly
if (process.argv[1]?.endsWith('deutsch-jozsa.js')) {
  runDemo();
}
