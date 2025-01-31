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
  color: #333;
  text-decoration: none;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: #e0e0e0;
}

.nav-item.active {
  background-color: #42b883;
  color: white;
}
</style>