import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTasksByDate, getTodayDate } from '../db/database';
import { MOTIVATIONAL_QUOTES } from './quotes';

const REMINDER_ID = 'today-task-reminder';
const PAUSE_KEY = 'notificationsPaused';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function getNotificationsPaused() {
  try {
    const value = await AsyncStorage.getItem(PAUSE_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setNotificationsPaused(paused) {
  await AsyncStorage.setItem(PAUSE_KEY, paused ? 'true' : 'false');
  if (paused) {
    await cancelReminder();
  } else {
    await scheduleReminder();
  }
}

export async function cancelReminder() {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch (_) {}
}

function getRandomQuote() {
  return MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
}

export async function scheduleReminder() {
  const paused = await getNotificationsPaused();
  if (paused) return;

  await cancelReminder();

  const today = getTodayDate();
  const tasks = await getTasksByDate(today);
  const firstIncomplete = tasks.find((t) => t.done === 0);
  if (!firstIncomplete) return;

  const quote = getRandomQuote();
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: `Today: ${firstIncomplete.title}`,
        body: quote,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 3600,
        repeats: true,
      },
    });
  } catch (e) {
    console.warn('Failed to schedule reminder:', e);
  }
}
