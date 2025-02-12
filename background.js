// Store intercepted API response data
let interceptedData = null;

// Define the API base URL to listen for
const API_BASE = "https://api.shopview.com/api/work-orders/part/return-requests";

/**
 * Function to handle API requests and extract data.
 * This function listens for completed network requests and checks if they match the target API.
 */
function handleRequest(details) {
  if (details.url.startsWith(API_BASE) && details.method === "GET") {
    console.log("✅ Intercepted API request:", details.url);

    // Fetch the intercepted API request's response
    fetch(details.url)
      .then((response) => response.json()) // Convert response to JSON
      .then((jsonData) => {
        console.log("✅ JSON Response Data Stored:", jsonData);

        // Store the API response for the popup to access
        interceptedData = jsonData;
      })
      .catch((error) => {
        console.error("❌ Error fetching data:", error);
      });
  }
}

/**
 * Register the network request listener to always listen for API calls.
 * This ensures we capture API calls across all pages.
 */
chrome.webRequest.onCompleted.addListener(handleRequest, { urls: ["<all_urls>"] });

/**
 * Detects when a user navigates to a new page or refreshes a tab.
 * When a navigation event happens, it resets the API listener to ensure continuous monitoring.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    console.log("🔄 Page loaded, resetting listener.");

    // Remove the existing listener to prevent duplicates
    chrome.webRequest.onCompleted.removeListener(handleRequest);

    // Re-register the listener so it works on the new page
    chrome.webRequest.onCompleted.addListener(handleRequest, { urls: ["<all_urls>"] });
  }
});

/**
 * Listens for messages from the popup script.
 * When the popup requests API data, this sends the stored data.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_API_DATA") {
    console.log("📩 Popup requested API data.");

    // Send the stored API response data to the popup
    sendResponse({ data: interceptedData });
  }
});
