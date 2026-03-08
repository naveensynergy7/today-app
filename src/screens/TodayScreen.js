import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useFocusEffect } from '@react-navigation/native';

import {
  getTasksByDate,
  addTask,
  setTaskDone,
  updateTaskOrder,
  deleteTask,
  getTodayDate,
} from '../db/database';
import { scheduleReminder } from '../notifications/reminders';
import { colors, spacing, radius, typography, shadows } from '../theme';

export default function TodayScreen() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [reorderModalVisible, setReorderModalVisible] = useState(false);

  const today = getTodayDate();

  const loadTasks = useCallback(async () => {
    try {
      const list = await getTasksByDate(today);
      setTasks(list);
    } catch (e) {
      console.warn(e);
    } finally {
      setLoading(false);
    }
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [loadTasks])
  );

  const handleAddTask = useCallback(async () => {
    const t = title.trim() || 'Untitled';
    const d = description.trim();
    await addTask(t, d, today);
    setTitle('');
    setDescription('');
    setAddModalVisible(false);
    await loadTasks();
    await scheduleReminder();
  }, [title, description, today, loadTasks]);

  const handleToggleDone = useCallback(
    async (id, done) => {
      await setTaskDone(id, !done);
      await loadTasks();
      await scheduleReminder();
    },
    [loadTasks]
  );

  const handleDelete = useCallback(
    async (id) => {
      await deleteTask(id);
      await loadTasks();
      await scheduleReminder();
    },
    [loadTasks]
  );

  const handleReorderEnd = useCallback(
    async ({ data }) => {
      const ids = data.map((t) => t.id);
      await updateTaskOrder(today, ids);
      await loadTasks();
      setReorderModalVisible(false);
    },
    [today, loadTasks]
  );

  const { incomplete, completed } = useMemo(() => {
    const inc = tasks.filter((t) => t.done === 0);
    const done = tasks.filter((t) => t.done === 1);
    return { incomplete: inc, completed: done };
  }, [tasks]);

  const dateLabel = useMemo(() => {
    const [y, m, d] = today.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }, [today]);

  const renderIncompleteRow = useCallback(
    (item) => (
      <View key={`inc-${item.id}`} style={styles.taskCard}>
        <View style={styles.taskContent}>
          <Text style={styles.taskTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.taskDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.checkWrap}
          onPress={() => handleToggleDone(item.id, item.done)}
          activeOpacity={0.7}
        >
          <Ionicons name="ellipse-outline" size={26} color={colors.border} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    ),
    [handleToggleDone, handleDelete]
  );

  const renderReorderItem = useCallback(
    ({ item, drag, isActive }) => (
      <TouchableOpacity
        onLongPress={drag}
        style={[styles.reorderRow, isActive && styles.taskCardActive]}
        activeOpacity={1}
      >
        <Ionicons name="reorder-two" size={22} color={colors.textSecondary} />
        <Text style={styles.reorderTitle} numberOfLines={1}>
          {item.title}
        </Text>
      </TouchableOpacity>
    ),
    []
  );

  const renderCompletedItem = useCallback(
    ({ item }) => (
      <View style={[styles.taskCard, styles.taskCardDone]}>
        <View style={styles.taskContent}>
          <Text style={[styles.taskTitle, styles.taskTitleDone]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.taskDesc} numberOfLines={2}>
              {item.description}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.checkWrap}
          onPress={() => handleToggleDone(item.id, item.done)}
          activeOpacity={0.7}
        >
          <Ionicons name="checkmark-circle" size={26} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item.id)}
          style={styles.deleteBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    ),
    [handleToggleDone, handleDelete]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.dateHeader}>
        <View>
          <Text style={styles.dateTitle}>Today.</Text>
          <Text style={styles.dateSubtitle}>{dateLabel}</Text>
        </View>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.hint}>Loading…</Text>
        ) : (
          <>
            {/* Tasks section */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Tasks</Text>
              {incomplete.length > 1 ? (
                <TouchableOpacity
                  onPress={() => setReorderModalVisible(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.reorderLink}>Reorder</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {incomplete.length === 0 ? (
              <Text style={styles.sectionEmpty}>No tasks yet</Text>
            ) : (
              incomplete.map((item) => renderIncompleteRow(item))
            )}

            {/* Completed section */}
            <Text style={[styles.sectionTitle, styles.sectionTitleCompleted]}>Completed</Text>
            {completed.length === 0 ? (
              <Text style={styles.sectionEmpty}>No completed tasks</Text>
            ) : (
              completed.map((item) => (
                <View key={`done-${item.id}`}>{renderCompletedItem({ item })}</View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>

      {/* Reorder modal */}
      <Modal
        visible={reorderModalVisible}
        animationType="slide"
        onRequestClose={() => setReorderModalVisible(false)}
      >
        <SafeAreaView style={styles.reorderModalContainer}>
          <View style={styles.reorderModalHeader}>
            <TouchableOpacity onPress={() => setReorderModalVisible(false)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.reorderModalTitle}>Reorder tasks</Text>
            <TouchableOpacity
              onPress={() => setReorderModalVisible(false)}
              style={styles.reorderDoneWrap}
            >
              <Text style={styles.reorderDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
          <DraggableFlatList
            data={incomplete}
            onDragEnd={handleReorderEnd}
            keyExtractor={(item) => `ro-${item.id}`}
            renderItem={renderReorderItem}
            activationDistance={8}
          />
        </SafeAreaView>
      </Modal>

      {/* Add task modal */}
      <Modal
        visible={addModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAddModalVisible(false)}
        >
          <View style={styles.modalCard} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>New task</Text>
            <TextInput
              style={styles.input}
              placeholder="Task title"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={colors.textMuted}
            />
            <TextInput
              style={[styles.input, styles.inputDesc]}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={colors.textMuted}
              multiline
            />
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleAddTask}
              activeOpacity={0.82}
            >
              <Text style={styles.addBtnText}>Add task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setAddModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
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
  dateHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dateTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  dateSubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: 6,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: 120,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  reorderLink: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '600',
  },
  sectionTitleCompleted: {
    marginTop: spacing.xl,
  },
  reorderModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  reorderModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  reorderModalTitle: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  reorderDoneWrap: {
    minWidth: 56,
    alignItems: 'flex-end',
  },
  reorderDoneText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  reorderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: radius.lg,
    ...shadows.cardSubtle,
  },
  reorderTitle: {
    fontSize: 16,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  sectionEmpty: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderLeftWidth: 3,
    borderLeftColor: colors.primaryLight,
    ...shadows.card,
  },
  taskCardActive: {
    opacity: 0.98,
  },
  taskCardDone: {
    borderLeftColor: colors.borderLight,
  },
  taskContent: {
    flex: 1,
    minWidth: 0,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
    fontWeight: '500',
  },
  taskDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  checkWrap: {
    paddingLeft: spacing.sm,
    justifyContent: 'center',
  },
  deleteBtn: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  hint: {
    padding: spacing.xl,
    textAlign: 'center',
    ...typography.body,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.fab,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.fab,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl + 24,
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: colors.border,
    borderRadius: 2.5,
    alignSelf: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: spacing.xl,
  },
  input: {
    borderWidth: 0,
    borderRadius: 14,
    paddingHorizontal: spacing.lg,
    paddingVertical: 16,
    fontSize: 16,
    marginBottom: spacing.md,
    backgroundColor: colors.surfaceSubtle,
    color: colors.text,
  },
  inputDesc: {
    minHeight: 88,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  addBtnText: {
    color: colors.surface,
    fontSize: 17,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  cancelBtnText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
