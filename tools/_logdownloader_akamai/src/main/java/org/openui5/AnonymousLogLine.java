package org.openui5;

import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import net.sf.uadetector.ReadableUserAgent;
import net.sf.uadetector.UserAgentStringParser;
import net.sf.uadetector.UserAgentType;
import net.sf.uadetector.service.UADetectorServiceFactory;

/**
 * Represents one HTTP log file line, but an anonymized one (not containing any IP address, but just a number instead)
 * 
 * @author d046011
 *
 */
public class AnonymousLogLine {


	/*
	 * Groups:
	 * 0: entire string
	 * 1: ipCounter
	 * 2: day
	 * 3: month
	 * 4: year
	 * 5: hours
	 * 6: minutes
	 * 7: seconds
	 * 8: method
	 * 9: url
	 * 11: HTTP code in case of two numbers
	 * 12: first number in case of two
	 * 13: second number in case of two
	 * 14: HTTP code in case of one number
	 * 15: the one number
	 */
	//private static final Pattern ANON_LOGLINE_PATTERN = Pattern.compile("^(\\d+) \\[(\\d+)/(\\w+)/(\\d\\d\\d\\d):(\\d\\d):(\\d\\d):(\\d\\d) \\+0000\\] (\\w+) ([^\\s]+) HTTP/\\d.\\d ((\\d+) (\\d+) (\\d+)|(\\d+) - (\\d+))$");
	/*
	 * Groups:
	 * 0: (entire string)
	 * 1: (full date)
	 * 2: year
	 * 3: month
	 * 4: day
	 * 5: (full time)
	 * 6: hours
	 * 7: minutes
	 * 8: seconds
	 * 9: anonymized IP (integer counter)
	 * 10: method
	 * 11: full URL
	 * 12: region
	 * 13: local URL (starting with slash)
	 * 14: HTTP status code
	 * 15: some number... e.g. size?
	 * 16: another number 0..3
	 * 17: referrer or dash
	 * 18: referrer if available
	 * 19: user-agent
	 */
	private static final Pattern ANON_LOGLINE_PATTERN = Pattern.compile("^((\\d{4})-([01]\\d)-([0-3]\\d))	(([0-9]+):([0-5][0-9]):([0-5][0-9]))	(\\d+)	(\\w+)	(/openui5\\.(\\w\\w)\\d\\.hana\\.ondemand.com(/[^\\s]*))	(\\d+)	(\\d+)	(\\d+)	\"(([^\\s]+)|[-])\"	\"([^\"]+)\"	.*$");
	
	private static final Pattern RUNTIME_PATTERN = Pattern.compile("^/downloads/openui5-runtime-1.(\\d+).(\\d+(-SNAPSHOT)?).zip$");
	private static final Pattern MOBILE_PATTERN = Pattern.compile("^/downloads/openui5-runtime-mobile-1.(\\d+).(\\d+(-SNAPSHOT)?).zip$");
	private static final Pattern SDK_PATTERN = Pattern.compile("^/downloads/openui5-sdk-1.(\\d+).(\\d+(-SNAPSHOT)?).zip$");
	private static final String GITHUB_PAGE_STRING = "/resources/sap/ui/core/themes/base/img/1x1.gif?page=index";
	private static final String BLOG_PAGE_STRING = "/resources/sap/ui/core/themes/base/img/1x1.gif?page=blog";
	private static final String REFERENCES_PAGE_STRING = "/resources/sap/ui/core/themes/base/img/1x1.gif?page=whoUsesUI5";
	private static final String FEATURES_PAGE_STRING = "/resources/sap/ui/core/themes/base/img/1x1.gif?page=features";
	private static final String GETSTARTED_PAGE_STRING = "/resources/sap/ui/core/themes/base/img/1x1.gif?page=getstarted";
	private static final String DEMOKIT_PAGE_STRING = "/";

	// this bot list only extends the used library
	private static final String[] USERAGENT_BOT_SUBSTRINGS_ARRAY = {"SMTBot/","Twitterbot/","DuckDuckGo-Favicons-Bot/",
		"Cliqzbot/","TweetmemeBot/","Findxbot/","TweetedTimes Bot/","Traackr.com Bot","Applebot/",
		"linkdexbot/","Spiderbot/","OpenHoseBot/","+https://api.slack.com/robots","Googlebot/","occbot/index","Domnutch-Bot/","yoozBot/","AOLbot/",
		"HaosouSpider","YisouSpider","ExpertSearchSpider","+http://megaindex.com/crawler","Gluten Free Crawler/","+http://www.netseer.com/crawler.html"};

	private Date date;
	private String ipCounter;
	private Resource type;
	private int code;
	private String url;
	private int firstNumber;
	private int secondNumber;
	private int oneNumber;
	private String referrer;
	private Region region;
	private String userAgent;

	private AnonymousLogLine(Date date, String ipCounter, Resource type, int code, String url, int firstNumber, int secondNumber, String referrer, Region region, String userAgent) {
		super();
		this.date = date;
		this.ipCounter = ipCounter;
		this.type = type;
		this.code = code;
		this.url = url;
		this.firstNumber = firstNumber;
		this.secondNumber = secondNumber;
		this.referrer = referrer;
		this.region = region;
		this.userAgent = userAgent;
	}

	private AnonymousLogLine(Date date, String anonymizedFullText) {
		super();
		this.date = date;
	}



	public Date getDate() {
		return date;
	}

	/**
	 * 
	 * @return the counter number assigned to the IP address this log line originally had
	 */
	public String getIpCounter() {
		return ipCounter;
	}

	public Resource getType() {
		return type;
	}

	public int getCode() {
		return code;
	}

	public String getUrl() {
		return url;
	}

	public int getFirstNumber() {
		return firstNumber;
	}

	public int getSecondNumber() {
		return secondNumber;
	}

	public int getOneNumber() {
		return oneNumber;
	}
	
	public String getReferrer() {
		return referrer;
	}

	public Region getRegion() {
		return region;
	}
	
	public String getUserAgent() {
		return userAgent;
	}



	public static AnonymousLogLine createFromLine(String line) {
		Matcher m = ANON_LOGLINE_PATTERN.matcher(line);

		if (m.matches()) {

			String codeStr = m.group(14);
			int code = Integer.parseInt(codeStr);

			if (!m.group(10).equals("GET")) { // only GET
				return null;
			}
			if (code == 404 || code == 304) {
				return null; // not found, not modified
			}

			Resource type = getResourceType(m.group(13));
			if (type == null) {
				if (line.indexOf("openui5-runtime") > -1 || line.indexOf("openui5-sdk") > -1) {
					System.out.println("WARNING: did we not match a valid file? " + line);
				}
				return null; // none of the interesting resources
			}

			// now the line seems to be one of the interesting resources

			String ipCounter = m.group(9);
			
			Region region = Region.EU;
			String regionString = m.group(12);
			if ("us".equals(regionString)) {
				region = Region.US;
			} else if ("ap".equals(regionString)) {
				region = Region.AP;
			} else if (!regionString.equals("eu")) {
				throw new RuntimeException("Unknown Region string: " + regionString);
			}

			AnonymousLogLine logLine = new AnonymousLogLine(
					new Date(
							Integer.parseInt(m.group(2)) - 1900,
							Integer.parseInt(m.group(3))-1,
							Integer.parseInt(m.group(4)),
							Integer.parseInt(m.group(6)),
							Integer.parseInt(m.group(7)),
							Integer.parseInt(m.group(8))
							),
							ipCounter,
							type,
							code,
							m.group(13), // url
							Integer.parseInt(m.group(14)), // first number
							Integer.parseInt(m.group(15)),// second number
							m.group(18), // url
							region, // region
							m.group(19) // user-agent
					);
			return logLine;
		} else {
			if (!line.equals("") &&
					!(line.indexOf("GET /\"\" window") > -1) &&
					!(line.indexOf("GET /\"\" s \"/\"") > -1) &&
					!(line.indexOf("GET /\"\";w =this.oCon") > -1) 
					) {
				System.out.println("WARNING: no match: " + line);
			}
		}

		return null;
	}


	private static Resource getResourceType(String url) {
		if (GITHUB_PAGE_STRING.equals(url)) {
			return Resource.GITHUB_PAGE;
		}
		if (BLOG_PAGE_STRING.equals(url)) {
			return Resource.BLOG_PAGE;
		}
		if (REFERENCES_PAGE_STRING.equals(url)) {
			return Resource.REFERENCES_PAGE;
		}
		if (FEATURES_PAGE_STRING.equals(url)) {
			return Resource.FEATURES_PAGE;
		}
		if (GETSTARTED_PAGE_STRING.equals(url)) {
			return Resource.GETSTARTED_PAGE;
		}
		if (DEMOKIT_PAGE_STRING.equals(url)) {
			return Resource.DEMOKIT_PAGE;
		}
		if (RUNTIME_PATTERN.matcher(url).matches()) {
			return Resource.RUNTIME_DOWNLOAD;
		}
		if (MOBILE_PATTERN.matcher(url).matches()) {
			return Resource.MOBILE_DOWNLOAD;
		}
		if (SDK_PATTERN.matcher(url).matches()) {
			return Resource.SDK_DOWNLOAD;
		}

		return null;
	}

	public static String zeroPad(int length, int number) {
		String numberString = String.valueOf(number);
		int actualLength = numberString.length();
		
		while (actualLength < length) {
			numberString = "0" + numberString;
			actualLength++;
		}
		
		return numberString;
	}

	public boolean isBotLine(UserAgentStringParser parser) {
		
		// filter by user-agent
		String ua = this.getUserAgent();
		if (parser == null) {
			parser = UADetectorServiceFactory.getResourceModuleParser();
		}
		ReadableUserAgent agent = parser.parse(ua);
		
		UserAgentType type = agent.getType();
		if (type.equals(UserAgentType.ROBOT) || containsBotFragment(ua)) {
			//System.out.println("ROBOT:\t" + ua);
			return true;
		} else {
			//System.out.println("normal:\t" + ua);
			return false;
		}
	}
	
	private boolean containsBotFragment(String ua) {
		for (int i = 0; i < USERAGENT_BOT_SUBSTRINGS_ARRAY.length; i++) {
			if (ua.contains(USERAGENT_BOT_SUBSTRINGS_ARRAY[i])) {
				return true;
			}
		}
		return false;
	}

	public String getReferrerIfInteresting() {
		String ref = this.referrer;
		
		if (ref.equals("-")
				|| ref.startsWith("http://openui5.org")
				|| ref.startsWith("http://sap.github.io")
				|| ref.startsWith("http://openui5.tumblr.com")
				|| ref.startsWith("https://sap.github.io")
				|| ref.startsWith("https://github.com/SAP/openui5")
				|| ref.startsWith("http://openui5picks.tumblr.com")
				|| ref.startsWith("http://openui5.hana.ondemand.com")
				|| ref.startsWith("https://openui5.hana.ondemand.com")) {
			return null;
		}
		
		return ref;
	}
}
