<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`${!isAdd ? 'Edit' : 'Add'}`"
    width="80%"
    max-height="80%"
    :before-close="handleClose"
  >
    <el-form
      label-position="right"
      label-width="120px"
      style="max-width: 460px"
      size="small"
    >
      <el-form-item label="Mode name">
        <el-input
          v-model="form.name"
          placeholder="Mode name"
        />
      </el-form-item>
      <el-form-item label="Shortcut key">
        <el-input
          v-model="form.shortcut"
          placeholder="Please enter the shortcut key"
          @keyup="keyUp"
        />
      </el-form-item>
      <el-form-item label="Jump to mouse position">
        <el-switch
          v-model="form.jump"
          size="small"
          active-text="Open"
          inactive-text="Close"
        />
      </el-form-item>
      <el-form-item label="Clear historical data">
        <el-select
          v-model="form.beforeClear"
          placeholder="Select"
          size="small"
        >
          <el-option
            v-for="item in clear"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Select prompt for quick command">
        <el-select
          v-model="form.extra"
          filterable
          placeholder="Enter to search for your prompt template"
        >
          <el-option
            v-for="item in prompts"
            :key="item.shortcut"
            :label="item.name"
            :value="` -s=${item.shortcut}`"
          >
            <span style="float: left;width:350px">{{ item.name }}</span>
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="targetLanguage">
        <el-select
          v-model="form.targetLanguage"
          placeholder="targetLanguage"
        >
          <el-option
            v-for="item in languageOptions"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Auto-send">
        <el-switch
          v-model="form.autoSend"
          size="small"
          active-text="Open"
          inactive-text="Close"
        />
      </el-form-item>
      <el-form-item label="Chat mode">
        <el-select
          v-model="form.questionMode"
          placeholder="Select"
          size="small"
        >
          <el-option
            v-for="item in chatMode"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Clear data after chat">
        <el-select
          v-model="form.afterClear"
          placeholder="Select"
          size="small"
        >
          <el-option
            v-for="item in clear"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        label="writeToCursor"
      >
        <el-switch
          v-model="form.writeToCursor"
          size="small"
          :disabled="!store.settings.system[store.settings.currentOs|| 'win32'].allowWriteBack"
          active-text="Open"
          inactive-text="Close"
        />
      </el-form-item>
      <el-form-item label="writeToClipboard">
        <el-switch
          v-model="form.writeToClipboard"
          size="small"
          active-text="Open"
          inactive-text="Close"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">cancel</el-button>
        <el-button
          type="primary"
          @click="submit"
        >
          submit
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
    
<script lang="ts" setup>
import { onMounted, reactive, ref, toRaw } from 'vue';
import type { Pipeline, Prompts } from '../../../types';
import { useStore } from '../state';
import { getPromptList, saveSetting, saveShortcut, getOs } from '#preload';
import { ElMessage } from 'element-plus';
import { languageOptions } from '../utils';
const prompts = ref<Prompts>([]);
const emit = defineEmits(['change']);
const store = useStore();
const isAdd = ref(true);
const dialogVisible = ref(false);
const os = ref('');
onMounted(async () => {
  const result:Prompts = await getPromptList();
  prompts.value = result.filter((p) => p.shortcut);
  os.value  = await getOs();
});
const clear = [{
label: 'Do not clear',
value: 'none',
}, {
label: 'Clear all',
value: 'both',
}, {
label: 'Only clear input box',
value: 'input',
}, {
label: 'Only clear prompt',
value: 'prompt',
}];

const chatMode = [{
label: 'Question and answer mode',
value: 'ask',
}, {
label: 'Chat mode',
value: 'chat',
}];
function keyUp(event: { key: any; ctrlKey: any; altKey: any; shiftKey: any; metaKey: any; keyCode: any; }) {
    const { key, ctrlKey, altKey, shiftKey, metaKey, keyCode } = event;
    if ((keyCode >= 16 && keyCode <= 18) || keyCode === 91) return;
    const shortcut = `${ctrlKey ? 'Control+' : ''}${altKey ? 'Alt+' : ''}${shiftKey ? 'Shift+' : ''}${metaKey ? 'Meta+' : ''}${key.toUpperCase()}`;
    const result = Object.values(store.settings.pipelines).find((p) => p.shortcut === shortcut);
    if (!result) {
      form.shortcut = shortcut;
    } else {
      form.shortcut = '';
      ElMessage({
        message: '快捷键已经存在,并且已经触发了快捷键动作',
        type: 'error',
        showClose: true,
        offset: 100,
        center: true,
        duration: 2000,
      });
    }
    
}
const form = reactive<{
    name: string;
    id: number;
    shortcut: string;
    jump: boolean;
    beforeClear: string;
    extra: string;
    autoSend: boolean;
    questionMode: string;
    afterClear: string;
    writeToCursor: boolean;
    writeToClipboard: boolean;
    targetLanguage: null | string;
}>({
    name: '',
    id: -1,
    shortcut: '',
    jump: false,
    beforeClear: '',
    extra: '',
    autoSend: true,
    questionMode: '',
    afterClear: '',
    writeToCursor: false,
    writeToClipboard: true,
    targetLanguage: null,
});
const open = (p?: Pipeline) => {
    if (p) {
        isAdd.value = false;
        form.name = p.name;
        form.id = p.id;
        form.shortcut = p.shortcut;
        form.jump = p.jump;
        form.beforeClear = p.beforeClear;
        form.extra = p.extra;
        form.autoSend = p.autoSend;
        form.questionMode = p.questionMode;
        form.afterClear = p.afterClear;
        form.writeToCursor = p.writeToCursor;
        form.writeToClipboard = p.writeToClipboard;
        form.targetLanguage = p.targetLanguage;
    } else {
        isAdd.value = true;
    }
    dialogVisible.value = true;
};
const reset = () => {
    form.name = '';
    form.id = -1;
    form.shortcut = '';
    form.jump = false;
    form.beforeClear = 'both';
    form.extra = '';
    form.autoSend = true;
    form.questionMode = 'ask';
    form.afterClear = 'both';
    form.writeToCursor = false;
    form.writeToClipboard = true;
    form.targetLanguage = null;
};
const submit = async () => {
    
    
    if (isAdd.value) {
        form.id = new Date().getTime();
        const data = JSON.parse(JSON.stringify(toRaw(form)));
        store.addPipeline(data);
    } else {
        const data = JSON.parse(JSON.stringify(toRaw(form)));
        store.updatePipeline(data);
    }
    try {
      // wait for save file
      await saveSetting(toRaw(store.settings));
      await saveShortcut();
    } catch (error) {
      console.log(error);
    }
    dialogVisible.value = false;
    reset();
    emit('change');
};
const handleClose = () => {
    dialogVisible.value = false;
    reset();
};
defineExpose({
    open,
});
</script>
<style scoped>
.dialog-footer button:first-child {
    margin-right: 10px;
}
</style>