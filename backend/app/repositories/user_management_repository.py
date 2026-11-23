
from datetime import datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.db.collections import users_collection


def create_user(user_data: dict, current_user: dict):
    """
    Create a new WorkHub user.
    """

    email = user_data["email"].strip().lower()

    existing_user = users_collection.find_one({
        "tenant_id": current_user["tenant_id"],
        "email": email
    })

    if existing_user:
        raise ValueError("A user with this email already exists.")

    now = datetime.now(timezone.utc)

    user = {
        "tenant_id": current_user["tenant_id"],
        "microsoft_oid": None,
        "name": user_data["name"].strip(),
        "email": email,
        "role": user_data["role"],
        "status": "active",
        "created_at": now,
        "updated_at": now
    }

    try:
        result = users_collection.insert_one(user)
    except DuplicateKeyError:
        raise ValueError("This user already exists.")

    user["id"] = str(result.inserted_id)
    user.pop("_id", None)

    return user


def get_all_users(tenant_id: str):
    """
    Retrieve all users belonging to an organization.
    """

    users = users_collection.find({
        "tenant_id": tenant_id
    }).sort("created_at", -1)

    result = []

    for user in users:
        result.append({
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "employee"),
            "status": user.get("status", "active"),
            "created_at": user.get("created_at")
        })

    return result


def get_user_by_id(user_id: str, tenant_id: str):
    """
    Retrieve one user using MongoDB ObjectId.
    """

    if not ObjectId.is_valid(user_id):
        return None

    user = users_collection.find_one({
        "_id": ObjectId(user_id),
        "tenant_id": tenant_id
    })

    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "employee"),
        "status": user.get("status", "active")
    }


def update_user(user_id: str, tenant_id: str, user_data: dict):
    """
    Update user name and role.
    """

    if not ObjectId.is_valid(user_id):
        return None

    update_data = {
        key: value
        for key, value in user_data.items()
        if value is not None
    }

    if not update_data:
        raise ValueError("No user details provided for update.")

    if "name" in update_data:
        update_data["name"] = update_data["name"].strip()

    update_data["updated_at"] = datetime.now(timezone.utc)

    user = users_collection.find_one_and_update(
        {
            "_id": ObjectId(user_id),
            "tenant_id": tenant_id
        },
        {
            "$set": update_data
        },
        return_document=True
    )

    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "employee"),
        "status": user.get("status", "active")
    }


def update_user_status(
    user_id: str,
    tenant_id: str,
    status: str
):
    """
    Activate or deactivate a user.
    """

    if not ObjectId.is_valid(user_id):
        return None

    user = users_collection.find_one_and_update(
        {
            "_id": ObjectId(user_id),
            "tenant_id": tenant_id
        },
        {
            "$set": {
                "status": status,
                "updated_at": datetime.now(timezone.utc)
            }
        },
        return_document=True
    )

    if not user:
        return None

    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", "employee"),
        "status": user.get("status", "active")
    }


def delete_user(user_id: str, tenant_id: str):
    """
    Delete a user from the organization.
    """

    if not ObjectId.is_valid(user_id):
        return False

    result = users_collection.delete_one({
        "_id": ObjectId(user_id),
        "tenant_id": tenant_id
    })

    return result.deleted_count > 0
