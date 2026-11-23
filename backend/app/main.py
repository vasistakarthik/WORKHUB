
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db.connection import test_database_connection
from app.db.collections import initialize_collections

from app.routes.auth import router as auth_router
from app.routes.projects import router as projects_router
from app.routes.users import router as users_router

app = FastAPI(
    title="WorkHub API",
    description="Backend API for WorkHub",
    version="1.0.0"
)


# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register routes
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(users_router)

@app.on_event("startup")
def startup_event():
    if test_database_connection():
        initialize_collections()


@app.get("/")
def home():
    return {
        "message": "Welcome to WorkHub API",
        "status": "running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }
