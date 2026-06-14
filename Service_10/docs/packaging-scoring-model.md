# Service #10 — Packaging Intelligence: Scoring Model Document

This document outlines the scoring algorithms, emission factors, parameters, and design logic used to evaluate packaging sustainability, efficiency, carbon footprint, and recyclability.

---

## 1. Sustainability Score (\(0\text{--}100\))

The sustainability score represents the environmental friendliness of the packaging material, weight, and recyclability.

### Formula
The raw sustainability score is calculated as a weighted average:
\[
\text{Score}_{raw} = 0.4 \times S_{material} + 0.3 \times S_{weight} + 0.3 \times S_{recycle}
\]

Where:
- **\(S_{material}\)** is the material baseline score:
  - Cardboard, Paper, Corrugated: \(100\)
  - Biodegradable Plastic: \(85\)
  - Wood, Bamboo: \(80\)
  - Glass, Metal: \(70\)
  - Recycled Plastic: \(60\)
  - Plastic: \(20\)
  - Styrofoam / EPS: \(0\)
  - Unknown/Other: \(40\)
- **\(S_{recycle}\)** is the recyclability score (defined in Section 4).
- **\(S_{weight}\)** is the gravimetric efficiency score based on the weight ratio \(R_{weight} = \frac{\text{packagingWeight}}{\text{productWeight}}\):
  - If \(R_{weight} \le 0.1\) (packaging is \(\le 10\%\) of product weight): \(S_{weight} = 100.0\)
  - If \(R_{weight} > 0.1\):
    \[
    S_{weight} = \max(0.0, 100.0 - (R_{weight} - 0.1) \times 150.0)
    \]

### Hard Cap for Plastics & Styrofoam
If the packaging material is fossil-fuel based or synthetic (e.g., Plastic, Recycled Plastic, Polyethylene, Bubble Wrap, Styrofoam, EPS), the final sustainability score is capped at **\(50\)**:
\[
\text{sustainabilityScore} = \min(50, \text{round}(\text{Score}_{raw}))
\]
This cap ensures that non-sustainable materials cannot achieve high scores, even if very lightweight.

---

## 2. Packaging Efficiency Score (\(0\text{--}100\))

The efficiency score evaluates both the volumetric utilization and empty space ratio of the package.

### Formula
\[
\text{packagingEfficiencyScore} = \text{round}(0.5 \times S_{volume} + 0.5 \times S_{emptyspace})
\]

Where:
- **\(S_{volume}\)** is the volumetric density score comparing carrier dimensional weight to actual product weight:
  - Let Package Volume \(V_{pkg} = \text{length} \times \text{width} \times \text{height}\) (cm³).
  - Carrier Dimensional Weight \(DimWeight = \frac{V_{pkg}}{5000}\) (kg).
  - Dimension Ratio \(Ratio_{dim} = \frac{DimWeight}{\text{productWeight}}\).
  - If \(Ratio_{dim} \le 1.2\): \(S_{volume} = 100.0\)
  - If \(Ratio_{dim} > 1.2\):
    \[
    S_{volume} = \max(0.0, 100.0 - (Ratio_{dim} - 1.2) \times 50.0)
    \]
- **\(S_{emptyspace}\)** measures the proportion of empty space inside the box:
  - Product Volume is approximated using category density: \(V_{product} = \frac{\text{productWeight} \times 1000}{\rho_{category}}\).
    - Category Densities (\(\rho_{category}\), g/cm³): `Electronics` = 1.5, `Apparel` = 0.3, `Home` = 0.8, `Books` = 1.0, `Food` = 0.9, `Other` = 1.0.
  - Empty Space Ratio: \(EmptySpaceRatio = \max(0.0, 1.0 - \frac{V_{product}}{V_{pkg}})\).
  - If \(EmptySpaceRatio \le 0.3\) (box is filled \(\ge 70\%\)): \(S_{emptyspace} = 100.0\)
  - If \(EmptySpaceRatio > 0.3\):
    \[
    S_{emptyspace} = \max(0.0, 100.0 - (EmptySpaceRatio - 0.3) \times 142.8)
    \]

---

## 3. Carbon Impact Score (\(0\text{--}100\))

The Carbon Impact Score rates the estimated greenhouse gas footprint of the packaging. A higher score represents a **more favorable (lower)** carbon footprint.

### Material Emission Factors (\(EF\))
The score uses standard CO2 emissions (kg CO2 per kg material):
- Styrofoam/EPS: \(3.5\)
- Plastic: \(3.0\)
- Recycled Plastic: \(1.5\)
- Metal: \(2.0\)
- Glass: \(1.2\)
- Biodegradable Plastic: \(1.2\)
- Cardboard/Paper/Corrugated: \(0.9\)
- Wood/Bamboo: \(0.5\)
- Other/Unknown: \(2.0\)

### Formula
Total emissions (kg CO2):
\[
CO_2 = \text{packagingWeight} \times EF
\]

The carbon impact score scales linearly such that a package emitting 5 kg CO2 drops the score to 0:
\[
\text{carbonImpactScore} = \max(0, \text{round}(100.0 - (CO_2 \times 20.0)))
\]

---

## 4. Recyclability Score (\(0\text{--}100\))

Evaluates the circular economy alignment and recyclability:
- Cardboard, Paper: \(100\)
- Bamboo: \(95\)
- Wood: \(90\)
- Glass, Metal: \(80\)
- Recycled Plastic: \(70\)
- Plastic: \(40\)
- Styrofoam/EPS: \(0\)
- Unknown/Other: \(50\)

---

## 5. Confidence Score (\(0.0\text{--}1.0\))

Indicates the level of data trust based on input parameters.
- Base Confidence: \(1.00\)
- Deductions:
  - Unknown/unrecognized material: \(-0.15\)
  - Unknown/unrecognized category: \(-0.05\)
  - Outliers / extreme dimensions (\(productWeight > 100\) kg, or any dimension \(> 100\) cm): \(-0.10\)
- Lower Bound: Capped at a minimum of \(0.10\).
