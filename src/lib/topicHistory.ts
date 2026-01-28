/**
 * LocalStorage utilities for tracking picked topics in the Ngobrolin Topic Picker.
 * Handles persistence of topic selection history across browser sessions.
 */

const STORAGE_KEY = 'ngobrolin-topic-picker-history';

/**
 * Storage structure for topic history
 */
interface TopicHistoryStorage {
  pickedTopics: number[];
  lastUpdated: number;
}

/**
 * Safely access localStorage with error handling for private/incognito mode
 */
function getStorage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    // Test write to detect private browsing mode
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch (e) {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
    return null;
  }
}

/**
 * Get the current history from localStorage
 */
function getHistory(): TopicHistoryStorage | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const data = storage.getItem(STORAGE_KEY);
    if (!data) {
      return null;
    }
    const parsed = JSON.parse(data) as TopicHistoryStorage;

    // Validate structure
    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !Array.isArray(parsed.pickedTopics) ||
      typeof parsed.lastUpdated !== 'number'
    ) {
      return null;
    }

    return parsed;
  } catch (e) {
    // JSON parse error or other issue
    return null;
  }
}

/**
 * Save history to localStorage
 */
function saveHistory(history: TopicHistoryStorage): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    // Silently fail if storage is full or unavailable
  }
}

/**
 * Get array of picked topic IDs from localStorage
 * @returns Array of topic IDs, empty array if unavailable
 */
export function getPickedTopicIds(): number[] {
  const history = getHistory();
  return history?.pickedTopics ?? [];
}

/**
 * Add a topic ID to the picked history
 * @param topicId - The topic ID to add
 */
export function addPickedTopic(topicId: number): void {
  // Validate topicId is a number
  if (typeof topicId !== 'number' || isNaN(topicId)) {
    return;
  }

  const history = getHistory();
  const pickedTopics = history?.pickedTopics ?? [];

  // Avoid duplicates
  if (!pickedTopics.includes(topicId)) {
    pickedTopics.push(topicId);
  }

  saveHistory({
    pickedTopics,
    lastUpdated: Date.now(),
  });
}

/**
 * Check if a topic has been picked before
 * @param topicId - The topic ID to check
 * @returns True if the topic is in history, false otherwise
 */
export function isTopicPicked(topicId: number): boolean {
  const pickedTopics = getPickedTopicIds();
  return pickedTopics.includes(topicId);
}

/**
 * Clear all topic history from localStorage
 */
export function clearHistory(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.removeItem(STORAGE_KEY);
  } catch (e) {
    // Silently fail if storage is unavailable
  }
}

/**
 * Get statistics about the topic history
 * @returns Object containing count of picked topics and last updated timestamp
 */
export function getHistoryStats(): {
  count: number;
  lastUpdated: number | null;
} {
  const history = getHistory();
  return {
    count: history?.pickedTopics.length ?? 0,
    lastUpdated: history?.lastUpdated ?? null,
  };
}
