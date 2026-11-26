import { StyleSheet, Text } from 'react-native';
import { G, Path, Svg } from 'react-native-svg';
import { useApp } from '../hooks/useApp';
import { decorativeProps } from '../utils/decorativeProps';
import { immersiveInkMuted } from '../utils/theme';

export type ImmersiveActionIcon =
  | 'comments'
  | 'favorite'
  | 'directions'
  | 'votePositive'
  | 'voteNegative'
  | 'report';

function ThumbsUp() {
  return (
    <>
      <Path d="M7 10v10H4V10h3z" />
      <Path d="M7 10l4-6a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.4l-1.4 6A2 2 0 0 1 17.7 20H7" />
    </>
  );
}

function ActionShape({ kind }: { kind: ImmersiveActionIcon }) {
  if (kind === 'comments') {
    return <Path d="M5 5h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-7l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />;
  }

  if (kind === 'favorite') {
    return <Path d="M12 20s-7.5-4.6-7.5-9.5a4.2 4.2 0 0 1 7.5-2.6 4.2 4.2 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z" />;
  }

  if (kind === 'directions') {
    return <Path d="M3 11l18-8-8 18-2.5-7.5L3 11z" />;
  }

  if (kind === 'votePositive') {
    return <ThumbsUp />;
  }

  if (kind === 'voteNegative') {
    return (
      <G transform="rotate(180 12 12)">
        <ThumbsUp />
      </G>
    );
  }

  return (
    <>
      <Path d="M6 21V4" />
      <Path d="M6 5h11l-2 3.5L17 12H6" />
    </>
  );
}

export function ImmersiveActionIconGlyph({
  kind,
  active,
  prominent,
}: {
  kind: ImmersiveActionIcon;
  active?: boolean;
  prominent?: boolean;
}) {
  const { palette } = useApp();
  const color = prominent ? palette.onAccent : active ? palette.accentText : palette.ink;

  return (
    <Svg
      {...decorativeProps}
      color={color}
      fill="none"
      height={18}
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
      viewBox="0 0 24 24"
      width={18}
    >
      <ActionShape kind={kind} />
    </Svg>
  );
}

export function ImmersiveActionCaption({ label }: { label: string }) {
  return (
    <Text {...decorativeProps} numberOfLines={1} style={[styles.actionCaption, { color: immersiveInkMuted }]}>
      {label}
    </Text>
  );
}

const styles = StyleSheet.create({
  actionCaption: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
    textAlign: 'center',
  },
});
