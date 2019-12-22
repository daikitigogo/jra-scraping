import * as dotenv from 'dotenv';
dotenv.config();
import jraResultScraping from './scraping/jra-result-scraping';
import { Repository } from './db/repository';
import * as entity from './db/entities';
import { JraRepository } from './db/jra-repository';

// console.log(process.argv);
if (!(4 <= process.argv.length && process.argv.length <= 5)) {
    throw new Error('Invalid arguments!');
}
const year = process.argv[2];
const month = process.argv[3];
const day = process.argv.length == 5 ? process.argv[4] : null;
const date = new Date(`${year}-${month}-${day || '01'}`);
if (date.toString() === 'Invalid Date') {
    throw new Error('Invalid Date!');
}
// console.log(process.argv.length);
// console.log(day);
// const result = jraScraping(process.argv[2], process.argv[3], day);
// result.then(r => console.log(JSON.stringify(r, undefined, 2)));

const main = async () => {

    // JRAサイトから指定レース結果を取得
    const scrapingResult = await jraResultScraping(year, month, day);
    console.log(JSON.stringify(scrapingResult, undefined, 2));

    const rep = new Repository();
    const jraRep = new JraRepository(rep);
    const result = await jraRep.insertHorseMaster('test');
    console.log(result);
    rep.end();
};

main();
