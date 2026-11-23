
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.core.security import get_current_user
from app.core.password import verify_password
from app.db.collections import users_collection

router = APIRouter(prefix="/auth", tags=["Authentication"])


class PasswordVerificationRequest(BaseModel):
    password: str = Field(..., min_length=1)


# GET CURRENT USER PROFILE
@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)

    user_filter = {
        "tenant_id": current_user["tenant_id"],
        "microsoft_oid": current_user["microsoft_oid"],
    }

    # Create new users without overwriting existing WorkHub roles.
    users_collection.update_one(
        user_filter,
        {
            "$set": {
                "name": current_user["name"],
                "email": current_user["email"],
                "updated_at": now,
            },
            "$setOnInsert": {
                "role": "employee",
                "status": "active",
                "created_at": now,
            },
        },
        upsert=True,
    )

    user = users_collection.find_one(user_filter)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WorkHub user profile not found."
        )

    return {
        "authenticated": True,
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "tenant_id": user["tenant_id"],
        "microsoft_oid": user["microsoft_oid"],
        "status": user["status"],
    }


# VERIFY WORKHUB PASSWORD
@router.post("/verify-password")
def verify_workhub_password(
    request: PasswordVerificationRequest,
    current_user: dict = Depends(get_current_user),
):
    user = users_collection.find_one({
        "tenant_id": current_user["tenant_id"],
        "microsoft_oid": current_user["microsoft_oid"],
    })

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="WorkHub user account not found."
        )

    if user.get("status") != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your WorkHub account is inactive."
        )

    stored_hash = user.get("password_hash")

    if not stored_hash or not verify_password(
        request.password,
        stored_hash
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect WorkHub password."
        )

    return {
        "verified": True,
        "message": "WorkHub password verified successfully."
    }
