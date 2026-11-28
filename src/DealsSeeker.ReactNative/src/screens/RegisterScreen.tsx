import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Button, HelperText, Surface, Text, TextInput, TouchableRipple, useTheme } from 'react-native-paper';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { validateEmail, validateStrongPassword } from '../utils/format';
import { keyboardAvoidanceBehavior, platformTouchFloor } from '../utils/layout';

const displayNameMaxLength = 80;
const emailMaxLength = 254;
const passwordMaxLength = 200;

export function RegisterScreen() {
  const { api, setSession, showLogin, t } = useApp();
  const theme = useTheme();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { status, reportStatus: reportNotice } = useStatusNotice();

  function reportStatus(message: string | null) {
    reportNotice(message);
    announceStatus(message);
  }

  async function submit() {
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      reportStatus(t('auth.nameRequired'));
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      reportStatus(t('auth.emailRequired'));
      return;
    }

    if (!validateStrongPassword(password)) {
      reportStatus(t('auth.passwordRequired'));
      return;
    }

    reportStatus(null);

    try {
      const registerResult = await api.registerUser({
        displayName: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (!registerResult.success) {
        reportStatus(t('auth.registerFailed'));
        return;
      }

      const session = await api.login({
        email: trimmedEmail,
        password,
      });

      if (!session) {
        reportStatus(t('auth.registerFailed'));
        return;
      }

      await setSession(session);
    } catch {
      reportStatus(t('auth.registerFailed'));
    }
  }

  const nameError = status === t('auth.nameRequired');
  const emailError = status === t('auth.emailRequired');
  const passwordError = Boolean(status) && !nameError && !emailError;

  return (
    <KeyboardAvoidingView behavior={keyboardAvoidanceBehavior(Platform.OS)} style={styles.root}>
      <Surface
        elevation={1}
        style={[styles.formCard, { backgroundColor: theme.colors.surface }]}
        testID="register-form-card"
      >
        <Text variant="titleLarge">{t('auth.registerTitle')}</Text>
        <TextInput
          accessibilityLabel={t('auth.displayName')}
          error={nameError}
          label={t('auth.displayName')}
          maxLength={displayNameMaxLength}
          mode="outlined"
          onChangeText={(value) => setDisplayName(value.slice(0, displayNameMaxLength))}
          placeholder={t('auth.displayName')}
          value={displayName}
        />
        <TextInput
          accessibilityLabel={t('auth.email')}
          autoCapitalize="none"
          autoComplete="username"
          error={emailError}
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
          autoComplete="new-password"
          error={passwordError}
          label={t('auth.password')}
          maxLength={passwordMaxLength}
          mode="outlined"
          onChangeText={(value) => setPassword(value.slice(0, passwordMaxLength))}
          placeholder={t('auth.password')}
          secureTextEntry={!showPassword}
          textContentType="newPassword"
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
          accessibilityLabel={t('auth.registerButton')}
          contentStyle={styles.buttonContent}
          mode="contained"
          onPress={() => void submit()}
        >
          {t('auth.registerButton')}
        </Button>
        <Button
          accessibilityLabel={t('auth.loginLink')}
          accessibilityRole="link"
          mode="text"
          onPress={showLogin}
        >
          {t('auth.loginLink')}
        </Button>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
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
