/**
 * Requests to the CRUD server: same protocol as the jTable renderer
 * (form-encoded POST, jTable-style JSON answers).
 */

export class CrudError extends Error {
  constructor(message, errors) {
    super(message);
    this.errors = errors || {};
  }
}

function encode(params) {
  const body = new URLSearchParams();
  Object.keys(params).forEach((name) => {
    const value = params[name];
    if (value !== undefined && value !== null) {
      body.append(name, value);
    }
  });
  return body;
}

/**
 * @returns {Promise<object>} the payload when Result is OK (or the raw array for autocomplete)
 */
export async function post(url, params, communicationError) {
  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
      body: encode(params || {}),
    });
  } catch (e) {
    throw new CrudError(communicationError);
  }
  let payload;
  try {
    payload = await response.json();
  } catch (e) {
    throw new CrudError(communicationError);
  }
  if (Array.isArray(payload)) {
    return payload;
  }
  if (!payload || payload.Result !== 'OK') {
    throw new CrudError(payload && payload.Message ? payload.Message : communicationError, payload && payload.Errors);
  }
  return payload;
}
