import { Required, Format, DecoratorExecutor } from '#/share/decorators';

/**
 * オッズ詳細
 */
export class OddsDetailDto extends DecoratorExecutor {
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

    /** 馬番 */
    @Required.decorator()
    num: string;
    /** 払い戻し */
    @Required.decorator()
    @Format.decorator({ regexp: '[^0-9]' })
    yen: string;
    /** 人気 */
    @Required.decorator()
    @Format.decorator({ regexp: '[^0-9]' })
    pop: string;
}
