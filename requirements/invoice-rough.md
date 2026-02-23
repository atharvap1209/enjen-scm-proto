Invoice Creation

Invoice Creation Step 1:
- User gets two options,
	- Create Invoice from Sales Order
	- Create Invoice Manually
![[Pasted image 20260222001542.png]]

  Fields captured are:
  1. Order No [Dropdown in case of From PO and Manual Entry in case of Manual way]
  2. Due Date
  3. Order Date
  4. PO No.
  5. Payment Terms
  6. E-way Bill Number
  7. Billing Address
  8. Shipping Address

Note: there should be "Same as Billing address checkbox" in Shipping Address section

Invoice Creation Step 2: From which Coils I need to ship

What happens when I select a Coil? What are the primary details i would like to see?
- Coil Number
- Weight
- Thickness
- Width
- Grade
- Surface
- Coating

Invoice Creation Step 3 - What to sell?
- User sees the parts made from the Coil and Leftover Coil Weight

Every Coil has a Seperate section, In this section, user sees the parts made from the Coil and Leftover Coil Weight

| Checkbox [Select All] | Part Name     | Item Type [From WO] | Width  | Length [In case of a sheet] | Number of Pieces | Weight |
| --------------------- | ------------- | ------------------- | ------ | --------------------------- | ---------------- | ------ |
| Checkbox              | Part A        | GI SHEET            | 1200mm | 1.2m                        | 50               | 40MT   |
| Checkbox              | Part B        | GP COIL             | 300mm  | N/A                         | 1                | 20MT   |
| Checkbox              | Leftover Coil | N/A                 | 1200mm | N/A                         | N/A              | 20MT   |

When Checkbox is Checked - user should be give a choice to enter a Per piece price of price Per MT. 

Case 1: User enters per piece price:
- Number of pieces should be input
- Unit Price should be per piece, again an input
- Weight and Total price is auto-calculated

Case 2: User selects price per MT
- Number of pieces are auto calculated
- Weight and Unit Price per MT is an Input
- Total price is auto-calculated
- In case of a sheet output - number of pieces are also calculated (User can choose between Floor or Ceiling if result is fractional).

Leftover Coil Logic
- user can choose to sell the leftover coil also, from the Coil user can also choose to sell specific quantity [in MT] out of it.
- Let's say user clicks on Leftover Coil, User enters Weight to be Invoiced as an Input, Price per MT, and Total price is auto-calculated.

Invoice Creation Step 4: Charges and Tax
- Unaffected

Invoice Creation Step 5: Payment Terms
- Unaffected

Invoice Creation Step 6: Review and Submit
- Material Selection should be very clearly depicted, along with Weight being dispatched, Price per unit and total price.

Lifecycle Transitions for Invoice:
- Draft -> Issued -> Paid


Invoice Details:
- Invoice Number
- Invoice Date
- Customer Name
- Due Date
- PO Number
- Payment Terms
- E-way Bill Number
- Billing Address
- Shipping Address
- Material Selection
    - Weight
    - Price per unit
    - Total price
- Payment Terms
- Charges and Tax and total calculations.


CTAs:
- Mark as Paid
- View Full invoice [Goes to PDF Generated Invoice]


