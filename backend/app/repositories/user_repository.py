from app.db.collections import users_collection
from app.schemas.user import UserSchema
from bson import ObjectId


def create_user(user: UserSchema):
    """Create a new WorkHub user."""

    user_data = user.model_dump(mode="json")

    result = users_collection.insert_one(user_data)

    return str(result.inserted_id)


def get_user_by_microsoft_id(tenant_id: str, microsoft_oid: str):
    """Find a user using their Microsoft identity."""

    user = users_collection.find_one({
        "tenant_id": tenant_id,
        "microsoft_oid": microsoft_oid
    })

    if user:
        user["_id"] = str(user["_id"])

    return user


def get_user_by_id(user_id: str):
    """Find a WorkHub user using their MongoDB ID."""

    if not ObjectId.is_valid(user_id):
        return None

    user = users_collection.find_one({
        "_id": ObjectId(user_id)
    })

    if user:
        user["_id"] = str(user["_id"])

    return user


def update_user_role(user_id: str, new_role: str):
    """Update a user's assigned role."""

    if not ObjectId.is_valid(user_id):
        return False

    result = users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"role": new_role}}
    )

    return result.modified_count > 0