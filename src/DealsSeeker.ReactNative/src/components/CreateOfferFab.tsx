import { FAB } from 'react-native-paper';

export function CreateOfferFab({
  label,
  onPress,
  visible = true,
}: {
  label: string;
  onPress: () => void;
  visible?: boolean;
}) {
  if (!visible) {
    return null;
  }

  return (
    <FAB
      accessibilityLabel={label}
      testID="create-offer-fab"
      icon="plus"
      onPress={onPress}
    />
  );
}
