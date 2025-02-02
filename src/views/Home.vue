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
          @click="showDetails(item)"
        >
          <div class="resource-preview">
            <el-image
              :src="`${apiBaseUrl}/${item.preview}`"
              fit="contain"
            >
              <template #error>
                <div class="image-slot">暂无预览图</div>
              </template>
            </el-image>
            <el-rate
              v-if="item.stars > 0"
              v-model="item.stars"
              disabled
              style="position: absolute; top: 5px; right: 5px; background-color: rgba(255, 255, 255, 0.8); border-radius: 4px; padding: 2px;"
            />
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

    <!-- 资源详情对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="selectedResource?.name"
      width="50%"
      class="resource-dialog"
    >
      <div class="resource-details" v-if="selectedResource">
        <div class="preview-section">
          <el-image
            :src="`${apiBaseUrl}/${selectedResource.preview}`"
            fit="contain"
            :preview-src-list="[`${apiBaseUrl}/${selectedResource.preview}`]"
            class="detail-preview"
          >
            <template #error>
              <div class="image-slot">暂无预览图</div>
            </template>
          </el-image>
        </div>
        <div class="info-section">
          <el-rate
            v-if="selectedResource.stars > 0"
            v-model="selectedResource.stars"
            disabled
            style="position: absolute; top: 5px; right: 5px; background-color: rgba(255, 255, 255, 0.8); border-radius: 4px; padding: 2px;"
          />
          <h3>描述</h3>
          <p class="description" v-html="formatDescription(selectedResource.description)"></p>
          <h3>标签</h3>
          <div class="tags-container">
            <el-tag
              v-for="tag in selectedResource.tags"
              :key="tag"
              class="mx-1"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <el-button type="danger" @click="handleDelete(selectedResource)">删除</el-button>
          <span>
            <el-button @click="dialogVisible = false">关闭</el-button>
            <el-button type="primary" @click="downloadPackage(selectedResource)">下载 ({{ formatFileSize(selectedResource.size) }})</el-button>
          </span>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 获取API基础URL
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000'

// 状态
const resources = ref([])
const searchQuery = ref('')
const selectedTag = ref('')
const dialogVisible = ref(false)
const selectedResource = ref(null)

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
  return resources.value
    .filter(resource => {
      const matchesTag = !selectedTag.value || (resource.tags && resource.tags.includes(selectedTag.value))
      return matchesTag
    })
    .sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime))
})

// 处理搜索
const handleSearch = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/files?search=${encodeURIComponent(searchQuery.value)}`)
    if (!response.ok) {
      throw new Error('获取资源列表失败')
    }
    resources.value = await response.json()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 处理标签选择
const selectTag = (tag) => {
  selectedTag.value = tag
}


// 处理描述中的链接
const formatDescription = (text) => {
  if (!text) return '暂无描述'
  return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
}

// 显示资源详情
const showDetails = (item) => {
  selectedResource.value = item
  dialogVisible.value = true
}

// 下载资源包
const downloadPackage = (item) => {
  if (!item) return
  const link = document.createElement('a')
  link.href = `${apiBaseUrl}/uploads/${item.filename}`
  link.download = item.originalName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// 获取资源列表
const fetchResources = async () => {
  try {
    const response = await fetch(`${apiBaseUrl}/api/files`)
    if (!response.ok) {
      throw new Error('获取资源列表失败')
    }
    resources.value = await response.json()
  } catch (error) {
    ElMessage.error(error.message)
  }
}

// 确保在组件实例创建时注册生命周期钩子
let mounted = false
onMounted(() => {
  mounted = true
  fetchResources()
})

// 确保组件卸载时不会继续更新状态
const updateResources = (data) => {
  if (mounted) {
    resources.value = data
  }
}
// 处理删除资源
const handleDelete = async (item) => {
  if (!item) return
  try {
    await ElMessageBox.confirm('确定要删除这个资源吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const response = await fetch(`${apiBaseUrl}/api/files/${item.id}`, {
      method: 'DELETE'
    })
    if (!response.ok) {
      throw new Error('删除资源失败')
    }
    ElMessage.success('删除成功')
    dialogVisible.value = false
    fetchResources()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
  height: 100%;
  background-color: var(--el-bg-color);
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
  margin-left: 0;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(4, 280px);
  gap: 20px;
  padding: 20px 0;
  justify-content: start;
}

.resource-card {
  cursor: pointer;
  transition: transform 0.2s;
  width: 280px;
  height: 360px;
}

.resource-card:hover {
  transform: translateY(-5px);
}

.resource-preview {
  height: 240px;
  position: relative;
}

.resource-preview .el-image {
  width: 100%;
  height: 100%;
}

.resource-info {
  padding: 12px;
}

.resource-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 详情对话框样式 */
.resource-dialog .resource-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resource-dialog .preview-section {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 4px;
}

.resource-dialog .detail-preview {
  width: 100%;
  height: 300px;
  object-fit: contain;
}

.resource-dialog .info-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.resource-dialog .description {
  margin: 0 0 20px 0;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  .description a {
    color: var(--el-color-primary);
    text-decoration: none;
  }
  
  .description a:hover {
    text-decoration: underline;
  }
}

.resource-dialog .tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
}
</style>