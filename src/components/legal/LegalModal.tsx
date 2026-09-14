// High-Polish In-App Legal & Governance Modal
// Provides full, navigable text for Terms of Service, Privacy Policy, and Medical Disclaimer
// Designed with Scandinavian Bento typography and explicit user consent.

import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LegalModalProps } from '../../types';

export { LegalModalProps };

export const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  onClose,
  initialTab = 'privacy',
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'disclaimer'>(initialTab);

  useEffect(() => {
    if (visible) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackdrop}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>LEGAL & GOVERNANCE</Text>
                </View>
                <Text style={styles.title}>
                  {activeTab === 'terms'
                    ? 'Terms of Service'
                    : activeTab === 'privacy'
                      ? 'Privacy Policy'
                      : 'Medical Disclaimer'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.7}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'privacy' && styles.tabBtnActive]}
                onPress={() => setActiveTab('privacy')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'terms' && styles.tabBtnActive]}
                onPress={() => setActiveTab('terms')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>
                  Terms of Service
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'disclaimer' && styles.tabBtnActive]}
                onPress={() => setActiveTab('disclaimer')}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, activeTab === 'disclaimer' && styles.tabTextActive]}>
                  Disclaimer
                </Text>
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={styles.scrollArea}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={true}
            >
              {activeTab === 'privacy' && (
                <View>
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxTitle}>LOCAL-FIRST ARCHITECTURE</Text>
                    <Text style={styles.infoBoxText}>
                      OdinEye operates with zero developer servers. All biometrics, medication logs, and API tokens are encrypted with AES-256 and stored exclusively on your device.
                    </Text>
                  </View>

                  <Text style={styles.h2}>1. Google Play Health Connect Limited Use</Text>
                  <Text style={styles.paragraph}>
                    OdinEye strictly adheres to the Google Play Developer Health Connect Policy:
                  </Text>
                  <Text style={styles.bullet}>• <Text style={styles.bold}>Strictly Read-Only:</Text> Health Connect records are read solely to compute recovery scores, sleep architecture, and movement pillars.</Text>
                  <Text style={styles.bullet}>• <Text style={styles.bold}>Zero Data Sale:</Text> We NEVER sell, lease, trade, or transfer Health Connect data to third parties, data brokers, or advertising networks.</Text>
                  <Text style={styles.bullet}>• <Text style={styles.bold}>Zero Advertising:</Text> Data is NEVER used for ads, retargeting, promotional marketing, or user profiling.</Text>
                  <Text style={styles.bullet}>• <Text style={styles.bold}>Zero Credit Scoring:</Text> Data is NEVER used to evaluate creditworthiness or consumer lending.</Text>
                  <Text style={styles.bullet}>• <Text style={styles.bold}>No Human Access:</Text> No employee or individual has access to your health telemetry.</Text>

                  <Text style={styles.h2}>2. Biometrics Accessed via Health Connect</Text>
                  <Text style={styles.paragraph}>
                    Sleep Sessions (<Text style={styles.code}>READ_SLEEP</Text>), Heart Rate & Resting Heart Rate (<Text style={styles.code}>READ_HEART_RATE</Text>), Heart Rate Variability (<Text style={styles.code}>READ_HEART_RATE_VARIABILITY</Text>), Steps & Distance (<Text style={styles.code}>READ_STEPS</Text>), Active Energy (<Text style={styles.code}>READ_ACTIVE_CALORIES_BURNED</Text>), Skin Temperature, SpO2, and Respiration.
                  </Text>

                  <Text style={styles.h2}>3. Device Permissions</Text>
                  <Text style={styles.bullet}>• <Text style={styles.bold}>POST_NOTIFICATIONS:</Text> Delivers medication reminder alarms and daily wellness check-ins.</Text>
                  <Text style={styles.bullet}>• <Text style={styles.bold}>SCHEDULE_EXACT_ALARM:</Text> Guarantees medication alarms fire at the exact minute scheduled, even in Doze mode.</Text>
                  <Text style={styles.bullet}>• <Text style={styles.bold}>VIBRATE:</Text> Gentle haptic cadence during mindfulness breathing phases.</Text>

                  <Text style={styles.h2}>4. In-App Data Deletion (Right to be Forgotten)</Text>
                  <Text style={styles.paragraph}>
                    You maintain complete, unilateral control over your records. You can wipe all encrypted credentials, medication schedules, and historical caches at any time in <Text style={styles.bold}>Settings → Wipe Vault & Delete Keys</Text>.
                  </Text>

                  <Text style={styles.h2}>5. Publisher Contact</Text>
                  <Text style={styles.paragraph}>
                    OdinEye Health · support@odineye.health{'\n'}
                    Package: com.odineye.health
                  </Text>
                </View>
              )}

              {activeTab === 'terms' && (
                <View>
                  <View style={styles.alertBox}>
                    <Text style={styles.alertBoxTitle}>IMPORTANT LEGAL NOTICE</Text>
                    <Text style={styles.alertBoxText}>
                      By using OdinEye, you agree to these Terms. OdinEye is for general wellness tracking and is NOT a certified medical device.
                    </Text>
                  </View>

                  <Text style={styles.h2}>1. Eligibility & Acceptance</Text>
                  <Text style={styles.paragraph}>
                    You must be at least 18 years old (or 13+ with legal guardian supervision) to use OdinEye. Continued use of the app signifies unconditional acceptance of these terms.
                  </Text>

                  <Text style={styles.h2}>2. Medical Advice Disclaimer</Text>
                  <Text style={styles.paragraph}>
                    OdinEye does NOT provide medical advice, clinical diagnosis, or medical treatment plans. Always consult your doctor or a qualified health provider with questions about medications or physical conditioning.
                  </Text>

                  <Text style={styles.h2}>3. Local Storage Responsibility</Text>
                  <Text style={styles.paragraph}>
                    Because OdinEye stores encryption keys directly on your device, you are solely responsible for securing your phone with a PIN or biometrics. Wiping the app or clearing device storage permanently destroys all local records.
                  </Text>

                  <Text style={styles.h2}>4. Third-Party Integrations</Text>
                  <Text style={styles.paragraph}>
                    Connections to Ultrahuman, Fitbit, Hevy, or Google Gemini occur directly from your device via HTTPS. Use of these platforms is subject to their respective independent terms and privacy guidelines.
                  </Text>

                  <Text style={styles.h2}>5. Limitation of Liability</Text>
                  <Text style={styles.paragraph}>
                    OdinEye is provided on an "AS IS" and "AS AVAILABLE" basis. OdinEye Health disclaims all liability for missed medication doses, hardware timing inaccuracies, or actions taken in reliance on health metrics.
                  </Text>
                </View>
              )}

              {activeTab === 'disclaimer' && (
                <View>
                  <View style={styles.alertBox}>
                    <Text style={styles.alertBoxTitle}>CRITICAL HEALTH NOTICE: NOT FOR CLINICAL USE</Text>
                    <Text style={styles.alertBoxText}>
                      ODINEYE DOES NOT PROVIDE MEDICAL ADVICE, DIAGNOSIS, OR TREATMENT. ALWAYS CONSULT A LICENSED PHYSICIAN FOR CLINICAL CONCERNS.
                    </Text>
                  </View>

                  <Text style={styles.h2}>1. Informational & Lifestyle Purpose</Text>
                  <Text style={styles.paragraph}>
                    All physiological calculations—including recovery scores, sleep depth assessments, heart rate variability markers, and mindfulness insights—are synthesized strictly for general conditioning, athletic recovery, and personal mindfulness.
                  </Text>

                  <Text style={styles.h2}>2. Not FDA or EMA Cleared</Text>
                  <Text style={styles.paragraph}>
                    OdinEye is NOT an approved or cleared medical device by the U.S. Food and Drug Administration (FDA), European Medicines Agency (EMA), or any other regulatory authority.
                  </Text>

                  <Text style={styles.h2}>3. Medical Emergencies</Text>
                  <Text style={styles.paragraph}>
                    If you experience chest discomfort, shortness of breath, sudden palpitations, or any acute symptom, immediately contact emergency services (e.g., 911, 112, 999) or proceed to the nearest emergency medical facility.
                  </Text>

                  <Text style={styles.h2}>4. Medication Reminder Disclaimers</Text>
                  <Text style={styles.paragraph}>
                    OdinEye's medication alarms are organizational aids. Operating system power-saving policies, device shutdowns, or notification permissions can affect alerts. You remain solely responsible for adhering to your prescribed dosing regimen.
                  </Text>
                </View>
              )}

              <View style={{ height: 32 }} />
            </ScrollView>

            {/* Bottom Agree Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.agreeBtn}
                onPress={onClose}
                activeOpacity={0.85}
              >
                <Text style={styles.agreeBtnText}>I Understand & Agree</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 39, 32, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#1F382E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  badge: {
    backgroundColor: '#EAF2EE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#3B7059',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: '#1F382E',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F4F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#587366',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F6F4',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6E857B',
  },
  tabTextActive: {
    color: '#1F382E',
    fontWeight: '800',
  },
  scrollArea: {
    maxHeight: 400,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  infoBox: {
    backgroundColor: '#EAF2EE',
    borderLeftWidth: 4,
    borderLeftColor: '#6BAA8E',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  infoBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#2A5743',
    marginBottom: 4,
  },
  infoBoxText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#415E50',
  },
  alertBox: {
    backgroundColor: '#FAF0ED',
    borderLeftWidth: 4,
    borderLeftColor: '#D97A66',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  alertBoxTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: '#B04B35',
    marginBottom: 4,
  },
  alertBoxText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6E3A2E',
  },
  h2: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F382E',
    marginTop: 18,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: '#3B4D44',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 13,
    lineHeight: 19,
    color: '#3B4D44',
    marginBottom: 6,
    paddingLeft: 4,
  },
  bold: {
    fontWeight: '700',
    color: '#1F382E',
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 11,
    backgroundColor: '#EAF2EE',
    color: '#2A5743',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF4F0',
  },
  agreeBtn: {
    backgroundColor: '#1F382E',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agreeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
