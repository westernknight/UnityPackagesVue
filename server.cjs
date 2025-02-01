const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// 配置文件上传存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const tempId = Date.now();
    cb(null, tempId + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// 创建上传目录
try {
  fs.mkdirSync('uploads');
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

// 数据文件路径
const DATA_FILE = 'uploads/data.json';

// 初始化数据文件
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// 读取所有文件数据
app.get('/api/files', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
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

    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    data.push(fileData);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

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
  
  try {
    const fileId = req.body.fileId || req.file.filename.split('-')[0];
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const fileIndex = data.findIndex(item => item.id === parseInt(fileId));

    if (fileIndex === -1) {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({ error: '未找到对应的文件记录' });
    }

    if (data[fileIndex].preview && fs.existsSync(data[fileIndex].preview)) {
      fs.unlinkSync(data[fileIndex].preview);
    }

    data[fileIndex].preview = req.file.path;
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({
      message: '预览图上传成功',
      preview: req.file.path
    });
  } catch (error) {
    res.status(500).json({ error: '保存预览图数据失败' });
  }
});

// 删除文件
app.delete('/api/files/:id', (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const fileIndex = data.findIndex(item => item.id === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: '文件不存在' });
    }

    const file = data[fileIndex];

    // 删除实际文件
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    // 删除预览图
    if (file.preview && fs.existsSync(file.preview)) {
      fs.unlinkSync(file.preview);
    }

    // 从数据中移除
    data.splice(fileIndex, 1);
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({ message: '文件删除成功' });
  } catch (error) {
    res.status(500).json({ error: '删除文件失败' });
  }
});

// 更新文件信息
app.put('/api/files/:id', (req, res) => {
  try {
    const fileId = parseInt(req.params.id);
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const fileIndex = data.findIndex(item => item.id === fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ error: '文件不存在' });
    }

    // 更新文件信息
    data[fileIndex] = {
      ...data[fileIndex],
      ...req.body,
      id: fileId // 确保 ID 不被修改
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

    res.json({
      message: '文件信息更新成功',
      file: data[fileIndex]
    });
  } catch (error) {
    res.status(500).json({ error: '更新文件信息失败' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});