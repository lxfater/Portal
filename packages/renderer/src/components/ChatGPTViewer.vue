<script lang="ts" setup>
import { useStore } from '../state';
import {  ref } from 'vue';
const store = useStore();
const preloadMap = {
    'darwin': 'file:/Users/admin/teleport/teleport/packages/chat/dist/index.cjs',
    'win32': 'file://D:\\projects\\project\\teleport\\packages\\chat\\dist\\index.cjs',
    'other': 'file:/Users/admin/teleport/teleport/packages/chat/dist/index.cjs',
};
const preload = import.meta.env.PROD ? '../../chat/dist/index.cjs' : preloadMap[store.settings.currentOs || 'win32'];
console.log(store.settings.currentOs,preload);
</script>

<template>
  <div class="chatGptContainer">
    <webview
      id="webview"
      style="display: flex;border: none; width: 100%; height: 700px"
      :src="store.settings.connector.chatgptWeb.loginUrl"
      webpreferences="contextIsolation=no"
      :preload="preload"
    >
    </webview>
  </div>
</template>

<style lang="scss">
.chatGptContainer {
  box-sizing: border-box;
  padding: 5px;
  min-height: 700px;
}
</style>