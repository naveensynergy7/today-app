import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useFocusEffect } from '@react-navigation/native';
import { getTasksByDate, getCompletionStatsForDate } from '../db/database';
import { colors, spacing, radius, typography, shadows } from '../theme';

function getMonthDates(year, month) {
  const dates = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const d = new Date(first);
  while (d <= last) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function percentColor(done, total) {
  if (total === 0) return colors.border;
  const pct = (done / total) * 100;
  if (pct >= 80) return colors.success;
  if (pct >= 50) return colors.warning;
  return colors.error;
}

export default function CalendarScreen() {
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [dayTasks, setDayTasks] = useState([]);
  const [dayStats, setDayStats] = useState({ total: 0, done: 0 });

  const loadMarkedDates = useCallback(async (year, month) => {
    const dates = getMonthDates(year, month);
    const marked = {};
    for (const dateStr of dates) {
      const stats = await getCompletionStatsForDate(dateStr);
      if (stats.total > 0) {
        marked[dateStr] = {
          dotColor: percentColor(stats.done, stats.total),
        };
      }
    }
    setMarkedDates(marked);
  }, []);

  const handleMonthChange = useCallback(
    (date) => {
      const dateStr = date?.dateString || date;
      if (!dateStr) return;
      const [year, monthNum] = dateStr.split('-').map(Number);
      setCurrentMonth(dateStr.slice(0, 7));
      loadMarkedDates(year, monthNum - 1);
    },
    [loadMarkedDates]
  );

  const handleDayPress = useCallback(async (day) => {
    const tasks = await getTasksByDate(day.dateString);
    const stats = await getCompletionStatsForDate(day.dateString);
    setSelectedDate(day.dateString);
    setDayTasks(tasks);
    setDayStats(stats);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const [year, month] = currentMonth.split('-').map(Number);
      loadMarkedDates(year, month - 1);
    }, [currentMonth, loadMarkedDates])
  );

  const initialDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const percentage =
    dayStats.total > 0 ? Math.round((dayStats.done / dayStats.total) * 100) : null;

  const calendarTheme = {
    todayTextColor: colors.primary,
    selectedDayBackgroundColor: colors.primary,
    selectedDayTextColor: colors.surface,
    arrowColor: colors.primary,
    monthTextColor: colors.text,
    textDayFontSize: 15,
    textMonthFontSize: 17,
    textDayHeaderFontSize: 13,
    textDayStyle: { color: colors.text },
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calendar</Text>
        <Text style={styles.headerSubtitle}>Tap a day to see tasks</Text>
      </View>
      <View style={styles.calendarCard}>
        <Calendar
          current={initialDate}
          onMonthChange={handleMonthChange}
          markedDates={markedDates}
          onDayPress={handleDayPress}
          theme={calendarTheme}
          style={styles.calendar}
        />
      </View>

      <Modal
        visible={selectedDate != null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedDate(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedDate(null)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>{selectedDate || ''}</Text>
                {percentage != null && (
                  <View style={styles.percentBadge}>
                    <Ionicons name="stats-chart" size={14} color={colors.primary} />
                    <Text style={styles.modalPercent}>
                      {dayStats.done}/{dayStats.total} · {percentage}%
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setSelectedDate(null)}
                style={styles.modalCloseBtn}
              >
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.taskList} showsVerticalScrollIndicator={false}>
              {dayTasks.length === 0 ? (
                <View style={styles.emptyDay}>
                  <Ionicons name="calendar-outline" size={40} color={colors.border} />
                  <Text style={styles.noTasks}>No tasks this day</Text>
                </View>
              ) : (
                dayTasks.map((t) => (
                  <View key={t.id} style={styles.taskRow}>
                    <Ionicons
                      name={t.done === 1 ? 'checkmark-circle' : 'ellipse-outline'}
                      size={22}
                      color={t.done === 1 ? colors.success : colors.border}
                    />
                    <Text
                      style={[styles.taskTitle, t.done === 1 && styles.taskDone]}
                      numberOfLines={1}
                    >
                      {t.title}
                    </Text>
                    <Text style={styles.taskStatus}>{t.done === 1 ? 'Done' : 'Pending'}</Text>
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setSelectedDate(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  calendarCard: {
    margin: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  calendar: {
    borderRadius: radius.lg,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 16,
    maxHeight: '72%',
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.titleSmall,
    color: colors.text,
  },
  percentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  modalPercent: {
    ...typography.captionMedium,
    color: colors.primary,
  },
  modalCloseBtn: {
    padding: spacing.xs,
  },
  taskList: {
    maxHeight: 260,
    marginBottom: spacing.md,
  },
  emptyDay: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  noTasks: {
    ...typography.body,
    color: colors.textMuted,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  taskTitle: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  taskDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskStatus: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneBtnText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
