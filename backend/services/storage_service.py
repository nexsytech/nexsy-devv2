"""
Cloud Storage service for file upload and management
"""
import os
import uuid
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any, BinaryIO, List
from google.cloud import storage
from fastapi import HTTPException, status, UploadFile
import mimetypes

logger = logging.getLogger(__name__)

class StorageService:
    """Service for Google Cloud Storage operations"""

    # Class-level defaults to avoid attribute errors during hot-reload
    max_file_size = 500 * 1024 * 1024
    max_image_size = 10 * 1024 * 1024
    allowed_image_types = {'image/jpeg', 'image/jpg', 'image/png', 'image/webp'}
    allowed_video_types = {'video/mp4', 'video/webm', 'video/mov'}
    allowed_document_types = {'application/pdf', 'text/plain', 'application/json'}

    def __init__(self):
        self.client = storage.Client()
        self.project_id = os.getenv('GCP_PROJECT_ID', 'nexsy-authv1')

        # Normalize environment (map common values -> dev/test/prod)
        env_raw = os.getenv('ENVIRONMENT', 'dev').strip().lower()
        env_map = {
            'development': 'dev',
            'dev': 'dev',
            'staging': 'staging',
            'test': 'test',
            'production': 'prod',
            'prod': 'prod'
        }
        self.environment = env_map.get(env_raw, env_raw)

        # Allow explicit bucket override via env vars
        self.assets_bucket_name = os.getenv('ASSETS_BUCKET')
        self.generated_bucket_name = os.getenv('GENERATED_BUCKET')
        self.templates_bucket_name = os.getenv('TEMPLATES_BUCKET')
        self.reports_bucket_name = os.getenv('REPORTS_BUCKET')

        # Bucket name prefixes (Terraform adds random suffix) for auto-discovery
        self.assets_bucket_prefix = f"nexsy-assets-{self.environment}-"
        self.generated_bucket_prefix = f"nexsy-generated-{self.environment}-"
        self.templates_bucket_prefix = f"nexsy-templates-{self.environment}-"
        self.reports_bucket_prefix = f"nexsy-reports-{self.environment}-"

        # Instance-level copies (shadow class defaults for clarity)
        self.max_file_size = StorageService.max_file_size
        self.max_image_size = StorageService.max_image_size
        self.allowed_image_types = StorageService.allowed_image_types
        self.allowed_video_types = StorageService.allowed_video_types
        self.allowed_document_types = StorageService.allowed_document_types

    def _resolve_bucket_name(self, prefix: str) -> str:
        """Resolve a bucket name by prefix (handles random suffix)."""
        try:
            # Prefer gcloud listed names via API client
            for bucket in self.client.list_buckets(project=self.project_id):
                name = getattr(bucket, 'name', str(bucket))
                if name and name.startswith(prefix):
                    return name
        except Exception as e:
            logger.error(f"Error listing buckets in project {self.project_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"No bucket found matching prefix {prefix} in project {self.project_id}"
        )
        
        # File type limits
        self.max_file_size = 500 * 1024 * 1024  # 500MB
        self.max_image_size = 10 * 1024 * 1024   # 10MB
        self.allowed_image_types = {'image/jpeg', 'image/jpg', 'image/png', 'image/webp'}
        self.allowed_video_types = {'video/mp4', 'video/webm', 'video/mov'}
        self.allowed_document_types = {'application/pdf', 'text/plain', 'application/json'}
    
    def _get_bucket(self, bucket_type: str) -> storage.Bucket:
        """Get bucket by type"""
        # Resolve and cache bucket names lazily (skip if explicitly set via env)
        if not self.assets_bucket_name:
            self.assets_bucket_name = self._resolve_bucket_name(self.assets_bucket_prefix)
            logger.info(f"Resolved assets bucket: {self.assets_bucket_name}")
        if not self.generated_bucket_name:
            self.generated_bucket_name = self._resolve_bucket_name(self.generated_bucket_prefix)
            logger.info(f"Resolved generated bucket: {self.generated_bucket_name}")
        if not self.templates_bucket_name:
            self.templates_bucket_name = self._resolve_bucket_name(self.templates_bucket_prefix)
            logger.info(f"Resolved templates bucket: {self.templates_bucket_name}")
        if not self.reports_bucket_name:
            self.reports_bucket_name = self._resolve_bucket_name(self.reports_bucket_prefix)
            logger.info(f"Resolved reports bucket: {self.reports_bucket_name}")

        bucket_names = {
            'assets': self.assets_bucket_name,
            'generated': self.generated_bucket_name,
            'templates': self.templates_bucket_name,
            'reports': self.reports_bucket_name
        }
        
        bucket_name = bucket_names.get(bucket_type)
        if not bucket_name:
            raise ValueError(f"Invalid bucket type: {bucket_type}")
        
        return self.client.bucket(bucket_name)
    
    def _validate_file(self, file: UploadFile, file_type: str) -> None:
        """Validate file type and size"""
        if not file.content_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File content type could not be determined"
            )
        
        # Check file size
        if hasattr(file.file, 'seek') and hasattr(file.file, 'tell'):
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Reset to beginning
            
            max_size = self.max_image_size if file_type == 'image' else self.max_file_size
            if file_size > max_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File size exceeds maximum allowed size of {max_size / (1024*1024):.1f}MB"
                )
        
        # Check file type
        if file_type == 'image' and file.content_type not in self.allowed_image_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid image type. Allowed types: {', '.join(self.allowed_image_types)}"
            )
        elif file_type == 'video' and file.content_type not in self.allowed_video_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid video type. Allowed types: {', '.join(self.allowed_video_types)}"
            )
        elif file_type == 'document' and file.content_type not in self.allowed_document_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid document type. Allowed types: {', '.join(self.allowed_document_types)}"
            )
    
    def _generate_file_path(self, user_id: str, file_type: str, product_id: Optional[str] = None, 
                          original_filename: Optional[str] = None) -> str:
        """Generate secure file path with user isolation"""
        # Create unique filename
        file_extension = ""
        if original_filename:
            _, file_extension = os.path.splitext(original_filename)
        
        unique_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{unique_id}{file_extension}"
        
        # Create path based on type and context
        if product_id:
            path = f"users/{user_id}/products/{product_id}/{file_type}s/{filename}"
        else:
            path = f"users/{user_id}/uploads/{file_type}s/{filename}"
        
        return path
    
    async def upload_file(self, file: UploadFile, user_id: str, file_type: str = "image", 
                         product_id: Optional[str] = None, 
                         bucket_type: str = "assets") -> Dict[str, Any]:
        """
        Upload a file to Cloud Storage
        
        Args:
            file: FastAPI UploadFile object
            user_id: ID of the user uploading the file
            file_type: Type of file (image, video, document)
            product_id: Optional product ID for organizing files
            bucket_type: Type of bucket (assets, generated, templates, reports)
            
        Returns:
            dict: Information about the uploaded file
        """
        try:
            # Validate file
            self._validate_file(file, file_type)
            
            # Generate secure file path
            file_path = self._generate_file_path(user_id, file_type, product_id, file.filename)
            
            # Get bucket
            bucket = self._get_bucket(bucket_type)
            blob = bucket.blob(file_path)
            
            # Set metadata
            blob.metadata = {
                "user_id": user_id,
                "file_type": file_type,
                "original_filename": file.filename or "unknown",
                "upload_timestamp": datetime.utcnow().isoformat(),
                "product_id": product_id or ""
            }
            
            # Set content type
            blob.content_type = file.content_type
            
            # Upload file
            blob.upload_from_file(file.file, content_type=file.content_type)
            
            # Get file info (no signed URL here; proxy download endpoint will be used)
            file_info = {
                "file_path": file_path,
                "bucket_name": bucket.name,
                "file_name": file.filename,
                "file_size": blob.size,
                "content_type": file.content_type,
                "uploaded_at": datetime.utcnow().isoformat(),
                "public_url": f"gs://{bucket.name}/{file_path}"
            }
            
            logger.info(f"Successfully uploaded file {file_path} for user {user_id}")
            return file_info
            
        except Exception as e:
            logger.error(f"Error uploading file for user {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"File upload failed: {str(e)}"
            )
    
    async def upload_generated_content(self, content: bytes, user_id: str, product_id: str,
                                     content_type: str, file_extension: str, 
                                     content_category: str = "ai_generated") -> Dict[str, Any]:
        """
        Upload AI-generated content to Cloud Storage
        
        Args:
            content: Binary content to upload
            user_id: ID of the user
            product_id: ID of the associated product
            content_type: MIME type of the content
            file_extension: File extension (e.g., '.png', '.mp4')
            content_category: Category of generated content
            
        Returns:
            dict: Information about the uploaded content
        """
        try:
            # Generate file path for generated content
            timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
            unique_id = str(uuid.uuid4())
            filename = f"{content_category}_{timestamp}_{unique_id}{file_extension}"
            file_path = f"users/{user_id}/products/{product_id}/generated/{filename}"
            
            # Get generated content bucket
            bucket = self._get_bucket('generated')
            blob = bucket.blob(file_path)
            
            # Set metadata
            blob.metadata = {
                "user_id": user_id,
                "product_id": product_id,
                "content_category": content_category,
                "generation_timestamp": datetime.utcnow().isoformat(),
                "source": "ai_generated"
            }
            
            # Set content type
            blob.content_type = content_type
            
            # Upload content
            blob.upload_from_string(content, content_type=content_type)
            
            # Generate signed URL
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(hours=24),
                method="GET"
            )
            
            file_info = {
                "file_url": signed_url,
                "file_path": file_path,
                "bucket_name": bucket.name,
                "file_size": len(content),
                "content_type": content_type,
                "generated_at": datetime.utcnow().isoformat(),
                "public_url": f"gs://{bucket.name}/{file_path}"
            }
            
            logger.info(f"Successfully uploaded generated content {file_path} for user {user_id}")
            return file_info
            
        except Exception as e:
            logger.error(f"Error uploading generated content for user {user_id}: {str(e)}")
            raise
    
    async def generate_signed_url(self, file_path: str, user_id: str, 
                                 expiration_hours: int = 24) -> str:
        """
        Generate a signed URL for secure file access
        
        Args:
            file_path: Path to the file in Cloud Storage
            user_id: ID of the user requesting access
            expiration_hours: Hours until the URL expires
            
        Returns:
            str: Signed URL for file access
        """
        try:
            # Validate user has access to this file
            if f"users/{user_id}/" not in file_path:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: File is outside your scope"
                )
            
            # Determine bucket based on file path
            if "/generated/" in file_path:
                bucket = self._get_bucket('generated')
            elif "/reports/" in file_path:
                bucket = self._get_bucket('reports')
            else:
                bucket = self._get_bucket('assets')
            
            blob = bucket.blob(file_path)
            
            # Check if file exists
            if not blob.exists():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="File not found"
                )
            
            # Generate signed URL
            signed_url = blob.generate_signed_url(
                version="v4",
                expiration=timedelta(hours=expiration_hours),
                method="GET"
            )
            
            return signed_url
            
        except Exception as e:
            logger.error(f"Error generating signed URL for {file_path}: {str(e)}")
            raise
    
    async def delete_file(self, file_path: str, user_id: str) -> bool:
        """
        Delete a file from Cloud Storage
        
        Args:
            file_path: Path to the file in Cloud Storage
            user_id: ID of the user requesting deletion
            
        Returns:
            bool: True if file was deleted successfully
        """
        try:
            # Validate user has access to this file
            if f"users/{user_id}/" not in file_path:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Access denied: File is outside your scope"
                )
            
            # Determine bucket
            if "/generated/" in file_path:
                bucket = self._get_bucket('generated')
            elif "/reports/" in file_path:
                bucket = self._get_bucket('reports')
            else:
                bucket = self._get_bucket('assets')
            
            blob = bucket.blob(file_path)
            
            # Delete file
            blob.delete()
            
            logger.info(f"Successfully deleted file {file_path} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting file {file_path} for user {user_id}: {str(e)}")
            raise
    
    async def list_user_files(self, user_id: str, bucket_type: str = "assets", 
                             prefix: str = "", limit: int = 100) -> List[Dict[str, Any]]:
        """
        List files for a user in a specific bucket
        
        Args:
            user_id: ID of the user
            bucket_type: Type of bucket to search
            prefix: Additional prefix to filter files
            limit: Maximum number of files to return
            
        Returns:
            List[dict]: List of file information
        """
        try:
            bucket = self._get_bucket(bucket_type)
            
            # Create user-scoped prefix
            user_prefix = f"users/{user_id}/"
            if prefix:
                user_prefix += prefix
            
            blobs = bucket.list_blobs(prefix=user_prefix, max_results=limit)
            
            files = []
            for blob in blobs:
                file_info = {
                    "file_path": blob.name,
                    "file_name": blob.name.split('/')[-1],
                    "file_size": blob.size,
                    "content_type": blob.content_type,
                    "created_at": blob.time_created.isoformat(),
                    "updated_at": blob.updated.isoformat(),
                    "metadata": blob.metadata or {}
                }
                files.append(file_info)
            
            return files
            
        except Exception as e:
            logger.error(f"Error listing files for user {user_id}: {str(e)}")
            raise
