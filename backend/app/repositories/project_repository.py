
from datetime import date, datetime, timezone

from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.db.collections import projects_collection, users_collection


def get_user_by_id(user_id: str, tenant_id: str):
    if not ObjectId.is_valid(user_id):
        return None

    return users_collection.find_one({
        "_id": ObjectId(user_id),
        "tenant_id": tenant_id,
        "status": "active"
    })


def get_available_users(tenant_id: str):
    users = users_collection.find(
        {
            "tenant_id": tenant_id,
            "status": "active"
        },
        {
            "name": 1,
            "email": 1,
            "role": 1
        }
    ).sort("name", 1)

    return [
        {
            "id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "role": user.get("role", "employee")
        }
        for user in users
    ]


def create_project(project_data: dict, current_user: dict):
    tenant_id = current_user["tenant_id"]

    # Find authenticated creator
    creator = users_collection.find_one({
        "tenant_id": tenant_id,
        "microsoft_oid": current_user["microsoft_oid"],
        "status": "active"
    })

    if not creator:
        raise ValueError("Authenticated WorkHub user was not found.")

    # Validate project lead
    lead = get_user_by_id(
        project_data["project_lead_id"],
        tenant_id
    )

    if not lead:
        raise ValueError("Selected project lead was not found or is inactive.")

    if lead.get("role") not in ["manager", "lead"]:
        raise ValueError("Project lead must be a Manager or Lead.")

    # Validate and prepare team members
    members = []
    member_ids = set()

    for member in project_data.get("team_members", []):
        user_id = member["user_id"]

        if user_id == project_data["project_lead_id"]:
            continue

        if user_id in member_ids:
            raise ValueError("Duplicate team member selected.")

        user = get_user_by_id(user_id, tenant_id)

        if not user:
            raise ValueError(
                f"Team member {user_id} was not found or is inactive."
            )

        member_ids.add(user_id)

        members.append({
            "user_id": str(user["_id"]),
            "name": user.get("name", ""),
            "email": user.get("email", ""),
            "account_role": user.get("role", "employee"),
            "project_role": member.get("project_role", "Developer")
        })

    now = datetime.now(timezone.utc)

    project = {
        "tenant_id": tenant_id,

        "project_name": project_data["project_name"],
        "project_key": project_data["project_key"],
        "category": project_data.get("category", "Software Development"),
        "description": project_data.get("description", ""),

        "template": project_data["template"],

        "project_lead": {
            "user_id": str(lead["_id"]),
            "name": lead.get("name", ""),
            "email": lead.get("email", ""),
            "account_role": lead.get("role", "")
        },

        "team_members": members,

        "sprint_configuration": {
            "duration_weeks": project_data.get("sprint_duration"),
            "start_date": (
                project_data["start_date"].isoformat()
                if project_data.get("start_date")
                else None
            )
        } if project_data["template"] == "scrum" else None,

        "access": project_data["access"],

        "status": "active",

        "created_by": {
            "user_id": str(creator["_id"]),
            "name": creator.get("name", ""),
            "email": creator.get("email", "")
        },

        "created_at": now,
        "updated_at": now
    }

    try:
        result = projects_collection.insert_one(project)

    except DuplicateKeyError:
        raise ValueError(
            "This project key already exists. Please choose another key."
        )

    project["_id"] = str(result.inserted_id)

    return project


def get_projects(tenant_id: str):
    projects = projects_collection.find({
        "tenant_id": tenant_id
    }).sort("created_at", -1)

    result = []

    for project in projects:
        project["id"] = str(project.pop("_id"))
        project.pop("tenant_id", None)
        result.append(project)

    return result


def get_project_by_id(project_id: str, tenant_id: str):
    if not ObjectId.is_valid(project_id):
        return None

    project = projects_collection.find_one({
        "_id": ObjectId(project_id),
        "tenant_id": tenant_id
    })

    if not project:
        return None

    project["id"] = str(project.pop("_id"))
    project.pop("tenant_id", None)

    return project

# =========================================
# UPDATE PROJECT
# =========================================

def update_project(
    project_id: str,
    project_data: dict,
    current_user: dict
):
    tenant_id = current_user["tenant_id"]

    if not ObjectId.is_valid(project_id):
        return None

    existing_project = projects_collection.find_one({
        "_id": ObjectId(project_id),
        "tenant_id": tenant_id
    })

    if not existing_project:
        return None

    updates = {}

    # Update simple project fields
    allowed_fields = [
        "project_name",
        "category",
        "description",
        "access"
    ]

    for field in allowed_fields:
        if field in project_data:
            updates[field] = project_data[field]

    # Determine the resulting template
    new_template = project_data.get(
        "template",
        existing_project.get("template")
    )

    if "template" in project_data:
        updates["template"] = new_template

    # Update project lead
    if "project_lead_id" in project_data:
        lead = get_user_by_id(
            project_data["project_lead_id"],
            tenant_id
        )

        if not lead:
            raise ValueError(
                "Selected project lead was not found or is inactive."
            )

        if lead.get("role") not in ["manager", "lead"]:
            raise ValueError(
                "Project lead must be a Manager or Lead."
            )

        updates["project_lead"] = {
            "user_id": str(lead["_id"]),
            "name": lead.get("name", ""),
            "email": lead.get("email", ""),
            "account_role": lead.get("role", "")
        }

    else:
        lead = existing_project.get("project_lead", {})

    lead_id = (
        str(lead["_id"])
        if "project_lead_id" in project_data
        else lead.get("user_id")
    )

    # Update team members
    if "team_members" in project_data:
        members = []
        member_ids = set()

        for member in project_data["team_members"] or []:
            user_id = member["user_id"]

            if user_id == lead_id:
                continue

            if user_id in member_ids:
                raise ValueError(
                    "Duplicate team member selected."
                )

            user = get_user_by_id(user_id, tenant_id)

            if not user:
                raise ValueError(
                    f"Team member {user_id} was not found or is inactive."
                )

            member_ids.add(user_id)

            members.append({
                "user_id": str(user["_id"]),
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "account_role": user.get("role", "employee"),
                "project_role": member.get(
                    "project_role",
                    "Developer"
                )
            })

        updates["team_members"] = members

    # Update Scrum configuration
    if new_template != "scrum":
        if (
            "template" in project_data
            or "sprint_duration" in project_data
            or "start_date" in project_data
        ):
            updates["sprint_configuration"] = None

    elif (
        "template" in project_data
        or "sprint_duration" in project_data
        or "start_date" in project_data
    ):
        old_config = (
            existing_project.get("sprint_configuration") or {}
        )

        duration = project_data.get(
            "sprint_duration",
            old_config.get("duration_weeks", 2)
        )

        start_date = project_data.get(
            "start_date",
            old_config.get("start_date")
        )

        updates["sprint_configuration"] = {
            "duration_weeks": duration,
            "start_date": (
                start_date.isoformat()
                if isinstance(start_date, date)
                else start_date
            )
        }

    # Update timestamp
    updates["updated_at"] = datetime.now(timezone.utc)

    if not updates:
        raise ValueError("No project fields were provided for update.")

    projects_collection.update_one(
        {
            "_id": ObjectId(project_id),
            "tenant_id": tenant_id
        },
        {
            "$set": updates
        }
    )

    return get_project_by_id(project_id, tenant_id)


# =========================================
# DELETE PROJECT
# =========================================

def delete_project(
    project_id: str,
    tenant_id: str
):
    if not ObjectId.is_valid(project_id):
        return False

    result = projects_collection.delete_one({
        "_id": ObjectId(project_id),
        "tenant_id": tenant_id
    })

    return result.deleted_count == 1

# =========================================
# PROJECT TEAM MANAGEMENT
# =========================================

def can_manage_project_team(project, current_user):
    """
    Managers can manage any project in their tenant.
    Leads can manage only projects where they are the project lead.
    Employees cannot manage project teams.
    """

    user = users_collection.find_one({
        "tenant_id": current_user["tenant_id"],
        "microsoft_oid": current_user["microsoft_oid"],
        "status": "active"
    })

    if not user:
        return False

    account_role = user.get("role")

    if account_role == "manager":
        return True

    if account_role == "lead":
        return (
            project.get("project_lead", {}).get("user_id")
            == str(user["_id"])
        )

    return False


def get_project_members(project_id: str, tenant_id: str):
    if not ObjectId.is_valid(project_id):
        return None

    project = projects_collection.find_one({
        "_id": ObjectId(project_id),
        "tenant_id": tenant_id
    })

    if not project:
        return None

    return {
        "project_id": str(project["_id"]),
        "project_name": project.get("project_name"),
        "project_lead": project.get("project_lead"),
        "team_members": project.get("team_members", [])
    }


def add_project_member(
    project_id: str,
    member_data: dict,
    current_user: dict
):
    tenant_id = current_user["tenant_id"]

    if not ObjectId.is_valid(project_id):
        return None

    project = projects_collection.find_one({
        "_id": ObjectId(project_id),
        "tenant_id": tenant_id
    })

    if not project:
        return None

    if not can_manage_project_team(project, current_user):
        raise PermissionError(
            "You do not have permission to manage this project team."
        )

    user_id = member_data["user_id"]

    if not ObjectId.is_valid(user_id):
        raise ValueError("Invalid user ID.")

    if project.get("project_lead", {}).get("user_id") == user_id:
        raise ValueError("Project lead is already assigned to this project.")

    existing_members = project.get("team_members", [])

    if any(member["user_id"] == user_id for member in existing_members):
        raise ValueError("This user is already a project member.")

    user = get_user_by_id(user_id, tenant_id)

    if not user:
        raise ValueError("Selected user was not found or is inactive.")

    new_member = {
        "user_id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "account_role": user.get("role", "employee"),
        "project_role": member_data.get("project_role", "Developer")
    }

    projects_collection.update_one(
        {
            "_id": ObjectId(project_id),
            "tenant_id": tenant_id
        },
        {
            "$push": {"team_members": new_member},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )

    return get_project_members(project_id, tenant_id)


def remove_project_member(
    project_id: str,
    user_id: str,
    current_user: dict
):
    tenant_id = current_user["tenant_id"]

    if not ObjectId.is_valid(project_id):
        return None

    if not ObjectId.is_valid(user_id):
        raise ValueError("Invalid user ID.")

    project = projects_collection.find_one({
        "_id": ObjectId(project_id),
        "tenant_id": tenant_id
    })

    if not project:
        return None

    if not can_manage_project_team(project, current_user):
        raise PermissionError(
            "You do not have permission to manage this project team."
        )

    if project.get("project_lead", {}).get("user_id") == user_id:
        raise ValueError("The project lead cannot be removed as a team member.")

    result = projects_collection.update_one(
        {
            "_id": ObjectId(project_id),
            "tenant_id": tenant_id,
            "team_members.user_id": user_id
        },
        {
            "$pull": {"team_members": {"user_id": user_id}},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )

    if result.modified_count == 0:
        raise ValueError("Team member was not found in this project.")

    return get_project_members(project_id, tenant_id)


def update_project_member_role(
    project_id: str,
    user_id: str,
    project_role: str,
    current_user: dict
):
    tenant_id = current_user["tenant_id"]

    if not ObjectId.is_valid(project_id):
        return None

    if not ObjectId.is_valid(user_id):
        raise ValueError("Invalid user ID.")

    project = projects_collection.find_one({
        "_id": ObjectId(project_id),
        "tenant_id": tenant_id
    })

    if not project:
        return None

    if not can_manage_project_team(project, current_user):
        raise PermissionError(
            "You do not have permission to manage this project team."
        )

    result = projects_collection.update_one(
        {
            "_id": ObjectId(project_id),
            "tenant_id": tenant_id,
            "team_members.user_id": user_id
        },
        {
            "$set": {
                "team_members.$.project_role": project_role,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )

    if result.modified_count == 0:
        raise ValueError("Team member was not found or role was unchanged.")

    return get_project_members(project_id, tenant_id)
