import "dotenv/config";
type AuthUser = {
    id: string;
    email: string;
    name: string;
};
declare module "express-serve-static-core" {
    interface Request {
        user?: AuthUser;
    }
}
export {};
//# sourceMappingURL=index.d.ts.map