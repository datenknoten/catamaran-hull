import { Message } from './message.model';


export class PostMessage extends Message {
    public channel?: string;
    public text?: string;
    public root?: PostMessage;
    public branches: PostMessage[] = [];
    public comments: PostMessage[] = [];
    public lastActivity?: Date;

    public constructor() {
        super('post');
    }
}
