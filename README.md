# Crowley Park Community Association

This website is adapted from the Cottonwood Creek Community Association website, using the same Clubhouse Links layout, forest-green theme, event cards, announcements, vendor listings, and app downloads.

## Website deployment
Repository: https://github.com/evanalmighty84/CrowleyParkCommunity-
Expected Pages URL: https://evanalmighty84.github.io/CrowleyParkCommunity-/

Enable GitHub Pages at **Settings → Pages**, choose **Deploy from a branch**, **main**, **/(root)** and Save.

## Backend
Public content endpoint (must exist on the backend):
https://crm-function-app-5d4de511071d.herokuapp.com/server/resident_function/api/residents/community-sites/crowley-park

The frontend intentionally uses only Crowley Park's endpoint. It must NOT fall back to Cottonwood Creek's endpoint. Check that the backend returns published content for Crowley Park only, with appropriate CORS. If this route has not been implemented or deployed, news/events/vendors show a temporary-unavailable message.

Board editing takes place in the authenticated Clubhouse Links app, not on this public page.

## Media
The Cottonwood Creek entrance photo was deliberately not copied. A styled placeholder is used until a genuine Crowley Park community photo is available.

## App
iPhone App Store link is live. Android is shown as coming soon, matching the source site.

## Notes
The trailing hyphen in the repository name is intentional; it must be retained in the GitHub Pages URL.
