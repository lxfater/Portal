import type { BrowserWindow} from 'electron';
import { ipcMain } from 'electron';
import type { Job } from '../../../types';
import type { BaseChatModelParams} from 'langchain/chat_models';
import { SimpleChatModel } from 'langchain/chat_models';
import type { BaseChatMessage } from 'langchain/schema';

export class ChatOpenAIWeb extends SimpleChatModel {
    browserWindow: BrowserWindow;
    mode: 'ask' | 'chat';
    parentMessageId?: string;
    conversationID?: string;
    constructor({browserWindow, mode,parentMessageId,conversationID, ...rest}:BaseChatModelParams & {browserWindow: BrowserWindow, mode: 'ask' | 'chat', conversationID?: string,parentMessageId?: string}) {
        super(rest);
        this.browserWindow = browserWindow;
        this.parentMessageId = parentMessageId;
        this.conversationID = conversationID;
        this.mode = mode;
    }
    _call(messages: BaseChatMessage[]): Promise<string> {
        const { text } = messages[0];
        return new Promise<string>((resolve, reject) => {
            const handle = async (event, m: Job) => {
                if(m.payload.done) {
                    resolve(m.payload);
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
                type: this.mode,
                payload: {
                    question: text,
                    mode: this.mode,
                    conversationID: this.conversationID,
                    parentMessageId: this.parentMessageId,
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