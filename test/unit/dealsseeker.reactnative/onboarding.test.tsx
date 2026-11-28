import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';
import { Button, Text as PaperText } from 'react-native-paper';
import { FirstRunSheet } from '../../../src/DealsSeeker.ReactNative/src/components/FirstRunSheet';
import { materialTypeScale } from '../../../src/DealsSeeker.ReactNative/src/utils/theme';

const mockOpenSheet = jest.fn();
const mockCloseSheet = jest.fn();
const mockRestoreFocus = jest.fn();

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

jest.mock('../../../src/DealsSeeker.ReactNative/src/utils/focusReturn', () => ({
  restoreFocus: (...args: unknown[]) => mockRestoreFocus(...args),
}));

jest.mock('../../../src/DealsSeeker.ReactNative/src/hooks/useApp', () => ({
  useApp: () => ({
    openSheet: mockOpenSheet,
    closeSheet: mockCloseSheet,
    palette: {
      accent: '#b85c38',
      border: '#d7c9b5',
      card: '#fffdf8',
      ink: '#1f3128',
      inkMuted: '#5f6d63',
      overlay: 'rgba(22,30,28,0.52)',
    },
    t: (key: string) => key,
  }),
}));

function hostTypes(node: unknown): string[] {
  if (!node || typeof node !== 'object') {
    return [];
  }
  const entry = node as { type?: unknown; children?: unknown[] };
  return [
    ...(typeof entry.type === 'string' ? [entry.type] : []),
    ...(entry.children ?? []).flatMap(hostTypes),
  ];
}

describe('first-run guidance (APP.ONBOARD.001)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('presents brief, skippable guidance with a labelled dismiss action', async () => {
    const onDismiss = jest.fn();
    await render(<FirstRunSheet onDismiss={onDismiss} visible />);

    expect(screen.getByText('onboarding.title')).toBeTruthy();
    expect(screen.getByText('onboarding.body')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'onboarding.gotIt' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when guidance is not visible', async () => {
    await render(<FirstRunSheet onDismiss={jest.fn()} visible={false} />);
    expect(screen.queryByText('onboarding.title')).toBeNull();
    expect(screen.queryByTestId('native-bottom-sheet')).toBeNull();
  });

  it('uses the common sheet system with one dismissal path (APP.ONBOARD.001-R7)', async () => {
    const onDismiss = jest.fn();
    await render(<FirstRunSheet onDismiss={onDismiss} visible />);

    expect(screen.getByTestId('native-bottom-sheet')).toBeTruthy();
    expect(screen.getByTestId('first-run-sheet')).toBeTruthy();
    expect(hostTypes(screen.toJSON())).not.toContain('Modal');
    expect(mockOpenSheet).toHaveBeenCalledTimes(1);

    await fireEvent(screen.getByTestId('native-bottom-sheet'), 'close');
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('returns focus through the shared dismissal path', async () => {
    const returnFocusRef = { current: null };
    await render(<FirstRunSheet onDismiss={jest.fn()} returnFocusRef={returnFocusRef as never} visible />);

    await fireEvent.press(screen.getByRole('button', { name: 'onboarding.gotIt' }));
    expect(mockRestoreFocus).toHaveBeenCalledWith(returnFocusRef);
  });

  it('maps guidance text to Material type roles and keeps a square touch floor', async () => {
    await render(<FirstRunSheet onDismiss={jest.fn()} visible />);

    const title = StyleSheet.flatten(screen.getByText('onboarding.title').props.style);
    const body = StyleSheet.flatten(screen.getByText('onboarding.body').props.style);
    const actionLabel = StyleSheet.flatten(screen.getByText('onboarding.gotIt').props.style);
    const action = StyleSheet.flatten(screen.getByTestId('first-run-action-container').props.style);

    expect(title.fontSize).toBe(materialTypeScale.headlineSmall.fontSize);
    expect(body.fontSize).toBe(materialTypeScale.bodyMedium.fontSize);
    expect(body.lineHeight).toBe(materialTypeScale.bodyMedium.lineHeight);
    expect(actionLabel.fontSize).toBe(materialTypeScale.labelLarge.fontSize);
    expect(action.minHeight).toBeGreaterThanOrEqual(44);
    expect(action.minWidth).toBe(action.minHeight);
  });

  it('uses Material 3 button and text primitives for the guidance surface', async () => {
    const view = await render(<FirstRunSheet onDismiss={jest.fn()} visible />);

    expect(hasComponent(view.root, Button)).toBe(true);
    expect(hasComponent(view.root, PaperText)).toBe(true);
  });
});
