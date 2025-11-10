# Gemini File Search UI

A modern web application for semantic search and document management using Google's Gemini API File Search feature.

## Features

- **File Management**
  - Upload files to temporary storage (Files API)
  - Create and manage FileSearchStores for persistent document storage
  - Upload files directly to FileSearchStores
  - Import files from temporary storage to FileSearchStores
  - Preview and delete files

- **Document Management**
  - View documents in FileSearchStore
  - Track document processing status (active, pending, failed)
  - Monitor storage usage per store

- **Semantic Search**
  - Natural language search across stored documents
  - Multiple FileStore selection
  - Real-time search results with citations

- **Modern UI**
  - Responsive design for desktop, tablet, and mobile
  - Intuitive tab-based navigation
  - Drag-and-drop file upload
  - Real-time status updates

## Tech Stack

- **Backend**: Python Flask with Gemini API integration
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **API**: Google Gemini File Search API
- **SDK**: google-genai

## Prerequisites

- Python 3.8+
- Google Cloud Project with Gemini API enabled
- Gemini API Key

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gemini-filesearch-ui
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

5. **Run the application**
   ```bash
   python main.py
   ```

   The application will be available at `http://localhost:5001`

## Screenshots

### File Upload
![File Upload Tab](docs/images/file-upload.png)

### My Files
![My Files Tab](docs/images/my-files.png)

### FileStore Management
![FileStore Management](docs/images/filestore-management.png)

### Chat Search
![Chat Search](docs/images/chat-search.png)

## Usage

### Upload Files
1. Go to "File Upload" tab
2. Drag and drop files or click to select
3. Files are uploaded to temporary storage (48-hour retention)

### Create FileStore
1. Go to "FileStore" tab
2. Enter store name and click "Create"
3. Store is created for persistent document storage

### Search Documents
1. Go to "Chat Search" tab
2. Select FileStore(s) to search
3. Enter your question
4. View results with document citations

## API Endpoints

- `GET /api/stores` - List all FileSearchStores
- `POST /api/stores/create` - Create new FileSearchStore
- `GET /api/files` - List uploaded files
- `POST /api/files/upload` - Upload file
- `POST /api/stores/upload` - Upload directly to FileStore
- `POST /api/files/import` - Import file to FileStore
- `POST /api/search` - Search documents

## Environment Variables

```env
GEMINI_API_KEY=your-api-key-here
FLASK_DEBUG=False
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

This project is licensed under the MIT License

## Related Documentation

- [Google Gemini API Documentation](https://ai.google.dev/)
- [File Search API Guide](https://ai.google.dev/api/file-search/)
