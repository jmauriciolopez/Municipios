import AsyncStorage from '@react-native-async-storage/async-storage';

type OfflineAction = { type: string; payload: any };
const QUEUE_KEY = 'offline_queue';

export const enqueueAction = async (action: OfflineAction) => {
  const queueRaw = await AsyncStorage.getItem(QUEUE_KEY);
  const queue = queueRaw ? JSON.parse(queueRaw) : [];
  queue.push(action);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
};

export const getQueue = async () => {
  const queueRaw = await AsyncStorage.getItem(QUEUE_KEY);
  return queueRaw ? JSON.parse(queueRaw) : [];
};

export const clearQueue = async () => {
  await AsyncStorage.removeItem(QUEUE_KEY);
};
