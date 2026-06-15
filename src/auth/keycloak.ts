import jwt, { JwtHeader, JwtPayload, SigningKeyCallback } from "jsonwebtoken";
import jwksClient from "jwks-rsa";

const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;

const ISSUER = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`;
const JWKS_URI = `${ISSUER}/protocol/openid-connect/certs`;

const client = jwksClient({
    jwksUri: JWKS_URI,
    cache: true,
    cacheMaxAge: 600000,
    rateLimit: true,
    jwksRequestsPerMinute: 10,
});

function getSigningKey(header: JwtHeader, callback: SigningKeyCallback) {
    client.getSigningKey(header.kid, (err, key) => {
        if (err) return callback(err);
        callback(null, key?.getPublicKey());
    });
}

export const ROLE_READ = "patsy_read_general";
export const ROLE_WRITE = "patsy_write_general";

export const GROUP_ADMIN = "patsy-admin";
export const GROUP_USER = "patsy-user";
export const GROUP_GUEST = "patsy-guest";

export interface PatsyUser {
    azp: string;
    sub: string;
    preferredUsername: string;
    fullName: string;
    email: string;
    roles: string[];
    groups: string[];
}

interface KeycloakTokenPayload extends JwtPayload {
    preferred_username?: string;
    given_name?: string;
    family_name?: string;
    email?: string;
    realm_access?: {
        roles: string[];
    };
    groups?: string[];
}

export function verifyToken(token: string): Promise<PatsyUser> {
    return new Promise((resolve, reject) => {
        jwt.verify(
            token,
            getSigningKey,
            {
                issuer: ISSUER,
                algorithms: ["RS256"],
            },
            (err, decoded) => {
                if (err) return reject(err);

                const payload = decoded as KeycloakTokenPayload;

                resolve({
                    azp: payload.azp ?? "",
                    sub: payload.sub ?? "",
                    preferredUsername: payload.preferred_username ?? "",
                    fullName: `${payload.given_name ?? ""} ${payload.family_name ?? ""}`.trim(),
                    email: payload.email ?? "",
                    roles: payload.realm_access?.roles ?? [],
                    groups: payload.groups ?? [],
                });
            }
        );
    });
}

export function hasRole(user: PatsyUser, role: string): boolean {
    return user.roles.includes(role);
}

export function hasGroup(user: PatsyUser, group: string): boolean {
    return user.groups.includes(group);
}

export function canRead(user: PatsyUser): boolean {
    return hasRole(user, ROLE_READ);
}

export function canWrite(user: PatsyUser): boolean {
    return hasRole(user, ROLE_WRITE);
}

export function isAdmin(user: PatsyUser): boolean {
    return hasGroup(user, GROUP_ADMIN);
}