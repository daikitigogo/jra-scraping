CREATE TABLE IF NOT EXISTS refund (
  refund_id INT AUTO_INCREMENT,
  refund_kind CHAR(1) ,
  refund_seq INT ,
  first_number INT NOT NULL,
  second_number INT ,
  third_number INT ,
  refund_amount INT NOT NULL,
  refund_pop INT NOT NULL,
  PRIMARY KEY(refund_id, refund_kind, refund_seq)
);
