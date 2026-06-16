import { CommunicatorConfiguration } from "pcp-server-nodejs-sdk";

export interface PcpConfig {
    apiKey: string;
    apiSecret: string;
    merchantId: string;
    host?: string;
}

export class PcpClient {
    public readonly config: CommunicatorConfiguration;
    public readonly merchantId: string;

    constructor(pcpConfig: PcpConfig) {
        this.merchantId = pcpConfig.merchantId;
        this.config = new CommunicatorConfiguration(
            pcpConfig.apiKey,
            pcpConfig.apiSecret,
            pcpConfig.host || "https://commerce-api.payone.com/v1",
        );
    }
}