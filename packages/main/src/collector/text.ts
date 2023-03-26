// MIT License

// Copyright (c) 2020 Abdurrahman Abu-Hijleh

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:


import { clipboard, globalShortcut } from 'electron';
import { keyTap } from 'robotjs';

export const getSelectedText = async () => {
  const currentClipboardContent = clipboard.readText(); // preserve clipboard content
  clipboard.clear();
  await new Promise((resolve) => setTimeout(resolve, 500)); 
  keyTap('c', process.platform === 'darwin' ? 'command' : 'control');
  await new Promise((resolve) => setTimeout(resolve, 200)); // add a delay before checking clipboard
  const selectedText = clipboard.readText();
  // clipboard.writeText(currentClipboardContent);
  return selectedText;
};
export const registerShortcut = (
  accelerator: Electron.Accelerator,
  callback: (selectedText: string) => void,
) => {
  return globalShortcut.register(accelerator, async () => {
    callback(await getSelectedText());
  });
};
export const unregisterShortcut = (accelerator: Electron.Accelerator) => {
  globalShortcut.unregister(accelerator);
  
};