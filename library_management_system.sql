-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 20, 2026 at 04:58 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `library_management_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `authors`
--

CREATE TABLE `authors` (
  `author_id` bigint(20) NOT NULL,
  `author_name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `authors`
--

INSERT INTO `authors` (`author_id`, `author_name`) VALUES
(1, 'QA Author'),
(2, 'James Clear'),
(3, 'Margaret A. Ogola'),
(4, 'Chimamanda Ngozi Adichie'),
(5, 'Paulo Coelho'),
(6, 'William Robert Ochieng\''),
(7, 'A. E. Afigbo'),
(8, 'E. A. Ayandele'),
(9, 'R. J. Gavin'),
(10, 'J. D. Omer-Cooper'),
(11, 'Robin Palmer'),
(12, 'Jane B. Reece'),
(13, 'Raymond A. Serway'),
(14, 'John W. Jewett'),
(15, 'Stephen R. Covey'),
(16, 'Mark Saunders'),
(17, 'Philip Lewis'),
(18, 'Adrian Thornhill'),
(19, 'John W. Creswell');

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` bigint(20) NOT NULL,
  `category_id` bigint(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `ISBN` varchar(20) DEFAULT NULL,
  `publisher` varchar(150) DEFAULT NULL,
  `publication_year` year(4) DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`book_id`, `category_id`, `title`, `ISBN`, `publisher`, `publication_year`, `description`) VALUES
(2, 1, 'QA Test Book', 'QA-ISBN-001', 'QA Press', '2026', 'Seeded for manual QA'),
(10, 2, 'Clean Code', NULL, 'Robert C. Martin', '2018', 'Software engineering and programming practices'),
(11, 2, 'Introduction to Algorithms', NULL, 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest and Clifford Stein', NULL, NULL),
(12, 3, 'Statistics for Business and Economics', NULL, 'David R. Anderson and colleagues', NULL, NULL),
(13, 10, 'Atomic Habits', NULL, 'James Clear', '2019', NULL),
(14, 7, 'The River and the Source', NULL, 'Margaret A. Ogola', NULL, NULL),
(15, 6, 'Half of a Yellow Sun', NULL, NULL, NULL, NULL),
(16, 6, 'The Alchemist', NULL, NULL, NULL, NULL),
(17, 8, 'A History of Kenya', NULL, NULL, NULL, NULL),
(18, 8, 'The Making of Modern Africa', NULL, NULL, NULL, NULL),
(19, 9, 'Campbell Biology', NULL, NULL, NULL, NULL),
(20, 9, 'Physics for Scientists and Engineers', NULL, NULL, NULL, NULL),
(21, 10, 'The 7 Habits of Highly Effective People', NULL, NULL, NULL, NULL),
(22, 11, 'Research Methods for Business Students', NULL, NULL, NULL, NULL),
(23, 11, 'Research Design: Qualitative, Quantitative, and Mixed Methods Approaches', NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `book_authors`
--

CREATE TABLE `book_authors` (
  `book_id` bigint(20) NOT NULL,
  `author_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_authors`
--

INSERT INTO `book_authors` (`book_id`, `author_id`) VALUES
(2, 1),
(10, 1),
(13, 2),
(14, 3),
(15, 4),
(16, 5),
(17, 6),
(18, 7),
(18, 8),
(18, 9),
(18, 10),
(18, 11),
(19, 12),
(20, 13),
(20, 14),
(21, 15),
(22, 16),
(22, 17),
(22, 18),
(23, 19);

-- --------------------------------------------------------

--
-- Table structure for table `book_copies`
--

CREATE TABLE `book_copies` (
  `copy_id` bigint(20) NOT NULL,
  `book_id` bigint(20) NOT NULL,
  `accession_number` varchar(50) NOT NULL,
  `status` enum('AVAILABLE','BORROWED','DAMAGED','LOST') NOT NULL DEFAULT 'AVAILABLE',
  `acquired_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `book_copies`
--

INSERT INTO `book_copies` (`copy_id`, `book_id`, `accession_number`, `status`, `acquired_date`) VALUES
(2, 2, 'QA-ACC-001', 'AVAILABLE', '2026-01-10'),
(8, 13, '001', 'BORROWED', '2024-03-06'),
(9, 14, 'LIB-ACC-0030', 'AVAILABLE', NULL),
(10, 15, 'LIB-ACC-0031', 'AVAILABLE', NULL),
(11, 15, 'LIB-ACC-0032', 'AVAILABLE', NULL),
(12, 16, 'LIB-ACC-0033', 'AVAILABLE', NULL),
(13, 16, 'LIB-ACC-0034', 'AVAILABLE', NULL),
(14, 17, 'LIB-ACC-0035', 'BORROWED', NULL),
(15, 17, 'LIB-ACC-0036', 'AVAILABLE', NULL),
(16, 18, 'LIB-ACC-0037', 'AVAILABLE', NULL),
(17, 18, 'LIB-ACC-0038', 'AVAILABLE', NULL),
(18, 19, 'LIB-ACC-0039', 'BORROWED', NULL),
(19, 19, 'LIB-ACC-0040', 'AVAILABLE', NULL),
(20, 20, 'LIB-ACC-0041', 'AVAILABLE', NULL),
(21, 20, 'LIB-ACC-0042', 'AVAILABLE', NULL),
(22, 13, 'LIB-ACC-0043', 'BORROWED', NULL),
(23, 13, 'LIB-ACC-0044', 'AVAILABLE', NULL),
(24, 21, 'LIB-ACC-0045', 'AVAILABLE', NULL),
(25, 21, 'LIB-ACC-0046', 'AVAILABLE', NULL),
(26, 22, 'LIB-ACC-0047', 'AVAILABLE', NULL),
(27, 22, 'LIB-ACC-0048', 'AVAILABLE', NULL),
(28, 23, 'LIB-ACC-0049', 'AVAILABLE', NULL),
(29, 23, 'LIB-ACC-0050', 'AVAILABLE', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `borrow_requests`
--

CREATE TABLE `borrow_requests` (
  `request_id` bigint(20) NOT NULL,
  `book_id` bigint(20) NOT NULL,
  `member_id` bigint(20) NOT NULL,
  `status` enum('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING',
  `request_date` date NOT NULL,
  `decided_by` bigint(20) DEFAULT NULL,
  `decided_date` date DEFAULT NULL,
  `note` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `borrow_requests`
--

INSERT INTO `borrow_requests` (`request_id`, `book_id`, `member_id`, `status`, `request_date`, `decided_by`, `decided_date`, `note`) VALUES
(1, 13, 3, 'APPROVED', '2026-11-20', 5, '2026-11-20', NULL),
(2, 17, 3, 'APPROVED', '2026-11-20', 5, '2026-11-20', NULL),
(3, 13, 3, 'APPROVED', '2026-11-20', 5, '2026-11-20', NULL),
(4, 19, 4, 'APPROVED', '2026-11-20', 5, '2026-11-20', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `category_id` bigint(20) NOT NULL,
  `category_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`category_id`, `category_name`, `description`) VALUES
(1, 'QA Fiction', 'QA-only category'),
(2, 'Computer Science & IT', 'Programming, networking, databases and software engineering'),
(3, 'Mathematics', 'Algebra, calculus, statistics and discrete mathematics'),
(4, 'Business & Entrepreneurship', 'Business management, accounting and entrepreneurship'),
(5, 'Economics', 'Microeconomics, macroeconomics and development economics'),
(6, 'Literature & Fiction', 'Novels, short stories and creative writing'),
(7, 'Kenyan Literature', 'Books by Kenyan authors and stories about Kenya'),
(8, 'History & Politics', 'African history, world history and governance'),
(9, 'Science & Technology', 'Physics, chemistry, biology and emerging technologies'),
(10, 'Personal Development', 'Productivity, leadership and personal growth'),
(11, 'Education & Research', 'Research methods, teaching and academic writing'),
(12, 'Law', 'Constitutional law, legal studies and jurisprudence'),
(13, 'General Knowledge', 'Reference materials and general reading');

-- --------------------------------------------------------

--
-- Table structure for table `fines`
--

CREATE TABLE `fines` (
  `fine_id` bigint(20) NOT NULL,
  `loan_id` bigint(20) NOT NULL,
  `fine_amount` decimal(10,2) NOT NULL,
  `amount_paid` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('UNPAID','PARTIALLY_PAID','PAID','WAIVED') NOT NULL DEFAULT 'UNPAID',
  `assessed_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fines`
--

INSERT INTO `fines` (`fine_id`, `loan_id`, `fine_amount`, `amount_paid`, `status`, `assessed_at`) VALUES
(1, 1, 14.00, 14.00, 'PAID', '2026-11-20 14:28:08');

-- --------------------------------------------------------

--
-- Table structure for table `fine_payments`
--

CREATE TABLE `fine_payments` (
  `payment_id` bigint(20) NOT NULL,
  `fine_id` bigint(20) NOT NULL,
  `received_by` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` datetime NOT NULL DEFAULT current_timestamp(),
  `payment_method` enum('CASH','OTHER') NOT NULL,
  `reference_number` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fine_payments`
--

INSERT INTO `fine_payments` (`payment_id`, `fine_id`, `received_by`, `amount`, `payment_date`, `payment_method`, `reference_number`) VALUES
(1, 1, 1, 5.00, '2026-11-20 14:28:08', 'CASH', 'QA-REF-001'),
(2, 1, 2, 9.00, '2026-11-20 15:04:48', 'CASH', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `library_settings`
--

CREATE TABLE `library_settings` (
  `setting_id` bigint(20) NOT NULL,
  `borrowing_limit` int(11) NOT NULL,
  `borrowing_period_days` int(11) NOT NULL,
  `fine_per_day` decimal(10,2) NOT NULL,
  `fine_grace_period_days` int(11) NOT NULL,
  `max_outstanding_fine` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `library_settings`
--

INSERT INTO `library_settings` (`setting_id`, `borrowing_limit`, `borrowing_period_days`, `fine_per_day`, `fine_grace_period_days`, `max_outstanding_fine`) VALUES
(1, 5, 14, 2.00, 3, 50.00);

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `loan_id` bigint(20) NOT NULL,
  `member_id` bigint(20) NOT NULL,
  `copy_id` bigint(20) NOT NULL,
  `issued_by` bigint(20) NOT NULL,
  `issue_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('BORROWED','RETURNED') NOT NULL DEFAULT 'BORROWED'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `loans`
--

INSERT INTO `loans` (`loan_id`, `member_id`, `copy_id`, `issued_by`, `issue_date`, `due_date`, `return_date`, `status`) VALUES
(1, 1, 2, 1, '2026-11-20', '2026-11-10', '2026-11-20', 'RETURNED'),
(2, 3, 8, 5, '2026-11-20', '2026-12-04', NULL, 'BORROWED'),
(3, 3, 14, 5, '2026-11-20', '2026-12-03', NULL, 'BORROWED'),
(4, 3, 22, 5, '2026-11-20', '2026-11-27', NULL, 'BORROWED'),
(5, 4, 18, 5, '2026-11-20', '2026-11-28', NULL, 'BORROWED');

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `member_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `membership_number` varchar(30) NOT NULL,
  `first_name` varchar(60) NOT NULL,
  `last_name` varchar(60) NOT NULL,
  `admission_number` varchar(40) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `registration_date` date NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`member_id`, `user_id`, `membership_number`, `first_name`, `last_name`, `admission_number`, `phone`, `department`, `registration_date`, `status`) VALUES
(1, 3, 'QA-M-001', 'Qa', 'Member', 'QA-ADM-001', '5550100', 'Testing', '2026-01-15', 'ACTIVE'),
(2, 4, '1', 'John', 'Terry', '001', '0700001111', 'Computer Science', '2026-11-20', 'ACTIVE'),
(3, 8, 'U01', 'User', 'U', '0011', '0700000000', 'Computer Science', '2025-02-04', 'ACTIVE'),
(4, 9, '200', 'Jerry', 'J', '23', '0712121212', NULL, '2026-11-02', 'ACTIVE');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('ADMIN','LIBRARIAN','MEMBER') NOT NULL,
  `status` enum('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `role`, `status`, `created_at`) VALUES
(1, 'qa_admin', 'qa.admin@example.com', '$2y$10$MTKrJGWIEZ5KdKluLOSbq.CCthrVJ/cjkS.0Cc0ZgyUsTIPY4YSiq', 'ADMIN', 'INACTIVE', '2026-11-20 14:19:14'),
(2, 'qa_librarian', 'qa.librarian@example.com', '$2a$10$1LUcIBlA7LPKayYF2vq8de5xbIAokB6yVTeFXOAjSwIdUjHVkCtrG', 'LIBRARIAN', 'ACTIVE', '2026-11-20 14:25:30'),
(3, 'qa_member', 'qa.member@example.com', '$2a$10$5jjQDttb5J0OddMumR.mVOcJlOcrgMpPZ9eBjzpASzCLF20MXgutS', 'MEMBER', 'ACTIVE', '2026-11-20 14:25:31'),
(4, 'John', 'john@gmail.com', '$2a$10$cB1F1u.kDZPEVUpwnrt2rOu1Kv6ByLCgycd6LxpWc/5vQFSFXDuYa', 'MEMBER', 'ACTIVE', '2026-11-20 16:22:39'),
(5, 'Librarian', 'librarian@gmail.com', '$2a$10$Z/Agwet.QUGzbu3lcftNdeIs6GV1xxwyS46FfHGBM9.ePX5hsJ2wu', 'LIBRARIAN', 'ACTIVE', '2026-11-20 16:25:22'),
(6, 'Admin', 'admin@gmail.com', '$2a$10$N5uEGC7WBQ6c5JzlqENNyenKa8k5yPWm41twBezopuWyeeu0REtPS', 'ADMIN', 'ACTIVE', '2026-11-20 16:26:06'),
(7, 'Member', 'member@gmail.com', '$2a$10$ta32J3TwFD9Wdi47EjwdgOEqwplXxEtVYf4cTAh74zeTtQIJY/uku', 'MEMBER', 'ACTIVE', '2026-11-20 16:27:33'),
(8, 'User', 'user@gmail.com', '$2a$10$fggQ4LswdtkTgrJ2H0Ib5uCECTTzayZFuC3VWBHG.rhC80wNgj/3u', 'MEMBER', 'ACTIVE', '2026-11-20 16:34:36'),
(9, 'Jerry', 'jerry@gmail.com', '$2a$10$hE6EMhdIMvsauK.yKyjwMOcZeUyOfs.1/dY.l9iDngbZU2t5BDTlG', 'MEMBER', 'ACTIVE', '2026-11-20 18:32:11');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `authors`
--
ALTER TABLE `authors`
  ADD PRIMARY KEY (`author_id`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`book_id`),
  ADD KEY `idx_books_category` (`category_id`);

--
-- Indexes for table `book_authors`
--
ALTER TABLE `book_authors`
  ADD PRIMARY KEY (`book_id`,`author_id`),
  ADD KEY `idx_book_authors_author` (`author_id`);

--
-- Indexes for table `book_copies`
--
ALTER TABLE `book_copies`
  ADD PRIMARY KEY (`copy_id`),
  ADD UNIQUE KEY `uq_book_copies_accession` (`accession_number`),
  ADD KEY `idx_book_copies_book` (`book_id`);

--
-- Indexes for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_borrow_requests_member` (`member_id`),
  ADD KEY `idx_borrow_requests_status` (`status`),
  ADD KEY `fk_borrow_requests_book` (`book_id`),
  ADD KEY `fk_borrow_requests_decided_by` (`decided_by`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`category_id`),
  ADD UNIQUE KEY `uq_categories_name` (`category_name`);

--
-- Indexes for table `fines`
--
ALTER TABLE `fines`
  ADD PRIMARY KEY (`fine_id`),
  ADD UNIQUE KEY `uq_fines_loan` (`loan_id`);

--
-- Indexes for table `fine_payments`
--
ALTER TABLE `fine_payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `idx_fine_payments_fine` (`fine_id`),
  ADD KEY `idx_fine_payments_received_by` (`received_by`);

--
-- Indexes for table `library_settings`
--
ALTER TABLE `library_settings`
  ADD PRIMARY KEY (`setting_id`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`loan_id`),
  ADD KEY `idx_loans_member` (`member_id`),
  ADD KEY `idx_loans_copy` (`copy_id`),
  ADD KEY `idx_loans_issued_by` (`issued_by`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `uq_members_user_id` (`user_id`),
  ADD UNIQUE KEY `uq_members_membership_number` (`membership_number`),
  ADD UNIQUE KEY `uq_members_admission_number` (`admission_number`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `uq_users_username` (`username`),
  ADD UNIQUE KEY `uq_users_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `authors`
--
ALTER TABLE `authors`
  MODIFY `author_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `book_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `book_copies`
--
ALTER TABLE `book_copies`
  MODIFY `copy_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  MODIFY `request_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `category_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `fines`
--
ALTER TABLE `fines`
  MODIFY `fine_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `fine_payments`
--
ALTER TABLE `fine_payments`
  MODIFY `payment_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `library_settings`
--
ALTER TABLE `library_settings`
  MODIFY `setting_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `loan_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `member_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `books`
--
ALTER TABLE `books`
  ADD CONSTRAINT `fk_books_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`);

--
-- Constraints for table `book_authors`
--
ALTER TABLE `book_authors`
  ADD CONSTRAINT `fk_book_authors_author` FOREIGN KEY (`author_id`) REFERENCES `authors` (`author_id`),
  ADD CONSTRAINT `fk_book_authors_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

--
-- Constraints for table `book_copies`
--
ALTER TABLE `book_copies`
  ADD CONSTRAINT `fk_book_copies_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`);

--
-- Constraints for table `borrow_requests`
--
ALTER TABLE `borrow_requests`
  ADD CONSTRAINT `fk_borrow_requests_book` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`),
  ADD CONSTRAINT `fk_borrow_requests_decided_by` FOREIGN KEY (`decided_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_borrow_requests_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`);

--
-- Constraints for table `fines`
--
ALTER TABLE `fines`
  ADD CONSTRAINT `fk_fines_loan` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`);

--
-- Constraints for table `fine_payments`
--
ALTER TABLE `fine_payments`
  ADD CONSTRAINT `fk_fine_payments_fine` FOREIGN KEY (`fine_id`) REFERENCES `fines` (`fine_id`),
  ADD CONSTRAINT `fk_fine_payments_received_by` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `fk_loans_copy` FOREIGN KEY (`copy_id`) REFERENCES `book_copies` (`copy_id`),
  ADD CONSTRAINT `fk_loans_issued_by` FOREIGN KEY (`issued_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `fk_loans_member` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`);

--
-- Constraints for table `members`
--
ALTER TABLE `members`
  ADD CONSTRAINT `fk_members_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
