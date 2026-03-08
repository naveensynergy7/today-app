import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep native splash visible until we hide it (then hide immediately)
SplashScreen.preventAutoHideAsync();
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { initDb, rolloverIncompleteTasks, getYesterdayDate } from './src/db/database';
import { requestPermissions } from './src/notifications/reminders';
import { colors, typography } from './src/theme';
import OnboardingScreen from './src/screens/OnboardingScreen';
import TodayScreen from './src/screens/TodayScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const ONBOARDING_KEY = 'onboardingDone';

const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }) {
  const map = {
    Today: { active: 'today', inactive: 'today-outline' },
    Calendar: { active: 'calendar', inactive: 'calendar-outline' },
    Analytics: { active: 'stats-chart', inactive: 'stats-chart-outline' },
    Settings: { active: 'settings', inactive: 'settings-outline' },
  };
  const icons = map[name] || { active: 'ellipse', inactive: 'ellipse-outline' };
  return (
    <Ionicons
      name={focused ? icons.active : icons.inactive}
      size={24}
      color={focused ? colors.primary : colors.textMuted}
    />
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);
  const [onboardingDone, setOnboardingDone] = useState(null);

  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await initDb();
        const yesterday = getYesterdayDate();
        await rolloverIncompleteTasks(yesterday);
        await requestPermissions();
        const value = await AsyncStorage.getItem(ONBOARDING_KEY);
        if (!cancelled) {
          setReady(true);
          setOnboardingDone(value === 'true');
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to init');
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Hide native splash as soon as we're about to render (any screen)
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="warning-outline" size={48} color={colors.error} style={{ marginBottom: 16 }} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.centered}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading…</Text>
        </View>
      </View>
    );
  }

  if (onboardingDone === false) {
    return (
      <>
        <OnboardingScreen onFinish={handleOnboardingFinish} />
        <StatusBar style="dark" />
      </>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused }) => <TabIcon name={route?.name ?? 'Today'} focused={focused} />,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
            tabBarStyle: {
              backgroundColor: colors.surface,
              borderTopColor: colors.borderLight,
              borderTopWidth: 1,
              paddingTop: 10,
              height: Platform.OS === 'ios' ? 88 : 68,
              ...Platform.select({
                ios: {
                  shadowColor: '#1E293B',
                  shadowOffset: { width: 0, height: -4 },
                  shadowOpacity: 0.06,
                  shadowRadius: 12,
                },
                android: { elevation: 12 },
              }),
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Today" component={TodayScreen} />
          <Tab.Screen name="Calendar" component={CalendarScreen} />
          <Tab.Screen name="Analytics" component={AnalyticsScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loaderWrap: {
    alignItems: 'center',
    gap: 16,
  },
  loaderText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    color: colors.error,
    ...typography.body,
    paddingHorizontal: 24,
    textAlign: 'center',
  },
});
