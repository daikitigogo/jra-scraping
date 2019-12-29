import { JraResultScraping } from '#/scraping/jra-result-scraping';
import { JraDbService } from '#/db/jra-db-service';
import { Converter } from '#/db/converter';
import { logger } from '#/logger';

export class MainController {

    constructor(
        private readonly jraResultScraping: JraResultScraping,
        private readonly jraDbService: JraDbService) { }
    
    async run(year: string, month: string, day: string) {
        logger.info(`Scraping start! year: ${year}, month: ${month}, day: ${day}`);
        const targetDataList = await this.jraResultScraping.execute(year, month, day);
        logger.info(`Scraping end! size: ${targetDataList.length}`);
        const turfPlaceList = await this.jraDbService.selectAllTurfPlaceMaster();
        const converter = new Converter(turfPlaceList);
        const entitySetList = targetDataList.map(t => converter.convert(t)).reduce((a, c) => a.concat(c), []);
        await this.jraDbService.registAll(entitySetList);
    }
}
