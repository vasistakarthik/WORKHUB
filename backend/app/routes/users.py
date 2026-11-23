
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user

from app.schemas.user_management import (
    UserCreateSchema,
    UserUpdateSchema,
    UserStatusUpdateSchema,
)

from app.repositories.user_management_repository import (
    create_user,
    get_all_users,
    get_user_by_id,
    update_user,
    update_user_status,
    delete_user,
)


router = APIRouter(
    prefix="/users",
    tags=["User Management"]
)


# MANAGER-ONLY ACCESS
def get_current_manager(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "manager":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Managers can manage users."
        )

    return current_user


# 1. CREATE USER
@router.post("", status_code=status.HTTP_201_CREATED)
def add_user(
    user: UserCreateSchema,
    current_user: dict = Depends(get_current_manager)
):
    try:
        return create_user(
            user.model_dump(),
            current_user
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


# 2. GET ALL USERS
@router.get("")
def list_users(
    current_user: dict = Depends(get_current_manager)
):
    return get_all_users(current_user["tenant_id"])


# 3. GET USER BY ID
@router.get("/{user_id}")
def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_manager)
):
    user = get_user_by_id(
        user_id,
        current_user["tenant_id"]
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    return user


# 4. UPDATE USER
@router.put("/{user_id}")
def edit_user(
    user_id: str,
    user: UserUpdateSchema,
    current_user: dict = Depends(get_current_manager)
):
    try:
        updated_user = update_user(
            user_id,
            current_user["tenant_id"],
            user.model_dump(exclude_unset=True)
        )

        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )

        return updated_user

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


# 5. UPDATE USER STATUS
@router.patch("/{user_id}/status")
def change_user_status(
    user_id: str,
    user: UserStatusUpdateSchema,
    current_user: dict = Depends(get_current_manager)
):
    updated_user = update_user_status(
        user_id,
        current_user["tenant_id"],
        user.status
    )

    if not updated_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    return updated_user


# 6. DELETE USER
@router.delete("/{user_id}")
def remove_user(
    user_id: str,
    current_user: dict = Depends(get_current_manager)
):
    deleted = delete_user(
        user_id,
        current_user["tenant_id"]
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    return {
        "message": "User deleted successfully."
    }
