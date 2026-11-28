import { fireEvent, render, screen } from '@testing-library/react-native';
import { Button, Card, Text as PaperText } from 'react-native-paper';
import { OffersStatePanel } from '../../../src/DealsSeeker.ReactNative/src/components/OffersStatePanel';

function hasComponent(node: any, component: unknown): boolean {
  const visit = (fiber: any): boolean => {
    if (!fiber) {
      return false;
    }
    if (fiber.type === component) {
      return true;
    }
    return visit(fiber.child) || visit(fiber.sibling);
  };
  let top = node.unstable_fiber;
  while (top?.return) {
    top = top.return;
  }
  return visit(top);
}
import type { Palette } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

const palette = {
  mode: 'light',
  background: '#f4efe6',
  backgroundRaised: '#efe5d8',
  panel: '#fff9f0',
  panelAlt: '#e6f0e6',
  card: '#fffdf8',
  border: '#d7c9b5',
  ink: '#1f3128',
  inkMuted: '#5f6d63',
  accent: '#b85c38',
  accentMuted: '#e9c9b8',
  success: '#2f6e46',
  danger: '#8d2f2f',
  shadow: 'rgba(31, 49, 40, 0.14)',
  overlay: 'rgba(22, 30, 28, 0.52)',
} as Palette;

describe('OffersStatePanel', () => {
  it('renders the message and its supporting hint', async () => {
    await render(<OffersStatePanel hint="Try another tag" palette={palette} title="No offers matched" />);

    expect(screen.getByText('No offers matched')).toBeTruthy();
    expect(screen.getByText('Try another tag')).toBeTruthy();
  });

  it('calls the recovery action when the action is pressed', async () => {
    const onAction = jest.fn();
    await render(
      <OffersStatePanel
        actionLabel="Clear filters"
        hint="Try another tag"
        onAction={onAction}
        palette={palette}
        title="No offers matched"
      />
    );

    await fireEvent.press(screen.getByRole('button', { name: 'Clear filters' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('omits the action when no recovery action is provided', async () => {
    await render(<OffersStatePanel hint="Check your connection" palette={palette} title="Search failed" />);

    expect(screen.queryByRole('button')).toBeNull();
  });

  it('exposes the action label to assistive technology', async () => {
    await render(
      <OffersStatePanel
        actionLabel="Retry"
        hint="Check your connection"
        onAction={() => undefined}
        palette={palette}
        title="Search failed"
      />
    );

    expect(screen.getByRole('button', { name: 'Retry' })).toBeTruthy();
  });

  it('uses Material 3 card and button surfaces (OFFERS.FAVORITES.001-R15)', async () => {
    await render(
      <OffersStatePanel
        actionLabel="Retry"
        hint="Check your connection"
        onAction={() => undefined}
        palette={palette}
        title="Search failed"
      />
    );

    expect(hasComponent(screen.root, Card)).toBe(true);
    expect(hasComponent(screen.root, Button)).toBe(true);
  });

  it('maps the panel caption and hint to Material 3 text variants', async () => {
    await render(<OffersStatePanel hint="Try another tag" palette={palette} title="No offers matched" />);

    expect(hasComponent(screen.root, PaperText)).toBe(true);
  });
});
