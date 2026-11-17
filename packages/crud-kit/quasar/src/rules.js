/**
 * Same validation rules as the server (Validator.php) and the jTable renderer.
 */

function format(text, value) {
  return String(text).replace('{value}', value === undefined || value === null ? '' : value);
}

function isNumeric(text) {
  return text !== '' && !isNaN(text) && isFinite(text);
}

/**
 * @returns {string|null} first error message or null
 */
export function ruleError(rules, value, texts) {
  const text = value === undefined || value === null ? '' : String(value).trim();
  if (text === '') {
    return rules.required ? texts['rule.required'] : null;
  }
  if (rules.minLength !== undefined && text.length < rules.minLength) {
    return format(texts['rule.minLength'], rules.minLength);
  }
  if (rules.maxLength !== undefined && text.length > rules.maxLength) {
    return format(texts['rule.maxLength'], rules.maxLength);
  }
  if (rules.numeric && !isNumeric(text)) {
    return texts['rule.numeric'];
  }
  if (rules.integer && !/^-?\d+$/.test(text)) {
    return texts['rule.integer'];
  }
  if (rules.min !== undefined && isNumeric(text) && parseFloat(text) < rules.min) {
    return format(texts['rule.min'], rules.min);
  }
  if (rules.max !== undefined && isNumeric(text) && parseFloat(text) > rules.max) {
    return format(texts['rule.max'], rules.max);
  }
  if (rules.pattern !== undefined && !new RegExp(rules.pattern).test(text)) {
    return texts['rule.pattern'];
  }
  if (rules.in !== undefined && !rules.in.map(String).includes(text)) {
    return format(texts['rule.in'], rules.in.join(', '));
  }
  return null;
}

/**
 * Quasar "rules" prop for a field.
 */
export function quasarRules(rules, texts) {
  return [(value) => ruleError(rules || {}, value, texts) || true];
}
