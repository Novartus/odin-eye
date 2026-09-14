import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '../../theme/colors';
import type { FormattedMessageProps } from '../../types';

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, isUser }) => {
  const lines = text.split('\n');

  const baseTextStyle = isUser ? styles.userText : styles.coachText;
  const boldTextStyle = isUser ? styles.userBold : styles.coachBold;

  const renderInlineStyles = (lineText: string, keyPrefix: string) => {
    // Matches **bold**, `code`, and *italic*
    const tokens = lineText.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);

    return tokens.map((token, idx) => {
      if (!token) return null;

      // Bold: **text**
      if (token.startsWith('**') && token.endsWith('**') && token.length >= 4) {
        return (
          <Text key={`${keyPrefix}-b-${idx}`} style={boldTextStyle}>
            {token.slice(2, -2)}
          </Text>
        );
      }

      // Inline code: `text`
      if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
        return (
          <Text
            key={`${keyPrefix}-c-${idx}`}
            style={[
              baseTextStyle,
              styles.inlineCode,
              isUser && { backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF' },
            ]}
          >
            {token.slice(1, -1)}
          </Text>
        );
      }

      // Italic: *text* (single asterisk)
      if (token.startsWith('*') && token.endsWith('*') && token.length >= 2 && !token.startsWith('**')) {
        return (
          <Text key={`${keyPrefix}-i-${idx}`} style={[baseTextStyle, styles.italicText]}>
            {token.slice(1, -1)}
          </Text>
        );
      }

      return (
        <Text key={`${keyPrefix}-t-${idx}`} style={baseTextStyle}>
          {token}
        </Text>
      );
    });
  };

  return (
    <View style={styles.container}>
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // Empty line spacer
        if (!trimmed) {
          return <View key={`spacer-${index}`} style={styles.paragraphSpacer} />;
        }

        // H3: ### Title
        if (trimmed.startsWith('### ')) {
          const headerContent = trimmed.replace(/^###\s+/, '');
          return (
            <View key={`h3-${index}`} style={styles.headerBlock}>
              <Text style={[styles.h3, isUser && { color: '#FFFFFF' }]}>
                {renderInlineStyles(headerContent, `h3-${index}`)}
              </Text>
            </View>
          );
        }

        // H2: ## Title
        if (trimmed.startsWith('## ')) {
          const headerContent = trimmed.replace(/^##\s+/, '');
          return (
            <View key={`h2-${index}`} style={styles.headerBlock}>
              <Text style={[styles.h2, isUser && { color: '#FFFFFF' }]}>
                {renderInlineStyles(headerContent, `h2-${index}`)}
              </Text>
            </View>
          );
        }

        // Bullet point: •, -, *
        if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || (trimmed.startsWith('* ') && !trimmed.startsWith('**'))) {
          const bulletContent = trimmed.replace(/^([•\-\*])\s+/, '');
          return (
            <View key={`bullet-${index}`} style={styles.bulletRow}>
              <Text style={[styles.bulletPoint, isUser && { color: '#FFFFFF' }]}>•</Text>
              <Text style={styles.bulletBody}>
                {renderInlineStyles(bulletContent, `b-${index}`)}
              </Text>
            </View>
          );
        }

        // Numbered list item: 1. , 2.
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          const num = numberedMatch[1];
          const itemContent = numberedMatch[2];
          return (
            <View key={`num-${index}`} style={styles.bulletRow}>
              <Text style={[styles.numberPrefix, isUser && { color: '#FFFFFF' }]}>{num}.</Text>
              <Text style={styles.bulletBody}>
                {renderInlineStyles(itemContent, `n-${index}`)}
              </Text>
            </View>
          );
        }

        // Standard Paragraph Line
        return (
          <Text key={`line-${index}`} style={styles.lineWrapper}>
            {renderInlineStyles(line, `l-${index}`)}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  lineWrapper: {
    marginBottom: 4,
    lineHeight: 21,
  },
  paragraphSpacer: {
    height: 6,
  },
  coachText: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 21,
  },
  coachBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 21,
  },
  userText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 21,
  },
  userBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 21,
  },
  italicText: {
    fontStyle: 'italic',
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    backgroundColor: '#E2E8F0',
    color: '#0F172A',
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  headerBlock: {
    marginTop: 6,
    marginBottom: 4,
  },
  h2: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 22,
  },
  h3: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 4,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.accentBlue,
    fontWeight: '800',
    width: 14,
    lineHeight: 21,
  },
  numberPrefix: {
    fontSize: 13,
    color: Colors.accentBlue,
    fontWeight: '700',
    width: 18,
    lineHeight: 21,
  },
  bulletBody: {
    flex: 1,
    lineHeight: 21,
  },
});
