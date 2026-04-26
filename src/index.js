#!/usr/bin/env node

/**
 * qbit — Practical Node.js Quantum Simulation Library
 *
 * Entry point that exports all modules and provides a CLI.
 */

import { QuantumSystem, Complex, createBellState, createGHZState } from './core/quantum.js';
import { quantumRandomBit, quantumRandomByte, quantumRandomInt, quantumRandomFloat, quantumRandomHex } from './demos/quantum-random.js';
import { groverSearch } from './demos/grovers-search.js';
import { bb84Protocol } from './demos/quantum-key-distribution.js';
import { qaoaMaxCut, qaoaPortfolioOptimization } from './demos/qaoa-optimization.js';
import { errorCorrectionCycle } from './demos/error-correction.js';
import { quantumTeleportation } from './demos/quantum-teleportation.js';
import { deutschJozsa } from './demos/deutsch-jozsa.js';
import { encodeFingerprint, swapTest } from './demos/quantum-fingerprinting.js';
import { superdenseCoding } from './demos/superdense-coding.js';
import { quantumSecureChannel } from './demos/quantum-secure-channel.js';
import { quantumInspiredSchedule, greedySchedule, simulatedAnnealing } from './demos/quantum-inspired-optimization.js';

// ─── Exports ────────────────────────────────────────────────────────────────

export {
  // Core
  QuantumSystem,
  Complex,
  createBellState,
  createGHZState,

  // QRNG
  quantumRandomBit,
  quantumRandomByte,
  quantumRandomInt,
  quantumRandomFloat,
  quantumRandomHex,

  // Grover's Search
  groverSearch,

  // BB84
  bb84Protocol,

  // QAOA
  qaoaMaxCut,
  qaoaPortfolioOptimization,

  // Error Correction
  errorCorrectionCycle,

  // Quantum Teleportation
  quantumTeleportation,

  // Deutsch-Jozsa
  deutschJozsa,

  // Quantum Fingerprinting
  encodeFingerprint,
  swapTest,

  // Superdense Coding
  superdenseCoding,

  // Quantum-Secure Channel
  quantumSecureChannel,

  // Quantum-Inspired Optimization
  quantumInspiredSchedule,
  greedySchedule,
  simulatedAnnealing
};

// ─── CLI ────────────────────────────────────────────────────────────────────

function showHelp() {
  console.log(`
  qbit — Practical Node.js Quantum Simulation

  Usage:
    node src/index.js <command>

  Commands:
    demo:qrng            Quantum Random Number Generator
    demo:grover          Grover's Search Algorithm
    demo:bb84            BB84 Quantum Key Distribution
    demo:qaoa            QAOA Optimization (Max-Cut, Portfolio)
    demo:error-correction 3-Qubit Repetition Error Correction
    demo:teleportation   Quantum Teleportation
    demo:deutsch-jozsa   Deutsch-Jozsa Algorithm
    demo:fingerprinting  Quantum Fingerprinting (SWAP test)
    demo:superdense      Superdense Coding (2 bits in 1 qubit)
    demo:secure-channel  🔐 Quantum-Secured Communication Channel
    demo:q-inspired     🧠 Quantum-Inspired Optimization (Scheduling)
    demo:hospital       🏥 Hospital Nurse Scheduling (Visual)

  Or use npm scripts:
    npm run demo:qrng
    npm run demo:grover
    npm run demo:bb84
    npm run demo:qaoa
    npm run demo:error-correction
    npm run demo:teleportation
    npm run demo:deutsch-jozsa
    npm run demo:fingerprinting
    npm run demo:superdense
    npm run demo:secure-channel
    npm run demo:q-inspired
    npm run demo:hospital
    npm run demo:all
    npm run benchmark          (default: medium)
    npm run benchmark:fast
    npm run benchmark:medium
    npm run benchmark:deep
    npm run benchmark:all
  `);
}

const command = process.argv[2];
switch (command) {
  case 'demo:qrng':
  case 'qrng':
    await import('./demos/quantum-random.js');
    break;
  case 'demo:grover':
  case 'grover':
    await import('./demos/grovers-search.js');
    break;
  case 'demo:bb84':
  case 'bb84':
    await import('./demos/quantum-key-distribution.js');
    break;
  case 'demo:qaoa':
  case 'qaoa':
    await import('./demos/qaoa-optimization.js');
    break;
  case 'demo:error-correction':
  case 'error-correction':
    await import('./demos/error-correction.js');
    break;
  case 'demo:teleportation':
  case 'teleportation':
    await import('./demos/quantum-teleportation.js');
    break;
  case 'demo:deutsch-jozsa':
  case 'deutsch-jozsa':
    await import('./demos/deutsch-jozsa.js');
    break;
  case 'demo:fingerprinting':
  case 'fingerprinting':
    await import('./demos/quantum-fingerprinting.js');
    break;
  case 'demo:superdense':
  case 'superdense':
    await import('./demos/superdense-coding.js');
    break;
  case 'demo:secure-channel':
  case 'secure-channel':
    await import('./demos/quantum-secure-channel.js');
    break;
  case 'demo:q-inspired':
  case 'q-inspired':
    await import('./demos/quantum-inspired-optimization.js');
    break;
  case 'demo:hospital':
  case 'hospital':
    await import('./demos/hospital-scheduling.js');
    break;
  default:
    showHelp();
    break;
}
