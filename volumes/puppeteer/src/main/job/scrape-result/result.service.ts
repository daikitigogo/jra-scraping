import * as dtos from './result.dto';
import * as entities from "#/share/entity/plain.entity";
import {
    HorseMasterRepository,
    RaceDataRepository,
    RaceDetailRepository,
    RefundRepository,
    SpecialityRaceRepository,
    TurfPlaceMasterRepository
 } from "#/share/repository/plain.repository";
import { Pool, Connection } from "mariadb";
import { logger } from '#/logger';

/**
 * 過去レース結果取得ジョブ - データベース関連サービス
 */
export class ResultDatabaseService {

    /**
     * コンストラクタ
     * @param pool Pool
     * @param hmRepos HorseMasterRepository
     * @param rdRepos RaceDataRepository
     * @param rdtRepos RaceDetailRepository
     * @param rfRepos RefundRepository
     * @param srRepos SpecialityRaceRepositor
     * @param tpmRepos TurfPlaceMasterRepository
     */
    constructor(
        private pool: Pool,
        private hmRepos: HorseMasterRepository,
        private rdRepos: RaceDataRepository,
        private rdtRepos: RaceDetailRepository,
        private rfRepos: RefundRepository,
        private srRepos: SpecialityRaceRepository,
        private tpmRepos: TurfPlaceMasterRepository) { }

    /**
     * 競馬場マスタを全セレクトする
     * @returns Promise<TurfPlaceMaster[]>
     */
    async getTurfPlaceMaster(): Promise<entities.TurfPlaceMaster[]> {
        const conn = await this.pool.getConnection();
        try {
            const result = await this.tpmRepos.selectAll(conn);
            if (result.length == 0) {
                throw new Error('Not exists turf_place_master!');
            }
            return result;
        } finally {
            await conn.end();
        }
    }

    /**
     * 対象開催が反映済みかどうかを確認する
     * @param dateOfRace string
     * @param turfPlaceCode string
     * @returns Promise<boolean>
     */
    async isReflected(dateOfRace: string, turfPlaceCode: string): Promise<boolean> {
        const conn = await this.pool.getConnection();
        try {
            const entity = new entities.RaceData();
            entity.dateOfRace = dateOfRace;
            entity.turfPlaceCode = turfPlaceCode;
            const result = await this.rdRepos.selectReflectedRaceData(conn, entity);
            return result.length > 0;
        } finally {
            await conn.end();
        }
    }

    /**
     * スクレイピング結果をDBに反映する    
     * 全レース登録に成功した場合のみコミットする
     * @param entityList EntitySetDto[]
     */
    async reflectAllEntity(entityList: dtos.EntitySetDto[]) {

        const conn = await this.pool.getConnection();
        await conn.beginTransaction();

        try {
            for (let i = 0; i < entityList.length; i++) {
                logger.info(`Regist start! count: ${i + 1}/${entityList.length}`);
                await this.reflectEntity(conn, entityList[i]);
            }
            await conn.commit();
        } catch (e) {
            await conn.rollback();
            throw e;
        } finally {
            await conn.end();
        }
    }

    /**
     * 1レース分をDBに反映する
     * @param conn Connection
     * @param entitySet EntitySetDto
     */
    async reflectEntity(conn: Connection, entitySet: dtos.EntitySetDto) {

        // horse_master, race_detailを先に登録していく
        let detailId: number = null;
        for (const {raceDetail, horseMaster} of entitySet.raceDetails) {
            // horse_masterを反映(未登録なら登録、登録済みなら単にhorseIdが返る)
            const horseId = await this.reflectHorseMaster(conn, horseMaster);

            // race_detailを登録
            raceDetail.raceDetailId = detailId;
            raceDetail.horseId = horseId;
            const writeRsp = await this.rdtRepos.insert(conn, raceDetail);
            detailId = writeRsp.insertId;
        }

        // refundを登録
        let refundId: number = null;
        for (const refund of entitySet.refunds) {
            
            refund.refundId = refundId;
            const writeRsp = await this.rfRepos.insert(conn, refund);
            refundId = writeRsp.insertId;
        }

        // 特別レースが設定されている場合はspeciality_race登録
        if (entitySet.specialityRace) {
            const specialityRaceId = await this.reflectSpecialityRace(conn, entitySet.specialityRace);
            entitySet.raceData.specialityRaceId = specialityRaceId;
        }
        // raceDetailId, refundIdを設定してrace_data登録
        entitySet.raceData.raceDetailId = detailId;
        entitySet.raceData.refundId = refundId;
        await this.rdRepos.insert(conn, entitySet.raceData);
    }

    /**
     * horse_masterの反映    
     * - 名前、誕生年が同一のデータが存在しなければ新規に登録、登録したIDを返す
     * - 存在すればそのIDを返す
     * @param conn Connection
     * @param horseMaster HorseMaster
     * @returns Promise<number>
     */
    private async reflectHorseMaster(conn: Connection, horseMaster: entities.HorseMaster): Promise<number> {

        // 馬名と誕生年が一致するマスタデータが存在するかを確認
        const entity = await this.hmRepos.selectOneByHorseNameAndBirthYear(conn, horseMaster);
        // 存在する場合は取得したhorseIdを返却
        if (entity) {
            return entity.horseId;
        }
        // 存在しない場合は新規に登録、登録したhorseIdを返す
        const writeRsp = await this.hmRepos.insert(conn, horseMaster);
        return writeRsp.insertId;
    }

    /**
     * speciality_raceの反映    
     * - 同一のレース名が存在しなければ新規に登録、登録したIDを返す    
     * - 存在する場合はそのIDを返す
     * @param conn Connection
     * @param specialityRace entities.SpecialityRace
     * @returns Promise<number>
     */
    private async reflectSpecialityRace(conn: Connection, specialityRace: entities.SpecialityRace): Promise<number> {

        // レース名で検索
        const entity = await this.srRepos.selectOneBySpecialityRaceName(conn, specialityRace);
        // 存在する場合は取得したspecialityRaceIdを返す
        if (entity) {
            return entity.specialityRaceId;
        }
        // 存在しない場合は新規に登録、登録したIDを返す
        const writeRsp = await this.srRepos.insert(conn, specialityRace);
        return writeRsp.insertId;
    }
};