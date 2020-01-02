import { DecoratorExecutor} from '#/share/decorators';
import { OddsDetailDto } from '#/share/dtos/OddsDetailDto';

/**
 * スクレイピング結果オッズ情報
 */
export class OddsInfoDto extends DecoratorExecutor {
    /**
     * constructor
     * @param jsObj {any} scraping result on browser
     */
    constructor(obj: any) {
        super();
        Object.entries(obj).forEach(([k, v]: [string, any[]]) => {
            // 枠連はない場合があるので、その場合は空リストにしておく
            if (k == 'wakuren' && v.length == 1 && v.every(x => !x.num && !x.yen && !x.pop)) {
                this[k] = [];
            } else {
                // @ts-ignore
                this[k] = v.map(x => new OddsDetailDto(x));
            }
        });
    }

    /** 単勝 */
    win: OddsDetailDto[];
    /** 複勝 */
    place: OddsDetailDto[];
    /** 枠連 */
    wakuren: OddsDetailDto[];
    /** ワイド */
    wide: OddsDetailDto[];
    /** 馬連 */
    umaren: OddsDetailDto[];
    /** 馬単 */
    umatan: OddsDetailDto[];
    /** 三連複 */
    trio: OddsDetailDto[];
    /** 三連単 */
    tierce: OddsDetailDto[];
};
