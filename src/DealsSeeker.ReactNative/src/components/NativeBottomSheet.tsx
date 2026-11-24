import { type ReactNode, useEffect, useRef } from 'react';
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
  const { palette } = useApp();
  const sheetRef = useRef<BottomSheetMethods>(null);

  useEffect(() => {
    if (visible) {
      sheetRef.current?.expand();
    } else {
      sheetRef.current?.close();
    }
  }, [visible]);

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
      handleIndicatorStyle={{ backgroundColor: palette.border }}
    >
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheet>
  );
}
