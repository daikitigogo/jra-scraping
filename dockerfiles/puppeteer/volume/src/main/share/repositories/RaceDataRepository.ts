import { BaseRepository } from "./BaseRepository";
import { RaceData } from "#/share/entities";
import { Connection } from "mariadb";

/**
 * race_dataリポジトリ
 */
export class RaceDataRepository extends BaseRepository<RaceData> {

    /** コンストラクタ */
    constructor() {
        super(new RaceData());
    }

    /**
     * 払戻情報まで登録済みのレースデータを取得する
     * @param conn {Connection}
     * @param entity {RaceData}
     * @returns {Promise<Array<RaceData>>}
     */
    async selectReflectedRaceData(conn: Connection, entity: RaceData): Promise<Array<RaceData>> {
        const sql = `
            SELECT
                ${super.getColumns(entity).map(super.camelToSnake).join(', ')}
            FROM
                ${entity.tableName}
            WHERE
                date_of_race = :dateOfRace
                AND turf_place_code = :turfPlaceCode
                AND refund_id IS NOT NULL
            ;
        `;
        return super.select(conn, entity, sql);
    }
};