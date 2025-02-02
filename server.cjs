const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

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
    // 按上传时间降序排序
    data.sort((a, b) => new Date(b.uploadTime) - new Date(a.uploadTime));
    
    const page = req.query.page ? parseInt(req.query.page) : null;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const searchQuery = req.query.search ? req.query.search.toLowerCase() : '';

    // 根据搜索关键词过滤数据
    const filteredData = searchQuery
      ? data.filter(item => item.name.toLowerCase().includes(searchQuery))
      : data;

    if (page !== null) {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      res.json(paginatedData);
    } else {
      res.json(filteredData);
    }
  } catch (error) {
    res.status(500).json({ error: '读取数据失败' });
  }
});

// 检查文件MD5是否存在
app.get('/api/files/check-md5/:md5', (req, res) => {
  try {
    const md5 = req.params.md5;
    const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const existingFile = data.find(item => item.md5 === md5);

    if (existingFile) {
      res.json({
        exists: true,
        file: existingFile
      });
    } else {
      res.json({
        exists: false
      });
    }
  } catch (error) {
    res.status(500).json({ error: '检查文件MD5失败' });
  }
});

// 修改上传接口，保存MD5值
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
      preview: req.body.preview || '',
      md5: req.body.md5, // 保存MD5值
      size: parseInt(req.body.size) || 0, // 保存文件大小
      stars: Math.min(5, Math.max(0, parseInt(req.body.stars) || 0)) // 添加stars字段，限制在0-5之间
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
    const newFilename = `${fileId}-${req.file.originalname}`;
    const oldPath = path.join(process.cwd(), req.file.path);
    const newPath = path.join(process.cwd(), 'uploads', newFilename);
    
    // 重命名文件
    fs.renameSync(oldPath, newPath);
    
    res.json({
      message: '预览图上传成功',
      url: `uploads\\${newFilename}`
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
      id: fileId, // 确保 ID 不被修改
      stars: Math.min(5, Math.max(0, parseInt(req.body.stars) || data[fileIndex].stars || 0)) // 确保stars值在0-5之间
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://0.0.0.0:${PORT}`);
});