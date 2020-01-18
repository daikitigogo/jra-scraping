CREATE TABLE IF NOT EXISTS turf_place_master (
  turf_place_code CHAR(2) ,
  turf_place_name VARCHAR(30) NOT NULL UNIQUE,
  round_type CHAR(1) NOT NULL,
  PRIMARY KEY(turf_place_code)
);
