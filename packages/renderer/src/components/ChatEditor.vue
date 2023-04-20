<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue';
import markdown from 'markdown-it';
import attrs from 'markdown-it-attrs';
import hljs from 'highlight.js';
import { debounce } from 'lodash';
import { useStore } from '../state';
import type { Answer } from '../../../types';
const answer = ref<HTMLElement>('');
import ContextMenu from '@imengyu/vue3-context-menu';
const store = useStore();
const md = markdown({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {
        console.error(__);
      }
    }

    return ''; // 使用内置的转义功能
  },
});
md.use(attrs);
const addButtonDebounce = debounce(() => {
  try {
    const answerEl = answer.value;
    const codeBlocks = answerEl!.querySelectorAll('pre code');
    console.log(codeBlocks);
    codeBlocks.forEach(block => {
      const button = document.createElement('button');
      button.classList.add('copy-code-button');
      button.textContent = '复制代码';
      button.addEventListener('click', () => {
        navigator.clipboard.writeText(block.textContent);
        button.textContent = '已复制';
        setTimeout(() => {
          button.textContent = '复制代码';
        }, 1000);
      });
      block.parentNode.insertBefore(button, block);
    });
  } catch (error) {
    console.error(error);
  }

}, 500);

watch(() => store.chat.history, (newVal) => {
  // vue nextTick
  nextTick(() => {
    addButtonDebounce();
  });
}, {
  deep: true,
});
// 定义 props
const props = defineProps<{
  item: Answer;
}>();

const isHighlight = computed(() => {
  return (store.chat && store.chat.parentHistory&& store.chat.parentHistory.time === props.item.time); 
});

const onContextMenu = (e : MouseEvent) => {
  //prevent the browser's default menu
  e.preventDefault();
  //这个函数与 this.$contextmenu 一致
  ContextMenu.showContextMenu({
    theme: 'flat',
    x: e.x,
    y: e.y,
    items: [
      { 
        label: 'Make Connection', 
        onClick: () => {
          store.chat.parentHistory = props.item;
          store.question = window.getSelection()!.toString();
        },
      },
    ],
  }); 
};
</script>

<template>
  <div
    class="editorContainer"
    :style="isHighlight ? 'background-color: yellow': ''"
    @contextmenu="onContextMenu"
  >
    <div
      ref="answer"
      
      v-html="md.render(props.item.answer)"
    ></div>
  </div>
</template>

<style lang="scss">
.editorContainer {}
</style>