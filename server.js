import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());

// 配置文件上传存储
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ storage: storage });

// 创建上传目录
import { mkdirSync } from 'fs';
try {
  mkdirSync('uploads');
} catch (err) {
  if (err.code !== 'EEXIST') throw err;
}

// 处理unitypackage文件上传
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件上传' });
  }
  res.json({
    message: '文件上传成功',
    filename: req.file.filename,
    path: req.file.path
  });
});

// 处理预览图上传
app.post('/api/upload/preview', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '没有文件上传' });
  }
  res.json({
    message: '预览图上传成功',
    url: `/uploads/${req.file.filename}`
  });
});

// 提供静态文件访问
app.use('/uploads', express.static('uploads'));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});