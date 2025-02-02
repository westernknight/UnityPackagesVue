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
:deep(.el-image-viewer__wrapper) {
  position: fixed !important;
  z-index: 99999 !important;
}

/* 确保图片预览弹窗挂载到正确的DOM层级 */
:root {
  --el-popup-parent-overflow-hidden: hidden;
}

.el-popup-parent--hidden {
  overflow: var(--el-popup-parent-overflow-hidden);
}

/* 强制预览弹窗挂载到body */
:deep(.el-image-viewer__mask),
:deep(.el-image-viewer__wrapper) {
  position: fixed !important;
  top: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  left: 0 !important;
  overflow: auto !important;
  margin: 0 !important;
  z-index: 2000 !important;
}
</style>
