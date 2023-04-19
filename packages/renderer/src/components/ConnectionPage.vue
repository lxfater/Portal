<script lang="ts" setup>
import { clearCache } from '#preload';
import { useStore } from '../state';
const store = useStore();
const options = [
  {
    value: 'chatgptWeb',
    label: 'ChatGPT Web',
  },
  {
    value: 'openAi',
    label: 'OpenAI',
  },
  {
    value: 'baidu',
    label: 'baidu',
  },
];
// 'gpt-4' | 'text-davinci-002-render-sha'
const chatgptModel = [
  {
    value: 'gpt-4',
    label: 'GPT-4',
  },
  {
    value: 'text-davinci-002-render-sha',
    label: 'Text Davinci-002 Render Sha',
  },
];
// 'gpt-3.5-turbo-0301','gpt-3.5-turbo'
const openAiModel = [
  {
    value: 'gpt-3.5-turbo-0301',
    label: 'GPT-3.5 Turbo-0301',
  },
  {
    value: 'gpt-3.5-turbo',
    label: 'GPT-3.5-turbo',
  },
];

const setRefresh = () => {
  if(window.setRefresh) {
    window.setRefresh();
  }
};
</script>

<template>
  <div class="connectionContainer">
    <el-form
      label-width="auto"
      label-position="top"
    >
      <el-form-item label="client">
        <el-select
          v-model="store.settings.connector.type"
          placeholder="client"
          size="small"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <div
        v-if="store.settings.connector.type === 'chatgptWeb'"
        class="chatgptWeb"
      >
        <div class="danger">Note: This feature is only an experimental function and cannot guarantee the security of your account. It is recommended to use a secondary account.</div>
        <el-form-item label="Model">
          <el-select
            v-model="store.settings.connector.chatgptWeb.model"
            placeholder="Model"
            size="small"
          >
            <el-option
              v-for="item in chatgptModel"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="loginUrl">
          <el-input
            v-model="store.settings.connector.chatgptWeb.loginUrl"
            placeholder="loginUrl"
            size="small"
          />
        </el-form-item>
        <el-button
          type="danger"
          size="small"
          @click="clearCache"
        >
          Clear cache
        </el-button>
        <span style="font-size:12px;margin-left:10px; color:red">Clear cache and restart the application</span>
        <div
          class="danger"
          style="margin-top: 10px;"
        >
          The auto-refresh feature can improve the disconnection issue, but there may be unknown risks.
        </div>
        <el-form-item label="autoRefresh">
          <el-switch v-model="store.settings.connector.chatgptWeb.autoRefresh" />
        </el-form-item>
        <div v-if="store.settings.connector.chatgptWeb.autoRefresh">
          <el-form-item label="autoRefreshInterval">
            <el-input
              v-model="store.settings.connector.chatgptWeb.autoRefreshInterval"
              placeholder="autoRefreshInterval seconds"
              size="small"
            />
          </el-form-item>
          <el-form-item label="autoRefreshUrl">
            <el-input
              v-model="store.settings.connector.chatgptWeb.autoRefreshUrl"
              placeholder="autoRefreshUrl"
              size="small"
            />
          </el-form-item>
          <el-button
            type="danger"
            size="small"
            @click="setRefresh"
          >
            setRefresh
          </el-button>
        </div>
        <el-form-item label="cloudFlareReload">
          <el-switch v-model="store.settings.connector.chatgptWeb.cloudFlareReload" />
        </el-form-item>
      </div>
      <div
        v-else-if="store.settings.connector.type === 'openAi'"
        class="openAi"
      >
        <div class="danger">Note: This feature is only an experimental function. If you violate OpenAI's user policy, this software will not be responsible. It is recommended to use a secondary account.</div>
        <el-form-item label="apikey">
          <el-input
            v-model="store.settings.connector.openAi.apiKey"
            placeholder="apikey"
            type="password"
            size="small"
          />
        </el-form-item>
        <el-form-item label="maxTokens">
          <el-input
            v-model="store.settings.connector.openAi.maxToken"
            placeholder="maxToken"
            size="small"
          />
        </el-form-item>
        <el-form-item label="Model">
          <el-select
            v-model="store.settings.connector.openAi.model"
            placeholder="Model"
            size="small"
          >
            <el-option
              v-for="item in openAiModel"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </div>
      <div>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss">
.connectionContainer {
  .danger {
    color: red;
    font-size: 14px;
  }
}
</style>