package kcp.sample.vo;

public class User {
	private String userId;
	private String alias;
	private int aliasResourceIndex;

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public String getUserId() {
		return userId;
	}

	public void setUserId(String userId) {
		this.userId = userId;
	}

	public int getAliasResourceIndex() {
		return aliasResourceIndex;
	}

	public void setAliasResourceIndex(int aliasResourceIndex) {
		this.aliasResourceIndex = aliasResourceIndex;
	}
	
}
