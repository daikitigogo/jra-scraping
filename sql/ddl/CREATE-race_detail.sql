CREATE TABLE race_detail (
  race_detail_id INT AUTO_INCREMENT,
  horse_number INT ,
  frame_number INT NOT NULL,
  horse_id INT NOT NULL,
  jockey VARCHAR(30) NOT NULL,
  trainer VARCHAR(30) NOT NULL,
  handicap_weight DOUBLE NOT NULL,
  win_pop INT ,
  horse_weight INT ,
  order_of_finish INT ,
  finish_time INT ,
  margin VARCHAR(30) ,
  time_of_3f DOUBLE, 
  PRIMARY KEY(race_detail_id, horse_number)
);
