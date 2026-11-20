import { describe, expect, it } from 'vitest'
import { NAVIGATION, ROLE_DASHBOARD, ROLES } from './constants.js'

describe('role-based navigation', () => {
  it('defines navigation for every role', () => {
    expect(Object.keys(ROLES)).toHaveLength(3)
    for (const role of Object.values(ROLES)) {
      expect(NAVIGATION[role].length).toBeGreaterThan(0)
      expect(ROLE_DASHBOARD[role]).toMatch(/^\/(admin|librarian|member)\/dashboard$/)
    }
  })

  it('keeps administrator-only items out of librarian and member menus', () => {
    const adminLabels = NAVIGATION.ADMIN.flatMap((group) => group.items.map((item) => item.label))
    expect(adminLabels).toContain('User Management')
    expect(adminLabels).toContain('Library Settings')

    for (const role of [ROLES.LIBRARIAN, ROLES.MEMBER]) {
      const labels = NAVIGATION[role].flatMap((group) => group.items.map((item) => item.label))
      expect(labels).not.toContain('User Management')
      expect(labels).not.toContain('Library Settings')
    }
  })

  it('gives members only personal library links', () => {
    const labels = NAVIGATION.MEMBER.flatMap((group) => group.items.map((item) => item.label))
    expect(labels).toEqual(
      expect.arrayContaining(['Dashboard', 'Browse Books', 'My Loans', 'My Fines', 'My Profile']),
    )
  })
})
