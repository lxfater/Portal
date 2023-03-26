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
</script>

<template>
  <div class="connectionContainer">
    <el-form
      label-width="auto"
    >
      <el-form-item label="接入方式">
        <el-select
          v-model="store.settings.connector.type"
          placeholder="请选择接入方式"
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
        <div class="danger">注意：本功能仅为实验功能，无法保证对账号的安全性，建议使用小号使用。</div>
        <el-form-item label="模型">
          <el-select
            v-model="store.settings.connector.chatgptWeb.model"
            placeholder="请选择接入的模型"
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
        <el-form-item label="登录地址">
          <el-input
            v-model="store.settings.connector.chatgptWeb.loginUrl"
            placeholder="请输入登录地址"
            size="small"
          />
        </el-form-item>
        <el-button
          type="danger"
          size="small"
          @click="clearCache"
        >
          清除缓存
        </el-button>
        <span style="font-size:12px;margin-left:10px; color:red">清除缓存并将重启应用</span>
      </div>
      <div
        v-else-if="store.settings.connector.type === 'openAi'"
        class="openAi"
      >
        <div class="danger">注意：本功能仅为实验功能，假如你违反了openai的用户政策，本软件不会承担任何责任，建议使用小号使用。</div>
        <el-form-item label="apikey">
          <el-input
            v-model="store.settings.connector.openAi.apiKey"
            placeholder="请输入apikey"
            type="password"
            size="small"
          />
        </el-form-item>
        <el-form-item label="maxTokens">
          <el-input
            v-model="store.settings.connector.openAi.maxToken"
            placeholder="请输入maxToken"
            size="small"
          />
        </el-form-item>
        <el-form-item label="模型">
          <el-select
            v-model="store.settings.connector.openAi.model"
            placeholder="请选择接入的模型"
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