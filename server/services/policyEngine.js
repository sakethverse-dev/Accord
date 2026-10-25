/**
 * PactFlow Deterministic Policy Evaluation Engine
 * Pure application logic - compares extracted clause parameters against user policy thresholds
 */

function evaluateClause(clause, freelancerPolicy, clientPolicy) {
  const text = clause.currentText || clause.originalText;
  const lower = text.toLowerCase();
  
  let riskLevel = 'SAFE';
  let riskReason = '';
  let suggestedReplacement = '';
  let category = clause.category || 'GENERAL';

  // 1. PAYMENT TERMS EVALUATION
  if (category === 'PAYMENT' || lower.includes('payment') || lower.includes('invoice') || lower.includes('net-') || lower.includes('net ')) {
    category = 'PAYMENT';
    const policyMaxDays = freelancerPolicy?.maxPaymentDays || 30;

    // Detect "pay when paid"
    if (lower.includes('paid when paid') || lower.includes('pay-when-paid') || lower.includes('if and when client receives')) {
      riskLevel = 'CRITICAL';
      riskReason = 'Pay-When-Paid clause detected: Shifts end-client non-payment risk directly onto the freelancer.';
      suggestedReplacement = 'Invoices shall be payable within ' + policyMaxDays + ' days of receipt, independent of any third-party payments to Client.';
    } else {
      // Regex extraction for payment days
      const daysMatch = text.match(/(?:within|net|payable within|due within|terms of)\s*(\d+)\s*(?:calendar\s*days|business\s*days|days)?/i) ||
                         text.match(/net[- ]?(\d+)/i);
      
      const detectedDays = daysMatch ? parseInt(daysMatch[1], 10) : null;

      if (detectedDays && detectedDays > policyMaxDays) {
        riskLevel = detectedDays >= 60 ? 'CRITICAL' : 'WARNING';
        riskReason = `Payment terms of Net-${detectedDays} violate Freelancer policy threshold (Maximum allowed: Net-${policyMaxDays}).`;
        suggestedReplacement = `Invoices shall be submitted bi-weekly or upon milestone delivery and shall be payable in full within ${policyMaxDays} calendar days of receipt.`;
      }
    }
  }

  // 2. LIMITATION OF LIABILITY EVALUATION
  else if (category === 'LIABILITY' || lower.includes('liability') || lower.includes('indemnif') || lower.includes('hold harmless')) {
    category = 'LIABILITY';
    const hasUnlimited = lower.includes('without limitation') || lower.includes('unlimited') || lower.includes('no cap') || lower.includes('consequential damages');
    const hasExplicitCap = lower.includes('aggregate liability') || lower.includes('shall not exceed') || lower.includes('capped at');

    if (hasUnlimited || !hasExplicitCap) {
      riskLevel = 'CRITICAL';
      riskReason = 'Unlimited or uncapped liability detected: Exposes freelancer to potential damages vastly exceeding the total project value.';
      suggestedReplacement = "In no event shall either party's total aggregate liability arising out of or related to this Agreement exceed the total fees paid or payable to Contractor under this Agreement.";
    } else if (lower.includes('solely indemnifies') || lower.includes('contractor shall defend and indemnify client')) {
      riskLevel = 'WARNING';
      riskReason = 'One-sided indemnification: Contractor indemnifies Client without mutual protection for Client-provided assets.';
      suggestedReplacement = 'Each party shall mutually indemnify and hold harmless the other party against third-party claims arising from gross negligence or willful misconduct.';
    }
  }

  // 3. INTELLECTUAL PROPERTY & OWNERSHIP EVALUATION
  else if (category === 'IP_OWNERSHIP' || lower.includes('intellectual property') || lower.includes('work made for hire') || lower.includes('copyright') || lower.includes('ownership')) {
    category = 'IP_OWNERSHIP';
    const transfersImmediately = lower.includes('immediately upon creation') || lower.includes('vests immediately') || lower.includes('work for hire');
    const requiresFullPayment = lower.includes('upon full payment') || lower.includes('receipt of final payment');

    if (transfersImmediately && !requiresFullPayment) {
      riskLevel = 'CRITICAL';
      riskReason = 'IP transfers prior to receipt of final payment: Freelancer loses legal recourse if final invoice is unpaid.';
      suggestedReplacement = 'Upon receipt of full and final payment of all agreed fees, Contractor assigns to Client all proprietary rights, copyright, and title in the bespoke deliverables.';
    } else if (!lower.includes('pre-existing') && !lower.includes('background ip')) {
      riskLevel = 'WARNING';
      riskReason = 'Missing Background IP carve-out: Client may claim ownership over your pre-existing tools, starter kits, or libraries.';
      suggestedReplacement = 'Contractor retains all rights in pre-existing developer tooling, libraries, and open-source components utilized in delivering the services.';
    }
  }

  // 4. RESTRICTIVE COVENANTS / NON-COMPETE
  else if (category === 'NON_COMPETE' || lower.includes('non-compete') || lower.includes('not engage with') || lower.includes('exclusive service') || lower.includes('restrictive covenant')) {
    category = 'NON_COMPETE';
    if (!freelancerPolicy?.nonCompeteAllowed) {
      riskLevel = 'CRITICAL';
      riskReason = 'Non-compete clause restricts freelancer from taking other client work in their domain or market.';
      suggestedReplacement = 'Contractor provides services as an independent contractor and reserves the right to perform professional services for other clients, subject only to confidentiality obligations.';
    }
  }

  // 5. WARRANTY & BUG SUPPORT
  else if (category === 'WARRANTY' || lower.includes('warranty') || lower.includes('bug fix') || lower.includes('defect') || lower.includes('guarantee')) {
    category = 'WARRANTY';
    const policyWarrantyDays = freelancerPolicy?.bugWarrantyDays || 14;
    const isPerpetual = lower.includes('in perpetuity') || lower.includes('at all times') || lower.includes('ongoing support without additional charge');

    if (isPerpetual) {
      riskLevel = 'CRITICAL';
      riskReason = 'Uncapped or perpetual warranty requires free lifetime maintenance.';
      suggestedReplacement = `Contractor warrants that for a period of ${policyWarrantyDays} calendar days following acceptance, deliverables shall substantially conform to specifications. Subsequent maintenance shall be billed under a separate agreement.`;
    } else {
      const matchDays = text.match(/(\d+)\s*(?:days|months|year)/i);
      if (matchDays) {
        const num = parseInt(matchDays[1], 10);
        if (num > policyWarrantyDays) {
          riskLevel = 'WARNING';
          riskReason = `Warranty duration (${num} days) exceeds your preferred support policy of ${policyWarrantyDays} days.`;
          suggestedReplacement = `Contractor provides a ${policyWarrantyDays}-day warranty post-delivery for critical defect remediation.`;
        }
      }
    }
  }

  return {
    category,
    riskLevel,
    riskReason,
    suggestedReplacement,
  };
}

module.exports = { evaluateClause };
