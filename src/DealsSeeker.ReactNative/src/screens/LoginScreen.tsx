import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useApp } from '../hooks/useApp';
import { useStatusNotice } from '../hooks/useStatusNotice';
import { announceStatus } from '../utils/announce';
import { authFormStyles } from '../utils/authFormStyles';
import { keyboardAvoidanceBehavior } from '../utils/layout';

export function LoginScreen() {
  const { api, palette, sessionNotice, setSession, showRegister, t } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { status, reportStatus: setStatus } = useStatusNotice();
  const displayedStatus = status ?? (sessionNotice ? t(sessionNotice) : null);

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
    <KeyboardAvoidingView
      behavior={keyboardAvoidanceBehavior(Platform.OS)}
      style={[authFormStyles.root, { backgroundColor: palette.background }]}
    >
      <View style={[styles.brandCard, { backgroundColor: palette.panelAlt, borderColor: palette.border }]}>
        <Text style={[styles.brandGlyph, { color: palette.accent }]}>DS</Text>
        <Text style={[styles.brandTitle, { color: palette.ink }]}>{t('app.title')}</Text>
        <Text style={[styles.brandSubtitle, { color: palette.inkMuted }]}>{t('app.subtitle')}</Text>
      </View>

      <View style={[authFormStyles.formCard, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Text style={[styles.formTitle, { color: palette.ink }]}>{t('auth.loginTitle')}</Text>
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
          <Text style={[authFormStyles.link, { color: palette.accent }]}>
            {t(showPassword ? 'auth.hidePassword' : 'auth.showPassword')}
          </Text>
        </Pressable>
        <Pressable
          accessibilityLabel={t('auth.loginButton')}
          accessibilityRole="button"
          style={[authFormStyles.primaryButton, { backgroundColor: palette.accent }]}
          onPress={() => void submit()}
        >
          <Text style={[authFormStyles.primaryButtonLabel, { color: palette.onAccent }]}>
            {t('auth.loginButton')}
          </Text>
        </Pressable>
        <Pressable accessibilityLabel={t('auth.createAccountLink')} accessibilityRole="link" onPress={showRegister}>
          <Text style={[authFormStyles.link, { color: palette.accent }]}>{t('auth.createAccountLink')}</Text>
        </Pressable>
        {displayedStatus ? (
          <Text accessibilityLiveRegion="polite" style={[authFormStyles.status, { color: palette.danger }]}>
            {displayedStatus}
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
  formTitle: {
    fontFamily: 'Georgia',
    fontSize: 24,
    fontWeight: '700',
  },
  visibilityToggle: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
    minHeight: 44,
  },
});
