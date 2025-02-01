import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';
import { mkdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, renameSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// 配置文件上传存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    // 从请求中获取文件ID，如果没有则生成新的
    const fileId = req.body.fileId || Date.now();
    cb(null, fileId + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// 创建上传目录
try {
  mkdirSync('uploads');
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

// 数据文件路径
const DATA_FILE = 'uploads/data.json';

// 初始化数据文件
if (!existsSync(DATA_FILE)) {
  writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// 读取所有文件数据
app.get('/api/files', (req, res) => {
  try {
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 处理unitypackage文件上传
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件上传' });
  }

  try {
    // 从文件名中提取ID
    const fileId = parseInt(req.file.filename.split('-')[0]);
  
    
    const fileData = {
      id: fileId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      name: req.file.originalname,
      path: req.file.path,
      uploadTime: new Date().toISOString(),
      description: req.body.description || '',
      tags: Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags].filter(Boolean),
      preview: req.body.preview || ''
    };

    // 读取现有数据
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    // 添加新文件数据
    data.push(fileData);
    // 保存回文件
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({
      message: '文件上传成功',
      file: fileData
    });
  } catch (error) {
    res.status(500).json({ error: '保存文件数据失败' });
  }
});

// 处理预览图上传
app.post('/api/upload/preview', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件上传' });
  }
  // 从文件名中提取ID
  const fileId = parseInt(req.file.filename.split('-')[0]);
  // 使用文件ID作为文件名前缀
  const newFilename = `${fileId}-${req.file.originalname}`;
  try {
    res.json({
      message: '预览图上传成功',
      url: `/uploads/${newFilename}`
    });
  } catch (error) {
    console.error('重命名预览图失败:', error);
    res.status(500).json({ error: '预览图处理失败' });
  }
});

// 更新文件信息
app.put('/api/files/:id', (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const fileIndex = data.findIndex(item => item.id === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 更新文件信息，保留原始文件路径等信息
    const originalFile = data[fileIndex];

    // 如果有新的预览图且与原预览图不同，删除旧的预览图
    if (req.body.preview && req.body.preview !== originalFile.preview) {
      try {
        const oldPreviewFilename = originalFile.preview.split('/').pop();
        if (oldPreviewFilename) {
          const oldPreviewPath = join(__dirname, 'uploads', oldPreviewFilename);
          if (existsSync(oldPreviewPath)) {
            unlinkSync(oldPreviewPath);
          }
        }
      } catch (err) {
        console.error('删除旧预览图失败:', err);
      }
    }

    data[fileIndex] = {
      ...originalFile,
      name: req.body.name,
      description: req.body.description,
      tags: Array.isArray(req.body.tags) ? req.body.tags : [req.body.tags].filter(Boolean),
      preview: req.body.preview
    };

    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    res.json({ message: '文件信息更新成功', file: data[fileIndex] });
  } catch (error) {
    console.error('更新文件信息失败:', error);
    res.status(500).json({ error: '更新文件信息失败' });
  }
});

// 删除文件
app.delete('/api/files/:id', (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
    const fileIndex = data.findIndex(item => item.id === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const fileData = data[fileIndex];

    // 删除实际文件
    try {
      const filePath = join(__dirname, fileData.path);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }

      // 删除预览图文件
      if (fileData.preview) {
        const previewFilename = fileData.preview.split('/').pop();
        if (previewFilename) {
          const previewPath = join(__dirname, 'uploads', previewFilename);
          if (existsSync(previewPath)) {
            unlinkSync(previewPath);
          }
        }
      }
    } catch (err) {
      console.error('删除文件失败:', err);
    }

    // 从数据中移除
    data.splice(fileIndex, 1);
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ message: '文件删除成功' });
  } catch (error) {
    console.error('删除文件失败:', error);
    res.status(500).json({ error: '删除文件失败' });
  }
});

// 提供静态文件访问
app.use('/uploads', express.static('uploads'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
