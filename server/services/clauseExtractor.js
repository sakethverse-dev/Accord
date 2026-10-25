/**
 * PactFlow Document Clause Segmentation & Sample Generator
 */

const SAMPLE_CONTRACT = {
  title: 'Master Software Development & Cloud Infrastructure Agreement',
  clauses: [
    {
      clauseId: 'sec-1',
      sectionNumber: 'Section 1',
      title: 'Scope of Services & Deliverables',
      category: 'GENERAL',
      originalText: 'Contractor shall perform custom full-stack web application development, API integration, and cloud deployment architecture as detailed in Statement of Work (SOW) #104. All deliverables shall be submitted in accordance with agreed milestone schedules.',
      currentText: 'Contractor shall perform custom full-stack web application development, API integration, and cloud deployment architecture as detailed in Statement of Work (SOW) #104. All deliverables shall be submitted in accordance with agreed milestone schedules.',
      status: 'ORIGINAL',
    },
    {
      clauseId: 'sec-2',
      sectionNumber: 'Section 2',
      title: 'Invoicing & Payment Schedule',
      category: 'PAYMENT',
      originalText: 'Contractor shall invoice Client at the completion of agreed milestones. All undisputed invoices shall be payable by Client within ninety (90) calendar days (Net-90) of formal written acceptance. Client reserves the right to withhold payment if third-party end-client funds have not cleared.',
      currentText: 'Contractor shall invoice Client at the completion of agreed milestones. All undisputed invoices shall be payable by Client within ninety (90) calendar days (Net-90) of formal written acceptance. Client reserves the right to withhold payment if third-party end-client funds have not cleared.',
      status: 'ORIGINAL',
    },
    {
      clauseId: 'sec-3',
      sectionNumber: 'Section 3',
      title: 'Limitation of Liability & Indemnification',
      category: 'LIABILITY',
      originalText: 'Contractor agrees to indemnify, defend, and hold harmless Client against any and all claims, lost profits, system downtime, business interruption, and indirect or consequential damages without limitation. No monetary ceiling or cap shall apply to Contractor’s liability under this Agreement.',
      currentText: 'Contractor agrees to indemnify, defend, and hold harmless Client against any and all claims, lost profits, system downtime, business interruption, and indirect or consequential damages without limitation. No monetary ceiling or cap shall apply to Contractor’s liability under this Agreement.',
      status: 'ORIGINAL',
    },
    {
      clauseId: 'sec-4',
      sectionNumber: 'Section 4',
      title: 'Intellectual Property & Ownership Assignment',
      category: 'IP_OWNERSHIP',
      originalText: 'All deliverables, custom software, source code, and documentation created under this Agreement shall constitute a "work made for hire" and all worldwide copyright and proprietary rights shall vest solely and immediately in Client upon inception, regardless of invoice status.',
      currentText: 'All deliverables, custom software, source code, and documentation created under this Agreement shall constitute a "work made for hire" and all worldwide copyright and proprietary rights shall vest solely and immediately in Client upon inception, regardless of invoice status.',
      status: 'ORIGINAL',
    },
    {
      clauseId: 'sec-5',
      sectionNumber: 'Section 5',
      title: 'Restrictive Covenants & Non-Compete',
      category: 'NON_COMPETE',
      originalText: 'During the term of this Agreement and for a period of eighteen (18) months following termination, Contractor shall not directly or indirectly provide software engineering, architectural consulting, or design services to any entity operating in the cloud SaaS sector.',
      currentText: 'During the term of this Agreement and for a period of eighteen (18) months following termination, Contractor shall not directly or indirectly provide software engineering, architectural consulting, or design services to any entity operating in the cloud SaaS sector.',
      status: 'ORIGINAL',
    },
    {
      clauseId: 'sec-6',
      sectionNumber: 'Section 6',
      title: 'Warranty & Defect Remediation',
      category: 'WARRANTY',
      originalText: 'Contractor warrants that all deliverables will operate entirely without defects, bugs, or performance degradations for a minimum period of twelve (12) months following production launch. Contractor shall remediate any identified defects without additional charge.',
      currentText: 'Contractor warrants that all deliverables will operate entirely without defects, bugs, or performance degradations for a minimum period of twelve (12) months following production launch. Contractor shall remediate any identified defects without additional charge.',
      status: 'ORIGINAL',
    },
    {
      clauseId: 'sec-7',
      sectionNumber: 'Section 7',
      title: 'Confidentiality & Non-Disclosure',
      category: 'GENERAL',
      originalText: 'Each party agrees to maintain in strict confidence all proprietary business, technical, and financial information disclosed by the other party and shall use such information solely for the execution of this Agreement.',
      currentText: 'Each party agrees to maintain in strict confidence all proprietary business, technical, and financial information disclosed by the other party and shall use such information solely for the execution of this Agreement.',
      status: 'ORIGINAL',
    },
    {
      clauseId: 'sec-8',
      sectionNumber: 'Section 8',
      title: 'Governing Law & Dispute Resolution',
      category: 'GENERAL',
      originalText: 'This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction of the parties. Any controversy or dispute arising under this Agreement shall be submitted to good-faith mediation prior to legal proceedings.',
      currentText: 'This Agreement shall be governed by and construed in accordance with the laws of the jurisdiction of the parties. Any controversy or dispute arising under this Agreement shall be submitted to good-faith mediation prior to legal proceedings.',
      status: 'ORIGINAL',
    },
  ],
};

/**
 * Segment raw text into structured clauses
 */
function parseRawContractText(rawText) {
  if (!rawText || rawText.trim() === '') {
    return SAMPLE_CONTRACT.clauses;
  }

  // Regex to split on Section headers or numbered paragraphs
  const sectionSplitter = /(?=(?:Section\s+\d+|Article\s+\d+|\d+\.\s+[A-Z]))/gi;
  const rawSections = rawText.split(sectionSplitter).map((s) => s.trim()).filter((s) => s.length > 20);

  if (rawSections.length < 2) {
    // If text does not have standard section headers, split by double newlines
    const paragraphs = rawText.split(/\n\s*\n/).map((p) => p.trim()).filter((p) => p.length > 20);
    return paragraphs.map((para, index) => {
      const firstLine = para.split('\n')[0].slice(0, 50).trim();
      return {
        clauseId: `clause-${index + 1}`,
        sectionNumber: `Clause ${index + 1}`,
        title: firstLine.length > 5 ? firstLine : `Clause ${index + 1}`,
        category: detectCategory(para),
        originalText: para,
        currentText: para,
        status: 'ORIGINAL',
      };
    });
  }

  return rawSections.map((sec, index) => {
    const lines = sec.split('\n').map((l) => l.trim()).filter(Boolean);
    const headerLine = lines[0] || `Section ${index + 1}`;
    const bodyText = lines.slice(1).join(' ') || sec;

    return {
      clauseId: `clause-${index + 1}`,
      sectionNumber: `Section ${index + 1}`,
      title: headerLine.replace(/[:.-]/g, '').trim(),
      category: detectCategory(sec),
      originalText: bodyText.length > 0 ? bodyText : sec,
      currentText: bodyText.length > 0 ? bodyText : sec,
      status: 'ORIGINAL',
    };
  });
}

function detectCategory(text) {
  const lower = text.toLowerCase();
  if (lower.includes('payment') || lower.includes('invoice') || lower.includes('net-') || lower.includes('fee')) return 'PAYMENT';
  if (lower.includes('liability') || lower.includes('indemnif') || lower.includes('damage')) return 'LIABILITY';
  if (lower.includes('intellectual property') || lower.includes('work made for hire') || lower.includes('copyright') || lower.includes('patent') || lower.includes('ownership')) return 'IP_OWNERSHIP';
  if (lower.includes('non-compete') || lower.includes('exclusive') || lower.includes('restrictive')) return 'NON_COMPETE';
  if (lower.includes('warranty') || lower.includes('defect') || lower.includes('bug')) return 'WARRANTY';
  if (lower.includes('termination') || lower.includes('cancel')) return 'TERMINATION';
  return 'GENERAL';
}

module.exports = {
  SAMPLE_CONTRACT,
  parseRawContractText,
};
