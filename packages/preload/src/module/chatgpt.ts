import { ipcRenderer } from 'electron';
import type { Job } from '../../../types';

let callbackChatgpt = (job: Job) => {
    console.log('askChatgpt', job);
};
ipcRenderer.on('askChatgpt', (event, job: Job) => {
    callbackChatgpt(job);
});
export function onMainAskChatgpt(callback: (job: Job) => void) {
    callbackChatgpt = callback;
}
export function sendToMainChatgpt(job: Job) {
    ipcRenderer.invoke('sendToMainChatgpt', job);
}