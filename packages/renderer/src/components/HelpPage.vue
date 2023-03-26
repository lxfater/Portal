<script lang="ts" setup>
</script>

<template>
  <div class="helpContainer">
    <h4>快捷指令功能</h4>
    <p> 第一：你需要在设置/提示语库创建一个提示语模板，并且设置上快捷短语。</p>
    <p> 第二：你需要在设置/输入方式创建一个快捷调用方式，并且设置上快捷键和快捷指令提示语。</p>
    <p> 第三：现在你可以选择任何文字，然后按下快捷键，文字将会发送到云端，处理后，根据你的配置写回光标处或者是复制到粘贴板。</p>
    <h4>对话图谱</h4>
    <p> 第一：选择你喜欢的提示语，点击聊天，然后开始聊天。</p>
    <p> 第二：高亮文字，或者直接右键创建链接，即可生成对话图谱。</p>
    <p> 第三：查看对话图谱，点击节点可以跳到相应对话。</p>
    <h4>chatgptWeb支持</h4>
    <p> 第一：切换到chatgptweb方式，阅读使用须知</p>
    <p> 第二：在设置小齿轮右边会出现一个新按钮，点击登录，即可使用chatgpt接入方式。</p>
    <p> 第三：假如遇到登录问题，可以点击清理缓存解决。</p>
    <h4>mac快捷按键权限配置</h4>
    <p> 辅助功能权限：安全性与隐私-辅助功能,解锁,将本软件Portal添加,假如存在于列表内,需要先移除再添加</p>
    <p> 屏幕录制权限：屏幕录制权限仅仅用于在光标处写入功能辅助判断当前窗口是否写入,介意权限问题可以不开启，开启方式同上。</p>
    <p> 其他：假如还解决不了,关于-菜单有联系方式。</p>
  </div>
</template>

<style lang="scss">
.helpContainer {
  height: calc(100vh - 60px);
  overflow: auto;

  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
}
</style>