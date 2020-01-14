import { Puppetman } from '../../share/utility/scraping.utility';
import { baseNavi, goalNavi } from '../../job/scrape-horse/horse.navigator';
import { HorseDataDto, ParentInfoDto, PastRaceDataDto, EntitySetDto } from './horse.dto';
import { takeHorseList, takeDadInfo, takePastRaceList } from './horse.script';
import { HorseMaster, RaceData, TurfPlaceMaster, RaceDetail, SpecialityRace } from '../../share/entity/plain.entity';
import { logger } from '../../logger';
import { HorseDatabaseService } from './horse.service';
import { timeStringToMilis } from '../../share/utility/function.utility';

/** 検索結果一覧取得セレクタ */
const targetHorsesSelector = `[onclick^="return doAction('/JRADB/accessU.html'"]`;
/** 過去レース情報取得セレクタ */
const pastRaceSelector = 'body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(3) > tbody > tr > td > table:nth-child(9) > tbody > tr.gray12';
/** 親情報取得セレクタ */
const parentInfoSelector = 'body > table > tbody > tr > td > table > tbody > tr > td > table:nth-child(3) > tbody > tr > td > table:nth-child(4) > tbody';

/**
 * 競走馬の親情報をスクレイピングで取得する
 */
export class HorseScrapingJob {

    /**
     * コンストラクタ
     * @param pool Pool
     * @param puppetman Promise<Puppetman>
     * @param hmReps HorseMasterRepository
     */
    constructor(
        private puppetman: Promise<Puppetman>,
        private databaseService: HorseDatabaseService) { }

    /**
     * スクレイピング実行
     */
    async run() {

        // ブラウザ、ページの起動完了を待つ
        const puppetman = await this.puppetman;
        // 親情報未設定の競走馬を取得
        const horseList = await this.databaseService.selectNoReflectParentInfo();
        // 競馬場マスタを取得
        const turfPlaceList = await this.databaseService.getTurfPlaceMaster();

        logger.info(`Total count is ${horseList.length}`);

        for (let i = 0; i < horseList.length; i++) {
            const entity = horseList[i];
            // 競走馬検索から親情報を取得
            const base = baseNavi(entity.horseName);
            // 検索結果ページまで遷移
            const targetHorse = await puppetman.execute(base, targetHorsesSelector, takeHorseList)
                .then(l => l.find((x: HorseDataDto) => this.isTarget(x, entity))) as HorseDataDto;
            // 過去の出走レースを抜き出し
            const pastRaceList = await puppetman.execute(goalNavi(targetHorse.onclick), pastRaceSelector, takePastRaceList)
                .then((r: any[]) => r.map(x => new PastRaceDataDto(x)));
            // 親情報を抜き出し
            const parent = await puppetman.execute([], parentInfoSelector, takeDadInfo) as ParentInfoDto;
            logger.info(`Regist start! count: ${i + 1}/${horseList.length}`);
            // エンティティに親情報を設定
            entity.dadHorseName = parent.dadHorseName;
            entity.secondDadHorseName = parent.secondDadHorseName;
            logger.debug(`pastRaceList: ${JSON.stringify(pastRaceList)}`);
            logger.debug(`parent: ${JSON.stringify(parent)}`);
            // DB反映
            const entitySetList = this.toEntitySetList(entity, pastRaceList, turfPlaceList);
            logger.info(`entitySetListSize: ${entitySetList.length}`);
            this.databaseService.reflect(entitySetList, entity);
        }
    }

    /**
     * 検索対象馬かどうかを判定する
     * @param dto HorseDataDto
     * @param entity HorseMaster
     */
    private isTarget(dto: HorseDataDto, entity: HorseMaster): boolean {
        // 馬齢は未更新の場合がある
        const horseAgeMax = new Date().getFullYear() - entity.birthYear;
        const horseAgeMin = horseAgeMax - 1;
        return dto.horseName == entity.horseName && horseAgeMin <= +dto.horseAge && +dto.horseAge <= horseAgeMax;
    }

    private toEntitySetList(horseMaster: HorseMaster, pastRaceList: PastRaceDataDto[], turfPlaceList: TurfPlaceMaster[]): EntitySetDto[] {
        return pastRaceList
            .map(p => {
                const turfPlaceMaster = turfPlaceList.find(t => t.turfPlaceName.includes(p.placeName));
                logger.debug(JSON.stringify(turfPlaceMaster));
                return {
                    turfPlaceMaster: {
                        turfPlaceCode: turfPlaceMaster ? turfPlaceMaster.turfPlaceCode : 'X0',
                        turfPlaceName: p.placeName,
                        roundType: 'X'
                    },
                    pastRaceDto: p
                };
            })
            .filter(x => x.turfPlaceMaster.turfPlaceCode.substr(0, 1) == 'X')
            .map(x => {
                const p = x.pastRaceDto;
                const raceData: RaceData = {
                    dateOfRace: p.raceDate,
                    turfPlaceCode: x.turfPlaceMaster.turfPlaceCode,
                    raceNumber: 1,
                    raceType: p.raceType == 'ダ' ? '2' : '1',
                    raceDistance: +p.distance,
                    horseAge: 'XX',
                    raceGrade: 'XX',
                    handicap: 'X',
                    mareOnly: 'X',
                    specialityRaceId: 0,
                    raceDetailId: 0
                };
                const raceDetail: RaceDetail = {
                    raceDetailId: 0,
                    horseId: horseMaster.horseId,
                    horseNumber: -1,
                    frameNumber: -1,
                    jockey: p.jockey,
                    trainer: 'UNKNOWN',
                    handicapWeight: +p.weight,
                    horseWeight: +p.horseWeight,
                    orderOfFinish: +p.orderOfFinish,
                    finishTime: timeStringToMilis(p.time)
                };
                const specialityRace: SpecialityRace = {
                    specialityRaceId: 0,
                    specialityRaceName: p.raceName
                };
                return {
                    raceData,
                    raceDetail,
                    specialityRace,
                    turfPlaceMaster: x.turfPlaceMaster
                };
            });
    }
};
