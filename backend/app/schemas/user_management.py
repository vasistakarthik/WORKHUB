
from typing import Literal
from pydantic import BaseModel, EmailStr, Field


class UserCreateSchema(BaseModel):
    name: str = Field(
        ...,
        min_length=2,
        max_length=100
    )

    email: EmailStr

    role: Literal[
        "manager",
        "lead",
        "employee"
    ] = "employee"


class UserUpdateSchema(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=100
    )

    role: Literal[
        "manager",
        "lead",
        "employee"
    ] | None = None


class UserStatusUpdateSchema(BaseModel):
    status: Literal[
        "active",
        "inactive"
    ]


class UserResponseSchema(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
