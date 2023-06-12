import { authorizationMiddleware } from "./checkIfAuthenticatedMiddleware";

export function middelwares(req, res, next) {
    return authorizationMiddleware(req, res, next);
}