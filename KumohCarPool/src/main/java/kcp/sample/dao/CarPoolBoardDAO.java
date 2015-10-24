package kcp.sample.dao;

import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import kcp.common.dao.AbstractDAO;
import kcp.sample.vo.Attendant;
import kcp.sample.vo.CarpoolBoard;
import kcp.sample.vo.Comment;

@Repository("carpoolboardDAO")
public class CarPoolBoardDAO extends AbstractDAO{

	
	/**
	 * 게시글 목록 조회  
	 * @param  map [pageIndex, pageNumber]
	 * @return List<게시글 목록> 
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<CarpoolBoard> selectBoardList(Map<String, Object> map) throws Exception{
		return (List<CarpoolBoard>)selectList("carpoolboard.selectBoardList", map);
	}
	
	/**
	 * 등록/참여한 게시글 목록 조회 
	 * @param  map [사용자ID]
	 * @return List<등록/참여한 게시글>
	 * @throws Exception
	 */ 
	@SuppressWarnings("unchecked")
	public List<CarpoolBoard> selectMyBoardList(Map<String, Object> map) throws Exception{
		return (List<CarpoolBoard>)selectList("carpoolboard.selectMyList", map);
	}
	
	/**
	 * 날짜별 카풀 수 계산 
	 * @param  
	 * @return List< Map< 날짜, 게시글 수 > >
	 * @throws Exception
	 */ 
	@SuppressWarnings("unchecked")
	public List<Map<String,Integer>> selectDayCount() throws Exception{
		return (List<Map<String,Integer>>)selectList("carpoolboard.selectDayCount");
	}
	
	/**
	 * 게시글 상세 조회 
	 * @param  map [게시글ID]
	 * @return 게시글 객체
	 * @throws Exception
	 */
	public CarpoolBoard selectBoardOne(Map<String, Object> map) throws Exception{
		return  (CarpoolBoard)selectOne("carpoolboard.selectOne", map);
	}
	
	/**
	 * 게시글 등록
	 * @param map [ 게시글 정보 ]
	 * @throws Exception
	 */
	public void insertBoard(Map<String, Object> map) throws Exception{
	    insert("carpoolboard.insertBoard", map);
	}
	
	/**
	 * 게시글 수정
	 * @param map [ 게시글 정보 ]
	 * @throws Exception
	 */
	public void updateBoard(Map<String, Object> map) throws Exception{
	    update("carpoolboard.updateBoard", map);
	}
	
	/**
	 * 게시글 삭제  
	 * @param map [ 게시글ID ] 
	 * @throws Exception
	 */
	public void deleteBoard(Map<String, Object> map) throws Exception{
	    delete("carpoolboard.deleteBoard", map);
	}	
	
	/**
	 * 카풀 인원 수정
	 * @param map [ 게시글ID , 현재인원 ]
	 * @throws Exception
	 */
	public void updateCurrentPeopleCount(Map<String, Object> map) throws Exception{
		update("carpoolboard.updatePersonNumber",map);
	}
	
	/**
	 * 카풀 참여 목록 조회 
	 * @param map
	 * @return List<카풀참여>
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Attendant> selectAttendantList(Map<String,Object> map) throws Exception{
		return (List<Attendant>)selectList("carpoolboard.selectAttendant");
	}
	
	/**
	 * 카풀 참여자 등록
	 * @param map [ 게시글ID, 사용자ID ]
	 * @return 추가된 열(row) 수
	 * @throws Exception
	 */
	public int insertAttendant(Map<String, Object> map) throws Exception{
	    return (int)insert("carpoolboard.insertAttendant", map);
	}	
	
	/**
	 * 카풀 참여자 삭제
	 * @param map [ 사용자ID ]
	 * @return 삭제된 열(row) 수 
	 * @throws Exception
	 */
	public int deleteAttendant(Map<String, Object> map) throws Exception{
	    return  (int) delete("carpoolboard.deleteAttendant", map);
	}	
	
	/**
	 * 카풀 참여 조회
	 * @param map [ 게시글ID, 사용자ID ]
	 * @return 참여자 객체
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public Map<String, Object> isAttend(Map<String,Object> map) throws Exception{
		return (Map<String,Object>)selectOne("carpoolboard.selectOneAttendant", map);
	}
	
	/**
	 * 댓글 목록 조회
	 * @param map [ 게시글ID, 사용자ID ] 
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public List<Comment> selectCommentList(Map<String, Object> map) throws Exception{
		return (List<Comment>)selectList("carpoolboard.selectComment", map);
	}
	
	/**
	 * 댓글 추가
	 * @param map [ 게시글ID, 사용자ID, 댓글내용 ]
	 * @throws Exception
	 */
	public void insertComment(Map<String, Object> map) throws Exception{
	    insert("carpoolboard.insertComment", map);
	}		
	
	/**
	 * 댓글 삭제
	 * @param map [ 댓글ID ]
	 * @throws Exception
	 */
	public void deleteComment(Map<String, Object> map) throws Exception{
	    delete("carpoolboard.deleteComment", map);
	}		
}
