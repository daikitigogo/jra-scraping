CREATE TABLE IF NOT EXISTS speciality_race (
  speciality_race_id INT AUTO_INCREMENT,
  speciality_race_name VARCHAR(50) NOT NULL UNIQUE,
  old_race_id INT ,
  PRIMARY KEY(speciality_race_id)
);
