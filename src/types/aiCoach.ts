// On-Device AI Health Coach Types

import { TriPillarHealthSummary, MuscleGroup } from './health';

export interface AiCoachRecommendation {
  id: string;
  timestamp: string;
  category: 'workout_plan' | 'recovery_strategy' | 'circadian_guidance' | 'warning';
  urgency: 'low' | 'medium' | 'high';
  headline: string;
  synthesisRationale: string;
  actionItems: string[];
  suggestedWorkoutSplit?: {
    recommendedFocus: string;
    musclesToTarget: MuscleGroup[];
    musclesToAvoid: MuscleGroup[];
    cardioIntensity: 'none' | 'zone2_only' | 'hiit_allowed' | 'light_walk';
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: string;
  dataPointsReferenced?: string[];
}

export interface AiEngineConfig {
  mode: 'device_heuristic' | 'local_llm' | 'gemini_nano';
  isLocalOnly: boolean; // 100% private, no cloud calls
  modelName: string;
  lastInferenceLatencyMs: number;
}
