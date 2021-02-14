export abstract class Event {
    public readonly createdAt = new Date();

    public get name(): string {
        return this.constructor.name;
    }

    // Hack: Allow child classes to override constructor parameters
    public constructor(...args: unknown[]) {
    }
}
