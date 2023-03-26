<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`${!isAdd ? '编辑' : '添加'}对话`"
    width="80%"
    max-height="80%"
    :before-close="handleClose"
  >
    <el-form
      label-position="right"
      label-width="100px"
      style="max-width: 460px"
      size="small"
    >
      <el-form-item label="对话名称">
        <el-input
          v-model="form.name"
          placeholder="请输入对话名称"
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
  import { reactive, ref, toRaw } from 'vue';
  import type { ChatItem, Pipeline } from '../../../types';
  import { useStore } from '../state';
  import { getChat, saveChat } from '#preload';
  const createNewChat = (name?: string) => {
      const id = new Date().getTime();
      store.chat = {
        parentHistory: null,
        history: {},
        id,
        pid: '',
        cid: '',
        name: name || `新对话-${id}`,
        next: {},
      };
      saveChat(toRaw(store.chat));
};
  const emit = defineEmits(['change']);
  const store = useStore();
  const isAdd = ref(true);
  const dialogVisible = ref(false);
  const form = reactive({
      name: '',
      id: -1,
  });
  const open = (p?: ChatItem) => {
      if (p) {
          isAdd.value = false;
          form.name = p.name;
          form.id = p.id;
      } else {
          isAdd.value = true;
      }
      dialogVisible.value = true;
  };
  const reset = () => {
      form.name = '';
  };
  const submit = async () => {
      const data = JSON.parse(JSON.stringify(toRaw(form)));
      if (isAdd.value) {
        await createNewChat(data.name);
      } else {
        let chat = await getChat(form.id);
        chat.name = form.name;
        await saveChat(toRaw(chat));
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