<script lang="ts" setup>
import { onMounted, ref, toRaw } from 'vue';
import { useStore } from '../state';
import { ElMessage } from 'element-plus';
import { languageOptions } from '../utils';
import AddConversation from './AddConversation.vue';
import { deleteChat, getCascadePrompt, getChat, getChatsList, getPrompt, getPromptCascades, callChatgptWeb, saveChatAsMarkdown } from '#preload';
import {
  Download,
  Plus,
  Edit,
  Delete,
  Compass,
} from '@element-plus/icons-vue';
import ChatEditor from './chatEditor.vue';
import ChatMap from './ChatMap.vue';
import type { ChatItem, Prompt } from '../../../types';
const timeline = ref();
const addConversation = ref<InstanceType<typeof AddConversation>>();
const drawer = ref(false);
const cascadePrompt = ref([]);
const store = useStore();
const props = {
  expandTrigger: 'hover' as const,
};

onMounted(async () => {
  cascadePrompt.value = await getCascadePrompt();
});

const copy = () => {
  navigator.clipboard.writeText(store.answer);
  ElMessage.success({
    showClose: true,
    message: '复制成功',
    offset: 100,
    center: true,
    duration: 1000,
  });
};

const reloadWebview = () => {
  window.reloadWebview();
};

const saveAsMarkdown = async () => {
  await saveChatAsMarkdown(toRaw(store.chat));
};

const onSubmit = () => {
  const type = store.settings.connector.type;

  window.aiCallBack({
    type: 'ask',
    payload: {
      provider: type,
      mode: 0,
      question: store.question,
    },
  });

  // goDown();

};
const onKeyDown = (event) => {
  if (event.ctrlKey && event.key === 'Enter') {
    onChat();
  }
};
const onChat = async () => {
  const type = 'openAi';
  window.aiCallBack({
    type: 'ask',
    payload: {
      provider: type,
      mode: 1,
      question: store.question,
    },
  });
  goDown();
  // await callChatgptWeb();
};

const goDown = () => {
  // console.log(timeline.value);
  // const element = timeline.value;
  // element.scrollTop = element.scrollHeight;
};

let chatList = ref<ChatItem[]>([]);
const refresh = async () => {
  const list = await getChatsList();
  // sort list by id
  list.sort((a: { id: number; }, b: { id: number; }) => b.id - a.id);
  chatList.value = list;
};
const openChatList = async () => {
  drawer.value = true;
  showMap.value = true;
  await refresh();
};

const timestampToDate = (time: number) => {
  const date = new Date(time);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return `${year}/${month}/${day} ${hour}:${minute}:${second}`;
};

const openAddConversation = () => {
  addConversation.value?.open();
};

const openEditConversation = (chat: ChatItem) => {
  addConversation.value?.open(chat);
};

const onChange = async (p: number[]) => {
  store.currentPromptPath = p;
  if(!((Array.isArray(p) && p.length === 0 ) || p === null)) {
    const currentPrompt = await getPrompt(p[2]);
    store.currentPrompt = currentPrompt;
  } else {
    store.currentPrompt = null;
  }
};

const showMap = ref(true);
const toggle = () => {
  showMap.value = !showMap.value;
};

const setChat = async (id: number) => {
  const chat = await getChat(id);
  store.chat = chat;
};

const clearChat = async (id: number) => {
  if (store.chat.id === id) {
    store.chat = {
      parentHistory: null,
      history: {},
      id: -1,
      pid: '',
      cid: '',
      name: '',
      next: {},
    };
  }
  await deleteChat(id);
  await refresh();
};

</script>

<template>
  <div class="container">
    <AddConversation
      ref="addConversation"
      @change="refresh"
    ></AddConversation>
    <el-drawer
      v-model="drawer"
      title="I am the title"
      direction="ltr"
    >
      <template #header="{ close, titleId, titleClass }">
        <el-button
          :icon="Plus"
          size="25"
          style="flex: 0"
          circle
          @click="openAddConversation"
        />
      </template>
      <div class="drawerContainer">
        <div
          v-for="chat in chatList"
          :key="chat.name"
          class="chat"
          :style="store.chat.id === chat.id ? 'background: #f5f5f5;' : ''"
          @click="setChat(chat.id)"
        >
          <div class="title">{{ chat.name }}</div>
          <div class="action">
            <el-button
              type="primary"
              size="small"
              :icon="Edit"
              circle
              @click.stop="openEditConversation(chat)"
            />
            <el-button
              type="danger"
              size="small"
              :icon="Delete"
              circle
              @click.stop="clearChat(chat.id)"
            />
          </div>
        </div>
      </div>
    </el-drawer>
    <div class="question">
      <div class="bar">
        <el-cascader
          v-model="store.currentPromptPath"
          size="small"
          style="width: 150px;"
          placeholder="Filter your prompts"
          :options="cascadePrompt"
          filterable
          clearable
          popper-class="cascader"
          :props="props"
          @change="onChange"
        >
          <template #default="{ node, data }">
            <span v-if="!node.isLeaf">
              <span>{{ data.label }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </span>
            <span v-else>
              <el-tooltip
                class="box-item"
                effect="dark"
                :content="data.label"
                placement="left-start"
              >
                {{ data.label }}
              </el-tooltip></span>
          </template>
        </el-cascader>
        <el-select
          v-model="store.settings.targetLanguage"
          placeholder="Select target language, default is English"
          style="width: 100px;"
          size="small"
        >
          <el-option
            v-for="item in languageOptions"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
        <div class="parentHistory">
          <el-button
            v-if="store.chat && store.chat.parentHistory"
            type="warning"
            size="small"
            @click="() => {
              store.chat.parentHistory = null
            }"
          >
            clear Connection
          </el-button>
        </div>
        <div>
          <el-button
            size="small"
            type="primary"
            @click="openChatList"
          >
            list
          </el-button>
          <el-button
            size="small"
            type="primary"
            @click="onChat"
          >
            chat
          </el-button>
        </div>
      </div>
      <el-input
        v-model="store.question"
        clearable
        show-word-limit
        :rows="5"
        type="textarea"
        :placeholder="store.currentPrompt?.placeholder || 'Please input your question'"
        @keydown="onKeyDown"
      />
    </div>
    <div class="card">
      <div class="bar">
        <div class="title">{{ store.chat && store.chat.name }}</div>
        <div class="action">
          <el-tooltip
            content="Reload when thing goes wrong"
            placement="top"
          >
            <el-icon size="25">
              <Refresh @click="reloadWebview" />
            </el-icon>
          </el-tooltip>
          <el-tooltip
            content="Map"
            placement="top"
          >
            <el-icon size="25">
              <Compass @click="toggle" />
            </el-icon>
          </el-tooltip>
          <el-tooltip
            content="saveAsMarkdown"
            placement="top"
          >
            <el-icon size="25">
              <Download @click="saveAsMarkdown" />
            </el-icon>
          </el-tooltip>
        </div>
      </div>
      <div
        v-if="showMap"
        id="chatbox"
        class="history"
      >
        <el-timeline ref="timeline">
          <el-timeline-item
            v-for="item in Object.values(store.currentHistory).reverse()"
            :key="item.time"
            :timestamp="timestampToDate(item.time)"
            placement="top"
          >
            <el-card shadow="hover">
              <h4>{{ item.question }}</h4>
              <ChatEditor
                :item="item"
                :data-id="item.time"
              ></ChatEditor>
            </el-card>
          </el-timeline-item>
        </el-timeline>
      </div>
      <div
        v-else
        class="chatMap"
      >
        <ChatMap
          :show-map="showMap"
          @toggle="toggle"
        ></ChatMap>
      </div>
    </div>
  </div>
</template>


<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
  padding: 5px;

  .drawerContainer {
    .chat {
      // flat card style
      background-color: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      margin-bottom: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 5px;
      cursor: pointer;

      .title {
        // title font style
        font-size: 14px;
        font-weight: 500;
        color: #303133;
        flex: 1 1 auto;
      }

      .action {
        flex: 0 0 auto;
      }
    }
  }

  ::v-deep(.el-overlay) {
    background-color: rgba(0, 0, 0, 0.5);
    top: 30px;

    .el-drawer {
      width: 250px !important;
    }

    .el-drawer__header {
      justify-content: space-between;
    }

    .el-drawer__body {
      padding: 8px;
    }
  }

  .question {
    flex: 0 0 auto;
    border-radius: 5px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .bar {
      padding: 5px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }
  }

  .card {
    flex: 1 1 auto;
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    border-radius: 5px;
    border: none;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

    .bar {
      display: flex;
      flex: 0 0 auto;
      padding: 5px;
      margin-top: 10px;
      justify-content: space-between;
      cursor: pointer;

      .action {
        flex: 0 0 60px;
        display: flex;
        justify-content: space-between;
      }

      .title {
        margin-left: 10px;
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }
    }

    .history {
      flex: 1 1 auto;
      position: relative;
      overflow-x: auto;
      overflow-y: auto;
      padding: 5px;
      margin-top: 10px;

      &::-webkit-scrollbar {
        width: 8px;
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

      ::v-deep(.el-timeline) {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        padding-left: 10px;

        .el-timeline-item__timestamp {
          font-size: 12px;
        }

        .el-timeline-item__content {
          padding-right: 10px;
        }
      }


    }

    .chatMap {
      flex: 1 1 auto;
      position: relative;
      overflow-x: auto;
      overflow-y: auto;
      padding: 5px;
      margin-top: 10px;
    }
  }

}
</style>
<style lang="scss">
.cascader {
  .el-cascader-menu:nth-of-type(1) {
    max-width: 120px
  }

  .el-cascader-menu:nth-of-type(2) {
    max-width: 120px
  }

  .el-cascader-menu:nth-of-type(3) {
    max-width: 120px
  }
}

pre code {
  display: block;
  box-sizing: border-box;
  padding: 10px;
  overflow-x: auto;

  // beautify scroll bar
  &::-webkit-scrollbar {
    width: 5px;
    height: 5px;
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

pre code.hljs {
  background-color: #f5f5f5;
}

pre {
  background-color: #f5f5f5;
  border-radius: 5px;
  margin: 0;
  padding: 0;
  border: none;
  overflow: hidden;
  position: relative;
}

button.copy-code-button {
  float: right;
  position: absolute;
  right: 0;
  margin: 5px;
  border: none;
  outline: none;
  font-size: 14px;
  cursor: pointer;
  background-color: #eee;
  color: #666;
}
</style>