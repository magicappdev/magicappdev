// Polyfill for Babel's _objectWithoutPropertiesLoose helper
// This is needed for React 18 compatibility with expo-router

/* eslint-disable @typescript-eslint/no-explicit-any */
function _objectWithoutPropertiesLoose(source: any, excluded: any): any {
  if (source == null) return {};
  const target: any = {};
  const sourceKeys = Object.keys(source);
  let key: string, i: number;
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
  console.log("✅ Polyfill loaded into global scope");
}

if (typeof window !== "undefined") {
  (window as any)._objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose;
  console.log("✅ Polyfill loaded into window scope");
}

if (typeof self !== "undefined") {
  (self as any)._objectWithoutPropertiesLoose = _objectWithoutPropertiesLoose;
  console.log("✅ Polyfill loaded into self scope");
}
/* eslint-enable @typescript-eslint/no-explicit-any */
