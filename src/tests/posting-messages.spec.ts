import { text } from "stream/consumers";
import {
    PostMessageCommand,
    PostMessageUseCase,
    Message,
    MessageRepository,
    DateProvider
} from "../post-message.usecase";

describe("Feature: Posting messages", () => {
    describe('Rule: A message can contain a maximum of 280 characteres', () => {
        test('Alice can post a message on her timeline', () => {
            givenNowIs(new Date('2023-01-19T1900:00.000Z'));// Etant donné que aujourd'hui on est le 19 janvier 2023

            //Quand le user post un message, le message a les informations qui suivent suivantes : 
            whenUserPostMessage({
                id: 'message-id',
                text: 'Hello there world!',
                author: 'Alice',
            })

            thenPostedMessageShouldBe({
                id: 'message-id',
                author: 'Alice',
                text: 'Hello there world!',
                publishedAt: new Date('2023-01-19T19:00:00.000Z')
            })
        });
    })
});


let message: Message;
let now: Date;

class InMemoryMessageRepository implements MessageRepository {
    save(msg: Message): void {
        msg = message;
    }
}

class StubDateProvider implements DateProvider {
    now: Date;
    getNow(): Date {
        return this.now;
    }
}

const messageRepository = new InMemoryMessageRepository();
const dateProvider = new StubDateProvider();

const postMessageUseCase = new PostMessageUseCase(
    messageRepository,
    dateProvider
);

function givenNowIs(_now: Date) {
    dateProvider.now = _now;
}

function whenUserPostMessage(postMessageCommand: PostMessageCommand) {
    postMessageUseCase.handle(postMessageCommand);
}

function thenPostedMessageShouldBe(expectedMessage: {
    id: string,
    author: string,
    text: string,
    publishedAt: Date
}) {
    expect(expectedMessage).toEqual(message);
}