/**
 * PactFlow Multi-Draft Clause Reconciliation Engine
 * Compares Party A Draft vs Party B Draft, detects conflicting terms,
 * calculates token diffs, and synthesizes fair AI compromise terms.
 */

const { computeWordDiff } = require('./diffEngine');
const { parseRawContractText, SAMPLE_CONTRACT } = require('./clauseExtractor');

// Predefined balanced compromise synthesis rules
const COMPROMISE_PATTERNS = {
  PAYMENT: {
    detect: (text) => /(?:net[- ]?\d+|payment|invoice|milestone|paid when paid)/i.test(text),
    synthesize: (textA, textB) => {
      // Extract days from both
      const matchA = textA.match(/net[- ]?(\d+)/i) || textA.match(/(\d+)\s*(?:days|calendar days)/i);
      const matchB = textB.match(/net[- ]?(\d+)/i) || textB.match(/(\d+)\s*(?:days|calendar days)/i);
      const daysA = matchA ? parseInt(matchA[1], 10) : 15;
      const daysB = matchB ? parseInt(matchB[1], 10) : 90;

      // Fair compromise: Net-30 with milestone verification
      return 'Contractor shall invoice Client upon completion of agreed milestone deliverables. All undisputed invoices shall be payable by Client within thirty (30) calendar days (Net-30) of receipt, independent of any third-party payment clearances.';
    },
    reason: 'Payment Terms Discrepancy: Party A and Party B specified conflicting payment windows or contingency clauses.',
  },
  LIABILITY: {
    detect: (text) => /(?:liability|indemnif|hold harmless|consequential damages)/i.test(text),
    synthesize: (textA, textB) => {
      return "In no event shall either party's total aggregate liability arising out of or related to this Agreement exceed two times (2x) the total fees paid or payable under this Agreement, except in cases of gross negligence, willful misconduct, or breach of confidentiality.";
    },
    reason: 'Liability Exposure Discrepancy: Conflicting caps between unlimited indemnity and restricted fee-based ceilings.',
  },
  IP_OWNERSHIP: {
    detect: (text) => /(?:intellectual property|work made for hire|copyright|ownership|proprietary)/i.test(text),
    synthesize: (textA, textB) => {
      return 'Upon receipt of full and final payment for each completed milestone, Contractor assigns to Client all worldwide copyright, title, and intellectual property rights in the bespoke deliverables created under that milestone, while Contractor retains all rights in pre-existing developer tooling and open-source libraries.';
    },
    reason: 'Intellectual Property Timing Discrepancy: Conflict between immediate inception assignment versus transfer upon receipt of payment.',
  },
  NON_COMPETE: {
    detect: (text) => /(?:non-compete|restrictive covenant|exclusive|not engage with)/i.test(text),
    synthesize: (textA, textB) => {
      return 'Contractor provides professional services as an independent contractor and reserves the right to perform services for other non-competing clients, provided Contractor strictly maintains Client proprietary confidentiality and does not solicit Client full-time personnel during the active project term.';
    },
    reason: 'Market Exclusivity Conflict: Party B sought post-termination non-compete restrictions, conflicting with independent contractor policy.',
  },
  WARRANTY: {
    detect: (text) => /(?:warranty|defect|bug fix|guarantee|remediation)/i.test(text),
    synthesize: (textA, textB) => {
      return 'Contractor warrants that for a period of thirty (30) calendar days following formal production acceptance, all deliverables shall substantially perform in accordance with agreed specifications. Contractor shall remediate critical reproducible defects within this warranty period at no additional charge.';
    },
    reason: 'Defect Remediation Window: Conflict between extended free maintenance requirements and limited bug warranty terms.',
  },
  SCOPE: {
    detect: (text) => /(?:scope|deliverable|specification|sow|milestone)/i.test(text),
    synthesize: (textA, textB) => {
      return 'Contractor shall perform custom development services and deliver architecture milestones as specified in the agreed Statement of Work. Any material modifications or additional features outside the baseline SOW shall be documented via a written Change Order signed by both parties.';
    },
    reason: 'Scope of Work Clarification: Defining formal change-order mechanics for scope alterations.',
  },
};

function detectSemanticCategory(text) {
  const lower = (text || '').toLowerCase();
  if (/(?:payment|invoice|net[- ]?\d+|milestone|fee|remuneration|paid when paid|billing)/i.test(lower)) {
    return 'PAYMENT';
  }
  if (/(?:liability|indemnif|hold harmless|consequential damages|aggregate liability|direct damages|monetary cap)/i.test(lower)) {
    return 'LIABILITY';
  }
  if (/(?:intellectual property|work made for hire|work-for-hire|copyright|patent|trade secret|ownership|vests|deliverables.*assign)/i.test(lower)) {
    return 'IP_OWNERSHIP';
  }
  if (/(?:non-compete|non-solicit|restrictive covenant|competitive|exclusive|not engage with)/i.test(lower)) {
    return 'NON_COMPETE';
  }
  if (/(?:warranty|defect|bug|remediation|remedy|guarantee|specifications)/i.test(lower)) {
    return 'WARRANTY';
  }
  if (/(?:confidential|non-disclosure|nda|proprietary information)/i.test(lower)) {
    return 'CONFIDENTIALITY';
  }
  if (/(?:governing law|jurisdiction|dispute|arbitration|mediation|courts)/i.test(lower)) {
    return 'DISPUTE';
  }
  if (/(?:scope|deliverable|sow|milestone schedule|statement of work|services)/i.test(lower)) {
    return 'SCOPE';
  }
  return 'GENERAL';
}

/**
 * Compare Draft A vs Draft B and generate reconciled clause set
 */
function reconcileDrafts(draftAText, draftBText) {
  const clausesA = parseRawContractText(draftAText || '').map(c => ({
    ...c,
    category: c.category && c.category !== 'GENERAL' ? c.category : detectSemanticCategory(c.currentText || c.originalText),
  }));

  const clausesB = parseRawContractText(draftBText || '').map(c => ({
    ...c,
    category: detectSemanticCategory(c.currentText || c.originalText),
  }));

  const reconciledClauses = [];
  const differences = [];

  // Match clauses by category or index
  const usedBIndices = new Set();

  clausesA.forEach((clauseA, indexA) => {
    // 1. Attempt exact semantic category matching (handles unstructured ordering)
    let matchedClauseB = null;
    let matchIndexB = -1;

    for (let j = 0; j < clausesB.length; j++) {
      if (usedBIndices.has(j)) continue;
      const clauseB = clausesB[j];
      if (clauseB.category === clauseA.category && clauseA.category !== 'GENERAL') {
        matchedClauseB = clauseB;
        matchIndexB = j;
        break;
      }
      if (clauseB.title && clauseA.title && clauseB.title.toLowerCase() === clauseA.title.toLowerCase()) {
        matchedClauseB = clauseB;
        matchIndexB = j;
        break;
      }
    }

    if (!matchedClauseB && indexA < clausesB.length && !usedBIndices.has(indexA)) {
      matchedClauseB = clausesB[indexA];
      matchIndexB = indexA;
    }

    if (matchedClauseB) {
      usedBIndices.add(matchIndexB);
    }

    const textA = (clauseA.currentText || clauseA.originalText || '').trim();
    const textB = matchedClauseB ? (matchedClauseB.currentText || matchedClauseB.originalText || '').trim() : '';

    const hasDifference = textB !== '' && textA !== textB;
    const diffTokens = hasDifference ? computeWordDiff(textA, textB) : [];

    // Synthesize compromise
    let compromiseText = clauseA.suggestedReplacement || '';
    let conflictReason = '';

    const category = clauseA.category || 'GENERAL';
    if (hasDifference) {
      if (COMPROMISE_PATTERNS[category]) {
        compromiseText = COMPROMISE_PATTERNS[category].synthesize(textA, textB);
        conflictReason = COMPROMISE_PATTERNS[category].reason;
      } else {
        compromiseText = textA;
        conflictReason = `Draft Discrepancy in "${clauseA.title}": Party A and Party B submitted contrasting wording.`;
      }

      differences.push({
        clauseId: clauseA.clauseId,
        category,
        title: clauseA.title,
        partyATerm: textA,
        partyBTerm: textB,
        diffTokens,
        compromiseRecommendation: compromiseText,
        reason: conflictReason,
        status: 'FLAGGED',
      });
    }

    reconciledClauses.push({
      clauseId: clauseA.clauseId,
      sectionNumber: clauseA.sectionNumber || `Section ${indexA + 1}`,
      title: clauseA.title,
      category,
      originalText: textA,
      currentText: textA,
      partyAText: textA,
      partyBText: textB || textA,
      hasDraftConflict: hasDifference,
      diffTokens,
      riskLevel: hasDifference ? (['PAYMENT', 'LIABILITY', 'IP_OWNERSHIP', 'NON_COMPETE'].includes(category) ? 'CRITICAL' : 'WARNING') : 'SAFE',
      riskReason: conflictReason,
      suggestedReplacement: compromiseText,
      status: hasDifference ? 'PROPOSED' : 'RESOLVED',
    });
  });

  return {
    clauses: reconciledClauses,
    differences,
    totalDifferences: differences.length,
  };
}

// Sample Organization Counter-Draft for testing/demonstration
const ORGANIZATION_COUNTER_DRAFT = `Section 1. Scope of Services & Deliverables
Contractor shall perform full-stack software development and infrastructure services. Client reserves the right to request reasonable scope adjustments at any time during milestone delivery without additional cost.

Section 2. Invoicing & Payment Schedule
Contractor shall submit monthly invoices. Invoices shall be payable within ninety (90) calendar days (Net-90) from written acceptance, provided that Client's enterprise customer has transferred corresponding project disbursements.

Section 3. Limitation of Liability & Indemnification
Contractor agrees to indemnify and hold harmless Client against any system downtime, third-party claims, or lost revenues without monetary limitation or ceiling.

Section 4. Intellectual Property & Ownership Assignment
All deliverables and code created by Contractor shall be deemed work-for-hire, with all worldwide intellectual property rights and copyrights transferring immediately to Client upon creation, prior to invoice settlement.

Section 5. Restrictive Covenants & Non-Compete
Contractor agrees not to provide software consulting services to any entity in Client's competitive sector for a period of twelve (12) months following contract conclusion.

Section 6. Warranty & Defect Remediation
Contractor warrants that deliverables shall remain bug-free for six (6) months following release, and Contractor shall provide prompt defect remediation at no charge.

Section 7. Confidentiality & Non-Disclosure
Both parties shall hold all disclosed technical, commercial, and financial information in strict confidence.

Section 8. Governing Law & Dispute Resolution
This Agreement shall be governed by Delaware commercial law, with binding arbitration in Wilmington, Delaware.`;

/**
 * AI-First Multi-Draft Reconciliation powered by Gemini
 */
async function reconcileDraftsAsync(draftAText, draftBText, creatorRole = 'freelancer', invitedRole = 'client') {
  try {
    const { analyzeAndReconcileDraftsWithAI } = require('./geminiAiService');
    const aiResult = await analyzeAndReconcileDraftsWithAI(draftAText, draftBText, creatorRole, invitedRole);

    if (aiResult && Array.isArray(aiResult.clauses) && aiResult.clauses.length > 0) {
      const reconciledClauses = [];
      const differences = [];

      aiResult.clauses.forEach((c, idx) => {
        const clauseId = `clause-${idx + 1}`;
        const textA = (c.partyAText || c.currentText || '').trim();
        const textB = (c.partyBText || '').trim();
        const hasDiff = (textB !== '' && textA !== textB) || (c.riskLevel && c.riskLevel !== 'SAFE') || Boolean(c.suggestedReplacement && c.riskReason);
        const diffTokens = hasDiff && textB !== '' && textA !== '' ? computeWordDiff(textA, textB) : [];

        const clauseObj = {
          clauseId,
          sectionNumber: c.sectionNumber || `Section ${idx + 1}`,
          title: c.title || `Clause ${idx + 1}`,
          category: c.category || 'GENERAL',
          originalText: textA || c.currentText || '',
          currentText: textA || c.currentText || '',
          partyAText: textA || c.currentText || '',
          partyBText: textB || textA || c.currentText || '',
          hasDraftConflict: hasDiff,
          diffTokens,
          riskLevel: c.riskLevel || (hasDiff ? 'WARNING' : 'SAFE'),
          riskReason: c.riskReason || '',
          suggestedReplacement: c.suggestedReplacement || '',
          status: hasDiff ? 'PROPOSED' : 'RESOLVED',
        };

        if (hasDiff) {
          differences.push({
            clauseId,
            category: clauseObj.category,
            title: clauseObj.title,
            partyATerm: textA,
            partyBTerm: textB,
            diffTokens,
            compromiseRecommendation: c.suggestedReplacement || '',
            reason: c.riskReason || 'Differences identified by Gemini AI analysis.',
            status: 'FLAGGED',
          });
        }

        reconciledClauses.push(clauseObj);
      });

      return {
        clauses: reconciledClauses,
        differences,
        totalDifferences: differences.length,
        alignmentScore: typeof aiResult.alignmentScore === 'number' ? aiResult.alignmentScore : undefined,
        summary: aiResult.summary || '',
        poweredBy: 'gemini-2.5-flash',
      };
    }
  } catch (err) {
    console.warn('[ClauseReconciliation] Gemini AI analysis failed, falling back to deterministic reconciliation:', err.message);
  }

  // Graceful fallback to deterministic parsing
  return reconcileDrafts(draftAText, draftBText);
}

module.exports = {
  reconcileDrafts,
  reconcileDraftsAsync,
  ORGANIZATION_COUNTER_DRAFT,
};

