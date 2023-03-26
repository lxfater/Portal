import { ClassicLevel } from 'classic-level';
import { app } from 'electron';
import { join } from 'path';
import type { Chat, Prompt } from '../../../types';
const userData = app.getPath('userData');
const dbPath = join(userData, 'db');
const db = new ClassicLevel<string, any>(dbPath, { valueEncoding: 'json' });

const chats = db.sublevel<number,Chat>('chats', { valueEncoding: 'json' });
const prompts = db.sublevel<number,Prompt>('Prompts', {valueEncoding: 'json'});

export { chats, prompts };