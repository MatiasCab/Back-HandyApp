import jwt from "jsonwebtoken";

export const authorizationMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization!;
        
        if (token) {
            const decodedData = jwt.verify(token, process.env.PRIVATE_KEY!);
            req.user = decodedData;
            next();
        } else {
            res.status(401).send({ message: 'Now token detected', name: 'NoJWT' })
        }
    } catch (e) {
        res.status(401).send({ message: 'invalid token...', name: 'JWTInvalid' })
    }
}