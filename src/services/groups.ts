import { PrismaClient, Prisma } from "@prisma/client";
import * as events from '../services/events';

const prisma = new PrismaClient();

export const getAll = async (id_event: number) => {
    try {
        return await prisma.eventGroup.findMany({ where: { id_event } });
    } catch (err) { return false; }
}

type GetOneFilter = { id: number; id_event?: number; }
export const getOne = async (filters: GetOneFilter) => {
    try {
        return await prisma.eventGroup.findFirst({ where: filters });
    } catch (err) { return false; }
}

type GroupsCreateData = Prisma.Args<typeof prisma.eventGroup, 'create'>['data'];
export const add = async (data: GroupsCreateData) => {
    try {
        // veio o id_event?
        if (!data.id_event) {
            return false;
        }
        // ele existe?
        const eventItem = await events.getOne(data.id_event);
        if (!eventItem) {
            return false;
        }
        // tudo certo, podemos adicionar.
        return await prisma.eventGroup.create({ data });
    } catch (err) { return false; }
}


type updateFilter = { id: number; id_event?: number; }
type GroupsUpdateData = Prisma.Args<typeof prisma.eventGroup, 'update'>['data'];
export const update = async (filters: updateFilter, data: GroupsUpdateData) => {
    try {
        return await prisma.eventGroup.update({ where: filters, data });
    } catch (err) { return false; }
}


type deleteFilter = { id: number; id_event?: number; }
export const remove = async (filters: updateFilter) => {
    try {
        return await prisma.eventGroup.delete({ where: filters });
    } catch (err) { return false; }
}