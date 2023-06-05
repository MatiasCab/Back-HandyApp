import { authorizationMiddleware } from "./checkIfAuthenticatedMiddleware";

export function Middelwares(req, res, next) {
    return authorizationMiddleware(req, res, next);
}