CREATE TABLE IF NOT EXISTS race_data (
  date_of_race DATE ,
  turf_place_code CHAR(2) ,
  race_number INT ,
  race_type CHAR(1) NOT NULL,
  weather CHAR(1),
  ground_condition CHAR(2),
  race_distance INT NOT NULL,
  horse_age CHAR(2) NOT NULL,
  race_grade CHAR(2) NOT NULL,
  handicap CHAR(1) NOT NULL,
  mare_only CHAR(1) NOT NULL,
  speciality_race_id INT ,
  race_detail_id INT NOT NULL UNIQUE,
  refund_id INT UNIQUE,
  PRIMARY KEY(date_of_race, turf_place_code, race_number)
);
