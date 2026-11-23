
'use strict';
const API_ORIGIN = window.CROWLEY_API_ORIGIN || 'https://crm-function-app-5d4de511071d.herokuapp.com';
const API_PATH = '/server/resident_function/api/residents/community-sites/crowley-park';
// This endpoint returns only public, published HOA content. Never send credentials from GitHub Pages.
const $ = (s) => document.querySelector(s);
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safeUrl = (v) => {
  try {
    const u = new URL(v);
    return ['https:', 'mailto:'].includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
};
function renderCard(item, type) {
  const stampValue = item.starts_at || item.published_at || item.updated_at;
  const stamp = stampValue ? new Date(stampValue).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const link = safeUrl(item.url);
  const image = safeUrl(item.image_url);
  const photo = image?.startsWith('https://') ? `<img class="${type === 'Event' ? 'event-image' : 'announcement-image'}" src="${escapeHtml(image)}" alt="" loading="lazy">` : '';
  return `<article>
    ${photo}
    <span class="meta">${type} ${escapeHtml(stamp)}</span>
    <h3>${escapeHtml(item.title || '')}</h3>
    <p>${escapeHtml(item.description || '')}</p>
    ${item.address ? `<p><strong>Location:</strong> ${escapeHtml(item.address)}</p>` : ''}
    ${link ? `<p><a class="button ghost" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">Learn more</a></p>` : ''}
  </article>`;
}
// Announcements are published in PostgreSQL and supplied by the public community API.
// Keep this renderer data-driven so new announcements require no website code changes.
function renderAnnouncementCard(item) {
  const stampValue = item.published_at || item.created_at;
  const stampDate = stampValue ? new Date(stampValue) : null;
  const stamp = stampDate && !Number.isNaN(stampDate.getTime())
    ? stampDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  const image = safeUrl(item.image_url);
  const link = safeUrl(item.url);
  const isAppStore = link && new URL(link).hostname === 'apps.apple.com';
  const title = escapeHtml(item.title || 'Community announcement');
  const body = escapeHtml(item.description || item.body || '');
  const imageHtml = image?.startsWith('https://')
    ? `<div class="announcement-media"><img class="announcement-image" src="${escapeHtml(image)}" alt="${title === 'Community announcement' ? 'Community announcement' : title}" loading="lazy"></div>`
    : '';
  return `<article class="announcement-card">
    ${imageHtml}
    <div class="announcement-copy">
      <span class="meta">Community announcement ${escapeHtml(stamp)}</span>
      <h3>${title}</h3>
      <p class="announcement-body">${body}</p>
      ${link ? `<a class="announcement-cta" href="${escapeHtml(link)}" target="_blank" rel="noopener noreferrer">${isAppStore ? 'iPhone App Store' : 'Learn more'} <span aria-hidden="true">↗</span></a>` : ''}
    </div>
  </article>`;
}

function renderVendors(items) {
  if (!items.length) return '<p class="muted">No active neighborhood vendors are listed yet.</p>';
  return items.map((item) => {
    const name = item.title || item.company_name || 'Community vendor';
    const website = safeUrl(item.url);
    const logo = safeUrl(item.logo_url);
    return `<article class="vendor-card">
      ${logo?.startsWith('https://') ? `<img class="vendor-logo" src="${escapeHtml(logo)}" alt="" loading="lazy">` : ''}
      <h3>${escapeHtml(name)}</h3>
      ${item.category ? `<p class="vendor-category">${escapeHtml(item.category)}</p>` : ''}
      ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
      ${website?.startsWith('https://') ? `<a class="vendor-site" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">Visit vendor website →</a>` : ''}
    </article>`;
  }).join('');
}
function applyContent(data) {
  const site = data.site || {};
  if (site.hero_text) $('#hero-copy').textContent = site.hero_text;
  if (site.about_text) $('#about-copy').textContent = site.about_text;
  if (site.contact_url && safeUrl(site.contact_url)) $('#contact-link').href = safeUrl(site.contact_url);
  const announcements = Array.isArray(data.announcements) ? data.announcements : [];
  const events = Array.isArray(data.events) ? data.events : [];
  const vendors = Array.isArray(data.vendors) ? data.vendors : [];
  $('#announcements').innerHTML = announcements.length ? announcements.map(renderAnnouncementCard).join('') : '<p class="muted">No announcements published yet.</p>';
  $('#events-list').innerHTML = events.length ? events.map((x) => renderCard(x, 'Event')).join('') : '<p class="muted">No community events published yet.</p>';
  $('#resource-list').innerHTML = renderVendors(vendors);
}
function setFallback() {
  $('#announcements').innerHTML = '<div class="error-callout"><strong>Community updates will appear here.</strong><p>The community feed is temporarily unavailable. Please try again later.</p></div>';
  $('#events-list').innerHTML = '<div class="error-callout"><strong>Event publishing will appear here.</strong><p>The published events feed is temporarily unavailable. Please try again later.</p></div>';
  $('#resource-list').innerHTML = '<div class="error-callout"><strong>Community vendor directory is unavailable.</strong><p>Try again later for approved neighborhood providers.</p></div>';
}
document.addEventListener('DOMContentLoaded', async () => {
  $('#year').textContent = String(new Date().getFullYear());
  const menu = $('#menu');
  const links = $('#links');
  menu.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
  });
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(API_ORIGIN + API_PATH, { headers: { Accept: 'application/json' }, signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    applyContent(data);
  } catch (err) {
    setFallback();
  }
});
