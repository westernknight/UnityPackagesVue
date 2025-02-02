<template>
  <div class="sidebar">
    <nav>
      <router-link to="/" class="nav-item" active-class="active">首页</router-link>
      <router-link to="/admin" class="nav-item" active-class="active">管理</router-link>
    </nav>
  </div>
</template>

<script setup>
</script>

<style scoped>
.sidebar {
  width: 200px;
  height: 100vh;
  background-color: #f5f5f5;
  position: fixed;
  left: 0;
  top: 0;
  padding: 20px 0;
}

.nav-item {
  display: block;
  padding: 10px 20px;
  color: var(--el-text-color-regular);
  text-decoration: none;
  transition: all 0.3s;
  border-radius: 4px;
  margin: 0 10px;
}

.nav-item:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.nav-item.active {
  background-color: var(--el-color-primary);
  color: white;
}
</style>