/**
 * Centralized API Service for PactFlow
 */

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('pactflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    const errorMsg = data.message || `HTTP error! status: ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(res);
      if (data.data?.token) {
        localStorage.setItem('pactflow_token', data.data.token);
      }
      return data.data;
    },

    register: async (userData) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(res);
      if (data.data?.token) {
        localStorage.setItem('pactflow_token', data.data.token);
      }
      return data.data;
    },

    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    updatePolicy: async (policyProfile) => {
      const res = await fetch(`${API_BASE}/auth/policy`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(policyProfile),
      });
      const data = await handleResponse(res);
      return data.data;
    },
  },

  // Agreements
  agreements: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/agreements`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    getById: async (id) => {
      const res = await fetch(`${API_BASE}/agreements/${id}`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    create: async ({ title, rawText, useSample }) => {
      const res = await fetch(`${API_BASE}/agreements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, rawText, useSample }),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    joinByToken: async (token) => {
      const res = await fetch(`${API_BASE}/agreements/join/${token}`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    verifySeal: async (id) => {
      const res = await fetch(`${API_BASE}/agreements/${id}/verify-seal`, {
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    compareDrafts: async (id, { draftText, useSampleCounter }) => {
      const res = await fetch(`${API_BASE}/agreements/${id}/compare-drafts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ draftText, useSampleCounter }),
      });
      const data = await handleResponse(res);
      return data.data;
    },
  },

  // Proposals & Redline
  proposals: {
    submit: async (agreementId, clauseId, { proposedText, rationale }) => {
      const res = await fetch(`${API_BASE}/agreements/${agreementId}/clauses/${clauseId}/propose`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ proposedText, rationale }),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    adoptCompromise: async (agreementId, clauseId) => {
      const res = await fetch(`${API_BASE}/agreements/${agreementId}/clauses/${clauseId}/adopt-compromise`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    respond: async (agreementId, proposalId, action) => {
      const res = await fetch(`${API_BASE}/agreements/${agreementId}/proposals/${proposalId}/respond`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ action }),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    getDiff: async (oldText, newText) => {
      const res = await fetch(`${API_BASE}/agreements/diff`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ oldText, newText }),
      });
      const data = await handleResponse(res);
      return data.data;
    },
  },

  // Digital Signatures
  signatures: {
    sign: async (agreementId, { signerName, affirmationChecked, signatureImage }) => {
      const res = await fetch(`${API_BASE}/agreements/${agreementId}/sign`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ signerName, affirmationChecked, signatureImage }),
      });
      const data = await handleResponse(res);
      return data.data;
    },

    withdrawSignature: async (agreementId, reason = '') => {
      const res = await fetch(`${API_BASE}/agreements/${agreementId}/withdraw-signature`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason }),
      });
      const data = await handleResponse(res);
      return data.data;
    },
  },
};
