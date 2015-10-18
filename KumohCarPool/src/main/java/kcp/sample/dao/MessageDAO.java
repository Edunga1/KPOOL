package kcp.sample.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kcp.common.dao.AbstractDAO;
import kcp.sample.vo.Message;

@Repository("messageDAO")
public class MessageDAO extends AbstractDAO {
	
	/**
	 * 목적지 목록 조회 
	 * @param map [ 사용자ID ]
	 * @return List<목적지 목록>
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Message> selectMessage(Map<String,Object> map) throws Exception
	{
		return (List<Message>)selectList("message.selectMessage",map); 
	}
		
	/**
	 * 목적지 등록
	 * @param map [ 사용자ID, 메시지 내용 ] 
	 * @throws Exception
	 */
	public void insertMessage(Map<String,Object> map) throws Exception{
		insert( "message.insertMessage",map);
	}
 
}
