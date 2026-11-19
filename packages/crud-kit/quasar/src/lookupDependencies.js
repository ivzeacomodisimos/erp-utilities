export function lookupContext(field, fields, values) {
  if (!field.dependsOn) return null;
  const context = Object.create(null), visited = new Set([field.name]);
  let parent = field.dependsOn;
  while (parent && !visited.has(parent)) {
    visited.add(parent);
    context[parent] = values[parent] ?? null;
    parent = fields.find(item => item.name === parent)?.dependsOn;
  }
  return context;
}

export function dependenciesReady(context) {
  return !context || Object.values(context).every(value => value !== '' && value !== null && value !== undefined);
}

export function clearDependentValues(name, fields, values) {
  const cleared = [], visited = new Set([name]);
  function clear(parent) {
    for (const field of fields) {
      if (field.dependsOn === parent && !visited.has(field.name)) {
        visited.add(field.name);
        values[field.name] = '';
        cleared.push(field.name);
        clear(field.name);
      }
    }
  }
  clear(name);
  return cleared;
}
