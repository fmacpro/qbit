/**
 * Practical Use Case 6: Quantum Teleportation
 *
 * Transfers an unknown quantum state from one location to another
 * using entanglement and classical communication. Does NOT transport
 * matter or information faster than light.
 *
 * How it works:
 * 1. Alice & Bob share an entangled Bell pair |Φ⁺⟩ = (|00⟩+|11⟩)/√2
 * 2. Alice performs a Bell-state measurement on her qubit + her half
 * 3. Alice sends 2 classical bits to Bob
 * 4. Bob applies corrective X gate based on those bits
 * 5. Bob's qubit now holds Alice's original quantum state
 *
 * Note: With the |Φ⁺⟩ Bell pair, only X correction is needed.
 * The Z correction is required when using |Φ⁻⟩ = (|00⟩-|11⟩)/√2.
 *
 * Practical applications:
 * - Quantum communication networks ("quantum internet")
 * - Quantum repeaters for long-distance communication
 * - Fault-tolerant quantum computing (gate teleportation)
 * - Distributed quantum computing between remote processors
 * - Secure state transfer in quantum networks
 *
 * Real-world context:
 * - First demonstrated in 1997 (Bouwmeester et al., Nature)
 * - Distance record: 1,400+ km satellite-to-ground (China, 2017)
 * - Core primitive in all quantum networking protocols
 */

import { QuantumSystem, Complex } from '../core/quantum.js';

/**
 * Perform quantum teleportation of an arbitrary single-qubit state.
 *
 * System layout: qubit 0 = state to teleport (Alice), qubit 1 = Alice's
 * half of Bell pair, qubit 2 = Bob's half of Bell pair.
 *
 * Uses |Φ⁺⟩ = (|00⟩+|11⟩)/√2 Bell pair.
 *
 * @param {number} alpha - Amplitude for |0⟩ of the state to teleport
 * @param {number} beta - Amplitude for |1⟩ of the state to teleport
 * @returns {{
 *   success: boolean,
 *   aliceMeasurement: number[],
 *   bobStateAmplitudes: number[],
 *   fidelity: number
 * }}
 */
function quantumTeleportation(alpha, beta) {
  // Normalize
  const norm = Math.sqrt(alpha * alpha + beta * beta);
  alpha /= norm;
  beta /= norm;

  // 3-qubit system: [state, aliceBell, bobBell]
  const q = new QuantumSystem(3);

  // Initialize qubit 0 with the unknown state: α|000⟩ + β|001⟩
  q.state[0] = new Complex(alpha, 0);
  q.state[1] = new Complex(beta, 0);

  // Create Bell pair |Φ⁺⟩ between qubit 1 (Alice) and qubit 2 (Bob)
  q.applyGate('H', 1);
  q.applyCNOT(1, 2);

  // Alice's Bell measurement on qubits 0 and 1
  q.applyCNOT(0, 1);
  q.applyGate('H', 0);

  // Alice measures her two qubits
  const m0 = q.measureQubit(0);
  const m1 = q.measureQubit(1);

  // Bob applies corrections based on Alice's classical bits.
  // With |Φ⁺⟩ Bell pair, the mapping is:
  //   (0,0) → I    (Bob already has correct state)
  //   (0,1) → X    (Bob has α|1⟩ + β|0⟩)
  //   (1,0) → I    (Bob already has correct state)
  //   (1,1) → X    (Bob has α|1⟩ + β|0⟩)
  // Only X correction is needed for |Φ⁺⟩.
  if (m1 === 1) q.applyGate('X', 2);

  // After correction, Bob's qubit (index 2) should hold the original state.
  // Extract Bob's qubit state by summing amplitudes where qubit 2 is 0 or 1.
  const bobAmps = [new Complex(0, 0), new Complex(0, 0)];
  for (let i = 0; i < q.state.length; i++) {
    const bobBit = (i >> (q.numQubits - 1 - 2)) & 1;
    bobAmps[bobBit] = bobAmps[bobBit].add(q.state[i]);
  }

  // Renormalize Bob's state
  const bobNorm = Math.sqrt(bobAmps[0].magnitude() ** 2 + bobAmps[1].magnitude() ** 2);
  if (bobNorm > 1e-10) {
    bobAmps[0] = bobAmps[0].scale(1 / bobNorm);
    bobAmps[1] = bobAmps[1].scale(1 / bobNorm);
  }

  // Fidelity = |⟨ψ_target|ψ_bob⟩|² = |α*conj(α_bob) + β*conj(β_bob)|²
  const overlap = new Complex(alpha, 0).mul(bobAmps[0].conj())
    .add(new Complex(beta, 0).mul(bobAmps[1].conj()));
  const fidelity = overlap.magnitude() ** 2;

  return {
    success: fidelity > 0.99,
    aliceMeasurement: [m0, m1],
    bobStateAmplitudes: bobAmps.map(c => `${c.real.toFixed(4)}${c.imag >= 0 ? '+' : ''}${c.imag.toFixed(4)}i`),
    fidelity
  };
}

/**
 * Run the quantum teleportation demo.
 */
function runDemo() {
  console.log('═'.repeat(56));
  console.log('  📡 Quantum Teleportation');
  console.log('═'.repeat(56));
  console.log();
  console.log('  Transfers an unknown quantum state using');
  console.log('  entanglement + classical communication.');
  console.log('  Does NOT violate relativity (no FTL).');
  console.log();

  // Test 1: Teleport |0⟩
  console.log('  ── Test 1: Teleport |0⟩ ──');
  const r1 = quantumTeleportation(1, 0);
  console.log(`  Alice measured: (${r1.aliceMeasurement})`);
  console.log(`  Bob: [${r1.bobStateAmplitudes}]`);
  console.log(`  Fidelity: ${(r1.fidelity * 100).toFixed(1)}%  ${r1.success ? '✅' : '❌'}`);
  console.log();

  // Test 2: Teleport |1⟩
  console.log('  ── Test 2: Teleport |1⟩ ──');
  const r2 = quantumTeleportation(0, 1);
  console.log(`  Alice measured: (${r2.aliceMeasurement})`);
  console.log(`  Bob: [${r2.bobStateAmplitudes}]`);
  console.log(`  Fidelity: ${(r2.fidelity * 100).toFixed(1)}%  ${r2.success ? '✅' : '❌'}`);
  console.log();

  // Test 3: Teleport |+⟩ = (|0⟩ + |1⟩)/√2
  console.log('  ── Test 3: Teleport |+⟩ = (|0⟩+|1⟩)/√2 ──');
  const s = 1 / Math.SQRT2;
  const r3 = quantumTeleportation(s, s);
  console.log(`  Alice measured: (${r3.aliceMeasurement})`);
  console.log(`  Bob: [${r3.bobStateAmplitudes}]`);
  console.log(`  Fidelity: ${(r3.fidelity * 100).toFixed(1)}%  ${r3.success ? '✅' : '❌'}`);
  console.log();

  // Test 4: Arbitrary state
  console.log('  ── Test 4: Teleport 0.6|0⟩ + 0.8|1⟩ ──');
  const r4 = quantumTeleportation(0.6, 0.8);
  console.log(`  Alice measured: (${r4.aliceMeasurement})`);
  console.log(`  Bob: [${r4.bobStateAmplitudes}]`);
  console.log(`  Fidelity: ${(r4.fidelity * 100).toFixed(1)}%  ${r4.success ? '✅' : '❌'}`);
  console.log();

  // Statistical test
  console.log('  ── Statistical test (50 random states) ──');
  let avgFidelity = 0;
  let successes = 0;
  for (let t = 0; t < 50; t++) {
    const a = Math.random();
    const b = Math.sqrt(1 - a * a);
    const r = quantumTeleportation(a, b);
    avgFidelity += r.fidelity;
    if (r.success) successes++;
  }
  console.log(`  Avg fidelity: ${((avgFidelity / 50) * 100).toFixed(1)}%`);
  console.log(`  Success rate: ${successes}/50`);
  console.log();

  // Explanation
  console.log('  ── How it works ──');
  console.log('  1. Alice & Bob share a Bell pair |Φ⁺⟩ = (|00⟩+|11⟩)/√2');
  console.log('  2. Alice does a Bell measurement on her qubit + her half');
  console.log('  3. Alice sends 2 classical bits to Bob');
  console.log('  4. Bob applies X gate if m₁=1 (no Z correction needed for |Φ⁺⟩)');
  console.log('  5. Bob\'s qubit now holds Alice\'s original state');
  console.log();
  console.log('  The original state is destroyed (no-cloning theorem).');
  console.log('  This is teleportation, not copying.');
  console.log();

  console.log('  ✅ Quantum Teleportation Demo Complete');
  console.log();
}

export { quantumTeleportation };

// Run directly
if (process.argv[1]?.endsWith('quantum-teleportation.js')) {
  runDemo();
}
