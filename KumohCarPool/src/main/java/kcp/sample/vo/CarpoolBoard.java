package kcp.sample.vo;

import java.sql.Timestamp;

public class CarpoolBoard {
	// elementary mapping
	private int cpBoardId;
	private String userId;
	private String startPoint;
	private String arrivePoint;
	private double startLatitude;
	private double startLongitude;
	private String carType;
	private int numberOfPersons;
	private int currentPersons;
	private Timestamp carpoolTime;
	private String contents;
	private int commentNums;
	private String serialNumber;
	
	public int getCpBoardId() {
		return cpBoardId;
	}
	public void setCpBoardId(int cpBoardId) {
		this.cpBoardId = cpBoardId;
	}
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getStartPoint() {
		return startPoint;
	}
	public void setStartPoint(String startPoint) {
		this.startPoint = startPoint;
	}
	public String getArrivePoint() {
		return arrivePoint;
	}
	public void setArrivePoint(String arrivePoint) {
		this.arrivePoint = arrivePoint;
	}
	public double getStartLatitude() {
		return startLatitude;
	}
	public void setStartLatitude(double startLatitude) {
		this.startLatitude = startLatitude;
	}
	public double getStartLongitude() {
		return startLongitude;
	}
	public void setStartLongitude(double startLongitude) {
		this.startLongitude = startLongitude;
	}
	public String getCarType() {
		return carType;
	}
	public void setCarType(String carType) {
		this.carType = carType;
	}
	public int getNumberOfPersons() {
		return numberOfPersons;
	}
	public void setNumberOfPersons(int numberOfPersons) {
		this.numberOfPersons = numberOfPersons;
	}
	
	public Timestamp getCarpoolTime() {
		return carpoolTime;
	}
	public void setCarpoolTime(Timestamp carpoolTime) {
		this.carpoolTime = carpoolTime;
	}
	public String getContents() {
		return contents;
	}
	public void setContents(String contents) {
		this.contents = contents;
	}
	public int getCurrentPersons() {
		return currentPersons;
	}
	public void setCurrentPersons(int currentPersons) {
		this.currentPersons = currentPersons;
	}
	public int getCommentNums() {
		return commentNums;
	}
	public void setCommentNums(int commentNums) {
		this.commentNums = commentNums;
	}
	public String getSerialNumber() {
		return serialNumber;
	}
	public void setSerialNumber(String serialNumber) {
		this.serialNumber = serialNumber;
	}
	
}
