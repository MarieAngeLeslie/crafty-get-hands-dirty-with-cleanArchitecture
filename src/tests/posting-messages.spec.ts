import { text } from "stream/consumers";

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

let message: { id: string, author: string, text: string, publishedAt: Date };
let now: Date;

function givenNowIs(_now: Date) {
    now = _now;
}

function whenUserPostMessage(postMessageCommand: { id: string, text: string, author: string }) {
    message = {
        id: postMessageCommand.id,
        text: postMessageCommand.text,
        author: postMessageCommand.author,
        publishedAt: new Date('2023-01-19T19:00:00.000Z')
    }
}

function thenPostedMessageShouldBe(expectedMessage: {
    id: string,
    author: string,
    text: string,
    publishedAt: Date
}) {
    expect(expectedMessage).toEqual(message);
}