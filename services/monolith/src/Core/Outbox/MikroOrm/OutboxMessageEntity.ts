import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 as uuid } from 'uuid';

@Entity({ tableName: 'outbox_messages' })
export class OutboxMessageEntity {
    @PrimaryKey({ type: 'string' })
    public readonly id: string;

    @Property({ type: 'Date' })
    public readonly createdAt: Date;

    @PrimaryKey({ type: 'string' })
    public readonly eventName: string;

    @PrimaryKey({ type: 'string' })
    public readonly eventPayload: string;

    @Property({ type: 'Date', nullable: true })
    public readonly processedAt: Date;

    public constructor(
        id: string,
        eventName: string,
        eventPayload: string,
    ) {
        this.id = id;
        this.createdAt = new Date();
        this.eventName = eventName;
        this.eventPayload = eventPayload;
    }

    public markAsProcessed(): void {
        (this.processedAt as Date) = new Date();
    }
}

export const newOutboxMessageId = (): string => {
    return uuid();
};
