import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';
import { validateEmail, validateStrongPassword } from '../utils/format';

export function RegisterScreen() {
  const { api, palette, setSession, showLogin, t } = useApp();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setStatus(t('auth.nameRequired'));
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setStatus(t('auth.emailRequired'));
      return;
    }

    if (!validateStrongPassword(password)) {
      setStatus(t('auth.passwordRequired'));
      return;
    }

    setStatus(null);

    try {
      const registerResult = await api.registerUser({
        displayName: trimmedName,
        email: trimmedEmail,
        password,
      });

      if (!registerResult.success) {
        setStatus(t('auth.registerFailed'));
        return;
      }

      const session = await api.login({
        email: trimmedEmail,
        password,
      });

      if (!session) {
        setStatus(t('auth.registerFailed'));
        return;
      }

      await setSession(session);
    } catch {
      setStatus(t('auth.registerFailed'));
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: palette.background }]}
    >
      <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.formTitle, { color: palette.ink }]}>{t('auth.registerTitle')}</Text>
        <TextInput
          onChangeText={setDisplayName}
          placeholder={t('auth.displayName')}
          placeholderTextColor={palette.inkMuted}
          style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={displayName}
        />
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder={t('auth.email')}
          placeholderTextColor={palette.inkMuted}
          style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={email}
        />
        <TextInput
          onChangeText={setPassword}
          placeholder={t('auth.password')}
          placeholderTextColor={palette.inkMuted}
          secureTextEntry
          style={[styles.input, { backgroundColor: palette.panel, borderColor: palette.border, color: palette.ink }]}
          value={password}
        />
        <Pressable style={[styles.primaryButton, { backgroundColor: palette.accent }]} onPress={() => void submit()}>
          <Text style={styles.primaryButtonLabel}>{t('auth.registerButton')}</Text>
        </Pressable>
        <Pressable onPress={showLogin}>
          <Text style={[styles.link, { color: palette.accent }]}>{t('auth.loginLink')}</Text>
        </Pressable>
        {status ? <Text style={[styles.status, { color: palette.danger }]}>{status}</Text> : null}
      </View>
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
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  formTitle: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  primaryButton: {
    borderRadius: 18,
    paddingVertical: 15,
  },
  primaryButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
  },
});
