let interceptedData = null; // Store intercepted API data

const API_BASE = "https://api.shopview.com/api/work-orders/part/return-requests";

function handleRequest(details) {
  if (details.url.startsWith(API_BASE) && details.method === "GET") {
    console.log("✅ Intercepted API request:", details.url);

    fetch(details.url)
      .then((response) => response.json())
      .then((jsonData) => {
        console.log("✅ JSON Response Data Stored:", jsonData);
        interceptedData = jsonData; // Store data for popup access

        // Stop listening for further requests
        chrome.webRequest.onCompleted.removeListener(handleRequest);
        console.log("🛑 Stopped listening for further requests.");
      })
      .catch((error) => {
        console.error("❌ Error fetching data:", error);
      });
  }
}

// Ensure listener is added
chrome.webRequest.onCompleted.addListener(handleRequest, { urls: ["<all_urls>"] });

// Listen for popup requests to retrieve stored API data
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_API_DATA") {
    console.log("🔄 Popup requested API data.");
    sendResponse({ data: interceptedData });
  }
});
