<template>
  <div class="admin">
    <h1>UnityPackage管理</h1>
    
    <!-- 文件上传区域 -->
    <div class="upload-container">
      <div class="upload-box">
        <h3>UnityPackage文件</h3>
        <el-upload
          class="upload-demo"
          drag
          action="/api/upload"
          accept=".unitypackage"
          :auto-upload="false"
          :on-change="handlePackageChange"
          :before-upload="beforeUpload"
          ref="packageUploadRef">
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
        <el-upload
          class="upload-demo"
          drag
          action="/api/upload/preview"
          accept="image/*"
          :auto-upload="false"
          :on-change="handlePreviewChange"
          :before-upload="beforePreviewUpload"
          ref="previewUploadRef">
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
      <h3>选择标签（必选）</h3>
      <div class="tags-list">
        <el-checkbox-group v-model="selectedTags">
          <el-checkbox v-for="tag in predefinedTags" :key="tag" :label="tag">{{ tag }}</el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="upload-actions">
      <el-button type="primary" :disabled="!canUpload" @click="handleUpload">上传文件</el-button>
    </div>

    <!-- 文件列表 -->
    <div class="package-list">
      <el-table :data="packageList" style="width: 100%">
        <el-table-column prop="preview" label="预览图" width="180">
          <template #default="{row}">
            <el-image 
              style="width: 100px; height: 100px"
              :src="row.preview"
              fit="cover"
              :preview-src-list="[row.preview]">
              <template #error>
                <div class="image-slot">暂无预览图</div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" width="180" sortable />
        <el-table-column prop="description" label="描述" />
        <el-table-column prop="uploadTime" label="上传时间" width="180" sortable />
        <el-table-column prop="tags" label="标签" width="180">
          <template #default="{row}">
            <el-tag
              v-for="tag in row.tags"
              :key="tag"
              class="mx-1"
              size="small">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{row}">
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
          <el-upload
            class="avatar-uploader"
            action="/api/upload/preview"
            :show-file-list="false"
            :on-success="handlePreviewSuccess"
            :before-upload="beforePreviewUpload">
            <img v-if="editForm.preview" :src="editForm.preview" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><plus /></el-icon>
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
            <el-checkbox 
              v-for="tag in predefinedTags" 
              :key="tag" 
              :label="tag"
              :value="editForm.tags.includes(tag)"
            >
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
import { ref, nextTick, onMounted, watch } from 'vue'
import { UploadFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 预设标签
const predefinedTags = ['模型', '动作', '特效', '场景', '工具', 'shader', 'UI', 'Template']

// 上传组件引用
const packageUploadRef = ref()
const previewUploadRef = ref()

// 上传文件状态
const packageFile = ref(null)
const previewFile = ref(null)
const selectedTags = ref([])
const canUpload = ref(false)

// 文件列表数据
const packageList = ref([])

// 获取文件列表
const fetchPackageList = async () => {
  try {
    const response = await fetch('/api/files')
    const data = await response.json()
    packageList.value = data
  } catch (error) {
    ElMessage.error('获取文件列表失败')
  }
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
const handlePackageChange = (file) => {
  if (file) {
    packageFile.value = file
    checkUploadStatus()
  }
}

const handlePreviewChange = (file) => {
  if (file) {
    previewFile.value = file
    checkUploadStatus()
  }
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
  const isUnityPackage = file.name.endsWith('.unitypackage')
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

const handleUpload = async () => {
  if (!packageFile.value || !previewFile.value) {
    ElMessage.warning('请同时上传UnityPackage文件和预览图')
    return
  }

  if (selectedTags.value.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }

  try {
    // 先上传预览图
    const previewFormData = new FormData()
    previewFormData.append('file', previewFile.value.raw)
    const previewResponse = await fetch('/api/upload/preview', {
      method: 'POST',
      body: previewFormData
    })
    const previewData = await previewResponse.json()

    if (!previewResponse.ok) {
      throw new Error('预览图上传失败')
    }

    // 上传UnityPackage文件
    const packageFormData = new FormData()
    packageFormData.append('file', packageFile.value.raw)
    packageFormData.append('preview', previewData.url) // 添加预览图URL
    packageFormData.append('tags', JSON.stringify(selectedTags.value)) // 添加标签

    const packageResponse = await fetch('/api/upload', {
      method: 'POST',
      body: packageFormData
    })

    if (!packageResponse.ok) {
      throw new Error('文件上传失败')
    }

    ElMessage.success('上传成功')
    fetchPackageList() // 刷新列表

    // 清空上传状态
    packageFile.value = null
    previewFile.value = null
    selectedTags.value = []
    canUpload.value = false
    packageUploadRef.value.clearFiles()
    previewUploadRef.value.clearFiles()
  } catch (error) {
    ElMessage.error(error.message || '上传失败')
  }
}

// 预览图上传相关
const handlePreviewSuccess = (response) => {
  editForm.value.preview = response.url
  ElMessage.success('预览图上传成功')
}

// 编辑相关处理函数
const handleEdit = (row) => {
  editForm.value = {
    id: row.id,
    preview: row.preview,
    name: row.name,
    description: row.description,
    tags: [...row.tags] // 确保创建一个新的数组
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
      const response = await fetch(`/api/files/${row.id}`, {
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

const handleSave = async () => {
  if (editForm.value.tags.length === 0) {
    ElMessage.warning('请至少选择一个标签')
    return
  }

  try {
    const response = await fetch(`/api/files/${editForm.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(editForm.value),
    });
    if (!response.ok) {
      throw new Error('保存失败');
    }
    ElMessage.success('保存成功');
    fetchPackageList(); // 刷新列表
    dialogVisible.value = false;
  } catch (error) {
    ElMessage.error('保存失败：' + error.message);
  }
}
</script>

<style scoped>
.admin {
  padding: 20px;
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