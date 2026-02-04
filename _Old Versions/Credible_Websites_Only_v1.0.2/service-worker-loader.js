const exceptions = ["kahoot.it", "kiddle.co", "shorturl.at"];
const allowedURLs = ["com", "net", "edu", "gov", "org"];
const blockUrl = chrome.runtime.getURL("/assets/blocked.html");

//listener waits for tab to be updated to execute
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const currentUrl = tab.url;       // non url object for tld determination
  const thisUrl = new URL(tab.url); // url object for protocol determination

  //ensures present tab
  if (currentUrl) {
    console.log("Current URL: ", thisUrl.hostname);
    console.log("Is exception: " + isException(thisUrl));
  //prevents constant refreshing while on block page
     if (currentUrl != blockUrl) {
  //confines domain restriction to http or https, other protocols can be blocked in other ways. Prevents blocking internal pages at chrome://  
      if (thisUrl.protocol == "https:" || thisUrl.protocol == "http:") {

  // if url not allowed redirect current tab to block page
       if (!isException(thisUrl) && !isUrlAllowed(currentUrl)) {chrome.tabs.update(tabId, { url: blockUrl });}
     }
    }
  }

});

//function takes top level domain from url and compares it to the list of those allowed
function isUrlAllowed(url) {
    const tld = extractTopLevelDomain(url);    
    return allowedURLs.includes(tld);
}

function isException(url) {
  const urlPlaceholder = new URL(url);
  return exceptions.includes(urlPlaceholder.hostname.replace(/^www\./, ''));
}

function extractTopLevelDomain(url) {
    try {
  // Create a URL object to parse the input
      const parsedUrl = new URL(url);
      
  // Normalize the hostname (remove www. if present)
      const hostname = parsedUrl.hostname.replace(/^www\./, '');
      
  // Split the hostname into parts
      const parts = hostname.split('.');
      
  // common multi-part TLDs 

      const tldRules = [
        { suffix: '.co.uk' },
        { suffix: '.com.au' },
        { suffix: '.org.uk' },
        { suffix: '.co' },
        { suffix: '.org' },
        { suffix: '.net' },
        { suffix: '.com' },
        { suffix: '.edu' }
      ];
      
      // Check for multi-part TLDs first
      for (const rule of tldRules) {
        if (hostname.endsWith(rule.suffix)) {
          // Return the full suffix
          return rule.suffix.replace(/^\./, '');
        }
      }
      
      // simple TLD extraction
      // Take the last part of the hostname
      return parts[parts.length - 1];
    } catch (error) {
      // Handle invalid URLs
      console.error('Invalid URL:', error);
      return null;
    }
  }
