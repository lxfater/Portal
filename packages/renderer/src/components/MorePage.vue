<script lang="ts" setup>
import { getAppVersion, openWebsite } from '#preload';
import { onMounted, ref } from 'vue';
const version = ref('未知');

onMounted(() => {
  getAppVersion().then((v) => {
    version.value = v;
  });
});
</script>

<template>
  <div class="moreContainer">
    <div class="item">
      <span class="label">Version: </span>
      <span class="content">{{ version }}</span>
    </div>
    <div class="item">
      <span class="label">Disclaimer: </span>
      <div class="content danger">This software is experimental and is only intended for technical sharing. It cannot be used for actual production. Users should bear the risks of use themselves. This software has the final interpretation right of this disclaimer. If you have any questions, you can ask them in the open source project.</div>
    </div>
    <div class="item">
      <span class="label">github: </span>
      <div
        class="content"
        style="cursor: pointer; color:blue;"
        @click="openWebsite('https://github.com/lxfater')"
      >
        visit
      </div>
    </div>
    <div class="item">
      <span class="label">Twitter: </span>
      <div
        class="content"
        style="cursor: pointer; color:blue;"
        @click="openWebsite('https://twitter.com/lxfater')"
      >
        visit
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.moreContainer {
  box-sizing: border-box;
  padding: 5px;
  min-height: 700px;
  .item {
    display: flex;
    padding: 5px;
    .label {
      width: 100px;
    }
    .content {
      flex: 1;
    }
    .danger {
      color: red;
      font-size: 14px;
    }
  }

}
</style>