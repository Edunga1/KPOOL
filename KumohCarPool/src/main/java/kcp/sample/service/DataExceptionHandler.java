package kcp.sample.service;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

/**
 * 카풀 게시글 유효성 검사 클래스
 * @author CoCoball
 * - 이 클래스를 개선해야한다. 필요없는 클래스이다.
 *  스프링에서 이에 대한 기능을 제공하기 때문이다.
 *  Map을 파라미터로 받기 떄문에 이러한 클래스를 쓰게 됫다.
 * - 카풀 등록&수정, 목적지 등록&수정, 댓글 등록
 */
public class DataExceptionHandler {
	
	/**
	 * 1. 게시글 데이터들에 대한 유효성 검사
	 * - 기능 : 입력받은 데이터들이 Null 인지 검사를 한다.
	 * - 호출 : 컨트롤러에서 게시글 데이터 유효성 검사를 할 때 호출된다. 
	 * @param param [ 게시글 정보 ] 
	 * @return boolean 데이터 유효성 여부
	 * @throws ParseException
	 */
	static public boolean isBoardDataValidate(Map<String,Object> param) throws ParseException {
		// 데이터 예외에 대한 값 
		boolean isValidate = true;

		// 모든 Map 객체 안에 있는 값들에 대하여 null 검사를 한다.  
		// 만약 특정 값에 대해 비어있으면 null 이 된다. 
		for( Map.Entry<String, Object> value : param.entrySet() )
		{
			System.out.println("DEBUG : "+ value.getKey() + " : " + value.getValue());
			if (
					param.containsKey("userId") == true &&
					param.containsKey("startPoint") == true &&
					param.containsKey("arrivePoint") == true &&
					param.containsKey("startLatitude") == true &&
					param.containsKey("startLongitude") == true &&				
					param.containsKey("carType") == true &&
					param.containsKey("numberOfPersons") == true &&  
					param.containsKey("carpoolTime")
					) 
			{
				// 키는 있는 데 값이 null 이면, false
				if( 
						param.get("userId") == null || param.get("userId") == "" ||
						param.get("startPoint") == null || param.get("startPoint") == "" ||
						param.get("arrivePoint") == null || param.get("arrivePoint") == "" ||
						param.get("startLatitude") == null || param.get("startLatitude") == "" ||
						param.get("startLongitude") == null || param.get("startLongitude") == "" ||
						param.get("carType") == null || param.get("carType") == "" ||
						param.get("numberOfPersons") == null || param.get("numberOfPersons") == "" ||
								compareCarpoolTimeToToday((String)param.get("carpoolTime")) == false
						) 
							isValidate =false;
			}
			else{
				isValidate = false;
			}	
		}
		return isValidate;
	}
	
	/**
	 * 2. 목적지 데이터들에 대한 유효성 검사
	 * - 기능 : 입력받은 데이터들이 Null 인지 검사를 한다.
	 * - 호출 : 컨트롤러에서 목적지 데이터 유효성 검사를 할 때 호출된다. 
	 * @param param [ 목적지 정보 ] 
	 * @return boolean 데이터 유효성 여부
	 * @throws ParseException
	 */
	static public boolean isDestinationDataValidate(Map<String,Object> param) throws ParseException {
		// 데이터 예외에 대한 값 
		boolean isValidate = true;
		
		if(param.get("startPoint")!="")
			System.out.println("성공");
		
		// 모든 Map 객체 안에 있는 값들에 대하여 null 검사를 한다.  
		// 만약 특정 값에 대해 비어있으면 null 이 된다. 
		for( Map.Entry<String, Object> value : param.entrySet() )
		{
			System.out.println("DEBUG : "+ value.getKey() + " : " + value.getValue());
			if ( 
					param.containsKey("userId") == true && 
					param.containsKey("startPoint") == true &&
					param.containsKey("arrivePoint") == true && 
					param.containsKey("carpoolTime") == true 
					// regId는 테스팅을 위해 안넣음 
				)
			{
				System.out.println("진입1");
				
				// 키는 있는 데 값이 null 이면, false
				if( 
						param.get("userId") == null || param.get("userId") == "" || 
						param.get("startPoint") == null || param.get("startPoint") == "" || 
						param.get("arrivePoint") == null || param.get("arrivePoint") == "" || 
						compareCarpoolTimeToToday((String)param.get("carpoolTime")) == false
						) 
							isValidate =false;
			}
			else{
				isValidate = false;
			}	
		}
		return isValidate;
	}
	
	/**
	 * 3. 댓글 데이터들에 대한 유효성 검사
	 * - 기능 : 입력받은 데이터들이 Null 인지 검사를 한다.
	 * - 호출 : 컨트롤러에서 목적지 데이터 유효성 검사를 할 때 호출된다. 
	 * @param param [ 목적지 정보 ] 
	 * @return boolean 데이터 유효성 여부
	 * @throws ParseException
	 */
	static public boolean isCommentDataValidate(Map<String,Object> param) throws ParseException {
		// 데이터 예외에 대한 값 
		boolean isValidate = true;

		//	모든 Map 객체 안에 있는 값들에 대하여 null 검사를 한다.  
		//만약 특정 값에 대해 비어있으면 null 이 된다. 
		for( Map.Entry<String, Object> value : param.entrySet() )
		{
			System.out.println("DEBUG : "+ value.getKey() + " : " + value.getValue());
			if ( 
					param.containsKey("userId") == true && 
					param.containsKey("cpBoardId") == true &&
					param.containsKey("comment") == true  
					// regId는 테스팅을 위해 안넣음 
				)
			{
				// 키는 있는 데 값이 null 이면, false
				if( 
						param.get("userId") == null || param.get("userId") == "" || 
						param.get("cpBoardId") == null || param.get("cpBoardId") == "" || 
						param.get("comment") == null || param.get("comment") == ""   
						) 
							isValidate =false;
			}
			else{
				isValidate = false;
			}	
		}
		return isValidate;
	}
	
	/**
	 * 4. 카풀시간 데이터 유효성 검사
	 * - 기능 : 카풀시간과 현재 시간을 비교한다. 
	 * - 호출 : 게시글 데이터들에 대한 유효성을 검사할 때 호출된다. 
	 * @param param
	 * @return 현재 시간 보다 미래인가? true : false 
	 * @throws ParseException
	 */
	private static boolean compareCarpoolTimeToToday(String param ) throws ParseException
	{
		boolean isValidate = true;
		
		// 시간에 값에 대해 검사를 하기 위해 변수 선언
		SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm");
		// String -> Timestamp 
	    Date parsedDate = dateFormat.parse(param);
	    Timestamp carpoolTime = new java.sql.Timestamp(parsedDate.getTime());
	    // 현재시간
	    Timestamp todayTime = new Timestamp(new Date().getTime());

	    // 현재 시간 보다 앞 이면 
	    if(carpoolTime.before(todayTime))
	    	isValidate= false;
	    return isValidate;
	}
}
