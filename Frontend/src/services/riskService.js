// ============================================================//
//  riskService.js — Smart Risk Analyzer API client            //
//  Calls GET /api/ecos/:id/risk                               //
// ============================================================//
import { secureGet } from '../capacitor/nativeServices';

/**
 * Fetches risk analysis for a specific ECO.
 * @param {string} ecoId — The ECO ID
 * @returns {Promise<Object>} Risk analysis data
 */
export async function fetchRiskAnalysis(ecoId) {
  const token = await secureGet('token');

  const res = await fetch(
    `http://localhost:5000/api/ecos/${ecoId}/risk`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  if (!data.success) {
    throw new Error(data.message || 'Risk analysis failed');
  }

  return data.data;
}
