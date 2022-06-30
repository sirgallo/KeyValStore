import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';

type randomUUID = string;

export type SessionMap = Record<randomUUID, SimpleQueueProvider>;