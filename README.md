# Accord | Collaborative Contract Risk & Negotiation Room

> **End-Term Software Engineering Project Submission**  
> An institutional legal risk auditing, bilateral redline negotiation, and cryptographic tamper-evident consensus platform connecting freelancers and enterprises.

**Live Application:** [https://accord-zwby.onrender.com](https://accord-zwby.onrender.com)  
**GitHub Repository:** [https://github.com/sakethverse-dev/Accord](https://github.com/sakethverse-dev/Accord)  

| Role | Email | Password |
| :--- | :--- | :--- |
| **Contractor (Party A)** | `saketh@gmail.com` | `saketh123` |
| **Enterprise Client (Party B)** | `client@apexinnovations.com` | `client123` |

---

## 1. Problem Statement
Every freelancer, independent contractor, and small agency regularly signs client agreements (Master Service Agreements, NDAs, Subcontractor Contracts). Without the budget for $400/hour legal counsel, contractors frequently sign contracts containing **predatory terms**:
* **Unlimited Liability:** Exposing individual developers to catastrophic financial lawsuits exceeding the total project value.
* **Unreasonable Payment Windows:** Net-90 or "Pay-when-paid" clauses that subordinate contractor payroll to third-party collections.
* **Aggressive Non-Competes:** Barring developers from taking work in their domain or industry for years.
* **Immediate IP Transfers:** Forfeiting ownership of code before invoices are paid in full.

Traditional document workflows involve dozens of fragmented emails with confusing Word redlines, causing weeks of delay or contractors signing dangerous terms out of exhaustion.

---

## 2. Target Users
1. **Freelancers & Independent Contractors:** Need to protect cash flow, intellectual property, and personal liability before starting work.
2. **Clients & Hiring Organizations:** Need clear, transparent terms, verified intellectual property assignments, and fast agreement execution without weeks of administrative friction.

---

## 3. The Solution
**Accord** provides a shared, high-security **Agreement Room** where both parties meet:
1. **Automated Policy Audit:** The contract is ingested and parsed into distinct clauses, and our deterministic rule engine audits each clause against both parties' safety policies.
2. **Quantified Alignment Score:** The platform computes a mathematical Alignment & Risk Score (0–100%) highlighting critical conflicts in red and warnings in amber.
3. **Collaborative Consensus Protocol:** Either party can propose standard compromise clauses with word-level strikethrough/highlight diffs. The counterparty accepts or counters in 1-click, updating the text and score dynamically.
4. **Dual Digital Signatures & Cryptographic Seal:** Once terms are aligned, both parties execute the agreement with legal affirmations. The document is sealed with a **SHA-256 cryptographic checksum** and locked permanently in the database.

---

## 4. Why Accord is Engineered Beyond Basic CRUD & AI Wrappers

| Evaluation Criteria | Naive / Disqualified Approach | Accord Engineering Implementation |
|---|---|---|
| **Application Logic** | Simple "Create, Read, Update, Delete" form | **Multi-Party Consensus State Machine:** `DRAFT` $\to$ `AUDITED` $\to$ `IN_NEGOTIATION` $\to$ `ALIGNED` $\to$ `PARTIALLY_SIGNED` $\to$ `FULLY_EXECUTED_LOCKED`. Neither party can unilaterally alter terms without counterparty consensus. |
| **Policy Engine** | Dumping text into an LLM prompt | **Deterministic Rule Engine (`policyEngine.js`):** Pure software logic that extracts parameters (payment days, liability caps, IP conditions) and tests them against numerical thresholds and user safety policies. |
| **Risk Scoring** | Arbitrary or hardcoded score | **Mathematical Scoring Formula (`riskCalculator.js`):** Weighted risk deduction penalty matrix ($100 - \sum \text{Severity} \times \text{Weight}$) that dynamically recalculates as amendments are accepted. |
| **Document Integrity** | Static database record | **Cryptographic Tamper-Evident Seal (`cryptoSeal.js`):** Generates a canonical SHA-256 hash across all finalized clauses and signer metadata. Re-verifiable at any time with database immutability. |
| **Diff Engine** | Showing plain new text | **Word-Level Token Diff (`diffEngine.js`):** Longest Common Subsequence (LCS) algorithm rendering precise strikethrough additions and deletions. |

---

## 5. Technology Stack

* **Frontend:** React 18, Vite, Modern Vanilla CSS Design System (Glassmorphism, dark obsidian palette, micro-animations, accessible contrast).
* **Backend:** Node.js, Express.js (RESTful API, modular controllers, services, middleware).
* **Database:** MongoDB & Mongoose (with automated in-memory fallback for zero-configuration local evaluation).
* **Security & Auth:** JSON Web Tokens (JWT), `bcryptjs` password hashing, Role-Based Access Control (`freelancer` | `client`).
* **Cryptography:** Node.js `crypto` (SHA-256 canonical hashing).
* **Icons:** `lucide-react`.

---

## 6. Architecture & System Flow

```text
[ Freelancer Policy ]              [ Client Policy ]
       │                                   │
       └──────────────┬────────────────────┘
                      ▼
            [ Agreement Ingestion ]
          (PDF or Sample Generator)
                      │
                      ▼
         [ Deterministic Policy Engine ]
       (Clause Parameter & Risk Matching)
                      │
                      ▼
          [ Mathematical Risk Scoring ]
       (0-100% Dynamic Alignment Metric)
                      │
                      ▼
        [ Collaborative Negotiation ]
   (Propose Amendment <───> Accept / Counter)
            (LCS Word-Level Diff)
                      │
                      ▼
        [ Dual Electronic Signatures ]
       (Legal Intent & Signer Metadata)
                      │
                      ▼
        [ SHA-256 Cryptographic Seal ]
         (Database Immutability Lock)
                      │
                      ▼
      [ Tamper-Evident Audit Certificate ]
```

---

## 7. Local Setup & Quick Start

Accord connects directly to MongoDB Atlas or falls back to an embedded in-memory MongoDB instance for zero-configuration local evaluation.

### Prerequisites
* Node.js v18+ (tested on v24)
* npm v9+

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd MERNPRO
   ```

2. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

3. **Start both Backend and Frontend concurrently:**
   ```bash
   npm run dev
   ```

* Backend API runs on: `http://localhost:5000`
* Frontend App runs on: `http://localhost:5173`

> **Note for Users & Evaluators:** Create your own personal account using the **Create Account** tab on the sign-in screen, or load one of the **Standard Legal Templates** (MSA, Freelance Agreement, or NDA) to begin a contract audit and negotiation session.

---

## 8. Environment Variables

The project includes pre-configured `.env.example` templates:

### `server/.env`
```env
PORT=5000
NODE_ENV=development
# Leave blank to use embedded in-memory MongoDB, or supply a MongoDB Atlas URI
MONGODB_URI=
JWT_SECRET=pactflow_dev_super_secret_jwt_key_change_in_production_2026
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

---

## 9. 3–5 Minute Demo Video Walkthrough Script

1. **Minute 1: Identity & Safety Policy Setup**
   * Register or log in to **Accord**.
   * Open the **Policy Preferences** page: Configure strict safety guidelines (Maximum payment window: Net-30; Liability capped at 1x contract fees; Strict ban on non-compete clauses; 14-day warranty).
2. **Minute 2: Contract Ingestion & Automated Risk Audit**
   * Return to Dashboard and open a pre-vetted **Standard Legal Template** (e.g. Master Software Services Agreement) or paste a custom contract.
   * View the Agreement Room: The deterministic policy engine and AI risk auditor evaluate each clause against safety policies and calculate a dynamic **Alignment & Risk Score (0-100%)**.
3. **Minute 3: Collaborative Amendment & Live LCS Diff**
   * Propose a safe compromise clause on flagged sections (e.g. payment terms or liability cap).
   * Counterparty inspects the word-level strikethrough/addition diff and accepts or counter-proposes.
   * Watch the clause update in real-time and the Alignment Score recalculate.
4. **Minute 4: Dual E-Signature & Cryptographic Seal**
   * Both parties execute the agreement with legal affirmations (supporting both **Draw** and **Type** signature modes).
   * Once fully signed, the agreement is locked as **"Fully Executed & Sealed"**.
   * View the **Cryptographic Audit Certificate**: Inspect the canonical SHA-256 document checksum and verify live tamper-evidence.

---

## 10. Security & Legal Considerations
* **No Plaintext Passwords:** All credentials hashed with `bcryptjs` (salt rounds = 10).
* **Stateless JWT Authorization:** Secured endpoints with token verification and role checks.
* **Legal Intent Affirmation:** Meets the legal requirements of the US ESIGN Act and international e-signature frameworks by requiring affirmative declaration of intent to be bound.
* **Document Immutability:** Once an agreement is executed by both parties, API controllers permanently reject any mutation requests.
