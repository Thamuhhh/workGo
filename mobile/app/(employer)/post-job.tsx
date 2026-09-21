import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Text, Input, Button, Card } from '../../src/components/ui';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { useEmployerJobsStore } from '../../src/store/employerJobsStore';

const DEFAULT_CATEGORY = 'Catering';

const CATEGORIES: { name: string; icon: string }[] = [
  { name: 'Catering', icon: 'restaurant' },
  { name: 'Waiter / Server', icon: 'person-outline' },
  { name: 'Kitchen Helper', icon: 'construct-outline' },
  { name: 'Event Promoter', icon: 'megaphone' },
  { name: 'Event Setup', icon: 'grid-outline' },
  { name: 'Cleaning Staff', icon: 'sparkles' },
  { name: 'Loading / Unloading', icon: 'car' },
  { name: 'Retail Helper', icon: 'briefcase-outline' },
  { name: 'Delivery Helper', icon: 'paper-plane-outline' },
  { name: 'General Helper', icon: 'bulb-outline' },
  { name: 'MC / Anchor', icon: 'mic' },
  { name: 'Event Coordinator', icon: 'people-outline' },
];

const TITLE_SUGGESTIONS = [
  'Wedding Catering Staff',
  'Birthday Party Promoter',
  'MC / Anchor for Function',
  'Kitchen Helper',
  'Event Setup Crew',
  'Warehouse Load / Unload',
  'Retail Store Helper',
  'Waiter / Server',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const QUICK_DAYS = ['Today', 'Tomorrow', 'Day after'] as const;

const TIME_SLOTS = [
  '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
  '12 PM', '1 PM', '2 PM', '3 PM', '4 PM',
  '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM',
];

function formatDateLabel(d: Date): string {
  return `${WEEKDAYS_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function parseDateText(text: string): Date | null {
  const t = text.trim();
  if (t === 'Today') return startOfDay(new Date());
  if (t === 'Tomorrow') return tomorrow();
  if (t === 'Day after') return addDays(tomorrow(), 1);
  const stripped = t.replace(/^[A-Za-z]+, /, '');
  const parsed = new Date(stripped);
  return isNaN(parsed.getTime()) ? null : startOfDay(parsed);
}

function tomorrow(): Date {
  return addDays(startOfDay(new Date()), 1);
}

function addDays(d: Date, n: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function parseJobDate(d: string): { dateText: string; timeText: string } {
  const sep = d.split(' · ');
  if (sep.length === 2) return { dateText: sep[0], timeText: sep[1] };
  const idx = d.indexOf(',');
  if (idx === -1) return { dateText: d.trim(), timeText: 'Full Day' };
  return { dateText: d.slice(0, idx).trim(), timeText: d.slice(idx + 1).trim() };
}

export default function PostJobScreen() {
  const params = useLocalSearchParams<{ jobId?: string }>();
  const isEdit = Boolean(params.jobId);
  const jobs = useEmployerJobsStore((s) => s.jobs);
  const addJob = useEmployerJobsStore((s) => s.addJob);
  const updateJob = useEmployerJobsStore((s) => s.updateJob);

  const editingJob = useMemo(
    () => (params.jobId ? jobs.find((j) => j.id === params.jobId) ?? null : null),
    [params.jobId, jobs]
  );

  const parsed = useMemo(
    () => (editingJob ? parseJobDate(editingJob.date) : { dateText: 'Tomorrow', timeText: '6 AM - 4 PM' }),
    [editingJob]
  );

  const [title, setTitle] = useState(editingJob?.title ?? '');
  const [category, setCategory] = useState(editingJob?.category ?? DEFAULT_CATEGORY);
  const [salary, setSalary] = useState(editingJob ? String(editingJob.salaryPerDay) : '900');
  const [workersRequired, setWorkersRequired] = useState(editingJob ? String(editingJob.workersRequired) : '');
  const [location, setLocation] = useState(editingJob?.location ?? '');
  const [customCategoryOpen, setCustomCategoryOpen] = useState(
    editingJob ? !CATEGORIES.some((c) => c.name === editingJob.category) : false
  );

  const initialDate = useMemo(() => parseDateText(parsed.dateText) ?? tomorrow(), [parsed.dateText]);
  const parsedTime = parsed.timeText === 'Full Day' ? null : parsed.timeText.split(' - ');
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [fullDay, setFullDay] = useState(parsed.timeText === 'Full Day');
  const [shiftStart, setShiftStart] = useState(parsedTime?.[0]?.trim() || '6 AM');
  const [shiftEnd, setShiftEnd] = useState(parsedTime?.[1]?.trim() || '4 PM');

  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const sectionOffsets = useRef<number[]>([]);

  const handleSectionLayout = (index: number, y: number) => {
    sectionOffsets.current[index] = y;
  };

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    let step = 1;
    sectionOffsets.current.forEach((offset, i) => {
      if (i < 0 || offset == null) return;
      if (offset <= y + 100) step = i + 1;
    });
    if (step !== activeStep) setActiveStep(step);
  };

  const [errors, setErrors] = useState<{
    title?: string;
    category?: string;
    salary?: string;
    workersRequired?: string;
    location?: string;
  }>({});

  const isStandardCategory = CATEGORIES.some((c) => c.name === category);
  const fullDate = `${formatDateLabel(selectedDate)} · ${fullDay ? 'Full Day' : `${shiftStart} - ${shiftEnd}`}`;

  const startIndex = TIME_SLOTS.indexOf(shiftStart);
  const endOptions = TIME_SLOTS.filter((s, i) => i > startIndex);

  const clearError = (key: keyof typeof errors) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = async () => {
    if (isEdit && !editingJob) return;
    const next: typeof errors = {};
    if (!title.trim()) next.title = 'Job title is required';
    if (!isStandardCategory && !category.trim()) next.category = 'Pick a category or type one';
    if (!salary.trim() || Number(salary) <= 0) next.salary = 'Enter a valid daily salary';
    if (!workersRequired.trim() || Number(workersRequired) <= 0) next.workersRequired = 'Enter the number of workers needed';
    if (!location.trim()) next.location = 'Job location is required';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    const payload = {
      title: title.trim(),
      category: category.trim(),
      salaryPerDay: Number(salary),
      workersRequired: Number(workersRequired),
      foodProvided: true,
      transportProvided: true,
      date: fullDate,
      location: location.trim(),
    };
    setLoading(true);
    if (isEdit && editingJob) {
      await updateJob(editingJob.id, {
        title: title.trim(),
        category: category.trim(),
        salaryPerDay: Number(salary),
        workersRequired: Number(workersRequired),
        foodProvided: true,
        transportProvided: true,
        date: fullDate,
        location: location.trim(),
      });
      setLoading(false);
      Alert.alert('Job Updated', 'Your job details have been saved.');
      router.back();
    } else {
      await addJob(payload);
      setLoading(false);
      Alert.alert('Job Published', 'Your job is now live. Workers can apply immediately.');
      router.replace('/(employer)/(tabs)/home');
    }
  };

  const jumpTo = (d: Date) => {
    setSelectedDate(d);
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ title: isEdit ? 'Edit Job' : '+ Post a New Job' }} />
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="briefcase" size={22} color="#FFFFFF" weight="fill" />
          </View>
          <View style={{ flex: 1 }}>
            <Text variant="h2" weight="bold" color="#0F172A">
              {isEdit ? 'Edit Job' : 'Post a Temp Job'}
            </Text>
            <Text variant="caption" color={Colors.textSecondary}>
              {isEdit ? 'Update the job details below' : 'Find workers within minutes — 4 quick steps'}
            </Text>
          </View>
        </View>

        {/* Step progress bar */}
        <View style={styles.stepBarRow}>
          <View style={styles.stepBar}>
            {[1, 2, 3, 4].map((s) => (
              <View
                key={s}
                style={[styles.stepSeg, s <= activeStep ? styles.stepSegActive : styles.stepSegIdle]}
              />
            ))}
          </View>
          <Text variant="caption" weight="semibold" color={Colors.textSecondary} style={styles.stepLabel}>
            Step {activeStep} of 4
          </Text>
        </View>

        {/* 1. Title */}
        <Section icon="document-text" step="1" title="What's the job?" onLayout={(e) => handleSectionLayout(0, e.nativeEvent.layout.y)}>
          <Input
            label="Job title"
            placeholder="e.g. Wedding Catering Staff"
            value={title}
            onChangeText={(v) => {
              setTitle(v);
              clearError('title');
            }}
            error={errors.title}
          />
          <Text variant="caption" weight="semibold" color={Colors.textSecondary} style={styles.hint}>
            Try one
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pillsRow}
          >
            {TITLE_SUGGESTIONS.map((t) => (
              <Pill key={t} label={t} onPress={() => setTitle(t)} />
            ))}
          </ScrollView>
        </Section>

        {/* 2. Category */}
        <Section icon="grid-outline" step="2" title="Category" onLayout={(e) => handleSectionLayout(1, e.nativeEvent.layout.y)}>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((c) => {
              const active = category === c.name && !customCategoryOpen;
              return (
                <TouchableOpacity
                  key={c.name}
                  activeOpacity={0.75}
                  onPress={() => {
                    setCategory(c.name);
                    setCustomCategoryOpen(false);
                    clearError('category');
                  }}
                  style={[styles.catTile, active && styles.catTileActive]}
                >
                  <View style={[styles.catTileIcon, active && styles.catTileIconActive]}>
                    <Ionicons name={c.icon} size={20} color={active ? '#0F172A' : '#64748B'} weight={active ? 'fill' : 'regular'} />
                  </View>
                  <Text
                    variant="caption"
                    weight={active ? 'bold' : 'medium'}
                    color={active ? '#0F172A' : Colors.textSecondary}
                    numberOfLines={2}
                    style={styles.catTileLabel}
                  >
                    {c.name}
                  </Text>
                  {active && (
                    <View style={styles.catCheck}>
                      <Ionicons name="checkmark" size={11} color="#FFFFFF" weight="bold" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Other */}
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => {
                setCustomCategoryOpen((v) => !v);
                if (!customCategoryOpen) setCategory('');
              }}
              style={[styles.catTile, customCategoryOpen && styles.catTileActive]}
            >
              <View style={[styles.catTileIcon, customCategoryOpen && styles.catTileIconActive]}>
                <Ionicons name="file-tray-outline" size={20} color={customCategoryOpen ? '#0F172A' : '#64748B'} weight="regular" />
              </View>
              <Text
                variant="caption"
                weight={customCategoryOpen ? 'bold' : 'medium'}
                color={customCategoryOpen ? '#0F172A' : Colors.textSecondary}
                numberOfLines={2}
                style={styles.catTileLabel}
              >
                Other
              </Text>
            </TouchableOpacity>
          </View>

          {customCategoryOpen && (
            <View style={styles.expander}>
              <Input
                label="Type category"
                placeholder="e.g. Bouncer / Security"
                value={category}
                onChangeText={(v) => {
                  setCategory(v);
                  clearError('category');
                }}
                error={errors.category}
                autoFocus
              />
            </View>
          )}
          {!customCategoryOpen && errors.category && (
            <Text variant="caption" color={Colors.danger} style={styles.inlineError}>
              {errors.category}
            </Text>
          )}
        </Section>

        {/* 3. Workers & Pay */}
        <Section icon="people-outline" step="3" title="Workers & payment" onLayout={(e) => handleSectionLayout(2, e.nativeEvent.layout.y)}>
          <View style={styles.twoCol}>
            <View style={styles.twoColItem}>
              <Input
                label="Workers needed"
                placeholder="e.g. 15"
                keyboardType="number-pad"
                value={workersRequired}
                onChangeText={(v) => {
                  setWorkersRequired(v);
                  clearError('workersRequired');
                }}
                error={errors.workersRequired}
              />
            </View>
            <View style={styles.twoColItem}>
              <Input
                label="Pay per day (₹)"
                placeholder="e.g. 900"
                keyboardType="number-pad"
                value={salary}
                onChangeText={(v) => {
                  setSalary(v);
                  clearError('salary');
                }}
                error={errors.salary}
              />
            </View>
          </View>
          <View style={styles.payChips}>
            {[700, 900, 1200].map((v) => (
              <Pill
                key={v}
                label={`₹${v}/day`}
                active={salary === String(v)}
                onPress={() => setSalary(String(v))}
              />
            ))}
          </View>
        </Section>

        {/* 4. When & where */}
        <Section icon="calendar-outline" step="4" title="Pick date & time" onLayout={(e) => handleSectionLayout(3, e.nativeEvent.layout.y)}>
          {/* Quick days */}
          <View style={styles.quickRow}>
            {QUICK_DAYS.map((d) => {
              const target = d === 'Today' ? new Date() : d === 'Tomorrow' ? tomorrow() : addDays(tomorrow(), 1);
              const active = sameDay(selectedDate, target);
              return (
                <TouchableOpacity
                  key={d}
                  activeOpacity={0.8}
                  onPress={() => jumpTo(startOfDay(target))}
                  style={[styles.quickChip, active && styles.quickChipActive]}
                >
                  <Text
                    variant="bodySm"
                    weight={active ? 'bold' : 'medium'}
                    color={active ? '#FFFFFF' : Colors.textSecondary}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Calendar */}
          <DayCalendar
            selected={selectedDate}
            onSelect={(d) => setSelectedDate(d)}
          />

          {/* Time */}
          <Text variant="caption" weight="semibold" color={Colors.textSecondary} style={styles.hint}>
            Shift timing
          </Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setFullDay((v) => !v)}
            style={[styles.fullDayRow, fullDay && styles.fullDayRowActive]}
          >
            <View style={[styles.fullDayBox, fullDay && styles.fullDayBoxActive]}>
              {fullDay && <Ionicons name="checkmark" size={12} color="#FFFFFF" weight="bold" />}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight={fullDay ? 'bold' : 'medium'} color="#0F172A">
                Full day
              </Text>
              <Text variant="caption" color={Colors.textMuted}>
                Workers available the whole day
              </Text>
            </View>
          </TouchableOpacity>

          {!fullDay && (
            <View style={styles.timeBlock}>
              <Text variant="caption" weight="semibold" color={Colors.textSecondary} style={styles.hint}>
                Starts at
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsRow}
              >
                {TIME_SLOTS.map((t) => (
                  <Pill
                    key={t}
                    label={t}
                    active={shiftStart === t}
                    onPress={() => {
                      setShiftStart(t);
                      if (TIME_SLOTS.indexOf(shiftEnd) <= TIME_SLOTS.indexOf(t)) {
                        setShiftEnd(TIME_SLOTS[Math.min(TIME_SLOTS.indexOf(t) + 1, TIME_SLOTS.length - 1)]);
                      }
                    }}
                  />
                ))}
              </ScrollView>

              <Text variant="caption" weight="semibold" color={Colors.textSecondary} style={styles.hint}>
                Ends at
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsRow}
              >
                {endOptions.map((t) => (
                  <Pill
                    key={t}
                    label={t}
                    active={shiftEnd === t}
                    onPress={() => setShiftEnd(t)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {/* Location */}
          <Text variant="caption" weight="semibold" color={Colors.textSecondary} style={styles.hint}>
            Location / area
          </Text>
          <Input
            placeholder="e.g. Kanchipuram, Tamil Nadu"
            value={location}
            onChangeText={(v) => {
              setLocation(v);
              clearError('location');
            }}
            error={errors.location}
            leftIcon={<Ionicons name="location-outline" size={18} color={Colors.textMuted} />}
          />

          {/* Summary */}
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <SummaryDot />
              <Text variant="bodySm" weight="semibold" color="#0F172A">
                {formatDateLabel(selectedDate)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <SummaryDot />
              <Text variant="bodySm" weight="semibold" color="#0F172A">
                {fullDay ? 'Full day' : `${shiftStart} - ${shiftEnd}`}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <SummaryDot />
              <Text variant="bodySm" weight="semibold" color="#0F172A">
                {workersRequired ? `${workersRequired} workers` : 'Workers'} · ₹{salary || 0}/day
              </Text>
            </View>
          </View>
        </Section>
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <Button
          title={isEdit ? 'Save Changes' : 'Publish Job'}
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleSave}
        />
      </View>
    </View>
  );
}

function DayCalendar({
  selected,
  onSelect,
}: {
  selected: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = startOfDay(new Date());
  const initialView = selected ? startOfDay(selected) : today;
  const [viewMonth, setViewMonth] = useState(() => new Date(initialView.getFullYear(), initialView.getMonth(), 1));

  useEffect(() => {
    if (selected) {
      setViewMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
  }, [selected]);

  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <View style={styles.calendar}>
      {/* Month nav */}
      <View style={styles.calHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          disabled={isCurrentMonth}
          onPress={() => setViewMonth(new Date(year, month - 1, 1))}
          style={[styles.calNavBtn, isCurrentMonth && styles.calNavBtnDisabled]}
        >
          <Ionicons name="chevron-back" size={18} color={isCurrentMonth ? '#CBD5E1' : Colors.textSecondary} />
        </TouchableOpacity>
        <Text variant="body" weight="bold" color="#0F172A">
          {MONTHS_FULL[month]} {year}
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setViewMonth(new Date(year, month + 1, 1))}
          style={styles.calNavBtn}
        >
          <Ionicons name="chevron-forward" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Weekday row */}
      <View style={styles.calWeekRow}>
        {WEEKDAYS.map((w) => (
          <Text key={w} variant="caption" weight={w === 'Sun' ? 'bold' : 'semibold'} color={w === 'Sun' ? '#E11D48' : Colors.textMuted} style={styles.calWeekday}>
            {w}
          </Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.calGrid}>
        {cells.map((day, idx) => {
          if (day === null) {
            return <View key={`e-${idx}`} style={styles.calCell} />;
          }
          const date = new Date(year, month, day);
          const isPast = date < today;
          const isSelected = selected ? sameDay(date, selected) : false;
          const isToday = sameDay(date, today);
          return (
            <TouchableOpacity
              key={`d-${day}`}
              activeOpacity={0.75}
              disabled={isPast}
              onPress={() => onSelect(date)}
              style={[
                styles.calCell,
                isSelected ? styles.calCellSelected : isToday ? styles.calCellToday : null,
                isPast && styles.calCellPast,
              ]}
            >
              <Text
                variant="bodySm"
                weight={isSelected ? 'bold' : isToday ? 'bold' : 'medium'}
                color={isSelected ? '#FFFFFF' : isPast ? '#CBD5E1' : isToday ? '#0F172A' : '#0F172A'}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function Section({
  icon,
  step,
  title,
  children,
  onLayout,
}: {
  icon: string;
  step: string;
  title: string;
  children: React.ReactNode;
  onLayout?: (e: { nativeEvent: { layout: { y: number } } }) => void;
}) {
  return (
    <Card padding="lg" style={styles.section} onLayout={onLayout}>
      <View style={styles.sectionHead}>
        <View style={styles.sectionStep}>
          <Ionicons name={icon} size={17} color="#0F172A" weight="fill" />
        </View>
        <Text variant="body" weight="bold" color="#0F172A">
          {title}
        </Text>
        <View style={styles.sectionStepNum}>
          <Text variant="caption" weight="bold" color={Colors.textMuted}>
            {step}/4
          </Text>
        </View>
      </View>
      {children}
    </Card>
  );
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      style={[
        styles.pill,
        active && styles.pillActive,
        Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : null,
      ]}
    >
      <Text
        variant="caption"
        weight={active ? 'bold' : 'medium'}
        color={active ? '#FFFFFF' : Colors.textSecondary}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function SummaryDot() {
  return <View style={styles.summaryDot} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  heroIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  stepBar: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  stepSeg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  stepSegActive: {
    backgroundColor: Colors.primary,
  },
  stepSegIdle: {
    backgroundColor: '#E2E8F0',
  },
  stepLabel: {
    width: 76,
    textAlign: 'right',
  },
  section: {
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionStep: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionStepNum: {
    marginLeft: 'auto',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  hint: {
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 11,
  },
  pillsRow: {
    gap: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  catTile: {
    width: '30.5%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FAFBFC',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
    position: 'relative',
  },
  catTileActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#0F172A',
  },
  catTileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  catTileIconActive: {
    backgroundColor: '#FFFFFF',
  },
  catTileLabel: {
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 4,
  },
  catCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  expander: {
    paddingHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  inlineError: {
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  twoCol: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  twoColItem: {
    flex: 1,
  },
  payChips: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  quickChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  calendar: {
    backgroundColor: '#FAFBFC',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
  },
  calHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
    paddingBottom: Spacing.sm,
  },
  calNavBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  calNavBtnDisabled: {
    backgroundColor: '#F8FAFC',
    borderColor: '#F1F5F9',
  },
  calWeekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  calWeekday: {
    width: '14.28%',
    textAlign: 'center',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
  },
  calCellSelected: {
    backgroundColor: Colors.primary,
  },
  calCellToday: {
borderWidth: 1.5,
    borderColor: '#0F172A',

  },
  calCellPast: {
    opacity: 0.7,
  },
  fullDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  fullDayRowActive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#7FBFFF',
  },
  fullDayBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  fullDayBoxActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  timeBlock: {
    marginBottom: Spacing.xs,
  },
  summary: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0F172A',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: '#EDF2F7',
  },
});