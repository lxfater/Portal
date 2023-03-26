import { createParser } from 'eventsource-parser';
import fetch from 'node-fetch';
export class Openai {
    key: string;
    gpt35 = ['gpt-3.5-turbo-0301','gpt-3.5-turbo'];
    model = 'gpt-3.5-turbo';
    maxTokens: number;
    constructor(key: string, mode:string, maxTokens: string) {
        this.key = key;
        this.model = mode;
        this.maxTokens = parseInt(maxTokens);
    }
    getUrl() {
      return this.gpt35.includes(this.model) ? 'https://api.openai.com/v1/chat/completions': 'https://api.openai.com/v1/completions' ;
    }
    private async getSSE(resource:string, options: any) {
        const { onData, ...fetchOptions } = options;
        const resp = await fetch(resource, fetchOptions);
        const feeder = createParser((event) => {
            if (event.type === 'event') {
                onData(event.data);
            }
        });
        if(resp.body === null) {
            throw new Error(' Null response body');
        }
        const textDecoder = new TextDecoder();
        for await (const chunk of resp.body) {
            const info = textDecoder.decode(chunk as BufferSource);
            feeder.feed(info);
        }
    }
    getBody(question: string) {
      return this.gpt35.includes(this.model) ? JSON.stringify({
        model: this.model,
        messages: [{role: 'user', content:question}],
        stream: true,
        max_tokens: this.maxTokens,
      }) : JSON.stringify({
        prompt: question,
        model: this.model,
        stream: true,
        max_tokens: this.maxTokens,
      });
    }
    parseMessage(data: any) {
      return this.gpt35.includes(this.model) ? (data.choices[0].delta.content || '') : data.choices[0].text;
    }
    async ask(question: string, options: { signal: any; onMessage: any; }) {
        const { signal,onMessage: onData } = options;
        let message = '';
        const body = this.getBody(question);
        return new Promise((resolve, reject) => {
          try {
            this.getSSE(this.getUrl(), {
              method: 'POST',
              signal,
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.key}`,
              },
              body,
              onData:(str: string) => {
                if (str === '[DONE]') {
                  if(onData) {
                    onData({
                        message,
                        done: true,
                    });
                  }
                  resolve(message);
                  return;
                } else {
                  try {
                    const data = JSON.parse(str);
                    message += this.parseMessage(data);
                    if(onData) {
                      onData({
                          message,
                          done: false,
                      });
                    }
                  } catch (error) {
                    console.error(error);
                  }
                }
              },
            });
          } catch (error) {
            reject(error);
          }
        });
    }
}