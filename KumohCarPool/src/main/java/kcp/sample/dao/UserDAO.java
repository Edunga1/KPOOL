package kcp.sample.dao;

import java.util.Map;

import org.springframework.stereotype.Repository;

import kcp.common.dao.AbstractDAO;
import kcp.sample.vo.User;

@Repository("userDAO")
public class UserDAO extends AbstractDAO{
	
	/**
	 * 사용자 등록 
	 * @param map [ 사용자ID, 별명, 리소스ID ]
	 * @throws Exception
	 */
	public void insertUser(Map<String,Object> map) throws Exception{
		insert("user.insertUser", map);
	}
	
	/**
	 * 사용자 조회 
	 * @param map [ 사용자ID ]
	 * @return 사용자 객체
	 * @throws Exception
	 */
	public User selectUser(Map<String,Object> map) throws Exception{
		return (User)selectOne("user.selectUser",map);
	}
}
