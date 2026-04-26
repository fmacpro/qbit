# qbit — Practical Node.js Quantum Simulation

A **Node.js-based quantum computing simulation library** demonstrating real-world practical applications of quantum algorithms. Built from scratch with complex linear algebra — no external dependencies.

## Why Quantum Simulation in Node.js?

Quantum computers are not yet widely available, but **quantum simulators** let you:

- **Learn** quantum computing concepts interactively
- **Prototype** quantum algorithms before running on real hardware
- **Integrate** quantum-enhanced features into existing Node.js applications
- **Demonstrate** quantum advantage for specific problem classes
- **Educate** teams about quantum computing capabilities

## Practical Use Cases

### 1. 🔐 Quantum Random Number Generator (QRNG)

**Problem:** Classical pseudo-random number generators (PRNGs) are deterministic — given the same seed, they produce the same sequence. This is a security risk for cryptography.

**Quantum solution:** Measuring a qubit in superposition produces fundamentally random outcomes governed by the Born rule.

**Real-world applications:**
- Cryptographic key generation (TLS, SSH, GPG)
- Secure token generation (OTP, session IDs, CSRF tokens)
- Monte Carlo simulations requiring unbiased randomness
- Scientific lotteries and statistical sampling
- Blockchain consensus protocols

```js
import { quantumRandomInt, quantumRandomHex } from 'qbit';

const diceRoll = quantumRandomInt(1, 6);
const sessionToken = quantumRandomHex(32);
```

### 2. 🔍 Grover's Search Algorithm

**Problem:** Searching an unsorted database of N items takes O(N) time classically.

**Quantum solution:** Grover's algorithm finds the target in O(√N) time — a **quadratic speedup**.

**Real-world applications:**
- Unsorted database search
- SAT problem solving (boolean satisfiability)
- Hash function collision finding
- Constraint satisfaction problems
- Graph coloring
- Password cracking (searching for a target hash)

```js
import { groverSearch } from 'qbit';

// Search 16 items (4 qubits) for target index 7
const result = groverSearch(4, 7);
console.log(`Found: ${result.found}, Probability: ${result.probability}`);
```

### 3. 🔑 BB84 Quantum Key Distribution

**Problem:** Classical key exchange is vulnerable to undetected eavesdropping.

**Quantum solution:** BB84 uses quantum superposition and the **no-cloning theorem** to detect eavesdropping — any interception disturbs the quantum state and is detectable.

**Real-world applications:**
- Secure communication channels
- Quantum-secured VPNs
- Banking and financial transactions
- Government/military communications
- Critical infrastructure security

```js
import { bb84Protocol } from 'qbit';

// Exchange 100 bits, no eavesdropper
const result = bb84Protocol(100, false);
console.log(`Shared key: ${result.key}`);
console.log(`Eavesdropper detected: ${result.detected}`); // false

// With eavesdropper
const result2 = bb84Protocol(100, true);
console.log(`Eavesdropper detected: ${result2.detected}`); // likely true
```

### 4. 📊 QAOA — Quantum Approximate Optimization Algorithm

**Problem:** Combinatorial optimization problems (Max-Cut, portfolio optimization, TSP) are NP-hard — classical solutions don't scale.

**Quantum solution:** QAOA is a variational algorithm that finds approximate solutions using alternating layers of problem and mixing operators.

**Real-world applications:**
- **Max-Cut:** Graph partitioning for VLSI circuit design, social network analysis
- **Portfolio optimization:** Asset allocation with risk constraints
- **Traveling Salesman Problem:** Route optimization for logistics
- **Supply chain optimization:** Warehouse and delivery optimization
- **Protein folding:** Bioinformatics and drug discovery

```js
import { qaoaMaxCut, qaoaPortfolioOptimization } from 'qbit';

// Solve Max-Cut on a triangle graph
const cut = qaoaMaxCut(1);
console.log(`Best cut: ${cut.cut}/${cut.maxPossible} edges`);

// Portfolio optimization
const portfolio = qaoaPortfolioOptimization();
console.log(`Optimal allocation: ${portfolio.portfolio}`);
```

### 5. 🛡️ Quantum Error Correction (3-Qubit Repetition Code)

**Problem:** Quantum states are extremely fragile — decoherence and gate errors corrupt information.

**Quantum solution:** The 3-qubit repetition code encodes one logical qubit into three physical qubits, detects bit-flip errors via syndrome measurement, and corrects them.

**Real-world applications:**
- Fault-tolerant quantum computing
- Quantum memory protection
- Error mitigation in NISQ (Noisy Intermediate-Scale Quantum) devices
- Surface codes (scalable quantum error correction)
- Quantum communication over noisy channels

```js
import { errorCorrectionCycle } from 'qbit';

// Encode logical 1, flip qubit 0, detect and correct
const result = errorCorrectionCycle(1, 0);
console.log(`Original: ${result.original}, Decoded: ${result.decoded}`);
console.log(`Corrected: ${result.corrected}`); // true
```

### 6. 📡 Quantum Teleportation

**Problem:** How do you transfer an unknown quantum state from one location to another without physically moving the particle?

**Quantum solution:** Teleportation uses entanglement and classical communication to transfer a quantum state. The original state is destroyed (no-cloning theorem), and the transfer is instantaneous on the receiver's end but requires classical communication, so no information travels faster than light.

**Real-world applications:**
- Quantum communication networks ("quantum internet")
- Quantum repeaters for long-distance communication
- Fault-tolerant quantum computing (gate teleportation)
- Distributed quantum computing between remote processors
- Secure state transfer in quantum networks

```js
import { quantumTeleportation } from 'qbit';

// Teleport the state 0.6|0⟩ + 0.8|1⟩
const result = quantumTeleportation(0.6, 0.8);
console.log(`Alice measured: (${result.aliceMeasurement})`);
console.log(`Fidelity: ${(result.fidelity * 100).toFixed(1)}%`);
```

### 7. ⚡ Deutsch-Jozsa Algorithm

**Problem:** Given a function f: {0,1}ⁿ → {0,1} that is either constant (same output for all inputs) or balanced (0 for half, 1 for half), determine which it is. Classically, this requires 2ⁿ⁻¹ + 1 queries in the worst case.

**Quantum solution:** The Deutsch-Jozsa algorithm solves this with exactly **1 query** — an exponential speedup. It uses quantum parallelism to evaluate all inputs simultaneously, then uses interference to extract the answer.

**Real-world applications:**
- Function property testing (constant vs balanced)
- Boolean function analysis
- Pattern detection in binary data
- Cryptographic primitive analysis
- Educational: first algorithm showing exponential quantum advantage

```js
import { deutschJozsa } from 'qbit';

// Test a 4-bit constant function
const result = deutschJozsa(4, true, 0);
console.log(`Is constant: ${result.isConstant}`); // true
console.log(`Queries used: ${result.queriesUsed}`); // 1 (classical needs 9)
```

### 8. 🧬 Quantum Fingerprinting

**Problem:** Two parties (Alice and Bob) each have an n-bit string. They want to check if their strings are equal, but communication is expensive. Classically, they must send all n bits or use a hash.

**Quantum solution:** Encode the data into small quantum states (fingerprints) using O(log n) qubits. Compare fingerprints via the **SWAP test**, which detects differences with probability proportional to 1 - |⟨ψ|φ⟩|². The SWAP test has zero false negatives — identical states always produce |0⟩.

**Real-world applications:**
- Data deduplication in distributed systems
- Blockchain transaction verification
- Cloud storage integrity checking
- Network synchronization verification
- DNA sequence comparison
- Any "set equality" problem with communication constraints

```js
import { encodeFingerprint, multiRoundSwapTest } from 'qbit';

// Alice and Bob encode their strings
const fpAlice = encodeFingerprint([1,0,1,1,0,1,0,0]);
const fpBob   = encodeFingerprint([1,0,1,1,0,1,0,0]);

// Compare with multi-round SWAP test
const result = multiRoundSwapTest(fpAlice, fpBob, 5);
console.log(`Strings equal: ${result.isEqual}`); // true
```

### 9. 📻 Superdense Coding

**Problem:** Classical communication requires sending 2 bits to transmit 2 bits of information. Can we do better using quantum resources?

**Quantum solution:** Superdense coding uses a shared entangled Bell pair to transmit **2 classical bits by sending only 1 qubit**. Alice applies one of four operations (I, X, Z, XZ) to her half of the Bell pair — each encoding a different 2-bit message — then sends her qubit to Bob. Bob performs a Bell measurement (CNOT + H) to decode both bits simultaneously.

**Real-world applications:**
- **Quantum communication networks:** Doubling classical channel capacity using entanglement
- **Quantum internet protocols:** Efficient metadata transmission alongside quantum data
- **Satellite quantum communication:** Reducing bandwidth requirements for space-based links
- **Quantum memory interfaces:** Encoding classical data into minimal quantum resources
- **Educational:** Best demonstration of entanglement as a resource (not just for non-locality)

```js
import { superdenseCoding } from 'qbit';

// Encode and decode all 4 possible 2-bit messages
for (const msg of [[0,0], [0,1], [1,0], [1,1]]) {
  const result = superdenseCoding(msg);
  console.log(`Sent: [${msg}] → Received: [${result}]`);
  // Always matches!
}
```

### 10. 🔐 Quantum-Secured Communication Channel

**Problem:** How do you build a complete secure communication system using quantum principles? Individual quantum protocols are well-understood, but integrating them into an end-to-end system is the real challenge.

**Quantum solution:** This demo combines **4 quantum protocols** into a single integrated system:

1. **🔑 BB84 QKD** — Alice and Bob exchange a shared secret key. Any eavesdropper is detected via the no-cloning theorem (error rate jumps from 0% to ~25-50%).
2. **🔒 One-Time Pad** — The message is encrypted using XOR with the shared key (information-theoretically secure).
3. **📻 Superdense Coding** — The encrypted ciphertext is transmitted using 2 bits per qubit, achieving **50% bandwidth savings**.
4. **🛡️ Error Correction** — The 3-qubit repetition code protects against bit-flip noise during transmission.

The demo runs **4 scenarios** for comparison:
- **Normal:** No noise, no eavesdropper — message delivered intact
- **Noisy + ECC:** 10% noise with error correction — ~97% of errors corrected
- **Eavesdropper:** Eve is detected and communication is aborted
- **No ECC:** 10% noise without correction — message corrupted

**Real-world applications:**
- **Quantum VPNs:** Secure enterprise communication over untrusted networks
- **Satellite QKD:** Space-based secure key distribution (e.g., Micius satellite)
- **Banking:** Quantum-secured financial transactions
- **Critical infrastructure:** Command & control for power grids, water systems
- **Quantum internet:** Foundational protocol stack for future quantum networks

```js
import { quantumSecureChannel } from 'qbit';

// Normal operation — message sent securely
const result = quantumSecureChannel({
  message: 'HELLO',
  eavesdrop: false,
  noiseLevel: 0.0
});
console.log(`Success: ${result.success}`); // true

// With eavesdropper — detected and aborted
const result2 = quantumSecureChannel({
  message: 'SECRET',
  eavesdrop: true
});
console.log(`Eavesdropper caught: ${result2.phases.keyExchange.eavesdropperDetected}`); // true
```

### 11. 🧠 Quantum-Inspired Optimization (Path Integral Monte Carlo)

**Problem:** Combinatorial optimization problems (employee scheduling, logistics, portfolio optimization) are NP-hard. Classical heuristics like greedy and simulated annealing get stuck in local minima.

**Quantum solution:** This demo implements **Path Integral Monte Carlo** — a quantum-inspired algorithm that uses the mathematical framework of quantum annealing to tunnel through cost barriers.

**How it works:**
1. **Multiple Replicas (Trotter slices):** Maintain P parallel copies of the solution, coupled by a "mixing" term (simulating the path integral formulation of quantum mechanics)
2. **Quantum Tunneling:** The coupling between replicas allows the system to tunnel through barriers that trap classical algorithms
3. **Annealing Schedule:** Gradually reduce the mixing field, transitioning from quantum exploration to classical exploitation

**Comparison with classical approaches:**
- **Greedy:** Fast but shortsighted — makes locally optimal choices that may lead to globally poor solutions
- **Simulated Annealing:** Uses thermal fluctuations to escape local minima, but must climb *over* barriers
- **Quantum-Inspired:** Uses quantum tunneling to go *through* barriers — more effective on rugged energy landscapes

**Real-world applications:**
- **D-Wave hybrid solvers:** Used by Volkswagen (traffic optimization), Lockheed Martin (aerospace), DENSO (manufacturing)
- **IBM Qiskit runtime:** Portfolio optimization for finance, molecular simulation for drug discovery
- **Google Cirq:** Materials science, protein folding
- **Any NP-hard problem:** Scheduling, routing, resource allocation, circuit design

```js
import { quantumInspiredSchedule, greedySchedule, simulatedAnnealing } from 'qbit';

// Generate a scheduling problem
const { employees, shifts, costs } = generateSchedulingProblem(5, 8);

// Compare approaches
const greedy = greedySchedule(5, 8, costs);
const sa = simulatedAnnealing(5, 8, costs);
const qi = quantumInspiredSchedule(5, 8, costs, { numReplicas: 10, maxIterations: 5000 });

console.log(`Greedy: ${greedy.cost}, SA: ${sa.cost}, Quantum: ${qi.cost}`);
```

### 12. 🏥 Hospital Nurse Scheduling (Visual Output)

**Problem:** Scheduling nurses in a hospital is an NP-hard combinatorial optimization problem. With 3 shifts per day (Morning 🌅, Afternoon ☀️, Night 🌙), 7 days a week, and constraints like no consecutive shifts, night-shift recovery, max 5 days per week, and fairness requirements — the search space is astronomical (6²¹ ≈ 2.2×10¹⁶ for just 6 nurses).

**Quantum solution:** Path Integral Monte Carlo with 12 parallel replicas (Trotter slices) coupled by a quantum tunneling term. The replicas are attracted to each other via a mixing field, allowing the system to tunnel through cost barriers that trap classical algorithms.

**What makes this different from Use Case 11:**
- **Realistic problem domain:** Hospital scheduling with nurse personality types (early_bird, night_owl, flexible, afternoon_pref), seniority bonuses, and weekend penalties
- **Beautiful visual output:** Formatted schedule tables with emoji shift indicators (🌅☀️🌙), workload distribution bar charts (█░), and side-by-side comparison
- **Brute force verification:** Small problems (4 nurses, 3 days) verify the quantum-inspired approach finds the true optimum
- **4-way comparison:** Greedy vs Simulated Annealing vs Quantum-Inspired vs Brute Force (optimal)

**Real-world applications:**
- **Hospital staff scheduling:** Used by major healthcare systems (NHS, Kaiser Permanente)
- **Airline crew scheduling:** Delta, American Airlines use optimization solvers
- **Manufacturing shift planning:** Toyota, Tesla factory floor scheduling
- **Call center staffing:** Optimizing agent schedules for coverage and cost
- **Any NP-hard scheduling problem:** The same quantum-inspired techniques apply universally

```js
import { runDemo } from 'qbit/demos/hospital-scheduling.js';

// Run the full demo with beautiful visual output
// Small problem (4 nurses, 3 days) + Full problem (6 nurses, 7 days)
runDemo();
```

### 13. 🎨 Graph Coloring

**Problem:** Given an undirected graph, assign colors to vertices such that no two adjacent vertices share the same color, using as few colors as possible (the chromatic number). This is NP-hard.

**Quantum solution:** Path Integral Monte Carlo with 20 parallel replicas coupled by a mixing term. The quantum tunneling effect allows the system to escape local minima that trap classical algorithms, finding valid colorings with fewer colors.

**Real-world applications:**
- **Compiler register allocation:** Graph coloring assigns CPU registers to variables
- **Radio frequency assignment:** Avoid interference between nearby transmitters
- **Map coloring:** The famous 4-color theorem applied to cartography
- **Sudoku solving:** Latin square completion as a constraint satisfaction problem
- **Exam timetabling:** Scheduling exams without conflicts
- **Pattern matching:** Computational biology and network analysis

```js
import { generateGraph, greedyColoring, simulatedAnnealingColoring, quantumInspiredColoring } from 'qbit/demos/graph-coloring.js';

// Generate a random graph (12 vertices, 50% edge density)
const graph = generateGraph(12, 0.5);

// Compare approaches with 3 colors
const greedy = greedyColoring(12, graph.adjacency, 3);
const sa = simulatedAnnealingColoring(12, graph.adjacency, 3);
const qi = quantumInspiredColoring(12, graph.adjacency, 3, { numReplicas: 20, maxIterations: 30000 });

console.log(`Greedy conflicts: ${/* ... */}, SA: ${/* ... */}, QI: ${/* ... */}`);
```

### 14. 📊 Optimal Data Binning (Jenks Natural Breaks)

**Problem:** Given N quantitative data points, partition them into K bins to minimize within-bin variance (sum of squared errors from each bin's mean). This is 1D k-means clustering, also known as "Jenks natural breaks optimization" — NP-hard for K > 2.

**Quantum solution:** Path Integral Monte Carlo with 24 parallel replicas. The quantum mixing term encourages replicas to agree on boundary positions, enabling the system to tunnel through cost barriers that trap classical SA.

**Real-world applications:**
- **Histogram visualization:** Choosing optimal bin boundaries for data display
- **Customer segmentation:** Grouping customers by spending patterns into tiers
- **Risk assessment:** Binning credit scores into risk tiers (FICO, etc.)
- **Image quantization:** Reducing color depth while preserving visual quality
- **Geographic choropleth maps:** Grouping regions by statistical measures
- **Bioinformatics:** Gene expression binning for analysis
- **Market basket analysis:** Price range segmentation

```js
import { generateData, greedyBinning, simulatedAnnealingBinning, quantumInspiredBinning } from 'qbit/demos/optimal-binning.js';

// Generate data with 3 overlapping clusters, 300 points
const data = generateData(300, 3);

// Compare approaches with 10 bins
const greedy = greedyBinning(data, 10);
const sa = simulatedAnnealingBinning(data, 10);
const qi = quantumInspiredBinning(data, 10, { numReplicas: 24, maxIterations: 30000 });

console.log(`Greedy score: ${/* ... */}, SA: ${/* ... */}, QI: ${/* ... */}`);
```

### 15. 🛒 Customer Segmentation (Quantum-Inspired Marketing)

**Problem:** A retail company has 500 customers with known annual spending amounts. They want to segment customers into spending tiers (Bronze, Silver, Gold, Platinum, Diamond) for targeted marketing campaigns. The goal: assign customers to tiers such that customers within each tier have SIMILAR spending (low within-tier variance), making campaigns more effective.

**Quantum solution:** Path Integral Monte Carlo with 24 parallel replicas. The quantum mixing term creates an effective transverse field that allows the system to tunnel through barriers in the cost landscape, finding tier boundaries that better capture natural spending segments.

**Real-world applications:**
- **Targeted marketing:** Segmented campaigns have 3-5x higher conversion rates
- **Revenue optimization:** Targeted campaigns cost 60% less than mass marketing
- **Customer loyalty:** Tier-based rewards programs (airline status, hotel tiers)
- **Dynamic pricing:** Segment-based pricing optimization
- **Any k-means clustering problem:** The same quantum-inspired techniques apply universally

```js
import { generateCustomerData, greedySegmentation, simulatedAnnealingSegmentation, quantumInspiredSegmentation } from 'qbit/demos/customer-segmentation.js';

// Generate 500 customers with 4 overlapping spending segments
const data = generateCustomerData(500, 4);

// Compare approaches with 7 tiers
const greedy = greedySegmentation(data, 7);
const sa = simulatedAnnealingSegmentation(data, 7);
const qi = quantumInspiredSegmentation(data, 7, { numReplicas: 24, maxIterations: 30000 });

console.log(`Greedy score: ${/* ... */}, SA: ${/* ... */}, QI: ${/* ... */}`);
```

## Getting Started

```bash
# Clone and install (no dependencies needed)
git clone <repo>
cd qbit

# Run all demos
npm run demo:all

# Or run individual demos
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
npm run demo:coloring
npm run demo:binning
npm run demo:segmentation
```

## Project Structure

```
qbit/
├── src/
│   ├── core/
│   │   └── quantum.js        # Core engine: Complex numbers, matrices, gates, QuantumSystem
│   ├── demos/
│   │   ├── quantum-random.js          # QRNG demo
│   │   ├── grovers-search.js          # Grover's algorithm demo
│   │   ├── quantum-key-distribution.js # BB84 protocol demo
│   │   ├── qaoa-optimization.js       # QAOA demo (Max-Cut, Portfolio)
│   │   ├── error-correction.js        # 3-qubit repetition code demo
│   │   ├── quantum-teleportation.js   # Quantum teleportation demo
│   │   ├── deutsch-jozsa.js           # Deutsch-Jozsa algorithm demo
│   │   ├── quantum-fingerprinting.js  # Quantum fingerprinting demo
│   │   ├── superdense-coding.js       # Superdense coding demo
│   │   ├── quantum-secure-channel.js           # 🔐 Integrated secure communication demo
│   │   ├── quantum-inspired-optimization.js    # 🧠 Quantum-inspired optimization (scheduling)
│   │   ├── hospital-scheduling.js              # 🏥 Hospital nurse scheduling (visual)
│   │   ├── graph-coloring.js                   # 🎨 Graph coloring (quantum-inspired)
│   │   ├── optimal-binning.js                  # 📊 Optimal data binning (quantum-inspired)
│   │   ├── customer-segmentation.js            # 🛒 Customer segmentation (quantum-inspired)
│   │   └── run-all.js                          # Run all demos
│   └── index.js              # Library entry point + CLI
├── package.json
└── README.md
```

## API Reference

### Core

| Function | Description |
|----------|-------------|
| [`QuantumSystem(n)`](src/core/quantum.js:1) | Create an n-qubit quantum system |
| [`qs.applyGate(gate, target)`](src/core/quantum.js:1) | Apply single-qubit gate (H, X, Y, Z, S, T) |
| [`qs.applyCNOT(control, target)`](src/core/quantum.js:1) | Apply CNOT gate |
| [`qs.measure()`](src/core/quantum.js:1) | Measure all qubits, collapse state |
| [`qs.measureQubit(index)`](src/core/quantum.js:1) | Measure single qubit |
| [`createBellState()`](src/core/quantum.js:1) | Create |Φ⁺⟩ = (|00⟩ + |11⟩)/√2 |
| [`createGHZState(n)`](src/core/quantum.js:1) | Create GHZ state for n qubits |

### QRNG

| Function | Description |
|----------|-------------|
| [`quantumRandomBit()`](src/demos/quantum-random.js:1) | Generate a random 0 or 1 |
| [`quantumRandomByte()`](src/demos/quantum-random.js:1) | Generate random byte (0-255) |
| [`quantumRandomInt(min, max)`](src/demos/quantum-random.js:1) | Random integer in [min, max] |
| [`quantumRandomFloat()`](src/demos/quantum-random.js:1) | Random float in [0, 1) |
| [`quantumRandomHex(bytes)`](src/demos/quantum-random.js:1) | Random hex string |

### Grover's Search

| Function | Description |
|----------|-------------|
| [`groverSearch(numQubits, targetIndex)`](src/demos/grovers-search.js:1) | Run Grover's algorithm |

### BB84

| Function | Description |
|----------|-------------|
| [`bb84Protocol(numBits, eavesdrop)`](src/demos/quantum-key-distribution.js:1) | Simulate BB84 key exchange |

### QAOA

| Function | Description |
|----------|-------------|
| [`qaoaMaxCut(p)`](src/demos/qaoa-optimization.js:1) | Solve Max-Cut on triangle graph |
| [`qaoaPortfolioOptimization()`](src/demos/qaoa-optimization.js:1) | Portfolio optimization with 3 assets |

### Error Correction

| Function | Description |
|----------|-------------|
| [`errorCorrectionCycle(logicalBit, errorQubit)`](src/demos/error-correction.js:1) | Full encode → error → detect → correct → decode cycle |

### Quantum Teleportation

| Function | Description |
|----------|-------------|
| [`quantumTeleportation(alpha, beta)`](src/demos/quantum-teleportation.js:45) | Teleport state α|0⟩ + β|1⟩ using |Φ⁺⟩ Bell pair |

### Deutsch-Jozsa

| Function | Description |
|----------|-------------|
| [`deutschJozsa(numBits, constant, constantValue)`](src/demos/deutsch-jozsa.js:98) | Determine if function is constant or balanced in 1 query |
| [`buildDJOracle(numBits, constant, constantValue)`](src/demos/deutsch-jozsa.js:41) | Build a Deutsch-Jozsa oracle function |

### Quantum Fingerprinting

| Function | Description |
|----------|-------------|
| [`encodeFingerprint(bits)`](src/demos/quantum-fingerprinting.js:42) | Encode a bit string into a 2-qubit quantum fingerprint |
| [`swapTest(state1, state2)`](src/demos/quantum-fingerprinting.js:83) | Single-round SWAP test between two fingerprints |
| [`multiRoundSwapTest(fp1, fp2, rounds)`](src/demos/quantum-fingerprinting.js:140) | Multi-round SWAP test for higher confidence |

### Superdense Coding

| Function | Description |
|----------|-------------|
| [`superdenseCoding(message)`](src/demos/superdense-coding.js:1) | Encode and decode a 2-bit message using 1 qubit and a shared Bell pair |
| [`superdenseEncode(qs, message)`](src/demos/superdense-coding.js:1) | Apply encoding gates (I, X, Z, XZ) to Alice's qubit based on 2-bit message |
| [`superdenseDecode(qs)`](src/demos/superdense-coding.js:1) | Perform Bell measurement (CNOT + H) to decode both bits |

### Quantum-Secured Communication Channel

| Function | Description |
|----------|-------------|
| [`quantumSecureChannel(options)`](src/demos/quantum-secure-channel.js:303) | Run a complete secure communication session (BB84 + OTP + superdense coding + ECC) |

**Options:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `message` | `string` | `'HELLO'` | Text message to send |
| `eavesdrop` | `boolean` | `false` | Whether Eve is listening |
| `noiseLevel` | `number` | `0.0` | Bit-flip probability (0-1) |
| `useErrorCorrection` | `boolean` | `true` | Enable 3-qubit repetition code |

### Quantum-Inspired Optimization

| Function | Description |
|----------|-------------|
| [`generateSchedulingProblem(n, m)`](src/demos/quantum-inspired-optimization.js:50) | Generate a random employee shift scheduling problem |
| [`greedySchedule(n, m, costs)`](src/demos/quantum-inspired-optimization.js:98) | Classical greedy heuristic (baseline) |
| [`simulatedAnnealing(n, m, costs, opts)`](src/demos/quantum-inspired-optimization.js:177) | Classical simulated annealing (comparison) |
| [`quantumInspiredSchedule(n, m, costs, opts)`](src/demos/quantum-inspired-optimization.js:288) | Path Integral Monte Carlo (quantum-inspired) |
| [`quantumInspiredWithTrials(n, m, costs, opts, trials)`](src/demos/quantum-inspired-optimization.js:415) | Run multiple QI trials, return best |

**Options for `quantumInspiredSchedule`:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `numReplicas` | `number` | `8` | Number of Trotter slices (path integral replicas) |
| `maxIterations` | `number` | `3000` | Annealing steps |
| `initialMixing` | `number` | `2.0` | Initial transverse field strength |
| `finalMixing` | `number` | `0.01` | Final transverse field strength |

### Graph Coloring

| Function | Description |
|----------|-------------|
| [`generateGraph(numVertices, edgeProbability)`](src/demos/graph-coloring.js:51) | Generate a random Erdos-Renyi graph |
| [`evaluateColoring(coloring, adjacency, numColors)`](src/demos/graph-coloring.js:79) | Evaluate a coloring (conflicts, colors used, score) |
| [`greedyColoring(numVertices, adjacency, maxColors)`](src/demos/graph-coloring.js:196) | Welsh-Powell greedy heuristic (baseline) |
| [`simulatedAnnealingColoring(numVertices, adjacency, maxColors, opts)`](src/demos/graph-coloring.js:233) | Classical simulated annealing |
| [`quantumInspiredColoring(numVertices, adjacency, maxColors, opts)`](src/demos/graph-coloring.js:298) | Path Integral Monte Carlo (quantum-inspired) |
| [`renderGraph(coloring, adjacency, title)`](src/demos/graph-coloring.js:117) | Render graph as colored adjacency matrix |
| [`runTrials(numVertices, edgeProb, maxColors, numTrials)`](src/demos/graph-coloring.js:437) | Multi-trial statistical comparison |

**Options for `quantumInspiredColoring`:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `numReplicas` | `number` | `20` | Number of Trotter slices (path integral replicas) |
| `maxIterations` | `number` | `30000` | Annealing steps |
| `initialMixing` | `number` | `800.0` | Initial transverse field strength |
| `finalMixing` | `number` | `10.0` | Final transverse field strength |

### Optimal Data Binning

| Function | Description |
|----------|-------------|
| [`generateData(numPoints, numClusters)`](src/demos/optimal-binning.js:39) | Generate multi-modal quantitative data with clusters |
| [`evaluateBinning(data, boundaries, numBins)`](src/demos/optimal-binning.js:95) | Evaluate a binning (within-bin variance, score) |
| [`greedyBinning(data, numBins)`](src/demos/optimal-binning.js:284) | Equal-width binning (baseline) |
| [`simulatedAnnealingBinning(data, numBins, opts)`](src/demos/optimal-binning.js:309) | Classical simulated annealing |
| [`quantumInspiredBinning(data, numBins, opts)`](src/demos/optimal-binning.js:371) | Path Integral Monte Carlo (quantum-inspired) |
| [`renderHistogram(data, boundaries, numBins, title)`](src/demos/optimal-binning.js:175) | Render histogram with colored bins |
| [`runTrials(numPoints, numClusters, numBins, numTrials)`](src/demos/optimal-binning.js:501) | Multi-trial statistical comparison |

**Options for `quantumInspiredBinning`:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `numReplicas` | `number` | `24` | Number of Trotter slices (path integral replicas) |
| `maxIterations` | `number` | `30000` | Annealing steps |
| `initialMixing` | `number` | `500.0` | Initial transverse field strength |
| `finalMixing` | `number` | `5.0` | Final transverse field strength |

### Customer Segmentation

| Function | Description |
|----------|-------------|
| [`generateCustomerData(numCustomers, numSegments)`](src/demos/customer-segmentation.js:39) | Generate realistic customer spending data |
| [`evaluateSegmentation(data, boundaries, numTiers)`](src/demos/customer-segmentation.js:96) | Evaluate a segmentation (within-tier variance, score) |
| [`greedySegmentation(data, numTiers)`](src/demos/customer-segmentation.js:399) | Equal-width tier segmentation (baseline) |
| [`simulatedAnnealingSegmentation(data, numTiers, opts)`](src/demos/customer-segmentation.js:423) | Classical simulated annealing |
| [`quantumInspiredSegmentation(data, numTiers, opts)`](src/demos/customer-segmentation.js:478) | Path Integral Monte Carlo (quantum-inspired) |
| [`renderSegmentation(data, boundaries, numTiers, title)`](src/demos/customer-segmentation.js:181) | Render histogram with colored tiers |
| [`estimateRevenueImpact(evalResult, totalCustomers)`](src/demos/customer-segmentation.js:320) | Estimate revenue impact of segmentation |
| [`runTrials(numCustomers, numSegments, numTiers, numTrials)`](src/demos/customer-segmentation.js:602) | Multi-trial statistical comparison |

**Options for `quantumInspiredSegmentation`:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `numReplicas` | `number` | `24` | Number of Trotter slices (path integral replicas) |
| `maxIterations` | `number` | `30000` | Annealing steps |
| `initialMixing` | `number` | `500.0` | Initial transverse field strength |
| `finalMixing` | `number` | `5.0` | Final transverse field strength |

## Limitations & Next Steps

This is a **simulator** — it runs on classical hardware and cannot provide true quantum speedup or genuine quantum randomness (the simulation uses `Math.random()`). However, it accurately models the mathematics of quantum algorithms.

To run on real quantum hardware, export the circuits to **Qiskit** (IBM) or **Cirq** (Google) format.

## License

MIT
