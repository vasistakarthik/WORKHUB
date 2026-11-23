
from app.db.connection import database

# WorkHub MongoDB collections
users_collection = database["users"]
projects_collection = database["projects"]


def initialize_collections():

    # 1. Microsoft accounts must be unique when Microsoft OID exists.
    # Allows multiple manually created users with microsoft_oid = None.
    users_collection.create_index(
        [
            ("tenant_id", 1),
            ("microsoft_oid", 1)
        ],
        unique=True,
        name="unique_microsoft_user",
        partialFilterExpression={
            "microsoft_oid": {"$type": "string"}
        }
    )

    # 2. Email must be unique inside each organization.
    users_collection.create_index(
        [
            ("tenant_id", 1),
            ("email", 1)
        ],
        unique=True,
        name="unique_email_per_tenant"
    )

    # 3. Project key must be unique inside each organization.
    projects_collection.create_index(
        [
            ("tenant_id", 1),
            ("project_key", 1)
        ],
        unique=True,
        name="unique_project_key_per_tenant"
    )

    # 4. Faster project lookup by tenant and creation date.
    projects_collection.create_index(
        [
            ("tenant_id", 1),
            ("created_at", -1)
        ],
        name="projects_by_tenant"
    )

    print("WorkHub collections and indexes initialized successfully!")
