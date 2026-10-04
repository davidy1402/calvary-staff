import type { ServiceRoster } from '../types';

interface QueueOptions {
  write: (roster: ServiceRoster) => Promise<boolean>;
  onStatus: (status: 'connecting' | 'synced' | 'error') => void;
  onPending: (rosters: ServiceRoster[]) => void;
  initial?: ServiceRoster[];
}

// Serialize writes so a slow response cannot overwrite a newer edit.
export class RosterSyncQueue {
  private pending = new Map<string, ServiceRoster>();
  private worker: Promise<void> | null = null;
  private options: QueueOptions;

  constructor(options: QueueOptions) {
    this.options = options;
    for (const roster of options.initial || []) this.pending.set(roster.id, roster);
  }

  has(id: string) { return this.pending.has(id); }
  snapshot() { return [...this.pending.values()]; }

  enqueue(roster: ServiceRoster) {
    this.pending.set(roster.id, roster);
    this.options.onPending(this.snapshot());
    return this.flush();
  }

  flush(): Promise<void> {
    if (this.worker) return this.worker;
    this.worker = this.run().finally(() => { this.worker = null; });
    return this.worker;
  }

  private async run() {
    if (!this.pending.size) return;
    this.options.onStatus('connecting');
    while (this.pending.size) {
      const roster = this.pending.values().next().value!;
      let saved = false;
      try { saved = await this.options.write(roster); } catch { /* Retain for retry. */ }
      if (!saved) {
        this.options.onStatus('error');
        return;
      }
      if (this.pending.get(roster.id) === roster) this.pending.delete(roster.id);
      this.options.onPending(this.snapshot());
    }
    this.options.onStatus('synced');
  }
}
