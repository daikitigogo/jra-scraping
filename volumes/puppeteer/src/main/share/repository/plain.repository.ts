import { DataAccessBase, WriteResponse } from './base.repository';
import {
    HorseMaster,
    RaceData,
    RaceDetail,
    Refund,
    SpecialityRace,
    TurfPlaceMaster
} from '../entity/plain.entity';
import { Connection } from 'mariadb';
import { Entity } from '../decorator/table.decorator';
import { logger } from '#/logger';
import * as fu from '../utility/function.utility';
import 'reflect-metadata';

/**
 * Table information
 */
interface TableInfo {
    /** table name */
    readonly tableName: string;
    /** primary key set */
    readonly primaryKeySet: Set<string>;
};

/**
 * Repository for plane entity.
 */
class EntityRepository<T> extends DataAccessBase {

    /** Table base information */
    private readonly tableInfo: TableInfo; 

    /** Getter for tableName */
    tableName(): string {
        return fu.pascalToSnake(this.tableInfo.tableName);
    }
    /** Getter for primaryKeySet */
    primaryKeySet(): string[] {
        return Array.from(this.tableInfo.primaryKeySet).map(p => fu.camelToSnake(p));
    }

    /**
     * Constructor...
     * @param ctor { new(): T } T creator
     * @param option mariadb.QueryOptions
     */
    constructor(ctor: { new(): T }) {
        super();
        const entity = new ctor();
        this.tableInfo = Reflect.getMetadata(Entity.key, entity.constructor);
        Reflect.deleteMetadata(Entity.key, entity.constructor);
    }

    /**
     * Select all.
     * @param conn mariadb.Connection
     * @returns Promise<T[]>
     */
    async selectAll(conn: Connection): Promise<T[]> {
        const sql = `SELECT * FROM ${this.tableName()};`;
        logger.debug(`Call selectAll.`)
        const result = await super.select<any, T>(conn, sql);
        logger.debug(`End selectAll.`);
        return result;
    }

    /**
     * Select by primary key.
     * @param conn mariadb.Connection
     * @param primary P
     * @returns Promise<T>
     */
    async selectOne(conn: Connection, primary: object): Promise<T> {
        const where = this.primaryKeySet().map(p => `${p} = :${fu.snakeToCamel(p)}`).join(' AND ');
        const sql = `SELECT * FROM ${this.tableName()} WHERE ${where};`;
        logger.debug(`Call selectOne.`);
        const result = await super.select<object, T>(conn, sql, primary);
        logger.debug(`End selectOne.`);
        return result.find((_, i) => i == 0);
    }

    /**
     * Default insert.
     * @param conn mariadb.Connection
     * @param entity T
     * @returns Promise<WriteResponse>
     */
    async insert(conn: Connection, entity: T): Promise<WriteResponse> {
        const sql = `INSERT INTO ${this.tableName()} (${Object.keys(entity).map(k => fu.camelToSnake(k)).join(', ')}) VALUES (${Object.keys(entity).map(k => ':' + k).join(', ')})`;
        logger.debug(`Call insert.`);
        const result = await super.write(conn, sql, entity);
        logger.debug(`End insert.`);
        return result;
    }

    /**
     * Default update.
     * @param conn mariadb.Connection
     * @param entity T
     * @returns Promise<WriteResponse>
     */
    async update(conn: Connection, entity: T): Promise<WriteResponse> {
        const noPrimary = Object.keys(entity).filter(k => !this.tableInfo.primaryKeySet.has(k));
        const updates = noPrimary.map(k => `${fu.camelToSnake(k)} = :${k}`);
        const where = this.primaryKeySet().map(p => `${p} = :${fu.snakeToCamel(p)}`).join(' AND ');
        const sql = `UPDATE ${this.tableName()} SET ${updates.join(', ')} WHERE ${where}`;
        logger.debug(`Call update.`);
        const result = await super.write(conn, sql, entity);
        logger.debug(`End update.`)
        return result;
    }
}

/**
 * Repository for HorseMaster.
 */
export class HorseMasterRepository extends EntityRepository<HorseMaster> {

    /** Constructor */
    constructor() {
        super(HorseMaster);
    }

    /**
     * Search by horseName and birthYear.
     * @param conn Connection
     * @param entity HorseMaster
     * @returns Promise<HorseMaster>
     */
    async selectOneByHorseNameAndBirthYear(conn: Connection, entity: HorseMaster): Promise<HorseMaster> {
        const sql = `
            SELECT
                *
            FROM
                ${super.tableName()}
            WHERE
                horse_name = :horseName
                AND birth_year = :birthYear
            ;
        `;
        return await super.select<any, HorseMaster>(conn, sql, entity)
            .then(r => r.find((_, i) => i == 0));
    }

    /**
     * Search dadHorseName is null and secondDadHorseName is null.
     * @param conn Connection
     * @returns Promise<HorseMaster[]>
     */
    async selectNoReflectParentInfo(conn: Connection): Promise<HorseMaster[]> {
        const sql = `
            SELECT
                *
            FROM
                ${super.tableName()}
            WHERE
                NULLIF(dad_horse_name, '') IS NULL
                AND NULLIF(second_dad_horse_name, '') IS NULL
            ORDER BY
                horse_id
        `;
        return await super.select<never, HorseMaster>(conn, sql);
    }
};

/**
 * Repository for RaceData.
 */
export class RaceDataRepository extends EntityRepository<RaceData> {

    /** Constructor */
    constructor() {
        super(RaceData);
    }

    /**
     * Search reflected race data
     * @param conn Connection
     * @param entity RaceData
     * @returns Promise<Array<RaceData>>
     */
    async selectReflectedRaceData(conn: Connection, entity: RaceData): Promise<RaceData[]> {
        const sql = `
            SELECT
                *
            FROM
                ${super.tableName()}
            WHERE
                date_of_race = :dateOfRace
                AND turf_place_code = :turfPlaceCode
                AND refund_id IS NOT NULL
            ;
        `;
        return super.select(conn, sql, entity);
    }

    /**
     * 
     * @param conn Connection
     * @param cond RaceData
     */
    async selectTargetRaces(conn: Connection, entity: RaceData): Promise<RaceData[]> {
        const sql = `
            SELECT
                *
            FROM
                ${super.tableName()}
            WHERE
                date_of_race = :dateOfRace
                AND turf_place_code = :turfPlaceCode
        `;
        return super.select(conn, sql, entity);
    }
};

/**
 * Repository for RaceDetail.
 */
export class RaceDetailRepository extends EntityRepository<RaceDetail> {

    /** Constructor */
    constructor() {
        super(RaceDetail);
    }
};

/**
 * Repository for RaceDetail.
 */
export class RefundRepository extends EntityRepository<Refund> {

    /** Constructor */
    constructor() {
        super(Refund);
    }
};

/**
 * Repository for SpecialityRace.
 */
export class SpecialityRaceRepository extends EntityRepository<SpecialityRace> {

    /** Constructor */
    constructor() {
        super(SpecialityRace);
    }

    /**
     * Search by raceName.
     * @param conn Connection
     * @param entity SpecialityRace
     * @returns Promise<SpecialityRace>
     */
    async selectOneBySpecialityRaceName(conn: Connection, entity: SpecialityRace): Promise<SpecialityRace> {
        const sql = `
            SELECT
                *
            FROM
                ${super.tableName()}
            WHERE
                speciality_race_name = :specialityRaceName
            ;
        `;
        return super.select<object, SpecialityRace>(conn, sql, entity)
            .then(r => r.find((_, i) => i == 0));
    }
};

/**
 * Repository for TurfPlaceMaster
 */
export class TurfPlaceMasterRepository extends EntityRepository<TurfPlaceMaster> {

    /** Constructor */
    constructor() {
        super(TurfPlaceMaster);
    }

    /**
     * X始まりの中で最大の競馬場コードを返す
     * @param conn Connection
     */
    async selectMaxTurfPlaceCode(conn: Connection): Promise<string> {
        const sql = `
            SELECT
                MAX(turf_place_code) AS turf_place_code
            FROM
                turf_place_master
            WHERE
                turf_place_code LIKE 'X_'
            ;
        `;
        const result = await super.select<never, TurfPlaceMaster>(conn, sql);
        return result[0].turfPlaceCode || 'X@';
    }
};
