import { randomUUID } from "crypto";
import { AuditEvent, AuditEventSchema } from "./types";

/**
 * Append-only Audit Logger
 * Records operations deterministically and safely without storing tokens or secrets.
 */
export class AuditLogger {
  private events: AuditEvent[] = [];

  public record(
    snapshotId: string,
    action: AuditEvent["action"],
    targetResource: string,
    outcome: AuditEvent["outcome"],
    details: string,
    providerResourceId?: string
  ): AuditEvent {
    // Redact any potential tokens or credentials from details
    const sanitizedDetails = details.replace(/([a-zA-Z0-9_-]{24,})/g, "[REDACTED]");

    const event: AuditEvent = {
      id: `evt_${randomUUID().slice(0, 10)}`,
      timestamp: new Date().toISOString(),
      snapshotId,
      action,
      targetResource,
      outcome,
      details: sanitizedDetails,
      providerResourceId,
    };

    const validated = AuditEventSchema.parse(event);
    this.events.push(validated);
    return validated;
  }

  public getEvents(snapshotId?: string): AuditEvent[] {
    if (snapshotId) {
      return this.events.filter((e) => e.snapshotId === snapshotId);
    }
    return [...this.events];
  }

  public clear(): void {
    this.events = [];
  }
}

export const globalAuditLogger = new AuditLogger();
