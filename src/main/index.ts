import * as dotenv from 'dotenv';
dotenv.config();
import jraResultScraping from './scraping/jra-result-scraping';
import { Repository } from './db/repository';
import * as entities from './db/entities';
import { JraRepository } from './db/jra-repository';
import * as converters from './db/converters';


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

const main = async (year: string, month: string, day: string) => {

    // JRAサイトから指定レース結果を取得
    const targetDataList = await jraResultScraping(year, month, day);

    // DB更新
    const rep = new Repository();
    const jraRep = new JraRepository(rep);

    // 競馬場マスタを取得しておく
    const turfPlaceList: entities.TurfPlaceMaster[] = await jraRep.selectAllTurfPlaceMaster();
    // スクレイピング結果をエンティティに変換していく
    const entitySetList = targetDataList.map(t => {
        // 競馬場コードをマスタから取り出し
        const turfPlaceCode = turfPlaceList.find(x => t.turfPlaceName.indexOf(x.turfPlaceName) != -1).turfPlaceCode;
        // スクレイピング結果をエンティティに変換
        return t.raceDataList.map(d => {
            // race_dataエンティティを取得
            const raceData = new converters.RaceDataToEntity(d).execute(t.date, turfPlaceCode);
            // race_detailエンティティリストを取得

            // refundエンティティを取得

            // オブジェクトに詰める
            return {
                raceData,
            };
        });
    })
    .reduce((acc, cur) => acc.concat(cur), []);

    const result = await jraRep.insertHorseMaster('test');
    console.log(result);
    rep.end();
};

main(year, month, day);
