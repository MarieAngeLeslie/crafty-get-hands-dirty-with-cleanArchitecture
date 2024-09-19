import { text } from "stream/consumers";
import {
    PostMessageCommand,
    PostMessageUseCase,
    Message,
    MessageRepository,
    DateProvider,
    MessageTooLongError,
    emptyMessageError
} from "../post-message.usecase";

describe("Feature: Posting messages", () => {
    describe('Rule: A message can contain a maximum of 280 characteres', () => {
        test('Alice can post a message on her timeline', () => {
            givenNowIs(new Date('2023-01-19T19:00:00.000Z'));// Etant donné que aujourd'hui on est le 19 janvier 2023

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

        test('Alice can not post a message with more than 280 characters', () => {
            const textWithMinLengthOf281 =
                `Lorem ipsum, dolor sit amet consectetur adipisicing elit.
                Vero molestias labore soluta maiores! Eaque libero accusantium maiores,
                ipsum laboriosam accusamus voluptate cum sit facilis quidem soluta quo
                delectus praesentium quam magnam commodi veniam qui modi? `

            givenNowIs(new Date('2023-01-19T1900:00.000Z'));

            whenUserPostMessage({
                id: 'message-id',
                author: 'Alice',
                text: textWithMinLengthOf281
            })

            thenErrorShouldBe(MessageTooLongError);
        })

    })
    describe('Rule: Message can not be empty', () => {
        test("Alice can not post an empty message", () => {

            givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

            whenUserPostMessage({
                id: 'message-id',
                author: 'Alice',
                text: "",
            });

            thenErrorShouldBe(emptyMessageError);
        })

    })
});


let message: Message;
let thrownError: Error;


class InMemoryMessageRepository implements MessageRepository {
    save(msg: Message): void {
        message = msg;
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
    try {
        postMessageUseCase.handle(postMessageCommand);
    } catch (err) {
        thrownError = err;
    }
}

function thenPostedMessageShouldBe(expectedMessage: Message) {
    expect(expectedMessage).toEqual(message);
}

function thenErrorShouldBe(expectedErrorClass: new () => Error) {
    expect(thrownError).toBeInstanceOf(expectedErrorClass)
}