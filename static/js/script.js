// ============================================================================
// 상태 관리
// ============================================================================
const state = {
    files: [],
    stores: [],
    selectedStoreId: null,
    currentTab: 'upload'
};

// ============================================================================
// DOM 요소
// ============================================================================
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadProgress = document.getElementById('uploadProgress');
const uploadStatus = document.getElementById('uploadStatus');
const filesList = document.getElementById('filesList');
const fileCheckboxList = document.getElementById('fileCheckboxList');
const searchQuery = document.getElementById('searchQuery');
const searchBtn = document.getElementById('searchBtn');
const searchResult = document.getElementById('searchResult');
const resultContent = document.getElementById('resultContent');
const searchLoading = document.getElementById('searchLoading');
const toast = document.getElementById('toast');
const refreshFilesBtn = document.getElementById('refreshFilesBtn');
const selectAllBtn = document.getElementById('selectAllBtn');
const closeResultBtn = document.getElementById('closeResultBtn');

// ============================================================================
// 초기화
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadFiles();
    loadStores();
});

// ============================================================================
// 이벤트 리스너 설정
// ============================================================================
function setupEventListeners() {
    // 탭 네비게이션
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', handleTabChange);
    });

    // 파일 업로드
    uploadArea.addEventListener('click', () => fileInput.click());
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);
    fileInput.addEventListener('change', handleFileSelect);

    // 파일 목록
    refreshFilesBtn.addEventListener('click', loadFiles);

    // 검색
    searchBtn.addEventListener('click', performSearch);
    selectAllBtn.addEventListener('click', toggleSelectAll);
    closeResultBtn.addEventListener('click', () => {
        searchResult.style.display = 'none';
    });

    // Enter 키로 검색 (Ctrl+Enter)
    searchQuery.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            performSearch();
        }
    });

    // Import 패널 버튼
    const confirmImportBtn = document.getElementById('confirmImportBtn');
    const cancelImportBtn = document.getElementById('cancelImportBtn');

    if (confirmImportBtn) {
        confirmImportBtn.addEventListener('click', confirmImportFile);
    }
    if (cancelImportBtn) {
        cancelImportBtn.addEventListener('click', cancelImportPanel);
    }

    // FileStore 선택시 스토어 목록 업데이트
    const storeSelectForUpload = document.getElementById('storeSelectForUpload');
    if (storeSelectForUpload) {
        storeSelectForUpload.addEventListener('change', () => {
            // 선택된 스토어를 표시하기 위한 간단한 처리
        });
    }
}

// ============================================================================
// 탭 관리
// ============================================================================
function handleTabChange(e) {
    const tabName = e.currentTarget.getAttribute('data-tab');

    // 네비게이션 업데이트
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    // 탭 컨텐츠 업데이트
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    state.currentTab = tabName;

    // 탭별 초기화
    if (tabName === 'files') {
        loadFiles();
    } else if (tabName === 'stores') {
        loadStores();
    } else if (tabName === 'search') {
        loadStores(); // 스토어 목록을 라디오 버튼으로 로드
    }
}

// ============================================================================
// 파일 업로드 (드래그 앤 드롭)
// ============================================================================
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    handleFiles(files);
}

function handleFiles(files) {
    const fileArray = Array.from(files);
    uploadProgress.style.display = 'block';
    uploadStatus.innerHTML = '';

    fileArray.forEach((file, index) => {
        uploadFile(file, index, fileArray.length);
    });
}

// ============================================================================
// 파일 업로드 및 자동 임포트
// ============================================================================
async function uploadFile(file, index, total) {
    const formData = new FormData();
    formData.append('file', file);

    const fileName = file.name;
    const statusItem = document.createElement('div');
    statusItem.className = 'status-item';
    statusItem.id = `status-${index}`;
    statusItem.innerHTML = `
        <div class="status-icon">⏳</div>
        <div class="status-content">
            <div class="status-title">${fileName}</div>
            <div class="status-message">업로드 중...</div>
        </div>
    `;
    uploadStatus.appendChild(statusItem);

    try {
        // 1. 파일 업로드
        const uploadResponse = await fetch('/api/files/upload', {
            method: 'POST',
            body: formData
        });

        const uploadData = await uploadResponse.json();

        if (!uploadData.success) {
            throw new Error(uploadData.error || '업로드 실패');
        }

        const fileId = uploadData.file_id;

        // 업로드 성공 표시
        statusItem.querySelector('.status-message').textContent = '업로드 완료, 스토어에 임포트 중...';

        // 2. 기본 스토어가 있으면 자동 임포트
        if (state.stores.length > 0) {
            const defaultStore = state.stores[0]; // 첫 번째 스토어를 기본으로 사용

            const importResponse = await fetch(`/api/files/${fileId}/import`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    store_id: defaultStore.store_id
                })
            });

            const importData = await importResponse.json();

            if (!importData.success) {
                throw new Error(importData.error || '임포트 실패');
            }

            statusItem.classList.add('success');
            statusItem.innerHTML = `
                <div class="status-icon">✓</div>
                <div class="status-content">
                    <div class="status-title">${fileName}</div>
                    <div class="status-message">업로드 및 임포트 완료 (${defaultStore.name})</div>
                </div>
            `;
            showToast(`${fileName} 업로드 및 임포트 완료`, 'success');
        } else {
            // 스토어가 없으면 업로드만 성공
            statusItem.classList.add('success');
            statusItem.innerHTML = `
                <div class="status-icon">✓</div>
                <div class="status-content">
                    <div class="status-title">${fileName}</div>
                    <div class="status-message">업로드 완료 (스토어 없음)</div>
                </div>
            `;
            showToast(`${fileName} 업로드 완료 (스토어를 생성하세요)`, 'warning');
        }

        // 모든 파일이 업로드되면 파일 목록 새로고침
        if (document.querySelectorAll('.status-item.success').length === total) {
            setTimeout(() => {
                loadFiles();
                loadStores(); // 스토어 정보도 새로고침
                uploadProgress.style.display = 'none';
            }, 1000);
        }
    } catch (error) {
        statusItem.classList.add('error');
        statusItem.innerHTML = `
            <div class="status-icon">✗</div>
            <div class="status-content">
                <div class="status-title">${fileName}</div>
                <div class="status-message">${error.message}</div>
            </div>
        `;
        showToast(`${fileName} 업로드 실패: ${error.message}`, 'error');
    }
}

// ============================================================================
// 파일 관리
// ============================================================================
async function loadFiles() {
    try {
        const response = await fetch('/api/files');
        const data = await response.json();

        if (data.success) {
            state.files = data.files;
            renderFiles();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error loading files:', error);
        filesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">❌</div>
                <p>파일 로드 실패: ${error.message}</p>
            </div>
        `;
    }
}

function renderFiles() {
    if (state.files.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>업로드된 파일이 없습니다</p>
            </div>
        `;
        return;
    }

    filesList.innerHTML = state.files.map(file => {
        const sizeInMB = (file.size_bytes / (1024 * 1024)).toFixed(2);
        const fileName = file.display_name;
        const date = new Date(file.create_time).toLocaleDateString('ko-KR');
        const fileId = file.file_id;

        return `
            <div class="file-card">
                <div class="file-card-header">
                    <div class="file-icon">${getFileIcon(fileName)}</div>
                    <div class="file-card-actions">
                        <button title="보기" onclick="previewFile('${fileId}', '${fileName}')">👁️</button>
                        <button title="FileStore로 옮기기" onclick="showImportPanel('${fileId}', '${fileName}')">📤</button>
                        <button title="삭제" onclick="deleteFile('${fileId}', '${fileName}')">🗑️</button>
                    </div>
                </div>
                <div class="file-name" title="${fileName}">${fileName}</div>
                <div class="file-info">
                    <span>${sizeInMB} MB</span>
                    <span class="file-date">${date}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': '📄',
        'txt': '📝',
        'doc': '📘',
        'docx': '📘',
        'xls': '📊',
        'xlsx': '📊',
        'ppt': '🎨',
        'pptx': '🎨',
        'csv': '📋',
        'json': '{}',
        'xml': '<>',
        'html': '🌐'
    };
    return iconMap[ext] || '📎';
}

async function deleteFile(fileId, fileName) {
    if (!confirm(`"${fileName}"을(를) 정말 삭제하시겠습니까?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/files/${fileId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast(`${fileName} 삭제 완료`, 'success');
            loadFiles();
            loadStores(); // 스토어 정보도 새로고침
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showToast(`삭제 실패: ${error.message}`, 'error');
    }
}

// 파일 미리보기
async function previewFile(fileId, fileName) {
    try {
        // Remove 'files/' prefix if it exists
        const cleanFileId = fileId.replace(/^files\//, '');
        const response = await fetch(`/api/files/${cleanFileId}/preview`);
        const data = await response.json();

        if (!data.success) {
            showToast(`미리보기 불가: ${data.error}`, 'error');
            return;
        }

        // 파일 정보 모달 표시 또는 새 창에서 열기
        if (data.mime_type?.startsWith('application/pdf')) {
            // PDF는 새 창에서 열기
            window.open(data.uri, '_blank');
        } else if (data.mime_type?.startsWith('text/')) {
            // 텍스트는 모달에서 보기
            alert(`파일: ${fileName}\n크기: ${(data.size_bytes / 1024 / 1024).toFixed(2)} MB\n\n파일 정보: ${data.uri}`);
        } else {
            // 다른 파일은 직접 링크 제공
            window.open(data.uri, '_blank');
        }

        showToast(`${fileName} 미리보기 열기`, 'success');
    } catch (error) {
        showToast(`미리보기 오류: ${error.message}`, 'error');
    }
}

// ============================================================================
// FileSearchStore 관리
// ============================================================================
async function loadStores() {
    try {
        const response = await fetch('/api/stores');
        const data = await response.json();

        if (data.success) {
            state.stores = data.stores;
            renderStores();
            renderStoresForSearch();
            updateStoreSelects(); // FileStore 선택 드롭다운 업데이트
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        console.error('Error loading stores:', error);
        const storesContainer = document.getElementById('storesList');
        if (storesContainer) {
            storesContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">❌</div>
                    <p>스토어 로드 실패: ${error.message}</p>
                </div>
            `;
        }
    }
}

function updateStoreSelects() {
    // FileStore 직접 업로드 선택
    const storeSelectForUpload = document.getElementById('storeSelectForUpload');
    if (storeSelectForUpload) {
        const selectedValue = storeSelectForUpload.value; // 현재 선택값 유지
        storeSelectForUpload.innerHTML = '<option value="">FileStore 선택...</option>';

        state.stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store.store_name;
            option.textContent = store.display_name;
            storeSelectForUpload.appendChild(option);
        });

        // 이전 선택값 복원
        if (selectedValue) {
            storeSelectForUpload.value = selectedValue;
        }
    }
}

function renderStores() {
    const storesContainer = document.getElementById('storesList');
    if (!storesContainer) return;

    if (state.stores.length === 0) {
        storesContainer.innerHTML = `
            <div class="create-store-form">
                <h3>새 FileSearchStore 생성</h3>
                <input type="text" id="newStoreName" placeholder="스토어 이름 (예: 문서 스토어)" class="input-field">
                <button class="btn btn-primary" onclick="createStore()">생성</button>
            </div>
            <div class="empty-state">
                <div class="empty-icon">💾</div>
                <p>생성된 FileSearchStore가 없습니다</p>
            </div>
        `;
        return;
    }

    const storeCards = state.stores.map(store => {
        const activeCount = store.active_documents_count || 0;
        const pendingCount = store.pending_documents_count || 0;
        const failedCount = store.failed_documents_count || 0;
        const totalSize = store.size_bytes || 0;
        const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
        const createdDate = new Date(store.create_time).toLocaleDateString('ko-KR');

        return `
            <div class="store-card" onclick="showStoreDocuments('${store.store_name}', '${store.display_name}')">
                <div class="store-header">
                    <h3>${store.display_name}</h3>
                    <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); deleteStore('${store.store_name}', '${store.display_name}')">삭제</button>
                </div>
                <div class="store-info">
                    <div class="store-stat">
                        <span class="store-label">활성 문서:</span>
                        <span class="store-value file-count-${store.store_name.replace(/\//g, '-')}">${activeCount}개</span>
                    </div>
                    <div class="store-stat">
                        <span class="store-label">처리 중:</span>
                        <span class="store-value">${pendingCount}개</span>
                    </div>
                    ${failedCount > 0 ? `
                    <div class="store-stat">
                        <span class="store-label">실패:</span>
                        <span class="store-value error">${failedCount}개</span>
                    </div>
                    ` : ''}
                    <div class="store-stat">
                        <span class="store-label">용량:</span>
                        <span class="store-value">${sizeInMB} MB</span>
                    </div>
                    <div class="store-stat">
                        <span class="store-label">생성일:</span>
                        <span class="store-value">${createdDate}</span>
                    </div>
                    <div class="store-stat">
                        <span class="store-label">Store ID:</span>
                        <span class="store-value store-id" style="font-size: 12px;">${store.store_name}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    storesContainer.innerHTML = `
        <div class="create-store-form">
            <h3>새 FileSearchStore 생성</h3>
            <input type="text" id="newStoreName" placeholder="스토어 이름 (예: 문서 스토어)" class="input-field">
            <button class="btn btn-primary" onclick="createStore()">생성</button>
        </div>
        <div class="stores-grid">
            ${storeCards}
        </div>
    `;

    // 통계 업데이트
    updateStats();
}

function updateStats() {
    const totalFilesElem = document.getElementById('totalFiles');
    const totalSizeElem = document.getElementById('totalSize');

    if (totalFilesElem && totalSizeElem) {
        // FileStore의 활성 문서 수 합계
        const totalActiveDocuments = state.stores.reduce((sum, s) => sum + (s.active_documents_count || 0), 0);
        totalFilesElem.textContent = totalActiveDocuments;

        // FileStore의 총 용량
        const totalBytes = state.stores.reduce((sum, s) => sum + (s.size_bytes || 0), 0);
        const totalSize = (totalBytes / (1024 * 1024)).toFixed(2);
        totalSizeElem.textContent = totalSize + ' MB';
    }
}

async function createStore() {
    const nameInput = document.getElementById('newStoreName');
    const name = nameInput.value.trim();

    if (!name) {
        showToast('스토어 이름을 입력하세요', 'warning');
        return;
    }

    try {
        const response = await fetch('/api/stores/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
        });

        const data = await response.json();

        if (data.success) {
            showToast(`${name} 스토어 생성 완료`, 'success');
            nameInput.value = '';
            loadStores();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showToast(`스토어 생성 실패: ${error.message}`, 'error');
    }
}

async function deleteStore(storeId, storeName) {
    if (!confirm(`"${storeName}" 스토어를 정말 삭제하시겠습니까?\n스토어를 삭제해도 파일은 유지됩니다.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/stores/${storeId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (data.success) {
            showToast(`${storeName} 스토어 삭제 완료`, 'success');
            loadStores();
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showToast(`스토어 삭제 실패: ${error.message}`, 'error');
    }
}

// ============================================================================
// 검색 기능
// ============================================================================
function renderStoresForSearch() {
    const container = fileCheckboxList;
    if (!container) return;

    if (state.stores.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>생성된 FileSearchStore가 없습니다</p>
                <small>FileStore 탭에서 스토어를 생성하세요</small>
            </div>
        `;
        return;
    }

    const storeRadios = state.stores.map((store, index) => {
        const fileCount = store.active_documents_count || 0;
        const checked = index === 0 ? 'checked' : '';

        return `
            <label class="checkbox-item">
                <input type="radio" name="store" value="${store.store_name}" class="store-radio" ${checked}>
                <span class="checkbox-label">${store.display_name}</span>
                <span class="checkbox-size">${fileCount}개 문서</span>
            </label>
        `;
    }).join('');

    container.innerHTML = `
        <div style="margin-bottom: 10px;">
            <strong>검색할 FileSearchStore 선택:</strong>
        </div>
        ${storeRadios}
    `;

    // 첫 번째 스토어를 기본 선택
    if (state.stores.length > 0) {
        state.selectedStoreId = state.stores[0].store_name;
    }

    // 라디오 버튼 변경 이벤트
    document.querySelectorAll('.store-radio').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.selectedStoreId = e.target.value;
        });
    });
}

function toggleSelectAll() {
    // 라디오 버튼 방식으로 변경되었으므로 이 함수는 사용되지 않음
    // 하지만 HTML에 버튼이 있을 수 있으므로 메시지만 표시
    showToast('스토어는 하나만 선택할 수 있습니다', 'info');
}

async function performSearch() {
    const selectedRadio = document.querySelector('.store-radio:checked');

    if (!selectedRadio) {
        showToast('검색할 FileSearchStore를 선택하세요', 'warning');
        return;
    }

    const query = searchQuery.value.trim();
    if (!query) {
        showToast('검색 질문을 입력하세요', 'warning');
        return;
    }

    const storeId = selectedRadio.value;

    searchLoading.style.display = 'flex';
    searchResult.style.display = 'none';

    try {
        const response = await fetch('/api/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                store_ids: [storeId],
                metadata_filter: null
            })
        });

        const data = await response.json();

        if (data.success) {
            renderSearchResult(data.result, data.citations);
            searchResult.style.display = 'block';
            showToast('검색 완료', 'success');
        } else {
            throw new Error(data.error);
        }
    } catch (error) {
        showToast(`검색 실패: ${error.message}`, 'error');
    } finally {
        searchLoading.style.display = 'none';
    }
}

function renderSearchResult(result, citations) {
    let html = `<div class="result-text">${result}</div>`;

    if (citations && citations.length > 0) {
        html += `
            <div class="citations-section">
                <h4>참조 자료 (Citations)</h4>
                <div class="citations-list">
        `;

        citations.forEach((citation, index) => {
            html += `
                <div class="citation-item">
                    <div class="citation-number">[${index + 1}]</div>
                    <div class="citation-content">
                        <div class="citation-text">${citation.content || citation.text || '내용 없음'}</div>
                        ${citation.source ? `<div class="citation-source">출처: ${citation.source}</div>` : ''}
                    </div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;
    }

    resultContent.innerHTML = html;
}

// ============================================================================
// ============================================================================
// FileStore 직접 업로드
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
    // FileStore 업로드 영역 이벤트
    const uploadToStoreArea = document.getElementById('uploadToStoreArea');
    const fileInputForStore = document.getElementById('fileInputForStore');

    if (uploadToStoreArea) {
        uploadToStoreArea.addEventListener('click', () => fileInputForStore.click());
        uploadToStoreArea.addEventListener('dragover', handleDragOver);
        uploadToStoreArea.addEventListener('dragleave', handleDragLeave);
        uploadToStoreArea.addEventListener('drop', (e) => handleDropForStore(e));
        fileInputForStore.addEventListener('change', handleFileSelectForStore);
    }
});

function handleDropForStore(e) {
    handleDragLeave(e);
    const files = e.dataTransfer.files;

    if (files.length > 0) {
        const store = document.getElementById('storeSelectForUpload').value;
        if (!store) {
            showToast('FileStore를 먼저 선택하세요', 'error');
            return;
        }

        Array.from(files).forEach(file => {
            uploadToFileSearchStore(file, store);
        });
    }
}

function handleFileSelectForStore(e) {
    const store = document.getElementById('storeSelectForUpload').value;
    if (!store) {
        showToast('FileStore를 먼저 선택하세요', 'error');
        return;
    }

    Array.from(e.target.files).forEach(file => {
        uploadToFileSearchStore(file, store);
    });
}

async function uploadToFileSearchStore(file, storeName) {
    // 파일 검증
    const validExtensions = ['pdf', 'txt', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'pptx', 'csv', 'json', 'xml', 'html'];
    const ext = file.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
        showToast(`지원하지 않는 파일 형식입니다: ${file.name}`, 'error');
        return;
    }

    const uploadProgress = document.getElementById('uploadToStoreProgress');
    const uploadStatus = document.getElementById('uploadToStoreStatus');
    const progressFill = document.getElementById('progressFillStore');
    const uploadFileName = document.getElementById('uploadToStoreFileName');

    uploadFileName.textContent = `${file.name} 업로드 중...`;
    uploadProgress.style.display = 'block';
    uploadStatus.innerHTML = '';

    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('store_name', storeName);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 201) {
                const response = JSON.parse(xhr.responseText);
                showToast(`${file.name}이(가) FileStore에 업로드되었습니다`, 'success');
                uploadStatus.innerHTML = `<div class="success-message">✅ ${file.name} 업로드 완료</div>`;

                // 스토어 목록 새로고침
                setTimeout(() => {
                    loadStores();
                    uploadProgress.style.display = 'none';
                    uploadStatus.innerHTML = '';
                }, 2000);
            } else {
                const error = JSON.parse(xhr.responseText);
                showToast(`업로드 실패: ${error.error || 'Unknown error'}`, 'error');
                uploadStatus.innerHTML = `<div class="error-message">❌ 업로드 실패: ${error.error}</div>`;
            }
        });

        xhr.addEventListener('error', () => {
            showToast('업로드 중 오류가 발생했습니다', 'error');
            uploadStatus.innerHTML = '<div class="error-message">❌ 업로드 중 오류 발생</div>';
        });

        xhr.open('POST', '/api/stores/upload');
        xhr.send(formData);

    } catch (error) {
        showToast(`에러: ${error.message}`, 'error');
        uploadStatus.innerHTML = `<div class="error-message">❌ 에러: ${error.message}</div>`;
    }
}

// ============================================================================
// FileStore로 파일 옮기기
// ============================================================================
let selectedFileForImport = null;

function showImportPanel(fileId, fileName) {
    selectedFileForImport = {
        file_id: fileId,
        display_name: fileName
    };

    const importPanel = document.getElementById('importPanel');
    importPanel.style.display = 'block';

    // 스토어 목록 로드
    const storeSelect = document.getElementById('storeSelectForImport');
    storeSelect.innerHTML = '<option value="">FileStore 선택...</option>';

    state.stores.forEach(store => {
        const option = document.createElement('option');
        option.value = store.store_name;
        option.textContent = store.display_name;
        storeSelect.appendChild(option);
    });
}

function cancelImportPanel() {
    document.getElementById('importPanel').style.display = 'none';
    selectedFileForImport = null;
}

async function confirmImportFile() {
    if (!selectedFileForImport) {
        showToast('선택한 파일이 없습니다', 'error');
        return;
    }

    const storeName = document.getElementById('storeSelectForImport').value;
    if (!storeName) {
        showToast('FileStore를 선택하세요', 'error');
        return;
    }

    const importStatus = document.getElementById('importStatus');
    importStatus.innerHTML = '<div class="loading" style="display: flex; align-items: center; gap: 10px;"><div class="spinner"></div><span>파일을 옮기는 중...</span></div>';

    try {
        const response = await fetch('/api/files/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                file_id: selectedFileForImport.file_id,
                store_name: storeName
            })
        });

        const data = await response.json();

        if (data.success) {
            showToast(`${selectedFileForImport.display_name}이(가) FileStore로 옮겨졌습니다`, 'success');
            importStatus.innerHTML = `<div class="success-message">✅ 옮기기 완료</div>`;

            setTimeout(() => {
                document.getElementById('importPanel').style.display = 'none';
                loadStores();
                selectedFileForImport = null;
            }, 2000);
        } else {
            showToast(`옮기기 실패: ${data.error || 'Unknown error'}`, 'error');
            importStatus.innerHTML = `<div class="error-message">❌ 실패: ${data.error}</div>`;
        }
    } catch (error) {
        showToast(`에러: ${error.message}`, 'error');
        importStatus.innerHTML = `<div class="error-message">❌ 에러: ${error.message}</div>`;
    }
}

// ============================================================================
// FileStore 문서 조회
// ============================================================================
async function showStoreDocuments(storeName, displayName) {
    const storesContainer = document.getElementById('storesList');

    try {
        const response = await fetch(`/api/stores/${encodeURIComponent(storeName)}/documents`);
        const data = await response.json();

        if (data.success) {
            const documents = data.documents || [];
            const documentCount = data.count || 0;

            // Store 카드 업데이트 - 파일 수 표시
            const fileCountElement = document.querySelector(`.file-count-${storeName.replace(/\//g, '-')}`);
            if (fileCountElement) {
                fileCountElement.textContent = `${documentCount}개`;
            }

            // 문서 목록 표시
            const documentListHtml = documents.length > 0
                ? `
                    <div class="store-documents">
                        <h4>저장된 문서 (${documentCount}개)</h4>
                        <ul class="document-list">
                            ${documents.map(doc => `
                                <li class="document-item">
                                    <span class="doc-name">${doc.display_name || 'Untitled'}</span>
                                    <span class="doc-type">${doc.mime_type || 'Unknown'}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                `
                : '<p class="empty-message">저장된 문서가 없습니다</p>';

            // Store 카드를 확장된 뷰로 변경
            storesContainer.innerHTML = `
                <div class="store-detail-view">
                    <button class="btn btn-secondary" onclick="loadStores()">← 돌아가기</button>
                    <h3>${displayName}</h3>
                    ${documentListHtml}
                </div>
            `;

            showToast(`${displayName}의 문서 목록을 불러왔습니다`, 'success');
        } else {
            showToast(`문서 목록 불러오기 실패: ${data.error}`, 'error');
        }
    } catch (error) {
        showToast(`에러: ${error.message}`, 'error');
    }
}

// ============================================================================
// 유틸리티
// ============================================================================
function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
