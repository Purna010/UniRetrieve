import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/colors';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup } = useAuth();

  const handleSubmit = async () => {
    setError('');
    if (!email || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    let res;
    if (isLogin) {
      res = await login(email, password);
    } else {
      res = await signup(name, email, password, studentId || 'N/A');
    }
    setLoading(false);

    if (!res.success) {
      setError(res.error || 'Authentication failed');
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'student') {
      setEmail('anush@univ.edu');
      setPassword('password123');
    } else {
      setEmail('security@univ.edu');
      setPassword('password123');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logoBadge}>AI + GEOSPATIAL + WEB3</Text>
          <Text style={styles.title}>UniRetrieve</Text>
          <Text style={styles.subtitle}>Campus Asset Recovery Platform</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, isLogin && styles.activeTab]}
              onPress={() => { setIsLogin(true); setError(''); }}
            >
              <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, !isLogin && styles.activeTab]}
              onPress={() => { setIsLogin(false); setError(''); }}
            >
              <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Register</Text>
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Anush Kumar"
                placeholderTextColor={COLORS.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>University Email</Text>
            <TextInput
              style={styles.input}
              placeholder="student@univ.edu"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student ID / Roll Number</Text>
              <TextInput
                style={styles.input}
                placeholder="STUDENT123"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="characters"
                value={studentId}
                onChangeText={setStudentId}
              />
            </View>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#030712" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isLogin ? 'Sign In to Campus Portal' : 'Create Student Account'}
              </Text>
            )}
          </TouchableOpacity>

          {isLogin && (
            <View style={styles.demoRow}>
              <Text style={styles.demoLabel}>Demo Quick-Fill:</Text>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleDemoFill('student')}
              >
                <Text style={styles.demoBtnText}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.demoBtn}
                onPress={() => handleDemoFill('admin')}
              >
                <Text style={styles.demoBtnText}>Security</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25,
  },
  logoBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.cyan,
    backgroundColor: 'rgba(0, 245, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: COLORS.cyan,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#030712',
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.surfaceCard,
    borderRadius: 10,
    padding: 12,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: COLORS.surfaceBorder,
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: COLORS.cyan,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#030712',
    fontWeight: 'bold',
    fontSize: 15,
  },
  errorText: {
    color: COLORS.rose,
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'center',
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 8,
  },
  demoLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  demoBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  demoBtnText: {
    fontSize: 11,
    color: COLORS.cyan,
    fontWeight: '600',
  },
});
