import { SimpleQueueProvider } from '@core/providers/queue/SimpleQueueProvider';
import { setIntervalQueue } from '@core/utils/Utils';

const EVENT_NAME = 'Event Log';

interface EventDrivenLogEntry {
  provider: string;
  method: string;
  event: string;
}

export class EventDrivenLog {
  private eventQueue: SimpleQueueProvider;

  constructor() {}
  
  async start() {
    this.eventQueue = new SimpleQueueProvider(EVENT_NAME);
    this.eventQueueOn();

    setIntervalQueue(this.eventQueue);
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

  async eventQueueOn() {
    this.eventQueue.queueUpdate.on(this.eventQueue.eventName, async () => {
      if (this.eventQueue.length > 0) { /* do nothing for now */ }
    });
  }
  
}