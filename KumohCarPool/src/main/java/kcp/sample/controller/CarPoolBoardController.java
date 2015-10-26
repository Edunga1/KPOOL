package kcp.sample.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import kcp.common.common.CommandMap;
import kcp.sample.dao.CarPoolBoardDAO;
import kcp.sample.dao.DestinationDAO;
import kcp.sample.dao.MessageDAO;
import kcp.sample.dao.UserDAO;
import kcp.sample.service.AliasAddingService;
import kcp.sample.service.DataExceptionHandler;
import kcp.sample.service.DestinationMatchingService;
import kcp.sample.service.MessagePushService;
import kcp.sample.vo.Attendant;
import kcp.sample.vo.CarpoolBoard;
import kcp.sample.vo.Comment;
import kcp.sample.vo.Destination;
import kcp.sample.vo.Message;
import kcp.sample.vo.User;

@Controller
public class CarPoolBoardController {
	Logger log = Logger.getLogger(this.getClass());
	
	/*
	 * ====================================================================================
	 *  DAO 패키지에 정의된 클래스들에 대한 인스턴스 
	 * ====================================================================================
	 */
	@Resource(name="destinationDAO")
	private DestinationDAO destinationDao;

	@Resource(name="carpoolboardDAO")
	private CarPoolBoardDAO carpoolBoardDao; 
	
	@Resource(name = "messageDAO")
	private MessageDAO messageDao;

	@Resource(name = "userDAO")
	private UserDAO userDao;

	/*
	 * ====================================================================================
	 *  각 기능에 대한 함수를 정의 한다. 클라이언트가 요청하는 URL에 해당하는 메소드는 호출된다. 
	 *      
	 *       - 공통적인 함수 모양 
	 *       @RequestMapping(value="클라이언트로 부터 요청받는 URL")
	 * 		 public ModelAndView 함수이름( CommandMap commandMap ) throws Exception {
	 * 
	 * 			  ModelAndView mv = new ModelAndView( );
	 * 			  concreteDao.method( commandMap.getMap() );
	 * 
	 * 		 	  --각 컨트롤러 로직
	 * 			  
	 *		 	  --선택사항 
	 * 			  mv.addObject( "Key", value )   // 클라이언트에게 반환할 데이터 추가   
	 * 			  mv.setViewName("jsonView")     // 뷰 반환값을 json 형태로 설정  
	 * 		 	  
	 *  		  return mv;
	 * 		 }
	 * 
	 * ====================================================================================
	 */
	
	
	/*
	 * ====================================================================================
	 *   [ 사용자 관리에 대한 메소드 목록 ] 
	 *    1. 사용자 조회 
	 *    2. 사용자 추가
	 * ====================================================================================
	 */
	 
	 /**
	 * 1. 사용자 조회 
	 * - 기능 : 사용자 정보를 클라이언트로 부터 받은 사용자ID로 조회한다.  
	 * - 호출 : 메인화면에서 사용자 추가할 때 중복 여부 검사를 위해 호출된다.  
	 * @param commandMap [ 사용자ID ]
	 * @return 사용자 객체  
	 * @throws Exception
	 */
	@RequestMapping(value="/carpoolboard/selectUser.do")
	public ModelAndView selectUser(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView("");
		User user = userDao.selectUser(commandMap.getMap());
		if( user != null)
			mv.addObject("user",user);
		mv.setViewName("jsonView");
		return mv;
	}
		
	/**
	 * 2. 사용자 추가
	 * - 기능 : 클라이언트로 부터 받은 사용자정보를 데이터베이스에 저장한다.
	 * - 호출 : 사용자 조회를 한뒤 중복이 되지 않으면 deviceId로 사용자를 추가할 때 호출된다.      
	 * @param commandMap  [ 사용자ID ]
	 * @return 사용자 정보가 없다면 등록 후 반환, 있다면 그냥 반환
	 * @throws Exception
	 */
	@RequestMapping(value = "/carpoolboard/insertUser.do")
	public ModelAndView insertUser(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView("");
		User user = userDao.selectUser(commandMap.getMap());
		// 회원이 등록이 안됬다면
		if (user==null) {
			// 벌명 생성 
			AliasAddingService aliasAddingService = new AliasAddingService();
			aliasAddingService.setUserAlias(commandMap.getMap());
			userDao.insertUser(commandMap.getMap());
			user = userDao.selectUser(commandMap.getMap());
		}
		mv.addObject("user",user);
		mv.setViewName("jsonView");
		return mv;
	}

	/*
	 * ====================================================================================
	 *   [ 카풀 게시글 관리에 대한 메소드 목록 ] 
	 *    1. 게시글 목록 조회 
	 *    2. 등록, 참여한 게시글 목록 조회
	 *    3. 게시글 조회 및 권한 조회 
	 *    4. 게시글 등록
	 *    5. 수정될 게시글 조회
	 *    6. 게시글 수정
	 *    7. 게시글 삭제
	 * ====================================================================================
	 */	
	
	/**
	 * 1. 게시글 목록 조회
	 * - 기능 : 게시글 목록을 조회한다. 
	 * - 호출 : 초기, 페이징시 게시글 목록을 보여줄 때 호출된다.        
	 * @param commandMap [ 페이지 번호 , 페이지당 보여줄 게시글 수 ]
	 * @return  게시글 목록
	 * @throws Exception
	 */
	@RequestMapping(value = "/carpoolboard/getList.do")
	public ModelAndView selectBoardList(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		List<CarpoolBoard> boardList = carpoolBoardDao.selectBoardList(commandMap.getMap());
		
		/*
			   boardList <- 전체 목록
			   attendantList <- 참여 목록 
			   작성자 인지 확인안함?
			   필요한건? 참여여부 
			   클라이언트에서 계산을 해줘야하나?
			   
			   userId를 클라이언트로 부터 받는다. 
			   CarpoolBoard에 isMine 이라는 속성을 추가한다. 
			   String userId = commandMap.getMap().get("userId");
			   
			   for ( CarpoolBoard board : boardList ) 
			   {
			   	  for ( Attendant attendant : attendantList )
			   	  	  // 작성자라면 ( 게시글 작성자id == 사용자 id ) 
			   	   	  if ( board.getUserId() == userId )
			   	   	   			board.setMine(true);
			   	   	  // 참여자라면 ( 게시글 보드id == 참여자 보드id == 사용자 id )  
			   	   	  else if(  
			   }  
		 */
		
//		mv.addObject("boardlists", boardList );
//		mv.addObject("attendantList", attendantList );
		mv.addObject("lists",boardList);
		mv.setViewName("jsonView");
		return mv;
	}

	/**
	 * 2. 등록, 참여한 게시글 목록 조회
	 * - 기능 : 사용자가 등록 or 참여한 게시글 목록을 조회한다. 
	 * - 호출 : 내 카풀보기에서 목록을 보여줄 때 호출된다.  
	 * @param commandMap 
	 * @return  참여한 게시글 목록 
	 * @throws Exception
	 */ 
	@RequestMapping(value = "/carpoolboard/getMyList.do")
	public ModelAndView selectMyBoardList(CommandMap commandMap) throws Exception {
		List<CarpoolBoard> list = carpoolBoardDao.selectMyBoardList(commandMap.getMap());
		ModelAndView mv = new ModelAndView();

		// 리스트가 비지 않는다면
		if (!list.isEmpty()) {
			mv.setViewName("jsonView");
			mv.addObject("isMine", true);
			mv.addObject("lists", list);
		}
		// 리스트가 비었다면, ajax로 json 형태로
		else {
			mv.addObject("isEmpty", 1);
			mv.setViewName("jsonView");
		}
		return mv;
	}

	/**
	 * 3. 게시글 조회 및 권한 조회
	 * - 기능 : 게시글의 상세 내용 및 권한을 조회한다. 
	 * - 호출 : 게시글 목록에서 선택한 뒤 상세정보를 보여줄 때 호출된다.  
	 * @param commandMap [ 게시글ID, 사용자ID ] 
	 * @return  게시글 상세 정보, 댓글 목록, 권한   
	 * @throws Exception
	 */
	@RequestMapping(value = "/carpoolboard/getBoard.do")
	public ModelAndView selectBoardAndPermission(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();		
		CarpoolBoard cpBoard = carpoolBoardDao.selectBoardOne(commandMap.getMap());
		List<Comment> comments = carpoolBoardDao.selectCommentList(commandMap.getMap());
		
		Map<String, Object> permission = new HashMap<String, Object>();
		// 클라이언트로 부터 받은 사용자 Id
		String userId = (String) commandMap.get("userId");

		// 권한 검사를 위한 작성자 Id ( search By boardId )
		String writer = cpBoard.getUserId();

		// 작성자, 참여자
		boolean isWriter = false;
		boolean isAttendant = false;

		// 작성자라면
		if (userId == writer || userId.equals(writer))
			isWriter = true;
		// 참여자라면
		if (carpoolBoardDao.isAttend(commandMap.getMap()) != null) {
			isAttendant = true;
		}
		permission.put("isWriter", isWriter);
		permission.put("isAttendant", isAttendant);

		mv.addObject("comments", comments);
		mv.addObject("permission", permission);
		mv.addObject("board", cpBoard);
		mv.setViewName("jsonView");
		return mv;
	}

	/**
	 * 4. 게시글 등록
	 * - 기능 : 게시글을 등록하고 목적지를 설정해놓은 사용자에 대해 푸쉬를 한다.   
	 * - 호출 : 카풀 추가 화면에서 등록을 할 때 호출된다. 
	 * @param commandMap [ 게시글 정보 ]  
	 * @return    
	 * @throws Exception
	 */	
	@RequestMapping(value = "/carpoolboard/insertBoard.do")
	public ModelAndView insertBoard(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		// 클라이언트로 받은 게시글에 대한 유효성 검사
		boolean res = DataExceptionHandler.isBoardDataValidate(commandMap.getMap()); 
		// 데이터가 비지 않거나, 카풀 날짜가 현재 보다 미래이면 
		if(res)
			{
				// 게시글을 등록한다. 
				carpoolBoardDao.insertBoard(commandMap.getMap());
				commandMap.put("boardId", commandMap.get("cpBoardId"));
				
				// 게시글의 메모창의 내용이 첫 번째 댓글로 추가된다. 
				if(commandMap.getMap().get("comment")!="" ||
						!commandMap.getMap().get("comment").equals("") )
				carpoolBoardDao.insertComment(commandMap.getMap());	
				
				// 각 메소드에 여러 매개변수를 맵개체에 담아서 넘긴다.
				Map<String, Object> param = new HashMap<String, Object>();
				List<Destination> dests = destinationDao.selectDestination();
				
//				DestinationMatchingService destMatchingService = new DestinationMatchingService();
				MessagePushService messagePushService = new MessagePushService();
				param.put("dests", dests);
				// 매칭 결과를 구분하기 위한 변수
				boolean isMatchingResult = false;
				// 게시글과 사용자를 매칭하는 함수
				isMatchingResult = DestinationMatchingService.calculateBoardAndUsersMatching(commandMap.getMap(), param);
		
				// 매칭 결과가 있다면
				if (isMatchingResult) {
					// 해당되는 사용자들에게 푸쉬
					messagePushService.pushMessage(param);
					// 디비에 메시지 저장
					messageDao.insertMessage(param);
				}
			}
		else
		{
			res = false;
		}
		mv.addObject("res",res);
		mv.setViewName("jsonView");
		return mv;
	}
	
	/**
	 * 5. 수정될 게시글 조회
	 * - 기능 : 수정할 게시글을 조회한다.  
	 * - 호출 : 게시글을 조회한 뒤 화면에서 수정 화면으로 이동할 때 호출된다. 
	 * @param commandMap [ 게시글ID ]  
	 * @return  게시글 정보
	 * @throws Exception
	 */	
	@RequestMapping(value = "/carpoolboard/updateBoardView.do")
	public ModelAndView selectUpdatedBoard(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		CarpoolBoard cpBoard = carpoolBoardDao.selectBoardOne(commandMap.getMap());
		mv.addObject("cpBoard", cpBoard);
		mv.setViewName("jsonView");
		return mv;
	}

	/**
	 * 6. 게시글 수정
	 * - 기능 : 게시글을 수정한다.  
	 * - 호출 : 게시글 수정화면에서 내용을 변경한 후 수정을 할 때 호출된다. 
	 * @param commandMap [ 게시글 정보 ]  
	 * @return  
	 * @throws Exception
	 */
	@RequestMapping(value = "/carpoolboard/updateBoard.do")
	public ModelAndView updateBoard(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		boolean res = DataExceptionHandler.isBoardDataValidate(commandMap.getMap()); 
		// 데이터가 비지 않거나, 카풀 날짜가 현재 보다 미래이면 
		if(res)
			{
		
				// 사용자 권한 검사( 글쓴이 인지 아닌지)
				CarpoolBoard cpBoard = carpoolBoardDao.selectBoardOne(commandMap.getMap());
				
				String writer = cpBoard.getUserId();
				String userId = (String) commandMap.get("userId");
		
				// 삭제하려는 사람이 글쓴이라면
				if (writer == userId || writer.equals(userId)) {
					carpoolBoardDao.updateBoard(commandMap.getMap());
				} else {
					res = false;
				}
			}
		else
		{
			res = false; 
		}
		mv.addObject("res", res);
		mv.setViewName("jsonView");
		return mv;
	}

	/**
	 * 7. 게시글 삭제
	 * - 기능 : 게시글을 삭제한다.  
	 * - 호출 : 게시글 수정화면에서 삭제를 할 때 호출된다. 
	 * @param commandMap [ 게시글ID ]  
	 * @return  
	 * @throws Exception
	 */	
	@RequestMapping(value = "/carpoolboard/deleteBoard.do")
	public ModelAndView deleteBoard(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		boolean res = true;

		// 사용자 권한 검사( 글쓴이 인지 아닌지)
		CarpoolBoard cpBoard = carpoolBoardDao.selectBoardOne(commandMap.getMap());
		
		String writer = cpBoard.getUserId();
		String userId = (String) commandMap.get("userId");

		// 삭제하려는 사람이 글쓴이라면
		if (writer == userId || writer.equals(userId)) {
			carpoolBoardDao.deleteBoard(commandMap.getMap());
		} else {
			res = false;
		}
		mv.addObject("res", res);
		mv.setViewName("jsonView");
		return mv;
	}

	/*
	 * ====================================================================================
	 *   [ 카풀 참여/취소에 대한 메소드 목록 ] 
	 *    1. 카풀 참여  
	 *    2. 카풀 취소 
	 * ====================================================================================
	 */	
	
	/**
	 * 1. 카풀 참여
	 * - 기능 : 카풀 참여 명단에 추가 및 게시글의 현재 인원 업데이트 
	 * - 호출 : 게시글 조회화면에서 카풀 참여할 때 호출된다. 
	 * @param commandMap [ 게시글ID,사용자ID ]  
	 * @return  현재 카풀 인원수 
	 * @throws Exception
	 */
	@RequestMapping(value = "/carpoolboard/attend.do")
	public ModelAndView attendCarpool(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		boolean res = true;

		// 클라이언트가 전달한 데이터를 지역 변수에 저장한다.
		CarpoolBoard cpBoard = carpoolBoardDao.selectBoardOne(commandMap.getMap());
		String writer = cpBoard.getUserId();
		String userId = (String) commandMap.get("userId");

		// 현재인원,총인원
		int numberOfPersons = cpBoard.getNumberOfPersons();
		int currentPersons = cpBoard.getCurrentPersons();

		// 중복 참여 검사는 Attendant 테이블에서 계산한다.
		// 글쓴이가 참여 하려고 한다면
		if (writer == userId || writer.equals(userId)) {
			res = false;
		} else {
			// 현재 카풀 인원이 꽉차면 카풀 신청 불가능
			if (currentPersons >= numberOfPersons) {
				res = false;
			} else {
				// 중복 참여 방지
				if(carpoolBoardDao.insertAttendant(commandMap.getMap())!=0)
				{
					currentPersons++;
					commandMap.put("currentPersons", currentPersons);
					// 디비에서 카운트 올린다 
					// 업데이트로 인원 변경
					carpoolBoardDao.updateCurrentPeopleCount(commandMap.getMap());
				}
			}
		}
		mv.addObject("res", res);
		// 현재 인원 수 클라이언트에게 전달
		mv.addObject("currentPersons", currentPersons);
		mv.setViewName("jsonView");
		return mv;
	}

	/**
	 * 2. 카풀 취소 
	 * - 기능 : 카풀 참여 명단에서 제거 및 게시글의 현재 인원 업데이트 
	 * - 호출 : 게시글 조회화면에서 카풀 취소할 때 호출된다. 
	 * @param commandMap [ 게시글ID,사용자ID ]  
	 * @return  
	 * @throws Exception
	 */	
	@RequestMapping(value = "/carpoolboard/cancel.do")
	public ModelAndView cancelCarpool(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		boolean res = true;
		// cpBoardId로 select
		CarpoolBoard cpBoard = carpoolBoardDao.selectBoardOne(commandMap.getMap());
		
		String writer = cpBoard.getUserId();
		String userId = (String) commandMap.get("userId");
		int currentPersons = cpBoard.getCurrentPersons();

		// 작성자 라면
		if (writer == userId || writer.equals(userId)) {
			res = false;
		} else {
			// 참여자 명단에 있으면 취소 된다.
			if(carpoolBoardDao.deleteAttendant(commandMap.getMap())!=0){
				currentPersons--;
				commandMap.put("currentPersons", currentPersons);
				carpoolBoardDao.updateCurrentPeopleCount(commandMap.getMap());
			}
		}
		mv.addObject("res", res);
		mv.addObject("currentPersons", currentPersons);
		mv.setViewName("jsonView");
		return mv;
	}

    /*
     * ====================================================================================
     *   [ 댓글 등록/취소에 대한 메소드 목록 ] 
     *    1. 댓글 등록  
     *    2. 댓글 취소  
     * ====================================================================================
     */	
	/**
	 * 1. 댓글 등록 
	 * - 기능 : 댓글을 등록하고 목록을 반환한다. 
	 * - 호출 : 게시글 조회한 뒤 댓글을 입력할 때 호출된다.  
	 * @param commandMap [ 게시글ID, 사용자ID, 댓글내용 ]  
	 * @return  댓글 목록
	 * @throws Exception
	 */		
	@RequestMapping(value = "/carpoolboard/addComment.do")
	public ModelAndView addComment(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		boolean res = DataExceptionHandler.isCommentDataValidate(commandMap.getMap());
		if(res)
		{
			carpoolBoardDao.insertComment(commandMap.getMap());
			List<Comment> commentList = carpoolBoardDao.selectCommentList(commandMap.getMap());
			mv.addObject("commentList", commentList);
		}
		mv.setViewName("jsonView");
		return mv;
	}
	
	/**
	 * 2. 댓글 삭제 ( 현재 클라이언트에서 댓글 삭제를 요청하지 않으므로 사용되지 않는다. ) 
	 * - 기능 : 댓글을 삭제하고 목록을 반환한다. 
	 * - 호출 : 게시글 조회한 뒤 댓글을 삭제할 때 호출된다.  
	 * @param commandMap [ 댓글ID ]  
	 * @return  댓글 목록
	 * @throws Exception
	 */		
	@RequestMapping(value = "/carpoolboard/deleteComment.do")
	public ModelAndView deleteComment(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();		
		carpoolBoardDao.deleteComment(commandMap.getMap());
		List<Comment> commentList = carpoolBoardDao.selectCommentList(commandMap.getMap());

		mv.addObject("commentList", commentList);
		mv.setViewName("jsonView");
		return mv;
	}

    /*
     * ====================================================================================
     *   [ 메시지 관리에 대한 메소드 목록 ] 
     *    1. 메시지 조회
     * ====================================================================================
     */
	/**
	 * 1. 메시지 목록 조회 
	 * - 기능 : 메시지 목록을 조회한다.  
	 * - 호출 : 게시글 조회한 뒤 댓글을 삭제할 때 호출된다.  
	 * @param commandMap [ 사용자ID ]  
	 * @return  메시지 목록 
	 * @throws Exception
	 */			
	@RequestMapping(value = "/message/getMessage.do")
	public ModelAndView viewMessageList(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		List<Message> messages = messageDao.selectMessage(commandMap.getMap());
		mv.addObject("messageList", messages);
		mv.setViewName("jsonView");
		return mv;
	}

}