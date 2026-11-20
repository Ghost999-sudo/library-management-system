-- Additive migration for the borrow-request/approval workflow.
-- The existing loans table (including its status enum) is deliberately untouched.
-- Run once against library_management_system before starting the backend, because
-- spring.jpa.hibernate.ddl-auto=validate requires the table to exist.

CREATE TABLE IF NOT EXISTS borrow_requests (
  request_id BIGINT NOT NULL AUTO_INCREMENT,
  book_id BIGINT NOT NULL,
  member_id BIGINT NOT NULL,
  status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  request_date DATE NOT NULL,
  decided_by BIGINT DEFAULT NULL,
  decided_date DATE DEFAULT NULL,
  note VARCHAR(500) DEFAULT NULL,
  PRIMARY KEY (request_id),
  KEY idx_borrow_requests_member (member_id),
  KEY idx_borrow_requests_status (status),
  CONSTRAINT fk_borrow_requests_book FOREIGN KEY (book_id) REFERENCES books (book_id),
  CONSTRAINT fk_borrow_requests_member FOREIGN KEY (member_id) REFERENCES members (member_id),
  CONSTRAINT fk_borrow_requests_decided_by FOREIGN KEY (decided_by) REFERENCES users (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
