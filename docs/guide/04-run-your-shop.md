# 4 · Run your shop

## Why

Your shop runs on **Shopify**. Shopify keeps your products, prices and stock,
takes the payment, works out shipping and tax, and gives you the order list.
The site shows whatever Shopify has, so a change you make there shows on the
site without anyone rebuilding anything.

The Studio's **Products** module is how products get **into** Shopify. It
holds Shopify's import sheet, which you can fill in on your phone and then
hand to Shopify in one go.

## Do it

### Getting products into Shopify

Open **Studio → Products**. You'll see every product in the sheet, grouped
under its design (`design:vampire-cats`, `design:on-a-leash`…).

**The first time only:** the top line says **Filled from the site's
catalogue · save once to keep it**. Everything the site sold is already in the
sheet, one product for each format: _Vampire Cats Sticker_, _Vampire Cats
Patch_, _Vampire Cats Men's Tee_ and so on. Tap **Save the sheet** once, before
you change anything.

**To add a product:**

1. Tap **Add a product**.
2. Under **Photos**, drop, paste or pick the photos. Put the photo of this
   format first (the tee on a body, the sticker on a table) and the artwork
   second. Fill in an **Image alt text** for each one: what it shows, for
   anyone who can't see it.
3. Under **The product**, fill in the **Title** (e.g. _Vampire Cats Sticker_),
   a **URL handle** (e.g. _vampire-cats-sticker_) and a **Description**. Set the
   **Vendor** to the band, or _Tibbie X_ for your own art.
4. Tap its **Type**: **T-Shirt**, **Patch**, **Sticker**, **Button**,
   **Record** or **Bundle**. That also fills in **Product category**. Each
   kind of thing is its own product, even when it's the same design: the
   Vampire Cats sticker and the Vampire Cats button are two products.
5. In **Tags**, write `design:` and the design's name, so the site puts it
   with the rest of that design. Then add `band:` for band merch,
   `line:art` for your own art, and `fit:mens` or `fit:womens` for a tee. For
   example: `design:vampire-cats, line:art, fit:womens`.
6. Under **Variants**, a product with sizes has **Option1 name** _Size_ and one
   variant per size. Tap **Add a variant** for each size and fill in its
   **Option1 value** (_S_, _M_…) and **Price**. A product with no sizes keeps
   the one variant it starts with.
7. A new product starts as a **Draft**. Switch **Status** to **Active** when
   it's right.
8. Tap **All products**, then **Save the sheet**.

**To send the sheet to Shopify:**

1. Tap **Download CSV**. If something isn't finished, the Studio opens it
   instead and lists what's missing under **Before it can be imported**.
2. In Shopify, go to **Products → Import** and pick the file you downloaded.
3. Tick **Overwrite products with matching handles**, so a product that's
   already in Shopify is updated instead of doubled.
4. Tap **Upload and preview**, check it, then **Import products**.

### Day to day: in Shopify

Once a product is in Shopify, change it **in Shopify**, not in the sheet:

- **Sold out of a size:** set that variant's stock to 0. The site crosses the
  size out.
- **A new price:** change it on the variant.
- **Taking a product down:** set it to **Draft**. It disappears from the site
  and stays in Shopify for later.
- **Orders:** they're in **Orders**, with the buyer's address. Mark each one
  fulfilled when it ships.

The sheet doesn't follow what you change in Shopify. If you want the Studio's
sheet to match the store again, export your products from Shopify
(**Products → Export**, as a CSV for Excel or Numbers), then in the Studio tap
**Upload a CSV**, pick the file and tap **Replace it**.

The file doesn't have to be neat. A sheet that's been through Excel or
Numbers, sorted, saved with semicolons, or typed by hand will come in: a
price typed _$35_, _yes_ for TRUE, _live_ for Active, _tee_ for T-Shirt, a tag
typed _Design: Vampire Cats_, a row with its URL handle left blank. Before you
tap **Replace it**, the Studio lists everything it tidied under **Tidied on
the way in**. It does the same tidying when you tap **Download CSV**, and
tells you what it changed.

### Optional: one collection per design

To give a design its own name, description and cover on the site, make a
**collection** in Shopify (**Products → Collections → Create collection**).
Name it after the design, set it to **Automated** with the condition **Product tag
is equal to** `design:vampire-cats`, add the artwork as its image, and write the
description. Its URL handle has to be the design's tag without `design:`, here
_vampire-cats_. Without a collection the site uses what the products share.

## Check it worked

In the Studio, the top line says **Saved** and how long ago. In Shopify, the
import finishes with a count of products created or updated. Then tap **View
site**, open **Buy**, and find the design. Each format you imported is one of
its choices, and **Buy** takes you to Shopify's checkout.

## If something's off

- **"… isn't ready to import yet."** The Studio opens that product and lists
  what's missing under **Before it can be imported**: usually a Title, a Price
  or a size with no value. Fix the list, then download again.
- **A product shows on its own instead of with its design.** Its **Tags** are
  missing `design:`, or it's spelled differently from the others. The **On the
  site** note under the product says so.
- **The button says "Not on sale yet".** The site can't reach Shopify, or that
  product isn't in the store yet. Import it, and check it's **Active** and
  published to the online store.
- **Shopify says a photo couldn't be downloaded.** Upload it again in the
  Studio, save, and import again. Screenshots work. Save anything else as a JPG
  or PNG first.
- **"The sheet changed on another device since you opened it."** Someone saved
  from another phone or computer after you opened the Studio. Reload the page
  and make your change again.
- **"Picked up your unsaved edits."** You left changes on this device without
  saving them. Save them, or tap **Discard**.
- **Wrong passcode.** Ask J.F. Don't guess repeatedly.

## The habit

**The shop tells the truth.** Shopify counts stock down by itself now, so the
truth mostly keeps itself, as long as the count you started with was real.
When you restock, put in the real number. If a size is gone, let it show as
gone. Someone who orders a tee in their size and gets a refund note won't try a
second time.

**Put a new design up with its post, not after.** Get it into Shopify as a
**Draft**, check it, switch it to **Active**, then post it with a Link Maker
link (lesson 2), all on the same day. That way the people who tap through from
your post find it waiting for them.
