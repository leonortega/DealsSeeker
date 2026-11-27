function motionOptions(reduceMotion: boolean) {
  return reduceMotion ? { animation: 'fade' as const } : {};
}

export function stackScreenOptions(reduceMotion = false) {
  return { headerShown: true as const, ...motionOptions(reduceMotion) };
}

export function tabScreenOptions() {
  return { headerShown: false as const };
}

export function modalScreenOptions(os: string, reduceMotion = false) {
  return {
    headerShown: true as const,
    presentation: os === 'ios' ? ('formSheet' as const) : ('modal' as const),
    gestureEnabled: true,
    ...motionOptions(reduceMotion),
  };
}
