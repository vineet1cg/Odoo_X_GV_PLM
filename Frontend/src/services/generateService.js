// ============================================================//
//  generateService.js — Smart ECO Description Generator API   //
//  Calls POST /api/generate/description                       //
// ============================================================//
import { secureGet } from '../capacitor/nativeServices';

const API_BASE = 'http://localhost:5000/api';

/**
 * Sends ECO + changes to backend, returns a professional description string.
 * @param {Object} eco  — ECO metadata (type, productName, priority, effectiveDate)
 * @param {Array}  changes — Array of { field, oldValue, newValue, type }
 * @returns {Promise<string>} Generated description text
 */
export async function generateDescription(eco, changes) {
  const token = await secureGet('token');
  const res = await fetch(`${API_BASE}/generate/description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ eco, changes })
  });

  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Generation failed');
  return data.data.description;
}
