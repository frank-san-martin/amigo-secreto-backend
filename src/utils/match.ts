export const encryptMatch = (id: number): string => {
    // simplificando, tokem padrão antes e depois do id da uma camuflada
    // console.log(`${process.env.DEFAULT_TOKEN}${id}${process.env.DEFAULT_TOKEN}`);
    return `${process.env.DEFAULT_TOKEN}${id}${process.env.DEFAULT_TOKEN}`;
}

export const decryptMatch = (match: string): number => {
    //removo os dois token e devolvo o id
    let idString: string = match
        .replace(`${process.env.DEFAULT_TOKEN}`, '')
        .replace(`${process.env.DEFAULT_TOKEN}`, '');
    return parseInt(idString);
} 