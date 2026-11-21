export interface MotionPreferences {
  modalAnimation: 'fade' | 'slide';
  springEnabled: boolean;
  animatedScroll: boolean;
}

export function resolveMotionPreferences(reduceMotion: boolean): MotionPreferences {
  return {
    modalAnimation: reduceMotion ? 'fade' : 'slide',
    springEnabled: !reduceMotion,
    animatedScroll: !reduceMotion,
  };
}
