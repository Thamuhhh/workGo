import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Text, Button } from '../../src/components/ui';
import { ScreenSkeleton, usePageLoading } from '../../src/components/ui/PageSkeleton';
import { FadeSlide } from '../../src/components/AppHeader';
import { Icon as Ionicons } from '../../src/components/Icon';
import { Colors, Spacing, BorderRadius } from '../../src/constants/theme';
import { usePaymentsStore } from '../../src/store/paymentsStore';
import { fetchHiredWorkers, updateApplicationStatus } from '../../src/services/applications';

type WorkerStatus = 'NOT_STARTED' | 'WORKING' | 'COMPLETED';

interface HiredWorker {
  id: string;
  name: string;
  job: string;
  area: string;
  pay: number;
  status: WorkerStatus;
  paid: boolean;
}

const INITIAL_WORKERS: HiredWorker[] = [];

const FEEDBACK_OPTIONS = ['Punctual', 'Hardworking', 'Great attitude', 'Follows instructions'];
const UPI_APPS = [
  { id: 'gpay', label: 'GPay', color: '#1A73E8' },
  { id: 'phonepe', label: 'PhonePe', color: '#5F259F' },
  { id: 'paytm', label: 'Paytm', color: '#00BAF2' },
  { id: 'upi', label: 'UPI ID', color: '#0F172A' },
];

const STATUS_DOT: Record<WorkerStatus, string> = {
  NOT_STARTED: '#94A3B8',
  WORKING: '#D97706',
  COMPLETED: '#16A34A',
};

const STATUS_LABEL: Record<WorkerStatus, string> = {
  NOT_STARTED: 'Not started',
  WORKING: 'Working',
  COMPLETED: 'Completed',
};

export default function EmployerBookingsScreen() {
  const [workers, setWorkers] = useState<HiredWorker[]>(INITIAL_WORKERS);
  const [loading, setLoading] = useState(true);
  const createPayment = usePaymentsStore((s) => s.createPayment);

  useEffect(() => {
    let alive = true;
    fetchHiredWorkers()
      .then((list) => {
        if (!alive) return;
        setWorkers(
          list.map((w) => ({
            id: w.id,
            name: w.workerName,
            job: w.jobTitle,
            area: w.workerArea,
            pay: w.salaryNum,
            status: w.status === 'COMPLETED' ? 'COMPLETED' : 'NOT_STARTED',
            paid: false,
          }))
        );
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const [completing, setCompleting] = useState<HiredWorker | null>(null);
  const [payingAll, setPayingAll] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbacks, setFeedbacks] = useState<string[]>([]);
  const [upiApp, setUpiApp] = useState('gpay');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    Animated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 240, useNativeDriver: true }).start(() =>
        setToast(null)
      );
    }, 2600);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const sheetT = useRef(new Animated.Value(0)).current;
  const sheetO = useRef(new Animated.Value(0)).current;
  const bodyA = useRef(new Animated.Value(0)).current;
  const bodyY = useRef(new Animated.Value(14)).current;
  const starPops = useRef([0, 1, 2, 3, 4].map(() => new Animated.Value(1))).current;
  const chipPops = useRef(FEEDBACK_OPTIONS.map(() => new Animated.Value(1))).current;
  const doneScale = useRef(new Animated.Value(0)).current;
  const doneOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!completing) return;
    setSending(false);
    sheetT.setValue(0);
    sheetO.setValue(0);
    bodyA.setValue(0);
    bodyY.setValue(14);
    starPops.forEach((v) => v.setValue(1));
    chipPops.forEach((v) => v.setValue(1));
    doneScale.setValue(0);
    doneOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(sheetO, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(sheetT, { toValue: 1, friction: 8, tension: 80, useNativeDriver: true }),
    ]).start();
    Animated.parallel([
      Animated.timing(bodyA, { toValue: 1, duration: 220, delay: 110, useNativeDriver: true }),
      Animated.spring(bodyY, { toValue: 0, friction: 8, tension: 70, useNativeDriver: true, delay: 110 }),
    ]).start();
  }, [completing]);

  const updateStatus = (id: string, status: WorkerStatus) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, status } : w)));
    if (status === 'COMPLETED') updateApplicationStatus(id, 'COMPLETED');
  };

  const handlePayAll = () => {
    const completed = workers.filter((w) => w.status === 'COMPLETED' && !w.paid);
    if (completed.length === 0) return;
    setPayingAll(true);
  };

  const confirmPayAll = () => {
    const done = workers.filter((w) => w.status === 'COMPLETED' && !w.paid);
    if (done.length === 0) return;
    const total = done.reduce((s, w) => s + w.pay, 0);
    done.forEach((w) =>
      createPayment({
        jobId: w.id,
        title: w.job,
        workerName: w.name,
        employerName: 'You',
        amount: w.pay,
      })
    );
    setWorkers((prev) => prev.map((w) => (w.status === 'COMPLETED' ? { ...w, paid: true } : w)));
    setPayingAll(false);
    showToast(`₹${total.toLocaleString('en-IN')} paid to ${done.length} worker${done.length > 1 ? 's' : ''}`);
  };

  const payWorker = (worker: HiredWorker) => {
    createPayment({
      jobId: worker.id,
      title: worker.job,
      workerName: worker.name,
      employerName: 'You',
      amount: worker.pay,
    });
    setWorkers((prev) => prev.map((w) => (w.id === worker.id ? { ...w, paid: true } : w)));
    showToast(`₹${worker.pay.toLocaleString('en-IN')} paid to ${worker.name.split(' ')[0]}`);
  };

  const openCompletion = (worker: HiredWorker) => {
    setRating(5);
    setFeedbacks([]);
    setUpiApp('gpay');
    setCompleting(worker);
  };

  const confirmCompletion = () => {
    if (!completing || sending) return;
    setSending(true);
    Animated.parallel([
      Animated.spring(doneScale, { toValue: 1, friction: 5, tension: 160, useNativeDriver: true }),
      Animated.timing(doneOpacity, { toValue: 1, duration: 160, useNativeDriver: true }),
    ]).start();
    setTimeout(() => {
      const worker = completing;
      updateStatus(worker.id, 'COMPLETED');
      setCompleting(null);
      const payment = createPayment({
        jobId: worker.id,
        title: worker.job,
        workerName: worker.name,
        employerName: 'You',
        amount: worker.pay,
      });
      router.push({ pathname: '/(employer)/payment', params: { paymentId: payment.id } });
    }, 850);
  };

  const toggleFeedback = (tag: string) => {
    const idx = (FEEDBACK_OPTIONS as readonly string[]).indexOf(tag);
    setFeedbacks((prev) => {
      const next = prev.includes(tag)
        ? prev.filter((t) => t !== tag)
        : prev.length >= 3
        ? prev
        : [...prev, tag];
      if (next.length > prev.length || (next.length < prev.length && idx >= 0)) {
        const v = chipPops[idx] ?? new Animated.Value(1);
        v.setValue(0.4);
        Animated.spring(v, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }).start();
      }
      return next;
    });
  };

  const onPressStar = (n: number) => {
    setRating(n);
    const v = starPops[n - 1];
    v.setValue(0.3);
    Animated.spring(v, { toValue: 1, friction: 4, tension: 220, useNativeDriver: true }).start();
  };

  if (usePageLoading()) return <ScreenSkeleton variant="list" />;
  if (loading) return <ScreenSkeleton variant="list" />;

  const completedCount = workers.filter((w) => w.status === 'COMPLETED' && !w.paid).length;
  const workingCount = workers.filter((w) => w.status === 'WORKING').length;
  const totalPay = workers.filter((w) => w.status === 'COMPLETED' && !w.paid).reduce((s, w) => s + w.pay, 0);

  const sheetTranslateY = sheetT.interpolate({ inputRange: [0, 1], outputRange: [340, 0] });
  const popScale = (v: Animated.Value) =>
    v.interpolate({ inputRange: [0, 1, 1.4], outputRange: [0.3, 1, 0.88] });

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Minimal header */}
        <View style={styles.headRow}>
          <Text variant="caption" weight="bold" color="#94A3B8" style={styles.kicker}>
            BOOKINGS
          </Text>
          <Text variant="caption" color={Colors.textMuted}>
            {workers.length} hired  ·  {workingCount} working
          </Text>
        </View>
        <View style={styles.headRule} />

        {completedCount > 0 && (
          <View style={styles.payAllStrip}>
            <View>
              <Text variant="caption" color={Colors.textMuted}>
                {completedCount} completed
              </Text>
              <Text variant="body" weight="bold" color="#0F172A" style={styles.payTotalText}>
                ₹{totalPay.toLocaleString('en-IN')}
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7} onPress={handlePayAll} hitSlop={6} style={styles.payAllCta}>
              <Ionicons name="paper-plane-outline" size={14} color="#0F172A" />
              <Text variant="caption" weight="bold" color="#0F172A">
                Pay all
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {workers.map((worker, index) => (
          <FadeSlide key={worker.id} delay={60 + index * 60}>
            <View style={styles.workerCard}>
              <View style={styles.workerCardTop}>
                <View style={styles.avatar}>
                  <Text variant="body" weight="bold" color="#334155">
                    {worker.name.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="body" weight="bold" color="#0F172A" numberOfLines={1}>
                    {worker.name}
                  </Text>
                  <Text variant="caption" color={Colors.textMuted} numberOfLines={1}>
                    {worker.job} · {worker.area}
                  </Text>
                </View>
                <View style={styles.status}>
                  <View style={[styles.statusDot, { backgroundColor: STATUS_DOT[worker.status] }]} />
                  <Text variant="caption" weight="semibold" color={Colors.textSecondary}>
                    {STATUS_LABEL[worker.status]}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.footerRow}>
                <Text variant="body" weight="semibold" color="#0F172A" style={styles.payText}>
                  ₹{worker.pay.toLocaleString('en-IN')}
                </Text>
                {worker.status === 'NOT_STARTED' && (
                  <Button
                    title="Start Shift"
                    size="sm"
                    onPress={() => updateStatus(worker.id, 'WORKING')}
                  />
                )}
                {worker.status === 'WORKING' && (
                  <Button
                    title="Finish & Pay"
                    size="sm"
                    icon={<Ionicons name="checkmark" size={15} color="#FFFFFF" weight="bold" />}
                    onPress={() => openCompletion(worker)}
                  />
                )}
                {worker.status === 'COMPLETED' && (
                  <Button title={worker.paid ? 'Paid' : 'Pay'} size="sm" variant="outline" disabled={worker.paid} onPress={() => payWorker(worker)} />
                )}
              </View>
            </View>
          </FadeSlide>
        ))}

        {workers.length > 0 && (
          <View style={styles.infoCard}>
            <Ionicons name="bulb-outline" size={14} color="#94A3B8" />
            <Text variant="caption" color={Colors.textSecondary} style={styles.infoText}>
              Tap <Text weight="bold" color="#0F172A">Start Shift</Text> when a worker begins, then{' '}
              <Text weight="bold" color="#0F172A">Finish & Pay</Text> to rate and release payment.
            </Text>
          </View>
        )}

        {workers.length === 0 && (
          <View style={styles.emptyCard}>
            <Text variant="body" weight="bold" color="#0F172A">No workers hired yet</Text>
            <Button title="Go to Applicants" size="sm" onPress={() => router.push('/(employer)/review-applicants')} style={{ marginTop: 12 }} />
          </View>
        )}
      </ScrollView>

      {/* Completion sheet */}
      <Modal visible={completing !== null} transparent animationType="none" onRequestClose={() => setCompleting(null)}>
        <View style={styles.overlay}>
          <Animated.View
            style={[
              styles.backdrop,
              { opacity: sheetO.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
            ]}
          />
          <Animated.View
            style={[
              styles.sheet,
              Platform.OS === 'web' ? ({ maxWidth: 420, alignSelf: 'center', width: '100%' } as any) : null,
              { transform: [{ translateY: sheetTranslateY }], opacity: sheetO },
            ]}
          >
            {completing && (
              <Animated.View style={{ opacity: bodyA, transform: [{ translateY: bodyY }] }}>
                <View style={styles.handle} />

                {/* Worker header */}
                <View style={styles.avatarWrap}>
                  <View style={styles.avatarLg}>
                    <Text variant="h3" weight="bold" color="#0F172A">
                      {completing.name.charAt(0)}
                    </Text>
                  </View>
                </View>
                <Text variant="h3" weight="bold" color="#0F172A" align="center">
                  {completing.name}
                </Text>
                <Text variant="caption" color={Colors.textMuted} align="center" style={styles.sheetJob}>
                  {completing.job} · ₹{completing.pay.toLocaleString('en-IN')}
                </Text>

                {/* Stars */}
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <TouchableOpacity key={n} activeOpacity={0.7} onPress={() => onPressStar(n)} hitSlop={6}>
                      <Animated.View style={{ transform: [{ scale: popScale(starPops[n - 1]) }] }}>
                        <Ionicons
                          name="star"
                          size={36}
                          color={n <= rating ? '#F59E0B' : '#E2E8F0'}
                          weight={n <= rating ? 'fill' : 'regular'}
                        />
                      </Animated.View>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Feedback */}
                <Text variant="caption" weight="semibold" color={Colors.textMuted} style={styles.sheetLabel}>
                  QUICK FEEDBACK (MAX 3)
                </Text>
                <View style={styles.feedbackWrap}>
                  {FEEDBACK_OPTIONS.map((tag, idx) => {
                    const on = feedbacks.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        activeOpacity={0.8}
                        onPress={() => toggleFeedback(tag)}
                        style={[styles.feedbackChip, on && styles.feedbackChipOn]}
                      >
                        <Animated.View style={{ transform: [{ scale: popScale(chipPops[idx]) }] }}>
                          <Text
                            variant="caption"
                            weight={on ? 'bold' : 'medium'}
                            color={on ? '#FFFFFF' : Colors.textSecondary}
                          >
                            {tag}
                          </Text>
                        </Animated.View>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* UPI */}
                <Text variant="caption" weight="semibold" color={Colors.textMuted} style={styles.sheetLabel}>
                  PAY VIA UPI
                </Text>
                <View style={styles.upiRow}>
                  {UPI_APPS.map((a) => {
                    const on = upiApp === a.id;
                    return (
                      <TouchableOpacity
                        key={a.id}
                        activeOpacity={0.75}
                        onPress={() => setUpiApp(a.id)}
                        style={[styles.upiChip, on && styles.upiChipOn]}
                      >
                        <View style={[styles.upiDot, { backgroundColor: on ? a.color : '#E2E8F0' }]} />
                        <Text variant="caption" weight={on ? 'bold' : 'medium'} color={on ? '#0F172A' : Colors.textSecondary}>
                          {a.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <Button
                  title={sending ? 'Sending…' : `Pay ₹${completing.pay.toLocaleString('en-IN')} & Complete`}
                  size="lg"
                  fullWidth
                  disabled={sending}
                  onPress={confirmCompletion}
                  style={styles.sheetCta}
                />

                {/* Success overlay */}
                {sending && (
                  <Animated.View
                    pointerEvents="none"
                    style={[styles.doneWrap, { opacity: Animated.add(doneOpacity, bodyA), position: 'absolute' }]}
                  >
                    <Animated.View style={{ transform: [{ scale: doneScale }], opacity: doneOpacity }}>
                      <Ionicons name="star" size={62} color="#F59E0B" weight="fill" />
                    </Animated.View>
                    <Animated.Text style={[styles.doneText, { opacity: doneOpacity }]}>
                      Shift completed!
                    </Animated.Text>
                  </Animated.View>
                )}
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </Modal>

      {/* Pay-all confirm */}
      <Modal visible={payingAll} transparent animationType="none" onRequestClose={() => setPayingAll(false)}>
        <View style={styles.overlay}>
          <View style={styles.backdropSolid} />
          <View style={[styles.centerCard, Platform.OS === 'web' ? ({ maxWidth: 400, alignSelf: 'center', width: '100%' } as any) : null]}>
            <View style={styles.handle} />
            <Text variant="body" weight="bold" color="#0F172A">
              Pay all completed workers?
            </Text>
            <Text variant="caption" color={Colors.textMuted} style={{ marginTop: 4 }}>
              {completedCount} worker{completedCount > 1 ? 's' : ''} · ₹{totalPay.toLocaleString('en-IN')}
            </Text>
            <View style={styles.payAllList}>
              {workers
                .filter((w) => w.status === 'COMPLETED' && !w.paid)
                .map((w) => (
                  <View key={w.id} style={styles.payAllRow}>
                    <Text variant="bodySm" weight="semibold" color="#334155" numberOfLines={1} style={{ flex: 1 }}>
                      {w.name}
                    </Text>
                    <Text variant="bodySm" weight="bold" color="#0F172A">
                      ₹{w.pay.toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
            </View>
            <Button title={`Pay ₹${totalPay.toLocaleString('en-IN')}`} size="lg" fullWidth onPress={confirmPayAll} style={{ marginTop: Spacing.md }} />
            <Button title="Cancel" variant="ghost" size="sm" fullWidth onPress={() => setPayingAll(false)} style={{ marginTop: 4 }} />
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toast && (
        <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toastOpacity }]}>
          <Ionicons name="checkmark-circle" size={16} color="#16A34A" weight="bold" />
          <Text variant="bodySm" weight="semibold" color="#0F172A">
            {toast}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    paddingBottom: 40,
  },
  headRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  kicker: {
    letterSpacing: 1.4,
  },
  headRule: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginBottom: Spacing.lg,
  },
  payAllStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md + 2,
    marginBottom: Spacing.lg,
  },
  payTotalText: {
    fontVariant: ['tabular-nums'],
  },
  payAllCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  workerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    padding: Spacing.md + 4,
    marginBottom: Spacing.md,
  },
  workerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.sm,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  payText: {
    fontVariant: ['tabular-nums'],
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoText: {
    flex: 1,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    alignItems: 'center',
    marginTop: 40,
  },
  // Sheet
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F172A',
  },
  backdropSolid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  centerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: 120,
    alignItems: 'stretch',
  },
  payAllList: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: Spacing.md,
    paddingTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  payAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  toast: {
    position: 'absolute',
    bottom: 32,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'web' ? Spacing.lg : 32,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarLg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetJob: {
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sheetLabel: {
    letterSpacing: 0.4,
    marginBottom: Spacing.xs,
  },
  feedbackWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  feedbackChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  feedbackChipOn: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  upiRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  upiChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  upiChipOn: {
    borderColor: '#0F172A',
    backgroundColor: '#FAFBFC',
  },
  upiDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sheetCta: {
    marginBottom: Spacing.xs,
  },
  doneWrap: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  doneText: {
    marginTop: Spacing.sm,
    fontFamily: 'Poppins_700Bold',
    fontSize: 16,
    color: '#0F172A',
  },
});