import { ipcRenderer } from 'electron';
import type { Chat, Prompt, Settings } from '../../../types';

export function getChatsList() {
    return ipcRenderer.invoke('getChatsList');
}

export function getChat(chatId: number) {
    return ipcRenderer.invoke('getChat', chatId);
}

export function deleteChat(chatId: number) {
    return ipcRenderer.invoke('deleteChat', chatId);
}

export function saveChat(chat: Chat) {
    return ipcRenderer.invoke('saveChat', chat);
}

export function saveChatAsMarkdown(chat: Chat) {
    return ipcRenderer.invoke('saveChatAsMarkdown', chat);
}


export function getPromptList(params?:any) {
    return ipcRenderer.invoke('getPromptList', params);
}
export function getPrompt(promptId: number) {
    return ipcRenderer.invoke('getPrompt', promptId);
}
export function updatePrompt(prompt: Prompt) {
    return ipcRenderer.invoke('updatePrompt', prompt);
}
export function deletePrompt(promptId: number) {
    return ipcRenderer.invoke('deletePrompt', promptId);
}
export function addPrompt(prompt: Prompt) {
    return ipcRenderer.invoke('addPrompt', prompt);
}
export function importPrompts() {
    return ipcRenderer.invoke('importPrompts');
}

export function exportPrompts() {
    return ipcRenderer.invoke('exportPrompts');
}

export function getScopeList() {
    return ipcRenderer.invoke('getScopeList');
}

export function getActivityList(scope: string) {
    return ipcRenderer.invoke('getActivityList', scope);
}

export function getPromptCascades(type: string) {
    return ipcRenderer.invoke('getPromptCascades', type);
}

export function getPromptCount(params:any) {
    return ipcRenderer.invoke('getPromptCount', params);
}

export function getCascadePrompt() {
    return ipcRenderer.invoke('getCascadePrompt');
}


export function saveSetting(setting: any) {
    return ipcRenderer.invoke('saveSetting', setting);
}
export function getSetting(): Promise<Settings> {
    return ipcRenderer.invoke('getSetting');
}