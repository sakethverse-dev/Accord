# PactFlow | Collaborative Contract Risk & Negotiation Room

> **End-Term Software Engineering Project Submission**  
> An interactive legal risk auditing and collaborative redline negotiation platform connecting freelancers and clients.

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
**PactFlow** provides a shared **Agreement Room** where both parties meet:
1. **Automated Policy Audit:** The contract is ingested and parsed into distinct clauses, and our deterministic rule engine audits each clause against both parties' safety policies.
2. **Quantified Alignment Score:** The platform computes a mathematical Alignment & Risk Score (0–100%) highlighting critical conflicts in red and warnings in amber.
3. **Collaborative Consensus Protocol:** Either party can propose standard compromise clauses with word-level strikethrough/highlight diffs. The counter-party accepts or counters in 1-click, updating the text and score dynamically.
4. **Dual Digital Signatures & Cryptographic Seal:** Once terms are aligned, both parties execute the agreement with legal affirmations. The document is sealed with a **SHA-256 cryptographic checksum** and locked permanently in the database.

---

## 4. Why PactFlow is Engineered Beyond Basic CRUD & AI Wrappers

| Evaluation Criteria | Naive / Disqualified Approach | PactFlow Engineering Implementation |
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

PactFlow features an **embedded in-memory MongoDB fallback**, meaning **evaluators do not need to install or configure MongoDB to run and test the project!**

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

* Backend API will run on: `http://localhost:5000`
* Frontend App will run on: `http://localhost:5173`

> **Note for Evaluators:** The server automatically seeds two ready-to-test demo accounts:
> * 👨‍💻 **Freelancer:** `freelancer@pactflow.dev` | Password: `password123`
> * 🏢 **Client:** `client@pactflow.dev` | Password: `password123`
> You can also click the **1-Click Demo Login** buttons on the sign-in page!

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

1. **Minute 1: The Problem & Policy Setup**
   * Log in as **Alex Rivera (Freelancer)**.
   * Open the **Policy Preferences** page: Show Alex's strict rules (Maximum payment window: Net-30; Liability capped at 1x contract fees; Strict ban on non-compete clauses).
2. **Minute 2: Contract Ingestion & Automated Risk Audit**
   * Return to Dashboard and click **"⚡ 1-Click Load Evaluator Demo Contract"**.
   * Show the Agreement Room: The system instantly flags **3 Critical Conflicts** (Net-90 payment, Unlimited liability, and an 18-month Non-compete).
   * Show the Risk Meter: Alignment Score starts at **40% (High Risk Blocked)**.
3. **Minute 3: Collaborative Amendment & Live Diff**
   * Click **"⚡ Propose Safe Compromise"** on Section 2 (Payment Terms).
   * Notice how the policy engine auto-fills the standard compromise ("Invoices payable within Net-30"). Click **"Submit Amendment"**.
   * Use the top navbar demo switcher to switch to **Sarah Chen (Client)**.
   * As Sarah, view the pending amendment, click **"Inspect Diff"** to show the word-level strikethrough/addition tokens, and click **"Accept Amendment"**.
   * Watch the clause turn green and the Alignment Score jump!
4. **Minute 4: Dual E-Signature & Cryptographic Seal**
   * Sarah clicks **"Sign Agreement"**, checks the legal affirmation, and signs.
   * Switch back to Alex and sign as well.
   * Status updates to **"🔒 Fully Executed & Sealed"**.
   * Click **"View Cryptographic Certificate"**: Show the SHA-256 document checksum, verified signatures, and click **"Verify Cryptographic Integrity"** to demonstrate live tamper detection!

---

## 10. Security & Legal Considerations
* **No Plaintext Passwords:** All credentials hashed with `bcryptjs` (salt rounds = 10).
* **Stateless JWT Authorization:** Secured endpoints with token verification and role checks.
* **Legal Intent Affirmation:** Meets the legal requirements of the US ESIGN Act and international e-signature frameworks by requiring affirmative declaration of intent to be bound.
* **Document Immutability:** Once an agreement is executed by both parties, API controllers permanently reject any mutation requests.
