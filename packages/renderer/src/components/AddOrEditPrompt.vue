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
      <el-form-item label="Domain">
        <el-select
          v-model="form.scope"
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="Select or create domain"
        >
          <el-option
            v-for="item in scopeOption"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Activity">
        <el-select
          v-model="form.activity"
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="Select, retrieve, or create an activity"
        >
          <el-option
            v-for="item in activityOption"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Title">
        <el-input
          v-model="form.name"
          placeholder="Please enter the title"
        />
      </el-form-item>
      <el-form-item label="Introduction">
        <el-input
          v-model="form.placeholder"
          :rows="2"
          type="textarea"
          placeholder="Introduction&Input prompt"
        />
      </el-form-item>
      <el-form-item label="Prompt template">
        <el-input
          v-model="form.template"
          :rows="5"
          type="textarea"
          placeholder="Prompt template {{ input }} represents the user's input, and {{ targetLanguage }} represents the target language."
        />
      </el-form-item>
      <el-form-item label="Quick phrase">
        <el-input
          v-model="form.shortcut"
          placeholder="Used for quick search"
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
          Edit
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
  
  <script lang="ts" setup>
  import { onMounted, reactive, ref, toRaw, watch } from 'vue';
  import { addPrompt, getScopeList, updatePrompt, getActivityList } from '#preload';
  const emit = defineEmits(['change']);
  const isAdd = ref(true);
  const dialogVisible = ref(false);
  const scopeOption = ref<string[]>([]);
  const activityOption = ref<string[]>([]);
  const form = reactive({
    type: '',
    scope: '',
    activity: '',
    name: '',
    placeholder: '',
    shortcut: '',
    template: '',
    id: '',
  });
  onMounted(async () => {
    scopeOption.value = await getScopeList();
  });
  watch(() => form.scope, async () => {
    activityOption.value = await getActivityList(form.scope);
  });
  const open = (type, p) => {
    if(p) {
      isAdd.value = false;
      form.scope = p.scope;
      form.type = type;
      form.activity = p.activity;
      form.name = p.name;
      form.placeholder = p.placeholder;
      form.shortcut = p.shortcut;
      form.template = p.template;
      form.id = p.id;
    } else {
      form.type = type;
      isAdd.value = true;
    }
    dialogVisible.value = true;
  };
  const reset = () => {
    form.scope = '';
    form.activity = '';
    form.name = '';
    form.placeholder = '';
    form.shortcut = '';
    form.template = '';
    form.id = '';
    form.type = '';
  };
  const submit = async () => {
    const data = JSON.parse(JSON.stringify(toRaw(form)));
    if(isAdd.value) {
      await addPrompt(data);
    } else {
      await updatePrompt(data);
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