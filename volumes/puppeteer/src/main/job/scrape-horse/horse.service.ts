import {
    HorseMasterRepository,
    RaceDataRepository,
    RaceDetailRepository,
    SpecialityRaceRepository,
    TurfPlaceMasterRepository
 } from "#/share/repository/plain.repository";
import { EntitySetDto } from "./horse.dto";
import { HorseMaster, RaceData, TurfPlaceMaster, SpecialityRace } from "#/share/entity/plain.entity";
import { Connection, Pool } from 'mariadb';

export class HorseDatabaseService {

    constructor(
        private pool: Pool,
        private hmRepos: HorseMasterRepository,
        private rdRepos: RaceDataRepository,
        private rdtRepos: RaceDetailRepository,
        private srRepos: SpecialityRaceRepository,
        private tpmRepos: TurfPlaceMasterRepository) { }

    
    /** 親情報未設定の競走馬一覧を返す */
    async selectNoReflectParentInfo(): Promise<HorseMaster[]> {
        const conn = await this.pool.getConnection();
        try {
            return await this.hmRepos.selectNoReflectParentInfo(conn);
        } finally {
            await conn.end();
        }
    }

    /**
     * 競馬場マスタを全セレクトする
     * @returns Promise<TurfPlaceMaster[]>
     */
    async getTurfPlaceMaster(): Promise<TurfPlaceMaster[]> {
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

    async reflect(entitySetList: EntitySetDto[], horseMaster: HorseMaster) {

        const conn = await this.pool.getConnection();
        await conn.beginTransaction();
        try {
            for (const entitySet of entitySetList) {
                const specialityRaceId = await this.reflectSpecialityRace(conn, entitySet.specialityRace);
                entitySet.raceData.specialityRaceId = specialityRaceId;
                const raceData = await this.completeRaceData(conn, entitySet.raceData);
                entitySet.raceDetail.raceDetailId = raceData.raceDetailId;
                await this.rdtRepos.insert(conn, entitySet.raceDetail);
                await this.rdRepos.insert(conn, raceData);
                if (entitySet.turfPlaceMaster.turfPlaceCode == 'X0') {
                    entitySet.turfPlaceMaster.turfPlaceCode = raceData.turfPlaceCode;
                    await this.tpmRepos.insert(conn, entitySet.turfPlaceMaster);
                }
            }
            await this.hmRepos.update(conn, horseMaster);
            await conn.commit();
        } catch(e) {
            await conn.rollback();
        } finally {
            await conn.end();
        }
    }

    async reflectSpecialityRace(conn: Connection, specialityRace: SpecialityRace) {

        // レース名で検索
        const entity = await this.srRepos.selectOneBySpecialityRaceName(conn, specialityRace);
        // 見つからなければ新規に登録
        if (!entity) {
            const writeRsp = await this.srRepos.insert(conn, specialityRace);
            return writeRsp.insertId;
        }
        return entity.specialityRaceId;
    }

    async completeRaceData(conn: Connection, raceData: RaceData): Promise<RaceData> {

        const result = {...raceData};

        // 初登録の競馬場の場合はコードを採番し、新規に登録する
        if (raceData.turfPlaceCode == 'X0') {
            const maxTurfPlaceCode = await this.tpmRepos.selectMaxTurfPlaceCode(conn);
            const prefix = maxTurfPlaceCode.substr(0, 1);
            const alpha = maxTurfPlaceCode.substr(1);
            result.turfPlaceCode = prefix + String.fromCodePoint(alpha.codePointAt(0) + 1);
        }

        // レース開催日時、競馬場コードが一致するレース情報を取得
        const targetRaces = await this.rdRepos.selectTargetRaces(conn, raceData);
        if (targetRaces.length > 0) {
            // 特別レースIDが一致するレースが存在するかチェック
            const matchedRace = targetRaces.find(t => t.specialityRaceId == raceData.specialityRaceId);
            if (matchedRace) {
                result.raceNumber = matchedRace.raceNumber;
                result.raceDetailId = matchedRace.raceDetailId;
            } else {
                const maxRaceNumber = targetRaces.map(t => t.raceNumber).reduce((a, c) => c > a ? c : a);
                result.raceNumber = maxRaceNumber + 1;
            }
        }
        return result;
    }
};
