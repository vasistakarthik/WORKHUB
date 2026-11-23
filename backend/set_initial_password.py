
import re
import sys
from getpass import getpass

from app.core.password import hash_password
from app.db.collections import users_collection


def main():
    print("\n=== WorkHub Initial Password Setup ===\n")

    email = input("Enter the user's Microsoft email: ").strip()

    if not email:
        print("Email is required.")
        return

    # Find the existing WorkHub user without case sensitivity.
    email_pattern = re.compile(
        f"^{re.escape(email)}$",
        re.IGNORECASE
    )

    users = list(
        users_collection.find(
            {"email": email_pattern}
        ).limit(2)
    )

    if len(users) == 0:
        print("User not found in the WorkHub database.")
        return

    if len(users) > 1:
        print("Multiple users found. Password setup cancelled.")
        return

    user = users[0]

    if user.get("password_hash"):
        print("This user already has a password hash.")
        print("Password setup cancelled to prevent accidental overwrite.")
        return

    password = getpass("Enter initial WorkHub password: ")
    confirm_password = getpass("Confirm WorkHub password: ")

    if len(password) < 12:
        print("Password must contain at least 12 characters.")
        return

    if password != confirm_password:
        print("Passwords do not match.")
        return

    password_hash = hash_password(password)

    result = users_collection.update_one(
        {
            "_id": user["_id"],
            "password_hash": {"$in": [None, ""]}
        },
        {
            "$set": {
                "password_hash": password_hash
            }
        }
    )

    if result.modified_count == 1:
        print("\nInitial WorkHub password saved successfully!")
    else:
        print("\nPassword was not saved. Please check the user record.")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"An error occurred: {error}")
        sys.exit(1)
