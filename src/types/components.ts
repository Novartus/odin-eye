// Presentation Component & Modal Types & Interfaces
// Canonical source: src/types/components.ts

import type { DimensionValue, ViewStyle } from 'react-native';
import { TriPillarHealthSummary, UltrahumanRecoveryData, MuscleRecoveryStatus } from './health';
import { AiCoachRecommendation } from './aiCoach';
import { Medication, ReminderAlertEvent } from './medication';
import { TabKey, TabType, MetricType } from './navigation';
import { DailySleepRecord } from './sleep';
import { EnabledSources } from './devices';

// Screen Props
export interface DashboardScreenProps {
  onResetOnboarding?: () => void;
}

export interface OnboardingFinishConfig {
  stepsGoal: number;
  caloriesGoal: number;
  mindfulnessGoal?: number;
  enabledSources?: { ultrahuman: boolean; fitbit: boolean; hevy: boolean };
  aiEnabled?: boolean;
  bodyAnalysisEnabled?: boolean;
  mindfulnessEnabled?: boolean;
}

export interface OnboardingScreenProps {
  onFinish: (config: OnboardingFinishConfig) => void;
  initialStep?: 1 | 2 | 3;
}

// Navigation Props
export interface FloatingTabBarProps {
  activeTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  showAiTab?: boolean;
  showBodyAnalysisTab?: boolean;
  showMindfulnessTab?: boolean;
  onTabPress?: (tab: TabKey) => void;
}

export interface TabItemConfig {
  key: TabKey;
  id?: TabKey;
  label: string;
  icon?: string;
}

// AI Coach Component Props
export interface DedicatedAiCoachViewProps {
  data: TriPillarHealthSummary;
  recommendation: AiCoachRecommendation;
}

export interface FormattedMessageProps {
  text: string;
  isUser: boolean;
}

// Overview & Metric Cards Props
export interface HealthOverviewViewProps {
  data: TriPillarHealthSummary;
}

export interface BodyAnalysisViewProps {
  muscleStatuses: MuscleRecoveryStatus[];
}

export interface MetricCardsGridProps {
  data: TriPillarHealthSummary;
  enabledSources: EnabledSources;
  onOpenSleepMetric?: () => void;
  stepsGoal?: number;
  caloriesGoal?: number;
}

export interface HomeTopBarProps {
  onOpenSettings: () => void;
  onOpenNotifications?: () => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncText: string;
}

export interface TodayMedicationCardProps {
  onOpenMedications?: () => void;
  onOpenMedsTab?: () => void;
}

export interface TodayWellnessCardProps {
  score: number;
  sleepQualityPct?: number;
  activeZoneMinutes?: number;
  tonnageKg?: number;
  onPress?: () => void;
}

export interface TodayZenCardProps {
  onOpenZen: () => void;
  onQuickStartBreath?: () => void;
}

export interface TodayInsightCardProps {
  headline: string;
  body: string;
  onPress?: () => void;
}

export interface SleepArchitectureBentoCardProps {
  recovery: UltrahumanRecoveryData;
  targetSleepHours?: number;
  onPress?: () => void;
}

export interface SleepBarChartProps {
  records: DailySleepRecord[];
  compact?: boolean;
  onSelectDay?: (record: DailySleepRecord) => void;
  accentVariant?: 'purple' | 'green';
}

// Modal Props
export interface LegalModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'disclaimer';
}

export interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
  onOpenMedications: () => void;
  onOpenSettings: () => void;
  onTriggerTestAlert?: () => void;
  onNavigateToTab?: (tab: TabType) => void;
}

export interface HealthConnectPromptModalProps {
  visible: boolean;
  onClose: () => void;
  onConnected?: () => void;
  onNavigateToSettings?: () => void;
  onEnableHealthConnect?: () => Promise<void>;
  isConnecting?: boolean;
}

export interface MetricDetailExpandModalProps {
  visible: boolean;
  onClose: () => void;
  metricType: MetricType | null;
  data: TriPillarHealthSummary;
  enabledSources?: EnabledSources;
  onOpenSettings?: () => void;
}

export interface ThemeConfig {
  heroBg: string;
  heroBorder: string;
  heroTextColor: string;
  heroSubColor: string;
  heroBadgeText: string;
  isDark: boolean;
  accentRing: string;
  trackRing: string;
}

export interface AddMedicationModalProps {
  visible: boolean;
  onClose: () => void;
  onAdded: () => void;
}

export interface MedicationDetailModalProps {
  visible: boolean;
  medication: Medication | null;
  onClose: () => void;
  onUpdated: () => void;
}

export interface MedicationReminderAlertModalProps {
  alert: ReminderAlertEvent | null;
  onClose: () => void;
  onDoseTaken: () => void;
}

export interface FullMonthCalendarViewProps {
  selectedDateKey: string;
  onSelectDate: (dateKey: string) => void;
  onClose: () => void;
}

export interface SettingsViewProps {
  enabledSources: EnabledSources;
  onToggleSource: (sourceKey: keyof EnabledSources, value: boolean) => void;
  onManualSync: () => void;
  isSyncing: boolean;
  lastSyncText: string;
  onOpenHealthConnectPrompt?: () => void;
  aiEnabled?: boolean;
  onToggleAi?: (enabled: boolean) => void;
  bodyAnalysisEnabled?: boolean;
  onToggleBodyAnalysis?: (enabled: boolean) => void;
  mindfulnessEnabled?: boolean;
  onToggleMindfulness?: (enabled: boolean) => void;
  onResetOnboarding?: () => void;
}

// Common UI Elements Props
export interface BouncingDotsLoaderProps {
  statusText?: string;
}

export interface ShimmerPlaceholderProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  baseColor?: string;
  highlightColor?: string;
}

export interface AppLoadingSplashProps {
  onFadeComplete?: () => void;
}

export interface SmartRingIconProps {
  size?: number;
  color?: string;
  accentColor?: string;
}

export interface MedicationDayItem {
  dayName: string;
  dayNum: number;
  dateKey: string;
  isToday: boolean;
}

export interface MedicationIconProps {
  size?: number;
  color?: string;
}

export interface DevModeStep {
  num: string;
  title: string;
  cmd?: string;
  note?: string;
}
