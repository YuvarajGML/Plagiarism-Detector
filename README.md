# PlagScan Pro — Plagiarism Detection System

> **DAA Elective Project · RVCE Semester 4**  
> Horspool string-matching algorithm for academic plagiarism detection.  
> Includes a full-featured React web interface and a Python CLI tool.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Repository Structure](#-repository-structure)
- [Web App — PlagScan Pro UI](#-web-app--plagscan-pro-ui)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Dev Server](#running-the-dev-server)
  - [Building for Production](#building-for-production)
  - [Features](#features)
- [Python CLI — String Matching Engine](#-python-cli--string-matching-engine)
  - [Prerequisites (Python)](#prerequisites-python)
  - [Usage](#usage)
  - [Algorithms](#algorithms)
  - [Output](#output)
- [Technologies Used](#-technologies-used)

---

## 🔍 Project Overview

PlagScan Pro is a multi-stage plagiarism detection framework built around the **Boyer-Moore-Horspool** string matching algorithm. It benchmarks Horspool against Naive and KMP approaches, demonstrating significant performance gains through bad-character shift tables and fingerprinting.

**Key goals:**
- Speed via preprocessing / shift-table fingerprinting
- Detection of exact *and* near-plagiarism (structural matches)
- Detailed similarity reports with execution time, precision, recall, and F1 metrics

---

## 📁 Repository Structure

```
DAA EL/
├── frontend/               # React + Vite web application (PlagScan Pro UI)
│   ├── src/
│   │   ├── components/     # UI components (Sidebar, DocumentViewer, AnalysisDashboard, …)
│   │   ├── data/           # Mock data & sample documents
│   │   └── App.jsx         # Root application state
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── matching/               # Python string-matching core modules
├── TextFiles/              # Sample corpus documents
├── tests/                  # Unit tests
├── presentation/           # Project slides / report
├── run_match.py            # Main Python CLI entry point
├── run_demo.py             # Quick demo script
├── BoyerMoore.py           # Standalone Boyer-Moore implementation
├── pattern.txt             # Default pattern file
└── results.json            # Latest CLI output (auto-generated)
```

---

## 🖥️ Web App — PlagScan Pro UI

### Prerequisites

| Tool | Version |
|------|---------|
| [Node.js](https://nodejs.org/) | v18 or higher |
| npm | v9 or higher (bundled with Node) |

Verify your installation:

```bash
node -v
npm -v
```

---

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YuvarajGML/Plagiarism-Detector.git
cd Plagiarism-Detector

# 2. Move into the frontend directory
cd frontend

# 3. Install dependencies
npm install
```

---

### Running the Dev Server

```bash
# From the /frontend directory:
npm run dev
```

The app will start at **http://localhost:3000** and supports Hot Module Replacement (HMR) — any saved changes reflect instantly in the browser.

---

### Building for Production

```bash
# From the /frontend directory:
npm run build
```

The optimised bundle is output to `frontend/dist/`. To preview the production build locally:

```bash
npm run preview
```

---

### Features

| Feature | Description |
|---------|-------------|
| **Three-panel layout** | Sidebar · Document Viewer · Analysis Dashboard |
| **Algorithm selector** | Switch between Naive, KMP, Horspool, or Compare All |
| **Explicit panel loading** | Use **L** / **R** buttons on each file card to load into left or right viewer |
| **Drag & drop upload** | Drop `.txt`, `.pdf`, `.docx`, `.py`, `.java` files onto the sidebar |
| **Clear queue** | Remove all files from the queue instantly |
| **Live similarity ring** | Animated progress ring showing similarity % during analysis |
| **Match highlights** | Color-coded inline highlights (Exact / Near / Structural) with tooltips |
| **Benchmark chart** | Recharts bar graph comparing algorithm execution times |
| **Shift table grid** | Visualises Horspool's bad-character shift table for the current pattern |
| **Similarity matrix** | Heatmap of pairwise similarity scores across all loaded documents |
| **Collapsible console** | Bottom log bar collapses to a status ticker; expands to full log view |
| **Export reports** | Download results as PDF, JSON, or CSV |

### Test_2 Upgrades — Beyond Pairwise Comparison

| Upgrade | What it adds |
|---------|--------------|
| **Source Radar** | Ranks likely web, academic, and cross-language source candidates for the suspect document. |
| **Corpus Fingerprint Index** | Computes the similarity matrix from queued document content instead of fixed demo values. |
| **Citation Trust Layer** | Checks whether detected source candidates are cited, missing, or unsupported by a reference section. |
| **Cross-Language Similarity Probe** | Uses lightweight multilingual normalization to flag translated reuse signals in-browser. |
| **Evidence-First Reports** | Includes external source confidence, URL, detection mode, and citation status in JSON/CSV/PDF exports. |

The upgrades preserve the original left/right document comparison, highlighting, benchmark, shift-table, upload, logging, matrix, and export features. They add an in-browser source-intelligence layer in `frontend/src/utils/sourceIntel.js` and a dashboard panel in `frontend/src/components/SourceIntelPanel.jsx`.

---

## 🐍 Python CLI — String Matching Engine

### Prerequisites (Python)

| Tool | Version |
|------|---------|
| Python | 3.9 or higher |

No additional packages required — uses only the Python standard library.

---

### Usage

**Run Horspool in sentence mode (default):**

```bash
python run_match.py TextFiles pattern.txt --algo horspool --mode sentence --threshold 0.7
```

**Run fuzzy sentence matching (difflib):**

```bash
python run_match.py TextFiles pattern.txt --algo fuzzy --mode sentence --threshold 0.65
```

**Run exact substring check:**

```bash
python run_match.py TextFiles pattern.txt --algo exact --mode exact
```

**Quick demo with bundled sample files:**

```bash
python run_demo.py
```

---

### Algorithms

| Flag | Algorithm | Description |
|------|-----------|-------------|
| `horspool` | Boyer-Moore-Horspool | Uses bad-character shift table; sub-linear average case |
| `kmp` | Knuth-Morris-Pratt | Failure-function based; linear worst case |
| `naive` | Brute-force | Slides pattern one character at a time |
| `exact` | Exact substring | Simple `in` check for quick sanity tests |
| `fuzzy` | difflib SequenceMatcher | Near-match / paraphrase detection |

---

### Output

- Results are printed to the console with per-file similarity percentages.
- A `results.json` file is written to the project root:

```json
{
  "file.txt": 73.4,
  "another.txt": 12.1
}
```

---

## 🛠️ Technologies Used

**Web Interface**
- [React 18](https://react.dev/) — component-based UI
- [Vite](https://vitejs.dev/) — lightning-fast dev server & bundler
- [Tailwind CSS 3](https://tailwindcss.com/) — utility-first styling
- [Recharts](https://recharts.org/) — benchmark visualisations
- [Lucide React](https://lucide.dev/) — icon set

**Python Engine**
- Python 3 standard library (`re`, `difflib`, `json`, `os`, `argparse`)
- Boyer-Moore-Horspool implementation (`matching/`)

---

> Made with ❤️ by the DAA EL Team · RVCE · 2024–25
