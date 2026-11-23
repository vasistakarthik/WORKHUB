from pydantic import BaseModel, Field
from app.core.roles import UserRole, UserStatus


class UserSchema(BaseModel):
    tenant_id: str = Field(..., description="Microsoft tenant ID")
    microsoft_oid: str = Field(..., description="Microsoft user object ID")
    name: str = Field(..., min_length=2)
    email: str
    role: UserRole
    status: UserStatus = UserStatus.ACTIVE


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: UserRole
    status: UserStatus