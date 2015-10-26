package kcp.sample.service;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import kcp.sample.vo.Destination;

public class DestinationMatchingService {

	public static Map<String,Object> calculateDestinationMatching(Destination targetDest, List<Destination> dests) {
		int matchingCount = 0;
		boolean isMatching = false;
		String message = "";
		Map<String,Object> resultMap = new HashMap<>();
		for (Destination compareDest : dests) {
			// 사용자 자신의 목적지와 같지 않다면
			if (!targetDest.getUserId().equals(compareDest.getUserId())) {
				// 년,도,월 이 같다면
				if (targetDest.getCarpoolTime().getYear() == compareDest.getCarpoolTime().getYear()
						&& targetDest.getCarpoolTime().getMonth() == compareDest.getCarpoolTime().getMonth()
						&& targetDest.getCarpoolTime().getDate() == compareDest.getCarpoolTime().getDate()
						&& targetDest.getCarpoolTime().getHours() == compareDest.getCarpoolTime().getHours()) {
					// 목적지와 출발지가 같다면
					if ((targetDest.getStartPoint() == compareDest.getStartPoint()
							|| targetDest.getStartPoint().equals(compareDest.getStartPoint()))
							&& (targetDest.getArrivePoint() == compareDest.getArrivePoint()
									|| targetDest.getArrivePoint().equals(compareDest.getArrivePoint()))) {
						// 두 시간의 차가 10분 이하이면
						if (targetDest.getCarpoolTime().getMinutes() - compareDest.getCarpoolTime().getMinutes() < 11
								|| compareDest.getCarpoolTime().getMinutes()
										- targetDest.getCarpoolTime().getMinutes() < 11) {
							matchingCount++;
						}
					}
				}
			}
		}

		// 매칭 결과 메시지 리턴
		if (matchingCount == 0) {
//			return "현재 매칭되는 사람이 없습니다.";
			message = "현재 매칭되는 사람이 없습니다.";
		} else {
			isMatching = true; 
			Date date = new Date(targetDest.getCarpoolTime().getTime());
			long before10min = date.getTime() - (60 * 1000 * 10);
			long after10min = date.getTime() + (60 * 1000 * 10);
			Date before = new Date(before10min);
			Date after = new Date(after10min);
			SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");

			message =  timeFormat.format(before) + " ~ " + timeFormat.format(after) + " 사이 "
					+ (String) targetDest.getStartPoint() + " -> " + (String) targetDest.getArrivePoint() + "가는 사람이 "
					+ matchingCount + "명 있습니다. 카풀 만드시겠습니까?";
			isMatching = true; 
		}
		resultMap.put("message", message);
		resultMap.put("isMatching", isMatching);
		return resultMap;
	}

	public static boolean calculateBoardAndUsersMatching(Map<String, Object> board, Map<String, Object> param) throws ParseException {
		// 매칭결과가 null 인지 아닌지 구분을 위한 변수. 초기값은 매칭결과가 존재
		boolean isMatchingResult = true;
			
		// 모든 목적지 데이터를 리스트에 담는다.
		@SuppressWarnings("unchecked")
		List<Destination> dests = (List<Destination>) param.get("dests");

		// param 객체에 담을 변수
		List<String> regIds = new ArrayList<>();
		List<String> userIds = new ArrayList<>();
		String message = "";

		// map안에 있는 속성으로 초기화 한다.
		String startPoint = (String) board.get("startPoint");
		String arrivePoint = (String) board.get("arrivePoint");
//		Timestamp carpoolTime = new Timestamp(new Date(board.get("carpoolTime")).getTime());
		// String -> Timestamp
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm");
	    Date parsedDate = dateFormat.parse((String)board.get("carpoolTime"));
	    Timestamp carpoolTime = new java.sql.Timestamp(parsedDate.getTime());
	    
		String userId = (String) board.get("userId");

		// 시간 포맷
		SimpleDateFormat timeFormat = new SimpleDateFormat("HH:mm");
		
		// 매칭되는 regId가 필요하다( 푸쉬하기 위해 ) 매칭되는 userId가 필요하다( 디비에 저장하기 위해 )
		for (Destination compareDest : dests) {
			// 글쓴이에게는 푸쉬가 필요 없으므로 제외
			if (!userId.equals(compareDest.getUserId())) {
				// 년,도,월 이 같다면
				if (carpoolTime.getYear() == compareDest.getCarpoolTime().getYear()
						&& carpoolTime.getMonth() == compareDest.getCarpoolTime().getMonth()
						&& carpoolTime.getDate() == compareDest.getCarpoolTime().getDate()
						&& carpoolTime.getHours() == compareDest.getCarpoolTime().getHours()) {
					// 목적지와 출발지가 같다면
					if ((startPoint == compareDest.getStartPoint() || startPoint.equals(compareDest.getStartPoint()))
							&& (arrivePoint == compareDest.getArrivePoint()
									|| arrivePoint.equals(compareDest.getArrivePoint()))) {
						// 두 시간의 차가 10분 이하이면
						if (carpoolTime.getMinutes() - compareDest.getCarpoolTime().getMinutes() < 11
								|| compareDest.getCarpoolTime().getMinutes() - carpoolTime.getMinutes() < 11) {
							// 매칭 되면 List에 regId 추가
							regIds.add(compareDest.getRegId());
							userIds.add(compareDest.getUserId());
						}
					}
				}
			}
		}
		// 매칭이 안됬다면 두 리스트가 empty 이다.
		if( regIds.isEmpty() && userIds.isEmpty())
			isMatchingResult = false; 
		
		message = timeFormat.format(carpoolTime.getTime()) + " " + startPoint + " -> " + arrivePoint + " 글이 등록되었습니다.";
		param.put("regIds", regIds);
		param.put("userIds", userIds);
		param.put("contents", message);
		return isMatchingResult;
	}
}
