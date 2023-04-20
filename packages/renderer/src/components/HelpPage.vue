<script lang="ts" setup>
</script>

<template>
  <div class="helpContainer">
    <h4>Quick command feature</h4>
    <p>Step 1: You need to create a prompt template in the settings/prompt library and set a shortcut phrase.</p>
    <p>Step 2: You need to create a shortcut invocation method in the settings/input method and set a shortcut key and prompt for the quick command.</p>
    <p>Step 3: Now you can select any text, press the shortcut key, the text will be sent to the cloud, processed, and then written back to the cursor position or copied to the clipboard according to your configuration.</p>
    <h4>Dialogue graph</h4>
    <p>Step 1: Choose your favorite prompt, click chat, and start chatting.</p>
    <p>Step 2: Highlight the text or create a link directly by right-clicking to generate a dialogue graph.</p>
    <p>Step 3: View the dialogue graph, click on the node to jump to the corresponding conversation.</p>
    <h4>chatgptWeb support</h4>
    <p>Step 1: Switch to the chatgptweb mode and read the instructions for use.</p>
    <p>Step 2: A new button will appear to the right of the settings gear icon. Click Login to use the chatgpt access method.</p>
    <p>Step 3: If you encounter login problems, click Clear cache to resolve the issue.</p>
    <h4>Mac shortcut key permission settings</h4>
    <p>Accessibility permissions: Security & Privacy - Accessibility, unlock, add this software Portal, if it already exists in the list, remove it first and then add it again.</p>
    <p>Screen recording permissions: Screen recording permissions are only used to assist in determining whether the current window is being written at the cursor position. If you are concerned about permissions, you can choose not to enable it. The method for enabling it is the same as above.</p>
    <p>Others: If you still can't resolve the issue, there is contact information in the About menu.</p>
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