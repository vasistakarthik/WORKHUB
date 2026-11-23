import { MsalProvider } from "@azure/msal-react";
import { msalInstance } from "./msalInstance";

function AuthProvider({ children }) {
    return (
        <MsalProvider instance={msalInstance}>
            {children}
        </MsalProvider>
    );
}

export default AuthProvider;