export const selectAllTurfPlaceMasterSQL = `
    SELECT
        turf_place_code,
        turf_place_name,
        round_type
    FROM
        turf_place_master
`;

export const insertRaceDetailSQL = `
    INSERT INTO race_detail (
        race_detail_id,
        horse_number,
        frame_number,
        horse_id,
        jockey,
        trainer,
        handicap_weight,
        win_pop,
        horse_weight,
        order_of_finish,
        finish_time,
        margin,
        time_of_3f
    ) VALUES (
        :raceDetailId,
        :horseNumber,
        :frameNumber,
        :horseId,
        :jockey,
        :trainer,
        :handicapWeight,
        :winPop,
        :horseWeight,
        :orderOfFinish,
        :finishTime,
        :margin,
        :timeOf3F
    );
`;

export const insertRefundSQL = `
    INSERT INTO refund (
        refund_id,
        refund_kind,
        refund_seq,
        first_number,
        second_number,
        third_number,
        refund_amount,
        refund_pop
    ) VALUES (
        :refundId,
        :refundKind,
        :refundSeq,
        :firstNumber,
        :secondNumber,
        :thirdNumber,
        :refundAmount,
        :refundPop
    );
`;

export const insertRaceDataSQL = `
    INSERT INTO race_data (
        date_of_race,
        turf_place_code,
        race_number,
        race_type,
        weather,
        ground_condition,
        race_distance,
        horse_age,
        race_grade,
        handicap,
        mare_only,
        speciality_race_id,
        race_detail_id,
        refund_id
    ) VALUES (
        :dateOfRace,
        :turfPlaceCode,
        :raceNumber,
        :raceType,
        :weather,
        :groundCondition,
        :raceDistance,
        :horseAge,
        :raceGrade,
        :handicap,
        :mareOnly,
        :specialityRaceId,
        :raceDetailId,
        :refundId
    );
`;

export const selectHorseMasterSQL = `
    SELECT
        horse_id,
        horse_name,
        birth_year,
        sex,
        dad_horse_name,
        second_dad_horse_name
    FROM
        horse_master
    WHERE
        horse_name = :horseName
        AND birth_year = :birthYear
    ;
`;

/**
 * 競走馬マスタ登録SQL
 */
export const insertHorseMasterSQL = `
    INSERT INTO horse_master (
        horse_id,
        horse_name,
        birth_year,
        sex,
        dad_horse_name,
        second_dad_horse_name
    ) VALUES (
        :horseId,
        :horseName,
        :birthYear,
        :sex,
        :dadHorseName,
        :secondDadHorseName
    );
`;

export const selectSpecialityRaceSQL = `
    SELECT
        speciality_race_id,
        speciality_race_name,
        old_race_id
    FROM
        speciality_race
    WHERE
        speciality_race_name = :specialityRaceName
    ;
`;

export const insertSpecialityRaceSQL = `
    INSERT INTO speciality_race (
        speciality_race_id,
        speciality_race_name,
        old_race_id
    ) VALUES (
        NULL,
        :specialityRaceName,
        NULL
    );
`;

export const selectReflectedRaceDataSQL = `
    SELECT * FROM race_data WHERE date_of_race = :dateOfRace AND turf_place_code = :turfPlaceCode AND refund_id IS NOT NULL;
`;
