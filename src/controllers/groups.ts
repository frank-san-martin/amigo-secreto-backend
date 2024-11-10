import { RequestHandler, Request, Response } from "express";
import * as groups from '../services/groups';
import { number, string, z } from "zod";

export const getAll: RequestHandler = async (req: Request, res: Response) => {
    const { id_event } = req.params;
    // busca todos grupos
    const items = await groups.getAll(parseInt(id_event));
    // verificações
    if (items) {
        res.json({ groups: items });
        return;
    }
    // erros
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}

export const getGroup: RequestHandler = async (req: Request, res: Response) => {
    const { id, id_event } = req.params;
    // busca todos grupos
    const items = await groups.getOne({ id: parseInt(id), id_event: parseInt(id_event) });
    // verificações
    if (items) {
        res.json({ group: items });
        return;
    }
    // error
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}

export const addGroup: RequestHandler = async (req: Request, res: Response) => {
    const { id_event } = req.params;
    // criar um padrão c/ zod e validar
    const addGroupSchema = z.object({ name: z.string() });
    const body = addGroupSchema.safeParse(req.body);
    if (!body.success) {
        res.json({ error: 'Dados inválidos!' });
        return;
    }

    // cria o grupo
    const newGroup = await groups.add({
        // name: body.data.name,  -- esta seria outra maneira, especificando o item, abaixo foi feito um clone do body.data.
        ...body.data,
        id_event: parseInt(id_event)
    });

    // verificações
    if (newGroup) {
        res.status(201).json({ group: newGroup });
        return;
    }
    // error
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}

export const updateGroup: RequestHandler = async (req: Request, res: Response) => {
    const { id, id_event } = req.params;
    // criar um padrão c/ zod e validar
    const updateGroupSchema = z.object({ name: z.string().optional() });
    const body = updateGroupSchema.safeParse(req.body);
    if (!body.success) {
        res.json({ error: 'Dados inválidos!' });
        return;
    }

    // editar o grupo
    const updateGroup = await groups.update({ id: parseInt(id), id_event: parseInt(id_event) }, body.data);

    // verificações
    if (updateGroup) {
        res.status(201).json({ group: updateGroup });
        return;
    }
    // error
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}


export const deleteGroup: RequestHandler = async (req: Request, res: Response) => {
    const { id, id_event } = req.params;

    const deleteGroup = await groups.remove({ id: parseInt(id), id_event: parseInt(id_event) });
    // verificações
    if (deleteGroup) {
        res.status(201).json({ group: deleteGroup });
        return;
    }
    // error
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}