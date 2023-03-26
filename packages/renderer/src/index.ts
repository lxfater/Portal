import {createApp} from 'vue';
import App from '/@/App.vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import ElementPlus from 'element-plus';
import { createPinia } from 'pinia';
import 'element-plus/dist/index.css';
import { router } from './routes';
import 'highlight.js/styles/github.css';
import type { Job, Provider } from '../../types';
//main.js
import '@imengyu/vue3-context-menu/lib/vue3-context-menu.css'

declare global {
    interface Window {
        onRenderAsk: (type: Provider, callback: (job: Job) => void) => void;
        callbackMap: Record<Provider, (job: Job) => void>;
    }
}
window.callbackMap = {
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
window.onRenderAsk = (type: Provider,callback: (job: Job) => void) => {
    window.callbackMap[type] = callback;
};

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);
app.use(router);
app.use(ElementPlus);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.mount('#app');