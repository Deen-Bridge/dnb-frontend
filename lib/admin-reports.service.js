// lib/admin-reports.service.js
// Client-side service for managing report reasons.

const API_BASE = '/api/report-reasons';

async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Something went wrong.');
  }
  return response.json();
}

export async function fetchReportReasons() {
  const response = await fetch(API_BASE);
  return handleResponse(response);
}

export async function createReportReason(payload) {
  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function updateReportReason(id, payload) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function mergeReportReason(id, mergeIntoId) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mergeInto: mergeIntoId }),
  });
  return handleResponse(response);
}