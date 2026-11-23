
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig";

export const msalInstance = new PublicClientApplication(msalConfig);

export async function initializeMsal() {
    await msalInstance.initialize();

    // Restore an existing Microsoft account from MSAL cache
    const accounts = msalInstance.getAllAccounts();

    if (!msalInstance.getActiveAccount() && accounts.length > 0) {
        msalInstance.setActiveAccount(accounts[0]);
    }

    console.info("Microsoft authentication initialized.");
}
