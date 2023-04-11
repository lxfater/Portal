import type { BrowserWindow} from 'electron';
import { ipcMain } from 'electron';
import type { Job } from '../../../types';
import type { BaseChatModelParams} from 'langchain/chat_models';
import { SimpleChatModel } from 'langchain/chat_models';
import type { BaseChatMessage } from 'langchain/schema';

export class ChatOpenAIWeb extends SimpleChatModel {
    browserWindow: BrowserWindow;
    constructor({browserWindow, ...rest}:BaseChatModelParams & {browserWindow: BrowserWindow}) {
        super(rest);
        this.browserWindow = browserWindow;
    }
    _call(messages: BaseChatMessage[]): Promise<string> {
        const { text } = messages[0];
        return new Promise<string>((resolve, reject) => {
            const handle = async (event, m: Job) => {
                if(m.payload.done) {
                    resolve(m.payload.message);
                    ipcMain.removeHandler('sendToMainChatgpt');
                } else {
                    this.callbackManager.handleLLMNewToken(
                        m.payload.message,
                    );
                }
            };
            ipcMain.removeHandler('sendToMainChatgpt');
            ipcMain.handle('sendToMainChatgpt',handle);
            this.browserWindow.webContents.send('askChatgpt', {
                type: 'ask',
                payload: {
                    question: text,
                    mode: 0,
                    provider: 'chatgptWeb',
                },
            } as Job);
        });
    }
    _llmType(): string {
        return 'openaiWeb';
    }
    _combineLLMOutput(llmOutput:any): { text: string } {
        return {
            text: llmOutput,
        };
    }
}