import { Repository } from './repository';
import * as entities from './entities';
import sqls from './jra-repository-sqls';

export class JraRepository {

    /**
     * コンストラクタ
     * @param rep Repository
     */
    constructor(private rep: Repository) { }

    /**
     * 全競馬場情報を取得
     * @returns Promise<entity.TurfPlaceMaster[]>
     */
    async selectAllTurfPlaceMaster(): Promise<entities.TurfPlaceMaster[]> {
        return await this.rep.select<entities.TurfPlaceMaster>('SELECT * FROM turf_place_master;');
    }

    /**
     * 馬名で競走馬マスタを検索する
     * @param horseName string
     */
    async searchHorseMasterByName(horseName: string): Promise<entities.HorseMaster[]> {
        return await this.rep.select<entities.HorseMaster>('SELECT * FROM horse_master WHERE horse_name = ?', horseName);
    }

    /**
     * 競走馬をマスタに登録する
     * @param horseName string
     */
    async insertHorseMaster(horseName: string) {
        const entity = new entities.HorseMaster();
        entity.horseName = horseName;
        console.log(entity);
        return await this.rep.write(sqls.insertHorseMasterSQL, entity);
    }
};