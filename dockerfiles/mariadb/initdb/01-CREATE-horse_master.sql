CREATE TABLE horse_master (
  horse_id INT AUTO_INCREMENT,
  horse_name VARCHAR(10) NOT NULL,
  birth_year INT NOT NULL,
  sex CHAR(1) NOT NULL,
  dad_horse_name VARCHAR(10) ,
  second_dad_horse_name VARCHAR(10) ,
  PRIMARY KEY(horse_id),
  UNIQUE(horse_name, birth_year)
);
