/**
 * Practical Use Case 3: BB84 Quantum Key Distribution
 *
 * BB84 is a quantum cryptography protocol that allows two parties
 * (Alice and Bob) to generate a shared secret key with security
 * guaranteed by the laws of quantum mechanics.
 *
 * Security guarantee: If an eavesdropper (Eve) intercepts the
 * quantum states, she inevitably introduces disturbances that
 * Alice and Bob can detect.
 *
 * Practical applications:
 * - Secure communication channels
 * - Quantum-secured VPNs
 * - Banking and financial transactions
 * - Government/military communications
 * - Securing critical infrastructure
 *
 * How it works:
 * 1. Alice sends qubits encoded in random bases (+ or ×)
 * 2. Bob measures in random bases
 * 3. They compare bases publicly (not the values)
 * 4. They keep only bits where bases matched
 * 5. They sacrifice some bits to check for eavesdropping
 */

import { QuantumSystem } from '../core/quantum.js';

/**
 * Encode a classical bit into a qubit using a specific basis.
 *
 * Basis '+' (rectilinear): |0⟩ = 0, |1⟩ = 1
 * Basis '×' (diagonal):    |0⟩ = |+⟩, |1⟩ = |-⟩
 *
 * @param {number} bit - 0 or 1
 * @param {string} basis - '+' or '×'
 * @returns {QuantumSystem}
 */
function encodeBit(bit, basis) {
  const q = new QuantumSystem(1);

  if (basis === '+') {
    // |0⟩ or |1⟩
    if (bit === 1) {
      q.applyGate('X', 0); // Flip to |1⟩
    }
  } else if (basis === '×') {
    // |+⟩ = H|0⟩, |-⟩ = H|1⟩
    if (bit === 1) {
      q.applyGate('X', 0); // First flip to |1⟩
    }
    q.applyGate('H', 0);   // Then H|0⟩ = |+⟩, H|1⟩ = |-⟩
  }

  return q;
}

/**
 * Measure a qubit in a given basis.
 *
 * @param {QuantumSystem} q
 * @param {string} basis - '+' or '×'
 * @returns {number} 0 or 1
 */
function measureInBasis(q, basis) {
  if (basis === '×') {
    q.applyGate('H', 0); // Rotate back from diagonal to computational basis
  }
  return q.measureQubit(0);
}

/**
 * Simulate the BB84 protocol between Alice and Bob.
 *
 * @param {number} numBits - Number of raw bits to exchange
 * @param {boolean} eavesdrop - Whether Eve is eavesdropping
 * @returns {{ key: string, errorRate: number, detected: boolean }}
 */
function bb84Protocol(numBits, eavesdrop = false) {
  // Step 1: Alice generates random bits and random bases
  const aliceBits = [];
  const aliceBases = [];
  for (let i = 0; i < numBits; i++) {
    aliceBits.push(Math.random() < 0.5 ? 0 : 1);
    aliceBases.push(Math.random() < 0.5 ? '+' : '×');
  }

  // Step 2: Alice encodes and sends qubits
  const qubits = aliceBits.map((bit, i) => encodeBit(bit, aliceBases[i]));

  // ── Eve intercepts (if eavesdropping) ──
  if (eavesdrop) {
    for (let i = 0; i < qubits.length; i++) {
      // Eve measures in a random basis
      const eveBasis = Math.random() < 0.5 ? '+' : '×';
      measureInBasis(qubits[i], eveBasis);
      // Eve resends the measured state (already collapsed)
    }
  }

  // Step 3: Bob measures in random bases
  const bobBases = [];
  const bobBits = [];
  for (let i = 0; i < numBits; i++) {
    bobBases.push(Math.random() < 0.5 ? '+' : '×');
    const q = qubits[i].clone();
    bobBits.push(measureInBasis(q, bobBases[i]));
  }

  // Step 4: Alice and Bob compare bases publicly
  const matchingIndices = [];
  for (let i = 0; i < numBits; i++) {
    if (aliceBases[i] === bobBases[i]) {
      matchingIndices.push(i);
    }
  }

  // Step 5: Extract the sifted key (bits where bases matched)
  const siftedKey = matchingIndices.map(i => aliceBits[i]);
  const bobSifted = matchingIndices.map(i => bobBits[i]);

  // Step 6: Sacrifice some bits to check error rate
  const checkBits = Math.min(Math.floor(siftedKey.length * 0.5), 20);
  let errors = 0;
  for (let i = 0; i < checkBits && i < siftedKey.length; i++) {
    if (siftedKey[i] !== bobSifted[i]) {
      errors++;
    }
  }

  const errorRate = checkBits > 0 ? errors / checkBits : 0;

  // The remaining bits form the shared key
  const finalKey = siftedKey.slice(checkBits);
  const detected = errorRate > 0.15; // Threshold for eavesdropping detection

  return {
    key: finalKey.join(''),
    keyLength: finalKey.length,
    errorRate,
    detected,
    totalExchanged: numBits,
    siftedLength: siftedKey.length
  };
}

/**
 * Run the BB84 demo.
 */
function runDemo() {
  console.log('═'.repeat(56));
  console.log('  🔑 BB84 Quantum Key Distribution');
  console.log('═'.repeat(56));
  console.log();
  console.log('  BB84 allows Alice & Bob to share a secret key with');
  console.log('  security guaranteed by quantum mechanics.');
  console.log();

  // Scenario 1: No eavesdropping
  console.log('  ── Scenario 1: No eavesdropper ──');
  const result1 = bb84Protocol(100, false);
  console.log(`  Raw bits exchanged: ${result1.totalExchanged}`);
  console.log(`  Sifted key length:  ${result1.siftedLength} (matching bases)`);
  console.log(`  Final key (${result1.keyLength} bits): ${result1.key.slice(0, 40)}${result1.key.length > 40 ? '...' : ''}`);
  console.log(`  Error rate:         ${(result1.errorRate * 100).toFixed(1)}%`);
  console.log(`  Eavesdropper:       ${result1.detected ? '🚨 DETECTED' : '✅ None detected'}`);
  console.log();

  // Scenario 2: With eavesdropping
  console.log('  ── Scenario 2: Eve is eavesdropping! ──');
  const result2 = bb84Protocol(100, true);
  console.log(`  Raw bits exchanged: ${result2.totalExchanged}`);
  console.log(`  Sifted key length:  ${result2.siftedLength}`);
  console.log(`  Final key (${result2.keyLength} bits): ${result2.key.slice(0, 40)}${result2.key.length > 40 ? '...' : ''}`);
  console.log(`  Error rate:         ${(result2.errorRate * 100).toFixed(1)}%`);
  console.log(`  Eavesdropper:       ${result2.detected ? '🚨 DETECTED' : '❌ Not detected'}`);
  console.log();

  // Explanation
  console.log('  ── Why this works ──');
  console.log('  If Eve measures a qubit, she collapses its quantum state.');
  console.log('  When Bob measures in the same basis as Alice, he may now');
  console.log('  get a different result — introducing errors that reveal Eve.');
  console.log();
  console.log('  The no-cloning theorem prevents Eve from copying the qubits.');
  console.log('  She cannot measure without disturbing the system.');
  console.log();

  console.log('  ✅ BB84 Demo Complete');
  console.log();
}

export { bb84Protocol, encodeBit, measureInBasis };

// Run directly
if (process.argv[1]?.endsWith('quantum-key-distribution.js')) {
  runDemo();
}
