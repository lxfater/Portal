<script lang="ts" setup>
import {
  Document,
  Connection,
  EditPen,
  Switch, 
  Help,
  More,
} from '@element-plus/icons-vue';

</script>
<template>
  <el-menu
    default-active="/"
    :collapse="true"
    :router="true"
    class="menu"
  >
    <el-menu-item index="/management/">
      <el-icon><Connection /></el-icon>
      <template #title>connection</template>
    </el-menu-item>
    <el-menu-item index="/management/switch">
      <el-icon><Switch /></el-icon>
      <template #title>input</template>
    </el-menu-item>
    <el-menu-item index="/management/prompt">
      <el-icon><EditPen /></el-icon>
      <template #title>prompt</template>
    </el-menu-item>
    <!-- <el-menu-item index="/management/database">
      <el-icon>
        <Document />
      </el-icon>
      <template #title>聊天数据</template>
    </el-menu-item> -->
    <el-menu-item index="/management/help">
      <el-icon><Help /></el-icon>
      <template #title>help</template>
    </el-menu-item>
    <el-menu-item index="/management/more">
      <el-icon><More /></el-icon>
      <template #title>more</template>
    </el-menu-item>
  </el-menu>
</template>
  
 
  
<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}
</style>
  