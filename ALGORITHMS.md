# Algorithm Reference

This document explains the three optimization algorithms used throughout the [`qbit`](.) quantum simulation demos, with academic references for further reading.

---

## Table of Contents

1. [Greedy Algorithm](#1-greedy-algorithm)
2. [Simulated Annealing (SA)](#2-simulated-annealing-sa)
3. [Quantum-Inspired Optimization (PIMC)](#3-quantum-inspired-optimization-pimc)
4. [Comparison Summary](#4-comparison-summary)
5. [References](#5-references)

---

## 1. Greedy Algorithm

### Overview

A **greedy algorithm** makes the locally optimal choice at each decision step, hoping this will lead to a globally optimal solution. It never backtracks or revisits past decisions.

### How It Works

In the context of segmentation and binning problems:

1. Sort all data points (e.g., customers by spending).
2. Place initial tier boundaries at equal intervals (equal-width) or at natural gaps.
3. Assign each data point to the nearest boundary.
4. No iterative improvement — the result is final after the first pass.

### Strengths

- **Extremely fast** — O(n log n) or O(n) in most cases.
- **Simple to implement and understand**.
- **Deterministic** — same input always produces the same output.

### Weaknesses

- **No guarantee of optimality** — can produce arbitrarily poor solutions.
- **No exploration** — once a decision is made, it cannot be undone.
- **Highly sensitive to initial conditions** — equal-width bins often split natural clusters.

### When to Use

- As a **baseline** to compare against more sophisticated methods.
- When runtime is critical and solution quality is secondary.
- When the problem has a known greedy-choice property (e.g., Huffman coding, Dijkstra's shortest path).

### Pseudocode

```
function greedySegmentation(data, numTiers):
    sorted = sort(data)
    boundaries = [min, min + step, min + 2*step, ..., max]
    for each point in sorted:
        assign to nearest boundary
    return boundaries
```

---

## 2. Simulated Annealing (SA)

### Overview

**Simulated Annealing** is a probabilistic optimization algorithm inspired by the annealing process in metallurgy — heating a material to high temperatures and then slowly cooling it to reduce defects. It was independently proposed by Kirkpatrick, Gelatt, and Vecchi (1983) [1] and Černý (1985) [2].

### How It Works

1. Start with a random solution and a high "temperature" parameter T.
2. At each step, propose a small random change to the current solution.
3. If the change improves the cost function, accept it.
4. If the change worsens the cost, accept it **with probability** `exp(-ΔE / T)`.
5. Gradually reduce T according to a cooling schedule.
6. At low temperatures, the algorithm behaves like greedy hill-climbing.

The key insight is that the **acceptance probability** allows the algorithm to escape local minima early on, while the cooling schedule ensures it eventually settles into a good solution.

### The Acceptance Probability

```
P(accept) = 1                    if ΔE < 0  (improvement)
P(accept) = exp(-ΔE / T)         if ΔE > 0  (worsening)
```

Where:
- `ΔE` = change in cost (positive = worse)
- `T` = current temperature

### Strengths

- **Escapes local minima** — unlike greedy, can temporarily accept worse solutions.
- **Simple to implement** — only requires a cost function and a neighbor proposal.
- **Provably convergent** — under certain cooling schedules, converges to the global optimum with probability 1 (though this may take infinite time).

### Weaknesses

- **Slow** — requires many iterations for good results.
- **Sensitive to cooling schedule** — too fast = premature convergence, too slow = wasted computation.
- **No quantum tunneling** — must climb over energy barriers using thermal fluctuations, which becomes exponentially unlikely as barriers grow.

### Cooling Schedules

| Schedule | Formula | Characteristics |
|---|---|---|
| Linear | Tₖ = T₀ - k·α | Simple but rarely used |
| Exponential | Tₖ = T₀ · αᵏ | Fast cooling, may trap early |
| Logarithmic | Tₖ = T₀ / log(k) | Theoretically optimal but very slow |
| Power-law | Tₖ = T₀ · (1 - k/K)ᵖ | Good balance; used in our demos |

### When to Use

- Problems with many local minima but smooth cost landscapes.
- When you need better-than-greedy solutions but have limited implementation time.
- As a **classical baseline** for comparing against quantum-inspired methods.

### Pseudocode

```
function simulatedAnnealing(data, numTiers, options):
    solution = randomInitialSolution(data, numTiers)
    T = options.initialTemp
    for i = 1 to options.maxIterations:
        neighbor = proposeNeighbor(solution)
        ΔE = cost(neighbor) - cost(solution)
        if ΔE < 0 or random() < exp(-ΔE / T):
            solution = neighbor
        T = cool(T, i, options)
    return solution
```

---

## 3. Quantum-Inspired Optimization (PIMC)

### Overview

**Quantum-Inspired Optimization** using **Path Integral Monte Carlo (PIMC)** is a classical algorithm that mimics the behavior of a quantum annealer. It was inspired by D-Wave Systems' quantum annealing processors [3] and the theoretical work on quantum annealing by Finnila et al. (1994) [4] and Kadowaki & Nishimori (1998) [5].

The core idea is to simulate **quantum tunneling** — a phenomenon where a quantum system can pass through energy barriers rather than climbing over them — by running multiple parallel "replicas" of the system coupled together by a mixing term.

### How It Works

1. **Multiple Replicas**: Maintain N parallel copies (replicas) of the solution, each at a slightly different temperature.
2. **Mixing Term**: Add a coupling term between replicas that penalizes disagreement. This creates an effective "transverse field" that enables tunneling.
3. **Replica Exchange**: Periodically allow adjacent replicas to swap configurations based on the Metropolis criterion, improving mixing.
4. **Annealing**: Gradually reduce both the temperature and the mixing field strength, transitioning from quantum-dominated exploration to classical exploitation.

### The Physics

In quantum annealing, the system evolves under the time-dependent Hamiltonian:

```
H(t) = A(t) · Hₚ + B(t) · Hₖ
```

Where:
- `Hₚ` = problem Hamiltonian (encodes the cost function)
- `Hₖ` = kinetic (tunneling) Hamiltonian (the transverse field)
- `A(t)` decreases from 1 to 0 during annealing
- `B(t)` increases from 0 to 1 during annealing

PIMC simulates this using the **Suzuki-Trotter expansion** [6], which maps a d-dimensional quantum system to a (d+1)-dimensional classical system. The extra dimension is the "imaginary time" axis, represented by our replicas.

### Key Parameters

| Parameter | Effect |
|---|---|
| Number of replicas (P) | More replicas = stronger tunneling effect, but higher computational cost |
| Mixing strength (Γ) | Controls the transverse field; higher = more tunneling |
| Exchange frequency | How often replicas swap; prevents stagnation |
| Annealing schedule | Power-law decay of both temperature and mixing |

### Strengths

- **Quantum tunneling** — can pass through energy barriers that trap classical SA.
- **Parallel exploration** — multiple replicas explore the landscape simultaneously.
- **Better solutions** — consistently outperforms SA on hard optimization problems (as demonstrated in our demos).

### Weaknesses

- **Computationally expensive** — P replicas × N iterations per replica.
- **More parameters to tune** — replicas, mixing strength, exchange schedule.
- **Still classical** — does not provide a true quantum speedup; it's a classical simulation of quantum dynamics.

### When to Use

- Problems with **rugged energy landscapes** and tall, narrow barriers.
- When SA fails to find good solutions consistently.
- When you have sufficient compute budget for multiple replicas.

### Pseudocode

```
function quantumInspiredPIMC(data, numTiers, options):
    replicas = [randomInitialSolution(data, numTiers) for _ in range(P)]
    temperatures = [T₀ · (1 + k·δ) for k in range(P)]  // ladder of temps
    Γ = options.initialMixing

    for i = 1 to options.maxIterations:
        for each replica r:
            neighbor = proposeNeighbor(replicas[r])
            ΔE = cost(neighbor) - cost(replicas[r])
            ΔM = mixingTerm(neighbor, replicas, r)  // coupling to neighbors
            if ΔE + Γ·ΔM < 0 or random() < exp(-(ΔE + Γ·ΔM) / T[r]):
                replicas[r] = neighbor

        if i % exchangeFrequency == 0:
            for each adjacent pair (r, r+1):
                swap if Metropolis criterion met

        Γ = annealMixing(i, options)
        T = annealTemperature(i, options)

    return lowestCostReplica(replicas)
```

---

## 4. Comparison Summary

| Property | Greedy | Simulated Annealing | Quantum-Inspired (PIMC) |
|---|---|---|---|
| **Year introduced** | Ancient (formalized 1950s) | 1983 [1] | 1994 [4] |
| **Exploration mechanism** | None | Thermal fluctuations | Quantum tunneling + thermal |
| **Escape local minima?** | No | Yes (via temperature) | Yes (via tunneling + replicas) |
| **Parallelism** | None | Single-threaded | Multiple replicas (embarrassingly parallel) |
| **Deterministic?** | Yes | No (stochastic) | No (stochastic) |
| **Solution quality** | Poor | Good | Best |
| **Runtime** | Instant | Moderate | Slowest |
| **Parameters to tune** | None | 2-3 (T₀, α, iterations) | 5-7 (P, Γ, exchange freq, etc.) |
| **Theoretical guarantee** | None | Converges to global optimum in infinite time | Converges to ground state in infinite time [7] |
| **Real-world use** | Baselines, quick estimates | Chip design, logistics, scheduling | D-Wave quantum annealers, hard combinatorial optimization |

---

## 5. References

### Simulated Annealing

1. **Kirkpatrick, S., Gelatt, C. D., & Vecchi, M. P.** (1983). Optimization by Simulated Annealing. *Science*, 220(4598), 671–680.  
   [https://doi.org/10.1126/science.220.4598.671](https://doi.org/10.1126/science.220.4598.671)  
   *The seminal paper that introduced simulated annealing to combinatorial optimization.*

2. **Černý, V.** (1985). Thermodynamical approach to the traveling salesman problem: An efficient simulation algorithm. *Journal of Optimization Theory and Applications*, 45(1), 41–51.  
   [https://doi.org/10.1007/BF00940812](https://doi.org/10.1007/BF00940812)  
   *Independently discovered the same algorithm, applied to the TSP.*

### Quantum Annealing & PIMC

3. **D-Wave Systems Inc.** (2024). *D-Wave System Documentation: Quantum Annealing*.  
   [https://docs.dwavesys.com/docs/latest/c_gs_2.html](https://docs.dwavesys.com/docs/latest/c_gs_2.html)  
   *Official documentation for D-Wave's quantum annealing hardware and the PIMC simulator.*

4. **Finnila, A. B., Gomez, M. A., Sebenik, C., Stenson, C., & Doll, J. D.** (1994). Quantum annealing: A new method for minimizing multidimensional functions. *Chemical Physics Letters*, 219(5–6), 343–348.  
   [https://doi.org/10.1016/0009-2614(94)00117-0](https://doi.org/10.1016/0009-2614(94)00117-0)  
   *First proposal of quantum annealing as an optimization method.*

5. **Kadowaki, T., & Nishimori, H.** (1998). Quantum annealing in the transverse Ising model. *Physical Review E*, 58(5), 5355.  
   [https://doi.org/10.1103/PhysRevE.58.5355](https://doi.org/10.1103/PhysRevE.58.5355)  
   *Established the theoretical foundation linking quantum annealing to the transverse Ising model.*

6. **Suzuki, M.** (1976). Generalized Trotter's formula and systematic approximants of exponential operators and inner derivations with applications to many-body problems. *Communications in Mathematical Physics*, 51(2), 183–190.  
   [https://doi.org/10.1007/BF01609348](https://doi.org/10.1007/BF01609348)  
   *The Suzuki-Trotter expansion that enables mapping quantum systems to classical path integrals.*

7. **Morita, S., & Nishimori, H.** (2008). Mathematical foundation of quantum annealing. *Journal of Mathematical Physics*, 49(12), 125210.  
   [https://doi.org/10.1063/1.2995837](https://doi.org/10.1063/1.2995837)  
   *Rigorous mathematical analysis of quantum annealing convergence properties.*

### Greedy Algorithms

8. **Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C.** (2022). *Introduction to Algorithms* (4th ed.). MIT Press. Chapter 16: Greedy Algorithms.  
   [https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/](https://mitpress.mit.edu/9780262046305/introduction-to-algorithms/)  
   *Comprehensive textbook covering greedy algorithms and their theoretical properties.*

### Replica Exchange / Parallel Tempering

9. **Swendsen, R. H., & Wang, J.-S.** (1986). Replica Monte Carlo simulation of spin-glasses. *Physical Review Letters*, 57(21), 2607.  
   [https://doi.org/10.1103/PhysRevLett.57.2607](https://doi.org/10.1103/PhysRevLett.57.2607)  
   *Introduced the replica exchange method (also known as parallel tempering).*

10. **Earl, D. J., & Deem, M. W.** (2005). Parallel tempering: Theory, applications, and new perspectives. *Physical Chemistry Chemical Physics*, 7(23), 3910–3916.  
    [https://doi.org/10.1039/B509983H](https://doi.org/10.1039/B509983H)  
    *Comprehensive review of parallel tempering methods and their applications.*

### Applications

11. **Martoňák, R., Santoro, G. E., & Tosatti, E.** (2002). Quantum annealing of the traveling-salesman problem. *Physical Review E*, 70(5), 057701.  
    [https://doi.org/10.1103/PhysRevE.70.057701](https://doi.org/10.1103/PhysRevE.70.057701)  
    *Application of quantum annealing (via PIMC) to the traveling salesman problem.*

12. **Denchev, V. S., Boixo, S., Isakov, S. V., Ding, N., Babbush, R., Smelyanskiy, V., ... & Neven, H.** (2016). What is the computational value of finite-range tunneling? *Physical Review X*, 6(3), 031015.  
    [https://doi.org/10.1103/PhysRevX.6.031015](https://doi.org/10.1103/PhysRevX.6.031015)  
    *Demonstrates that finite-range quantum tunneling provides a computational advantage over classical thermal annealing on crafted optimization problems.*

---

*Last updated: April 2026*
