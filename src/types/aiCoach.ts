// On-Device AI Health Coach Types

import { MuscleGroup } from './health';

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

export interface SemanticReasoningResult {
  headline: string;
  response: string;
  referencedDataPoints: string[];
}

export interface AiModelStatus {
  provider: 'gemini_nano' | 'ondevice' | 'gemini' | 'openai';
  modelName: string;
  isCloudLlm: boolean;
  hasApiKey: boolean;
}

export interface AndroidAiCoreStatus {
  isAvailable: boolean;
  aicoreServiceConnected: boolean;
  model: string;
  hardwareAccelerator: string;
  quantization: string;
  contextWindowTokens: number;
  memoryFootprintMb: number;
  inferenceLatencyMs: number;
  statusMessage: string;
}

export interface SportsScienceTopicResponse {
  matched: boolean;
  headline: string;
  response: string;
  referencedDataPoints: string[];
}

