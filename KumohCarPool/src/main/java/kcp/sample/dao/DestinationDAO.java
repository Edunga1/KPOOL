package kcp.sample.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kcp.common.dao.AbstractDAO;
import kcp.sample.vo.Destination;

@Repository("destinationDAO")
public class DestinationDAO extends AbstractDAO{
	
	/**
	 * 목적지 목록 조회 
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Destination> selectDestination() throws Exception
	{
		return (List<Destination>)selectList("selectDestination"); 
	}

	/**
	 * 목적지 조회
	 * @param map [ 사용자 ID ]
	 * @return 목적지 객체 
	 * @throws Exception
	 */
	public Destination selectDestOne(Map<String,Object> map) throws Exception{
		return (Destination)selectOne("destination.selectDestOne",map);
	}
		
	/**
	 * 목적지 등록
	 * @param map [ 목적지 정보 ] 
	 * @throws Exception
	 */
	public void insertDestination(Map<String,Object> map) throws Exception{
		insert( "destination.insertDestination",map);
	}

	/**
	 * 목적지 삭제 
	 * @param map [ 목적지ID ] 
	 * @throws Exception
	 */
	public void deleteDestinaiton(Map<String,Object> map) throws Exception{
		insert( "destination.deleteDestination",map);
	}	
	
	/**
	 * 목적지 수정
	 * @param map [ 목적지 내용 ]
	 * @throws Exception
	 */
	public void updateDestination(Map<String,Object> map) throws Exception{
		update("destination.updateDestination", map);
	}
	
}
