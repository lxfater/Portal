/**
 * @module preload
 */

import { ipcRenderer } from 'electron';
import type { Chat, Job, Message, Prompt, Provider, Settings } from '../../types';
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar';
export function saveSetting(setting: any) {
    return ipcRenderer.invoke('saveSetting', setting);
}
export function getSetting(): Promise<Settings> {
    return ipcRenderer.invoke('getSetting');
}
window.addEventListener('DOMContentLoaded', async () => {
    // Title bar implemenation
    new Titlebar({
        backgroundColor: TitlebarColor.fromHex('#409eff'),
        minimizable: true,
        maximizable: true,
        closeable: true,
        titleHorizontalAlignment: 'center',
    });

    let controls = document.querySelector('.cet-window-controls');
    // wait for the controls to be ready
    if (!controls) {
       const main = document.querySelector('.cet-titlebar');
       controls = document.createElement('div');
       controls.classList.add('cet-window-controls');
       main?.appendChild(controls);
        
    }
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 1024 1024');
    svg.setAttribute('width', '1024');
    svg.setAttribute('height', '1024');
    svg.innerHTML = '</path><path d="M742.826667 398.890667l-28.16-28.16v-102.826667a246.101333 246.101333 0 0 0 42.666666-139.946667 32 32 0 0 0-32-32H298.666667a32 32 0 0 0-32 32 245.973333 245.973333 0 0 0 42.666666 139.989334v102.741333l-28.16 28.16a338.773333 338.773333 0 0 0-99.84 241.109333c0 17.664 14.336 32 32 32h266.666667V896a32 32 0 1 0 64 0v-224H810.666667a32 32 0 0 0 32-32 338.688 338.688 0 0 0-99.84-241.109333z m-495.658667 209.066666A274.773333 274.773333 0 0 1 326.4 444.16l37.546667-37.504a32 32 0 0 0 9.386666-22.613333v-128a31.872 31.872 0 0 0-9.386666-22.613334 148.394667 148.394667 0 0 1-30.421334-73.301333h356.992a149.077333 149.077333 0 0 1-30.464 73.386667 32 32 0 0 0-9.386666 22.613333v128c0 8.490667 3.370667 16.64 9.386666 22.613333l37.546667 37.504a274.645333 274.645333 0 0 1 79.232 163.84l-529.664-0.128z" fill="#ffffff" p-id="3664"></path>';
    // create a div
    const div = document.createElement('div');
    // add class cet-control-minimize cet-control-icon
    div.classList.add('cet-control-minimize', 'cet-control-icon');
    // Add the svg to the div
    div.appendChild(svg);
    controls.insertBefore(div, controls.firstChild);
    svg.style.transform = 'scale(1.8) rotate(45deg)';
    svg.addEventListener('click', async () => {
        const onTop = svg.style.transform === 'scale(1.8)';
        if(onTop) {
            await ipcRenderer.invoke('unOnTop');
            svg.style.transform = 'scale(1.8) rotate(45deg)';
        } else {
            await ipcRenderer.invoke('onTop');
            svg.style.transform = 'scale(1.8)';
        }
        
    });
});

const callbackMap = {
    chatgptWeb: (job: Job) => {
        console.log('chatgptWeb', job);
    },
    openAi: (job: Job) => {
        console.log('openAi', job);
    },
    baidu: (job: Job) => {
        console.log('baidu', job);
    },
};
ipcRenderer.on('ask', (event, job: Job) => {
    callbackMap[job.payload.provider](job);
});
export function onMainAsk(type: Provider,callback: (job: Job) => void) {
    callbackMap[type] = callback;
}

export function sendToMain(job: Job) {
    ipcRenderer.invoke('sendToMain', job);
}

export function saveShortcut() {
    return ipcRenderer.invoke('saveShortcut');
}

const statueCallbackMap = {
    'error': (status: string) => {
        console.log('error', status);
    },
    'success': (status:string) => {
        console.log('success', status);
    },
    'info': (status: string) => {
        console.log('info', status);
    },
    'warning': (status: string) => {
        console.log('warning', status);
    },
};
type Status = 'error' | 'success' | 'info' | 'warning';
type statusInfo = {
    type: Status;
    message: string;
}
ipcRenderer.on('mainStatus', (event, info:statusInfo) => {
    statueCallbackMap[info.type](info.message);
});
export function onMainStatus(type:Status,callback: (status: string) => void) {
    statueCallbackMap[type] = callback;
}

export function writeClipboard(text: string) {
    return ipcRenderer.invoke('writeClipboard', text);
}

export function getAppVersion() {
    return ipcRenderer.invoke('getAppVersion');
}
export function clearCache() {
    return ipcRenderer.invoke('clearCache');
}

export function setWindowPosition() {
    return ipcRenderer.invoke('setWindowPosition');
}

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

export function openWebsite(url: string) {
    return ipcRenderer.invoke('openWebsite', url);
}

export function getOs() {
    return ipcRenderer.invoke('getOs');
}
