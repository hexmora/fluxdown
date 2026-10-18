import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#f6f8fa',
  },
  header: {
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  eyebrow: {
    color: '#57606a',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#24292f',
    fontSize: 22,
    fontWeight: '700',
  },
  description: {
    color: '#57606a',
    fontSize: 13,
    lineHeight: 20,
  },
  controls: {
    gap: 10,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 80,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: '#0969da',
  },
  secondaryButton: {
    backgroundColor: '#eaeef2',
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#24292f',
  },
  progressLabel: {
    color: '#24292f',
    fontSize: 14,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#d0d7de',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0969da',
  },
  count: {
    color: '#57606a',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  preview: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  darkPreview: {
    backgroundColor: '#0d1117',
  },
  content: {
    padding: 20,
  },
  placeholder: {
    color: '#6e7781',
    fontSize: 14,
    lineHeight: 22,
  },
});
