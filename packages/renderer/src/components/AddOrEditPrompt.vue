<template>  
  <el-dialog
    v-model="dialogVisible"
    :title="`${!isAdd ? '编辑' : '添加'}提示语`"
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
      <el-form-item label="领域">
        <el-select
          v-model="form.scope"
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="选择或者创建领域"
        >
          <el-option
            v-for="item in scopeOption"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="活动">
        <el-select
          v-model="form.activity"
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="选择获取创建活动"
        >
          <el-option
            v-for="item in activityOption"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="标题">
        <el-input
          v-model="form.name"
          placeholder="请输入标题"
        />
      </el-form-item>
      <el-form-item label="介绍&输入提示">
        <el-input
          v-model="form.placeholder"
          :rows="2"
          type="textarea"
          placeholder="输入介绍&输入提示"
        />
      </el-form-item>
      <el-form-item label="提示语模板">
        <el-input
          v-model="form.template"
          :rows="5"
          type="textarea"
          placeholder="提示语模板 {{ input }} 代表用户输入的内容, {{ targetLanguage }} 代表输出语言"
        />
      </el-form-item>
      <el-form-item label="快捷短语">
        <el-input
          v-model="form.shortcut"
          placeholder="用于快速检索"
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