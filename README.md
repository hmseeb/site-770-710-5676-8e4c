# Von Kohler Drain Cleaning and Plumbing — website

Single-page marketing site for **Von Kohler Drain Cleaning and Plumbing**, a veteran-owned,
family-operated drain cleaning and plumbing business based in **Cleveland, GA 30528**,
serving Cleveland and the surrounding North Georgia areas 24/7.

- Phone: [(770) 710-5676](tel:+17707105676)
- Email: [vonkohlerplumbing@gmail.com](mailto:vonkohlerplumbing@gmail.com)
- Address: Cleveland, GA 30528
- Hours: 24/7 (emergency and after-hours service)

## Stack

Vanilla HTML, CSS and JavaScript — no build step, no dependencies, no external APIs.

```
index.html     Single page: hero, trust strip, services, why us, service area,
               testimonials, FAQ, CTA band, contact + form
styles.css     Design system (CSS custom properties), layout, responsive rules
script.js      Mobile nav, current year, contact form submission, confirmations
favicon.svg    Favicon placeholder (VK monogram)
images/        Original photography and logo carried over from the previous site
robots.txt     Crawler rules
sitemap.xml    Single-page sitemap
```

## Running locally

Open `index.html` directly in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000/
```

## Forms

Every form posts to LeadrVision at `https://vision.leadrai.com/api/forms/d625f11706e3cddfbeeddedd1b094df4`.

- Plain HTML `POST` works with JavaScript disabled; visitors return to the page with `?submitted=1`
  and see the "Thanks, your message was sent" confirmation.
- With JavaScript enabled the form is submitted with `fetch()` (JSON body, with an automatic
  `application/x-www-form-urlencoded` retry and a native form fallback) and the confirmation is
  shown inline.
- Hidden fields: `_form` (form name), `_page` (current page URL, set on load) and `_gotcha`
  (honeypot, hidden from people).

## Content sources

Business name, service descriptions, testimonials and contact details were taken from the
existing website at <http://vonkohlerplumb.com/>. Photography and the logo are the business's own
assets from that site, re-encoded locally for faster loading.
