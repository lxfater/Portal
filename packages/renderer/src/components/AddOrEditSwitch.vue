<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`${!isAdd ? '编辑' : '添加'}模式`"
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
      <el-form-item label="模式名称">
        <el-input
          v-model="form.name"
          placeholder="请输入模式名称"
        />
      </el-form-item>
      <el-form-item label="快捷键">
        <el-input
          v-model="form.shortcut"
          placeholder="请输入快捷键"
          @keyup="keyUp"
        />
      </el-form-item>
      <el-form-item label="跳转到鼠标位置">
        <el-switch
          v-model="form.jump"
          size="small"
          active-text="Open"
          inactive-text="Close"
        />
      </el-form-item>
      <el-form-item label="清理历史数据">
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
      <el-form-item label="选择快捷指令的提示语">
        <el-select
          v-model="form.extra"
          filterable
          placeholder="输入即可搜索你的提示语模板"
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
      <el-form-item label="选择输出语言">
        <el-select
          v-model="form.targetLanguage"
          placeholder="输入的语言"
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
      <el-form-item label="自动发送">
        <el-switch
          v-model="form.autoSend"
          size="small"
          active-text="Open"
          inactive-text="Close"
        />
      </el-form-item>
      <el-form-item label="对话模式">
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
      <el-form-item label="清理对话后的数据">
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
        label="在光标处写入"
      >
        <el-switch
          v-model="form.writeToCursor"
          size="small"
          :disabled="!store.settings.system[store.settings.currentOs|| 'win32'].allowWriteBack"
          active-text="Open"
          inactive-text="Close"
        />
      </el-form-item>
      <el-form-item label="自动复制">
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
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="submit"
        >
          提交
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
    label: '不清理',
    value: 'none',
}, {
    label: '清理所有',
    value: 'both',
}, {
    label: '只清理输入框',
    value: 'input',
}, {
    label: '只清理prompt',
    value: 'prompt',
}];
const chatMode = [{
    label: '问答模式',
    value: 'ask',
}, {
    label: '聊天模式',
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