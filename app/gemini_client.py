"""
Gemini Client using the new google.genai SDK
Implements FileSearchStore API for document search and retrieval
"""
import google.genai as genai
from google.genai import types
from typing import Optional, List, Dict, Any
import os
from pathlib import Path
from app.logger import get_logger


class GeminiClient:
    """Client for interacting with Gemini API using google.genai SDK"""

    def __init__(self, api_key: str):
        """
        Initialize Gemini client with API key

        Args:
            api_key: Google AI API key for authentication
        """
        self.api_key = api_key
        self.logger = get_logger()

        # Configure the client with API key
        self.client = genai.Client(api_key=api_key)
        self.logger.info("GeminiClient initialized successfully")


    # ==================== FileSearchStore Methods ====================

    def create_file_search_store(self, display_name: str) -> Dict[str, Any]:
        """
        Create a new FileSearchStore

        Args:
            display_name: Display name for the store

        Returns:
            Dict with success status and store information
        """
        try:
            self.logger.info(f"Creating FileSearchStore with display_name: {display_name}")

            store = self.client.file_search_stores.create(
                config={'display_name': display_name}
            )

            self.logger.info(f"FileSearchStore created successfully: {store.name}")
            return {
                "success": True,
                "store_name": store.name,
                "display_name": store.display_name,
                "create_time": str(store.create_time) if hasattr(store, 'create_time') else None,
                "update_time": str(store.update_time) if hasattr(store, 'update_time') else None
            }
        except Exception as e:
            self.logger.error(f"Error creating FileSearchStore: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    def list_file_search_stores(self) -> Dict[str, Any]:
        """
        List all FileSearchStores

        Returns:
            Dict with success status and list of stores
        """
        try:
            self.logger.info("Listing all FileSearchStores")

            stores = self.client.file_search_stores.list()
            store_list = []

            for store in stores:
                store_info = {
                    "store_name": store.name,
                    "display_name": store.display_name,
                    "create_time": str(store.create_time) if hasattr(store, 'create_time') else None,
                    "update_time": str(store.update_time) if hasattr(store, 'update_time') else None,
                    "active_documents_count": int(store.active_documents_count) if (hasattr(store, 'active_documents_count') and store.active_documents_count is not None) else 0,
                    "pending_documents_count": int(store.pending_documents_count) if (hasattr(store, 'pending_documents_count') and store.pending_documents_count is not None) else 0,
                    "failed_documents_count": int(store.failed_documents_count) if (hasattr(store, 'failed_documents_count') and store.failed_documents_count is not None) else 0,
                    "size_bytes": int(store.size_bytes) if (hasattr(store, 'size_bytes') and store.size_bytes is not None) else 0
                }
                store_list.append(store_info)

            self.logger.info(f"Found {len(store_list)} FileSearchStores")
            return {
                "success": True,
                "stores": store_list,
                "count": len(store_list)
            }
        except Exception as e:
            self.logger.error(f"Error listing FileSearchStores: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "stores": []
            }

    def get_file_search_store(self, store_name: str) -> Dict[str, Any]:
        """
        Get a specific FileSearchStore by name

        Args:
            store_name: Name of the store to retrieve

        Returns:
            Dict with success status and store information
        """
        try:
            self.logger.info(f"Getting FileSearchStore: {store_name}")

            store = self.client.file_search_stores.get(name=store_name)

            self.logger.info(f"FileSearchStore retrieved successfully: {store_name}")
            return {
                "success": True,
                "store_name": store.name,
                "display_name": store.display_name,
                "create_time": str(store.create_time) if hasattr(store, 'create_time') else None,
                "update_time": str(store.update_time) if hasattr(store, 'update_time') else None,
                "active_documents_count": int(store.active_documents_count) if (hasattr(store, 'active_documents_count') and store.active_documents_count is not None) else 0,
                "pending_documents_count": int(store.pending_documents_count) if (hasattr(store, 'pending_documents_count') and store.pending_documents_count is not None) else 0,
                "failed_documents_count": int(store.failed_documents_count) if (hasattr(store, 'failed_documents_count') and store.failed_documents_count is not None) else 0,
                "size_bytes": int(store.size_bytes) if (hasattr(store, 'size_bytes') and store.size_bytes is not None) else 0
            }
        except Exception as e:
            self.logger.error(f"Error getting FileSearchStore {store_name}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    def delete_file_search_store(self, store_name: str) -> Dict[str, Any]:
        """
        Delete a FileSearchStore

        Args:
            store_name: Name of the store to delete

        Returns:
            Dict with success status
        """
        try:
            self.logger.info(f"Deleting FileSearchStore: {store_name}")

            self.client.file_search_stores.delete(name=store_name)

            self.logger.info(f"FileSearchStore deleted successfully: {store_name}")
            return {
                "success": True,
                "message": f"FileSearchStore {store_name} deleted successfully"
            }
        except Exception as e:
            self.logger.error(f"Error deleting FileSearchStore {store_name}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    def list_documents_in_store(self, store_name: str, page_size: int = 10) -> Dict[str, Any]:
        """
        List all documents in a FileSearchStore

        Args:
            store_name: Name of the FileSearchStore
            page_size: Maximum documents per page (default: 10, max: 20)

        Returns:
            Dict with success status and list of documents
        """
        try:
            self.logger.info(f"Listing documents in FileSearchStore: {store_name}")

            documents = self.client.file_search_stores.documents.list(
                parent=store_name,
                page_size=page_size
            )

            document_list = []
            for doc in documents:
                doc_info = {
                    "document_name": doc.name if hasattr(doc, 'name') else None,
                    "display_name": doc.display_name if hasattr(doc, 'display_name') else None,
                    "mime_type": doc.mime_type if hasattr(doc, 'mime_type') else None,
                    "create_time": str(doc.create_time) if hasattr(doc, 'create_time') else None,
                    "update_time": str(doc.update_time) if hasattr(doc, 'update_time') else None,
                    "size_bytes": doc.size_bytes if hasattr(doc, 'size_bytes') else None,
                }
                document_list.append(doc_info)

            self.logger.info(f"Found {len(document_list)} documents in store {store_name}")
            return {
                "success": True,
                "documents": document_list,
                "count": len(document_list),
                "store_name": store_name
            }
        except Exception as e:
            self.logger.error(f"Error listing documents in store {store_name}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "documents": []
            }

    # ==================== File Management Methods ====================

    def upload_file(self, file_path: str) -> Dict[str, Any]:
        """
        Upload a file to Files API

        Args:
            file_path: Path to the file to upload

        Returns:
            Dict with success status and file information
        """
        try:
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                self.logger.error(f"File not found: {file_path}")
                return {
                    "success": False,
                    "error": f"File not found: {file_path}"
                }

            self.logger.info(f"Uploading file: {file_path}")

            # Upload file using Files API - pass file path as string
            uploaded_file = self.client.files.upload(
                file=file_path,
                config={'display_name': os.path.basename(file_path)}
            )

            self.logger.info(f"File uploaded successfully: {uploaded_file.name}")
            return {
                "success": True,
                "file_id": uploaded_file.name,
                "display_name": uploaded_file.display_name,
                "mime_type": uploaded_file.mime_type if hasattr(uploaded_file, 'mime_type') else None,
                "size_bytes": uploaded_file.size_bytes if hasattr(uploaded_file, 'size_bytes') else None,
                "create_time": str(uploaded_file.create_time) if hasattr(uploaded_file, 'create_time') else None,
                "update_time": str(uploaded_file.update_time) if hasattr(uploaded_file, 'update_time') else None,
                "uri": uploaded_file.uri if hasattr(uploaded_file, 'uri') else None
            }
        except Exception as e:
            self.logger.error(f"Error uploading file {file_path}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    def import_file_to_store(self, file_id: str, store_name: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Import a file from Files API to a FileSearchStore

        Args:
            file_id: ID of the file to import (from Files API)
            store_name: Name of the target FileSearchStore
            metadata: Optional metadata for the file

        Returns:
            Dict with success status
        """
        try:
            self.logger.info(f"Importing file {file_id} to store {store_name}")

            # Import file to the store
            if metadata:
                result = self.client.file_search_stores.import_file(
                    store_name=store_name,
                    file_id=file_id,
                    metadata=metadata
                )
            else:
                result = self.client.file_search_stores.import_file(
                    store_name=store_name,
                    file_id=file_id
                )

            self.logger.info(f"File imported successfully to store {store_name}")
            return {
                "success": True,
                "file_id": file_id,
                "store_name": store_name,
                "message": "File imported successfully"
            }
        except Exception as e:
            self.logger.error(f"Error importing file {file_id} to store {store_name}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    def upload_and_import_to_store(self, file_path: str, store_name: str, display_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload a file and directly import it to a FileSearchStore

        Args:
            file_path: Path to the file to upload
            store_name: Name of the target FileSearchStore
            display_name: Optional display name for the file

        Returns:
            Dict with success status and file information
        """
        try:
            file_path_obj = Path(file_path)
            if not file_path_obj.exists():
                self.logger.error(f"File not found: {file_path}")
                return {
                    "success": False,
                    "error": f"File not found: {file_path}"
                }

            self.logger.info(f"Uploading and importing file {file_path} to store {store_name}")

            # Upload and import in one step - pass file path as string
            operation = self.client.file_search_stores.upload_to_file_search_store(
                file=file_path,
                file_search_store_name=store_name,
                config={'display_name': display_name or os.path.basename(file_path)}
            )

            self.logger.info(f"File uploaded and imported successfully to store {store_name}")
            return {
                "success": True,
                "store_name": store_name,
                "file_path": file_path,
                "message": "File uploaded and imported successfully"
            }
        except Exception as e:
            self.logger.error(f"Error uploading and importing file {file_path} to store {store_name}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    def delete_file(self, file_id: str) -> Dict[str, Any]:
        """
        Delete a file from Files API

        Args:
            file_id: ID of the file to delete

        Returns:
            Dict with success status
        """
        try:
            self.logger.info(f"Deleting file: {file_id}")

            self.client.files.delete(name=file_id)

            self.logger.info(f"File deleted successfully: {file_id}")
            return {
                "success": True,
                "file_id": file_id,
                "message": f"File {file_id} deleted successfully"
            }
        except Exception as e:
            self.logger.error(f"Error deleting file {file_id}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    def list_files(self) -> Dict[str, Any]:
        """
        List all uploaded files

        Returns:
            Dict with success status and list of files
        """
        try:
            self.logger.info("Listing all files")

            files = self.client.files.list()
            file_list = []

            for file in files:
                file_info = {
                    "file_id": file.name,
                    "display_name": file.display_name,
                    "mime_type": file.mime_type if hasattr(file, 'mime_type') else None,
                    "size_bytes": file.size_bytes if hasattr(file, 'size_bytes') else None,
                    "create_time": str(file.create_time) if hasattr(file, 'create_time') else None,
                    "update_time": str(file.update_time) if hasattr(file, 'update_time') else None,
                    "uri": file.uri if hasattr(file, 'uri') else None
                }
                file_list.append(file_info)

            self.logger.info(f"Found {len(file_list)} files")
            return {
                "success": True,
                "files": file_list,
                "count": len(file_list)
            }
        except Exception as e:
            self.logger.error(f"Error listing files: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "files": []
            }

    def get_file(self, file_id: str) -> Dict[str, Any]:
        """
        Get information about a specific file

        Args:
            file_id: ID of the file to retrieve

        Returns:
            Dict with success status and file information
        """
        try:
            self.logger.info(f"Getting file info: {file_id}")

            file = self.client.files.get(name=file_id)

            self.logger.info(f"File info retrieved successfully: {file_id}")
            return {
                "success": True,
                "file_id": file.name,
                "display_name": file.display_name,
                "mime_type": file.mime_type if hasattr(file, 'mime_type') else None,
                "size_bytes": file.size_bytes if hasattr(file, 'size_bytes') else None,
                "create_time": str(file.create_time) if hasattr(file, 'create_time') else None,
                "update_time": str(file.update_time) if hasattr(file, 'update_time') else None,
                "uri": file.uri if hasattr(file, 'uri') else None,
                "state": file.state.name if hasattr(file, 'state') else None
            }
        except Exception as e:
            self.logger.error(f"Error getting file {file_id}: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e)
            }

    # ==================== Search Methods ====================

    def search_with_file_search(
        self,
        query: str,
        store_names: List[str],
        metadata_filter: Optional[Dict[str, Any]] = None,
        model: str = "gemini-2.5-flash"
    ) -> Dict[str, Any]:
        """
        Search using FileSearch tool with specified stores

        Args:
            query: Search query
            store_names: List of FileSearchStore names to search in
            metadata_filter: Optional metadata filter for search
            model: Model to use for search (default: gemini-2.5-flash)

        Returns:
            Dict with success status and search results
        """
        try:
            self.logger.info(f"Searching with FileSearch in stores: {store_names}")
            self.logger.debug(f"Query: {query}")
            self.logger.debug(f"Metadata filter: {metadata_filter}")

            # Generate content with FileSearch tool
            response = self.client.models.generate_content(
                model=model,
                contents=query,
                config=types.GenerateContentConfig(
                    tools=[
                        dict(
                            file_search=dict(
                                file_search_store_names=store_names
                            )
                        )
                    ]
                )
            )

            # Extract text from response
            result_text = response.text if hasattr(response, 'text') else str(response)

            self.logger.info(f"Search completed successfully")
            self.logger.debug(f"Result length: {len(result_text)} characters")

            return {
                "success": True,
                "query": query,
                "result": result_text,
                "stores_searched": store_names,
                "model": model
            }
        except Exception as e:
            self.logger.error(f"Error in FileSearch: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "query": query
            }

    def search_with_grounding(
        self,
        query: str,
        store_names: List[str],
        model: str = "gemini-2.5-flash"
    ) -> Dict[str, Any]:
        """
        Search using grounding with FileSearchStores

        Args:
            query: Search query
            store_names: List of FileSearchStore names for grounding
            model: Model to use for search (default: gemini-2.5-flash)

        Returns:
            Dict with success status and search results with grounding metadata
        """
        try:
            self.logger.info(f"Searching with grounding in stores: {store_names}")
            self.logger.debug(f"Query: {query}")

            # Generate content with grounding
            response = self.client.models.generate_content(
                model=model,
                contents=query,
                config=types.GenerateContentConfig(
                    tools=[
                        dict(
                            file_search=dict(
                                file_search_store_names=store_names
                            )
                        )
                    ]
                )
            )

            result_text = response.text if hasattr(response, 'text') else str(response)

            # Extract grounding metadata if available
            grounding_metadata = None
            if hasattr(response, 'grounding_metadata'):
                grounding_metadata = str(response.grounding_metadata)

            self.logger.info(f"Grounding search completed successfully")

            return {
                "success": True,
                "query": query,
                "result": result_text,
                "stores_searched": store_names,
                "grounding_metadata": grounding_metadata,
                "model": model
            }
        except Exception as e:
            self.logger.error(f"Error in grounding search: {str(e)}", exc_info=True)
            return {
                "success": False,
                "error": str(e),
                "query": query
            }
