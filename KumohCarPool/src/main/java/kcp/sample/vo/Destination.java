package kcp.sample.vo;

import java.sql.Timestamp;

public class Destination {
	private String userId;
	private String startPoint;
	private String arrivePoint;
	private Timestamp carpoolTime;
	private String regId; 
	
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
	public Timestamp getCarpoolTime() {
		return carpoolTime;
	}
	public void setCarpoolTime(Timestamp carpoolTime) {
		this.carpoolTime = carpoolTime;
	}
	public String getRegId() {
		return regId;
	}
	public void setRegId(String regId) {
		this.regId = regId;
	}
	
}
