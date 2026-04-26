/**
 * Practical Use Case 2: Grover's Search Algorithm
 *
 * Grover's algorithm provides a quadratic speedup for searching
 * an unsorted database of N items — O(√N) instead of O(N).
 *
 * Practical applications:
 * - Unsorted database search
 * - SAT problem solving (boolean satisfiability)
 * - Finding collisions in hash functions
 * - Solving constraint satisfaction problems
 * - Graph coloring problems
 * - Password cracking (searching for a target hash)
 *
 * How it works:
 * 1. Initialize all qubits in superposition
 * 2. Apply the "oracle" — marks the target state by flipping its phase
 * 3. Apply the "diffusion" operator — amplifies the marked state
 * 4. Repeat steps 2-3 approximately √N times
 * 5. Measure — the target state has high probability
 */

import { QuantumSystem, Complex } from '../core/quantum.js';

/**
 * Build an oracle that marks a specific target state.
 * The oracle flips the phase of the target state (|s⟩ → -|s⟩).
 *
 * @param {number} numQubits
 * @param {number} targetIndex - The basis state index to mark
 * @returns {Function} Oracle operator as a matrix
 */
function buildOracle(numQubits, targetIndex) {
  const dim = 1 << numQubits;
  const oracle = Array.from({ length: dim }, () =>
    Array.from({ length: dim }, () => new Complex(0, 0))
  );

  for (let i = 0; i < dim; i++) {
    if (i === targetIndex) {
      oracle[i][i] = new Complex(-1, 0); // Flip phase
    } else {
      oracle[i][i] = new Complex(1, 0);
    }
  }

  return (state) => {
    const newState = [];
    for (let i = 0; i < state.length; i++) {
      let sum = new Complex(0, 0);
      for (let j = 0; j < state.length; j++) {
        sum = sum.add(oracle[i][j].mul(state[j]));
      }
      newState.push(sum);
    }
    return newState;
  };
}

/**
 * Build the diffusion operator (Grover diffusion).
 * D = 2|s⟩⟨s| - I, where |s⟩ is the uniform superposition.
 *
 * @param {number} numQubits
 * @returns {Function} Diffusion operator
 */
function buildDiffusion(numQubits) {
  const dim = 1 << numQubits;

  // Uniform superposition state |s⟩
  const s = new Array(dim).fill(new Complex(1 / Math.sqrt(dim), 0));

  // D = 2|s⟩⟨s| - I
  return (state) => {
    // Compute ⟨s|ψ⟩
    let inner = new Complex(0, 0);
    for (let i = 0; i < dim; i++) {
      inner = inner.add(s[i].conj().mul(state[i]));
    }

    // |ψ'⟩ = 2⟨s|ψ⟩|s⟩ - |ψ⟩
    const newState = [];
    for (let i = 0; i < dim; i++) {
      const projection = s[i].scale(2).mul(inner);
      newState.push(projection.sub(state[i]));
    }
    return newState;
  };
}

/**
 * Run Grover's search algorithm.
 *
 * @param {number} numQubits - Number of qubits (N = 2^n items)
 * @param {number} targetIndex - The index we're searching for
 * @returns {{ result: number, probability: number, iterations: number }}
 */
function groverSearch(numQubits, targetIndex) {
  const dim = 1 << numQubits;
  const oracle = buildOracle(numQubits, targetIndex);
  const diffusion = buildDiffusion(numQubits);

  // Optimal number of iterations: floor(π/4 * √N)
  const optimalIterations = Math.floor(Math.PI / 4 * Math.sqrt(dim));
  const iterations = Math.max(1, optimalIterations);

  // Initialize in uniform superposition
  const q = new QuantumSystem(numQubits);
  for (let i = 0; i < numQubits; i++) {
    q.applyGate('H', i);
  }

  // Apply Grover iterations
  for (let iter = 0; iter < iterations; iter++) {
    // Oracle
    q.state = oracle(q.state);
    // Diffusion
    q.state = diffusion(q.state);
  }

  // Measure
  const bits = q.measure();
  const result = parseInt(bits.join(''), 2);

  // Compute probability of target
  const probs = q.getProbabilities();

  return {
    result,
    probability: probs[targetIndex],
    iterations,
    found: result === targetIndex
  };
}

/**
 * Search for a target in a larger space using Grover's algorithm.
 * Demonstrates the quadratic speedup.
 */
function runDemo() {
  console.log('═'.repeat(56));
  console.log('  🔍 Grover\'s Search Algorithm');
  console.log('═'.repeat(56));
  console.log();
  console.log('  Grover\'s algorithm searches an unsorted database of N items');
  console.log('  in O(√N) time — a quadratic speedup over classical O(N).');
  console.log();

  // Test with small systems (2-5 qubits)
  for (let numQubits = 2; numQubits <= 5; numQubits++) {
    const dim = 1 << numQubits;
    const target = Math.floor(Math.random() * dim);

    console.log(`  ── ${numQubits} qubit(s) (${dim} items) ──`);
    console.log(`  Searching for target: ${target} (|${target.toString(2).padStart(numQubits, '0')}⟩)`);

    const result = groverSearch(numQubits, target);

    console.log(`  Iterations: ${result.iterations} (optimal: π/4·√${dim} ≈ ${(Math.PI/4 * Math.sqrt(dim)).toFixed(1)})`);
    console.log(`  Found: ${result.result}  |  Match: ${result.found ? '✅ YES' : '❌ NO'}`);
    console.log(`  Target probability after measurement: ${(result.probability * 100).toFixed(1)}%`);
    console.log();
  }

  // Demonstrate scaling
  console.log('  ── Scaling comparison ──');
  console.log('  N (items)   Classical O(N)   Grover O(√N)   Speedup');
  console.log('  ─────────────────────────────────────────────────────');
  const sizes = [16, 64, 256, 1024, 4096];
  for (const n of sizes) {
    const classical = n;
    const grover = Math.floor(Math.PI / 4 * Math.sqrt(n));
    const speedup = (classical / grover).toFixed(1);
    console.log(`  ${String(n).padStart(6)}     ${String(classical).padStart(8)}       ${String(grover).padStart(8)}       ${speedup}x`);
  }
  console.log();
  console.log('  ✅ Grover\'s Search Demo Complete');
  console.log();
}

export { groverSearch, buildOracle, buildDiffusion };

// Run directly
if (process.argv[1]?.endsWith('grovers-search.js')) {
  runDemo();
}
