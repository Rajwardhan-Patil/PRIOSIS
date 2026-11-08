# PRIORIS: AI-Powered Climate Disaster Response Decision-Support System

> **Predictive Response & Operational Intelligence for Resilient Incident Systems**  
> *Smarter priorities. Safer communities.*

PRIORIS is an AI-assisted disaster-response decision-support platform designed for emergency incident coordinators during climate-induced urban flood crises. By deterministically fusing hazard severity, population exposure, social vulnerability, arterial accessibility, and resource scarcity, PRIORIS enables emergency management centers to rapidly prioritize affected wards, dispatch specialized rescue assets, and autonomously recalculate safe transit corridors around inundated roads.

---

## 1. Mathematical Risk-Prioritization Algorithm

The core prioritization engine operates on a deterministic, normalized 5-factor multi-criteria model:

$$\text{Risk Score} = (\text{Hazard} \times 0.35) + (\text{Exposure} \times 0.25) + (\text{Vulnerability} \times 0.20) + (\text{Accessibility Risk} \times 0.10) + (\text{Resource Scarcity} \times 0.10)$$

All input factors and the composite score are normalized to a **0–100 scale**.

### Factor Definitions & Weights

| Factor | Weight | Parameter Description & Inputs |
| :--- | :---: | :--- |
| **Hazard Severity** | **35%** | Active water depth, flood gauge telemetry, rainfall rate (mm/hr), and dam discharge volume. |
| **Population Exposure** | **25%** | Ward census count, spatial population density, and geographic proximity to Mutha/Mula riverbanks. |
| **Social Vulnerability** | **20%** | Elderly & pediatric demographic ratio, slum/kaccha housing density, and localized drainage deficits. |
| **Accessibility Risk** | **10%** | Arterial road submergence, bridge status (e.g., Baba Bhide causeway), and physical evacuation isolation. |
| **Resource Scarcity** | **10%** | Deficit of unassigned swift-water boats, SDRF/NDRF rescue units, ambulances, and shelter beds. |

### Classification Tiers

- **Critical:** $\ge 75.0$ (Immediate life-safety threat; targeted siren evacuation & swift-water boats)
- **High:** $55.0 - 74.99$ (Pre-position ALS ambulances and mobile dewatering pumps)
- **Moderate:** $35.0 - 54.99$ (Active telemetry monitoring & community shelter standby)
- **Low:** $< 35.0$ (Passive sensor surveillance)

*Note: These weights and thresholds represent an exploratory prototype model built for evaluation, subject to civil defense calibration.*

---

## 2. Technical System Architecture

- **Dual Visual Modes (Dark & White):** Seamless 1-click toggle between neutral dark gray (optimized for 24/7 dark emergency operations centers) and high-contrast white mode (optimized for bright daylight field tablets), with automatic Carto Voyager tile filter adaptation and persistent `localStorage` preference. Switch via top bar or press <kbd>T</kbd>.

```
                    ┌────────────────────────────────────────────────────────┐
                    │               PRIORIS FRONTEND INTERFACE               │
                    │  (React 19 + TypeScript + Tailwind CSS + Lucide Icons) │
                    └──────────────────────────┬─────────────────────────────┘
                                               │
               ┌───────────────────────────────┼───────────────────────────────┐
               ▼                               ▼                               ▼
    ┌──────────────────────┐      ┌─────────────────────────┐     ┌────────────────────────┐
    │  Operations Command  │      │  Incident Explorer &    │     │  Risk Analysis Lab &   │
    │  & Master Queue      │      │  Field Telemetry        │     │  Sensitivity Scrubber  │
    └──────────┬───────────┘      └────────────┬────────────┘     └───────────┬────────────┘
               │                               │                              │
               └───────────────────────┬───────┴──────────────────────────────┘
                                       │
                                       ▼
                   ┌────────────────────────────────────────┐
                   │       CENTRAL INCIDENT CONTEXT         │
                   │    (Reactive State & Event Ledger)     │
                   └───────┬────────────────────────┬───────┘
                           │                        │
         ┌─────────────────┴────────┐      ┌────────┴─────────────────┐
         ▼                          ▼      ▼                          ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Deterministic    │    │ Bidirectional    │    │ Multi-Criteria   │    │ Explainable AI   │
│ Risk Engine      │    │ Dijkstra Routing │    │ Resource Matcher │    │ Natural Language │
│ (riskEngine.ts)  │    │ (routingEngine)  │    │ (resourceEngine) │    │ Assistant        │
└────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘
         │                       │                       │                       │
         └───────────────────────┼───────────────────────┴───────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │  DATA INGESTION LAYER   │
                    │  (dataSourceService.ts) │
                    └────────────┬────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Open-Meteo API   │    │ OpenStreetMap    │    │ USGS Seismic API │
│ (Live Weather)   │    │ (Carto Tiles)    │    │ (Live Hazards)   │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

---

## 3. NuGen AI Tactical Integration

PRIORIS integrates a lightweight, purposeful LLM layer powered by **NuGen AI (`Qwen/Qwen2.5-0.5B-Instruct`)** to provide tactical natural-language synthesis without compromising deterministic mathematical risk scoring:

- **Endpoint:** `https://api.nugen.in/api/v3/inference/chat/completions`
- **Model:** `Qwen/Qwen2.5-0.5B-Instruct`
- **Capabilities:**
  1. **Tactical Operational Directive Synthesis:** In the *Command* console, clicking `NuGen AI` synthesizes a real-time, concise 2-sentence operational briefing combining the worst ward's risk factors, active Khadakwasla spillway discharge, and impassable causeway detours.
  2. **NuGen Tactical Advisor Modal:** Accessible via the top bar `NuGen` chip or by pressing <kbd>N</kbd>. Provides duty officers with rapid situational SitReps, evacuation safety protocols for vulnerable populations, and corridor clearance guidance.
  3. **Deterministic Fallback:** If internet connectivity drops or inference times out, the system automatically falls back to deterministic rule-based directives with zero disruption to control-room workflows.

---

## 4. Data Ingestion: Live Integrations vs. Simulated Components

To ensure complete transparency, PRIORIS distinguishes between real-world live APIs and simulated scenario baselines:

| Data Component | Provenance | Protocol / Provider | Status |
| :--- | :--- | :--- | :---: |
| **Pune Weather Telemetry** | **LIVE EXTERNAL API** | Open-Meteo ECMWF/GFS Model (18.52°N, 73.85°E) | **LIVE** |
| **Cartographic Basemap** | **LIVE TILES** | OpenStreetMap / CartoDB Voyager | **LIVE** |
| **Global Seismic Monitoring** | **LIVE EXTERNAL API** | USGS Earthquake Hazards Feed (GeoJSON) | **LIVE** |
| **Urban Flood Incidents** | **SIMULATED SCENARIO** | Fictional Pune monsoon flood scenarios | **SIMULATED** |
| **Khadakwasla Dam Spillway** | **SIMULATED SCENARIO** | Mutha basin discharge gauge telemetry | **SIMULATED** |
| **Emergency Units & Shelters** | **SIMULATED SCENARIO** | Synthetic NDRF, SDRF, ALS ambulance staging | **SIMULATED** |

---

## 4. Evaluator Walkthrough (8-Step Demo Sequence)

A judge can evaluate the full system using the docked **Evaluation Tour** bar:

1. **Inspect Initial Priority Queue:** Open the *Operations Command* dashboard. Observe Kasba Peth (Old City) ranked **#1 Critical** (Risk: 82.2/100) due to river proximity and high demographic exposure.
2. **Inspect Factor Breakdown:** Navigate to *Risk Analysis*. Review the 5-factor radar geometry and the weighted points contribution bar chart.
3. **Inject Cloudburst Incident:** Click *Inject Cloudburst Incident* (or create one in *Incident Explorer*). A simulated 115mm/hr cloudburst is reported at Paud Road in Kothrud (Ward 18).
4. **Observe Dynamic Re-Ranking:** Return to *Operations Command*. Kothrud's hazard score immediately spikes from 44 to 88+, causing Kothrud to jump into the Critical tier.
5. **Match & Dispatch Rescue Unit:** Navigate to *Resource Allocation*. Inspect the AI suitability match and click **Dispatch Asset** to deploy NDRF Boat Team 1 to Kothrud, instantly reducing its resource scarcity index.
6. **Simulate Arterial Road Blockage:** In *Route Replanning*, toggle Karve Road (Kothrud $\to$ Deccan arterial) as **Impassable** (85cm waterlogging).
7. **Verify Dijkstra Rerouting:** The graph pathfinding engine immediately severs the flooded corridor (displayed as a red dashed line) and generates a safe bypass detour highlighted in emerald green (+1.8 km, +4 mins).
8. **Audit Trail Review:** Verify the tamper-evident audit ledger capturing all events with exact timestamps.

---

## 5. Local Setup & Verification

### Prerequisites
- Node.js v18+ (tested on Node v24.16.0)
- npm v9+

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/your-username/prioris-mvp.git
cd prioris-mvp

# Install dependencies
npm install

# Run the 16-test deterministic verification suite
npm test

# Launch the development server
npm run dev

# Build the production bundle
npm run build

# Preview the production bundle locally
npm run preview
```

---

## 6. System Governance & Responsible Use

- **Human-in-the-Loop:** PRIORIS provides decision support; it never autonomously commands units or issues evacuation orders.
- **Official Hierarchy:** Does not supersede India's **112** emergency hotline, **NDMA SACHET**, or **IMD** weather bulletins.
- **Experimental Heuristics:** Prototype algorithm built for the PRIOSIS Round 2 Hackathon (*AI for Climate Change*).
