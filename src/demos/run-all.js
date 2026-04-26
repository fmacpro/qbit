#!/usr/bin/env node

/**
 * Run all quantum simulation demos sequentially.
 */

console.log('═'.repeat(56));
console.log('  🎯 Running All Quantum Simulation Demos');
console.log('═'.repeat(56));
console.log();

// Demo 1: QRNG
console.log('\n--- Demo 1: Quantum Random Number Generator ---\n');
await import('./quantum-random.js');

// Demo 2: Grover's Search
console.log('\n--- Demo 2: Grover\'s Search Algorithm ---\n');
await import('./grovers-search.js');

// Demo 3: BB84
console.log('\n--- Demo 3: BB84 Quantum Key Distribution ---\n');
await import('./quantum-key-distribution.js');

// Demo 4: QAOA
console.log('\n--- Demo 4: QAOA Optimization ---\n');
await import('./qaoa-optimization.js');

// Demo 5: Error Correction
console.log('\n--- Demo 5: Quantum Error Correction ---\n');
await import('./error-correction.js');

// Demo 6: Teleportation
console.log('\n--- Demo 6: Quantum Teleportation ---\n');
await import('./quantum-teleportation.js');

// Demo 7: Deutsch-Jozsa
console.log('\n--- Demo 7: Deutsch-Jozsa Algorithm ---\n');
await import('./deutsch-jozsa.js');

// Demo 8: Fingerprinting
console.log('\n--- Demo 8: Quantum Fingerprinting ---\n');
await import('./quantum-fingerprinting.js');

// Demo 9: Superdense Coding
console.log('\n--- Demo 9: Superdense Coding ---\n');
await import('./superdense-coding.js');

// Demo 10: Quantum-Secured Communication Channel
console.log('\n--- Demo 10: Quantum-Secured Communication Channel ---\n');
await import('./quantum-secure-channel.js');

// Demo 11: Quantum-Inspired Optimization
console.log('\n--- Demo 11: Quantum-Inspired Optimization ---\n');
await import('./quantum-inspired-optimization.js');

// Demo 12: Hospital Nurse Scheduling
console.log('\n--- Demo 12: Hospital Nurse Scheduling ---\n');
await import('./hospital-scheduling.js');

// Demo 13: Graph Coloring
console.log('\n--- Demo 13: Graph Coloring ---\n');
await import('./graph-coloring.js');

// Demo 14: Optimal Data Binning
console.log('\n--- Demo 14: Optimal Data Binning ---\n');
await import('./optimal-binning.js');

// Demo 15: Customer Segmentation
console.log('\n--- Demo 15: Customer Segmentation ---\n');
await import('./customer-segmentation.js');

console.log('═'.repeat(56));
console.log('  🎯 All 15 Quantum Simulation Demos Complete!');
console.log('═'.repeat(56));
console.log();
console.log('  Demos run:');
console.log('   1. 🔐 Quantum Random Number Generator');
console.log('   2. 🔍 Grover\'s Search Algorithm');
console.log('   3. 🔑 BB84 Quantum Key Distribution');
console.log('   4. 📊 QAOA Optimization');
console.log('   5. 🛡️  Quantum Error Correction');
console.log('   6. 📡 Quantum Teleportation');
console.log('   7. ⚡ Deutsch-Jozsa Algorithm');
console.log('   8. 🧬 Quantum Fingerprinting');
console.log('   9. 📻 Superdense Coding');
console.log('  10. 🔐 Quantum-Secured Communication Channel');
console.log('  11. 🧠 Quantum-Inspired Optimization');
console.log('  12. 🏥 Hospital Nurse Scheduling');
console.log('  13. 🎨 Graph Coloring');
console.log('  14. 📊 Optimal Data Binning');
console.log('  15. 🛒 Customer Segmentation');
console.log();
