import { useState } from 'react';
import { KeyboardAvoidingView, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';
import { announceStatus } from '../utils/announce';
import { authFormStyles } from '../utils/authFormStyles';
import { validateEmail, validateStrongPassword } from '../utils/format';

export function RegisterScreen() {
  const { api, palette, setSession, showLogin, t } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  function reportStatus(message: string | null) {
    setStatus(message);
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
      behavior="padding"
      style={[authFormStyles.root, { backgroundColor: palette.background }]}
    >
      <View style={[authFormStyles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.formTitle, { color: palette.ink }]}>{t('auth.registerTitle')}</Text>
        <TextInput
          accessibilityLabel={t('auth.displayName')}
          onChangeText={setDisplayName}
          placeholder={t('auth.displayName')}
          placeholderTextColor={palette.inkMuted}
          style={[authFormStyles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={displayName}
        />
        <TextInput
          accessibilityLabel={t('auth.email')}
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder={t('auth.email')}
          placeholderTextColor={palette.inkMuted}
          style={[authFormStyles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={email}
        />
        <TextInput
          accessibilityLabel={t('auth.password')}
          onChangeText={setPassword}
          placeholder={t('auth.password')}
          placeholderTextColor={palette.inkMuted}
          secureTextEntry
          style={[authFormStyles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={password}
        />
        <Pressable
          accessibilityLabel={t('auth.registerButton')}
          accessibilityRole="button"
          style={[authFormStyles.primaryButton, { backgroundColor: palette.accent }]}
          onPress={() => void submit()}
        >
          <Text style={authFormStyles.primaryButtonLabel}>{t('auth.registerButton')}</Text>
        </Pressable>
        <Pressable accessibilityLabel={t('auth.loginLink')} accessibilityRole="link" onPress={showLogin}>
          <Text style={[authFormStyles.link, { color: palette.accent }]}>{t('auth.loginLink')}</Text>
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
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
});
