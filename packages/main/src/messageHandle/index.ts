import type { BrowserWindow } from 'electron';
import { session , shell, Notification } from 'electron';
import { clipboard } from 'electron';
import { app } from 'electron';
import { ipcMain } from 'electron';
import type { Chat, Job, LLMPrams, Prompt } from '../../../types';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { handleAllShortcut, readSetting, write, setWindowPosition } from '../common';
import { chats, prompts } from '../common/db';
import { dialog } from 'electron';
import { platform } from 'os';
import { ChatOpenAIWeb } from '../common/model';
import { HumanChatMessage } from 'langchain/schema';
import { CallbackManager } from 'langchain/callbacks';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { BufferWindowMemory, ChatMessageHistory } from 'langchain/memory';
import {  AIChatMessage } from 'langchain/schema';
import { ConversationChain } from 'langchain/chains';


export function messageHandle(browserWindow: BrowserWindow) {
    ipcMain.handle('getOs',() => {
        return platform();
    });
    ipcMain.handle('unOnTop', () => {
        browserWindow.setAlwaysOnTop(false);
    });
    ipcMain.handle('onTop', () => {
        browserWindow.setAlwaysOnTop(true);
    });
    ipcMain.handle('saveSetting', (e, setting) => {
        try {
            const userData = app.getPath('userData');
            console.log(setting, userData);
            writeFileSync(join(userData, 'setting.json'), JSON.stringify(setting));
        } catch (error) {
            console.error(error);
        }
    });
    ipcMain.handle('getChatsList', async () => {
        const chatsList = [];
        try {
            for await (const [key, value] of chats.iterator()) {
                const chat = value;
                chatsList.push({
                    id: chat.id,
                    name: chat.name,
                });
            }
            return chatsList;
        } catch (err) {
            console.error(err);
        }
    });
    ipcMain.handle('getChat', async (e, id: number) => {
        try {
            const chat = await chats.get(id);
            return chat;
        } catch (err) {
            console.error(err);
        }
    });
    ipcMain.handle('saveChat', async (e, chat) => {
        try {
            await chats.put(chat.id, chat);
        } catch (err) {
            console.error(err);
        }
    });
    ipcMain.handle('deleteChat', async (e, id: number) => {
        try {
            await chats.del(id);
        } catch (err) {
            console.error(err);
        }
    });
    ipcMain.handle('getSetting', () => {
        return readSetting();
    });
    ipcMain.handle('saveShortcut', () => {
        return handleAllShortcut(browserWindow);
    });
    ipcMain.handle('writeClipboard', (e, text: string) => {
        clipboard.writeText(text);
    });
    ipcMain.handle('getAppVersion', () => {
        return app.getVersion();
    });
    ipcMain.handle('clearCache', () => {
        session.defaultSession.clearStorageData({});
        app.relaunch();
        app.exit(0);
    });
    ipcMain.handle('setWindowPosition', () => {
        setWindowPosition(browserWindow);
    });
    ipcMain.handle('saveChatAsMarkdown', (e, chat: Chat) => {
        dialog.showSaveDialog({ filters: [{ name: `${chat.name}`, extensions: ['md'] }] })
            .then(result => {
                console.log(result.filePath);
                // timestamp to yyyy/mm/dd hh:mm:ss
                function timestampToTime(timestamp: number) {
                    const date = new Date(timestamp);
                    const Y = date.getFullYear() + '/';
                    const M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '/';
                    const D = date.getDate() + ' ';
                    const h = date.getHours() + ':';
                    const m = date.getMinutes() + ':';
                    const s = date.getSeconds();
                    return Y + M + D + h + m + s;
                }
                try {
                    if (result.filePath) {
                        const text = Object.values(chat.history).map(item => {
                            return `## ${item.question}\n${timestampToTime(item.time)}\n${item.answer}\n`;
                        }).join('\n');
                        const r = `# ${chat.name}\n${text}`;
                        writeFileSync(result.filePath, r);
                    }

                } catch (error) {
                    console.error(error);
                }
            })
            .catch(err => {
                console.log(err);
            });
    });

    async function getMaxIdPrompts() {
        let maxId = 0;
        for await (const [key, value] of prompts.iterator()) {
            if (value.id > maxId) {
                maxId = value.id;
            }
        }
        return maxId;
    }
    ipcMain.handle('addPrompt', async (e, prompt: Prompt) => {
        const maxId = await getMaxIdPrompts();
        prompt.id = maxId + 1;
        prompts.put(maxId+1, prompt);
    });
    ipcMain.handle('getPrompt', async (e, id:number) => {
        try {
            const prompt = await prompts.get(id);
            return prompt;
        } catch (err) {
            console.error(err);
        }
    });
    ipcMain.handle('deletePrompt', async (e, id:number) => {
        try {
            await prompts.del(id);
        } catch (err) {
            console.error(err);
        }
    });
    ipcMain.handle('updatePrompt', async (e, prompt: Prompt) => {
        try {
            await prompts.put(prompt.id, prompt);
        } catch (err) {
            console.error(err);
        }
    });
    ipcMain.handle('getPromptList', async (e, p) => {
        if(!p) {
            const promptsList = [];
            for await (const [key, value] of prompts.iterator()) {
                const prompt = value;
                promptsList.push(prompt);
            }
            return promptsList;
        }
        const { type, pageSize, page, scope, activity} = p;
        try {
            const promptsList = [];
            for await (const [key, value] of prompts.iterator()) {
                const prompt = value;
                if(type && prompt.type !== type) continue;
                promptsList.push(prompt);
            }
            const start = (page - 1) * pageSize;
            const end = page * pageSize;
            const list = promptsList.filter(i => i.scope === scope || scope === null).filter(i => i.activity === activity || activity == null);
            const result =  list.slice(start, end);
            return {
                result,
                total: list.length,
            };
        } catch (err) {
            console.error(err);
        }
    });
    ipcMain.handle('getPromptCascades',async (e, type) => {
        const promptsList: Prompt[] = [];
        for await (const [key, value] of prompts.iterator()) {
            const prompt = value;
            if(type && prompt.type !== type) continue;
            promptsList.push(prompt);
        }
        const scope = new Set(promptsList.map((item) => item.scope));
        const scopeArr = [...scope];
        const cascades = scopeArr.map((item) => {
          const activity = new Set(promptsList.filter((item2) => item2.scope === item).map((item2) => item2.activity));
          const activityArr = [...activity];
          const children = activityArr.map((value) => ({
            value: value,
            label: value,
          }));
          return {
            value: item,
            label: item,
            children,
          };
        });
        return cascades;
    });
    ipcMain.handle('importPrompts', async () => {
        return dialog.showOpenDialog({
            properties: ['openFile'], // 只能选择文件
            filters: [{ name: '', extensions: ['json'] }],
        })
        .then(async result => {
            try {
                if (result.filePaths) {
                    if (existsSync(result.filePaths[0])) {
                        try {
                            const data = readFileSync(result.filePaths[0], 'utf-8');
                            const promptsData = JSON.parse(data) as Prompt[];
                            const maxId = await getMaxIdPrompts();
                            if (Array.isArray(promptsData)) {
                                const goodPrompt = promptsData.filter(item => item.type && item.scope && item.activity && item.name && item.template);
                                goodPrompt.forEach((item, key) => {
                                    item.id = maxId + key + 1;
                                });
                                await prompts.batch(goodPrompt.map(item => ({ type: 'put', key: item.id, value: item })));
                                return 'success';
                            } else {
                                return 'Invalid prompt format';
                            }
                        } catch (error) {
                            console.error(error);
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            //@ts-ignore
                            return error.message;
                        }
                    } else {
                        return 'File not exist';
                    }
                } else {
                    return 'No file selected';
                }
            } catch (error) {
                console.error(error);
            }
        })
        .catch(err => {
            console.log(err);
        });
    });
    ipcMain.handle('exportPrompt', async () => {
        return dialog.showSaveDialog({
            filters: [{ name: '', extensions: ['json'] }],
        })
        .then(async result => {
            if(result.filePath && !result.canceled) {
                if(existsSync(result.filePath)) {
                    const data = [];
                    for await (const [key, value] of prompts.iterator()) {
                        data.push(value);
                    }
                    writeFileSync(result.filePath, JSON.stringify(data));
                } else {
                    return 'File not exist';
                }
            } else {
                return 'No file selected';
            }
        })
        .catch(err => {
            console.log(err);
        });
    });
    ipcMain.handle('getScopeList', async () => {
        const prompt  = [];
        for await (const [key, value] of prompts.iterator()) {
            prompt.push(value);
        }
        const scope = new Set(prompt.map((item) => item.scope));
        return [...scope];
    });
    ipcMain.handle('getActivityList', async (e, scope: string) => {
        const prompt  = [];
        for await (const [key, value] of prompts.iterator()) {
            prompt.push(value);
        }
        const activity = new Set(prompt.filter(item => item.scope === scope).map((item) => item.activity));
        return [...activity];
    });
    ipcMain.handle('getCascadePrompt', async (e) => {
        const promptsList: Prompt[] = [];
        for await (const [key, value] of prompts.iterator()) {
            const prompt = value;
            promptsList.push(prompt);
        }
        const scope = new Set(promptsList.map((item) => item.scope));
        const scopeArr = [...scope];
        const cascades = scopeArr.map((item) => {
          const activity = new Set(promptsList.filter((item2) => item2.scope === item).map((item2) => item2.activity));
          const activityArr = [...activity];
          const children = activityArr.map((value) => ({
            value: value,
            label: value,
            children: promptsList.filter(item2 => item2.scope === item && item2.activity === value).map(item2 => ({
                value: item2.id,
                label: item2.name,
            })),
          }));
          return {
            value: item,
            label: item,
            children,
          };
        });
        return cascades;
    });
    ipcMain.handle('openWebsite', async (e, website:string) => {
        shell.openExternal(website);
    });
    // showNotification
    ipcMain.handle('showNotification', async (e, title: string, body: string, timeout = 2000) => {
        const notification = new Notification({body, title });
        notification.show();
        setTimeout(() => {
            notification.close();
        }, timeout);
    });

    ipcMain.handle('callLLM', async (e, params:LLMPrams) => {
        const { question, type, mode, model, apiKey,id } = params;
        let messageCache = '';
        if(type === 'openai') {
            if(mode === 'ask') {
                const chain = new ChatOpenAI({
                    modelName: model,
                    openAIApiKey: apiKey,
                    streaming: true,
                    callbackManager: CallbackManager.fromHandlers({
                        async handleLLMNewToken(token: string) {
                          messageCache += token;
                          browserWindow.webContents.send('answerLLM', {
                            message:messageCache,
                            done: false,
                          });
                        },
                    }),
                });
                const message = new HumanChatMessage(question);
                const result =  await chain.call([message]);
                browserWindow.webContents.send('answerLLM', {
                    message: result,
                    done: true,
                });
            } else {
                const chatData: Chat = await chats.get(id);
                const pastMessages = Object.values(chatData.history).map(item => {
                    return [new HumanChatMessage(item.question), new AIChatMessage(item.answer)];
                 }).flat();
                 const memory = new BufferWindowMemory({
                    chatHistory: new ChatMessageHistory(pastMessages),
                    k:8,
                });
                const llm = new ChatOpenAI({
                    modelName: model,
                    openAIApiKey: apiKey,
                    streaming: true,
                    callbackManager: CallbackManager.fromHandlers({
                        async handleLLMNewToken(token: string) {
                          messageCache += token;
                          browserWindow.webContents.send('answerLLM', {
                            message:messageCache,
                            done: false,
                          });
                        },
                    }),
                });
                const chain = new ConversationChain({ llm, memory: memory });
                const result =  await chain.call({
                    input: question,
                });
                browserWindow.webContents.send('answerLLM', {
                    message: messageCache,
                    done: true,
                });
            }

        } else if(type === 'chatgpt') {
            if(mode === 'ask') {
                const chain = new ChatOpenAIWeb({
                    browserWindow,
                    mode,
                    callbackManager: CallbackManager.fromHandlers({
                        async handleLLMNewToken(token: string) {
                          messageCache = token;
                          browserWindow.webContents.send('answerLLM', {
                            message: messageCache,
                            done: false,
                          });
                        },
                    }),
                });
                const message = new HumanChatMessage(question);
                const result = await chain.call([message]);                
                browserWindow.webContents.send('answerLLM', {
                    message: messageCache,
                    done: true,
                    pid: result.text.parentMessageId,
                    cid: result.text.conversationID,
                });
            } else {
                const chatData: Chat = await chats.get(id);
                const chain = new ChatOpenAIWeb({
                    browserWindow,
                    mode,
                    parentMessageId: chatData.pid,
                    conversationID: chatData.cid,
                    callbackManager: CallbackManager.fromHandlers({
                        async handleLLMNewToken(token: string) {
                          messageCache = token;
                          browserWindow.webContents.send('answerLLM', {
                            message: messageCache,
                            done: false,
                          });
                        },
                    }),
                });
                const message = new HumanChatMessage(question);
                const result = await chain.call([message]);                
                browserWindow.webContents.send('answerLLM', {
                    message: messageCache,
                    done: true,
                    pid: result.text.parentMessageId,
                    cid: result.text.conversationID,
                });
            }
        }
   

    });
}

