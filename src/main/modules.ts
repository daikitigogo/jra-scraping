import { Puppetman } from '#/scraping/puppetman';
import { JraResultScraping } from '#/scraping/jra-result-scraping';
import { JraDbService } from '#/db/jra-db-service';
import { DbUtil } from '#/db/db-util';
import { MainController } from '#/main-controller';
import * as mariadb from 'mariadb';

export const puppetman = Puppetman.init({ headless: Boolean(process.env.NODE_PUPPETEER_HEADLESS) || true });
export const jraResultScraping = new JraResultScraping(puppetman);

export const pool = mariadb.createPool({
    host: process.env.NODE_DB_HOST,
    database: process.env.NODE_DB_DATABASE,
    user: process.env.NODE_DB_USER,
    password: process.env.NODE_DB_PASSWORD,
    connectionLimit: +process.env.NODE_DB_CONNECTION_LIMIT || 1
});
export const dbUtil = new DbUtil();
export const jraDbService = new JraDbService(pool, dbUtil);

export const mainController = new MainController(jraResultScraping, jraDbService);

export async function close() {
    await (await puppetman).close();
    await pool.end();
};
