# Robsons Biz Solutions Online Store

This is a static eCommerce website for **Robsons Biz Solutions**. It can be hosted on GitHub Pages without installing Node.js, React, or a database.

## Main Website Files

- `index.html` - root redirect for GitHub Pages
- `preview.html` - local preview redirect
- `CNAME` - custom domain for GitHub Pages
- `robsons_property_website_starter/index.html` - main website page
- `robsons_property_website_starter/style.css` - website styling
- `robsons_property_website_starter/products.js` - product loading, filtering, cart, checkout, and WhatsApp order logic
- `robsons_property_website_starter/products.csv` - backup product catalog
- `robsons_property_website_starter/PRODUCT-CATALOG-GUIDE.md` - guide for updating product images and Google Sheet data
- `robsons_property_website_starter/assets/` - local image/logo assets

The live product catalog is connected to your published Google Sheet CSV in `products.js`.

## How to Use on GitHub

1. Create a new GitHub repository.
2. Upload these files and folders from this project:
   - `index.html`
   - `preview.html`
   - `.nojekyll`
   - `README.md`
   - `CNAME`
   - `robsons_property_website_starter/`
3. Do not upload private files such as `.env.local`, `.vercel/`, `server.out.log`, or `server.err.log`.
4. In GitHub, open the repository settings.
5. Go to **Pages**.
6. Under **Build and deployment**, choose:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/ (root)`
7. Click **Save**.
8. Wait for GitHub Pages to finish deploying.
9. Open the GitHub Pages link shown in the Pages settings.

## Custom Domain

This project is prepared for:

`robsonsholding.company`

In GitHub, go to **Settings > Pages**, then enter this domain in **Custom domain**:

`robsonsholding.company`

In your domain DNS settings, add these GitHub Pages A records for the root domain:

```text
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

If you also want `www.robsonsholding.company`, add a CNAME record:

```text
www -> YOUR-GITHUB-USERNAME.github.io
```

After GitHub verifies the domain, turn on **Enforce HTTPS** in the Pages settings.

## Updating Products

1. Open your Google Sheet product catalog.
2. Add or edit rows in the sheet.
3. Paste public image links into the `Image URL` column.
4. Keep the sheet published as CSV.
5. Refresh the website after updating the sheet.

The website first tries to load the Google Sheet. If it cannot load, it uses `robsons_property_website_starter/products.csv` as a backup.

## Important Image Note

Product image links should be public. Facebook image links may stop working or expire. For best reliability, use Cloudinary, Google Drive public image links, or images uploaded into the website `assets/` folder.

## Contact Number

Phone and WhatsApp order links are set to:

`+675 7444 7170`
