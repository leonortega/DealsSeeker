/**
 * Keeps purely decorative artwork out of the accessibility tree.
 */
export const decorativeProps = {
  accessible: false,
  accessibilityElementsHidden: true,
} as const;
