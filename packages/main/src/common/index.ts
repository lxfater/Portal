import type { BrowserWindow } from 'electron';
import { app, globalShortcut } from 'electron';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { Job, JobMode, Settings } from '../../../types';
import { settings } from '../../../renderer/src/state';
import { clipboard } from 'electron';
import { keyTap } from 'robotjs';
import { throttle } from 'lodash';
import currentWindow from '../common/currentWindow';
import { registerShortcut } from '../collector/text';
import { getMousePos } from 'robotjs';
import { platform } from 'os';

export function setWindowPosition(browserWindow: BrowserWindow) {
    const { x, y } = getMousePos();
    browserWindow.show();
    browserWindow.setPosition(x, y);
}
export function readSetting(): Settings {
    const userData = app.getPath('userData');
    const filepath = join(userData, 'setting.json');
    if (existsSync(filepath)) {
        const setting = readFileSync(filepath, 'utf8');
        return JSON.parse(setting);
    } else {
        return settings as unknown as Settings;
    }
}



let lastSentence = '';
function compareSentence(sentence1: string, sentence2: string) {
    return sentence1.replace(sentence2, '');
}
export const write = throttle(async (m: { done: boolean, message: string }) => {
    // read clipboard
    const diff = compareSentence(m.message, lastSentence);
    lastSentence = m.message;
    const isSameWidow = await currentWindow.isTargetWindow();
    if (diff.length > 0 && isSameWidow) {
        clipboard.writeText(diff);
        keyTap('v', process.platform === 'darwin' ? 'command' : 'control');
    }
    if (m.done) {
        lastSentence = '';
    }

}, 1000);

export const handleAllShortcut = async (browserWindow: BrowserWindow) => {
    const setting = await readSetting();
    
    const sendToAi = async (question: string, type: number) => {
        browserWindow.webContents.send('ask', {
            type: 'ask',
            payload: {
                question,
                mode: type,
                provider: setting?.connector.type,
            },
        } as Job);
    };
    globalShortcut.unregisterAll();
    let message = '';
    for await (const key of Object.keys(setting.pipelines)) {
        const pipeline = setting.pipelines[key];
        if (pipeline.shortcut) {
          const ret = registerShortcut(pipeline.shortcut, async (question: string) => {
            try {
                const setting = readSetting();
                const os = platform();
                const getOsType = (os: string): 'darwin' | 'win32' | 'other' => {
                    if(os === 'darwin' || os === 'win32') {
                        return os;
                    } else {
                        return 'other';
                    }
                };
                if(setting.system[setting.currentOs || getOsType(os)].allowWriteBack) {
                    await currentWindow.setTargetWindowPid();
                }
            } catch (error) {
                console.log(error);
            }
            
            sendToAi(question, pipeline.id);
          });
          if (!ret) {
            console.warn('registration failed');
            message += `${pipeline.shortcut},注册失败,可能被占用`;
          }
        }
      }
    return message;
};