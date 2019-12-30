import { ResultScrapingService } from "#/jobs/scraping/result/ResultScrapingService";
import { ReflectDbService } from "#/share/services/ReflectDbService";
import { Converter } from "#/jobs/scraping/result/Converter";
import { logger } from "#/logger";

export class ResultScrapingJob {

    constructor(
        private resultScrapingService: ResultScrapingService,
        private reflectDbService: ReflectDbService) { }

    async run(year: string, month: string, day: string) {
        const turfPlaceList = await this.reflectDbService.selectAllTurfPlaceMaster();
        const targets = await this.resultScrapingService.getTargetRaces(year, month, day);
        if (targets.length == 0) {
            logger.info('Target nothing!');
        }
        for (const target of targets) {
            const turfPlaceCode = turfPlaceList.find(x => target.turfPlaceName.includes(x.turfPlaceName)).turfPlaceCode;
            const date = `${year}/${target.date}`;
            const count = await this.reflectDbService.selectReflectedRaceData(date, turfPlaceCode);
            if (count > 0) {
                logger.info(`Skip raceData! ${date}, ${turfPlaceCode}`);
                continue;
            }
            logger.info(`Scraping start! target: ${JSON.stringify(target)}`);
            const targetData = await this.resultScrapingService.execute(year, month, target);
            const converter = new Converter(turfPlaceList);
            const entitySetList = converter.convert(targetData);
            await this.reflectDbService.registAll(entitySetList);
        }
    }
}