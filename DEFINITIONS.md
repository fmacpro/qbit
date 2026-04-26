# Definitions — Quantum Simulation Terminology

This document explains the key terms and concepts used throughout the qbit quantum simulation demos. Each definition includes a plain-English explanation, a technical description, and how it's used in the code.

---

## Table of Contents

1. [Quantum Computing Concepts](#1-quantum-computing-concepts)
2. [Optimization Algorithms](#2-optimization-algorithms)
3. [Quantum-Inspired Techniques](#3-quantum-inspired-techniques)
4. [Optimization Theory](#4-optimization-theory)
5. [Problem-Specific Terms](#5-problem-specific-terms)
6. [Algorithm Parameters](#6-algorithm-parameters)

---

## 1. Quantum Computing Concepts

### Qubit (Quantum Bit)

| Aspect | Description |
|--------|-------------|
| **Plain English** | The quantum version of a classical bit. Unlike a classical bit that is either 0 or 1, a qubit can be both at the same time (superposition). |
| **Technical** | A two-level quantum system that can exist in a superposition of \|0⟩ and \|1⟩ states. Mathematically: \|ψ⟩ = α\|0⟩ + β\|1⟩, where \|α\|² + \|β\|² = 1. |
| **In our code** | Used in [`src/core/quantum.js`](src/core/quantum.js) as the fundamental unit for all quantum operations. |

### Superposition

| Aspect | Description |
|--------|-------------|
| **Plain English** | The ability of a qubit to be in multiple states simultaneously, like a spinning coin that is both heads and tails until it lands. |
| **Technical** | A linear combination of basis states. Measurement collapses the superposition to a single state with probability equal to the squared amplitude. |
| **In our code** | Used in [`src/demos/quantum-random.js`](src/demos/quantum-random.js) to generate true random numbers by measuring superposition states. |

### Entanglement

| Aspect | Description |
|--------|-------------|
| **Plain English** | A connection between qubits where measuring one instantly determines the state of the other, even if they're light-years apart. Einstein called it "spooky action at a distance." |
| **Technical** | A non-separable quantum state where the combined state cannot be described as a product of individual states. Bell states are maximally entangled. |
| **In our code** | Used in [`src/demos/quantum-teleportation.js`](src/demos/quantum-teleportation.js) and [`src/demos/superdense-coding.js`](src/demos/superdense-coding.js) to transmit quantum information. |

### Quantum Tunneling

| Aspect | Description |
|--------|-------------|
| **Plain English** | A quantum particle can pass through barriers that classical particles cannot. Like a ball rolling through a wall instead of needing enough energy to go over it. |
| **Technical** | A quantum phenomenon where a particle passes through a potential barrier with energy less than the barrier height, due to the wave-like nature of quantum mechanics. The probability decays exponentially with barrier width. |
| **In our code** | Simulated in [`src/demos/quantum-inspired-optimization.js`](src/demos/quantum-inspired-optimization.js) and [`src/demos/hospital-scheduling.js`](src/demos/hospital-scheduling.js) via the PIMC mixing term, which allows the system to escape local minima that trap classical algorithms. |

### Quantum Annealing

| Aspect | Description |
|--------|-------------|
| **Plain English** | A quantum version of simulated annealing that uses quantum tunneling instead of thermal jumps to find the lowest energy state of a problem. |
| **Technical** | An optimization technique that uses a time-dependent Hamiltonian, starting with a strong transverse field (quantum fluctuations) and gradually reducing it to find the ground state of a problem Hamiltonian. |
| **In our code** | The inspiration for our PIMC algorithm. D-Wave Systems uses real quantum annealers; our code simulates the same physics classically. |

### Transverse Field

| Aspect | Description |
|--------|-------------|
| **Plain English** | A "quantum shaker" that flips qubits between states, preventing them from getting stuck. Like constantly jiggling a marble in a landscape so it doesn't settle in a small dip. |
| **Technical** | A Hamiltonian term that doesn't commute with the problem Hamiltonian, typically of the form -Γ Σ σˣᵢ. It creates quantum fluctuations that enable tunneling. |
| **In our code** | Simulated by the mixing term in PIMC, which couples neighboring replicas and creates an effective transverse field. |

### Measurement

| Aspect | Description |
|--------|-------------|
| **Plain English** | The act of "looking at" a qubit, which forces it to choose a definite state (0 or 1). Before measurement, it exists in superposition. |
| **Technical** | A projective operation that collapses a quantum state to an eigenstate of the measurement operator. The probability of each outcome is given by the Born rule. |
| **In our code** | Used throughout all demos to extract classical results from quantum states. |

---

## 2. Optimization Algorithms

### Simulated Annealing (SA)

| Aspect | Description |
|--------|-------------|
| **Plain English** | Inspired by metallurgy: heat metal to high temperature (allowing atoms to move freely), then slowly cool it (locking atoms into low-energy arrangements). For optimization, "temperature" controls how often we accept worse solutions. |
| **Technical** | A probabilistic optimization algorithm that explores the solution space using the Metropolis-Hastings criterion: accept worse solutions with probability exp(-ΔE/T). Temperature T decreases over time according to a cooling schedule. |
| **In our code** | Implemented in every optimization demo as the classical baseline. Uses exponential cooling: `T ← T × coolingRate` each iteration. |

### Greedy Algorithm

| Aspect | Description |
|--------|-------------|
| **Plain English** | Makes the best immediate choice at each step without considering future consequences. Like always picking the cheapest item without checking if you'll need it later. |
| **Technical** | A deterministic heuristic that makes locally optimal choices at each decision point. Fast but often finds suboptimal solutions for NP-hard problems. |
| **In our code** | Used as the baseline "fast but dumb" algorithm. In graph coloring, uses Welsh-Powell heuristic (sort by degree). In scheduling, picks cheapest available nurse. |

### Brute Force

| Aspect | Description |
|--------|-------------|
| **Plain English** | Try every possible solution and pick the best one. Guaranteed to find the optimum, but takes impossibly long for large problems. |
| **Technical** | Exhaustive search over the entire solution space. Time complexity is exponential in problem size. Only feasible for tiny problem instances. |
| **In our code** | Used only for the small (4 nurses, 3 days) scheduling problem where 4⁹ ≈ 262K possibilities are manageable. |

### Path Integral Monte Carlo (PIMC)

| Aspect | Description |
|--------|-------------|
| **Plain English** | A classical simulation of quantum annealing. Instead of one solution evolving, we maintain many parallel copies (replicas) that influence each other through a "mixing" force, mimicking how quantum systems explore multiple paths simultaneously. |
| **Technical** | A computational method that maps a d-dimensional quantum system onto a (d+1)-dimensional classical system using the Trotter-Suzuki decomposition. Multiple replicas (Trotter slices) are coupled by a mixing term that simulates a transverse field. |
| **In our code** | The core quantum-inspired algorithm in all optimization demos. Maintains 12-20 parallel replicas with a mixing term that creates an effective transverse field. |

### Replica Exchange (Parallel Tempering)

| Aspect | Description |
|--------|-------------|
| **Plain English** | Let replicas swap their solutions periodically. A replica stuck in a bad local minimum can swap with one that found a better solution, then continue exploring from that better state. Like mountain climbers swapping ropes — the one stuck in a crevasse gets pulled out. |
| **Technical** | A Markov chain Monte Carlo method where multiple simulations at different temperatures periodically exchange configurations according to a Metropolis criterion. The exchange probability depends on the energy difference: P(swap) = min(1, exp((Eᵢ - Eⱼ)(1/Tᵢ - 1/Tⱼ))). |
| **In our code** | Added to both [`src/demos/graph-coloring.js`](src/demos/graph-coloring.js) and [`src/demos/hospital-scheduling.js`](src/demos/hospital-scheduling.js). Every 50 iterations, adjacent replicas can swap if the exchange probability is favorable. |

### Metropolis-Hastings Acceptance

| Aspect | Description |
|--------|-------------|
| **Plain English** | A rule for deciding whether to accept a new solution: if it's better, always accept it; if it's worse, sometimes accept it (with a probability that depends on how much worse and the current temperature). |
| **Technical** | The acceptance probability for a proposed move with energy change ΔE at temperature T is: P(accept) = min(1, exp(-ΔE/T)). This satisfies detailed balance and ensures convergence to the Boltzmann distribution. |
| **In our code** | Used in both SA and PIMC algorithms. In PIMC, the total delta includes both classical cost change and quantum mixing contribution. |

---

## 3. Quantum-Inspired Techniques

### Mixing Term

| Aspect | Description |
|--------|-------------|
| **Plain English** | A force that pulls neighboring replicas toward agreement. If two adjacent replicas assign different nurses to the same shift, the mixing term adds a penalty, encouraging them to align. This mimics the quantum transverse field. |
| **Technical** | In PIMC, the mixing term is J Σᵣ Σᵢ δ(sᵣᵢ, sᵣ₊₁ᵢ), where J is the mixing strength and δ is the Kronecker delta. This creates an effective ferromagnetic coupling between adjacent Trotter slices. |
| **In our code** | Calculated as: `quantumDelta = mixingStrength × (oldMatch - newMatch)` for each neighboring replica. A positive value means the new assignment agrees more with neighbors (good). |

### Mixing Strength (Γ)

| Aspect | Description |
|--------|-------------|
| **Plain English** | How strongly replicas are pulled toward agreement. High mixing = strong quantum effects (more tunneling). Low mixing = mostly classical behavior. |
| **Technical** | The coefficient of the transverse field term in the PIMC Hamiltonian. Must be carefully tuned: too low and there's no quantum advantage; too high and the system freezes into a uniform state. |
| **In our code** | Starts at 20-800 (depending on problem) and decays to 0.5-10.0 using a power-law schedule. The value must be comparable to the cost function penalties to enable tunneling. |

### Trotter-Suzuki Decomposition

| Aspect | Description |
|--------|-------------|
| **Plain English** | A mathematical trick that converts a quantum problem into a classical one with extra dimensions. Like unfolding a 3D object into a 2D net — you lose the quantum magic but gain computability. |
| **Technical** | The approximation e^(A+B) ≈ (e^(A/n) e^(B/n))ⁿ for large n. This decomposes the quantum evolution operator into classically simulable steps, introducing n "Trotter slices" (replicas). |
| **In our code** | The theoretical foundation for why PIMC works. The number of replicas corresponds to the Trotter number. |

### Power-Law Annealing Schedule

| Aspect | Description |
|--------|-------------|
| **Plain English** | A way to gradually reduce quantum effects that keeps them active longer than a simple linear decrease. Like slowly dimming a light with a curve rather than a straight line. |
| **Technical** | The mixing strength decays as Γ(τ) = Γ₀ + (Γ_f - Γ₀) × τ^p where τ is progress and p < 1 keeps the field strong longer. Temperature decays as T(τ) = T₀ × (1-τ)^q. |
| **In our code** | Uses p=0.6 for mixing decay and q=0.7 for temperature decay. This keeps quantum tunneling active well into the refinement phase. |

### Energy Landscape / Cost Landscape

| Aspect | Description |
|--------|-------------|
| **Plain English** | A metaphorical "map" where each point is a possible solution and the height represents how bad that solution is. The goal is to find the lowest valley (best solution). |
| **Technical** | The function f: S → ℝ mapping each solution in the search space to its cost/energy. Local minima are solutions where all neighboring solutions have higher cost. |
| **In our code** | Defined by the `cost()` function in each algorithm. The landscape's structure determines which optimization approach works best. |

---

## 4. Optimization Theory

### Local Minimum (plural: Local Minima)

| Aspect | Description |
|--------|-------------|
| **Plain English** | A solution that looks good compared to its neighbors but isn't the best overall. Like being in a small valley when the real goal is in a deeper valley over the mountain range. |
| **Technical** | A solution x* such that f(x*) ≤ f(x) for all x in the neighborhood N(x*), but f(x*) > f(x_global). Classical algorithms get trapped here because any single step makes things worse. |
| **In our code** | The reason quantum-inspired algorithms outperform classical ones — they can tunnel through the barriers surrounding local minima. |

### Global Minimum (plural: Global Minima)

| Aspect | Description |
|--------|-------------|
| **Plain English** | The single best possible solution to a problem. The deepest valley in the entire landscape. |
| **Technical** | A solution x* such that f(x*) ≤ f(x) for all x in the entire search space S. Finding the global minimum is the goal of optimization, but it's often NP-hard. |
| **In our code** | For small problems (4 nurses, 3 days), brute force finds the true global minimum. For larger problems, we can only approximate it. |

### Energy Barrier

| Aspect | Description |
|--------|-------------|
| **Plain English** | A "hill" in the solution landscape that separates one valley (local minimum) from another. To go from one good solution to a better one, you must pass through worse solutions first. |
| **Technical** | The difference in cost between a local minimum and the highest-cost solution on the path to a neighboring local minimum. Barrier height determines how hard it is to escape. |
| **In our code** | Tall barriers are why SA struggles — it needs high temperature to jump over them, but high temperature also prevents settling. Quantum tunneling passes through barriers rather than over them. |

### Energy Gap

| Aspect | Description |
|--------|-------------|
| **Plain English** | The difference in quality between the best solution found and the true optimal solution. A small gap means you're close to perfect. |
| **Technical** | ΔE = f(x_found) - f(x_optimal). In quantum annealing, the minimum energy gap between ground and first excited states determines how slowly you must anneal to avoid excitations. |
| **In our code** | We measure this indirectly by comparing algorithm scores. The gap between SA and QI scores shows the quantum advantage. |

### Ground State

| Aspect | Description |
|--------|-------------|
| **Plain English** | The lowest possible energy state of a physical system. In optimization terms, it's the best possible solution. |
| **Technical** | The eigenstate of the Hamiltonian with the minimum eigenvalue. Finding the ground state of certain Hamiltonians is QMA-hard (the quantum equivalent of NP-hard). |
| **In our code** | The goal of all optimization algorithms. The problem Hamiltonian encodes the cost function, and we want its ground state. |

### Excited State

| Aspect | Description |
|--------|-------------|
| **Plain English** | Any solution that isn't the best possible. Higher energy = worse solution. |
| **Technical** | An eigenstate of the Hamiltonian with energy greater than the ground state energy. During quantum annealing, the system may get stuck in excited states if the anneal is too fast. |
| **In our code** | All non-optimal solutions are excited states. The goal is to minimize the excitation energy (distance from optimal). |

### Boltzmann Distribution

| Aspect | Description |
|--------|-------------|
| **Plain English** | A probability distribution that tells you how likely each solution is at a given temperature. At high temperature, all solutions are equally likely. At low temperature, only the best solutions are likely. |
| **Technical** | P(s) ∝ exp(-E(s)/kT), where E(s) is the energy of state s, k is Boltzmann's constant, and T is temperature. This distribution emerges from the Metropolis acceptance criterion. |
| **In our code** | The theoretical foundation for both SA and PIMC. The Metropolis rule ensures the system samples from the Boltzmann distribution at each temperature. |

### Detailed Balance

| Aspect | Description |
|--------|-------------|
| **Plain English** | A fairness condition ensuring that the algorithm doesn't favor one direction over another. The probability of moving from A to B equals the probability of moving from B to A, weighted by their Boltzmann probabilities. |
| **Technical** | The condition π(i)P(i→j) = π(j)P(j→i), where π is the stationary distribution and P are transition probabilities. This guarantees convergence to the correct equilibrium distribution. |
| **In our code** | The Metropolis-Hastings acceptance criterion satisfies detailed balance. Replica exchange also uses a Metropolis criterion to maintain detailed balance. |

### Markov Chain

| Aspect | Description |
|--------|-------------|
| **Plain English** | A sequence of solutions where each new solution depends only on the current one, not on the history of how you got there. Like a drunkard's walk — each step only depends on where they are now. |
| **Technical** | A stochastic process where P(X_{t+1} | X_t, X_{t-1}, ..., X_0) = P(X_{t+1} | X_t). The Markov property ensures memoryless transitions. |
| **In our code** | Each replica in PIMC runs its own Markov chain. The Metropolis rule defines the transition probabilities between states. |

### Monte Carlo Method

| Aspect | Description |
|--------|-------------|
| **Plain English** | Any algorithm that uses random sampling to solve problems. Named after the Monte Carlo casino because it relies on randomness. |
| **Technical** | A class of computational algorithms that rely on repeated random sampling to obtain numerical results. The law of large numbers ensures convergence. |
| **In our code** | Both SA and PIMC are Monte Carlo methods. They use random perturbations and probabilistic acceptance to explore the solution space. |

---

## 5. Problem-Specific Terms

*Note: These are the real-world problems we solve with the algorithms above.*

### NP-Hard

| Aspect | Description |
|--------|-------------|
| **Plain English** | A class of problems so difficult that no known algorithm can solve them efficiently for large inputs. As the problem grows, the time needed explodes exponentially. |
| **Technical** | A problem is NP-hard if every problem in NP can be reduced to it in polynomial time. NP-hard problems may not be in NP (they might not even be decidable). |
| **In our code** | Both hospital scheduling and graph coloring are NP-hard. For small instances we can brute-force; for realistic sizes we use heuristics. |

### Chromatic Number

| Aspect | Description |
|--------|-------------|
| **Plain English** | The minimum number of colors needed to color a graph so no adjacent vertices share the same color. |
| **Technical** | The smallest k such that a graph is k-colorable. Determining the chromatic number is NP-hard. |
| **In our code** | Used in [`src/demos/graph-coloring.js`](src/demos/graph-coloring.js) as the target for optimization. We force algorithms to use fewer colors than the chromatic number to create conflicts. |

### Welsh-Powell Heuristic

| Aspect | Description |
|--------|-------------|
| **Plain English** | A smart greedy coloring algorithm: color the most connected (highest degree) vertices first, since they're the hardest to satisfy. |
| **Technical** | Sort vertices by degree descending, then assign each vertex the smallest color not used by its already-colored neighbors. |
| **In our code** | Used as the Greedy baseline in [`src/demos/graph-coloring.js`](src/demos/graph-coloring.js). |

### Constraint Satisfaction Problem (CSP)

| Aspect | Description |
|--------|-------------|
| **Plain English** | A problem where you need to find a solution that satisfies all given rules (constraints). Like a puzzle where every piece must fit. |
| **Technical** | A problem defined by variables X₁...Xₙ with domains D₁...Dₙ and constraints C₁...Cₘ. A solution assigns each variable a value from its domain such that all constraints are satisfied. |
| **In our code** | Both scheduling (nurse shift constraints) and graph coloring (adjacent vertex constraints) are CSPs. |

### Fairness Penalty

| Aspect | Description |
|--------|-------------|
| **Plain English** | A measure of how unevenly work is distributed. If some nurses work 7 days and others 0, the fairness penalty is high. If everyone works 3-4 days, it's low. |
| **Technical** | Calculated as the sum of squared deviations from the mean: Σᵢ (dᵢ - d̄)², where dᵢ is the number of days worked by nurse i. |
| **In our code** | Used in [`src/demos/hospital-scheduling.js`](src/demos/hospital-scheduling.js) as part of the cost function, weighted by 3×. |

### Goodness of Segmentation (Goodness of Variance)

| Aspect | Description |
|--------|-------------|
| **Plain English** | A measure of how well the tier boundaries capture the natural groupings in the data. 0% = random assignment (all customers lumped together), 100% = perfect segmentation (each tier contains identical customers). |
| **Technical** | Calculated as `1 - withinVar / totalVar`, where `withinVar` is the sum of squared deviations of each customer from their tier's mean, and `totalVar` is the sum of squared deviations from the overall mean. This is equivalent to the R² statistic in ANOVA — the fraction of total variance explained by the segmentation. |
| **In our code** | Computed in [`evaluateSegmentation()`](src/demos/customer-segmentation.js:95) at line 140: `goodnessOfVariance = totalVar > 0 ? betweenVar / totalVar : 0`. Also used in [`estimateRevenueImpact()`](src/demos/customer-segmentation.js:319) to scale conversion rates: higher goodness = higher conversion multiplier (up to 3x base rate). |

### Planted Solution

| Aspect | Description |
|--------|-------------|
| **Plain English** | A problem instance created by first choosing a solution, then building the problem around it. This guarantees the problem has at least one valid solution. |
| **Technical** | A method for generating benchmark instances with known optimal solutions. For graph coloring: assign colors first, then only add edges between different-colored vertices. |
| **In our code** | Originally used in [`src/demos/graph-coloring.js`](src/demos/graph-coloring.js) via `generateKColorableGraph()`. |

---

## 6. Algorithm Parameters

### Temperature (T)

| Aspect | Description |
|--------|-------------|
| **Plain English** | Controls how "wild" the search is. High temperature = lots of random exploration (accepting bad solutions). Low temperature = conservative refinement (only accepting improvements). |
| **Technical** | The parameter in the Boltzmann distribution that determines the probability of accepting worse solutions. In SA, it follows a cooling schedule. In PIMC, it follows a power-law decay. |
| **In our code** | SA: starts at 20-30, decays exponentially (×0.997 per iteration). PIMC: starts at 6.0, decays as `6.0 × (1-progress)^0.7`. |

### Cooling Rate (α)

| Aspect | Description |
|--------|-------------|
| **Plain English** | How quickly the temperature drops. A rate of 0.997 means temperature decreases by 0.3% each step — slow cooling gives better results but takes longer. |
| **Technical** | The multiplicative factor applied to temperature each iteration: T ← α × T. Typical values are 0.99 to 0.999. |
| **In our code** | Set to 0.997 for SA in all demos, giving approximately 50 half-lives over 15K iterations. |

### Number of Replicas (R)

| Aspect | Description |
|--------|-------------|
| **Plain English** | How many parallel copies of the solution we maintain. More replicas = better quantum effects but slower computation. |
| **Technical** | The Trotter number in the PIMC decomposition. More replicas give a more accurate approximation of the quantum system but require proportionally more computation. |
| **In our code** | Ranges from 6 (small problems) to 20 (hard problems). Each replica runs its own Markov chain. |

### Iterations

| Aspect | Description |
|--------|-------------|
| **Plain English** | How many steps each algorithm takes. More iterations = more thorough search but slower. |
| **Technical** | The number of Monte Carlo steps. For PIMC, each iteration updates all R replicas once. |
| **In our code** | SA: 5K-15K iterations. PIMC: 4K-30K iterations (each iteration updates all replicas). |

### Cost Function

| Aspect | Description |
|--------|-------------|
| **Plain English** | A mathematical formula that scores how good or bad a solution is. Lower scores are better. |
| **Technical** | A function f: S → ℝ that maps solutions to real numbers. The optimization objective is to minimize f(s). |
| **In our code** | Each problem has its own cost function combining multiple objectives (cost, fairness, violations) with different weights. |

### Delta (Δ)

| Aspect | Description |
|--------|-------------|
| **Plain English** | The change in score when we try a small modification to the current solution. Negative delta = improvement. Positive delta = getting worse. |
| **Technical** | ΔE = E_new - E_old. Used in the Metropolis acceptance criterion. In PIMC, the total delta includes both classical and quantum components. |
| **In our code** | `deltaClassical` = change in cost function. `quantumDelta` = change in mixing energy. `totalDelta` = sum of both. |

---

## Quick Reference: Algorithm Comparison

| Feature | Greedy | Simulated Annealing | Quantum-Inspired (PIMC) |
|---------|--------|-------------------|------------------------|
| **Speed** | Instant | Fast | Moderate |
| **Solution Quality** | Poor | Good | Best |
| **Escapes Local Minima?** | No | Yes (thermal) | Yes (quantum tunneling) |
| **Parallelism** | None | None | R replicas |
| **Deterministic?** | Yes | No | No |
| **Key Mechanism** | Local choice | Metropolis acceptance | Mixing + replica exchange |
| **Best For** | Quick baselines | Moderate problems | Hard problems with tall barriers |

---

*Last updated: 2026-04-26*
