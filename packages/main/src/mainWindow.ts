import { app, BrowserWindow, Tray, Menu } from 'electron';
import { join } from 'node:path';
import { URL } from 'node:url';
import { messageHandle } from './messageHandle';
import { resignerService } from './service';
import { setupTitlebar, attachTitlebarToWindow } from 'custom-electron-titlebar/main';
import * as path from 'node:path';
import { platform } from 'node:os';
setupTitlebar();
async function createWindow() {
  const browserWindow = new BrowserWindow({
    show: false, // Use the 'ready-to-show' event to show the instantiated BrowserWindow.
    height: 800,
    width: 613,
    minHeight: 700,
    minWidth: 480,
    titleBarStyle: 'hidden',
    webPreferences: {
      backgroundThrottling: false,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false, // Sandbox disabled because the demo of preload script depend on the Node.js api
      webviewTag: true, // The webview tag is not recommended. Consider alternatives like an iframe or Electron's BrowserView. @see https://www.electronjs.org/docs/latest/api/webview-tag#warning
      preload: join(app.getAppPath(), 'packages/preload/dist/index.cjs'),
    },
  });

  /**
   * If the 'show' property of the BrowserWindow's constructor is omitted from the initialization options,
   * it then defaults to 'true'. This can cause flickering as the window loads the html content,
   * and it also has show problematic behaviour with the closing of the window.
   * Use `show: false` and listen to the  `ready-to-show` event to show the window.
   *
   * @see https://github.com/electron/electron/issues/25012 for the afford mentioned issue.
   */
  browserWindow.on('ready-to-show', () => {
    browserWindow?.show();
    if (import.meta.env.DEV) {
      browserWindow?.webContents.openDevTools();
    }
  });
  const imagePath = () => {
    const proImagePath = platform() === 'win32' ? path.join(process.resourcesPath, './buildResources/icons/win/icon.ico'): path.join(process.resourcesPath, './buildResources/cons/mac/icon.icns');
    return import.meta.env.DEV ? 'D:\\projects\\project\\teleport\\buildResources\\icons\\win\\icon.ico' : proImagePath;
  };
  const tray = new Tray(imagePath());
  // 托盘名称
  tray.setToolTip('Portal');
  const contextMenu = Menu.buildFromTemplate([{
    label: '显示',
    click: () => { browserWindow.show(); },
  },
  {
    label: '退出',
    click: () => { browserWindow.destroy(); },
  },
  ]);
  // 载入托盘菜单
  tray.setContextMenu(contextMenu);
  // 双击触发
  tray.on('double-click', () => {
    // 双击通知区图标实现应用的显示或隐藏
    browserWindow.isVisible() ? browserWindow.hide() : browserWindow.show();
    browserWindow.isVisible() ? browserWindow.setSkipTaskbar(false) : browserWindow.setSkipTaskbar(true);
  });

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test.
   */
  const pageUrl =
    import.meta.env.DEV && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString();

  await browserWindow.loadURL(pageUrl);
  attachTitlebarToWindow(browserWindow);
  resignerService(browserWindow);
  messageHandle(browserWindow);

  return browserWindow;
}

/**
 * Restore an existing BrowserWindow or Create a new BrowserWindow.
 */
export async function restoreOrCreateWindow() {
  let window = BrowserWindow.getAllWindows().find(w => !w.isDestroyed());

  if (window === undefined) {
    window = await createWindow();
  }

  if (window.isMinimized()) {
    window.restore();
  }

  window.focus();
}

