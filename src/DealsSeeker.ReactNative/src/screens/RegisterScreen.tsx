import { platformTouchFloor } from '../utils/layout';
import { landmarkFontFamily } from '../utils/typography';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { authFormStyles } from '../utils/authFormStyles';
import { validateEmail, validateStrongPassword } from '../utils/format';
import { keyboardAvoidanceBehavior } from '../utils/layout';

const displayNameMaxLength = 80;
const emailMaxLength = 254;
const passwordMaxLength = 200;

export function RegisterScreen() {
  const { api, palette, setSession, showLogin, t } = useApp();
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

  return (
    <KeyboardAvoidingView
      behavior={keyboardAvoidanceBehavior(Platform.OS)}
      style={[authFormStyles.root, { backgroundColor: palette.background }]}
    >
      <View style={[authFormStyles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.formTitle, { color: palette.ink }]}>{t('auth.registerTitle')}</Text>
        <TextInput
          accessibilityLabel={t('auth.displayName')}
          maxLength={displayNameMaxLength}
          onChangeText={(value) => setDisplayName(value.slice(0, displayNameMaxLength))}
          placeholder={t('auth.displayName')}
          placeholderTextColor={palette.inkMuted}
          style={[authFormStyles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={displayName}
        />
        <TextInput
          accessibilityLabel={t('auth.email')}
          autoCapitalize="none"
          autoComplete="username"
          keyboardType="email-address"
          textContentType="username"
          maxLength={emailMaxLength}
          onChangeText={(value) => setEmail(value.slice(0, emailMaxLength))}
          placeholder={t('auth.email')}
          placeholderTextColor={palette.inkMuted}
          style={[authFormStyles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={email}
        />
        <TextInput
          accessibilityLabel={t('auth.password')}
          autoComplete="new-password"
          maxLength={passwordMaxLength}
          textContentType="newPassword"
          onChangeText={(value) => setPassword(value.slice(0, passwordMaxLength))}
          placeholder={t('auth.password')}
          placeholderTextColor={palette.inkMuted}
          secureTextEntry={!showPassword}
          style={[authFormStyles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={password}
        />
        <Pressable
          accessibilityLabel={t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
          accessibilityRole="button"
          accessibilityState={{ expanded: showPassword }}
          onPress={() => setShowPassword((shown) => !shown)}
          style={styles.visibilityToggle}
        >
          <Text style={[authFormStyles.link, { color: palette.accentText }]}>
            {t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t('auth.registerButton')}
          accessibilityRole="button"
          style={[authFormStyles.primaryButton, { backgroundColor: palette.accent }]}
          onPress={() => void submit()}
        >
          <Text style={[authFormStyles.primaryButtonLabel, { color: palette.onAccent }]}>
            {t('auth.registerButton')}
          </Text>
        </Pressable>
        <Pressable accessibilityLabel={t('auth.loginLink')} accessibilityRole="link" onPress={showLogin}>
          <Text style={[authFormStyles.link, { color: palette.accentText }]}>{t('auth.loginLink')}</Text>
        </Pressable>
        {status ? (
          <Text accessibilityLiveRegion="polite" style={[authFormStyles.status, { color: palette.danger }]}>
            {status}
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  formTitle: {
    fontFamily: landmarkFontFamily(),
    fontSize: 24,
    fontWeight: '700',
  },
  visibilityToggle: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: platformTouchFloor,
  },
});
