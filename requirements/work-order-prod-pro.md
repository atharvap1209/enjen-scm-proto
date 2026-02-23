
4 Steps
1. Finished Good Specification and Operations
2. Coil Selection and Overall Wastage
3. Operation-wise Output Planning
4. Line and Machine
5. Review

User Journey
- Production Manager wants to create work order for a customer. 
- Although the connection does not exist yet - let us assume that the sales order has been created.
- Production manager starts by specifying the finished good specifications. Assignes WO Due Date, and customers for which the work order is for, quantity of this WO.
- Next, he selects which coils he wants to process for this WO. 


WO Create - Section 1
3 sections, in order - 
1. {Section Name}: Fields required are Work Order Due Date and Customers
2. Finished Good Specifications: Category, Grade, Thickness range, Width range, Coating, Surface Finish, Item type and Quantity Demanded
3. Operations: Slitting or Cutting or Slitting then Cutting, no other option should be allowed.

Coil Selection and Overall Wastage
- All Coils should be listed which match the specifications defined in first step. we need to show the following columns:
	- Coil No, Category, Grade, Thickness, Width, Surface, Current Weight, Aging
- Leftover Coil Summary:
	- Leftover Coil Quantity after Performing all operations and outputs [If multiple Coils are selected, ]
	- Quantity Demanded
	- Leftover Coil %

Output Creation
For WO with Operation Sequence: Cutting
- This is the process of cutting a big circular coil into Sheets of same width as of Coil.
- Length of the Coil is very important here. 
	- There are two ways to find out the length of the coil. One is when user enters it [its optional] when he adds item to a transit
	- Calculate the length of Coil using appropriate formula using Coil Density and Thickness and Weight.
- Let's say that user wants to create sheets of 1200mm width and 1meter length and some sheets of 1200mm width and 2 meter length. 
- We need to calculate the scrap here, and leftover quantity. Scrap and Leftover Quantity are two different things. There cannot be any scrap technically in this case.
- For Cutting Output Planning - Only inputs required are Part Name, Target Length and Number of Pieces. Weight of Part and Leftover % of that particular Coil is calculated.
	- Total length cannot exceed the Coil Length
- Overall Leftover Coil Percentage, Total Pieces and Total Length Required is maintained below - updates on every Output Addition.

For WO with Operation Sequence: Slitting
- This is the process of cutting a big circular coil into slit parts of different width.
- Width of the Coil is most Important here.
	- User cannot create outputs which exceed the total Width of the Coil.
	- Total Width of all outputs === total coil width.
- Let's say that user wants to create 3 slits out of a 1200 mm Width Coil - two slits of 300mm each and one slit of 400mm
- For Slitting output planning - Only outputs needed are Part name, target width, Number of coils. Weight of Part and Leftover % of that particular Coil is calculated.
- Calculate the Leftover Width here == 200mm. Leftover Coil %, Total Width, Total Pieces.

For WO with Operation Sequence: Slitting + Cutting
- This is the process of creating cut sheets of different widths than the coil's original width.
- Width and Length both are critical for the coil.
- What kind of output user is expecting - a Sheet with a width and length and number of pieces required. Total Weight and Coil Leftover % is calculated. But apart from that - for each step - outputs are also created automatically. Let us take an example. For a Coil of Width 1200mm and some 100meter length, user wants to create a sheet of width 200mm and 1 meter, 100 such. and for 300mm and 1 meter, i want 300 such. 
	- What kinds of slitting outputs are getting created here?
		- Part A: One part, 200m
		- Part B: 3 parts, 300m
	- What kinds of cutting outputs are getting created here?
		- From Part A - 1meter 100 pieces
		- From Part B - 1meter 300 pieces
	- The Point of example is that when user creates an output in slitting - cutting process, he enters the width, length and number of pieces, weight and leftover % is auto calculated, and slitting and cutting outputs are also created
- While taking an input for the planned output - make sure that we take selected coils dropdown also as an input.
Example

Slitting

| Part Name | Coil Number | Width | Number of Slit Coils | Weight | Leftover % |
| --------- | ----------- | ----- | -------------------- | ------ | ---------- |
| Part A    |             | 200   | 1                    |        |            |
| Part B    |             | 300   | 3                    |        |            |
Cutting

| From Slit | Coil Number | Part Name  | Width | Length | Number of Pieces | Weight | Leftover % |
| --------- | ----------- | ---------- | ----- | ------ | ---------------- | ------ | ---------- |
| Part A    |             | user fills | 200mm | 1m     | 100              |        |            |
| Part B    |             | user fills | 300mm | 1m     | 300              |        |            |
`<llm_instruction> we need to derive a quick formula /  quick dev note on how to handle the output creation on the basis of the outputs added by the user. </llm_instruction>`

Note: Why did we add Coil Number - because multiple Coils can be selected and multiple Coils will have different kinds of outputs. 

- Leftover Coil %, Total Pieces, Total width, and Total Length should be updated after each output creation. 

Select Line and Machine - Simple
- Line and Machine both have dropdowns.
- Every Operations - Line and Machine added separately.

Review Section:
All Details:
- Header - Customer, Due Date
- Finished Good Specifications
- Operatrion Sequence
- Selected Coil and Leftover Coil %
- Outputs: One Table for every operation
- Line and Machine Specification
- Audit Trail


User can Save as Draft, Submit, Go to Previous Screen.

What happens when Work Order is submitted?
- Success State - Two CTAs:
	- Primary: Release WO
	- Secondary: View WO List

Release WO - Starts first stage of Work Order.

View Work Order Details:
- Header - Customer, Due Date
- Finished Good Specifications
- Operatrion Sequence
- Selected Coil and Leftover Coil %
- Outputs: One Table for every operation
- Line and Machine Specification
- Audit Trail

CTAs:
- Release Work Order [Primary]
- Discard [Secondary]

When Release is clicked:
- WO stage 1 starts
-  Status of WO moves to In Progress

View WO Details for Pending State:
- Release Work Order
- [Secondary Bottom  in Red Stroke] Discard

View WO Details for In Progress state:
CTAs:
- Hold / Resume [Primary]


When clicked on Hold - Status of WO changes to On Hold, Status of Stage which is In Progress becomes on hold

When clicked on Resume - Status of WO changes to In Progress, Status of Stage which is on hold becomes "In Progress"

When clicked on Abort - Another side panel opens where Reason to Abort WO is asked. If Abort is clicked, WO is aborted, All the stages associated are aborted.
WO Lifecycle Transitions:
- Draft - Allowed CTAs - Save as Draft / Submit
- Pending - Allowed CTAs - Discard / Release WO
- In Progress - Allowed CTAs - Hold / Resume
- On Hold - Resume
- Completed - N/A
- Discarded - N/A

Note: If WO is discarded before starting production and after submitting - the production process tasks created should be deleted.

WO Listing:
- WO number
- status
- priority
- customer name [comma separated]
- Coil Utilization %
- Leftover %
- Start Date
- Due Date

Production Process
What is this module for?
- To track multiple stages of a Work Order.

Important: Each Stage has a QC - which can be enabled / disabled from Settings

How does stage status update? How does a new stage / task get added to Production Process Module?

- When WO is created, Production Process task for each operation is created.
- Every task has the following attributes [Columns in Listing]
	- WO Number
	- Stage Name
	- Operation Type
	- Customer Name
	- Machine
	- Line
	- Status [Not started, In Progress, On Hold, Completed]
	- Priority

A stage can be put on Hold / Resumed using Hold / Resume Button.
User cannot abort / discard the stage.

Complete Stage:

Only two CTAs everytime on the screen:

When Stage [Not started] == Start Stage [Only if previous stage is complete, otherwise not]
When stage [In Progress] == Hold and Complete
When Stage [Completed] == N/A
When Stage [On Hold] == Resume

Hold / Resume --  Standard Function
- When Clicked on Hold - Stage Status == On Hold
- When Clicked on Resume - Stage status ==  In Progress

Complete Stage:
Clean Summary 
Editable Actuals 
Auto Calculated Variance 
Clear Inventory Movement Preview

Clean Summary:
- WO Number
- Operation Type
- Customer Name

Editable Actuals:
Planned Outputs [Variance is calculated at line level]

Case 1: Cutting Only
Planned Outputs

| Part Name | Coil Number | Length | Number of Pieces | Weight | Leftover % | Actual No of Pieces | Actual Weight | Actual Leftover % | Variance % |
| --------- | ----------- | ------ | ---------------- | ------ | ---------- | ------------------- | ------------- | ----------------- | ---------- |
| Part C    | COIL-123    | 1m     | 100              | 30MT   | 20%        | user fills          | user fills    | auto-calc         | auto-calc  |
| Part D    | COIL-345    | 1.5m   | 300              | 50MT   | 35%        | user fills          | user fills    | auto-calc         | auto-calc  |
Case 2: Slitting Only
Planned Outputs

| Part Name | Coil Number | Width | Number of Slit Coils | Weight | Leftover % | Actual Weight | Actual Leftover % | Variance  |
| --------- | ----------- | ----- | -------------------- | ------ | ---------- | ------------- | ----------------- | --------- |
| Part A    | COIL-123    | 200mm | 1                    | 20MT   | 20         | user fills    | auto-calc         | auto-calc |
| Part B    | COIL-345    | 300mm | 3                    | 60MT   | 10         | user fills    | auto-calc         | auto-calc |

Case 3: Slitting - Cutting
Planned Outputs
Slitting Output


| Part Name | Coil Number | Width | Number of Slit Coils | Weight | Leftover % | Actual Weight | Actual Leftover % | Variance% |
| --------- | ----------- | ----- | -------------------- | ------ | ---------- | ------------- | ----------------- | --------- |
| Part A    | COIL-123    | 200mm | 1                    | 20MT   | 20         | user fills    | auto-calc         | auto-calc |
| Part B    | COIL-345    | 300mm | 3                    | 60MT   | 10         | user fills    | auto-calc         | auto-calc |

Cutting Output

| Part Name | From Slit | Coil Number | Width | Length | Number of Pieces | Weight | Leftover % | Actual Number of Pieces | Actual Weight | Leftover% | Variance% |
| --------- | --------- | ----------- | ----- | ------ | ---------------- | ------ | ---------- | ----------------------- | ------------- | --------- | --------- |
| Part C    | Part A    |             | 200mm | 1m     | 100              |        |            | user fills              | user fills    | auto-calc | auto-calc |
| Part D    | Part B    |             | 300mm | 1m     | 300              |        |            | user fills              | user fills    | auto-calc | auto-calc |

Special Note: In each section / above table, there should be an option to mark actual == original
If actual != original - original should be replaced by Actual.

Coil Status

| Coil Number | Original Weight | Utilized Weight | Balance Weight |
| ----------- | --------------- | --------------- | -------------- |
| COIL-123    |                 |                 |                |
| COIL-345    |                 |                 |                |


What happens when user clicks on "Complete Stage":
- Stage status gets converted to Completed
- Success State is shown:
	- Primary CTA: Go to Next Stage - Opens next stage side panel with start stage button
	- Secondary CTA: Go to Work Order
- When its last step of the WO success state should be:
	- Primary CTA: Create Work Order
	- Secondary CTA: Go to Production Process Listing

