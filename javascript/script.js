 // Array to store all items
 let inventoryItems = [];
 let serialNumber = 1;
 
 // Load saved data from localStorage on page load
 window.onload = function() {
     const savedItems = localStorage.getItem('inventoryItems');
     if (savedItems) {
         inventoryItems = JSON.parse(savedItems);
         
         // Find the highest serial number to continue from
         if (inventoryItems.length > 0) {
             const maxId = Math.max(...inventoryItems.map(item => item.id));
             serialNumber = maxId + 1;
         }
     }
     
     updateTable();
 };
 
 function addItem() {
     // Get input values
     const modelNumber = document.getElementById('modelNumber').value;
     const quantity = document.getElementById('quantity').value ? parseInt(document.getElementById('quantity').value) : 0;
     const price = document.getElementById('price').value ? parseFloat(document.getElementById('price').value) : 0;
     const date = document.getElementById('date').value || new Date().toISOString().split('T')[0];
     
     // Validate inputs
     if (!modelNumber) {
         showMessage('Please enter a model number', 'error');
         return;
     }
     
     // Calculate total
     const totalPrice = quantity * price;
     
     // Add to inventory array
     inventoryItems.push({
         id: serialNumber,
         modelNumber: modelNumber,
         quantity: quantity,
         price: price,
         totalPrice: totalPrice,
         date: date
     });
     
     // Save to localStorage
     saveToLocalStorage();
     
     // Update table
     updateTable();
     
     // Reset form
     document.getElementById('modelNumber').value = '';
     document.getElementById('quantity').value = '';
     document.getElementById('price').value = '';
     document.getElementById('date').value = '';
     
     // Increment serial number
     serialNumber++;
     
     // Show success message
     showMessage('Item added successfully!', 'success');
 }
 
 function deleteItem(id) {
     // Find the item index
     const index = inventoryItems.findIndex(item => item.id === id);
     
     if (index !== -1) {
         // Remove the item
         inventoryItems.splice(index, 1);
         
         // Save to localStorage
         saveToLocalStorage();
         
         // Update table
         updateTable();
         
         // Show success message
         showMessage('Item deleted successfully!', 'success');
     }
 }
 
 function updateTable() {
     const tableBody = document.getElementById('inventoryBody');
     tableBody.innerHTML = '';
     
     let grandTotal = 0;
     
     // Use index + 1 for sequential S.No display
     inventoryItems.forEach((item, index) => {
         const row = document.createElement('tr');
         
         row.innerHTML = `
             <td>${index + 1}</td>
             <td>${item.modelNumber || '-'}</td>
             <td>${item.quantity || '-'}</td>
             <td>${item.price ? item.price.toFixed(2) : '-'}</td>
             <td>${item.totalPrice.toFixed(2)}</td>
             <td>${item.date}</td>
             <td><button class="delete-btn" onclick="deleteItem(${item.id})">Delete</button></td>
         `;
         
         tableBody.appendChild(row);
         grandTotal += item.totalPrice;
     });
     
     document.getElementById('grandTotal').textContent = grandTotal.toFixed(2);
 }
 
 function saveToLocalStorage() {
     localStorage.setItem('inventoryItems', JSON.stringify(inventoryItems));
 }
 
 function generatePDF() {
     if (inventoryItems.length === 0) {
         showMessage('No items to generate PDF', 'error');
         return;
     }
     
     // Initialize jsPDF
     const { jsPDF } = window.jspdf;
     const doc = new jsPDF();
     
     // Add title
     doc.setFontSize(18);
     doc.text('Inventory Report', 14, 22);
     
     // Add date
     doc.setFontSize(12);
     doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
     
     // Create table data
     const tableColumn = ["S.No", "Model Number", "Quantity", "Price", "Total Price", "Date"];
     const tableRows = [];
     
     // Add data rows with sequential numbering
     let counter = 1;
     inventoryItems.forEach(item => {
         const itemData = [
             counter++,  // Use counter instead of item.id for sequential numbering
             item.modelNumber || '-',
             item.quantity || '-',
             item.price ? item.price.toFixed(2) : '-',
             item.totalPrice.toFixed(2),
             item.date
         ];
         tableRows.push(itemData);
     });
     
     // Calculate grand total
     let grandTotal = 0;
     inventoryItems.forEach(item => {
         grandTotal += item.totalPrice;
     });
     
     // Add grand total row
     tableRows.push([
         "",
         "",
         "",
         "Grand Total:",
         grandTotal.toFixed(2),
         ""
     ]);
     
     // Generate table
     doc.autoTable({
         head: [tableColumn],
         body: tableRows,
         startY: 40,
         styles: {
             fontSize: 10,
             cellPadding: 3,
             lineWidth: 0.5,
             lineColor: [0, 0, 0]
         },
         headStyles: {
             fillColor: [22, 160, 133],
             textColor: [255, 255, 255],
             fontStyle: 'bold'
         },
         alternateRowStyles: {
             fillColor: [242, 242, 242]
         },
         // foot: [["", "", "", "Grand Total:", grandTotal.toFixed(2), ""]],
         // footStyles: {
         //     fillColor: [220, 220, 220],
         //     fontStyle: 'bold'
         // }
     });
     
     // Save PDF
     doc.save('inventory_report.pdf');
     showMessage('PDF generated successfully!', 'success');
 }
 
 function showMessage(message, type) {
     const messageDiv = document.getElementById('message');
     messageDiv.textContent = message;
     messageDiv.className = type;
     
     // Clear message after 3 seconds
     setTimeout(() => {
         messageDiv.textContent = '';
         messageDiv.className = '';
     }, 3000);
 }
 
 // Function to clear all items
 function clearAllItems() {
     inventoryItems = [];
     localStorage.removeItem('inventoryItems');
     updateTable();
     showMessage('All items cleared successfully!', 'success');
 }