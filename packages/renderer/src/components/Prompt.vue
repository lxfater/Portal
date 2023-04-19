<script lang="ts" setup>
import AddOrEditPrompt from './AddOrEditPrompt.vue';
import {
  Plus,
  Edit,
  Delete,
} from '@element-plus/icons-vue';
import { onMounted, reactive, ref, watch } from 'vue';
import type { Prompt } from '../../../types';
import { deletePrompt, importPrompts, getPromptList, getPromptCascades } from '#preload';
const addOrEditPrompt = ref('');
const activeName = ref('personal');
type Form =   {
    scopeAndActivity: string | null;
    prompt: Prompt[];
    promptCascades: string[];
    scope: string | null;
    activity: string | null;
    page: number;
    pageSize: number;
    total: number;
  }
const personal = reactive<Form>({
  scopeAndActivity: null,
  prompt: [],
  promptCascades: [],
  scope: null,
  activity: null,
  page: 1,
  pageSize: 20,
  total: 0,
});

const public1 = reactive<Form>({
  scopeAndActivity: null,
  prompt: [],
  promptCascades: [],
  scope: null,
  activity: null,
  page: 1,
  pageSize: 20,
  total: 0,
});
const props = {
  expandTrigger: 'hover' as const,
};
const openAddPerson = (type) => {
  addOrEditPrompt.value.open(type);
};
const openEditPerson = (type,prompt) => {
  addOrEditPrompt.value.open(type,prompt);
};

const handleDeletePrompt = async (id: number) => {
  await deletePrompt(id);
  await refresh();
};

const updatePrompt = async (target, type) => {
  const { scopeAndActivity, page, pageSize } = target;
  const [scope, activity] = scopeAndActivity || [null, null];
  const { result, total } = await getPromptList({ type, pageSize, page, scope, activity });
  target.prompt = result;
  target.total = total;
};

const addPrompts = async () => {
  await importPrompts();
  await refresh();
};
watch(() => [personal.scopeAndActivity, personal.page, personal.pageSize], async () => {
  await updatePrompt(personal, 'personal');
});

watch(() => [public1.scopeAndActivity, public1.page, public1.pageSize], async () => {
  await updatePrompt(public1, 'public');
});

const refresh = async () => {
  await updatePrompt(personal, 'personal');
  await updatePrompt(public1, 'public');
};
onMounted(async () => {
  personal.promptCascades = await getPromptCascades('personal');
  await updatePrompt(personal, 'personal');
  public1.promptCascades = await getPromptCascades('public');
  await updatePrompt(public1, 'public');
});
</script>

<template>
  <div class="PromptContainer">
    <AddOrEditPrompt
      ref="addOrEditPrompt"
      @change="refresh"
    ></AddOrEditPrompt>
    <el-tabs v-model="activeName">
      <el-tab-pane
        label="Personal"
        name="personal"
      >
        <div class="bar">
          <el-cascader
            v-model="personal.scopeAndActivity"
            placeholder="Personal"
            :options="personal.promptCascades"
            filterable
            clearable
            :props="props"
          />
          <el-button
            :icon="Plus"
            circle
            @click="openAddPerson('personal')"
          />
        </div>
        <div class="table">
          <div
            v-for="p in personal.prompt"
            :key="p.name"
            class="card"
          >
            <div class="content">
              <div class="name">{{ p.name }}</div>
              <div class="placeHolder">{{ p.placeholder }}</div>
              <div class="shortcut">{{ p.shortcut }}</div>
            </div>
            <div class="action">
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                circle
                @click="openEditPerson('personal',p)"
              />
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                circle
                @click="handleDeletePrompt(p.id)"
              />
            </div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane
        label="Public"
        name="public"
      >
        <div class="bar">
          <el-cascader
            v-model="public1.scopeAndActivity"
            placeholder="Public"
            :options="public1.promptCascades"
            filterable
            clearable
            :props="props"
          />
          <el-button
            size="small"
            @click="addPrompts"
          >
            Import
          </el-button>
        </div>
        <div class="table">
          <div
            v-for="p in public1.prompt"
            :key="p.name"
            class="card"
          >
            <div class="content">
              <div class="name">{{ p.name }}</div>
              <div class="placeHolder">{{ p.placeholder }}</div>
              <div class="shortcut">{{ p.shortcut }}</div>
            </div>
            <div class="action">
              <el-button
                type="primary"
                size="small"
                :icon="Edit"
                circle
                @click="openEditPerson('public',p)"
              />
              <el-button
                type="danger"
                size="small"
                :icon="Delete"
                circle
                @click="handleDeletePrompt(p.id)"
              />
            </div>
          </div>
        </div>
        <el-pagination
          v-model:current-page="public1.page"
          v-model:page-size="public1.pageSize"
          :page-sizes="[20, 100, 200]"
          small="small"
          layout="total, sizes, prev, pager, nextr"
          :total="public1.total"
        />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.PromptContainer {
  height: 100%;

  .bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  .table {
    display: flex;
    flex-wrap: wrap;
    overflow: auto;
    height: calc(100vh - 200px);
    align-items: flex-start;
    align-content: flex-start;
    justify-content: flex-start;

    // beautiful scrollbar
    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: #ebeef5;
      border-radius: 4px;
    }


    .card {
      margin: 5px;
      width: 140px;
      height: 200px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      margin-bottom: 10px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      .content {
        overflow: auto;

        .name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }

        .placeHolder {
          font-size: 12px;
          color: #909399;
        }

        .shortcut {
          font-size: 12px;
          color: #909399;
        }
      }

      .action {
        display: flex;
        justify-content: flex-end;

        .el-button {
          padding: 3px 0;
          font-size: 12px;
        }
      }
    }
  }
}
</style>