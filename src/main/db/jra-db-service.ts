import { DbUtil } from '#/db/db-util';
import * as sqls from '#/db/sqls';
import * as mariadb from 'mariadb';
import { EntitySet } from '#/db/converter';
import * as entities from '#/db/entities';
import { logger } from '#/logger';

export class JraDbService {

    /**
     * コンストラクタ
     * @param rep Repository
     */
    constructor(private pool: mariadb.Pool, private readonly dbUtil: DbUtil) { }

    async selectAllTurfPlaceMaster(): Promise<entities.TurfPlaceMaster[]> {
        const conn = await this.pool.getConnection();
        try {
            return await this.dbUtil.select<entities.TurfPlaceMaster>(conn, sqls.selectAllTurfPlaceMasterSQL);
        } finally {
            conn.end();
        }
    }

    async registAll(values: EntitySet[]) {

        const conn = await this.pool.getConnection();
        await conn.beginTransaction();

        try {
            for (let i = 0; i < values.length; i++) {
                logger.info(`Regist start! count: ${i + 1}/${values.length}`);
                await this.regist(conn, values[i]);
            }
            await conn.commit();
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            await conn.end();
        }
    }

    private async regist(conn: mariadb.Connection, value: EntitySet) {

        let detailId: number = null;
        for (const detail of value.raceDetails) {
            const horseMaster = await this.dbUtil.selectOne<entities.HorseMaster>(conn, sqls.selectHorseMasterSQL, detail.horseMaster);
            logger.info(`horseMaster: ${JSON.stringify(horseMaster, undefined, 2)}`);
            if (!horseMaster.horseId) {
                const writeRsp = await this.dbUtil.write(conn, sqls.insertHorseMasterSQL, detail.horseMaster);
                detail.raceDetail.horseId = writeRsp.insertId;
            } else {
                detail.raceDetail.horseId = horseMaster.horseId;
            }
            if (detailId != null) {
                detail.raceDetail.raceDetailId = detailId;
            }
            const writeRsp = await this.dbUtil.write(conn, sqls.insertRaceDetailSQL, detail.raceDetail);
            detailId = writeRsp.insertId;
        }

        let refundId: number = null;
        for (const refund of value.refunds) {
            if (refundId != null) {
                refund.refundId = refundId;
            }
            const writeRsp = await this.dbUtil.write(conn, sqls.insertRefundSQL, refund);
            refundId = writeRsp.insertId;
        }

        if (value.specialityRace) {
            const specialityRace = await this.dbUtil.selectOne<entities.SpecialityRace>(conn, sqls.selectSpecialityRaceSQL, value.specialityRace);
            if (specialityRace.specialityRaceId) {
                value.raceData.specialityRaceId = specialityRace.specialityRaceId;
            } else {
                const writeRsp = await this.dbUtil.write(conn, sqls.insertSpecialityRaceSQL, value.specialityRace);
                value.raceData.specialityRaceId = writeRsp.insertId;
            }
        }
        value.raceData.raceDetailId = detailId;
        value.raceData.refundId = refundId;
        await this.dbUtil.write(conn, sqls.insertRaceDataSQL, value.raceData);
    }
};