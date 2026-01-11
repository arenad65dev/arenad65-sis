# PRD: Arena D65

**Status:** Production
**Data:** 10/01/2026

## 1. Descrição Geral
Plataforma para controle financeiro e de bar de uma Arena de Beach Tenis (incluindo Futebol e Tenis), o qual tem um sistema de reserva de horário, portanto não precisamos disso
 

## 3. Estrutura de Épicos & Stories

### E1: User Management
System for managing different types of users including staff, managers, and customers with appropriate roles and permissions

#### 1.1 Staff Registration
**Critérios de Aceitação:**
Given I am a manager
When I register a staff member with role and department
Then the staff should have assigned permissions based on role

#### 1.2 User Search
**Critérios de Aceitação:**
Given I have appropriate permissions
When I search users by name/email/role
Then I should see filtered results with pagination

#### 1.3 Customer Registration
**Critérios de Aceitação:**
Given I am a new user
When I provide valid email, password, and personal details
Then I should be registered as a customer with default permissions

#### 1.4 User Login
**Critérios de Aceitação:**
Given I am a registered user
When I enter valid credentials
Then I should be authenticated and redirected to dashboard with role-specific features

#### 1.5 Role Assignment
**Critérios de Aceitação:**
Given I am a manager
When I assign a new role to a staff member
Then the user's permissions should update immediately

#### 1.6 Admin User Deletion
**Critérios de Aceitação:**
Given I am a system admin
When I permanently delete a user
Then all associated data is anonymized and removed

#### 1.7 User Profile Management
**Critérios de Aceitação:**
Given I am a user
When I update my profile information
Then changes should persist immediately

#### 1.8 User Deactivation
**Critérios de Aceitação:**
Given I am a manager
When I deactivate a user account
Then the user should lose access but data is preserved

#### 1.9 Permission Management
**Critérios de Aceitação:**
Given I am a system admin
When I create/edit roles with granular permissions
Then these permissions should be enforced across the system

#### 1.10 Password Change
**Critérios de Aceitação:**
Given I am logged in
When I submit current password and new valid password
Then my password should be updated and I remain logged in

#### 1.11 Password Reset
**Critérios de Aceitação:**
Given I am a registered user
When I request password reset and verify email
Then I should receive a secure reset link valid for 1 hour

#### 1.12 User Reactivation
**Critérios de Aceitação:**
Given I am a manager
When I reactivate a deactivated user
Then the user regains original permissions

#### 1.13 Manager Registration
**Critérios de Aceitação:**
Given I am a system admin
When I register a manager with admin-level permissions
Then the manager can access staff management functions

### E2: Financial Management
Module for tracking income, expenses, generating financial reports, and managing overall financial operations

#### 2.1 Record Income Transactions
**Critérios de Aceitação:**
Given I am on the financial dashboard
When I click 'Add Income'
Then I should see a form with fields for amount, date, source category, description, and payment method
When I submit valid data
Then the transaction should be saved to the income ledger
And I should see a confirmation message

#### 2.2 Set up income/expense categories
**Critérios de Aceitação:**
Given I am on the category management page
When I add a new category
Then it should appear in the category dropdown
When I delete a category
Then it should be removed from active categories
And existing transactions using it should be migrated to 'Other'

#### 2.3 Manage Vendor Invoices
**Critérios de Aceitação:**
Given I have pending vendor invoices
When I upload an invoice PDF
Then the system should extract key data (vendor, amount, due date)
When I approve an invoice
Then it should be converted to an expense transaction
When I schedule payment
Then I should see reminders before due dates

#### 2.4 Generate Monthly Financial Reports
**Critérios de Aceitação:**
Given I am on the reports page
When I select 'Monthly Report' and choose a date range
Then I should see a summary showing total income, total expenses, and net profit
And I should see pie charts for income/expense breakdowns
And I should see a line chart comparing monthly trends
And I should be able to export the report as PDF/CSV

#### 2.5 Manage financial users
**Critérios de Aceitação:**
Given I am an admin
When I add/edit/delete finance users
Then users should have appropriate permissions (view/record/edit)
And audit logs should track all permission changes

#### 2.6 Analyze Profit Margins by Service
**Critérios de Aceitação:**
Given I am on the profitability analysis page
When I select a service (e.g., court rental, bar sales)
Then I should see income, direct costs, and profit margin
When I compare time periods
Then I should see margin trend charts
When I filter by date range
Then I should see detailed breakdowns

#### 2.7 Track Payment Methods
**Critérios de Aceitação:**
Given I process payments
When I add a new payment method
Then I should record type (cash, card, bank transfer) and account details
When I record a transaction
Then I should select the payment method
When I reconcile
Then I should verify payments against bank records

#### 2.8 Delete transaction
**Critérios de Aceitação:**
Given I am viewing a transaction
When I click 'Delete'
And confirm the action
Then the transaction should be removed from the system
And financial reports should be recalculated

#### 2.9 Manage Budgets by Category
**Critérios de Aceitação:**
Given I am on the budget management page
When I create a new budget
Then I should set category, amount, and period
When expenses exceed 80% of budget
Then I should receive an email notification
When I view budget status
Then I should see progress bars for each category with actual vs. budgeted amounts

#### 2.10 Generate Tax Summary Report
**Critérios de Aceitação:**
Given tax period is approaching
When I select 'Tax Report' and date range
Then I should see categorized income/expense totals
And I should see deductible/non-dedicated expense flags
And I should see sales tax liability summary
And I should be able to export data for accountant

#### 2.11 Reconcile Bank Statements
**Critérios de Aceitação:**
Given I am on the reconciliation page
When I upload a bank statement CSV
Then the system should auto-match transactions by amount and date
When I select unmatched transactions
Then I should manually match them to ledger entries
When all transactions are matched
Then I should see a reconciliation summary report

#### 2.12 Set budget limits
**Critérios de Aceitação:**
Given I am on the budget settings page
When I set monthly budgets for expense categories
Then during report generation I should see budget vs actual comparisons
And I should receive alerts when approaching/exceeding limits

#### 2.13 Export financial data
**Critérios de Aceitação:**
Given I have generated a report
When I click 'Export'
Then I should be able to download the data as CSV or PDF
And the file should include all report data with proper formatting

#### 2.14 Reconcile bank statements
**Critérios de Aceitação:**
Given I have a bank statement
When I upload the statement file
Then I should be able to match statement entries with recorded transactions
And mark transactions as 'reconciled'
And show unreconciled discrepancies

#### 2.15 View transaction history
**Critérios de Aceitação:**
Given I am on the transaction history page
When I apply filters (date range, type, category)
Then I should see a paginated list of relevant transactions
Each transaction should show: date, description, amount, category/source, and type

#### 2.16 Record Expense Transactions
**Critérios de Aceitação:**
Given I am managing expenses
When I click 'Add Expense'
Then I should see a form with fields for amount, date, category, vendor, description, and payment method
When I submit valid data
Then the transaction should be saved to the expense ledger
And the remaining budget for the category should be updated

#### 2.17 Record income transaction
**Critérios de Aceitação:**
Given I am on the income recording page
When I enter transaction details (amount, source, date, description)
And I submit the form
Then the income should be added to the financial records
And I should see a confirmation message

#### 2.18 View financial dashboard
**Critérios de Aceitação:**
Given I am on the dashboard
When I load the page
Then I should see key metrics:
- Current month's profit/loss
- Recent transactions
- Top expense categories
- Income vs expense trend chart

#### 2.19 Edit transaction
**Critérios de Aceitação:**
Given I am viewing a transaction
When I click 'Edit'
And I modify transaction details
And I save the changes
Then the transaction should be updated in the system
And all dependent reports should reflect the change

#### 2.20 Generate monthly financial report
**Critérios de Aceitação:**
Given I am on the reports dashboard
When I select a month and year
And I click 'Generate Report'
Then I should see a summary showing:
- Total income
- Total expenses
- Net profit/loss
- Income by source
- Expenses by category

#### 2.21 Track Financial Metrics Dashboard
**Critérios de Aceitação:**
Given I am on the financial dashboard
Then I should see KPIs: current month profit/loss, YTD revenue, expense trends
And I should see recent transactions with filtering options
When I hover over charts
Then I should see detailed tooltips with data points
When I click any KPI
Then I should drill down to detailed reports

#### 2.22 Record expense transaction
**Critérios de Aceitação:**
Given I am on the expense recording page
When I enter transaction details (amount, category, date, description)
And I submit the form
Then the expense should be added to the financial records
And I should see a confirmation message

### E3: Bar Management
System for managing bar operations including menu creation, pricing, and sales tracking

#### 3.1 Update existing menu item
**Critérios de Aceitação:**
Given I am an administrator
When I edit an existing menu item
Then I should be able to modify any field except historical sales data
And changes should reflect immediately in active menu

#### 3.2 Create new menu item
**Critérios de Aceitação:**
Given I am an administrator
When I create a new menu item
Then I should be able to set name, description, category, base price, and image
And the item should appear in the active menu

#### 3.3 Record a sale transaction
**Critérios de Aceitação:**
Given I am a bar attendant
When I process a sale
Then I should be able to add/remove items, apply discounts, and select payment method
And the system should update inventory in real-time

#### 3.4 Process refunds
**Critérios de Aceitação:**
Given I am an administrator
When I process a refund
Then I should be able to select a completed sale and refund items
And the system should update inventory and revenue tracking

#### 3.5 Generate sales reports
**Critérios de Aceitação:**
Given I am an administrator
When I request a sales report
Then I should be able to filter by date range, payment method, or category
And export results as PDF/CSV with raw data and visualizations

#### 3.6 View sales dashboard
**Critérios de Aceitação:**
Given I am an administrator
When I access the sales dashboard
Then I should see real-time metrics: total revenue, top-selling items, and hourly sales trends
And data should refresh automatically

#### 3.7 Track inventory levels
**Critérios de Aceitação:**
Given I am an administrator
When I view inventory
Then I should see current stock levels with low-stock alerts
And receive notifications when items fall below threshold

#### 3.8 Manage menu availability
**Critérios de Aceitação:**
Given I am an administrator
When I configure menu availability
Then I should be able to set hour/day-specific availability
And unavailable items should be hidden from POS interface

#### 3.9 Apply dynamic discounts
**Critérios de Aceitação:**
Given I am an administrator
When I create a discount rule
Then I should be able to set conditions (time-based, quantity-based) and actions (percentage/amount)
And discounts should auto-apply during checkout

#### 3.10 Set base pricing
**Critérios de Aceitação:**
Given I am an administrator
When I set a base price for a menu item
Then the system should store price history
And apply tax settings automatically based on item category

#### 3.11 Manage menu categories
**Critérios de Aceitação:**
Given I am an administrator
When I access the category management section
Then I should be able to create, edit, and delete categories
And categories should be sortable and filterable

### E4: Sports Facilities Management
Module for managing courts/fields, equipment maintenance, and facility usage tracking (excluding reservation system)

#### 4.1 Log Facility Usage
**Critérios de Aceitação:**
Given I am an administrator
When I select a facility
And I log usage (start/end time, user, activity type)
And I submit the log
Then usage records should be created
And usage statistics should be updated
And the facility should show as occupied during logged time

#### 4.2 Track Facility Status
**Critérios de Aceitação:**
Given I am an administrator
When I change a facility's status (active/maintenance/inactive)
And I add a status note
Then the facility status should be updated
And the status change should be visible in the dashboard
And equipment maintenance records should reflect associated facilities

#### 4.3 Record Equipment Maintenance
**Critérios de Aceitação:**
Given I am an administrator
When I select a piece of equipment
And I log a maintenance event (date, type, cost, technician)
And I update equipment condition
Then the maintenance history should be recorded
And the equipment status should be updated
And maintenance costs should be tracked in financial reports

#### 4.4 Schedule Equipment Maintenance
**Critérios de Aceitação:**
Given I am an administrator
When I select equipment due for maintenance
And I schedule future maintenance (date, type, duration)
And I assign a technician
Then a maintenance task should be created
And the equipment should be marked as 'scheduled'
And the facility should show reduced availability during maintenance windows

#### 4.5 Update Court/Field Information
**Critérios de Aceitação:**
Given I am an administrator
When I select an existing court/field
And I modify its details (e.g., capacity, location)
And I save the changes
Then the facility information should be updated
And all historical usage records should retain the old details

#### 4.6 Generate Usage Reports
**Critérios de Aceitação:**
Given I am an administrator
When I access the usage reports section
And I select a facility and date range
And I generate the report
Then I should see usage analytics (total hours, peak times, activity distribution)
And the report should be downloadable as PDF/CSV

#### 4.7 Manage Court/Field Creation
**Critérios de Aceitação:**
Given I am an administrator
When I navigate to the facilities management section
And I click 'Add New Facility'
And I enter facility details (name, type, location, capacity)
And I submit the form
Then a new court/field should be created in the system
And it should appear in the facilities list

#### 4.8 Monitor Equipment Inventory
**Critérios de Aceitação:**
Given I am an administrator
When I view the equipment inventory
And I filter by facility or status
Then I should see all equipment details
And low-stock equipment should be highlighted
And expiration dates should be visible for consumables

#### 4.9 Assign Equipment to Facilities
**Critérios de Aceitação:**
Given I am an administrator
When I navigate to equipment management
And I select a facility
And I assign new equipment (type, quantity, condition)
And save the assignment
Then the equipment should be linked to the facility
And the equipment inventory should reflect the new assignment

### E5: Inventory Management
System for tracking bar supplies, inventory levels, reordering, and cost management

#### 5.1 Manage inventory categories
**Critérios de Aceitação:**
Given I am on the settings page
When I add/edit/remove inventory categories
Then the changes should reflect in item dropdowns
And existing items should retain their categories

#### 5.2 Receive purchase order items
**Critérios de Aceitação:**
Given I have a purchase order marked 'Pending'
When I input received quantities
And click 'Confirm Receipt'
Then inventory quantities should increase
And the order status should change to 'Received'

#### 5.3 Generate purchase orders
**Critérios de Aceitação:**
Given I have low-stock alerts
When I select items for reordering
And I specify supplier and delivery date
And I confirm the order
Then a purchase order should be created
And inventory should be marked as 'On Order'

#### 5.4 Add new inventory item
**Critérios de Aceitação:**
Given I am on the inventory management dashboard
When I click 'Add New Item'
And I fill in item details (name, category, unit of measure, initial quantity, cost per unit)
And I click 'Save'
Then the item should appear in the inventory list
And the initial quantity should be reflected in total stock

#### 5.5 View inventory dashboard
**Critérios de Aceitação:**
Given I am on the inventory dashboard
When I load the page
Then I should see summary metrics
Total items
Low-stock alerts
Inventory value
And recent adjustments

#### 5.6 Link inventory to bar sales
**Critérios de Aceitação:**
Given a bar sale is completed
And the sale includes inventory items
Then the inventory quantities should decrease by sold amounts
And COGS should be updated for financial reporting

#### 5.7 Track inventory costs
**Critérios de Aceitação:**
Given I am viewing inventory details
When I check cost information
Then I should see current unit cost
And total inventory value (quantity × unit cost)
And historical cost changes

#### 5.8 Track inventory expiration
**Critérios de Aceitação:**
Given I am adding perishable items
When I set expiration dates
Then low-stock alerts should consider expiration
And expired items should be flagged in reports

#### 5.9 Export inventory reports
**Critérios de Aceitação:**
Given I am on the inventory reports page
When I select date range and report type (e.g., stock levels, cost analysis)
And I click 'Export'
Then a downloadable CSV/PDF should be generated
Containing all requested data

#### 5.10 Delete inventory item
**Critérios de Aceitação:**
Given I am viewing an inventory item
When I click 'Delete'
And I confirm deletion
Then the item should be archived (not permanently deleted)
And associated purchase orders should be preserved

#### 5.11 Adjust stock levels
**Critérios de Aceitação:**
Given I am viewing an inventory item
When I select 'Adjust Stock'
And I input a quantity change with reason (e.g., 'delivery', 'spillage')
And I confirm the adjustment
Then the stock quantity should update
And the adjustment should be logged in the history with timestamp and reason

#### 5.12 Set reorder thresholds
**Critérios de Aceitação:**
Given I am editing an inventory item
When I set a reorder point and reorder quantity
And I save the settings
Then the system should trigger reorder alerts when stock falls below the reorder point

### E6: Reporting & Analytics (Business Intelligence)
Central intelligence hub for Arena D65, providing actionable insights through advanced filtering, financial statements (DRE), and cohort analysis.

#### 6.1 Advanced Filtering System (The "Brain")
**Critérios de Aceitação:**
Given I am on the BI Dashboard
When I access the filter panel
Then I should be able to select custom date periods (e.g., "Current Month vs Previous Month", "Summer 2025 vs Summer 2026")
And I should be able to filter by "Cost Center" (Bar, Court, Store) to isolate revenue streams.

#### 6.2 Simplified DRE (Demonstrativo de Resultados)
**Critérios de Aceitação:**
Given I have selected a period
Then I should see a clear Profit & Loss table structure:
1. (+) Gross Revenue (Receita Bruta)
2. (-) Taxes/Fees (Impostos e Taxas)
3. (-) Costs (CMV, Maintenance)
4. (=) Net Profit (Lucro Líquido - "What's left in the pocket")
And this table should update instantly based on active filters.

#### 6.3 Period Comparison Charts
**Critérios de Aceitação:**
Given I am comparing two periods
Then I should see a dual-line chart visualizing the performance difference
And visual indicators should highlight growth or stagnation percentages.

#### 6.4 Payment Method Analysis
**Critérios de Aceitação:**
Given I am analyzing cash flow
Then I should see a breakdown (Pie/Bar Chart) of Money vs Pix vs Card
And this data should help optimize bank fees.

#### 6.5 Cohort Analysis (Retention)
**Critérios de Aceitação:**
Given I want to measure loyalty (CRM effectiveness)
Then I should see a Cohort Table showing athlete retention rates over time
And identify recurring customers vs one-time visitors.

#### 6.6 Export & Audit
**Critérios de Aceitação:**
Given I need to share results or audit transactions
Then I should have "Export to PDF/CSV" buttons for all reports
And access a detailed "Transaction Log" (Who registered, When, Method) for auditing purposes.

#### Technical Implementation Notes (Backend)
To ensure performance with high data volume, do not use simple queries. Implement **PostgreSQL Views** or Materialized Views:
- **`view_financial_dre`**: Aggregates revenue, costs, and taxes by day/month and cost center.
- **`view_sales_cohort`**: Pre-calculates first-visit vs returning-visit data.
- **`view_payment_stats`**: Aggregates payment method totals.
Use database-level aggregations (`GROUP BY`, `SUM`, `AVG`) to feed the frontend dashboards instant data.

### E7: Payment Processing
Integration with various payment methods including cash, cards, mobile payments, and prepaid accounts

#### 7.1 Process Cash Payment
**Critérios de Aceitação:**
Given the customer selects cash as payment method
When the cashier enters the cash amount and confirms
Then the system should record the payment and update the order status to 'Paid'
And generate a cash receipt with payment details

#### 7.2 Handle Payment Failures
**Critérios de Aceitação:**
Given payment processing fails
When system receives error response
Then order status should remain 'Unpaid'
 And cashier should see error details
 And allow retry with alternative method

#### 7.3 Generate Payment Reports
**Critérios de Aceitação:**
Given manager requests payment report
When date range and filters are selected
Then system should generate report with:
- Payment method breakdown
- Daily totals
- Failed transactions
- Refund summary

#### 7.4 Handle Payment Refunds
**Critérios de Aceitação:**
Given a manager initiates a refund
When refund amount and reason are entered
Then system should process refund to original payment method
And update transaction status to 'Refunded'
And notify customer via email/SMS

#### 7.5 Process Prepaid Account Payment
**Critérios de Aceitação:**
Given the customer selects prepaid account
When cashier enters account ID and amount
Then system should validate account balance
And deduct amount from prepaid balance
And update order status to 'Paid' if sufficient funds

#### 7.6 Process Card Payment
**Critérios de Aceitação:**
Given the customer selects card payment
When the card is swiped/tapped and PIN is entered
Then the system should process payment via PCI-compliant gateway
And update order status to 'Paid' upon authorization
And store encrypted card token if recurring payments needed

#### 7.7 Process Split Payments
**Critérios de Aceitação:**
Given customer requests split payment
When cashier assigns amounts to multiple methods
Then system should process each method sequentially
And update order status only when full amount is paid
And generate split receipt

#### 7.8 Process Mobile Payment
**Critérios de Aceitação:**
Given the customer selects mobile payment (Apple Pay/Google Pay)
When customer authenticates on their device
Then the system should process payment via mobile SDK
And update order status to 'Paid' on successful authorization
And generate digital receipt

#### 7.9 Send Payment Confirmations
**Critérios de Aceitação:**
Given payment is successful
When customer has opted-in for notifications
Then system should send:
- SMS for mobile payments
- Email for card/prepaid
- In-app notification for registered users

### E8: Point of Sale (POS)
POS system specifically designed for bar operations with order management, payment processing, and receipt generation

#### 8.1 Modify Order Items
**Critérios de Aceitação:**
Given I have items in my order
When I click '-' on an existing item
Then the quantity should decrement by 1
When quantity reaches 0, the item should be removed
When I click 'Remove' next to an item
Then the item should be completely removed from the order

#### 8.2 View Order History
**Critérios de Aceitação:**
Given I am logged in as bar staff
When I navigate to 'Order History'
Then I should see a list of past orders with statuses
When I search by order number or date range
Then filtered results should display
When I select an order
Then full order details including payment/refund info should show

#### 8.3 Split Payment
**Critérios de Aceitação:**
Given I have a paid order with multiple items
When I select 'Split Payment'
Then I should see an option to split by item or percentage
When I split by item
Then each item should be assigned to a payment method
When I split by percentage
Then I should input percentage values for each payment method
When splitting exceeds 100%
Then show validation error

#### 8.4 Add Items to Order
**Critérios de Aceitação:**
Given I have an open order
When I select a beverage item from the menu
Then the item should be added to the order with quantity 1
And I should see the updated order summary with running total
When I click '+' on an existing item
Then the quantity should increment by 1

#### 8.5 Generate Receipt
**Critérios de Aceitação:**
Given I have a paid order
When I select 'Print Receipt' or 'Email Receipt'
Then a receipt should be generated with:
- Order number and timestamp
- Itemized list with prices
- Applied discounts
- Total paid
- Payment method used
When printing
Then receipt should format for thermal receipt printer
When emailing
Then receipt should be sent to specified email address

#### 8.6 Apply Discounts
**Critérios de Aceitação:**
Given I have items in my order
When I enter a valid discount code or select a predefined discount
Then the discount should be applied to the order total
And the discount type (percentage/fixed) and amount should be visible
When I apply an invalid discount
Then an error message should appear

#### 8.7 Create New Order
**Critérios de Aceitação:**
Given I am logged in as a bar staff
When I select 'New Order' from the POS dashboard
Then I should see an empty order form with menu categories
And I should be able to add items by searching or browsing categories

#### 8.8 Process Payment
**Critérios de Aceitação:**
Given I have a completed order
When I select 'Payment' option
Then I should see payment method choices (cash/card)
When I select 'Card'
Then a payment gateway integration should initiate
When payment is successful
Then the order should transition to 'Paid' status
When payment fails
Then an error message should appear

#### 8.9 Cancel Order
**Critérios de Aceitação:**
Given I have an unpaid or partially paid order
When I select 'Cancel Order'
Then a confirmation dialog should appear
When I confirm cancellation
Then the order status should change to 'Cancelled'
And items should be returned to inventory
When the order is paid
Then cancellation should require manager approval

#### 8.10 Process Refund
**Critérios de Aceitação:**
Given I have a paid order
When I select 'Refund' and enter amount
Then the refund should be processed through the original payment method
When refund amount exceeds paid amount
Then show validation error
When refund is successful
Then order status should change to 'Refunded'
And refund receipt should be generated

### E9: Customer Relationship Management
System for tracking customer interactions, preferences, visit history, and loyalty programs

#### 9.1 Customer Search and Filtering
**Critérios de Aceitação:**
Given I am in the customer management dashboard
When I search by name, ID, or contact info
Then the system should return matching customer profiles
When I apply filters (e.g., loyalty tier, last visit date)
Then the results should update dynamically

#### 9.2 Customer Preferences Management
**Critérios de Aceitação:**
Given I am editing a customer profile
When I navigate to the preferences section
Then I should be able to set communication preferences (email/SMS notifications)
And product/service preferences (e.g., favorite drinks, sports equipment)
And save preferences
Then saved preferences should persist for future interactions

#### 9.3 Customer Profile Creation
**Critérios de Aceitação:**
Given I am a system administrator
When I navigate to the customer management section
And I click 'Add New Customer'
Then I should be able to input customer details (name, contact info, registration date)
And save the profile
Then the system should generate a unique customer ID

#### 9.4 Customer Interaction Logging
**Critérios de Aceitação:**
Given I am viewing a customer profile
When I click 'Log Interaction'
Then I should be able to enter interaction details (date, staff member, type, notes)
And save the entry
Then I should see this interaction added to the customer's interaction history
And the interaction should be timestamped

#### 9.5 Visit History Tracking
**Critérios de Aceitação:**
Given a customer checks in at the arena
When staff validates their membership/profile
Then the system should automatically record a visit with timestamp
And link it to the customer profile
Then when viewing the customer profile, I should see a chronological visit history

#### 9.6 Loyalty Program Management
**Critérios de Aceitação:**
Given I am viewing a customer profile
Then I should see their current loyalty tier and points balance
When points are awarded (e.g., purchase interaction)
Then points should be added to the balance
When points are redeemed
Then points should be deducted
Then I should be able to adjust points manually for corrections

#### 9.7 Customer Segmentation
**Critérios de Aceitação:**
Given I have customer data in the system
When I create a new segment
Then I should be able to define rules (e.g., 'last visit > 30 days', 'points > 100')
Then the system should auto-populate customers matching these rules
When I edit segment rules
Then the customer list should update automatically

#### 9.8 Customer Data Export
**Critérios de Aceitação:**
Given I am viewing a customer list
When I select customers and click 'Export'
Then I should be able to choose data format (CSV/Excel)
And select data fields (profile, interactions, visits, loyalty)
Then the system should generate a downloadable file with selected data

### E10: Access Control
Physical access control system for facility entry, possibly integrated with user management and membership systems

#### 10.1 Member authentication via RFID card
**Critérios de Aceitação:**
Given I am a registered member
When I present my active RFID card at the entry point
Then the system should validate my membership status
And grant access if membership is valid
And deny access if membership is expired or revoked

#### 10.2 Mobile app credential validation
**Critérios de Aceitação:**
Given I am a member with the mobile app installed
When I present my digital credential at the entry point
Then the system should validate the app's digital signature
And grant access if credentials are current
And require biometric confirmation if enabled

#### 10.3 Access logging and audit trail
**Critérios de Aceitação:**
Given an access attempt occurs
When the system processes entry/exit
Then it should log the timestamp, user ID, entry point, and access status
And provide searchable audit reports for administrators

#### 10.4 Real-time access monitoring dashboard
**Critérios de Aceitação:**
Given I am an administrator
When I access the control panel
Then I should see a live dashboard showing active entries
And recent access attempts with success/failure indicators
And membership status warnings for expiring passes

#### 10.5 Emergency override for staff
**Critérios de Aceitação:**
Given there is a system emergency
When an authorized staff member uses the emergency override
Then the system should grant immediate access without membership validation
And log the emergency action with staff ID and reason

#### 10.6 Temporary guest pass issuance
**Critérios de Aceitação:**
Given I am an authorized staff member
When I issue a temporary guest pass for a non-member
Then the system should generate a time-limited access code
And send the code to the guest's registered email
And allow entry only during the specified time window


---
*Gerado por Genesis AI Labs*