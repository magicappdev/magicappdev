// Polyfill for Babel's _objectWithoutPropertiesLoose helper
// This is needed for React 19 compatibility with expo-router

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  const target = {};
  const sourceKeys = Object.keys(source);
  let key, i;
  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }
  return target;
}

// Make it available globally for expo-router
if (typeof global !== "undefined") {
  (global as any)._objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose;
}
