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
      label-width="100px"
      style="max-width: 460px"
      size="small"
    >
      <el-form-item label="Conversation name">
        <el-input
          v-model="form.name"
          placeholder="Conversation name"
        />
      </el-form-item>
    </el-form>
  
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
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
        name: name || `New-${id}`,
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