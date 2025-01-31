<template>
  <div class="home">
    <!-- 顶部导航和搜索区域 -->
    <div class="top-bar">
      <!-- 分类导航 -->
      <div class="category-nav">
        <el-tag
          :class="{ active: selectedTag === '' }"
          @click="selectTag('')"
        >
          全部
        </el-tag>
        <span class="divider" v-if="uniqueTags.length > 0">/</span>
        <template v-for="(tag, index) in uniqueTags" :key="tag">
          <el-tag
            :class="{ active: selectedTag === tag }"
            @click="selectTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <span class="divider" v-if="index < uniqueTags.length - 1">/</span>
        </template>
      </div>

      <!-- 搜索区域 -->
      <div class="search-container">
        <el-input
          v-model="searchQuery"
          placeholder="搜索资源..."
          prefix-icon="Search"
          clearable
          @input="handleSearch"
        />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 资源展示区域 -->
      <div class="resources-grid">
        <el-card
          v-for="item in filteredResources"
          :key="item.id"
          class="resource-card"
          @click="downloadPackage(item)"
        >
          <div class="resource-preview">
            <el-image
              :src="item.preview"
              fit="cover"
              :preview-src-list="[item.preview]"
            >
              <template #error>
                <div class="image-slot">暂无预览图</div>
              </template>
            </el-image>
          </div>
          <div class="resource-info">
            <h4>{{ item.name }}</h4>
            <div class="resource-tags">
              <el-tag
                v-for="tag in item.tags"
                :key="tag"
                size="small"
                class="mx-1"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 状态
const resources = ref([])
const searchQuery = ref('')
const selectedTag = ref('')

// 获取所有唯一的标签
const uniqueTags = computed(() => {
  const tags = new Set()
  resources.value.forEach(resource => {
    if (Array.isArray(resource.tags)) {
      resource.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags)
})

// 根据搜索和标签筛选资源
const filteredResources = computed(() => {
  return resources.value.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesTag = !selectedTag.value || resource.tags.includes(selectedTag.value)
    return matchesSearch && matchesTag
  })
})

// 处理标签选择
const selectTag = (tag) => {
  selectedTag.value = tag
}

// 处理搜索
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 下载资源包
const downloadPackage = (item) => {
  const link = document.createElement('a')
  link.href = `/uploads/${item.filename}`
  link.download = item.originalName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 获取资源列表
const fetchResources = async () => {
  try {
    const response = await fetch('/api/files')
    if (!response.ok) {
      throw new Error('获取资源列表失败')
    }
    resources.value = await response.json()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 页面加载时获取资源列表
onMounted(() => {
  fetchResources()
})
</script>

<style scoped>
.home {
  padding: 20px;
  height: 100%;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-container {
  width: 300px;
}

.category-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.category-nav .el-tag {
  cursor: pointer;
}

.category-nav .el-tag.active {
  background-color: #409EFF;
  color: white;
  border-color: #409EFF;
}

.category-nav .divider {
  color: #909399;
  font-size: 14px;
}

.main-content {
  width: 100%;
}

.resources-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.resource-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-preview {
  height: 200px;
  overflow: hidden;
}

.resource-preview .el-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  background-color: #f5f7fa;
}

.resource-info {
  padding: 10px;
}

.resource-info h4 {
  margin: 0 0 10px 0;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}
</style>