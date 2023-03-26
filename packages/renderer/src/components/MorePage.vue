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
      <span class="label">应用版本: </span>
      <span class="content">{{ version }}</span>
    </div>
    <div class="item">
      <span class="label">免责声明: </span>
      <div class="content danger">本软件为实验性质，仅作技术分享，不能用于实际生产。使用者应自行承担使用风险。本软件对本免责声明拥有最终解释权，如有任何疑问，可以到开源项目下进行询问。</div>
    </div>
    <div class="item">
      <span class="label">关于作者: </span>
      <div class="content">一个练习时长一年半的前端工程师, 单身人士，乐于分享技术，点击下面联系我</div>
    </div>
    <div class="item">
      <span class="label">github: </span>
      <div
        class="content"
        style="cursor: pointer; color:blue;"
        @click="openWebsite('https://github.com/lxfater')"
      >
        点击打开
      </div>
    </div>
    <div class="item">
      <span class="label">推特: </span>
      <div
        class="content"
        style="cursor: pointer; color:blue;"
        @click="openWebsite('https://twitter.com/lxfater')"
      >
        点击打开
      </div>
    </div>
    <div class="item">
      <span
        class="label"
      >掘金: </span>
      <div
        class="content"
        style="cursor: pointer; color:blue;"
        @click="openWebsite('https://juejin.cn/user/3034307822099031')"
      >
        点击打开
      </div>
    </div>
    <div class="item">
      <span class="label">B站: </span>
      <div
        class="content"
        style="cursor: pointer; color:blue;"
        @click="openWebsite('https://space.bilibili.com/1698450')"
      >
        点击打开
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