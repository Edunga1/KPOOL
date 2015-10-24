package kcp.sample.controller;

import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

import kcp.common.common.CommandMap;
import kcp.sample.dao.DestinationDAO;
import kcp.sample.service.DataExceptionHandler;
import kcp.sample.service.DestinationMatchingService;
import kcp.sample.vo.Destination;

@Controller
public class DestinationController {
	Logger log = Logger.getLogger(this.getClass());
	
	@Resource(name = "destinationDAO")
	private DestinationDAO destinationDao;

	/*
	 * ====================================================================================
	 *   [ 목적지 관리에 대한 메소드 목록 ] 
	 *    1. 목적지 조회 
	 *    2. 목적지 매치
	 *    3. 목적지 추가
	 *    4. 목적지 삭제
	 * ====================================================================================
	 */	
	
	 /**
	 * 1. 목적지 조회 
	 * - 기능 : 목적지를 클라이언트로 부터 받은 사용자ID로 조회한다.  
	 * - 호출 : 목적지 메뉴를 선택할 때 호출 된다.    
	 * @param commandMap [ 사용자ID ]
	 * @return 목적지 객체  
	 * @throws Exception
	 */
	@RequestMapping(value = "/destination/select.do")
	public ModelAndView selectDest(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		boolean res = false;
		// 사용자가 목저지를 가지고 있는지 검사를 하기 위해 쿼리를 요청한다.
		Destination destination = destinationDao.selectDestOne(commandMap.getMap());
		// 사용자가 가지고 있는 목적지가 있다면
		if (destination != null) 
		{	
			mv.addObject("destination", destination);
			res = true;
		}
		mv.addObject("res", res);
		mv.setViewName("jsonView");
		return mv;
	}

	 /**
	 * 2. 목적지 매칭 
	 * - 기능 : 사용자 목적지와 저장된 목적지 목록과 비교 후 매칭 한다. 
	 * - 호출 : 메뉴에서 매칭을 선택했을 때 호출된다. 
	 * @param commandMap [ 사용자ID ]
	 * @return 매칭 결과 메시지
	 * @throws Exception
	 */
	@RequestMapping(value = "/destination/match.do")
	public ModelAndView viewBoardList(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		boolean res = false;
		Destination targetDest = destinationDao.selectDestOne(commandMap.getMap());
		// 이미 설정한 목적지가 있다면
		if (targetDest != null) {
			List<Destination> destinationLists = destinationDao.selectDestination();
			// 매칭 서비스를 위한 객체 생성
			DestinationMatchingService destMatchingService = new DestinationMatchingService();
			// 매칭 함수 호출
			Map<String,Object> reultMap = destMatchingService.calculateDestinationMatching(targetDest, destinationLists );
			res = true;
			mv.addObject("message", reultMap.get("message"));
			mv.addObject("isMatching", reultMap.get("isMatching"));
		}
		// 설정한 목적지가 없다면
		else
		{
			mv.addObject("message", "설정한 목적지가 없습니다.");
		}
		mv.addObject("res", res);
		mv.setViewName("jsonView");

		return mv;
	}

	 /**
	 * 3. 목적지 추가 
	 * - 기능 : 목적지를 추가 한다.  
	 * - 호출 : 목적지 메뉴 선택 후 설정 버튼을 누르면 호출된다. 
	 * @param commandMap [ 사용자ID ]
	 * @return 매칭 결과 메시지
	 * @throws Exception
	 */	
	@RequestMapping(value = "/destination/add.do")
	public ModelAndView insertMatchDestination(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		boolean res = DataExceptionHandler.isDestinationDataValidate(commandMap.getMap());
		// 데이터가 비지 않거나, 카풀 날짜가 현재 보다 미래이면 
		if(res)
			{
				try {
					// 이미 설정한 목적지가 없다면.
					if (destinationDao.selectDestOne(commandMap.getMap()) == null) {
						destinationDao.insertDestination(commandMap.getMap());
					}
					// 이미 설정한 목적지가 있다면
					else {
						destinationDao.updateDestination(commandMap.getMap());
					}
				} catch (SQLException e) {
					res = false;
				}
			}
		mv.addObject("res", res);
		mv.setViewName("jsonView");
		return mv;
	}
	
	 /**
	 * 4. 목적지 삭제 
	 * - 기능 : 묵적지를 삭제 한다.  
	 * - 호출 : 목적지 메뉴 선택 후 삭제 버튼을 누르면 호출된다.  
	 * @param commandMap [ 사용자ID ]
	 * @return 매칭 결과 메시지
	 * @throws Exception
	 */
	@RequestMapping(value = "/destination/delete.do")
	public ModelAndView deleteMatchDestination(CommandMap commandMap) throws Exception {
		ModelAndView mv = new ModelAndView();
		destinationDao.deleteDestinaiton(commandMap.getMap());
		mv.setViewName("jsonView");
		return mv;
	}
}
