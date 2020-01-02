import { BaseRepository } from "./BaseRepository";
import { SpecialityRace } from "#/share/entities";
import { Connection } from "mariadb";

/**
 * speciality_raceリポジトリ
 */
export class SpecialityRaceRepository extends BaseRepository<SpecialityRace> {

    /** コンストラクタ */
    constructor() {
        super(new SpecialityRace());
    }

    /**
     * レース名で検索
     * @param conn {Connection}
     * @param entity {SpecialityRace}
     * @returns {Promise<SpecialityRace>}
     */
    async selectOneBySpecialityRaceName(conn: Connection, entity: SpecialityRace): Promise<SpecialityRace> {
        const sql = `
            SELECT
                ${super.getColumns(entity).map(super.camelToSnake).join(', ')}
            FROM
                ${entity.tableName}
            WHERE
                speciality_race_name = :specialityRaceName
            ;
        `;
        return super.selectOne(conn, entity, sql);
    }
};
