/**
 * Extracts the ring number from a DevSteps agent name.
 * Example: "devsteps-R1-analyst-archaeology" → 1
 * Returns null if no R-prefix ring number is found.
 */
export function extractRingNumber(agentName: string): number | null {
  const match = /R([0-9]+)/i.exec(agentName);
  if (!match) return null;
  return Number.parseInt(match[1], 10);
}
