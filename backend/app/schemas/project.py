
from datetime import date
from typing import Literal

from pydantic import BaseModel, Field


class ProjectMemberInput(BaseModel):
    user_id: str
    project_role: str = "Developer"


class ProjectCreateSchema(BaseModel):
    project_name: str = Field(..., min_length=2, max_length=80)

    project_key: str = Field(
        ...,
        min_length=2,
        max_length=10,
        pattern=r"^[A-Z][A-Z0-9]{1,9}$"
    )

    category: str = "Software Development"

    description: str = Field(default="", max_length=500)

    template: Literal["scrum", "kanban", "basic"] = "scrum"

    project_lead_id: str

    team_members: list[ProjectMemberInput] = Field(
        default_factory=list
    )

    sprint_duration: int | None = Field(
        default=2,
        ge=1,
        le=4
    )

    access: Literal["Private", "Organization"] = "Private"

    start_date: date | None = None

class ProjectUpdateSchema(BaseModel):
    project_name: str | None = Field(
        default=None,
        min_length=2,
        max_length=80
    )

    category: str | None = None

    description: str | None = Field(
        default=None,
        max_length=500
    )

    template: Literal["scrum", "kanban", "basic"] | None = None

    project_lead_id: str | None = None

    team_members: list[ProjectMemberInput] | None = None

    sprint_duration: int | None = Field(
        default=None,
        ge=1,
        le=4
    )

    access: Literal["Private", "Organization"] | None = None

    start_date: date | None = None

class AddProjectMemberSchema(BaseModel):
    user_id: str = Field(..., min_length=1)
    project_role: str = Field(
        default="Developer",
        min_length=2,
        max_length=30
    )


class UpdateProjectMemberRoleSchema(BaseModel):
    project_role: str = Field(
        ...,
        min_length=2,
        max_length=30
    )
