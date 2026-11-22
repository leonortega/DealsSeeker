export function stackScreenOptions() {
  return { headerShown: false } as const;
}

export function tabScreenOptions() {
  return { headerShown: false } as const;
}

export function modalScreenOptions(os: string) {
  return {
    headerShown: false,
    presentation: os === 'ios' ? 'formSheet' : 'modal',
    gestureEnabled: true,
  } as const;
}
