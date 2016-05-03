CREATE DATABASE  IF NOT EXISTS `mydb` /*!40100 DEFAULT CHARACTER SET utf8 */;
USE `mydb`;
-- MySQL dump 10.13  Distrib 5.6.13, for Win32 (x86)
--
-- Host: localhost    Database: mydb
-- ------------------------------------------------------
-- Server version	5.6.14-enterprise-commercial-advanced

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `attendant`
--

DROP TABLE IF EXISTS `attendant`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `attendant` (
  `cpBoardId` int(11) NOT NULL,
  `userId` varchar(40) NOT NULL,
  PRIMARY KEY (`cpBoardId`,`userId`),
  KEY `fk_CarpoolBoard_has_User_User1_idx` (`userId`),
  KEY `fk_CarpoolBoard_has_User_CarpoolBoard1_idx` (`cpBoardId`),
  CONSTRAINT `fk_attendant_carpoolboard` FOREIGN KEY (`cpBoardId`) REFERENCES `carpoolboard` (`cpBoardId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_attendant_user` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `attendant`
--

LOCK TABLES `attendant` WRITE;
/*!40000 ALTER TABLE `attendant` DISABLE KEYS */;
INSERT INTO `attendant` VALUES (145,'9807a21a958709a07cb0af7aac957064'),(145,'b9d7191922c52aaa876dfdbc211a23c2'),(146,'9807a21a958709a07cb0af7aac957064'),(146,'b9d7191922c52aaa876dfdbc211a23c2'),(147,'9807a21a958709a07cb0af7aac957064'),(147,'b9d7191922c52aaa876dfdbc211a23c2');
/*!40000 ALTER TABLE `attendant` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carpoolboard`
--

DROP TABLE IF EXISTS `carpoolboard`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carpoolboard` (
  `cpBoardId` int(11) NOT NULL AUTO_INCREMENT,
  `writer` varchar(40) NOT NULL,
  `startPoint` varchar(20) DEFAULT NULL,
  `arrivePoint` varchar(20) DEFAULT NULL,
  `startLatitude` double DEFAULT NULL,
  `startLongitude` double DEFAULT NULL,
  `carType` varchar(45) DEFAULT NULL,
  `numberOfPersons` int(11) DEFAULT NULL,
  `currentPersons` int(11) DEFAULT '1',
  `carpoolTime` datetime DEFAULT NULL,
  `contents` varchar(400) DEFAULT NULL,
  PRIMARY KEY (`cpBoardId`),
  KEY `fk_CarpoolBoard_User1_idx` (`writer`),
  CONSTRAINT `fk_CarpoolBoard_User1` FOREIGN KEY (`writer`) REFERENCES `user` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carpoolboard`
--

LOCK TABLES `carpoolboard` WRITE;
/*!40000 ALTER TABLE `carpoolboard` DISABLE KEYS */;
INSERT INTO `carpoolboard` VALUES (145,'0cc175b9c0f1b6a831c399e269772661','11','22',36.12827829999999,128.32864130000007,'33',4,3,'2015-10-31 22:32:00',NULL),(146,'0cc175b9c0f1b6a831c399e269772661','1','1',36.12827829999999,128.32864130000007,'1',4,3,'2015-10-30 22:53:00',NULL),(147,'0cc175b9c0f1b6a831c399e269772661','2','2',36.12827829999999,128.32864130000007,'2',4,3,'2015-10-30 16:54:00',NULL),(148,'b9d7191922c52aaa876dfdbc211a23c2','대구','옥계',36.13686179999999,128.4118315000001,'택시',4,1,'2015-10-27 22:56:00',NULL),(149,'0cc175b9c0f1b6a831c399e269772661','gg','gg',36.12827829999999,128.32864130000007,'gg',4,1,'2015-10-27 19:02:00',NULL),(150,'9807a21a958709a07cb0af7aac957064','암','모',36.14253049999999,128.39432700000012,'ㅎ',4,1,'2015-10-27 23:16:00',NULL),(151,'0cc175b9c0f1b6a831c399e269772661','test','test2',36.12827829999999,128.32864130000007,'test3',4,1,'2015-11-30 16:26:00',NULL),(152,'0cc175b9c0f1b6a831c399e269772661','학교','구미역',36.13686179999999,128.4118315000001,'택시',4,1,'2016-03-11 14:30:00',NULL),(153,'0cc175b9c0f1b6a831c399e269772661','학교','터미널',36.12827829999999,128.32864130000007,'TEST',4,1,'2016-08-13 15:35:00',NULL);
/*!40000 ALTER TABLE `carpoolboard` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `comment`
--

DROP TABLE IF EXISTS `comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `comment` (
  `commentId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(40) NOT NULL,
  `boardId` int(11) NOT NULL,
  `comment` text NOT NULL,
  PRIMARY KEY (`commentId`),
  KEY `fk_comment_User_idx` (`userId`),
  KEY `fk_comment_CarpoolBoard1_idx` (`boardId`),
  CONSTRAINT `fk_comment_attendant` FOREIGN KEY (`boardId`) REFERENCES `carpoolboard` (`cpBoardId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_comment_User` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `comment`
--

LOCK TABLES `comment` WRITE;
/*!40000 ALTER TABLE `comment` DISABLE KEYS */;
INSERT INTO `comment` VALUES (40,'0cc175b9c0f1b6a831c399e269772661',145,'44'),(41,'0cc175b9c0f1b6a831c399e269772661',146,'1'),(42,'0cc175b9c0f1b6a831c399e269772661',147,'2'),(43,'b9d7191922c52aaa876dfdbc211a23c2',148,'ㅇㅇ'),(44,'9807a21a958709a07cb0af7aac957064',147,'ㅎㅎㅎㅎㅎㅎ'),(45,'0cc175b9c0f1b6a831c399e269772661',149,'##'),(46,'b9d7191922c52aaa876dfdbc211a23c2',147,'ㅇㅇ'),(47,'0cc175b9c0f1b6a831c399e269772661',151,'test5'),(48,'0cc175b9c0f1b6a831c399e269772661',153,'f');
/*!40000 ALTER TABLE `comment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `destination`
--

DROP TABLE IF EXISTS `destination`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `destination` (
  `userId` varchar(40) NOT NULL,
  `startPoint` varchar(45) DEFAULT NULL,
  `arrivePoint` varchar(45) DEFAULT NULL,
  `carpoolTime` datetime DEFAULT NULL,
  `regId` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`userId`),
  KEY `fk_destination_User1_idx` (`userId`),
  CONSTRAINT `fk_destination_User1` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `destination`
--

LOCK TABLES `destination` WRITE;
/*!40000 ALTER TABLE `destination` DISABLE KEYS */;
INSERT INTO `destination` VALUES ('0cc175b9c0f1b6a831c399e269772661','1','2','2015-11-27 17:46:00',NULL);
/*!40000 ALTER TABLE `destination` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `message` (
  `messageId` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(40) DEFAULT NULL,
  `contents` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`messageId`),
  KEY `fk_userId_idx` (`userId`),
  CONSTRAINT `fk_userId` FOREIGN KEY (`userId`) REFERENCES `user` (`userId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `userId` varchar(40) NOT NULL,
  `alias` varchar(15) DEFAULT NULL,
  `aliasResourceIndex` int(11) DEFAULT NULL,
  PRIMARY KEY (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES ('0cc175b9c0f1b6a831c399e269772661','뮤츠#0cc1',150),('6366bad504cf5d20c72316eb04e5ab12','니드런남#6366',29),('9807a21a958709a07cb0af7aac957064','암나이트#9807',138),('b9d7191922c52aaa876dfdbc211a23c2','리자몽#b9d7',6),('c639274daad804c56dad90a8af114a1b','럭키#c639',113);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'mydb'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2016-05-04  8:49:14
