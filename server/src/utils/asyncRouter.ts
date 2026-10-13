import { Router, RequestHandler, Request, Response, NextFunction } from 'express';
export const asyncRouter = () => {
  const router = Router();
  for (const method of ['get', 'post', 'put', 'delete'] as const) {
    const original = router[method].bind(router);
    (router as any)[method] = (path: string, ...handlers: RequestHandler[]) =>
      original(
        path,
        ...handlers.map((handler) => (req: Request, res: Response, next: NextFunction) => {
          try {
            Promise.resolve(handler(req, res, next)).catch(next);
          } catch (error) {
            next(error);
          }
        }),
      );
  }
  return router;
};
