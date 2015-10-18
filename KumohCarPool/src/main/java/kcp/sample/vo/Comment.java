package kcp.sample.vo;

public class Comment {
	int commentId;
	int cpBoardId;
	String comment;
	boolean isMine;
	User user;
	public int getCommentId() {
		return commentId;
	}
	public void setCommentId(int commentId) {
		this.commentId = commentId;
	}
	public int getCpBoardId() {
		return cpBoardId;
	}
	public void setCpBoardId(int cpBoardId) {
		this.cpBoardId = cpBoardId;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public boolean isMine() {
		return isMine;
	}
	public void setMine(boolean isMine) {
		this.isMine = isMine;
	}
	public User getUser() {
		return user;
	}
	public void setUser(User user) {
		this.user = user;
	}
	
}
