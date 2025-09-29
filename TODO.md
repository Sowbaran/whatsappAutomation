# TODO: Update Order Details Page to Show "Loading..." for Unavailable Fields

## Current Work
Modifying Frontend/order-details.html to display "Loading..." for unavailable (null/undefined) fields instead of empty strings, while showing data from DB for available fields.

## Key Technical Concepts
- Frontend: JavaScript DOM manipulation in populateOrderDetails function.
- Data Handling: Conditional display based on field availability.
- Order Model: Embedded customer and payment objects with optional fields.

## Relevant Files and Code
- Frontend/order-details.html
  - populateOrderDetails function: Populates page elements with order data.
  - Current: Uses || '' for missing fields.
  - Update: Use || 'Loading...' for optional fields.

## Problem Solving
- Issue: Unavailable fields show empty strings, not user-friendly.
- Solution: Change populate logic to show "Loading..." for missing optional fields.

## Pending Tasks and Next Steps
- [x] Update populateOrderDetails in Frontend/order-details.html to replace || '' with || 'Loading...' for optional fields.
- [x] Keep required fields (like orderId) unchanged.
- [x] Test the page with an order having some missing fields to verify "Loading..." displays correctly.
