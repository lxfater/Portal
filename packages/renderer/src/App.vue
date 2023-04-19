
<script lang="ts" setup>
import { callLLM, onMainAsk, saveSetting, getSetting, sendToMain, onMainStatus, writeClipboard, setWindowPosition, saveChat, getPromptList, getCascadePrompt, getOs, showNotification, askChatgpt, onMainAskChatgpt, sendToMainChatgpt } from '#preload';
import { ElMessage } from 'element-plus';
import { debounce } from 'lodash';
import { onMounted, toRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { chatgptMessage, Job, LLMPrams, Message, Pipeline } from '../../types';
import { useStore } from './state';
import ChatGPTViewer from '/@/components/ChatGPTViewer.vue';
import Handlebars from 'handlebars';
import { extractLongText, findMostSimilarPrompt, searchTree } from './utils';
const router = useRouter();
const route = useRoute();
const store = useStore();
const createNewChat = (name?: string) => {
      const id = new Date().getTime();
      store.chat = {
        parentHistory: null,
        history: {},
        id,
        pid: '',
        cid: '',
        name: name || `new-${id}`,
        next: {},
      };
      saveChat(toRaw(store.chat));
      return id;
};
store.$subscribe(() => {
  // console.log('store changed', toRaw(store));
  //
});
onMainStatus('error', (message) => {
  ElMessage.error({
    showClose: true,
    message,
    offset: 100,
    center: true,
    duration: 1000,
  });
});
const saveSettingDebounce = debounce((setting) => {
  saveSetting(setting);
}, 500);

const handleQuestion = async (question: string, pipeline: Pipeline) => {
  const [longText, args] = extractLongText(question);
  const hasArgs = Object.keys(args).length > 0;
  if (hasArgs && args['-s']) {
    const shortcut = args['-s'] as string;
    const prompt = await getPromptList();
    let match = findMostSimilarPrompt(`${shortcut}`, prompt);
    const cascadePrompt = await getCascadePrompt();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    let path = searchTree(cascadePrompt, match.id);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    store.currentPromptPath = path;
    store.currentPrompt = match;
    store.settings.targetLanguage = pipeline.targetLanguage ? pipeline.targetLanguage : store.settings.targetLanguage ;
    const template = Handlebars.compile(store.currentPrompt.template);
    const q = template({
      i: longText,
      input: longText,
      targetLanguage: store.settings.targetLanguage || 'english',
    });
    return q;
  } else {
    if (store.currentPrompt) {
      const template = Handlebars.compile(store.currentPrompt.template);
      const question = template({
        i: store.question,
        input: store.question,
        targetLanguage: store.settings.targetLanguage || 'english',
      });
      return question;
    } else {
      return question;
    }
  }

};
const handleError = (message: string) => {
  ElMessage.error({
    showClose: true,
    message: message,
    offset: 100,
    center: true,
    duration: 2000,
  });
};
const handleBeforeClear = (pipeline: Pipeline) => {
  const mode = pipeline.beforeClear;
  if (mode === 'both') {
    store.question = '';
    store.currentPromptPath = null;
    store.currentPrompt = null;
    store.settings.targetLanguage = '';
  } else if (mode === 'input') {
    store.question = '';
  } else if (mode === 'prompt') {
    store.currentPromptPath = null;
    store.currentPrompt = null;
    store.settings.targetLanguage = '';
  } else {
    console.log('unknown clear mode', mode);
  }
};
const handleAfterClear = (pipeline: Pipeline) => {
  const mode = pipeline.afterClear;
  if (mode === 'both') {
    store.question = '';
    store.currentPromptPath = null;
    store.currentPrompt = null;
    store.settings.targetLanguage = '';
  } else if (mode === 'input') {
    store.question = '';
  } else if (mode === 'prompt') {
    store.currentPromptPath = null;
    store.currentPrompt = null;
    store.settings.targetLanguage = '';
  } else {
    console.log('unknown clear mode', mode);
  }
};
const jumpTo = (pipeline: Pipeline) => {
  if (pipeline.jump) {
    setWindowPosition();
  }
};
const handleAddExtra = (pipeline: Pipeline, question: string) => {
  if (pipeline.extra) {
    question += pipeline.extra;
    return question;
  } else {
    return question;
  }
};
onMounted(async () => {
  let setting = await getSetting();
  store.settings = Object.assign(store.settings, setting);
  let os = await getOs();
  const settingOsType = (os:string) => {
    if(os === 'darwin' || os === 'win32') {
      return os;
    }
    return 'other';
  };
  if(!store.settings.currentOs) {
    store.settings.currentOs = settingOsType(os);
  }
  saveSettingDebounce(toRaw(store.settings));
  watch(() => store.settings, () => {
    saveSettingDebounce(toRaw(store.settings));
  }, {
    deep: true,
  });
  const aiHandle = async (job: Job) => {
    console.log('aiHandle', job);
    const pipeline = store.getPipelineById(job.payload.mode);
    jumpTo(pipeline);
    handleBeforeClear(pipeline);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const extraQuestion = handleAddExtra(pipeline, job.payload.question);
    if (!pipeline.autoSend) {
      store.question = extraQuestion;
      return 0;
    }
    const finalQuestion = await handleQuestion(extraQuestion,pipeline);

    const time = new Date().getTime();
    let id = -1;
    try {
      if (pipeline.questionMode === 'ask') {
        id = createNewChat(`新询问-${id}`);
      } else {
        if (store.chat.id === -1) {
          id = createNewChat();
        } else {
          id = store.chat.id;
        }
      }
      
      // eslint-disable-next-line no-inner-declarations
      function createOption() {
        const type = store.settings.connector.type;
        const option: LLMPrams = {
          question: finalQuestion,
          mode: pipeline.questionMode,
          type: type === 'openAi' ? 'openai' : 'chatgpt',
          model: type === 'openAi' ? store.settings.connector.openAi.model : store.settings.connector.chatgptWeb.model,
          id,
        };
        if (type === 'openAi') {
          option.apiKey = store.settings.connector.openAi.apiKey;
          option.maxToken = parseInt(store.settings.connector.openAi.maxToken);
        }
        return option;
      }
      await callLLM(createOption(), (info: Message) => {
          console.log('onMessage', info, time);
          if (pipeline.questionMode === 'ask') {
            store.updateHistory({
              question: finalQuestion,
              answer: info.message,
              time,
            });
          } else {
            store.updateHistory({
              question: finalQuestion,
              answer: info.message,
              time,
            });
          }

          if (pipeline.writeToClipboard && info.done) {
            setTimeout(async () => {
              await writeClipboard(info.message);
              await showNotification('portal','已复制到剪贴板');
            }, 1500);
          }
          if (pipeline.writeToCursor) {
            sendToMain({
              type: 'answer',
              payload: {
                provider: 'openAi',
                message: info.message,
                done: info.done,
                mode: job.payload.mode,
              },
            });
          }
          if(info.done) {
            store.chat.cid = info.cid;
            store.chat.pid = info.pid;
            saveChat(toRaw(store.chat));
          }
          if(info.done) {
            handleAfterClear(pipeline);
          }
         
        });
    } catch (error: { message: string; }) {
      handleError(error.message);
    }

  };
  window.onRenderAsk(aiHandle);
  onMainAsk(aiHandle);
});
const changeRoute = (route: string) => {
  router.push(route);
};
onMounted(() => {
  const handleMessage = (e: { channel: string; }) => {
    const msg = JSON.parse(e.channel) as chatgptMessage;
    if(msg.type === 'error' && msg.payload.message === 'cloudFlare' && store.settings.connector.chatgptWeb.cloudFlareReload) {
      window.reloadWebview();
      return 0;
    }
    const m = msg.payload;
    sendToMainChatgpt({
      type: 'answer',
      payload: {
        provider: 'chatgptWeb',
        message: m.message,
        done: m.done,
        mode: 'read',
        conversationID: m.conversationID,
        parentMessageId: m.parentMessageId,
      },
    });
  };
  const ready = () => {
    const webview = document.getElementById('webview') as any;
    webview!.removeEventListener('ipc-message', handleMessage);
    webview!.addEventListener('ipc-message', handleMessage);
    if (import.meta.env.DEV && !webview!.isDevToolsOpened()) {
      webview!.openDevTools();
    }
    const chatgptWebHandle = async (job: Job) => {
      console.log('chatgptWebHandle', job);
      const { model } = store.settings.connector.chatgptWeb;
      const time = new Date().getTime();
      webview!.send(job.payload.mode, JSON.stringify({
        message: job.payload.question,
        model,
        mode: job.payload.mode,
        conversationID: job.payload.conversationID,
        parentMessageId: job.payload.parentMessageId,
        time,
      }));
    };
    window.setRefresh = () => {
      webview!.send('refresh', JSON.stringify({
        autoRefreshInterval: store.settings.connector.chatgptWeb.autoRefreshInterval,
        autoRefreshUrl: store.settings.connector.chatgptWeb.autoRefreshUrl,
      }));
    };
    window.reloadWebview = () => {
      webview!.reload();
    };
    if(store.settings.connector.chatgptWeb.autoRefresh) {
      
      window.setRefresh();
    }
    onMainAskChatgpt(chatgptWebHandle);
  };
  webview!.addEventListener('dom-ready', ready);
});
</script>

<template>
  <div class="appContainer">
    <div class="bar">
      <div class="shortcut">
      </div>
      <div class="action">
        <el-icon
          :size="25"
          @click="changeRoute('/')"
        >
          <ChatRound />
        </el-icon>
        <el-icon
          :size="25"
          @click="changeRoute('/management')"
        >
          <Setting />
        </el-icon>
        <el-icon
          v-if="store.settings.connector.type === 'chatgptWeb'"
          :size="25"
          @click="changeRoute('/chatgptViewer')"
        >
          <Switch />
        </el-icon>
      </div>
    </div>

    <div class="content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component
            :is="Component"
            v-if="$route.meta.keepAlive && $route.path !== '/chatgptViewer'"
            :key="$route.name"
          />
        </keep-alive>
        <component
          :is="Component"
          v-if="!$route.meta.keepAlive && $route.path !== '/chatgptViewer'"
          :key="$route.name"
        />
      </router-view>
      <ChatGPTViewer v-show="route.path === '/chatgptViewer'"></ChatGPTViewer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.appContainer {
  padding: 0 10px;
  height: calc(100vh - 30px);
  display: flex;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;


  .bar {
    width: 100%;
    flex: 0 0 30px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .shortcut {
      flex: 0 0 200px;
      // beautiful brand style
      display: flex;
      align-items: center;
      // beautiful text style as brand
      font-size: 18px;
      font-weight: 600;
      // beautiful blue color
      color: #409eff;
      //disable selecet
      user-select: none;
    }

    .action {
      flex: 0 0 auto;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      .el-icon {
        width: 100%;
        flex: 1 1 auto;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 5px;

        // hover style
        &:hover {
          background-color: #f5f7fa;
          border-radius: 50%;
        }
      }
    }
  }

  .content {
    width: 100%;
    flex: 1 1 auto;
  }
}
</style>
<style lang="scss">
body {
  padding: 0;
  margin: 0;
  background: transparent;
}

html {
  background: transparent;
}

.cet-title {
  font-size: 18px;
  font-weight: bold;
  color: #ffffff;
}

.cet-container {

  // beautify scroll bar
  &::-webkit-scrollbar {
    width: 10px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
}

.markdown {
  body {
    font-family: Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    color: #333;
    background-color: #fff;
    padding: 20px;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    margin-top: 0;
  }

  h1 {
    font-size: 32px;
    font-weight: bold;
  }

  h2 {
    font-size: 24px;
    font-weight: bold;
  }

  h3 {
    font-size: 18px;
    font-weight: bold;
  }

  hr {
    border: none;
    height: 1px;
    background-color: #ccc;
    margin: 20px 0;
  }

  p {
    margin-top: 0;
  }

  a {
    color: #007aff;
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  ul,
  ol {
    margin-top: 0;
  }

  li {
    margin-bottom: 10px;
  }

  blockquote {
    border-left: 4px solid #ccc;
    margin: 0;
    padding: 10px;
  }

  code,
  pre {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
    font-size: 12px;
    background-color: #f8f8f8;
    border-radius: 3px;
    padding: 2px 5px;
  }

  pre {
    margin: 10px 0;
    overflow: auto;
  }

  table {
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 20px;
  }

  th,
  td {
    padding: 5px;
    text-align: left;
    border-bottom: 1px solid #ccc;
  }

  th {
    font-weight: bold;
  }

}
</style>
