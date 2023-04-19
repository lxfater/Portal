export type MessageTypes = 'ask' | 'answer' ;
export type JobMode = 'chat' | 'ask';
export type Provider = 'chatgptWeb' | 'openAi' | 'baidu';
export type Message = { 
    message: string;
    done: boolean;
    pid: string;
    cid: string;
}
export type Job = askJob | answerJob;
export type answerJob = {
    type: 'answer',
    payload: {
        provider:Provider,
        message: string;
        done: boolean;
        mode: JobMode;
    }
}
export type askJob = {
    type: 'ask',
    payload: {
        provider:Provider,
        question: string;
        mode: JobMode;
        conversationID?: string;
        parentMessageId?: string;
    }
}
export type Prompt = {
  type: 'personal' | 'public';
  id:number;
  scope: string;
  activity: string;
  name: string;
  summary: string;
  placeholder: string;
  shortcut: string;
  tag: string;
  template: string;
}
export type QuestionMode = 'ask' | 'chat';
export type clearType = 'none' | 'input' | 'prompt' | 'both';
export type Pipeline = {
    shortcut: string;
    name: string;
    id: number;
    jump: boolean;
    beforeClear: clearType
    extra: string;
    autoSend: boolean;
    questionMode: QuestionMode;
    writeToCursor: boolean;
    writeToClipboard: boolean;
    afterClear: clearType,
    targetLanguage: string | null;
}
export type Prompts = Prompt[]
export type Settings = {
    connector: {
      type: 'chatgptWeb' | 'openAi' ;
      chatgptWeb: {
        loginUrl: string;
        model: string;
        autoRefresh: boolean;
        autoRefreshInterval: number;
        autoRefreshUrl: string;
        cloudFlareReload: boolean;
      };
      openAi: {
        apiKey: string;
        model: string;
        maxToken: string;
        memory: string;
      };
      baidu: {
        apiKey: string;
      }
    };
    pipelines: Record<string, Pipeline>;
    system: {
      win32: {
        titlePosition: string,
        allowWriteBack: boolean,
      },
      darwin: {
        titlePosition: string,
        allowWriteBack: boolean,
      },
      other: {
        titlePosition: string,
        allowWriteBack: boolean,
      }
    },
    currentOs: null| 'win32'| 'other'| 'darwin'
    targetLanguage: string | null;
};
export type Answer = {
  question: string;
  answer: string;
  time: number;
  next?: number[]
}
export type Chat = {
  parentHistory: Answer | null;
  history: Record<number,Answer>;
  id: number;
  pid:string;
  cid:string;
  name: string;
  next: Record<number, Chat>;
}

export type ChatItem = {
  id: number;
  name: string;
}
export type chatgptMessage = {
  type: 'message'
  payload: {
    message: string;
    done: boolean;
    mode: string;
    time: number;
    parentMessageId?: string;
    conversationID?: string;
    question: string;
  };
} | {
  type: 'error'
  payload: {
    time: number;
    message: string;
  };
}

export type RefreshSetting = {
  autoRefresh: boolean;
  autoRefreshInterval: number;
}

export type LLMPrams = {
  type: 'chatgpt' | 'openai',
  mode: 'ask' | 'chat',
  question: string;
  model: string;
  maxToken?: number;
  apiKey?: string;
  id: number; // chat id
};