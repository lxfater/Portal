import { createRouter, createWebHashHistory } from 'vue-router';
import ChatBox from '/@/components/ChatBox.vue';
import ManagementPage from '/@/components/ManagementPage.vue';
import ChatGPTViewer from '/@/components/ChatGPTViewer.vue';
import ConnectionPage from '/@/components/ConnectionPage.vue';
import ChatDatabase from '/@/components/ChatDatabase.vue';
import HelpPage from '/@/components/HelpPage.vue';
import MorePage from '/@/components/MorePage.vue';
import SwitchPage from '/@/components/SwitchPage.vue';
import Prompt from '/@/components/Prompt.vue';
const routes = [
    {
        path: '/',
        component: ChatBox,
        meta: {
            keepAlive: false,
        },
    },
    {
        path: '/management',
        component: ManagementPage,
        meta: {
            keepAlive: false,
        },
        redirect: '/management/connection',
        children: [
            {
                path: 'connection',
                component: ConnectionPage,
            },
            {
                path: 'database',
                component: ChatDatabase,
            },
            {
                path: 'help',
                component: HelpPage,
            },
            {
                path: 'more',
                component: MorePage,
            },
            {
                path: 'switch',
                component: SwitchPage,
            },
            {
                path: 'prompt',
                component: Prompt,
            },
        ],
    },
    {
        path: '/chatgptViewer',
        component: ChatGPTViewer,
        meta: {
            keepAlive: true,
        },
    },
];

export const router = createRouter({
    history: createWebHashHistory(),
    routes,
});