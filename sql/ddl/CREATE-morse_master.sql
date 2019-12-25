CREATE TABLE horse_master (
  horse_id INT AUTO_INCREMENT,
  horse_name VARCHAR(10) NOT NULL,
  birth_year INT NOT NULL,
  dad_horse_id INT ,
  second_dad_horse_id INT ,
  third_dad_horse_id INT ,
  PRIMARY KEY(horse_id),
  UNIQUE(horse_name, birth_year)
);
