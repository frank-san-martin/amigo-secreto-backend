import { PrismaClient, Prisma } from "@prisma/client";
import * as people from './people';
import * as groups from './groups';
import { encryptMatch } from "../utils/match";

const prisma = new PrismaClient();
export const getAll = async () => {
    try {
        return await prisma.event.findMany();
    } catch (err) { return false; }
}

export const getOne = async (id: number) => {
    try {
        return await prisma.event.findFirst({ where: { id: id } });
    } catch (err) { return false; }
}

type EventsCreateData = Prisma.Args<typeof prisma.event, 'create'>['data'];
export const add = async (data: EventsCreateData) => {
    try {
        return await prisma.event.create({ data });
    } catch (err) { return false; }
}


type EventsUpdateData = Prisma.Args<typeof prisma.event, 'update'>['data'];
export const update = async (id: number, data: EventsUpdateData) => {
    try {
        return await prisma.event.update({ where: { id }, data });
    } catch (err) { return false; }
}

export const remove = async (id: number) => {
    try {
        return await prisma.event.delete({ where: { id: id } });
    } catch (err) { return false; }
}


/* 
   Evento: id 3
   Grupo A [id:2] - Frank, Duda, Joana
   Grupo B [id:4] - Joao, Lucia, 
   Grupo C [id:5] - Naty
*/
export const doMatches = async (id: number): Promise<boolean> => {
    const eventItem = await prisma.event.findFirst({ where: { id }, select: { grouped: true } });
    if (eventItem) {
        const peopleList = await people.getAll({ id_event: id });
        if (peopleList) {
            // lista do sorteio (sortedList), e as pessoal sorteáveis (sortable).
            let sortedList: { id: number, match: number }[] = [];
            let sortable: number[] = [];

            // controles: tentativas = 0 e máximo tentativas = total de pessoas participando do sorteio 
            let attempts = 0;
            let maxAttempts = peopleList.length;
            let keeptrying = true // variável para controlar o while

            while (keeptrying && attempts < maxAttempts) {
                // **** lógica do sorteio ****

                keeptrying = false;
                attempts++;
                // zero a lista e carrego os sorteáveis
                sortedList = [];
                sortable = peopleList.map(item => item.id);

                // loop na pessoas da lista
                for (let i in peopleList) { // loop nas pessoas da lista.
                    let sortableFiltered: number[] = sortable; // lista de pessoas sorteáveis
                    if (eventItem.grouped) { // verificando evento é agrupado (se for agrupado preciso pegar pessoas que não são do meu grupo)
                        sortableFiltered = sortable.filter(sortableItem => {  // sortableFiltered vai ser todos que não fazem parte do meu grupo
                            let sortablePerson = peopleList.find(item => item.id === sortableItem) // pegando a pessoa pelo id
                            return peopleList[i].id_group !== sortablePerson?.id_group;
                        });
                    }
                    // verifica a lista de sorteados não terminou, ou se tem um e se este um não sou eu, a pessoa que esta na vez do sorteio, se for, set keeptryng e reinicia sorteio
                    if (sortableFiltered.length === 0 || (sortableFiltered.length === 1 && peopleList[i].id === sortableFiltered[0])) {
                        keeptrying = true;
                    } else {
                        // agora tudo ok, de fato vamos fazer sorteio
                        let sortedIndex = Math.floor(Math.random() * sortableFiltered.length) // gerando um número aleatório entre 0 e max de pessoal na lista
                        // a pessoa sorteado pode ser eu, ou seja, a da lista inicial corrente. então while para sortear novamente. (não entra em loop infinito pq neste ponto ja sei que tem mais q uma pessoa)
                        while (sortableFiltered[sortedIndex] === peopleList[i].id) {
                            sortedIndex = Math.floor(Math.random() * sortableFiltered.length)
                        }
                        // deu certo, adiciona os sorteados na lista 
                        sortedList.push({
                            id: peopleList[i].id, // quem vai tirar
                            match: sortableFiltered[sortedIndex] // quem foi tirado
                        });
                        // remover a pessoa que acabou de ser tirada da lista de sorteáveis
                        sortable = sortable.filter(item => item !== sortableFiltered[sortedIndex]);
                    }
                }
            }
            // console.log(`attempts: ${attempts}`);
            // console.log(`maxAttemts: ${maxAttempts}`);
            // console.log(sortedList);


            if (attempts < maxAttempts) {
                // deu certo o sorteio
                for (let i in sortedList) {
                    await people.update({
                        id: sortedList[i].id,
                        id_event: id
                    }, { matched: encryptMatch(sortedList[i].match) }); // id de quem foi tirado sortedList[i].match
                }
                return true;
            }

        }
    }


    return false;
}



