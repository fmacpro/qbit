/**
 * Practical Use Case 4: QAOA — Quantum Approximate Optimization Algorithm
 *
 * QAOA is a variational quantum algorithm designed to solve
 * combinatorial optimization problems. It's a leading candidate
 * for demonstrating "quantum advantage" on near-term devices.
 *
 * Practical applications:
 * - Max-Cut problem (graph partitioning)
 * - Traveling Salesman Problem (route optimization)
 * - Portfolio optimization (finance)
 * - Supply chain logistics
 * - Protein folding (bioinformatics)
 * - Circuit design optimization
 * - Scheduling problems
 *
 * How it works:
 * 1. Encode the optimization problem as a Hamiltonian (cost function)
 * 2. Apply alternating layers of "problem" and "mixing" operators
 * 3. Use classical optimization to tune the angles (γ, β)
 * 4. Measure to get a candidate solution
 * 5. Repeat to find the optimal solution
 */

import { QuantumSystem, Complex } from '../core/quantum.js';

/**
 * Solve Max-Cut on a small graph using QAOA.
 *
 * Max-Cut: Partition graph vertices into two sets to maximize
 * the number of edges crossing between the sets.
 *
 * Example graph (3 nodes, triangle):
 *   0 ─── 1
 *    \   /
 *     2
 *
 * @param {number} p - Number of QAOA layers (higher = more accurate)
 * @returns {{ cut: number, assignment: number[], value: number }}
 */
function qaoaMaxCut(p = 1) {
  // Define a small graph: triangle (3 nodes, 3 edges)
  const numNodes = 3;
  const edges = [[0, 1], [1, 2], [0, 2]];

  // For a 3-node graph, we need 3 qubits
  const numQubits = 3;
  const dim = 1 << numQubits;

  // Cost function: for each edge (u,v), the term is Z_u ⊗ Z_v
  // C = Σ_{(u,v)∈E} (1 - Z_u Z_v) / 2
  // This counts edges that are cut (different assignments)

  // Mixer Hamiltonian: B = Σ_i X_i

  // For p=1, we try a grid of (γ, β) values
  // In practice, a classical optimizer would tune these
  const gammas = [0.5, 1.0, 1.5, 2.0];
  const betas = [0.5, 1.0, 1.5, 2.0];

  let bestCut = -1;
  let bestAssignment = null;
  let bestValue = -1;

  for (const gamma of gammas) {
    for (const beta of betas) {
      const q = new QuantumSystem(numQubits);

      // Initial state: uniform superposition
      for (let i = 0; i < numQubits; i++) {
        q.applyGate('H', i);
      }

      // Apply p layers
      for (let layer = 0; layer < p; layer++) {
        // Problem operator: e^{-iγC}
        // For each basis state, compute cost and apply phase
        const phaseState = q.state.map((c, i) => {
          // Compute cut value for this basis state
          let cutValue = 0;
          for (const [u, v] of edges) {
            const bitU = (i >> (numQubits - 1 - u)) & 1;
            const bitV = (i >> (numQubits - 1 - v)) & 1;
            if (bitU !== bitV) cutValue++;
          }
          // e^{-iγ * cutValue}
          const angle = -gamma * cutValue;
          return c.mul(new Complex(Math.cos(angle), Math.sin(angle)));
        });

        // Mixer operator: e^{-iβB} = Π_j e^{-iβX_j}
        // Apply to each qubit individually
        let mixedState = phaseState;
        for (let qubit = 0; qubit < numQubits; qubit++) {
          const newState = new Array(dim).fill(new Complex(0, 0));
          for (let i = 0; i < dim; i++) {
            const bit = (i >> (numQubits - 1 - qubit)) & 1;
            const flipped = i ^ (1 << (numQubits - 1 - qubit));

            // e^{-iβX} = cos(β)I - i·sin(β)X
            const cosB = Math.cos(beta);
            const sinB = Math.sin(beta);

            // Diagonal contribution
            newState[i] = newState[i].add(
              mixedState[i].mul(new Complex(cosB, 0))
            );
            // Off-diagonal contribution (flip bit)
            newState[flipped] = newState[flipped].add(
              mixedState[i].mul(new Complex(0, -sinB))
            );
          }
          mixedState = newState;
        }

        q.state = mixedState;
      }

      // Measure to get a candidate solution
      const bits = q.measure();
      const assignment = bits;

      // Compute cut value
      let cutValue = 0;
      for (const [u, v] of edges) {
        if (assignment[u] !== assignment[v]) cutValue++;
      }

      if (cutValue > bestCut) {
        bestCut = cutValue;
        bestAssignment = assignment;
        bestValue = cutValue;
      }
    }
  }

  return {
    cut: bestCut,
    assignment: bestAssignment,
    value: bestValue,
    maxPossible: edges.length
  };
}

/**
 * Solve a simple portfolio optimization problem.
 *
 * Given 3 assets with expected returns and correlations,
 * find the optimal allocation (buy/sell) to maximize return
 * while minimizing correlated risk.
 */
function qaoaPortfolioOptimization() {
  // 3 assets
  const numAssets = 3;
  const returns = [0.12, 0.08, 0.15]; // Expected returns
  const correlations = [
    [1.0, 0.3, 0.8],
    [0.3, 1.0, 0.2],
    [0.8, 0.2, 1.0]
  ];

  // Encode as a QUBO (Quadratic Unconstrained Binary Optimization) problem
  // Each qubit = 1 means "buy", 0 means "sell"
  // Objective: maximize Σ r_i x_i - λ Σ ρ_ij x_i x_j
  // where λ controls risk aversion

  const lambda = 0.5; // Risk aversion parameter
  const numQubits = numAssets;
  const dim = 1 << numQubits;

  // Try different (γ, β) combinations
  const gammas = [0.5, 1.0, 1.5];
  const betas = [0.5, 1.0, 1.5];

  let bestScore = -Infinity;
  let bestPortfolio = null;

  for (const gamma of gammas) {
    for (const beta of betas) {
      const q = new QuantumSystem(numQubits);

      // Uniform superposition
      for (let i = 0; i < numQubits; i++) {
        q.applyGate('H', i);
      }

      // Apply QAOA layer
      const phaseState = q.state.map((c, i) => {
        let score = 0;
        for (let a = 0; a < numAssets; a++) {
          const bitA = (i >> (numQubits - 1 - a)) & 1;
          score += returns[a] * bitA;
          for (let b = 0; b < numAssets; b++) {
            const bitB = (i >> (numQubits - 1 - b)) & 1;
            score -= lambda * correlations[a][b] * bitA * bitB;
          }
        }
        const angle = -gamma * score;
        return c.mul(new Complex(Math.cos(angle), Math.sin(angle)));
      });

      // Mixer
      let mixedState = phaseState;
      for (let qubit = 0; qubit < numQubits; qubit++) {
        const newState = new Array(dim).fill(new Complex(0, 0));
        for (let i = 0; i < dim; i++) {
          const flipped = i ^ (1 << (numQubits - 1 - qubit));
          const cosB = Math.cos(beta);
          const sinB = Math.sin(beta);
          newState[i] = newState[i].add(
            mixedState[i].mul(new Complex(cosB, 0))
          );
          newState[flipped] = newState[flipped].add(
            mixedState[i].mul(new Complex(0, -sinB))
          );
        }
        mixedState = newState;
      }

      q.state = mixedState;
      const bits = q.measure();

      let score = 0;
      for (let a = 0; a < numAssets; a++) {
        score += returns[a] * bits[a];
        for (let b = 0; b < numAssets; b++) {
          score -= lambda * correlations[a][b] * bits[a] * bits[b];
        }
      }

      if (score > bestScore) {
        bestScore = score;
        bestPortfolio = bits;
      }
    }
  }

  return {
    portfolio: bestPortfolio.map(b => b === 1 ? 'BUY' : 'SELL'),
    score: bestScore,
    assets: ['Tech Stock', 'Bond ETF', 'Crypto Fund']
  };
}

/**
 * Run the QAOA demo.
 */
function runDemo() {
  console.log('═'.repeat(56));
  console.log('  📊 QAOA — Quantum Approximate Optimization');
  console.log('═'.repeat(56));
  console.log();

  // Demo 1: Max-Cut
  console.log('  ── Problem 1: Max-Cut (Graph Partitioning) ──');
  console.log('  Graph: Triangle (3 nodes, 3 edges)');
  console.log('  Goal: Partition nodes into 2 sets to maximize');
  console.log('        edges crossing between sets.');
  console.log();

  const maxCutResult = qaoaMaxCut(1);
  console.log(`  Best cut found: ${maxCutResult.cut} / ${maxCutResult.maxPossible} edges`);
  console.log(`  Assignment: Node 0 → ${maxCutResult.assignment[0] === 0 ? 'Set A' : 'Set B'}`);
  console.log(`               Node 1 → ${maxCutResult.assignment[1] === 0 ? 'Set A' : 'Set B'}`);
  console.log(`               Node 2 → ${maxCutResult.assignment[2] === 0 ? 'Set A' : 'Set B'}`);
  console.log();

  // Demo 2: Portfolio Optimization
  console.log('  ── Problem 2: Portfolio Optimization ──');
  console.log('  Assets: Tech Stock (12%), Bond ETF (8%), Crypto Fund (15%)');
  console.log('  Goal: Maximize return while minimizing correlated risk');
  console.log();

  const portfolioResult = qaoaPortfolioOptimization();
  console.log('  Optimal portfolio:');
  for (let i = 0; i < portfolioResult.assets.length; i++) {
    console.log(`    ${portfolioResult.assets[i]}: ${portfolioResult.portfolio[i]}`);
  }
  console.log(`  Score: ${portfolioResult.score.toFixed(4)}`);
  console.log();

  // Explanation
  console.log('  ── Why QAOA matters ──');
  console.log('  Many real-world problems reduce to combinatorial');
  console.log('  optimization (NP-hard). QAOA offers a path to');
  console.log('  approximate solutions on near-term quantum hardware.');
  console.log('  As p (layers) increases, solution quality improves.');
  console.log();

  console.log('  ✅ QAOA Demo Complete');
  console.log();
}

export { qaoaMaxCut, qaoaPortfolioOptimization };

// Run directly
if (process.argv[1]?.endsWith('qaoa-optimization.js')) {
  runDemo();
}
