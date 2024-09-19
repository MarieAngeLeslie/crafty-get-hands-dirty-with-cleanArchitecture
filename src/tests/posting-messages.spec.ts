import { text } from "stream/consumers";
import {
    PostMessageCommand,
    PostMessageUseCase,
    Message,
    MessageRepository,
    DateProvider,
    MessageTooLongError,
    EmptyMessageError
} from "../post-message.usecase";

describe("Feature: Posting messages", () => {
    let fixture: Fixture;

    beforeEach(() => {
        fixture = createFixture();
    })



    describe('Rule: A message can contain a maximum of 280 characteres', () => {
        test('Alice can post a message on her timeline', () => {
            fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));// Etant donné que aujourd'hui on est le 19 janvier 2023

            //Quand le user post un message, le message a les informations qui suivent suivantes : 
            fixture.whenUserPostMessage({
                id: 'message-id',
                text: 'Hello there world!',
                author: 'Alice',
            })

            fixture.thenPostedMessageShouldBe({
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

            fixture.givenNowIs(new Date('2023-01-19T1900:00.000Z'));

            fixture.whenUserPostMessage({
                id: 'message-id',
                author: 'Alice',
                text: textWithMinLengthOf281
            })

            fixture.thenErrorShouldBe(MessageTooLongError);
        })

    })
    describe('Rule: Message can not be empty', () => {
        test("Alice can not post an empty message", () => {
            fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

            fixture.whenUserPostMessage({
                id: 'message-id',
                author: 'Alice',
                text: '',
            });

            fixture.thenErrorShouldBe(EmptyMessageError);
        })

        test("Alice can't post message with only whitespace", () => {
            fixture.givenNowIs(new Date('2023-01-19T19:00:00.000Z'));

            fixture.whenUserPostMessage({
                id: 'message-id',
                author: 'Alice',
                text: '     ',
            });

            fixture.thenErrorShouldBe(EmptyMessageError);
        })

    })
});




class InMemoryMessageRepository implements MessageRepository {
    message: Message;

    save(msg: Message): void {
        this.message = msg;
    }
}

class StubDateProvider implements DateProvider {
    now: Date;
    getNow(): Date {
        return this.now;
    }
}

const createFixture = () => {
    const dateProvider = new StubDateProvider();
    const messageRepository = new InMemoryMessageRepository();
    const postMessageUseCase = new PostMessageUseCase(
        messageRepository,
        dateProvider
    );
    let thrownError: Error;

    return {
        givenNowIs(now: Date) {
            dateProvider.now = now;
        },

        whenUserPostMessage(postMessageCommand: PostMessageCommand) {
            try {
                postMessageUseCase.handle(postMessageCommand);
            } catch (err) {
                thrownError = err;
            }
        },

        thenPostedMessageShouldBe(expectedMessage: Message) {
            expect(expectedMessage).toEqual(messageRepository.message);
        },

        thenErrorShouldBe(expectedErrorClass: new () => Error) {
            expect(thrownError).toBeInstanceOf(expectedErrorClass);
        }
    }
}

type Fixture = ReturnType<typeof createFixture>