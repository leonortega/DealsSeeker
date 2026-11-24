import * as Haptics from 'expo-haptics';

function emit(operation: Promise<unknown>) {
  void operation.catch(() => undefined);
}

export function selectionFeedback() {
  emit(Haptics.selectionAsync());
}

export function successFeedback() {
  emit(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}
