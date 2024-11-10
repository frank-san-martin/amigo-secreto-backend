import { Request, Response, RequestHandler } from "express";
import { z } from "zod";
import * as auth from '../services/auth';

export const login: RequestHandler = (req: Request, res: Response): void => {
    const loginSchema = z.object({
        password: z.string()
    });

    const body = loginSchema.safeParse(req.body);

    if (!body.success) {
        res.json({ error: 'Dados inválidos!' });
        return;  // Finaliza a execução sem retornar um Response explícito
    }

    // validar e gerar token
    if (!auth.validatePassword(body.data.password)) {
        res.status(403).json({ error: 'Acesso negado!' })
        return;
    }
    res.json({ token: auth.createToken() });
    return;
}

export const validate: RequestHandler = (req: Request, res: Response, next): void => {
    if (!req.headers.authorization) {
        res.status(403).json({ error: 'Acesso Negado!  1' });
        return;
    }
    const token = req.headers.authorization.split(' ')[1];
    if (!auth.validateToken(token)) {
        res.status(403).json({ error: 'Acesso Negado!  2' });
        return;
    }
    next();
}


