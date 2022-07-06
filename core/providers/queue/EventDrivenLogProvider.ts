import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';

const EVENT_NAME = 'Event Log';

interface EventDrivenLogEntry {
  provider: string;
  method: string;
  event?: any;
}

export class EventDrivenLogProvider {
  private eventQueue: SimpleQueueProvider;

  constructor() {}

  start() {
    this.eventQueue = new SimpleQueueProvider(EVENT_NAME);
    this.eventQueueOn();
  }

  countLogs() {
    return this.eventQueue.length;
  }

  getInternalQueueRef() {
    return this.eventQueue;
  }

  addLog(entry: EventDrivenLogEntry): boolean {
    this.eventQueue.enqueue(entry);

    return true;
  }

  getLatestLog() {
    return this.eventQueue.peek();
  }

  getAllLogs() {
    return this.eventQueue.all();
  }

  eventQueueOn() {
    this.eventQueue.queueUpdate.on(this.eventQueue.eventName, async () => {
      if (this.eventQueue.length > 0) { /* do nothing for now */ }
    });
  }
}