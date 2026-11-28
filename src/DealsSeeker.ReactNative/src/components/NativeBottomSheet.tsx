import { type ReactNode, useEffect, useRef } from 'react';
import { useTheme } from 'react-native-paper';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useApp } from '../hooks/useApp';

/**
 * Material 3 bottom-sheet wrapper. The library owns drag, snap, dismissal and
 * system Back; visuals come from the active Paper theme. No local BackHandler
 * subscription is installed so predictive Back / edge swipe stays intact.
 */
export function NativeBottomSheet({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const { openSheet, closeSheet } = useApp();
  const theme = useTheme();
  const sheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
      openSheet();
      return () => {
        closeSheet();
      };
    }
    sheetRef.current?.close();
  }, [visible, openSheet, closeSheet]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={visible ? 0 : -1}
      snapPoints={['65%', '90%']}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={(props) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.52} />
      )}
      backgroundStyle={{ backgroundColor: theme.colors.surface }}
      // Immersive feed chrome uses zIndex 2 and status banners use zIndex 5;
      // the sheet must sit above both so its content stays readable.
      containerStyle={{ zIndex: 1000 }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.onSurfaceVariant }}
    >
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheet>
  );
}
