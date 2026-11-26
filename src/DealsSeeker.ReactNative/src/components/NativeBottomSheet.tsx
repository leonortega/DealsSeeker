import { type ReactNode, useEffect, useRef } from 'react';
import { BackHandler } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import type { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { useApp } from '../hooks/useApp';

/**
 * Brand-styled wrapper around native bottom-sheet behavior. The library owns
 * drag, snap and dismissal; the visual layer stays DealsSeeker's own.
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
  const { palette, openSheet, closeSheet } = useApp();
  const sheetRef = useRef<BottomSheetMethods>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
      openSheet();
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        onCloseRef.current();
        return true;
      });
      return () => {
        subscription.remove();
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
      backgroundStyle={{ backgroundColor: palette.card }}
      // Immersive feed chrome uses zIndex 2 and status banners use zIndex 5;
      // the sheet must sit above both so its content stays readable.
      containerStyle={{ zIndex: 1000 }}
      handleIndicatorStyle={{ backgroundColor: palette.border }}
    >
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheet>
  );
}
