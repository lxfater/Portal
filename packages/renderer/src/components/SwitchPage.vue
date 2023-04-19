<script lang="ts" setup>
import AddOrEditSwitch from './AddOrEditSwitch.vue';
import {
  Edit,
  Delete,
  Plus,
} from '@element-plus/icons-vue';
import { ref} from 'vue';
import { useStore } from '../state';
import type { Pipeline } from '../../../types';
const addOrEditSwitch = ref<InstanceType<typeof AddOrEditSwitch>>();
const store = useStore();
const openEditPipeline = (p:Pipeline) => {
  if(addOrEditSwitch.value)
  addOrEditSwitch.value.open(p);
};
const openAddPipeline = () => {
  if(addOrEditSwitch.value)
  addOrEditSwitch.value.open();
};
const deletePrompt = (p: Pipeline) => {
  store.deletePipeline(p);
};
</script>

<template>
  <AddOrEditSwitch
    ref="addOrEditSwitch"
  ></AddOrEditSwitch>
  <div class="bar">
    <div>Shortcut Key Configuration:{{ `${store.settings.currentOs === 'darwin'? 'It needs to be configured before it can be used. Please check the help menu for tutorials.': ''}` }}</div>
    <el-button
      :icon="Plus"
      circle
      @click="openAddPipeline"
    />
  </div>
  <div
    v-if="store.settings.currentOs === 'darwin'"
    class="setting"
  >
    <el-form-item label="The cursor write-back function requires screen recording permission to determine when the interface loses focus.">
      <el-switch
        v-model="store.settings.system.darwin.allowWriteBack"
        size="small"
        active-text="Open"
        inactive-text="Close"
      />
    </el-form-item>
    <div></div>
  </div>
  <div class="table">
    <div
      v-for="p in Object.values(store.settings.pipelines)"
      :key="p.name"
      class="card"
    >
      <div class="content">
        <div class="name">{{ p.name }}</div>
      </div>
      <div class="action">
        <el-button
          type="primary"
          size="small"
          :icon="Edit"
          circle
          @click="openEditPipeline(p)"
        />
        <el-button
          type="danger"
          size="small"
          :icon="Delete"
          circle
          @click="deletePrompt(p)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}
.table {
  display: flex;
  flex-wrap: wrap;

  .card {
    margin: 5px;
    width: 140px;
    height: 100px;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    margin-bottom: 50px;
    padding: 10px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .content {
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
</style>