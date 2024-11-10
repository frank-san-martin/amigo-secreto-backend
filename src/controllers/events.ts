import { RequestHandler, Request, Response } from "express";
import * as events from '../services/events';
import * as people from '../services/people';
import { z } from "zod";
import { title } from "process";

export const getAll: RequestHandler = async (req: Request, res: Response) => {
    const items = await events.getAll();
    if (items) {
        res.json({ events: items });
        return;
    }
    res.json({ error: 'Ocorreu algum erro!' });
}

export const getEvent: RequestHandler = async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await events.getOne(parseInt(id));
    if (item) {
        res.json({ events: item });
        return;
    }
    res.json({ error: 'Ocorreu algum erro!' });
}

export const addEvent: RequestHandler = async (req: Request, res: Response) => {
    const addEventSchema = z.object({
        title: z.string(),
        description: z.string(),
        grouped: z.boolean()
    });

    const body = addEventSchema.safeParse(req.body);

    if (!body.success) {
        res.json({ error: 'Ocorreu um erro, dados inválidos!' });
        return;
    }
    const newEvent = await events.add(body.data);

    if (newEvent) {
        res.status(201).json({ event: newEvent })
        return;
    }

    res.json({ error: 'Ocorreu algum erro!' });
    return;
}


export const updateEvent: RequestHandler = async (req: Request, res: Response) => {
    // receber
    const { id } = req.params;
    // schema
    const updateEventSchema = z.object({
        status: z.boolean().optional(),
        title: z.string().optional(),
        description: z.string().optional(),
        grouped: z.boolean().optional()
    });
    // validar
    const body = updateEventSchema.safeParse(req.body);
    if (!body.success) {
        res.json({ error: 'Ocorreu um erro. Dados inválidos!' });
        return;
    }

    // fazer a atualização
    const updatedEvent = await events.update(parseInt(id), body.data);

    //checa se deu certo e retorna o event atualizado
    if (updatedEvent) {
        // verificar o status
        if (updatedEvent.status) {
            // se true, fazer sorteio
            const result = await events.doMatches(parseInt(id));
            if (!result) {
                res.json({ error: 'Grupos impossíveis de sortear!' });
                return;
            }
        } else {
            // limpar o sorteio
            await people.update({ id_event: parseInt(id) }, { matched: '' });
        }

        res.json({ event: updatedEvent });
        return;
    }
    res.json({ error: 'Ocorreu um erro. Dados inválidos!' });
    return;

    // se deu algum erro


}

export const deleteEvent: RequestHandler = async (req: Request, res: Response) => {
    // receber
    const { id } = req.params;
    // delete
    const deletedEvent = await events.remove(parseInt(id));
    // verifica
    if (deletedEvent) {
        res.status(201).json({ event: deletedEvent })
        return;
    }
    // se deu erro
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}