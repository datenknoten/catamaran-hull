import { Identity } from "../identity/identity.model";

export abstract class Message {
    public id!: string;
    public recievedAt?: Date;
    public createdAt!: Date;
    public author!: Identity;
    public sequence!: number;
    public hash!: string;
    public previousMessageId!: string;
    public readonly messageType: string;
    public isMissing: boolean = true;
    public raw?: any;

    protected constructor(messageType: string) {
        this.messageType = messageType;
    }
}
