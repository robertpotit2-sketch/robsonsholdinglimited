# Robsons Product Catalog Guide

The website reads products from `products.csv` by default. You can also connect a published Google Sheet CSV link from the Admin section of the website.

## Product Images

1. Upload each product photo to a public image host such as Cloudinary, Google Drive with public sharing, your hosting account, or another image service.
2. Copy the public image URL.
3. Paste that URL into the `Image URL` column in the Excel or Google Sheet catalog.
4. Optional extra photos can go into `Image 2 URL` and `Image 3 URL`.

## Google Sheets Setup

1. Upload `Robsons_Product_Catalog_Template.xlsx` to Google Drive.
2. Open it with Google Sheets.
3. Edit the `Products` sheet.
4. Choose `File > Share > Publish to web`.
5. Select the `Products` sheet and publish as CSV.
6. Copy the CSV link.
7. Paste the link into the website Admin section under `Published Google Sheet CSV URL`.

## Required Columns

Keep these column names unchanged:

- `SKU`
- `Product Name`
- `Category`
- `Brand`
- `Price`
- `Sale Price`
- `Description`
- `Image URL`
- `Color`
- `Size`
- `Stock Quantity`
- `Availability`
- `Delivery Time`
- `Weight Kg`
- `Featured`
- `New Arrival`

Use `in_stock`, `low_stock`, or `out_of_stock` for availability. Use `Yes` or `No` for featured and new arrival columns.
