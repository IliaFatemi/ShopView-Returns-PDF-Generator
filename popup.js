let apiData = null; // Store API data for PDF generation

// Define the function to display API data in the popup
function displayData(data) {
  const container = document.getElementById("intercepted-requests");
  container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

// Function to generate and preview the PDF
function generatePDF() {
  console.log("🖨️ PDF preview generation started. Checking apiData:", apiData);

  if (!apiData || !apiData.data || !apiData.data.items || apiData.data.items.length === 0) {
    alert("No API data available to generate PDF.");
    console.warn("⚠️ Attempted to generate PDF with no data.");
    return;
  }

  const { jsPDF } = window.jspdf; // Ensure jsPDF is correctly accessed
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  // Title
  pdf.text("Return Report", 14, 20);

  // Table Headers
  const tableColumn = ["Cost", "Part Description", "Invoice Number", "Quantity", "Part Number"];
  const tableRows = [];

  let totalCost = 0;

  // Add data rows & calculate total cost
  apiData.data.items.forEach((item) => {
    const cost = parseFloat(item.cost) || 0; // Ensure cost is a number
    totalCost += cost;
    tableRows.push([
      `$${cost.toFixed(2)}`,  // Format cost with two decimals
      item.part_description,
      item.invoice_number,
      item.quantity,
      item.part_number
    ]);
  });

  // Calculate total cost with 12% tax
  const taxRate = 0.12;
  const totalWithTax = totalCost * (1 + taxRate);

  // Add the final row for total cost
  tableRows.push([
    `Total: $${totalCost.toFixed(2)}`,
    "",
    "",
    "Tax (12%)",
    `$${totalWithTax.toFixed(2)}`
  ]);

  // Draw the table using autoTable
  pdf.autoTable({
    head: [tableColumn], // Column headers
    body: tableRows,     // Data rows
    startY: 30,          // Position the table after the title
    theme: "striped",    // Table theme
    styles: {
      fontSize: 10,
      cellPadding: 3,
      valign: "middle",
      halign: "center",
    },
    headStyles: { fillColor: [44, 62, 80] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });

  // Convert PDF to Blob and show preview in the iframe
  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);
  document.getElementById("pdf-preview").src = pdfUrl;
  console.log("✅ PDF preview auto-generated and displayed.");
}

// Function to download the PDF
function downloadPDF() {
  if (!apiData || !apiData.data || !apiData.data.items || apiData.data.items.length === 0) {
    alert("No API data available to generate PDF.");
    console.warn("⚠️ Attempted to generate PDF with no data.");
    return;
  }

  const { jsPDF } = window.jspdf; // Ensure jsPDF is correctly accessed
  const pdf = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  // Title
  pdf.text("Return Report", 14, 20);

  // Table Headers
  const tableColumn = ["Cost", "Part Description", "Invoice Number", "Quantity", "Part Number"];
  const tableRows = [];

  let totalCost = 0;

  // Add data rows & calculate total cost
  apiData.data.items.forEach((item) => {
    const cost = parseFloat(item.cost) || 0; // Ensure cost is a number
    totalCost += cost;
    tableRows.push([
      `$${cost.toFixed(2)}`,  // Format cost with two decimals
      item.part_description,
      item.invoice_number,
      item.quantity,
      item.part_number
    ]);
  });

  // Calculate total cost with 12% tax
  const taxRate = 0.12;
  const totalWithTax = totalCost * (1 + taxRate);

  // Add the final row for total cost
  tableRows.push([
    `Total: $${totalCost.toFixed(2)}`,
    "",
    "",
    "Tax (12%)",
    `$${totalWithTax.toFixed(2)}`
  ]);

  // Draw the table using autoTable
  pdf.autoTable({
    head: [tableColumn], // Column headers
    body: tableRows,     // Data rows
    startY: 30,          // Position the table after the title
    theme: "striped",    // Table theme
    styles: {
      fontSize: 10,
      cellPadding: 3,
      valign: "middle",
      halign: "center",
    },
    headStyles: { fillColor: [44, 62, 80] },
    alternateRowStyles: { fillColor: [240, 240, 240] },
  });
  pdf.save("API_Report.pdf");
}

// When the popup loads, request API data and auto-generate the PDF preview
document.addEventListener("DOMContentLoaded", () => {
  if (window.jspdf) {
    console.log("✅ jsPDF loaded successfully.");
  } else {
    console.error("❌ jsPDF is not loaded. Check the script path.");
    return;
  }

  // Attach download button event listener
  document.getElementById("download-pdf").addEventListener("click", downloadPDF);

  // Request stored API data from background.js when the popup opens
  chrome.runtime.sendMessage({ type: "GET_API_DATA" }, (response) => {
    console.log("📩 Popup received response:", response);
    if (chrome.runtime.lastError) {
      console.error("❌ Error requesting API data:", chrome.runtime.lastError);
    } else if (response && response.data) {
      apiData = response.data;
      console.log("✅ Stored API Data in popup.js:", apiData);
      generatePDF(); // Auto-generate the PDF preview upon receiving data
    } else {
      document.getElementById("intercepted-requests").innerHTML = "No data available.";
      console.warn("⚠️ No API data received.");
    }
  });
});