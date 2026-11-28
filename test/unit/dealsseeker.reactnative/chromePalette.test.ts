import fs from 'fs';
import path from 'path';

const sourceRoot = path.resolve(__dirname, '../../../src/DealsSeeker.ReactNative/src');

describe('palette-derived chrome (APP.THEME.001-R10)', () => {
  it('does not hardcode footer icon colors in the navigator', () => {
    const source = fs.readFileSync(path.join(sourceRoot, 'navigation/AppNavigator.tsx'), 'utf8');
    expect(source).not.toMatch(/color=\{?'#[0-9a-fA-F]{6}'/);
  });

  it('does not hardcode white text literals in the immersive overlay', () => {
    const source = fs.readFileSync(path.join(sourceRoot, 'components/ImmersiveOfferFeed.tsx'), 'utf8');
    expect(source).not.toMatch(/color:\s*'#(fff|ffffff)'/);
  });

  it('wires the RNP Material 3 navigation bar into the native tab navigator', () => {
    const navigator = fs.readFileSync(path.join(sourceRoot, 'navigation/AppNavigator.tsx'), 'utf8');
    expect(navigator).toMatch(/\bBottomNavigation\b/);
    expect(navigator).toMatch(/<BottomNavigation\.Bar/);
    expect(navigator).toMatch(/navigationState=\{state\}/);
    expect(navigator).toMatch(/safeAreaInsets=\{insets\}/);
    expect(navigator).toMatch(/onTabPress=/);
    expect(navigator).toMatch(/CommonActions\.navigate/);
    expect(navigator).toMatch(/preventDefault\(\)/);
    expect(navigator).toMatch(/renderIcon=/);
    expect(navigator).toMatch(/descriptors\[route\.key\]\.options\.tabBarIcon/);
    expect(navigator).toMatch(/getLabelText=/);
    expect(navigator).toMatch(/options\.tabBarLabel/);
    expect(navigator).toMatch(/options\.title/);
    expect(navigator).toMatch(/route\.name/);
    expect(navigator).toMatch(/getAccessibilityLabel=/);
    expect(navigator).not.toMatch(/tabBarStyle:/);
    expect(navigator).not.toMatch(/tabBarActiveTintColor:/);
    expect(navigator).not.toMatch(/tabBarInactiveTintColor:/);
    expect(navigator).not.toMatch(/navigationBarAppearance\(/);
    expect(navigator).not.toMatch(/footerBarAppearance\(palette\)/);
    expect(navigator).not.toMatch(/headerStyle:/);

    const footer = fs.readFileSync(path.join(sourceRoot, 'components/AppFooterBar.tsx'), 'utf8');
    expect(footer).toMatch(/BottomNavigation\.Bar/);
    expect(footer).not.toMatch(/<Pressable/);
    expect(footer).not.toMatch(/footerBarAppearance/);
    expect(footer).not.toMatch(/palette\.backdrop/);
    expect(footer).not.toMatch(/palette\.footerActive/);
  });

  it('derives the status bar from the rendered route rather than the global immersive flag', () => {
    const app = fs.readFileSync(path.join(sourceRoot, '../App.tsx'), 'utf8');
    expect(app).toMatch(/resolveRouteChrome/);
    expect(app).not.toMatch(/resolveShellChrome\(immersiveOffers/);
    expect(app).toMatch(/'auth'/);
  });
});

describe('Material 3 component adoption on shell and auth surfaces (APP.PLATFORM.CHROME.001-R18)', () => {
  const read = (file: string) => fs.readFileSync(path.join(sourceRoot, file), 'utf8');

  it('uses Paper list, dialog, radio, surface and switch components on My Account', () => {
    const source = read('screens/AccountScreen.tsx');
    expect(source).toMatch(/from 'react-native-paper'/);
    for (const component of ['List', 'Dialog', 'RadioButton', 'Surface', 'Switch', 'Button']) {
      expect(source).toMatch(new RegExp(`\\b${component}\\b`));
    }
  });

  it('uses labelled Paper text inputs, buttons and feedback on the auth screens', () => {
    for (const file of ['screens/LoginScreen.tsx', 'screens/RegisterScreen.tsx']) {
      const source = read(file);
      expect(source).toMatch(/from 'react-native-paper'/);
      expect(source).toMatch(/\bTextInput\b/);
      expect(source).toMatch(/\bButton\b/);
    }
    expect(read('screens/LoginScreen.tsx')).toMatch(/\bSnackbar\b/);
  });

  it('uses Paper components for the splash and the RNP navigation bar', () => {
    const splash = read('screens/SplashScreen.tsx');
    expect(splash).toMatch(/\bSurface\b/);
    expect(splash).toMatch(/\bText\b/);
    expect(splash).toMatch(/t\('app\.title'\)/);
    const footer = read('components/AppFooterBar.tsx');
    expect(footer).toMatch(/BottomNavigation\.Bar/);
    expect(footer).toMatch(/from 'react-native-paper'/);
    const navigator = read('navigation/AppNavigator.tsx');
    expect(navigator).toMatch(/BottomNavigation\.Bar/);
  });

  it('uses Paper app bars for standard and overlay routes with native headers off', () => {
    const source = read('navigation/AppNavigator.tsx');
    expect(source).toMatch(/\bAppbar\b/);
    expect(source).toMatch(/Appbar\.Header/);
    expect(source).toMatch(/Appbar\.Content/);
    expect(source).toMatch(/Appbar\.Action/);
    expect(source).toMatch(/tabScreenOptions\(\)/);
    expect(read('navigation/shellOptions.ts')).toMatch(/headerShown: false as const/);
  });

  it('uses one Material Community Icons vocabulary for Paper and PlatformTabIcon on Android', () => {
    const source = read('components/PlatformTabIcon.tsx');
    expect(source).toMatch(/MaterialCommunityIcons/);
    expect(source).not.toMatch(/\bMaterialIcons\b/);
    for (const name of ['plus', 'magnify', 'help', 'compass', 'heart', 'flag', 'chat', 'thumb-up', 'calendar-check']) {
      expect(source).toContain(`'${name}'`);
    }
  });

  it('uses Material 3 default fonts from resolvePaperTheme without a serif landmark override', () => {
    const source = read('utils/theme.ts');
    expect(source).toMatch(/resolvePaperTheme/);
    expect(source).not.toMatch(/landmarkFontFamily/);
  });

  it('uses only Material 3 controls and type roles in the owned chrome components', () => {
    const owned = [
      'components/PresentationModeSwitch.tsx',
      'components/OfferTopBar.tsx',
      'components/NativeMapPreview.tsx',
      'components/ImmersiveSearchOverlay.tsx',
      'components/OfferCommentsModal.tsx',
      'components/AppFooterBar.tsx',
    ];
    for (const file of owned) {
      const source = read(file);
      expect(source).not.toMatch(/<Pressable/);
      expect(source).not.toMatch(/android_ripple/);
      expect(source).not.toMatch(/landmarkFontFamily/);
      expect(source).not.toMatch(/from 'react-native'[^\n]*\bText\b/);
      expect(source).toMatch(/from 'react-native-paper'/);
    }
    expect(read('components/PresentationModeSwitch.tsx')).toMatch(/rippleColor=/);
    expect(read('components/OfferTopBar.tsx')).toContain('icon="magnify"');
    expect(read('components/ImmersiveSearchOverlay.tsx')).toMatch(/<Button/);
    expect(read('components/OfferCommentsModal.tsx')).toMatch(/<Button/);
    expect(read('components/NativeMapPreview.tsx')).toMatch(/variant=/);
  });
});
