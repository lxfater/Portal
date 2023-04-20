/**
 * @module preload
 */

import { ipcRenderer } from 'electron';
import type {  Job, LLMPrams, Message } from '../../types';
import { Titlebar, TitlebarColor } from 'custom-electron-titlebar';
export { onMainAskChatgpt, sendToMainChatgpt} from './module/chatgpt';
export { getSetting, saveSetting, getCascadePrompt, getPromptCount, getActivityList, getChat,getChatsList,getPrompt,getPromptCascades,getPromptList,getScopeList, deleteChat, deletePrompt,addPrompt,updatePrompt, saveChat, saveChatAsMarkdown, importPrompts  } from './module/db';

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





// llm tunnel
let callbackMap = (job: Job) => {
    console.log('chatgptWeb', job);
};
ipcRenderer.on('ask', (event, job: Job) => {
    callbackMap(job);
});
export function onMainAsk(callback: (job: Job) => void) {
    callbackMap = callback;
}
export function sendToMain(job: Job) {
    ipcRenderer.invoke('sendToMain', job);
}




export function saveShortcut() {
    return ipcRenderer.invoke('saveShortcut');
}

// error info warning success feedback
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



export function openWebsite(url: string) {
    return ipcRenderer.invoke('openWebsite', url);
}

export function getOs() {
    return ipcRenderer.invoke('getOs');
}

export function showNotification(title: string, body: string) {
    return ipcRenderer.invoke('showNotification', title, body);
}

export function callLLM(prams: LLMPrams, onMessage:(answer: Message) => void) {
    return new Promise((resolve) => {
        ipcRenderer.invoke('callLLM', prams);
        const handle = (e, message: Message) => {
            if(message.done) {
                ipcRenderer.removeListener('answerLLM', handle);
                onMessage(message);
                resolve(message);
            } else {
                onMessage(message);
            }
        };
        ipcRenderer.on('answerLLM', handle);
    });
}