
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user


from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user

from app.schemas.project import (
    ProjectCreateSchema,
    ProjectUpdateSchema,
    AddProjectMemberSchema,
    UpdateProjectMemberRoleSchema
)

from app.repositories.project_repository import (
    create_project,
    get_projects,
    get_project_by_id,
    get_available_users,
    update_project,
    delete_project,
    get_project_members,
    add_project_member,
    remove_project_member,
    update_project_member_role
)


router = APIRouter(
    prefix="/projects",
    tags=["Projects"]
)


@router.get("/available-users")
def list_available_users(
    current_user: dict = Depends(get_current_user)
):
    return get_available_users(current_user["tenant_id"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_new_project(
    project: ProjectCreateSchema,
    current_user: dict = Depends(get_current_user)
):
    try:
        return create_project(
            project.model_dump(),
            current_user
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.get("")
def list_projects(
    current_user: dict = Depends(get_current_user)
):
    return get_projects(current_user["tenant_id"])


@router.get("/{project_id}")
def project_details(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    project = get_project_by_id(
        project_id,
        current_user["tenant_id"]
    )

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )

    return project


@router.put("/{project_id}")
def edit_project(
    project_id: str,
    project: ProjectUpdateSchema,
    current_user: dict = Depends(get_current_user)
):
    try:
        updated_project = update_project(
            project_id,
            project.model_dump(exclude_unset=True),
            current_user
        )

        if not updated_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found."
            )

        return updated_project

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.delete("/{project_id}")
def remove_project(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    deleted = delete_project(
        project_id,
        current_user["tenant_id"]
    )

    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )

    return {
        "message": "Project deleted successfully."
    }

# =========================================
# PROJECT TEAM MANAGEMENT ROUTES
# =========================================

@router.get("/{project_id}/members")
def list_project_members(
    project_id: str,
    current_user: dict = Depends(get_current_user)
):
    members = get_project_members(
        project_id,
        current_user["tenant_id"]
    )

    if not members:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found."
        )

    return members


@router.post(
    "/{project_id}/members",
    status_code=status.HTTP_201_CREATED
)
def add_team_member(
    project_id: str,
    member: AddProjectMemberSchema,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = add_project_member(
            project_id,
            member.model_dump(),
            current_user
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found."
            )

        return result

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.delete("/{project_id}/members/{user_id}")
def delete_team_member(
    project_id: str,
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = remove_project_member(
            project_id,
            user_id,
            current_user
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found."
            )

        return {
            "message": "Team member removed successfully.",
            "team": result
        }

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )


@router.patch("/{project_id}/members/{user_id}")
def change_team_member_role(
    project_id: str,
    user_id: str,
    member: UpdateProjectMemberRoleSchema,
    current_user: dict = Depends(get_current_user)
):
    try:
        result = update_project_member_role(
            project_id,
            user_id,
            member.project_role,
            current_user
        )

        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found."
            )

        return result

    except PermissionError as error:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(error)
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error)
        )
