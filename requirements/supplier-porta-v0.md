
Supplier Portal Lightweight v0

Supplier user sees RFQ listing - all RFQs where supplier is mentioned should be listed.
- Design same as listing screens for Enjen - search box, columns selector, No Primary CTA.
	- RFQ Number
	- Issue Date
	- Due Date
	- Special Instructions
	- Approx Value
	- Status
	- Payment Terms
- When a Particular RFQ is clicked - RFQ Details are shown - same as Current RFQ Details Page Implementation
- Bottom Right CTA: Submit Quote
- Clicking on Submit Quote opens another side-panel for Quote submission Fields
	- Primary RFQ details - RFQ No, Created On, Due Date,Approx Value, Special Instructions,Status
	- Line Item Details - Line Item details should have checkboxes in first column - user should be able to enter information per line item:
		- Item Price
		- Lead Time Days
		- Price Validity Date
		- Delivery Date
		- Discount %
		- Notes
	- Line Items should have following information populated:
		- Item Code
		- Description
		- Quantity
		- UoM
		- Attachments [View and Download Attachments should also work]
	- Other Quote Submission Details to be entered:
		- Shipping Cost
		- Tax Selection
		- Terms and Conditions
	- Waterfall structure for subtotal,shipping cost, taxes, discounts, grand total.
	- CTA: Submit Quote to Customer
- When quote is  submitted to customer,customer on Enjen AI will see the submitted Quote in View Quotes button in RFQ, no selection is allowed here.
- View Quotes is a listing screen:

| Supplier | Total Quote value | Late Delivery Charges | Payment Terms |
| -------- | ----------------- | --------------------- | ------------- |
|          |                   | {From RFQ}            | {From RFQ}    |
- When any line item is clicked, it opens an accordian which shows Quote Details:
	- ![[Pasted image 20260223101520.png]]
	- This grid should have:
		- Item Code
		- Quantity
		- UoM
		- Item Price
		- Lead Time Days
		- Price Validity Date
		- Delivery Date
		- Discount %
	- Then below:
		- Subtotal
		- Shipping Charges
		- Tax
		- Discount
		- Grand Total



