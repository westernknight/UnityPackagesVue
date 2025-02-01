<template>
  <div class="home argon-theme">
    <!-- 顶部导航和搜索区域 -->
    <div class="top-bar">
      <!-- 分类导航 -->
      <div class="category-nav">
        <el-tag
          :class="{ active: selectedTag === '' }"
          @click="selectTag('')"
          class="argon-tag"
        >
          全部
        </el-tag>
        <span class="divider" v-if="uniqueTags.length > 0">/</span>
        <template v-for="(tag, index) in uniqueTags" :key="tag">
          <el-tag
            :class="{ active: selectedTag === tag }"
            @click="selectTag(tag)"
            class="argon-tag"
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
          class="argon-input"
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
          class="resource-card argon-card"
          @click="showDetails(item)"
        >
          <div class="resource-preview">
            <el-image
              :src="item.preview"
              fit="cover"
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
                class="mx-1 argon-tag-small"
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
      class="resource-dialog argon-dialog"
    >
      <div class="resource-details" v-if="selectedResource">
        <div class="preview-section">
          <el-image
            :src="selectedResource.preview"
            fit="contain"
            :preview-src-list="[selectedResource.preview]"
            class="detail-preview"
          >
            <template #error>
              <div class="image-slot">暂无预览图</div>
            </template>
          </el-image>
        </div>
        <div class="info-section">
          <h3>描述</h3>
          <p class="description">{{ selectedResource.description || '暂无描述' }}</p>
          <h3>标签</h3>
          <div class="tags-container">
            <el-tag
              v-for="tag in selectedResource.tags"
              :key="tag"
              class="mx-1 argon-tag-small"
              size="small"
            >
              {{ tag }}
            </el-tag>
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="argon-button">关闭</el-button>
          <el-button type="primary" @click="downloadPackage(selectedResource)" class="argon-button-primary">下载</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

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
  return resources.value.filter(resource => {
    const matchesSearch = !searchQuery.value || (resource.name && resource.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
    const matchesTag = !selectedTag.value || (resource.tags && resource.tags.includes(selectedTag.value))
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

// 显示资源详情
const showDetails = (item) => {
  selectedResource.value = item
  dialogVisible.value = true
}

// 下载资源包
const downloadPackage = (item) => {
  if (!item) return
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
</script>

<style scoped>
.argon-theme {
  background: linear-gradient(150deg, #7795f8 15%, #6772e5 70%, #555abf 94%);
  min-height: 100vh;
  padding: 20px;
}

.top-bar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.search-container {
  width: 300px;
}

.argon-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(50, 50, 93, 0.15), 0 1px 0 rgba(0, 0, 0, 0.02);
}

.category-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.argon-tag {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 1px 3px rgba(50, 50, 93, 0.15);
}

.argon-tag.active {
  background: #5e72e4;
  color: white;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.argon-tag-small {
  background: rgba(94, 114, 228, 0.1);
  color: #5e72e4;
  border: none;
  border-radius: 6px;
}

.category-nav .divider {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.main-content {
  width: 100%;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.argon-card {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.argon-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.resource-preview {
  height: 200px;
  overflow: hidden;
  border-radius: 10px;
}

.resource-preview .el-image {
  width: 100%;
  height: 100%;
}

.resource-info {
  padding: 16px;
}

.resource-info h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #32325d;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.argon-dialog {
  border-radius: 15px;
}

.resource-dialog :deep(.el-dialog) {
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
}

.resource-dialog .resource-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resource-dialog .preview-section {
  width: 100%;
  max-height: 300px;
  overflow: hidden;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.resource-dialog .detail-preview {
  width: 100%;
  height: 300px;
  object-fit: contain;
}

.resource-dialog .info-section h3 {
  margin: 0 0 12px 0;
  font-size: 16px;
  color: #32325d;
}

.resource-dialog .description {
  margin: 0 0 20px 0;
  color: #525f7f;
  line-height: 1.6;
}

.resource-dialog .tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: rgba(94, 114, 228, 0.05);
  color: #8898aa;
}

.argon-button {
  border-radius: 8px;
  border: none;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.argon-button-primary {
  background: #5e72e4;
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.argon-button-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}
</style>