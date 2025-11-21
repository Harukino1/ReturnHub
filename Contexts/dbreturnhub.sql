-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: dbreturnhub
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `claims`
--

DROP TABLE IF EXISTS `claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `claims` (
  `claim_id` int NOT NULL AUTO_INCREMENT,
  `date_submitted` datetime(6) NOT NULL,
  `proof_document_url` varchar(200) NOT NULL,
  `status` varchar(20) NOT NULL,
  `claimant_user_id` int NOT NULL,
  `found_item_id` int NOT NULL,
  `lost_item_id` int NOT NULL,
  `verified_by_staff_id` int NOT NULL,
  PRIMARY KEY (`claim_id`),
  KEY `FKqbkehis8ilmi6l8ugw44pf47f` (`claimant_user_id`),
  KEY `FK8wjx1xudgoroj0r9l84lbl1c4` (`found_item_id`),
  KEY `FKbs2y5x450nelt4ev0vgldjji2` (`lost_item_id`),
  KEY `FKst9cx5a9ak3wr4jp5i6ryfl3y` (`verified_by_staff_id`),
  CONSTRAINT `FK8wjx1xudgoroj0r9l84lbl1c4` FOREIGN KEY (`found_item_id`) REFERENCES `founditems` (`item_id`),
  CONSTRAINT `FKbs2y5x450nelt4ev0vgldjji2` FOREIGN KEY (`lost_item_id`) REFERENCES `lostitems` (`item_id`),
  CONSTRAINT `FKqbkehis8ilmi6l8ugw44pf47f` FOREIGN KEY (`claimant_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKst9cx5a9ak3wr4jp5i6ryfl3y` FOREIGN KEY (`verified_by_staff_id`) REFERENCES `staffs` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `claims`
--

LOCK TABLES `claims` WRITE;
/*!40000 ALTER TABLE `claims` DISABLE KEYS */;
/*!40000 ALTER TABLE `claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conversations`
--

DROP TABLE IF EXISTS `conversations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `conversations` (
  `conversation_id` int NOT NULL AUTO_INCREMENT,
  `staff_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`conversation_id`),
  KEY `FK3hviyleruuq58xt9m7goxxa1e` (`staff_id`),
  KEY `FKpltqvfcbkql9svdqwh0hw4g1d` (`user_id`),
  CONSTRAINT `FK3hviyleruuq58xt9m7goxxa1e` FOREIGN KEY (`staff_id`) REFERENCES `staffs` (`staff_id`),
  CONSTRAINT `FKpltqvfcbkql9svdqwh0hw4g1d` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conversations`
--

LOCK TABLES `conversations` WRITE;
/*!40000 ALTER TABLE `conversations` DISABLE KEYS */;
/*!40000 ALTER TABLE `conversations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `founditems`
--

DROP TABLE IF EXISTS `founditems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `founditems` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `status` varchar(20) NOT NULL,
  `posted_by_staff_id` int NOT NULL,
  `submitted_report_id` int NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `FKhlkq0hpdt1lnyc0842unniwpk` (`posted_by_staff_id`),
  KEY `FK7xq40ge8neijclkklpxyqrfrr` (`submitted_report_id`),
  CONSTRAINT `FK7xq40ge8neijclkklpxyqrfrr` FOREIGN KEY (`submitted_report_id`) REFERENCES `submittedreport` (`report_id`),
  CONSTRAINT `FKhlkq0hpdt1lnyc0842unniwpk` FOREIGN KEY (`posted_by_staff_id`) REFERENCES `staffs` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `founditems`
--

LOCK TABLES `founditems` WRITE;
/*!40000 ALTER TABLE `founditems` DISABLE KEYS */;
/*!40000 ALTER TABLE `founditems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lostitems`
--

DROP TABLE IF EXISTS `lostitems`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lostitems` (
  `item_id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `status` varchar(20) NOT NULL,
  `posted_by_staff_id` int NOT NULL,
  `submitted_report_id` int NOT NULL,
  PRIMARY KEY (`item_id`),
  KEY `FK45jmij8k85l262hteof6m14gc` (`posted_by_staff_id`),
  KEY `FK1w57bjs3ldakcy6e49toblp9y` (`submitted_report_id`),
  CONSTRAINT `FK1w57bjs3ldakcy6e49toblp9y` FOREIGN KEY (`submitted_report_id`) REFERENCES `submittedreport` (`report_id`),
  CONSTRAINT `FK45jmij8k85l262hteof6m14gc` FOREIGN KEY (`posted_by_staff_id`) REFERENCES `staffs` (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lostitems`
--

LOCK TABLES `lostitems` WRITE;
/*!40000 ALTER TABLE `lostitems` DISABLE KEYS */;
/*!40000 ALTER TABLE `lostitems` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `messages`
--

DROP TABLE IF EXISTS `messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `messages` (
  `message_id` int NOT NULL AUTO_INCREMENT,
  `content` text NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `conversation_id` int NOT NULL,
  `sender_staff_id` int NOT NULL,
  `sender_user_id` int NOT NULL,
  PRIMARY KEY (`message_id`),
  KEY `FKt492th6wsovh1nush5yl5jj8e` (`conversation_id`),
  KEY `FKsnbngsx0eyumnrkwqces5ax9b` (`sender_staff_id`),
  KEY `FKk4mpqp6gfuaelpcamqv01brkr` (`sender_user_id`),
  CONSTRAINT `FKk4mpqp6gfuaelpcamqv01brkr` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKsnbngsx0eyumnrkwqces5ax9b` FOREIGN KEY (`sender_staff_id`) REFERENCES `staffs` (`staff_id`),
  CONSTRAINT `FKt492th6wsovh1nush5yl5jj8e` FOREIGN KEY (`conversation_id`) REFERENCES `conversations` (`conversation_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `messages`
--

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;
/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications`
--

DROP TABLE IF EXISTS `notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifications` (
  `notification_id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `is_read` bit(1) NOT NULL,
  `message` text NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `FK9y21adhxn0ayjhfocscqox7bh` (`user_id`),
  CONSTRAINT `FK9y21adhxn0ayjhfocscqox7bh` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications`
--

LOCK TABLES `notifications` WRITE;
/*!40000 ALTER TABLE `notifications` DISABLE KEYS */;
/*!40000 ALTER TABLE `notifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `staffs`
--

DROP TABLE IF EXISTS `staffs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `staffs` (
  `staff_id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role` varchar(20) NOT NULL,
  PRIMARY KEY (`staff_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `staffs`
--

LOCK TABLES `staffs` WRITE;
/*!40000 ALTER TABLE `staffs` DISABLE KEYS */;
/*!40000 ALTER TABLE `staffs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `submittedreport`
--

DROP TABLE IF EXISTS `submittedreport`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `submittedreport` (
  `report_id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(50) NOT NULL,
  `date_of_event` date NOT NULL,
  `date_reviewed` datetime(6) NOT NULL,
  `date_submitted` datetime(6) NOT NULL,
  `description` text NOT NULL,
  `location` varchar(200) NOT NULL,
  `photo_url` varchar(200) NOT NULL,
  `status` varchar(20) NOT NULL,
  `type` varchar(20) NOT NULL,
  `reviewer_staff_id` int NOT NULL,
  `submitter_user_id` int NOT NULL,
  PRIMARY KEY (`report_id`),
  KEY `FK6xh9bjwcqaefgc0nx0a3gtvp0` (`reviewer_staff_id`),
  KEY `FKg256j8cykspl6nqjxofq1hy8b` (`submitter_user_id`),
  CONSTRAINT `FK6xh9bjwcqaefgc0nx0a3gtvp0` FOREIGN KEY (`reviewer_staff_id`) REFERENCES `staffs` (`staff_id`),
  CONSTRAINT `FKg256j8cykspl6nqjxofq1hy8b` FOREIGN KEY (`submitter_user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `submittedreport`
--

LOCK TABLES `submittedreport` WRITE;
/*!40000 ALTER TABLE `submittedreport` DISABLE KEYS */;
/*!40000 ALTER TABLE `submittedreport` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(100) NOT NULL,
  `is_verified` bit(1) NOT NULL,
  `name` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `phone` varchar(15) NOT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-18 10:32:13
