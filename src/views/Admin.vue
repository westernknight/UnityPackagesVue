<template>
  <div class="admin">
    <h1>UnityPackage管理</h1>

    <!-- 文件上传区域 -->
    <div class="upload-container">
      <div class="upload-box">
        <h3>UnityPackage文件</h3>
        <el-upload class="upload-demo" drag :action="`${apiBaseUrl}/api/upload`" accept=".unitypackage"
          :auto-upload="false" :limit="1" :on-exceed="handleExceed" :on-change="handlePackageChange"
          :before-upload="beforeUpload" ref="packageUploadRef">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或 <em>点击选择</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传.unitypackage文件
            </div>
          </template>
        </el-upload>
      </div>

      <div class="upload-box">
        <h3>预览图</h3>
        <el-upload class="upload-demo" drag :action="`${apiBaseUrl}/api/upload/preview`" accept="image/*"
          :auto-upload="false" :limit="1" :on-exceed="handleExceed" :on-change="handlePreviewChange"
          :before-upload="beforePreviewUpload" ref="previewUploadRef">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽图片到此处或 <em>点击选择</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              请上传预览图
            </div>
          </template>
        </el-upload>
      </div>
    </div>

    <!-- 标签选择区域 -->
    <div class="tags-container">
      <h3>描述</h3>
      <el-input v-model="packageDescription" type="textarea" :rows="3" placeholder="请输入UnityPackage的描述信息" />
      <h3>选择标签（必选）</h3>
      <div class="tags-list">
        <el-checkbox-group v-model="selectedTags">
          <el-checkbox v-for="tag in predefinedTags" :key="tag" :value="tag">{{ tag }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="upload-actions">
      <el-button type="primary" @click="handleUpload">上传文件</el-button>
    </div>

    <!-- 上传进度遮罩层 -->
    <div class="upload-overlay" v-if="isUploading">
      <div class="upload-progress">
        <el-progress type="circle" :percentage="uploadProgress"></el-progress>
        <p>{{ uploadStatus }}</p>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="package-list">
      <el-table :data="packageList" style="width: 100%" :default-sort="{ prop: 'uploadTime', order: 'descending' }">
        <el-table-column prop="preview" label="预览图" width="180">
          <template #default="{ row }">
            <el-image style="width: 100px; height: 100px" :src="`${apiBaseUrl}/${row.preview}`" fit="cover"
              :preview-src-list="[row.preview]">
              <template #error>
                <div class="image-slot">暂无预览图</div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="180" sortable />
        <el-table-column prop="description" label="描述">
          <template #default="{ row }">
            <span v-html="formatDescription(row.description)"></span>
          </template>
        </el-table-column>
        <el-table-column prop="uploadTime" label="上传时间" width="180" sortable />
        <el-table-column prop="size" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.size) }}
          </template>
        </el-table-column>
        <el-table-column prop="tags" label="标签" width="180">
          <template #default="{ row }">
            <el-tag v-for="tag in row.tags" :key="tag" class="mx-1" size="small">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog v-model="dialogVisible" title="编辑包信息" width="50%">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="预览图">
          <el-upload class="avatar-uploader" action="/api/upload/preview" :show-file-list="false" :auto-upload="false"
            accept="image/*" :on-change="handleEditPreviewChange" :before-upload="beforePreviewUpload">
            <img v-if="editForm.preview" :src="`${apiBaseUrl}/${editForm.preview}`" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <plus />
            </el-icon>
            <template #tip>
              <div class="el-upload__tip">点击图片可更换预览图</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="editForm.description" type="textarea" />
        </el-form-item>
        <el-form-item label="标签">
          <el-checkbox-group v-model="editForm.tags">
            <el-checkbox v-for="tag in predefinedTags" :key="tag" :value="tag">
              {{ tag }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// 获取API基础URL
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3000'

import { nextTick, onMounted, onUnmounted, watch } from 'vue'
import { UploadFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 描述输入
const packageDescription = ref('')

// 预设标签
const predefinedTags = ['角色', '模型', '动作', '特效', '场景', '工具', '物理', '文字', '声音', 'POLYGON', 'shader', 'AI', 'UI', 'Template']

// 上传组件引用
const packageUploadRef = ref()
const previewUploadRef = ref()

// 上传文件状态
const packageFile = ref(null)
const previewFile = ref(null)
const selectedTags = ref([])
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('准备上传...')
const canUpload = ref(false)

// 文件列表数据
const packageList = ref([])
const pageSize = 20
const currentPage = ref(1)
const loading = ref(false)
const hasMore = ref(true)

// 获取文件列表
const fetchPackageList = async (page = 1) => {
  try {
    loading.value = true
    const response = await fetch(`${apiBaseUrl}/api/files?page=${page}&pageSize=${pageSize}`)
    const data = await response.json()
    if (page === 1) {
      packageList.value = data.files
    } else {
      packageList.value = [...packageList.value, ...data.files]
    }
    hasMore.value = data.files.length === pageSize
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  } finally {
    loading.value = false
  }
}

// 加载更多数据
const loadMore = async () => {
  if (loading.value || !hasMore.value) return
  currentPage.value++
  await fetchPackageList(currentPage.value)
}

// 滚动监听函数
const handleScroll = () => {
  const table = document.querySelector('.el-table__body-wrapper')
  if (!table) return
  
  const { scrollTop, scrollHeight, clientHeight } = table
  // 当滚动到距离底部100px时触发加载
  if (scrollHeight - scrollTop - clientHeight < 100 && !loading.value && hasMore.value) {
    loadMore()
  }
}

// 在组件挂载时获取文件列表和添加滚动监听
onMounted(() => {
  fetchPackageList(1)
  const table = document.querySelector('.el-table__body-wrapper')
  if (table) {
    table.addEventListener('scroll', handleScroll)
  }
})

// 在组件卸载时移除滚动监听
onUnmounted(() => {
  const table = document.querySelector('.el-table__body-wrapper')
  if (table) {
    table.removeEventListener('scroll', handleScroll)
  }
})

// 计算文件的MD5
const calculateMD5 = async (file) => {
  const buffer = await file.arrayBuffer()
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}



// 在组件挂载时获取文件列表
onMounted(fetchPackageList)

// 编辑表单数据
const dialogVisible = ref(false)
const editForm = ref({
  id: '',
  preview: '',
  name: '',
  description: '',
  tags: []
})

// 上传相关处理函数
const handleExceed = (files) => {

  ElMessage.warning('只能上传1个文件')
}

const handlePackageChange = (file) => {
  if (file && handlePackageDrop(file)) {
    packageFile.value = file
    checkUploadStatus()
  } else {
    packageUploadRef.value.clearFiles();
  }
}

const handlePreviewChange = (file) => {
  if (file && handlePreviewDrop(file)) {
    previewFile.value = file
    checkUploadStatus()
  } else {
    previewUploadRef.value.clearFiles();
  }
}

// 生成时间戳
const generateTimestamp = () => {
  return Date.now()
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

// 处理描述中的链接
const formatDescription = (text) => {
  if (!text) return '暂无描述'
  return text.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
}

const checkUploadStatus = () => {
  canUpload.value = packageFile.value && previewFile.value && selectedTags.value.length > 0
}

// 监听标签选择变化
const watchTagsChange = () => {
  checkUploadStatus()
}

// 添加标签选择监听
watch(selectedTags, watchTagsChange)

const beforeUpload = (file) => {
  const isUnityPackage = file.name.endsWith('.unitypackage') || file.name.endsWith('.zip')
  if (!isUnityPackage) {
    ElMessage.error('只能上传.unitypackage文件')
  }
  return false // 阻止自动上传
}

const beforePreviewUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  return false // 阻止自动上传
}

// 处理UnityPackage文件拖拽
const handlePackageDrop = (file) => {
  if (!(file.name.endsWith('.unitypackage') || file.name.endsWith('.zip'))) {
    ElMessage.error('只能上传.unitypackage文件')
    return false
  }
  return true
}

// 处理预览图拖拽
const handlePreviewDrop = (file) => {
  if (!file.raw.type.startsWith('image/')) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  return true
}

const handleUpload = async () => {
  if (!packageFile.value || !previewFile.value) {
    ElMessage.warning('请同时上传UnityPackage文件和预览图')
    return
  }

  if (selectedTags.value.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }

  isUploading.value = true
  uploadProgress.value = 0
  uploadStatus.value = '计算文件特征...'

  try {
    // 计算并检查MD5
    const md5 = await calculateMD5(packageFile.value.raw)
    const checkResponse = await fetch(`${apiBaseUrl}/api/files/check-md5/${md5}`)
    const checkData = await checkResponse.json()

    if (!checkResponse.ok) {
      ElMessage.error(checkData.error || 'MD5检查失败')
      return
    }

    if (checkData.exists) {
      const existingFile = checkData.file;
      ElMessage({
        dangerouslyUseHTMLString: true,
        type: 'error',
        message: `该文件已存在：<br>
          文件名：${existingFile.name}<br>
          上传时间：${new Date(existingFile.uploadTime).toLocaleString()}<br>
          描述：${existingFile.description || '无'}<br>
          标签：${existingFile.tags.join(', ')}`
      });
      // 重置上传状态
      isUploading.value = false;
      uploadProgress.value = 0;
      uploadStatus.value = '准备上传...';
      // 清空上传框
      packageFile.value = null;
      previewFile.value = null;
      packageUploadRef.value.clearFiles();
      previewUploadRef.value.clearFiles();
      return;
    }

    // 使用XMLHttpRequest上传UnityPackage文件
    const packageFormData = new FormData()
    packageFormData.append('file', packageFile.value.raw)
    packageFormData.append('tags', JSON.stringify(selectedTags.value))
    packageFormData.append('description', packageDescription.value)
    packageFormData.append('name', packageFile.value.name)
    packageFormData.append('md5', md5)
    packageFormData.append('size', packageFile.value.raw.size) // 添加文件大小信息

    uploadStatus.value = '上传UnityPackage文件...'
    const fileId = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', `${apiBaseUrl}/api/upload`, true)

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          uploadProgress.value = Math.round((event.loaded / event.total) * 100)
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          resolve(response.file.id)
        } else {
          reject(new Error('文件上传失败'))
        }
      }

      xhr.onerror = () => reject(new Error('文件上传失败'))
      xhr.send(packageFormData)
    })

    // 上传预览图
    uploadStatus.value = '上传预览图...'
    const previewFormData = new FormData()
    previewFormData.append('file', previewFile.value.raw)
    previewFormData.append('fileId', fileId)

    const previewResponse = await fetch(`${apiBaseUrl}/api/upload/preview`, {
      method: 'POST',
      body: previewFormData
    })
    const previewData = await previewResponse.json()

    if (!previewResponse.ok) {
      throw new Error('预览图上传失败')
    }

    // 更新包信息
    const updateResponse = await fetch(`${apiBaseUrl}/api/files/${fileId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        preview: previewData.url.replace(/\\/g, '/'),
        name: packageFile.value.name,
        description: packageDescription.value,
        tags: selectedTags.value
      })
    })

    if (!updateResponse.ok) {
      throw new Error('更新文件信息失败')
    }

    ElMessage.success('上传成功')
    fetchPackageList()

    // 清空上传状态
    packageFile.value = null
    previewFile.value = null
    selectedTags.value = []
    packageDescription.value = ''
    packageUploadRef.value.clearFiles()
    previewUploadRef.value.clearFiles()
    isUploading.value = false
    uploadProgress.value = 100
    uploadStatus.value = '上传完成'
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
    isUploading.value = false
  }
}

// 预览图上传相关
const handlePreviewSuccess = (response) => {
  if (response && response.url) {
    editForm.value.preview = response.url
    ElMessage.success('预览图上传成功')
  } else {
    ElMessage.error('预览图上传失败：未获取到图片URL')
  }
}

// 编辑相关处理函数
const handleEdit = (row) => {
  editForm.value = {
    id: row.id,
    preview: row.preview,
    name: row.name,
    description: row.description,
    tags: row.tags // 直接使用数组
  }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  ElMessageBox.confirm('确定要删除这个文件吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/api/files/${row.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('删除失败');
        }
        ElMessage.success('删除成功');
        fetchPackageList(); // 刷新列表
      } catch (error) {
        ElMessage.error('删除失败：' + error.message);
      }
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
}

// 编辑对话框中的预览图处理
const handleEditPreviewChange = (file) => {
  if (file) {
    // 使用FileReader创建本地预览
    const reader = new FileReader()
    reader.onload = (e) => {
      editForm.value.preview = e.target.result
    }
    reader.readAsDataURL(file.raw)
    // 保存文件对象以供后续上传
    editForm.value.newPreviewFile = file.raw
  }
}

// 修改handleSave函数
const handleSave = async () => {
  if (editForm.value.tags.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }

  try {
    // 如果有新的预览图，先上传
    if (editForm.value.newPreviewFile) {
      const previewFormData = new FormData()
      previewFormData.append('file', editForm.value.newPreviewFile)
      const previewResponse = await fetch(`${apiBaseUrl}/api/upload/preview`, {
        method: 'POST',
        body: previewFormData
      })
      const previewData = await previewResponse.json()

      if (!previewResponse.ok) {
        throw new Error('预览图上传失败')
      }
      editForm.value.preview = previewData.url.replace(/\\/g, '/')
    }

    const response = await fetch(`${apiBaseUrl}/api/files/${editForm.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: editForm.value.id,
        preview: editForm.value.preview,
        name: editForm.value.name,
        description: editForm.value.description,
        tags: editForm.value.tags
      }),
    })

    if (!response.ok) {
      throw new Error('保存失败')
    }
    ElMessage.success('保存成功')
    fetchPackageList() // 刷新列表
    dialogVisible.value = false
  } catch (error) {
    ElMessage.error('保存失败：' + error.message)
  }
}
</script>

<style scoped>
.admin {
  padding: 20px;
  height: 100%;
  background-color: var(--el-bg-color);
}

.upload-container {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.upload-box {
  flex: 1;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.upload-box h3 {
  margin-top: 0;
  margin-bottom: 16px;
  text-align: center;
  color: var(--el-text-color-primary);
}

.tags-container {
  margin-bottom: 20px;
  padding: 20px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.tags-container h3 {
  margin-top: 0;
  margin-bottom: 16px;
  text-align: center;
  color: var(--el-text-color-primary);
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.upload-actions {
  text-align: center;
  margin-bottom: 20px;
}

.package-list {
  margin-top: 20px;
}

.upload-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.upload-progress {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  text-align: center;
}

.upload-progress p {
  margin-top: 15px;
  color: var(--el-text-color-primary);
}

.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.image-slot {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  color: #909399;
}

.button-new-tag {
  margin-left: 10px;
  height: 32px;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
