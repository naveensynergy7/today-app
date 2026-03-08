import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Focus on what matters today.',
    subtitle: 'One list. Today’s tasks. No clutter.',
  },
  {
    id: '2',
    title: 'Check off tasks.\nSee your progress.',
    subtitle: 'Track completion and build a simple habit.',
  },
  {
    id: '3',
    title: 'Keep it simple.\nGet it done.',
    subtitle: 'Tasks roll over. Calendar and stats when you need them.',
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [index, setIndex] = useState(0);
  const listRef = useRef(null);

  const onNext = () => {
    if (index < SLIDES.length - 1) {
      const next = index + 1;
      setIndex(next);
      listRef.current?.scrollToIndex({ index: next, animated: true });
    } else {
      onFinish();
    }
  };

  const onSkip = () => {
    onFinish();
  };

  const onScroll = (e) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    if (i >= 0 && i < SLIDES.length) setIndex(i);
  };

  const renderSlide = ({ item }) => (
    <View style={styles.slide}>
      <View style={styles.decorWrap}>
        <View style={[styles.decor, styles.decor1]} />
        <View style={[styles.decor, styles.decor2]} />
        <View style={[styles.decor, styles.decor3]} />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        bounces={false}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={onSkip}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[styles.dot, i === index && styles.dotActive]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.nextBtn}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Ionicons name="arrow-forward" size={28} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFC',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    justifyContent: 'flex-start',
  },
  decorWrap: {
    position: 'absolute',
    bottom: 80,
    right: -40,
    width: 200,
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  decor: {
    position: 'absolute',
    backgroundColor: colors.primaryLight,
    opacity: 0.2,
    borderRadius: 8,
  },
  decor1: {
    width: 100,
    height: 120,
    bottom: 0,
    right: 20,
    transform: [{ rotate: '-8deg' }],
  },
  decor2: {
    width: 90,
    height: 110,
    bottom: 8,
    right: 60,
    transform: [{ rotate: '4deg' }],
    opacity: 0.15,
  },
  decor3: {
    width: 80,
    height: 100,
    bottom: 16,
    right: 95,
    transform: [{ rotate: '-4deg' }],
    opacity: 0.12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 36,
    letterSpacing: -0.6,
    marginTop: 60,
    maxWidth: '90%',
  },
  subtitle: {
    ...typography.body,
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: spacing.md,
    lineHeight: 24,
    maxWidth: '85%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl + 20,
    paddingTop: spacing.md,
  },
  skipBtn: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  nextBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
