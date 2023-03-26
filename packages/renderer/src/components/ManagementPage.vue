<script lang="ts" setup>
import Menu from './MenuBar.vue';
</script>

<template>
  <div class="container">
    <div class="menu">
      <Menu />
    </div>
    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<style lang="scss" scoped>

.container {
  display: flex;
  flex-direction: row;
  width: 100%;
  .menu {
    flex-grow: 0;
    width: 50px;
    background-color: #fff;
  }
  .content {
    flex-grow: 1;
    padding-left: 10px;
    padding-right: 10px;
    background-color: #fff;
  }
}
</style>
  
 
  
<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}
</style>
