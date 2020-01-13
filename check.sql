SELECT * FROM race_data rd WHERE weather NOT IN ('1', '2', '3', '4');
SELECT * FROM race_data rd WHERE race_type NOT IN ('1', '2', '3');
SELECT * FROM race_data rd WHERE horse_age NOT IN ('20', '30', '31', '41');
SELECT * FROM race_data rd WHERE race_grade NOT IN ('00', '01', '10', '20', '30', 'OP', 'OL', 'G0', 'G1', 'G2', 'G3', 'J1', 'J2', 'J3');
SELECT * FROM race_data rd WHERE handicap NOT IN ('1', '2', '3', '4');
SELECT * FROM race_data rd WHERE mare_only NOT IN ('0', '1');
SELECT * FROM race_data rd WHERE refund_id IS NULL;
SELECT * FROM horse_master hm WHERE sex NOT IN ('M', 'F', 'S');
SELECT * FROM speciality_race WHERE speciality_race_name LIKE '%桜花賞%'
