<template>
  <div class="admin argon-theme">
    <!-- 上传区域 -->
    <div class="upload-section argon-card">
      <div class="upload-container">
        <h3>上传UnityPackage</h3>
        <el-upload
          ref="packageUploadRef"
          action="/api/upload/package"
          :auto-upload="false"
          :show-file-list="false"
          accept=".unitypackage"
          :on-change="handlePackageChange"
          :before-upload="beforePackageUpload">
          <template #trigger>
            <div class="upload-trigger">
              <el-icon class="upload-icon"><upload-filled /></el-icon>
              <div class="upload-text">点击或拖拽文件到此处上传</div>
            </div>
          </template>
        </el-upload>
      </div>

      <div class="preview-container">
        <h3>预览图（可选）</h3>
        <el-upload
          ref="previewUploadRef"
          class="preview-uploader"
          action="/api/upload/preview"
          :show-file-list="false"
          :auto-upload="false"
          accept="image/*"
          :on-change="handlePreviewChange"
          :before-upload="beforePreviewUpload">
          <template #trigger>
            <div class="preview-trigger">
              <img v-if="previewUrl" :src="previewUrl" class="preview-image" />
              <el-icon v-else class="preview-icon"><plus /></el-icon>
            </div>
          </template>
        </el-upload>
      </div>
    </div>

    <!-- 标签选择区域 -->
    <div class="tags-container argon-card">
      <h3>描述</h3>
      <el-input
        v-model="packageDescription"
        type="textarea"
        :rows="3"
        placeholder="请输入UnityPackage的描述信息"
        class="argon-input"
      />
      <h3>选择标签（必选）</h3>
      <div class="tags-list">
        <el-checkbox-group v-model="selectedTags">
          <el-checkbox 
            v-for="tag in predefinedTags" 
            :key="tag" 
            :value="tag"
            class="argon-checkbox">
            {{ tag }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </div>

    <div class="upload-actions">
      <el-button 
        type="primary" 
        :disabled="!canUpload" 
        @click="handleUpload"
        class="argon-button-primary">
        上传文件
      </el-button>
    </div>

    <!-- 文件列表 -->
    <div class="package-list argon-card">
      <el-table :data="packageList" style="width: 100%">
        <el-table-column prop="preview" label="预览图" width="180">
          <template #default="{row}">
            <el-image 
              style="width: 100px; height: 100px"
              :src="row.preview"
              fit="cover"
              :preview-src-list="[row.preview]"
              class="preview-image">
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
              class="mx-1 argon-tag-small"
              size="small">
              {{ tag }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{row}">
            <el-button 
              size="small" 
              @click="handleEdit(row)"
              class="argon-button">
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(row)"
              class="argon-button-danger">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog 
      v-model="dialogVisible" 
      title="编辑包信息" 
      width="50%"
      class="argon-dialog">
      <el-form :model="editForm" label-width="120px">
        <el-form-item label="预览图">
          <el-upload
            class="avatar-uploader"
            action="/api/upload/preview"
            :show-file-list="false"
            :auto-upload="false"
            accept="image/*"
            :on-change="handleEditPreviewChange"
            :before-upload="beforePreviewUpload">
            <img v-if="editForm.preview" :src="editForm.preview" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">点击图片可更换预览图</div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="editForm.name" class="argon-input" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input 
            v-model="editForm.description" 
            type="textarea" 
            class="argon-input" />
        </el-form-item>
        <el-form-item label="标签">
          <el-checkbox-group v-model="editForm.tags">
            <el-checkbox 
              v-for="tag in predefinedTags" 
              :key="tag" 
              :value="tag"
              class="argon-checkbox">
              {{ tag }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" class="argon-button">取消</el-button>
          <el-button type="primary" @click="handleSave" class="argon-button-primary">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin.argon-theme {
  background: linear-gradient(150deg, #7795f8 15%, #6772e5 70%, #555abf 94%);
  min-height: 100vh;
  padding: 20px;
}

.argon-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
}

.upload-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.upload-container, .preview-container {
  padding: 20px;
}

.upload-trigger, .preview-trigger {
  border: 2px dashed rgba(94, 114, 228, 0.2);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.upload-trigger:hover, .preview-trigger:hover {
  border-color: #5e72e4;
}

.upload-icon, .preview-icon {
  font-size: 48px;
  color: #5e72e4;
  margin-bottom: 10px;
}

.upload-text {
  color: #525f7f;
}

.preview-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.argon-input :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(50, 50, 93, 0.15), 0 1px 0 rgba(0, 0, 0, 0.02);
}

.argon-checkbox {
  margin-right: 20px;
  margin-bottom: 10px;
}

.argon-tag-small {
  background: rgba(94, 114, 228, 0.1);
  color: #5e72e4;
  border: none;
  border-radius: 6px;
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

.argon-button-danger {
  background: #f5365c;
  color: white;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
}

.argon-button:hover,
.argon-button-primary:hover,
.argon-button-danger:hover {
  transform: translateY(-1px);
  box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
}

.argon-dialog :deep(.el-dialog) {
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07);
}

.avatar-uploader {
  border: 2px dashed rgba(94, 114, 228, 0.2);
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
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
</style>
