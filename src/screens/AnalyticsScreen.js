import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  getAllTimeStats,
  getCompletionStatsForRange,
  getCompletionStatsForDate,
  getTodayDate,
} from '../db/database';
import { colors, spacing, radius, typography, shadows } from '../theme';

function StatCard({ title, done, total, subtitle, iconName }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const isGood = pct >= 80;
  const isMid = pct >= 50 && pct < 80;
  const percentColor = isGood ? colors.success : isMid ? colors.warning : colors.error;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight + '20' }]}>
          <Ionicons name={iconName} size={24} color={colors.primary} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardPercent, { color: percentColor }]}>{pct}%</Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${pct}%`,
              backgroundColor: percentColor,
            },
          ]}
        />
      </View>
      <Text style={styles.cardSubtitle}>
        {done} of {total} tasks completed
      </Text>
      {subtitle ? <Text style={styles.cardHint}>{subtitle}</Text> : null}
    </View>
  );
}

export default function AnalyticsScreen() {
  const [overall, setOverall] = useState({ total: 0, done: 0 });
  const [month, setMonth] = useState({ total: 0, done: 0 });
  const [today, setToday] = useState({ total: 0, done: 0 });

  const loadStats = useCallback(async () => {
    const [all, monthStats, todayStats] = await Promise.all([
      getAllTimeStats(),
      (() => {
        const d = new Date();
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return getCompletionStatsForRange(
          start.toISOString().slice(0, 10),
          end.toISOString().slice(0, 10)
        );
      })(),
      getCompletionStatsForDate(getTodayDate()),
    ]);
    setOverall(all);
    setMonth(monthStats);
    setToday(todayStats);
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics</Text>
        <Text style={styles.headerSubtitle}>Your completion at a glance</Text>
      </View>
      <View style={styles.content}>
        <StatCard
          title="Overall"
          done={overall.done}
          total={overall.total}
          subtitle="All time"
          iconName="trophy-outline"
        />
        <StatCard
          title="This month"
          done={month.done}
          total={month.total}
          subtitle={monthName}
          iconName="calendar-outline"
        />
        <StatCard
          title="Today"
          done={today.done}
          total={today.total}
          subtitle={getTodayDate()}
          iconName="today-outline"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerTitle: {
    ...typography.title,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    ...typography.titleSmall,
    color: colors.text,
  },
  cardPercent: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  cardSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  cardHint: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
});
