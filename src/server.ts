import 'dotenv/config';
import express from 'express';
import cors from 'cors'
import https from 'https';
import http from 'http';
import fs from 'fs';
import siteRouter from './routes/site';
import adminRouter from './routes/admin';
import { requestIntercepter } from './utils/requestintercepter';


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//interceptador...para ver que rota foi chamada e o que ela solicitou
app.all('*', requestIntercepter);


app.use('/admin', adminRouter);
app.use('/', siteRouter);




const runServer = (port: number, server: http.Server) => {
    server.listen(port, () => {
        console.log(`🔥🔥 Running at PORT ${port}`);
    });
}

const regularServer = http.createServer(app);
if (process.env.NODE_ENV === 'production') {
    if (process.env.NODE_ENV === 'production') {
        const options = {
            key: fs.readFileSync(process.env.SSL_KEY as string),
            cert: fs.readFileSync(process.env.SSL_CERT as string)
        }
    }
} else {
    const serverPort: number = process.env.PORT ? parseInt(process.env.PORT) : 9000;
    runServer(serverPort, regularServer);
}
