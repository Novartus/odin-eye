import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AiCoachRecommendation } from '../../types/aiCoach';
import { Colors } from '../../theme/colors';

interface AiInsightSnippetProps {
  recommendation: AiCoachRecommendation;
  onOpenCoach: () => void;
}

export const AiInsightSnippet: React.FC<AiInsightSnippetProps> = ({ recommendation, onOpenCoach }) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWithDot}>
          <View style={styles.aiDot} />
          <Text style={styles.label}>ON-DEVICE AI SYNTHESIS</Text>
        </View>
        <Text style={styles.latency}>Local NPU • 14ms</Text>
      </View>

      <Text style={styles.headline}>{recommendation.headline}</Text>
      <Text style={styles.rationale} numberOfLines={3}>
        {recommendation.synthesisRationale}
      </Text>

      <TouchableOpacity style={styles.consultButton} onPress={onOpenCoach}>
        <Text style={styles.consultButtonText}>Consult AI Coach →</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.ai.border,
    padding: 16,
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.ai.main,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.ai.text,
    letterSpacing: 1.0,
  },
  latency: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'monospace',
  },
  headline: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 6,
    lineHeight: 20,
  },
  rationale: {
    fontSize: 12,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  consultButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.ai.soft,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ai.border,
  },
  consultButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.ai.text,
  },
});
