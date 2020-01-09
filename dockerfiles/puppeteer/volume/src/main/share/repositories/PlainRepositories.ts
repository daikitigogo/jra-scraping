import { EntityRepository } from './BaseRepositories';
import { HorseMaster } from '../entities';
// import { HorseMaster, RaceData, RaceDetail, Refund, SpecialityRace, TurfPlaceMaster } from '../entities';
import { Connection } from 'mariadb';

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

// /**
//  * Repository for RaceData.
//  */
// export class RaceDataRepository extends EntityRepository<RaceData> {

//     /** Constructor */
//     constructor() {
//         super(RaceData);
//     }

//     /**
//      * Search reflected race data
//      * @param conn Connection
//      * @param entity RaceData
//      * @returns Promise<Array<RaceData>>
//      */
//     async selectReflectedRaceData(conn: Connection, entity: RaceData): Promise<RaceData[]> {
//         const sql = `
//             SELECT
//                 *
//             FROM
//                 ${super.tableName()}
//             WHERE
//                 date_of_race = :dateOfRace
//                 AND turf_place_code = :turfPlaceCode
//                 AND refund_id IS NOT NULL
//             ;
//         `;
//         return super.select(conn, sql, entity);
//     }
// };

// /**
//  * Repository for RaceDetail.
//  */
// export class RaceDetailRepository extends EntityRepository<RaceDetail> {

//     /** Constructor */
//     constructor() {
//         super(RaceDetail);
//     }
// };

// /**
//  * Repository for RaceDetail.
//  */
// export class RefundRepository extends EntityRepository<Refund> {

//     /** Constructor */
//     constructor() {
//         super(Refund);
//     }
// };

// /**
//  * Repository for SpecialityRace.
//  */
// export class SpecialityRaceRepository extends EntityRepository<SpecialityRace> {

//     /** Constructor */
//     constructor() {
//         super(SpecialityRace);
//     }

//     /**
//      * Search by raceName.
//      * @param conn Connection
//      * @param entity SpecialityRace
//      * @returns Promise<SpecialityRace>
//      */
//     async selectOneBySpecialityRaceName(conn: Connection, entity: SpecialityRace): Promise<SpecialityRace> {
//         const sql = `
//             SELECT
//                 *
//             FROM
//                 ${super.tableName()}
//             WHERE
//                 speciality_race_name = :specialityRaceName
//             ;
//         `;
//         return super.select<object, SpecialityRace>(conn, sql, entity)
//             .then(r => r.find((_, i) => i == 0));
//     }
// };

// /**
//  * Repository for TurfPlaceMaster
//  */
// export class TurfPlaceMasterRepository extends EntityRepository<TurfPlaceMaster> {

//     /** Constructor */
//     constructor() {
//         super(TurfPlaceMaster);
//     }
// };
