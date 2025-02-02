<script setup>
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="app-container">
    <Sidebar />
    <main class="main-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<style>
.app-container {
  display: flex;
  min-height: 100vh;
  background-color: var(--el-bg-color);
}

.main-content {
  flex: 1;
  padding: 20px;
}

/* 确保图片预览弹窗始终显示在最顶层 */
.el-image-viewer__wrapper {
  position: fixed !important;
  z-index: 9999 !important;
}
</style>
