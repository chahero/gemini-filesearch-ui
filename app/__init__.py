from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

def create_app():
    # 루트 디렉토리 경로 설정
    root_path = Path(__file__).parent.parent
    template_folder = root_path / 'templates'
    static_folder = root_path / 'static'

    app = Flask(__name__, template_folder=str(template_folder), static_folder=str(static_folder))
    CORS(app)

    app.config['GEMINI_API_KEY'] = os.getenv('GEMINI_API_KEY')
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB

    # 라우트 등록
    from app import routes
    app.register_blueprint(routes.bp)

    return app
