import axe from 'axe-core'

/*
 * jsdom has no real layout or canvas, so axe cannot measure colour contrast there.
 * Contrast is verified separately from the design tokens (see README, Phase 11).
 */
const RULES = {
  'color-contrast': { enabled: false },
}

/** Run axe against a rendered element and return only real violations. */
export async function getViolations(element) {
  const { violations } = await axe.run(element, { rules: RULES })
  return violations
}

/** Human-readable failure output for test assertions. */
export function describeViolations(violations) {
  return violations
    .map((violation) =>
      [
        `${violation.id}: ${violation.help}`,
        ...violation.nodes.map((node) => `  ${node.target.join(' ')}`),
      ].join('\n'),
    )
    .join('\n')
}
