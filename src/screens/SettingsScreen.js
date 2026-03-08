import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getNotificationsPaused,
  setNotificationsPaused,
} from '../notifications/reminders';
import { colors, spacing, radius, typography, shadows } from '../theme';

export default function SettingsScreen() {
  const [paused, setPaused] = useState(false);

  const loadPaused = useCallback(async () => {
    const value = await getNotificationsPaused();
    setPaused(value);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPaused();
    }, [loadPaused])
  );

  const handleToggle = useCallback(async (value) => {
    setPaused(!value);
    await setNotificationsPaused(!value);
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.screenTitle}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Ionicons
              name={paused ? 'notifications-off-outline' : 'notifications-outline'}
              size={22}
              color={colors.textSecondary}
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Task reminders</Text>
            <Switch
              value={!paused}
              onValueChange={handleToggle}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={colors.surface}
            />
          </View>
          <Text style={styles.rowHint}>
            Get reminded for your first incomplete task and a daily quote.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  screenTitle: {
    ...typography.titleSmall,
    color: colors.text,
    marginBottom: spacing.xl,
    letterSpacing: -0.3,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.cardSubtle,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIcon: {
    marginRight: spacing.sm,
  },
  rowLabel: {
    flex: 1,
    ...typography.body,
    color: colors.text,
  },
  rowHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    paddingLeft: 34,
  },
});
