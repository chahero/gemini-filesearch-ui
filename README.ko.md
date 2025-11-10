# Gemini File Search UI

Google의 Gemini API File Search 기능을 사용한 의미론적 검색 및 문서 관리를 위한 현대적 웹 애플리케이션입니다.

## 기능

- **파일 관리**
  - 임시 저장소에 파일 업로드 (Files API)
  - FileSearchStore 생성 및 관리 (영구 문서 저장)
  - FileSearchStore에 파일 직접 업로드
  - 임시 저장소에서 FileSearchStore로 파일 import
  - 파일 미리보기 및 삭제

- **문서 관리**
  - FileSearchStore의 문서 조회
  - 문서 처리 상태 추적 (활성, 처리중, 실패)
  - 저장소별 저장 용량 모니터링

- **의미론적 검색**
  - 저장된 문서에 대한 자연어 검색
  - 여러 FileStore 선택 가능
  - 실시간 검색 결과 및 인용 정보

- **현대적 UI**
  - 반응형 디자인 (데스크톱, 태블릿, 모바일)
  - 직관적인 탭 기반 네비게이션
  - 드래그 앤 드롭 파일 업로드
  - 실시간 상태 업데이트

## 기술 스택

- **백엔드**: Python Flask + Gemini API
- **프론트엔드**: HTML5, CSS3, Vanilla JavaScript
- **API**: Google Gemini File Search API
- **SDK**: google-genai

## 요구사항

- Python 3.8+
- Google Cloud Project (Gemini API 활성화)
- Gemini API Key

## 설치

1. **저장소 클론**
   ```bash
   git clone <repository-url>
   cd gemini-filesearch-ui
   ```

2. **가상 환경 생성**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   ```

3. **패키지 설치**
   ```bash
   pip install -r requirements.txt
   ```

4. **환경 설정**
   ```bash
   cp .env.example .env
   # .env 파일 수정: GEMINI_API_KEY 추가
   ```

5. **애플리케이션 실행**
   ```bash
   python main.py
   ```

   `http://localhost:5001` 에서 접속 가능합니다.

## 스크린샷

### 파일 업로드
![파일 업로드 탭](docs/images/file-upload.png)

### 내 파일
![내 파일 탭](docs/images/my-files.png)

### FileStore 관리
![FileStore 관리](docs/images/filestore-management.png)

### Chat 검색
![Chat 검색](docs/images/chat-search.png)

## 사용 방법

### 파일 업로드
1. "파일 업로드" 탭으로 이동
2. 파일을 드래그 앤 드롭하거나 클릭하여 선택
3. 파일이 임시 저장소에 업로드됨 (48시간 유지)

### FileStore 생성
1. "FileStore" 탭으로 이동
2. 스토어 이름 입력 후 "생성" 클릭
3. 영구 저장소로 스토어 생성됨

### 문서 검색
1. "Chat 검색" 탭으로 이동
2. 검색할 FileStore 선택
3. 질문 입력
4. 검색 결과 및 인용 정보 확인

## 라이선스

MIT 라이선스

## 관련 문서

- [Google Gemini API 문서](https://ai.google.dev/)
- [File Search API 가이드](https://ai.google.dev/api/file-search/)
