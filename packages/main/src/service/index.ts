import type { BrowserWindow } from 'electron';
import { handleAllShortcut } from '../common';

export const resignerService = (browserWindow: BrowserWindow) => {
  handleAllShortcut(browserWindow);
};