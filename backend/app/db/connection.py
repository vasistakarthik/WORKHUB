import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Read MongoDB configuration
MONGODB_URL = os.getenv("MONGODB_URL")
DATABASE_NAME = os.getenv("DATABASE_NAME")

# Validate configuration
if not MONGODB_URL:
    raise ValueError("MONGODB_URL is missing in .env")

if not DATABASE_NAME:
    raise ValueError("DATABASE_NAME is missing in .env")

# Create MongoDB client
client = MongoClient(
    MONGODB_URL,
    serverSelectionTimeoutMS=5000
)

# Select database
database = client[DATABASE_NAME]


def test_database_connection():
    try:
        client.admin.command("ping")
        print("MongoDB connected successfully!")
        return True

    except Exception as error:
        print("MongoDB connection failed:", error)
        return False