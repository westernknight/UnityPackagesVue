<template>
  <div class="admin">
    <h1>UnityPackage管理</h1>
    
    <!-- 文件上传区域 -->
    <el-upload
      class="upload-demo"
      drag
      action="/api/upload"
      accept=".unitypackage"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :before-upload="beforeUpload">
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处或 <em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          只能上传.unitypackage文件
        </div>
      </template>
    </el-upload>

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
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="description" label="描述" />
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
          <el-tag
            v-for="tag in editForm.tags"
            :key="tag"
            closable
            :disable-transitions="false"
            @close="handleClose(tag)">
            {{tag}}
          </el-tag>
          <el-input
            v-if="inputVisible"
            ref="InputRef"
            v-model="inputValue"
            class="ml-1 w-20"
            size="small"
            @keyup.enter="handleInputConfirm"
            @blur="handleInputConfirm"
          />
          <el-button v-else class="button-new-tag ml-1" size="small" @click="showInput">
            + 新标签
          </el-button>
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
import { ref, nextTick, onMounted } from 'vue'
import { UploadFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

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

// 标签输入相关
const inputVisible = ref(false)
const inputValue = ref('')
const InputRef = ref()

// 上传相关处理函数
const handleUploadSuccess = (response) => {
  ElMessage.success('上传成功')
  fetchPackageList() // 上传成功后刷新列表
}

const handleUploadError = () => {
  ElMessage.error('上传失败')
}

const beforeUpload = (file) => {
  const isUnityPackage = file.name.endsWith('.unitypackage')
  if (!isUnityPackage) {
    ElMessage.error('只能上传.unitypackage文件')
  }
  return isUnityPackage
}

// 预览图上传相关
const handlePreviewSuccess = (response) => {
  editForm.value.preview = response.url
  ElMessage.success('预览图上传成功')
}

const beforePreviewUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
  }
  return isImage
}

// 编辑相关处理函数
const handleEdit = (row) => {
  editForm.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = (row) => {
  // TODO: 实现删除功能
}

const handleSave = () => {
  // TODO: 实现保存功能
  dialogVisible.value = false
}

// 标签相关处理函数
const handleClose = (tag) => {
  editForm.value.tags = editForm.value.tags.filter((t) => t !== tag)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value.input.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    editForm.value.tags.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
</script>

<style scoped>
.admin {
  padding: 20px;
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