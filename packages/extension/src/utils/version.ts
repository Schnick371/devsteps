export function parseVersion(version: string): [number, number, number] {
  const parts = version.split('.').map((p) => parseInt(p.replace(/[^0-9].*$/, ''), 10) || 0);
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export function isVersionAtLeast(version: string, requirement: string): boolean {
  const [major, minor, patch] = parseVersion(version);
  const [reqMajor, reqMinor, reqPatch] = parseVersion(requirement);

  if (major !== reqMajor) {
    return major > reqMajor;
  }
  if (minor !== reqMinor) {
    return minor > reqMinor;
  }
  return patch >= reqPatch;
}
