interface TokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export class TokenManager {
    private token: string = "";
    private expiresAt: number = 0;
    private refreshTimer: NodeJS.Timeout | null = null;
    private tokenUrl: string;
    private clientId: string;
    private clientSecret: string;

    constructor(options: {
        keycloakUrl: string;
        realm: string;
        clientId: string;
        clientSecret: string;
    }) {
        this.tokenUrl = `${options.keycloakUrl}/realms/${options.realm}/protocol/openid-connect/token`;
        this.clientId = options.clientId;
        this.clientSecret = options.clientSecret;
    }

    async getToken(): Promise<string> {
        if (this.token && Date.now() < this.expiresAt - 30000) {
            return this.token;
        }
        return this.refresh();
    }

    async refresh(): Promise<string> {
        const params = new URLSearchParams({
            grant_type: "client_credentials",
            client_id: this.clientId,
            client_secret: this.clientSecret,
        });

        const res = await fetch(this.tokenUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
        });

        if (!res.ok) {
            throw new Error(`Token refresh failed: ${res.status} ${res.statusText}`);
        }

        const data = (await res.json()) as TokenResponse;

        this.token = data.access_token;
        this.expiresAt = Date.now() + data.expires_in * 1000;

        this.scheduleRefresh(data.expires_in);

        console.info(
            `Token refreshed, expires in ${data.expires_in}s, next refresh in ${Math.floor(data.expires_in * 0.75)}s`
        );

        return this.token;
    }

    private scheduleRefresh(expiresInSeconds: number) {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
        }

        const refreshIn = Math.floor(expiresInSeconds * 0.75) * 1000;

        this.refreshTimer = setTimeout(async () => {
            try {
                await this.refresh();
            } catch (err) {
                console.error("Scheduled token refresh failed:", err);
                setTimeout(() => this.refresh().catch(() => {}), 10000);
            }
        }, refreshIn);
    }

    get currentToken(): string {
        return this.token;
    }

    destroy() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    }
}