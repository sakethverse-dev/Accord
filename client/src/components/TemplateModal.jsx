import React, { useState } from 'react';
import { 
  X, 
  FileCheck, 
  Layers, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  Code2, 
  Briefcase, 
  Lock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const STANDARD_TEMPLATES = [
  {
    id: 'msa',
    title: 'Master Software Services Agreement',
    category: 'Commercial MSA',
    badge: 'Balanced Standard',
    icon: Code2,
    description: 'Comprehensive B2B contract covering scope, Net-30 payment, liability cap, and IP rights transfer upon payment.',
    rawText: `Section 1. Scope of Work
Contractor shall deliver professional engineering and consulting services as mutually agreed in writing with Client in Statements of Work.

Section 2. Invoicing & Payment Terms
All invoices shall be submitted upon milestone delivery and shall be payable within thirty (30) calendar days (Net-30) of receipt. Late payments shall accrue interest at 1.5% per month.

Section 3. Limitation of Liability
Neither party aggregate liability arising out of or related to this Agreement shall exceed total fees paid or payable in the twelve (12) months preceding the claim.

Section 4. Intellectual Property & Deliverables
Ownership and copyrights in bespoke project deliverables shall transfer to Client upon receipt of full and final payment. Pre-existing tools and libraries remain property of Contractor.

Section 5. Confidentiality & Non-Disclosure
Both parties shall maintain the confidentiality of all proprietary technical, financial, and commercial information with reasonable care for two (2) years.`,
    clausesCount: 5,
  },
  {
    id: 'freelance',
    title: 'Freelance Design & Development Agreement',
    category: 'Milestone Deliverables',
    badge: 'Milestone Focused',
    icon: Briefcase,
    description: 'Protects creative and software deliverables with a 50/50 milestone schedule, revision bounds, and 14-day bug warranty.',
    rawText: `Section 1. Deliverables & Acceptance
Contractor shall create deliverables per project specification. Client shall review and accept or provide revision feedback within seven (7) business days.

Section 2. Milestone Payment Schedule
Fifty percent (50%) upfront deposit prior to commencement, and fifty percent (50%) balance upon final delivery and acceptance.

Section 3. Revisions & Scope Boundaries
Includes up to two (2) rounds of minor design revisions. Additional scope or architectural shifts shall be billed at agreed hourly counter-rates.

Section 4. IP Rights & License
Full commercial IP ownership transfers upon final milestone payment. Contractor retains moral portfolio display rights.

Section 5. Bug-Fix Warranty & Support
Contractor provides a fourteen (14) calendar day post-delivery warranty to remediate code defects and bugs at no additional cost.`,
    clausesCount: 5,
  },
  {
    id: 'nda',
    title: 'Mutual Non-Disclosure Agreement (NDA)',
    category: 'Trade Secret Protection',
    badge: 'Confidentiality',
    icon: Lock,
    description: 'Bilateral confidentiality covenant safeguarding proprietary source code, business data, and commercial discussions.',
    rawText: `Section 1. Definition of Confidential Information
Includes all non-public technical, business, source code, financial data, and negotiations disclosed by either party in connection with prospective collaboration.

Section 2. Obligations of Non-Disclosure
Receiving party shall hold confidential information in strict confidence and use the same standard of care used for its own sensitive property.

Section 3. Exclusions from Confidentiality
Does not apply to information publicly known through no fault, independently developed, or rightfully obtained from third parties without restriction.

Section 4. Return or Destruction of Materials
Upon written request or termination of talks, receiving party shall promptly destroy or return all documents, code repositories, and materials.

Section 5. Term & Governing Law
This Agreement remains effective for two (2) years from disclosure. Governed by applicable commercial arbitration and trade secret laws.`,
    clausesCount: 5,
  },
];

export const TemplateModal = ({ onClose, onSelectTemplate }) => {
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [customTitle, setCustomTitle] = useState(STANDARD_TEMPLATES[0].title);
  const [loading, setLoading] = useState(false);

  const currentTemplate = STANDARD_TEMPLATES[selectedTemplateIndex];

  const handleSelectTemplate = (idx) => {
    setSelectedTemplateIndex(idx);
    setCustomTitle(STANDARD_TEMPLATES[idx].title);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onSelectTemplate({
        title: customTitle.trim() || currentTemplate.title,
        rawText: currentTemplate.rawText,
      });
      onClose();
    } catch (err) {
      alert(`Error loading template: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '780px', padding: '26px' }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: '#ffffff',
              color: '#000000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <FileCheck size={20} strokeWidth={2.4} />
            </div>
            <div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Pre-Vetted Legal Contracts
              </span>
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginTop: '1px', fontWeight: 800 }}>
                Standard Legal Templates
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Template Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '18px' }}>
          {STANDARD_TEMPLATES.map((tmpl, idx) => {
            const Icon = tmpl.icon;
            const isSelected = selectedTemplateIndex === idx;
            return (
              <div
                key={tmpl.id}
                onClick={() => handleSelectTemplate(idx)}
                style={{
                  background: isSelected ? '#ffffff' : 'var(--bg-muted)',
                  border: isSelected ? '1px solid #ffffff' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  color: isSelected ? '#000000' : 'var(--text-main)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <Icon size={18} color={isSelected ? '#000000' : 'var(--text-main)'} />
                  <span style={{
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isSelected ? '#000000' : 'var(--bg-surface)',
                    color: isSelected ? '#ffffff' : 'var(--text-muted)',
                    border: isSelected ? 'none' : '1px solid var(--border-subtle)',
                  }}>
                    {tmpl.badge}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, lineHeight: 1.25, marginBottom: '4px' }}>
                  {tmpl.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: isSelected ? '#3f3f46' : 'var(--text-muted)', lineHeight: 1.35 }}>
                  {tmpl.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Template Custom Title & Preview */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '5px', display: 'block' }}>
              Contract Document Title
            </label>
            <input
              type="text"
              className="input-field"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Master Software Services Agreement"
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                Included Standard Clauses ({currentTemplate.clausesCount} Clauses)
              </label>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                ESIGN Compliant • Balanced Neutral Terms
              </span>
            </div>
            <div style={{
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px',
              maxHeight: '160px',
              overflowY: 'auto',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}>
              {currentTemplate.rawText}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} color="var(--risk-safe)" />
            <span>Ready for bilateral counterparty negotiation and digital signatures</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
              disabled={loading}
              id="btn-confirm-load-template"
            >
              {loading ? (
                <span>Auditing & Loading Room...</span>
              ) : (
                <>
                  <span>Load & Open Room</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
