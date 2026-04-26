/**
 * Practical Use Case 9: Quantum Superdense Coding
 *
 * Superdense coding is a quantum communication protocol that allows
 * two parties to transmit 2 classical bits of information by sending
 * only 1 qubit — doubling the classical information capacity.
 *
 * How it works:
 * 1. Alice and Bob share an entangled Bell pair |Φ⁺⟩
 * 2. Alice encodes 2 classical bits by applying specific gates to HER half:
 *     - 00: I (identity) → |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
 *     - 01: X             → |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2
 *     - 10: Z             → |Φ⁻⟩ = (|00⟩ - |11⟩)/√2
 *     - 11: Z·X           → |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2
 * 3. Alice sends her qubit to Bob (1 qubit transmitted)
 * 4. Bob performs a Bell measurement (CNOT + H) on both qubits
 * 5. Bob measures both qubits, recovering the original 2 bits
 *
 * This demonstrates: entanglement + quantum gates + measurement
 *
 * Practical applications:
 * - Quantum communication networks (doubling bandwidth)
 * - Quantum data buses in quantum computers
 * - Quantum cryptography protocols
 * - Demonstrates the information-carrying capacity of entanglement
 *
 * Real-world context:
 * - Proposed by Bennett & Wiesner in 1992
 * - Experimentally demonstrated in 1996 (Mattle et al., PRL)
 * - Core primitive in quantum networking
 * - Shows entanglement as a resource for communication
 */

import { QuantumSystem, Complex } from '../core/quantum.js';

/**
 * The 4 Bell states:
 *   |Φ⁺⟩ = (|00⟩ + |11⟩)/√2  — encoded by I  (00)
 *   |Ψ⁺⟩ = (|01⟩ + |10⟩)/√2  — encoded by X  (01)
 *   |Φ⁻⟩ = (|00⟩ - |11⟩)/√2  — encoded by Z  (10)
 *   |Ψ⁻⟩ = (|01⟩ - |10⟩)/√2  — encoded by ZX (11)
 */

/**
 * Encode 2 classical bits into a shared Bell pair by manipulating
 * Alice's half (qubit 0). Bob's half (qubit 1) is untouched.
 *
 * @param {number} bit1 - First classical bit (0 or 1)
 * @param {number} bit2 - Second classical bit (0 or 1)
 * @returns {{ aliceQubit: QuantumSystem, bobQubit: QuantumSystem, encoding: string }}
 */
function superdenseEncode(bit1, bit2) {
  // Create a shared Bell pair |Φ⁺⟩ = (|00⟩ + |11⟩)/√2
  const bell = new QuantumSystem(2);
  bell.applyGate('H', 0);
  bell.applyCNOT(0, 1);

  // Alice encodes her 2 bits by applying gates to her qubit (qubit 0)
  if (bit1 === 0 && bit2 === 0) {
    // 00: I — do nothing, stays |Φ⁺⟩
  } else if (bit1 === 0 && bit2 === 1) {
    // 01: X — flip her qubit
    bell.applyGate('X', 0);
  } else if (bit1 === 1 && bit2 === 0) {
    // 10: Z — phase flip her qubit
    bell.applyGate('Z', 0);
  } else {
    // 11: Z then X
    bell.applyGate('X', 0);
    bell.applyGate('Z', 0);
  }

  return {
    aliceQubit: bell, // Full 2-qubit system (Alice will send her half)
    bobQubit: bell,   // Same system — Bob has the other half
    encoding: `${bit1}${bit2}`
  };
}

/**
 * Decode the 2 classical bits by performing a Bell measurement.
 * Bob has both qubits now (Alice sent hers).
 *
 * @param {QuantumSystem} q - 2-qubit system containing both qubits
 * @returns {{ bit1: number, bit2: number, measurements: number[] }}
 */
function superdenseDecode(q) {
  // Bell measurement: CNOT(0,1) then H(0)
  q.applyCNOT(0, 1);
  q.applyGate('H', 0);

  // Measure both qubits
  const m0 = q.measureQubit(0);
  const m1 = q.measureQubit(1);

  // The measurement results directly give the original 2 bits
  // But the mapping depends on the Bell state convention.
  // For our encoding:
  //   |Φ⁺⟩ (00) → measures (0,0)
  //   |Ψ⁺⟩ (01) → measures (0,1)
  //   |Φ⁻⟩ (10) → measures (1,0)
  //   |Ψ⁻⟩ (11) → measures (1,1)
  return {
    bit1: m0,
    bit2: m1,
    measurements: [m0, m1]
  };
}

/**
 * Run the full superdense coding protocol for a given 2-bit message.
 *
 * @param {number} bit1 - First bit
 * @param {number} bit2 - Second bit
 * @returns {{ sent: string, received: string, success: boolean, bellStateBefore: string, bellStateAfter: string }}
 */
function superdenseCoding(bit1, bit2) {
  // Step 1: Create shared Bell pair and encode
  const { encoding } = superdenseEncode(bit1, bit2);

  // Step 2: Alice sends her qubit to Bob (simulated — same object)
  // Step 3: Bob decodes
  const q = new QuantumSystem(2);
  // Recreate the encoded state for decoding
  // (In a real protocol, Alice would physically send her qubit)
  const encoded = superdenseEncode(bit1, bit2);
  const result = superdenseDecode(encoded.aliceQubit);

  return {
    sent: encoding,
    received: `${result.bit1}${result.bit2}`,
    success: encoding === `${result.bit1}${result.bit2}`,
    measurements: result.measurements
  };
}

/**
 * Run the superdense coding demo.
 */
function runDemo() {
  console.log('═'.repeat(56));
  console.log('  📻 Quantum Superdense Coding');
  console.log('═'.repeat(56));
  console.log();
  console.log('  Transmit 2 classical bits by sending only 1 qubit.');
  console.log('  Doubles classical communication bandwidth using');
  console.log('  entanglement as a resource.');
  console.log();

  // Test all 4 possible 2-bit messages
  const messages = [
    [0, 0], [0, 1], [1, 0], [1, 1]
  ];

  console.log('  ── All 4 possible 2-bit messages ──');
  console.log();
  console.log('  Sent → Received  |  Bell state  |  Result');
  console.log('  ' + '─'.repeat(40));

  for (const [b1, b2] of messages) {
    const result = superdenseCoding(b1, b2);

    // Determine the Bell state
    let bellState;
    if (b1 === 0 && b2 === 0) bellState = '|Φ⁺⟩';
    else if (b1 === 0 && b2 === 1) bellState = '|Ψ⁺⟩';
    else if (b1 === 1 && b2 === 0) bellState = '|Φ⁻⟩';
    else bellState = '|Ψ⁻⟩';

    const icon = result.success ? '✅' : '❌';
    console.log(`  ${result.sent}     →    ${result.received}     ${bellState.padEnd(10)} ${icon}`);
  }
  console.log();

  // Statistical test
  console.log('  ── Statistical test (100 random messages) ──');
  let correct = 0;
  for (let t = 0; t < 100; t++) {
    const b1 = Math.random() < 0.5 ? 0 : 1;
    const b2 = Math.random() < 0.5 ? 0 : 1;
    const result = superdenseCoding(b1, b2);
    if (result.success) correct++;
  }
  console.log(`  Correct: ${correct}/100 (${((correct / 100) * 100).toFixed(0)}%)`);
  console.log();

  // Explanation
  console.log('  ── How it works ──');
  console.log('  1. Alice & Bob share a Bell pair |Φ⁺⟩');
  console.log('  2. Alice encodes 2 bits on HER qubit:');
  console.log('       00: I  (do nothing)  → |Φ⁺⟩');
  console.log('       01: X  (bit flip)    → |Ψ⁺⟩');
  console.log('       10: Z  (phase flip)  → |Φ⁻⟩');
  console.log('       11: ZX (both)        → |Ψ⁻⟩');
  console.log('  3. Alice sends her 1 qubit to Bob');
  console.log('  4. Bob does Bell measurement (CNOT + H)');
  console.log('  5. Bob measures 2 bits — recovers the message!');
  console.log();
  console.log('  ⚡ 2 bits received, only 1 qubit sent!');
  console.log('  This is possible because of prior shared entanglement.');
  console.log();

  console.log('  ✅ Superdense Coding Demo Complete');
  console.log();
}

export { superdenseCoding, superdenseEncode, superdenseDecode };

// Run directly
if (process.argv[1]?.endsWith('superdense-coding.js')) {
  runDemo();
}
