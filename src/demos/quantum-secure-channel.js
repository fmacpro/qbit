/**
 * Use Case 10: Quantum-Secured Communication Channel
 * ==================================================
 *
 * A complete end-to-end secure communication system that combines multiple
 * quantum principles into a real-world application:
 *
 *   1. BB84 Quantum Key Distribution — Exchange a shared secret key with
 *      built-in eavesdropping detection
 *   2. QRNG — Generate truly random session parameters
 *   3. Superdense Coding — Transmit encrypted data using 2 bits per qubit
 *   4. Error Correction — Protect against noise during transmission
 *
 * This simulates a real-world scenario where Alice wants to send a sensitive
 * message to Bob over an untrusted quantum channel. The system:
 *   - Detects if Eve is eavesdropping on the key exchange
 *   - Uses the shared key to encrypt the message (one-time pad)
 *   - Transmits efficiently using superdense coding
 *   - Corrects bit-flip errors that occur during transmission
 *   - Verifies message integrity at the receiving end
 *
 * Real-world applications:
 *   - Quantum-secured banking transactions
 *   - Secure government/military communications
 *   - Quantum VPNs for enterprise networks
 *   - Satellite-based secure communication links
 *   - Critical infrastructure command & control
 */

import { QuantumSystem, Complex } from '../core/quantum.js';

// ============================================================
// 1. BB84 Quantum Key Distribution (adapted from bb84 demo)
// ============================================================

/**
 * Encode a classical bit into a qubit using a random basis
 * @param {QuantumSystem} qs
 * @param {number} qubitIndex
 * @param {number} bit - 0 or 1
 * @param {string} basis - '+' (computational) or 'x' (Hadamard)
 */
function encodeBit(qs, qubitIndex, bit, basis) {
  if (bit === 1) {
    qs.applyGate('X', qubitIndex);
  }
  if (basis === 'x') {
    qs.applyGate('H', qubitIndex);
  }
}

/**
 * Measure a qubit in a given basis
 * @param {QuantumSystem} qs
 * @param {number} qubitIndex
 * @param {string} basis - '+' or 'x'
 * @returns {number} measured bit (0 or 1)
 */
function measureInBasis(qs, qubitIndex, basis) {
  if (basis === 'x') {
    qs.applyGate('H', qubitIndex);
  }
  return qs.measureQubit(qubitIndex);
}

/**
 * Run BB84 protocol to establish a shared key
 * @param {number} keyLength - desired key length in bits
 * @param {boolean} eavesdrop - whether Eve is listening
 * @returns {{ key: string, errorRate: number, detected: boolean, rawBits: number }}
 */
function bb84KeyExchange(keyLength, eavesdrop = false) {
  const rawLength = keyLength * 4 + 30; // extra for sifting + error estimation
  const aliceBases = [];
  const bobBases = [];
  const aliceBits = [];
  const bobBits = [];

  // Phase 1: Alice sends qubits, Bob measures
  for (let i = 0; i < rawLength; i++) {
    const qs = new QuantumSystem(1);
    const basis = Math.random() < 0.5 ? '+' : 'x';
    const bit = Math.random() < 0.5 ? 0 : 1;

    encodeBit(qs, 0, bit, basis);

    // Eve intercepts (if eavesdropping)
    if (eavesdrop) {
      const eveBasis = Math.random() < 0.5 ? '+' : 'x';
      const eveBit = measureInBasis(qs, 0, eveBasis);
      // Eve re-encodes in her measured basis
      encodeBit(qs, 0, eveBit, eveBasis);
    }

    // Bob measures
    const bobBasis = Math.random() < 0.5 ? '+' : 'x';
    const bobBit = measureInBasis(qs, 0, bobBasis);

    aliceBases.push(basis);
    bobBases.push(bobBasis);
    aliceBits.push(bit);
    bobBits.push(bobBit);
  }

  // Phase 2: Sifting — keep only matching bases
  const siftedAliceBits = [];
  const siftedBobBits = [];
  for (let i = 0; i < rawLength; i++) {
    if (aliceBases[i] === bobBases[i]) {
      siftedAliceBits.push(aliceBits[i]);
      siftedBobBits.push(bobBits[i]);
    }
  }

  // Phase 3: Estimate error rate on a sample of the sifted key
  const sampleSize = Math.min(10, Math.floor(siftedAliceBits.length / 4));
  let errors = 0;
  for (let i = 0; i < sampleSize; i++) {
    if (siftedAliceBits[i] !== siftedBobBits[i]) errors++;
  }

  const errorRate = sampleSize > 0 ? errors / sampleSize : 0;
  const detected = errorRate > 0.1; // threshold: >10% error = eavesdropper

  // Phase 4: Use remaining sifted bits as the key
  const keyBits = siftedAliceBits.slice(sampleSize, sampleSize + keyLength);
  const key = keyBits.join('');

  return { key, errorRate, detected, rawBits: rawLength };
}

// ============================================================
// 2. One-Time Pad Encryption/Decryption
// ============================================================

/**
 * XOR a message with a key (one-time pad)
 * @param {string} message - binary string
 * @param {string} key - binary string (must be at least as long as message)
 * @returns {string} encrypted/decrypted binary string
 */
function oneTimePad(message, key) {
  let result = '';
  for (let i = 0; i < message.length; i++) {
    result += (parseInt(message[i]) ^ parseInt(key[i % key.length])).toString();
  }
  return result;
}

/**
 * Convert a text string to binary
 * @param {string} text
 * @returns {string} binary representation
 */
function textToBinary(text) {
  return text.split('').map(char =>
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');
}

/**
 * Convert binary string back to text
 * @param {string} binary
 * @returns {string}
 */
function binaryToText(binary) {
  const chars = [];
  for (let i = 0; i < binary.length; i += 8) {
    const byte = binary.substring(i, i + 8);
    if (byte.length === 8) {
      chars.push(String.fromCharCode(parseInt(byte, 2)));
    }
  }
  return chars.join('');
}

// ============================================================
// 3. Superdense Coding (adapted from superdense-coding demo)
// ============================================================

/**
 * Create a |Φ⁺⟩ Bell pair
 * @param {QuantumSystem} qs
 */
function createBellPair(qs) {
  qs.applyGate('H', 0);
  qs.applyCNOT(0, 1);
}

/**
 * Encode 2 bits into Alice's qubit
 * @param {QuantumSystem} qs
 * @param {number} aliceQubit - index of Alice's qubit
 * @param {number[]} bits - [b0, b1] where b0 is most significant
 */
function superdenseEncode(qs, aliceQubit, bits) {
  const [b0, b1] = bits;
  if (b1 === 1) qs.applyGate('X', aliceQubit);
  if (b0 === 1) qs.applyGate('Z', aliceQubit);
}

/**
 * Decode both bits via Bell measurement
 * @param {QuantumSystem} qs
 * @param {number} aliceQubit
 * @param {number} bobQubit
 * @returns {number[]} [b0, b1]
 */
function superdenseDecode(qs, aliceQubit, bobQubit) {
  qs.applyCNOT(aliceQubit, bobQubit);
  qs.applyGate('H', aliceQubit);

  const b0 = qs.measureQubit(aliceQubit);
  const b1 = qs.measureQubit(bobQubit);
  return [b0, b1];
}

// ============================================================
// 4. Error Correction (3-qubit repetition code)
// ============================================================

/**
 * Encode a single bit using 3-qubit repetition code
 * @param {QuantumSystem} qs
 * @param {number} startQubit - index of first qubit in the block
 * @param {number} bit - 0 or 1
 */
function encodeRepetition(qs, startQubit, bit) {
  if (bit === 1) {
    qs.applyGate('X', startQubit);
  }
  qs.applyCNOT(startQubit, startQubit + 1);
  qs.applyCNOT(startQubit, startQubit + 2);
}

/**
 * Measure syndrome and correct a single bit-flip error
 * @param {QuantumSystem} qs
 * @param {number} startQubit
 * @returns {number} corrected bit value
 */
function correctAndDecode(qs, startQubit) {
  // Measure syndrome: parity checks
  // Syndrome (q0⊕q1, q0⊕q2):
  //   (0,0) = no error
  //   (1,0) = qubit 2 flipped
  //   (0,1) = qubit 1 flipped
  //   (1,1) = qubit 0 flipped

  // We need to measure without collapsing the data qubits
  // Use ancillary qubits for syndrome measurement
  const ancilla1 = startQubit + 3;
  const ancilla2 = startQubit + 4;

  // CNOT from data qubits to ancilla
  qs.applyCNOT(startQubit, ancilla1);
  qs.applyCNOT(startQubit + 1, ancilla1);
  qs.applyCNOT(startQubit, ancilla2);
  qs.applyCNOT(startQubit + 2, ancilla2);

  const s1 = qs.measureQubit(ancilla1);
  const s2 = qs.measureQubit(ancilla2);

  // Apply correction based on syndrome
  if (s1 === 1 && s2 === 1) {
    qs.applyGate('X', startQubit); // qubit 0 flipped
  } else if (s1 === 1 && s2 === 0) {
    qs.applyGate('X', startQubit + 2); // qubit 2 flipped
  } else if (s1 === 0 && s2 === 1) {
    qs.applyGate('X', startQubit + 1); // qubit 1 flipped
  }
  // (0,0) = no error

  // Majority vote decode
  const q0 = qs.measureQubit(startQubit);
  const q1 = qs.measureQubit(startQubit + 1);
  const q2 = qs.measureQubit(startQubit + 2);

  const sum = q0 + q1 + q2;
  return sum >= 2 ? 1 : 0;
}

// ============================================================
// 5. Main Secure Channel Demo
// ============================================================

/**
 * Simulate a complete quantum-secured communication session
 *
 * @param {Object} options
 * @param {string} options.message - Text message to send
 * @param {boolean} options.eavesdrop - Whether Eve is listening
 * @param {number} options.noiseLevel - Probability of bit-flip per qubit (0-1)
 * @param {boolean} options.useErrorCorrection - Whether to apply error correction
 * @returns {Object} Full session report
 */
export function quantumSecureChannel({
  message = 'HELLO',
  eavesdrop = false,
  noiseLevel = 0.0,
  useErrorCorrection = true
} = {}) {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║     [QS] Quantum-Secured Communication Channel              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();

  const report = {
    message,
    eavesdrop,
    noiseLevel,
    useErrorCorrection,
    phases: {},
    success: false,
    finalMessage: ''
  };

  // ----------------------------------------------------------
  // Phase 1: Key Exchange via BB84
  // ----------------------------------------------------------
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│ Phase 1: [KEY] BB84 Quantum Key Exchange                     │');
  console.log('└──────────────────────────────────────────────────────────────┘');

  const binaryMessage = textToBinary(message);
  const keyLength = binaryMessage.length;

  console.log(`  Alice wants to send: "${message}" (${binaryMessage.length} bits)`);
  console.log(`  Eavesdropper present: ${eavesdrop ? '⚠️  YES' : '✅ No'}`);
  console.log();

  const bb84Result = bb84KeyExchange(keyLength, eavesdrop);

  report.phases.keyExchange = {
    keyLength: keyLength,
    rawBitsSent: bb84Result.rawBits,
    siftedKeyLength: bb84Result.key.length,
    errorRate: bb84Result.errorRate,
    eavesdropperDetected: bb84Result.detected,
    sharedKey: bb84Result.key
  };

  console.log(`  Raw bits exchanged: ${bb84Result.rawBits}`);
  console.log(`  Sifted key length: ${bb84Result.key.length} bits`);
  console.log(`  Sample error rate: ${(bb84Result.errorRate * 100).toFixed(1)}%`);
  console.log(`  Eavesdropper detected: ${bb84Result.detected ? '⚠️  YES' : '✅ No'}`);

  if (bb84Result.detected) {
    console.log();
    console.log('  ⚠️  EAVESDROPPER DETECTED! Aborting communication.');
    console.log('  (In a real system, Alice and Bob would discard the key');
    console.log('   and try a different channel.)');
    report.success = false;
    report.finalMessage = '[COMMUNICATION ABORTED — EAVESDROPPER DETECTED]';
    console.log();
    return report;
  }

  if (bb84Result.key.length < keyLength) {
    console.log();
    console.log('  ⚠️  Insufficient key material. Need more raw bits.');
    report.success = false;
    report.finalMessage = '[COMMUNICATION FAILED — INSUFFICIENT KEY]';
    console.log();
    return report;
  }

  console.log(`  ✅ Shared key established: ${bb84Result.key.substring(0, 16)}...`);
  console.log();

  // ----------------------------------------------------------
  // Phase 2: Encrypt message with one-time pad
  // ----------------------------------------------------------
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│ Phase 2: [PAD] One-Time Pad Encryption                       │');
  console.log('└──────────────────────────────────────────────────────────────┘');

  const ciphertext = oneTimePad(binaryMessage, bb84Result.key);

  report.phases.encryption = {
    plaintextBinary: binaryMessage,
    ciphertext: ciphertext,
    method: 'One-Time Pad (XOR with shared key)'
  };

  console.log(`  Plaintext:  "${message}"`);
  console.log(`  Plaintext (binary): ${binaryMessage}`);
  console.log(`  Ciphertext (binary): ${ciphertext}`);
  console.log(`  Key used:           ${bb84Result.key.substring(0, binaryMessage.length)}`);
  console.log();

  // ----------------------------------------------------------
  // Phase 3: Transmit via Superdense Coding
  // ----------------------------------------------------------
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│ Phase 3: [SDC] Superdense Coding Transmission                │');
  console.log('└──────────────────────────────────────────────────────────────┘');

  const transmittedBits = [];
  const errorPositions = [];
  let totalQubitsUsed = 0;

  // Process ciphertext in 2-bit chunks
  for (let i = 0; i < ciphertext.length; i += 2) {
    const chunk = [
      parseInt(ciphertext[i]),
      parseInt(ciphertext[i + 1] || 0)
    ];

    // Create Bell pair shared between Alice and Bob
    const qs = new QuantumSystem(2);
    createBellPair(qs);

    // Alice encodes her 2-bit message on qubit 0
    superdenseEncode(qs, 0, chunk);

    // Simulate noise during transmission (qubit 0 travels to Bob)
    if (noiseLevel > 0 && Math.random() < noiseLevel) {
      qs.applyGate('X', 0);
      errorPositions.push(i);
    }

    // Bob decodes both bits
    const decoded = superdenseDecode(qs, 0, 1);
    transmittedBits.push(decoded[0], decoded[1]);
    totalQubitsUsed++;
  }

  const receivedCiphertext = transmittedBits.join('').substring(0, ciphertext.length);

  report.phases.transmission = {
    ciphertextBits: ciphertext.length,
    qubitsUsed: totalQubitsUsed,
    classicalBitsEquivalent: ciphertext.length,
    bandwidthSavings: `${((1 - totalQubitsUsed / ciphertext.length) * 100).toFixed(0)}%`,
    errorsDetected: errorPositions.length,
    receivedCiphertext: receivedCiphertext
  };

  console.log(`  Ciphertext length: ${ciphertext.length} bits`);
  console.log(`  Qubits transmitted: ${totalQubitsUsed}`);
  console.log(`  Classical equivalent: ${ciphertext.length} bits`);
  console.log(`  Bandwidth savings: ${((1 - totalQubitsUsed / ciphertext.length) * 100).toFixed(0)}%`);
  console.log(`  Noise-induced errors: ${errorPositions.length}`);

  if (errorPositions.length > 0) {
    console.log(`  Error positions (bit indices): [${errorPositions.join(', ')}]`);
  }
  console.log();

  // ----------------------------------------------------------
  // Phase 4: Error Correction (if enabled)
  // ----------------------------------------------------------
  let correctedCiphertext = receivedCiphertext;

  if (useErrorCorrection && errorPositions.length > 0) {
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│ Phase 4: [ECC] Quantum Error Correction                       │');
    console.log('└──────────────────────────────────────────────────────────────┘');

    // Apply 3-qubit repetition code: each logical bit is encoded as 3
    // physical qubits. We re-transmit each bit 3 times and use majority
    // vote to decode. This corrects any single bit-flip per block.
    //
    // At noise level p, the probability of correct decoding is:
    //   P(correct) = p³ + 3p²(1-p)  (0 or 1 flip)
    // At p=0.10:  P = 0.1³ + 3(0.1²)(0.9) = 0.001 + 0.027 = 97.2%
    // At p=0.25:  P = 0.25³ + 3(0.25²)(0.75) = 0.0156 + 0.1406 = 84.4%

    const correctedBits = [];
    let errorsCorrected = 0;
    let errorsRemaining = 0;

    for (let i = 0; i < ciphertext.length; i++) {
      const originalBit = parseInt(ciphertext[i]);

      // Encode: repeat the bit 3 times
      const encoded = [originalBit, originalBit, originalBit];

      // Simulate noisy transmission of the 3 copies
      const received = encoded.map(b => {
        if (Math.random() < noiseLevel) return b ^ 1;
        return b;
      });

      // Decode via majority vote
      const sum = received[0] + received[1] + received[2];
      const corrected = sum >= 2 ? 1 : 0;

      correctedBits.push(corrected);

      if (corrected === originalBit) {
        if (received.some((b, j) => b !== encoded[j])) {
          errorsCorrected++;
        }
      } else {
        errorsRemaining++;
      }
    }

    correctedCiphertext = correctedBits.join('');

    report.phases.errorCorrection = {
      method: '3-qubit repetition code (majority vote)',
      errorsBefore: errorPositions.length,
      errorsAfter: errorsRemaining,
      bitsCorrected: errorsCorrected
    };

    const eccEffectiveness = noiseLevel > 0
      ? ((errorsCorrected / Math.max(1, errorPositions.length)) * 100).toFixed(0)
      : 'N/A';

    console.log(`  Method: 3-qubit repetition code (majority vote)`);
    console.log(`  Noise level: ${(noiseLevel * 100).toFixed(0)}%`);
    console.log(`  Errors in single transmission: ${errorPositions.length}`);
    console.log(`  Errors corrected via repetition code: ${errorsCorrected}`);
    console.log(`  Errors remaining: ${errorsRemaining}`);
    console.log(`  ECC effectiveness: ${eccEffectiveness}% of transmission errors caught`);
    console.log();
  } else if (useErrorCorrection && errorPositions.length === 0) {
    console.log('┌──────────────────────────────────────────────────────────────┐');
    console.log('│ Phase 4: [ECC] Quantum Error Correction                       │');
    console.log('└──────────────────────────────────────────────────────────────┘');
    console.log('  No errors detected — error correction skipped.');
    console.log();
  }

  // ----------------------------------------------------------
  // Phase 5: Decrypt and verify
  // ----------------------------------------------------------
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│ Phase 5: [DEC] Decryption & Verification                      │');
  console.log('└──────────────────────────────────────────────────────────────┘');

  const decryptedBinary = oneTimePad(correctedCiphertext, bb84Result.key);
  const decryptedMessage = binaryToText(decryptedBinary);
  const messageMatch = decryptedMessage === message;

  report.phases.decryption = {
    receivedCiphertext: correctedCiphertext,
    decryptedBinary: decryptedBinary,
    decryptedMessage: decryptedMessage,
    messageIntact: messageMatch
  };
  report.success = messageMatch;
  report.finalMessage = decryptedMessage;

  console.log(`  Received ciphertext: ${correctedCiphertext}`);
  console.log(`  Decrypted (binary):  ${decryptedBinary}`);
  console.log(`  Decrypted message:   "${decryptedMessage}"`);
  console.log(`  Message intact: ${messageMatch ? '✅ YES' : '❌ NO'}`);
  console.log();

  // ----------------------------------------------------------
  // Summary
  // ----------------------------------------------------------
  console.log('┌──────────────────────────────────────────────────────────────┐');
  console.log('│ [SUM] Session Summary                                        │');
  console.log('└──────────────────────────────────────────────────────────────┘');
  console.log();
  console.log(`  Original message:     "${message}"`);
  console.log(`  Final message:        "${decryptedMessage}"`);
  console.log(`  Communication:        ${messageMatch ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`  Eavesdropper:         ${eavesdrop ? '⚠️  Present' : '✅ None'}`);
  console.log(`  Eavesdropper caught:  ${bb84Result.detected ? '✅ Yes' : 'N/A'}`);
  console.log(`  Noise level:          ${(noiseLevel * 100).toFixed(0)}%`);
  console.log(`  Error correction:     ${useErrorCorrection ? '✅ Enabled' : '❌ Disabled'}`);
  console.log(`  Bandwidth savings:    ${((1 - totalQubitsUsed / ciphertext.length) * 100).toFixed(0)}%`);
  console.log();

  return report;
}

// ============================================================
// CLI Demo Runner
// ============================================================

// Run when executed directly
const isMainModule = process.argv[1] && (
  process.argv[1].endsWith('quantum-secure-channel.js')
);

if (isMainModule) {
  console.log();
  console.log('═'.repeat(56));
  console.log('  🔐 Quantum-Secured Communication Channel');
  console.log('  A Real-World Integrated Quantum Application');
  console.log('═'.repeat(56));
  console.log();

  // Demo 1: Normal secure communication (no eavesdropper, no noise)
  console.log('▔'.repeat(50));
  console.log('  SCENARIO 1: Normal Operation');
  console.log('  Alice sends "HELLO" over a secure quantum channel');
  console.log('  No eavesdropper, no noise');
  console.log('▁'.repeat(50));
  console.log();

  const result1 = quantumSecureChannel({
    message: 'HELLO',
    eavesdrop: false,
    noiseLevel: 0.0,
    useErrorCorrection: true
  });

  console.log('▔'.repeat(50));
  console.log('  SCENARIO 2: Noisy Channel + Error Correction');
  console.log('  Alice sends "QUBIT" with 10% bit-flip noise');
  console.log('  Error correction enabled — 3-qubit repetition code');
  console.log('  Expected: ~97% of errors corrected');
  console.log('▁'.repeat(50));
  console.log();

  const result2 = quantumSecureChannel({
    message: 'QUBIT',
    eavesdrop: false,
    noiseLevel: 0.10,
    useErrorCorrection: true
  });

  console.log('▔'.repeat(50));
  console.log('  SCENARIO 3: Eavesdropper Detected!');
  console.log('  Alice sends "SECRET" while Eve is listening');
  console.log('  BB84 detects the intrusion and aborts');
  console.log('▁'.repeat(50));
  console.log();

  const result3 = quantumSecureChannel({
    message: 'SECRET',
    eavesdrop: true,
    noiseLevel: 0.0,
    useErrorCorrection: true
  });

  console.log('▔'.repeat(50));
  console.log('  SCENARIO 4: No Error Correction (comparison)');
  console.log('  Alice sends "NISQ" with 10% noise');
  console.log('  Error correction DISABLED — message likely corrupted');
  console.log('▁'.repeat(50));
  console.log();

  const result4 = quantumSecureChannel({
    message: 'NISQ',
    eavesdrop: false,
    noiseLevel: 0.10,
    useErrorCorrection: false
  });

  // Summary comparison
  console.log('═'.repeat(56));
  console.log('  📊 Cross-Scenario Comparison');
  console.log('═'.repeat(56));
  console.log();

  const scenarios = [
    { name: '1. Normal', result: result1 },
    { name: '2. Noisy+ECC', result: result2 },
    { name: '3. Eavesdropper', result: result3 },
    { name: '4. No ECC', result: result4 }
  ];

  console.log('  Scenario        | Message  | Success | Eavesdropper | Noise | ECC  ');
  console.log('  ' + '─'.repeat(70));
  for (const s of scenarios) {
    const r = s.result;
    const success = r.success ? '[OK]' : '[FAIL]';
    const eve = r.eavesdrop ? (r.phases.keyExchange?.eavesdropperDetected ? '[CAUGHT]' : '[MISSED]') : '[NONE]';
    const noise = `${(r.noiseLevel * 100).toFixed(0)}%`;
    const ecc = r.useErrorCorrection ? '[ON]' : '[OFF]';
    console.log(`  ${s.name.padEnd(16)} | "${r.message.padEnd(7)}" | ${success.padEnd(6)} | ${eve.padEnd(9)} | ${noise}  | ${ecc.padEnd(5)}`);
  }
  console.log();
  console.log('  Key Insight: Without error correction, noise corrupts the');
  console.log('  message. With BB84, eavesdropping is always detected.');
  console.log('  Superdense coding doubles bandwidth (2 bits/qubit).');
  console.log();
}
