# Gemini File Search UI

GoogleのGemini APIのFile Search機能を使用した、意味論的検索とドキュメント管理のための最新のWebアプリケーションです。

## 機能

- **ファイル管理**
  - 一時ストレージへのファイルアップロード (Files API)
  - FileSearchStoreの作成と管理 (永続的なドキュメント保存)
  - FileSearchStoreへの直接アップロード
  - 一時ストレージからFileSearchStoreへのインポート
  - ファイルのプレビューと削除

- **ドキュメント管理**
  - FileSearchStore内のドキュメント表示
  - ドキュメント処理ステータスの追跡 (アクティブ、処理中、失敗)
  - ストア別のストレージ使用量監視

- **意味論的検索**
  - 保存されたドキュメントの自然言語検索
  - 複数FileStore選択可能
  - リアルタイム検索結果と引用情報

- **最新UI**
  - レスポンシブデザイン (デスクトップ、タブレット、モバイル)
  - 直感的なタブベースナビゲーション
  - ドラッグアンドドロップファイルアップロード
  - リアルタイム状態更新

## 技術スタック

- **バックエンド**: Python Flask + Gemini API
- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **API**: Google Gemini File Search API
- **SDK**: google-genai

## 必要な環境

- Python 3.8+
- Google Cloud Project (Gemini API有効)
- Gemini API Key

## インストール

1. **リポジトリをクローン**
   ```bash
   git clone <repository-url>
   cd gemini-filesearch-ui
   ```

2. **仮想環境を作成**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **パッケージをインストール**
   ```bash
   pip install -r requirements.txt
   ```

4. **環境設定**
   ```bash
   cp .env.example .env
   # .envファイルを編集: GEMINI_API_KEYを追加
   ```

5. **アプリケーションを実行**
   ```bash
   python main.py
   ```

   `http://localhost:5001` でアクセスできます。

## スクリーンショット

### ファイルアップロード
![ファイルアップロード タブ](docs/images/file-upload.png)

### マイファイル
![マイファイル タブ](docs/images/my-files.png)

### FileStore 管理
![FileStore 管理](docs/images/filestore-management.png)

### Chat 検索
![Chat 検索](docs/images/chat-search.png)

## 使用方法

### ファイルアップロード
1. 「ファイルアップロード」タブに移動
2. ファイルをドラッグアンドドロップするか、クリックして選択
3. ファイルが一時ストレージにアップロードされます (48時間保持)

### FileStore作成
1. 「FileStore」タブに移動
2. ストア名を入力し、「作成」をクリック
3. 永続ストレージとしてストアが作成されます

### ドキュメント検索
1. 「Chat検索」タブに移動
2. 検索するFileStoreを選択
3. 質問を入力
4. 検索結果と引用情報を確認

## ライセンス

MITライセンス

## 関連ドキュメント

- [Google Gemini API ドキュメント](https://ai.google.dev/)
- [File Search API ガイド](https://ai.google.dev/api/file-search/)
