
import os
from functools import lru_cache

import jwt
from jwt import PyJWKClient
from jwt.exceptions import InvalidTokenError, PyJWKClientError

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.db.collections import users_collection
from app.core.roles import UserRole


# Load environment variables
load_dotenv()

TENANT_ID = os.getenv("AZURE_TENANT_ID")
API_AUDIENCE = os.getenv("AZURE_API_AUDIENCE")


# HTTP Bearer authentication
security_scheme = HTTPBearer(auto_error=False)


# Allowed WorkHub roles
ALLOWED_ROLES = {
    UserRole.MANAGER.value,
    UserRole.LEAD.value,
    UserRole.EMPLOYEE.value,
}


# Microsoft public signing keys
@lru_cache(maxsize=1)
def get_jwks_client():

    if not TENANT_ID:
        raise RuntimeError("AZURE_TENANT_ID is missing.")

    jwks_url = (
        f"https://login.microsoftonline.com/"
        f"{TENANT_ID}/discovery/v2.0/keys"
    )

    return PyJWKClient(jwks_url)


# Verify Microsoft access token
def verify_microsoft_token(token: str):

    if not TENANT_ID or not API_AUDIENCE:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Microsoft authentication configuration is missing.",
        )

    if not isinstance(token, str) or len(token.split(".")) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Microsoft access token format.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:

        # Read unverified claims only to determine token version
        unverified_claims = jwt.decode(
            token,
            options={
                "verify_signature": False,
                "verify_exp": False,
                "verify_aud": False,
                "verify_iss": False,
            },
        )

        token_version = unverified_claims.get("ver")

        print("TOKEN VERSION:", token_version)
        print("TOKEN AUDIENCE:", unverified_claims.get("aud"))
        print("CONFIGURED API AUDIENCE:", API_AUDIENCE)

        # Select Microsoft token issuer
        if token_version == "2.0":

            expected_issuer = (
                f"https://login.microsoftonline.com/"
                f"{TENANT_ID}/v2.0"
            )

        elif token_version == "1.0":

            expected_issuer = (
                f"https://sts.windows.net/{TENANT_ID}/"
            )

        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unsupported Microsoft token version.",
            )

        # Get Microsoft's public signing key
        signing_key = (
            get_jwks_client().get_signing_key_from_jwt(token)
        )

        # Verify signature and token claims
        claims = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=API_AUDIENCE,
            issuer=expected_issuer,
            options={
                "require": ["exp", "iss", "aud"],
            },
        )

        # Verify organization tenant
        if claims.get("tid") != TENANT_ID:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account does not belong to your organization.",
            )

        # Verify Microsoft user object ID
        if not claims.get("oid"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Microsoft user ID is missing.",
            )

        return claims

    except HTTPException:
        raise

    except (
        InvalidTokenError,
        PyJWKClientError,
        ValueError,
    ) as error:

        print(
            "MICROSOFT TOKEN VERIFICATION ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Microsoft access token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    except Exception as error:

        print(
            "MICROSOFT TOKEN VERIFICATION ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Unable to verify Microsoft authentication right now.",
        )


# Get authenticated WorkHub user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security_scheme
    ),
):

    # Check whether token was provided
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is required.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Step 1: Verify Microsoft identity
    claims = verify_microsoft_token(
        credentials.credentials
    )

    tenant_id = claims.get("tid")
    microsoft_oid = claims.get("oid")

    # Step 2: Find user in MongoDB
    user = users_collection.find_one({
        "tenant_id": tenant_id,
        "microsoft_oid": microsoft_oid,
    })

    # Step 3: Determine WorkHub role
    if user is None:

        # New Microsoft users default to Employee
        role = UserRole.EMPLOYEE.value
        account_status = "active"

    else:

        # Existing users use their MongoDB role
        role = str(user.get("role", "")).lower()
        account_status = user.get("status", "active")

    # Step 4: Validate role
    if role not in ALLOWED_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid WorkHub role assignment.",
        )

    # Step 5: Check account status
    if account_status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your WorkHub account is inactive.",
        )

    # Step 6: Return authenticated WorkHub user
    return {
        "tenant_id": tenant_id,
        "microsoft_oid": microsoft_oid,
        "name": (
            user.get("name")
            if user
            else claims.get("name", "Microsoft User")
        ),
        "email": (
            user.get("email")
            if user
            else (
                claims.get("preferred_username")
                or claims.get("upn")
                or claims.get("email")
            )
        ),
        "role": role,
    }
