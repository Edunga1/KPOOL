package kcp.common.resolver;

import java.util.Iterator;

import org.springframework.core.MethodParameter;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import kcp.common.common.CommandMap;
import kcp.sample.service.MD5Encryptor;

public class CustomMapArgumentResolver implements HandlerMethodArgumentResolver {
	@Override
	public boolean supportsParameter(MethodParameter parameter) {
		return CommandMap.class.isAssignableFrom(parameter.getParameterType());
	}

	@Override
	public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
			NativeWebRequest webRequest, WebDataBinderFactory binderFactory) throws Exception {
		CommandMap commandMap = new CommandMap();

		for (Iterator<String> iterator = webRequest.getParameterNames(); iterator.hasNext();) {
			String key = iterator.next();
			if (key == "pageIndex" || key.equals("pageIndex")) {
				commandMap.put(key, Integer.parseInt(webRequest.getParameter(key)));
			} else if (key == "pageNumber" || key.equals("pageNumber")) {
				commandMap.put(key, Integer.parseInt(webRequest.getParameter(key)));
			} else if (key == "userId" || key.equals("userId")) {
				commandMap.put(key, MD5Encryptor.encryptToMD5(webRequest.getParameter(key)));
			} else {
				commandMap.put(key, webRequest.getParameter(key));
			} 
		}
		return commandMap;
	}
}