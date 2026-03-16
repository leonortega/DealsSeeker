import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';

export function LoginScreen() {
  const { api, palette, setSession, showRegister, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function submit() {
    setStatus(null);

    try {
      const session = await api.login({
        email: email.trim(),
        password,
      });

      if (!session) {
        setStatus(t('auth.invalidCredentials'));
        return;
      }

      await setSession(session);
    } catch {
      setStatus(t('auth.loginFailed'));
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.root, { backgroundColor: palette.background }]}
    >
      <View style={[styles.brandCard, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
        <Text style={[styles.brandGlyph, { color: palette.accent }]}>DS</Text>
        <Text style={[styles.brandTitle, { color: palette.ink }]}>{t('app.title')}</Text>
        <Text style={[styles.brandSubtitle, { color: palette.inkMuted }]}>{t('app.subtitle')}</Text>
      </View>

      <View style={[styles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.formTitle, { color: palette.ink }]}>{t('auth.loginTitle')}</Text>
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
          <Text style={styles.primaryButtonLabel}>{t('auth.loginButton')}</Text>
        </Pressable>
        <Pressable onPress={showRegister}>
          <Text style={[styles.link, { color: palette.accent }]}>{t('auth.createAccountLink')}</Text>
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
  brandCard: {
    borderRadius: 28,
    borderWidth: 1,
    marginBottom: 16,
    padding: 20,
  },
  brandGlyph: {
    fontFamily: 'Georgia',
    fontSize: 44,
    fontWeight: '700',
  },
  brandTitle: {
    fontFamily: 'Georgia',
    fontSize: 30,
    fontWeight: '700',
    marginTop: 10,
  },
  brandSubtitle: {
    fontSize: 15,
    marginTop: 8,
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
