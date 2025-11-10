# Gemini 文件搜索 UI

一个现代化的网络应用，利用 Google 的 Gemini API 文件搜索功能实现语义搜索和文档管理。

## 功能特性

- **文件管理**
  - 上传文件到临时存储 (Files API)
  - 创建和管理 FileSearchStores 用于持久化文档存储
  - 直接上传文件到 FileSearchStores
  - 从临时存储导入文件到 FileSearchStores
  - 预览和删除文件

- **文档管理**
  - 查看 FileSearchStore 中的文档
  - 追踪文档处理状态 (活跃、处理中、失败)
  - 监控每个存储的使用量

- **语义搜索**
  - 对存储的文档进行自然语言搜索
  - 支持多个 FileStore 选择
  - 实时搜索结果和引用信息

- **现代化 UI**
  - 响应式设计 (桌面、平板、手机)
  - 直观的标签页导航
  - 拖拽上传文件
  - 实时状态更新

## 技术栈

- **后端**: Python Flask + Gemini API
- **前端**: HTML5, CSS3, 原生 JavaScript
- **API**: Google Gemini File Search API
- **SDK**: google-genai

## 系统要求

- Python 3.8+
- Google Cloud 项目 (已启用 Gemini API)
- Gemini API Key

## 安装

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd gemini-filesearch-ui
   ```

2. **创建虚拟环境**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **安装依赖**
   ```bash
   pip install -r requirements.txt
   ```

4. **配置环境**
   ```bash
   cp .env.example .env
   # 编辑 .env 文件添加 GEMINI_API_KEY
   ```

5. **运行应用**
   ```bash
   python main.py
   ```

   应用将在 `http://localhost:5001` 可访问

## 截图

### 文件上传
![文件上传标签页](docs/images/file-upload.png)

### 我的文件
![我的文件标签页](docs/images/my-files.png)

### FileStore 管理
![FileStore 管理](docs/images/filestore-management.png)

### Chat 搜索
![Chat 搜索](docs/images/chat-search.png)

## 使用方法

### 上传文件
1. 转到"文件上传"标签页
2. 拖拽文件或点击选择
3. 文件将上传到临时存储 (保留 48 小时)

### 创建 FileStore
1. 转到"FileStore"标签页
2. 输入存储名称并点击"创建"
3. 存储将创建为永久文档存储

### 搜索文档
1. 转到"Chat 搜索"标签页
2. 选择要搜索的 FileStore
3. 输入您的问题
4. 查看包含文献引用的搜索结果

## API 端点

- `GET /api/stores` - 列出所有 FileSearchStores
- `POST /api/stores/create` - 创建新 FileSearchStore
- `GET /api/files` - 列出已上传的文件
- `POST /api/files/upload` - 上传文件
- `POST /api/stores/upload` - 直接上传到 FileStore
- `POST /api/files/import` - 导入文件到 FileStore
- `POST /api/search` - 搜索文档

## 环境变量

```env
GEMINI_API_KEY=your-api-key-here
FLASK_DEBUG=False
```

## 浏览器支持

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 许可证

本项目采用 MIT 许可证

## 相关文档

- [Google Gemini API 文档](https://ai.google.dev/)
- [文件搜索 API 指南](https://ai.google.dev/api/file-search/)
