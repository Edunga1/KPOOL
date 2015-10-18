package kcp.sample.service;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import com.google.android.gcm.server.Message;
import com.google.android.gcm.server.Sender;

public class MessagePushService {
	
	private static final String googleServerKey ="AIzaSyCUhc077Qxz9RGFwtCcMHmAyp8pooiDQJs"; 
	
	// 싱글톤 패턴
	
	public void pushMessage(Map<String,Object> param) throws IOException{
		@SuppressWarnings("unchecked")		
		List<String> regIds = (List<String>)param.get("regIds");
		// --------
		Sender sender = new Sender(googleServerKey);
		Message msg = new Message.Builder()
				.collapseKey("PhoneGapDemo")
				.delayWhileIdle(false)
				.timeToLive(3)
				.addData("title", "KumohCarPool")
				.addData("message", (String)param.get("contents"))
				.build();
		for(int i =0 ; i<regIds.size(); i++)
			sender.send(msg, regIds.get(i), 2);
	}
}