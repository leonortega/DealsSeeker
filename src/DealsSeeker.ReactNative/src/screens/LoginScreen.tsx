import { type ElementRef, useRef, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import {
  Button,
  HelperText,
  Snackbar,
  Surface,
  Text,
  TextInput,
  TouchableRipple,
  useTheme,
} from 'react-native-paper';
import { HelpSheet } from '../components/HelpSheet';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { keyboardAvoidanceBehavior, platformTouchFloor } from '../utils/layout';

const emailMaxLength = 254;
const passwordMaxLength = 200;

export function LoginScreen() {
  const { api, enterGuestMode, sessionNotice, setSession, showRegister, t } = useApp();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const helpRef = useRef<ElementRef<typeof TouchableRipple> | null>(null);
  const { status, reportStatus: setStatus } = useStatusNotice();
  const sessionMessage = sessionNotice ? t(sessionNotice) : null;

  async function submit() {
    setStatus(null);

    try {
      const session = await api.login({
        email: email.trim(),
        password,
      });

      if (!session) {
        const message = t('auth.invalidCredentials');
        setStatus(message);
        announceStatus(message);
        return;
      }

      await setSession(session);
    } catch {
      const message = t('auth.loginFailed');
      setStatus(message);
      announceStatus(message);
    }
  }

  return (
    <KeyboardAvoidingView behavior={keyboardAvoidanceBehavior(Platform.OS)} style={styles.root}>
      <Surface
        elevation={0}
        style={[styles.brandCard, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        <Image
          source={require('../../assets/brand/logo-icon.png')}
          style={styles.brandMark}
          testID="brand-mark"
        />
        <Text variant="headlineSmall">{t('app.title')}</Text>
        <Text variant="bodyMedium">{t('app.subtitle')}</Text>
      </Surface>

      <Surface
        elevation={1}
        style={[styles.formCard, { backgroundColor: theme.colors.surface }]}
        testID="login-form-card"
      >
        <Text variant="titleLarge">{t('auth.loginTitle')}</Text>
        <Button
          accessibilityLabel={t('common.why')}
          contentStyle={styles.buttonContent}
          mode="text"
          onPress={() => setHelpVisible(true)}
          style={styles.inlineAffordance}
          textColor={theme.colors.primary}
          touchableRef={helpRef as never}
        >
          {t('common.why')}
        </Button>
        <TextInput
          accessibilityLabel={t('auth.email')}
          autoCapitalize="none"
          autoComplete="username"
          keyboardType="email-address"
          label={t('auth.email')}
          maxLength={emailMaxLength}
          mode="outlined"
          onChangeText={(value) => setEmail(value.slice(0, emailMaxLength))}
          placeholder={t('auth.email')}
          textContentType="username"
          value={email}
        />
        <TextInput
          accessibilityLabel={t('auth.password')}
          autoComplete="current-password"
          error={Boolean(status)}
          label={t('auth.password')}
          maxLength={passwordMaxLength}
          mode="outlined"
          onChangeText={(value) => setPassword(value.slice(0, passwordMaxLength))}
          placeholder={t('auth.password')}
          secureTextEntry={!showPassword}
          textContentType="password"
          value={password}
        />
        {status ? (
          <HelperText accessibilityLiveRegion="polite" type="error" visible>
            {status}
          </HelperText>
        ) : null}
        <TouchableRipple
          accessibilityLabel={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
          accessibilityRole="button"
          accessibilityState={{ expanded: showPassword }}
          onPress={() => setShowPassword((shown) => !shown)}
          style={styles.inlineAffordance}
        >
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
            {t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
          </Text>
        </TouchableRipple>
        <Button
          accessibilityLabel={t('auth.loginButton')}
          contentStyle={styles.buttonContent}
          mode="contained"
          onPress={() => void submit()}
        >
          {t('auth.loginButton')}
        </Button>
        <Button
          accessibilityLabel={t('auth.createAccountLink')}
          accessibilityRole="link"
          mode="text"
          onPress={showRegister}
        >
          {t('auth.createAccountLink')}
        </Button>
        <Button
          accessibilityLabel={t('auth.browseGuest')}
          mode="text"
          onPress={enterGuestMode}
        >
          {t('auth.browseGuest')}
        </Button>
        <Snackbar
          duration={Number.POSITIVE_INFINITY}
          onDismiss={() => undefined}
          visible={Boolean(sessionMessage)}
        >
          <Text variant="labelLarge" style={{ color: theme.colors.error }}>
            {sessionMessage}
          </Text>
        </Snackbar>
      </Surface>
      <HelpSheet
        onClose={() => setHelpVisible(false)}
        returnFocusRef={helpRef}
        topic="help.contribute"
        visible={helpVisible}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  brandCard: {
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
    padding: 20,
  },
  brandMark: {
    height: 64,
    resizeMode: 'contain',
    width: 64,
  },
  formCard: {
    gap: 12,
    padding: 20,
  },
  buttonContent: {
    minHeight: platformTouchFloor,
  },
  inlineAffordance: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: platformTouchFloor,
  },
});
