/**
 * Monthly Compliance Review API — Section N
 *
 * Wraps the /api/business/compliance/monthly-reviews endpoints.
 * All calls require an authenticated BUSINESS (sponsor) session.
 */

import api from "./api";

const BASE = "/api/business/compliance/monthly-reviews";

/**
 * Fetch a paginated list of past monthly compliance reviews.
 * @param {{ page?: number, limit?: number }} params
 */
export const listMonthlyReviews = (params = {}) => api.get(BASE, { params });

/**
 * Fetch a single monthly review with its full five-section payload.
 * @param {number|string} id
 */
export const getMonthlyReview = (id) => api.get(`${BASE}/${id}`);

/**
 * Manually trigger a monthly compliance review for the current sponsor.
 * @param {{ reportDate?: string }} body  — optional ISO date string (YYYY-MM-DD)
 *        to control which calendar month the report covers. Defaults to today.
 */
export const generateMonthlyReview = (body = {}) => api.post(`${BASE}/generate`, body);
