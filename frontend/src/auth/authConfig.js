
const clientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const tenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const redirectUri = import.meta.env.VITE_AZURE_REDIRECT_URI;
const apiScope = import.meta.env.VITE_AZURE_API_SCOPE;

if (!clientId || !tenantId || !redirectUri || !apiScope) {
    throw new Error(
        "Microsoft authentication configuration is missing. Check frontend .env."
    );
}

export const msalConfig = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        redirectUri,
        postLogoutRedirectUri: window.location.origin,
    },

    cache: {
        cacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
    },
};

// Microsoft account sign-in & WorkHub API access
export const loginRequest = {
    scopes: ["openid", "profile", apiScope],
};

// WorkHub backend API access
export const workhubApiRequest = {
    scopes: [apiScope],
};

// Expected audience configured in the FastAPI backend
export const WORKHUB_API_AUDIENCE =
    "3dfef025-46c0-4216-84bf-f1d01c2f3df1";
