#!/usr/bin/env python3
"""
Nexsy Backend Startup Script
"""
import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Get the directory where this script is located
    backend_dir = Path(__file__).parent
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    print("🚀 Starting Nexsy Backend API...")
    print("📝 API Documentation: http://localhost:8000/docs")
    print("🏥 Health Check: http://localhost:8000/health")
    print("⚡ Press Ctrl+C to stop")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
