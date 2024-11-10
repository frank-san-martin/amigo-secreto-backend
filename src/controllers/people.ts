import { RequestHandler, Request, Response } from "express";
import * as people from '../services/people';
import { number, string, z } from "zod";
import { decryptMatch } from "../utils/match";

export const getAll: RequestHandler = async (req: Request, res: Response) => {
    const { id_event, id_group } = req.params;
    // busca todos grupos
    const items = await people.getAll({ id_event: parseInt(id_event), id_group: parseInt(id_group) });
    // verificações
    if (items) {
        res.json({ people: items });
        return;
    }
    // erros
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}

export const getPerson: RequestHandler = async (req: Request, res: Response) => {
    const { id, id_event, id_group } = req.params;
    // busca todos grupos
    const item = await people.getOne({ id: parseInt(id), id_event: parseInt(id_event), id_group: parseInt(id_group) });
    // verificações
    if (item) {
        res.json({ group: item });
        return;
    }
    // error
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}


export const addPerson: RequestHandler = async (req: Request, res: Response) => {
    const { id_event, id_group } = req.params;
    // criar um padrão c/ zod e validar ... usando transform para aplicar uma expressão regular e retirar o . e - do cpf
    const addPersonSchema = z.object({
        name: z.string(),
        cpf: z.string().transform(val => val.replace(/\.|-/gm, ''))
    });
    const body = addPersonSchema.safeParse(req.body);
    if (!body.success) {
        res.json({ error: 'Dados inválidos!' });
        return;
    }

    // adionar a pessoa
    const newPeople = await people.add({
        // name: body.data.name,  -- esta seria outra maneira, especificando o item, abaixo foi feito um clone do body.data.
        // cpf: body.data.cpf,
        ...body.data,
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    });

    // verificações
    if (newPeople) {
        res.status(201).json({ people: newPeople });
        return;
    }
    // error
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}



export const updatePerson: RequestHandler = async (req: Request, res: Response) => {
    const { id, id_event, id_group } = req.params;

    const updatePersonSchema = z.object({
        name: z.string(),
        cpf: z.string().transform(val => val.replace(/\.|-/gm, '')).optional(),
        matched: z.string().optional()
    });

    const body = updatePersonSchema.safeParse(req.body);
    if (!body.success) {
        res.json({ error: 'Dados inválidos!' });
        return;
    }
    const updatePerson = await people.update({
        id: parseInt(id),
        id_event: parseInt(id_event),
        id_group: parseInt(id_group)
    }, body.data);

    // verificações
    if (updatePerson) {
        const personItem = await people.getOne({ id: parseInt(id), id_event: parseInt(id_event) });
        res.json({ person: personItem });
        return;
    }
    // error
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}


export const deletePerson: RequestHandler = async (req: Request, res: Response) => {
    const { id, id_event, id_group } = req.params;

    const deletedPerson = await people.remove({ id: parseInt(id), id_event: parseInt(id_event), id_group: parseInt(id_group) });
    if (deletedPerson) {
        res.json({ person: deletedPerson });
        return;
    }
    // error
    res.json({ error: 'Ocorreu algum erro!' });
    return;
}


export const searchPerson: RequestHandler = async (req: Request, res: Response) => {
    const { id_event } = req.params;

    const searchPersonSchema = z.object({
        cpf: z.string().transform(val => val.replace(/\.|-/gm, ''))
    });

    // verifica se veio cpf na query
    const query = searchPersonSchema.safeParse(req.query);
    if (!query.success) {
        res.json({ error: 'Dados inválidos!' });
        return;
    }
    // localizo a pessoa pelo cpf
    const personItem = await people.getOne({
        id_event: parseInt(id_event),
        cpf: query.data.cpf
    });
    // se cpf existe e tiver tirado alguém (sorteio já aconteceu)
    if (personItem && personItem.matched) {
        const matchId = decryptMatch(personItem.matched); // desencrypta e retorna o id;  (number)

        const personMatched = await people.getOne({  // buscando a pessoa 
            id_event: parseInt(id_event),
            id: matchId
        });
        // Deu certo?
        if (personMatched) {
            res.json({
                person: {
                    id: personItem.id,
                    name: personItem.name
                },
                personMatched: {
                    id: personMatched.id,
                    name: personMatched.name
                }
            });
            return;
        }
    }
    res.json({ error: 'Dados inválidos!' });
    return;

}