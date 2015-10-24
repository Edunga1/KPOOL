package kcp.sample.service;

import java.sql.Timestamp;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

/**
 * 카풀 게시글 유효성 검사 클래스
 * @author CoCoball
 */
public class CarPoolBoardExceptionHadler {
	
	/**
	 * 1. 게시글 데이터들에 대한 유효성 검사
	 * - 기능 : 입력받은 데이터들이 Null 인지 검사를 한다.
	 * - 호출 : 컨트롤러에서 게시글 데이터 유효성 검사를 할 때 호출된다. 
	 * @param param [ 게시글 정보 ] 
	 * @return boolean 데이터 유효성 여부
	 * @throws ParseException
	 */
	static public boolean checkDataValidation(Map<String,Object> param) throws ParseException {
		// 데이터 예외에 대한 값 
		boolean isValidate = true;

		//	모든 Map 객체 안에 있는 값들에 대하여 null 검사를 한다.  
		for( Map.Entry<String, Object> value : param.entrySet() )
		{
			//입력받은 시간값이 현재보다 미래이면 true , 아니면 false
			if( param.containsKey("carpoolTime"))
				isValidate = compareCarpoolTimeToToday((String)param.get("carpoolTime"));
			// 값이 null이면 false
			if( value.getValue() == null || value.getValue().equals(null) || value.getValue().toString().equals(""))
				isValidate = false;	
		}
		return isValidate;
	}
	
	/**
	 * 2. 카풀시간 데이터 유효성 검사
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
