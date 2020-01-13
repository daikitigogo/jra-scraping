import {RaceData, RaceDetail, SpecialityRace } from '#/share/entity/plain.entity';

export class HorseDataDto {
    horseName: string;
    horseAge: string;
    onclick: string;
};

export class ParentInfoDto {
    dadHorseName: string;
    secondDadHorseName: string;
};

export class PastRaceDataDto {

    constructor(value: string[]) {
        this.raceDate = value[0].replace('.', '/');
        this.placeName = value[1];
        this.raceName = value[2];
        this.raceType = value[3].substr(0, 1);
        this.distance = value[3].substr(1);
        this.orderOfFinish = value[7];
        this.jockey = value[8];
        this.weight = value[9];
        this.horseWeight = value[10];
        this.time = value[11];
    }

    raceDate: string;
    placeName: string;
    raceName: string;
    raceType: string;
    distance: string;
    orderOfFinish: string;
    jockey: string;
    weight: string;
    horseWeight: string;
    time: string;
};

export interface EntitySetDto {
    raceData: RaceData;
    raceDetail: RaceDetail;
    specialityRace: SpecialityRace;
};
