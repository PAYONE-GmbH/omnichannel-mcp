import { randomUUID } from "crypto";

export function createUuid(): string {
    return randomUUID().replace(/-/g, "");
}