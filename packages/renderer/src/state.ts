import { defineStore } from 'pinia';

import type { Answer, Pipeline, Prompt, Settings, Chat } from '../../types';
export const settings:Settings = {
  connector: {
    type: 'chatgptWeb',
    chatgptWeb: {
      loginUrl: 'https://chat.openai.com/chat',
      model: 'text-davinci-002-render-sha',
      autoRefresh: false,
      autoRefreshInterval: 30,
      autoRefreshUrl: 'https://chat.openai.com/_next/static/k9OKjvwgjWES7JT3k-6g9/_ssgManifest.js',
      cloudFlareReload: false,
    },
    openAi: {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      maxToken: '500',
      memory: '8',
    },
    baidu: {
      apiKey: '',
    },
  },
  pipelines: {
    'F6': {
      name: '自动读',
      id: 'F6',
      jump: false,
      beforeClear: 'both',
      extra: '',
      autoSend: true,
      questionMode: 'ask',
      afterClear: 'both',
      writeToCursor: false,
      writeToClipboard: true,
    },
  },
  system: {
    win32: {
      titlePosition: 'left',
      allowWriteBack: true,
    },
    other: {
      titlePosition: 'left',
      allowWriteBack: true,
    },
    darwin: {
      titlePosition: 'center',
      allowWriteBack: false,
    },
  },
  currentOs: null,
  defaultOutput: '中文',
};

type State = {
    settings: Settings;
    question: string;
    chat: Chat;
    currentPromptPath: number[] | null;
    currentPrompt: Prompt | null;
    currentConversationID: string;
    currentParentMessageId: string;
};
export const useStore = defineStore('storeId', {
  state: (): State => {
    return {
        settings,
        question: '',
        currentPromptPath: null,
        currentPrompt: null,
        currentConversationID: '',
        currentParentMessageId: '',
        chat: {
          parentHistory: null,
          history: {},
          id: -1,
          pid: '',
          cid: '',
          name: '',
          next: {},
        },
    };
  },
  getters: {
    currentHistory: (state) => {
      if(state.chat) {
        return Object.values(state.chat.history) || [];
      }
      return [];
    },
  },
  actions: {
    getHistoryByTime(time: number){
      return this.chat.history[time];
    },
    updateHistory(a:Answer) {
      if(this.chat.parentHistory) {
        this.chat.parentHistory.next = this.chat.parentHistory.next ? [
          ...this.chat.parentHistory.next,
          a.time,
        ] : [a.time];
        this.chat.parentHistory = null;
      }
      this.chat.history[a.time] = {
        ...this.chat.history[a.time],
        ...a,
      };
    },
    deleteHistory(time: number){
      delete this.chat.history[time];
    },
    getPipelineById(id: number): Pipeline{
      if(id ===  0) {
        return {
          name: '自动读',
          shortcut: 'ask',
          id: 0,
          jump: false,
          beforeClear: 'both',
          extra: '',
          autoSend: true,
          questionMode: 'ask',
          afterClear: 'none',
          writeToCursor: false,
          writeToClipboard: false,
          targetLanguage: null,
        };
      } else if(id === 1) {
        return {
          name: '自动聊',
          id: 1,
          shortcut: 'chat',
          jump: false,
          beforeClear: 'none',
          extra: '',
          autoSend: true,
          questionMode: 'chat',
          afterClear: 'none',
          writeToCursor: false,
          writeToClipboard: false,
          targetLanguage: null,
        };
      } 
      return this.settings.pipelines[id];
    },
    addPipeline(pipeline: Pipeline){
      this.settings.pipelines[pipeline.id] = pipeline;
    },
    updatePipeline(pipeline: Pipeline){
      this.settings.pipelines[pipeline.id] = pipeline;
    },
    deletePipeline(pipeline: Pipeline){
      delete this.settings.pipelines[pipeline.id];
    },
  },
});