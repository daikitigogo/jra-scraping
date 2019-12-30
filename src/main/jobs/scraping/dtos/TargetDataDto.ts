import { Required, DecoratorExecutor} from '#/share/decorators';
import { RaceDataDto } from '#/jobs/scraping/dtos';

/**
 * 対象レースデータ
 */
export class TargetDataDto extends DecoratorExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, string]) => {
            // @ts-ignore
            this[k] = v;
        });
    }

    /** 開催日 */
    @Required.decorator()
    date: string;
    /** 開催馬場 */
    @Required.decorator()
    turfPlaceName: string;
    /** 開催日・開催場馬へのonclickリンク */
    @Required.decorator()
    onclick: string;
    /** レースリスト */
    raceDataList: RaceDataDto[];
};
