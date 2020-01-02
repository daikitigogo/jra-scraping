import { BaseRepository } from '#/share/repositories/BaseRepository';
import { HorseMaster } from '#/share/entities';
import { Connection } from 'mariadb';

/**
 * horse_masterリポジトリ
 */
export class HorseMasterRepository extends BaseRepository<HorseMaster> {

    /** コンストラクタ */
    constructor() {
        super(new HorseMaster());
    }

    /**
     * 馬名と誕生年で検索
     * @param conn {Connection}
     * @param entity {HorseMaster}
     * @returns {Promise<HorseMaster>}
     */
    async selectOneByHorseNameAndBirthYear(conn: Connection, entity: HorseMaster): Promise<HorseMaster> {
        const sql = `
            SELECT
                ${super.getColumns(entity).map(super.camelToSnake).join(', ')}
            FROM
                ${entity.tableName}
            WHERE
                horse_name = :horseName
                AND birth_year = :birthYear
            ;
        `;
        return await super.selectOne(conn, entity, sql);
    }
}