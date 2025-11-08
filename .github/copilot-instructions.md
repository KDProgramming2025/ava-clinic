You are an expert in web development, both front-end and back-end. You have experience with HTML, CSS, JavaScript, and various frameworks and libraries. You are familiar with best practices for building responsive and accessible web applications.

The terminal is in linux environment and you have root access.
Github CLI is installed.
remote repository name is "github" instead of "origin".

Current project is a website for a women's hair and eybrow implant clinic.
The project should have a website and an admin dashboard that controlls everything and every content inside the website. 

The website should be Search Engine Optimized and all the SEO practices should be implemented completely. 

The backend should be always running as a systemd service.

it should have these admin abilities and features:

1. Home Page:
   - Stats numbers and labels
   - Feature cards
   - Testimonials
   - Hero / CTA texts
2. About Page:
   - Timeline events
   - Values
   - Skills percentages
   - Mission statement & bullet points
   - Team details (if TeamManagement doesn’t already handle full CRUD)
3. Services Page:
   - Benefits list per service
   - Process steps per service
   - FAQ items per service (currently global array inside component)
4. Magazine Page:
   - Featured article designation (flagging an article as featured)
   - Trending topics list
   - Category metadata (name, count, color) – count should derive from articles dynamically
   - Tags taxonomy (list + relationships)
   - Newsletter block content (headline, description, button label)
5. Video Gallery:
   - Categories taxonomy
   - Views / metrics (should come from backend rather than static)
6. Contact Page:
   - Contact info card data (phones, emails, addresses, hours)
   - Contact FAQ items
   - Social media links (icons + URLs)
   - Quick action labels / CTA texts
7. Booking Page:
   - Booking flow configuration (steps definitions, disclaimers, available time slots, blackout dates)
8. Global:
   - SEO meta fields (site title, meta description, OpenGraph image, structured data toggles)
   - Navigation structure
   - Footer links and disclaimers
   - Translations / i18n key editing (a dictionary editor)
9. Assets:
   - Image/media library (currently direct external URLs)
10. Settings:
   - Branding (logo URL, primary colors)
   - Email templates (confirmation, reminder)
   - Contact form auto-reply content
11. Security / Access:
   - Admin user management / roles (not present)

## Proposed Data Model (Collections)

Use a backend DB. Suggested entities:

- settings: { siteTitle, metaDescription, ogImage, primaryColor, secondaryColor, languagesEnabled[] }
- navigationItems: [ { id, labelKey, path, order, visible } ]
- footerLinks: [ { id, label, url, group } ]
- home:
  - hero: { titleKey, subtitleKey, descriptionKey, ctaPrimaryLabelKey, ctaSecondaryLabelKey }
  - stats: [ { id, labelKey, value, icon } ]
  - features: [ { id, title, description, icon } ]
  - testimonials: [ { id, name, text, rating, image } ]
  - cta: { heading, subheading, buttonLabel }
- about:
  - timeline: [ { id, year, title, description } ]
  - values: [ { id, title, description, icon } ]
  - skills: [ { id, name, level } ]
  - mission: { heading, paragraph, bulletPoints[] }
- teamMembers: [ { id, name, role, bio, image, active } ]
- services: [ { id, title, subtitle, description, image, priceRange, duration, recovery, benefits[], processSteps[], faq[] } ]
- articles: [ { id, title, excerpt, image, authorId, publishedAt, categoryId, readTimeMinutes, status, tags[] , featured:boolean } ]
- categories: [ { id, name, color } ] (article and video categories)
- tags: [ { id, name } ]
- videos: [ { id, title, description, thumbnail, durationSeconds, categoryId, views, status } ]
- videoCategories: [ { id, name } ]
- trendingTopics: [ { id, text, order } ]
- newsletter: { headline, description, buttonLabel }
- contact:
  - infoBlocks: [ { id, type:phone|email|address|hours, title, values[] } ]
  - faq: [ { id, question, answer } ]
  - socialLinks: [ { id, platform, url, icon } ]
  - quickActions: [ { id, label, type:call|email|chat|custom, target } ]
- bookings: [ { id, clientId, serviceId, startTime, endTime, status, notes, price } ]
- clients: [ { id, name, email, phone, joinDate, lastVisit, status, totalSpent, totalBookings } ]
- messages: [ { id, fromName, email, phone, subject, body, receivedAt, status, starred } ]
- translations: { key: { en: string, fa?: string, ... } }
- media: [ { id, url, alt, type, labels[] } ]

## REST API Endpoints (CRUD Skeleton)

GET /api/home, PUT /api/home
GET /api/home/testimonials, POST /api/home/testimonials, PUT /api/home/testimonials/:id, DELETE /api/home/testimonials/:id

Services:
GET /api/services, POST /api/services
GET /api/services/:id, PUT /api/services/:id, DELETE /api/services/:id

Articles:
GET /api/articles?category=&tag=&featured=
POST /api/articles
GET /api/articles/:id
PUT /api/articles/:id
DELETE /api/articles/:id
PATCH /api/articles/:id/feature

Categories / Tags:
GET /api/categories (articles)
POST /api/categories
GET /api/tags
POST /api/tags

Videos:
GET /api/videos?category=
POST /api/videos
GET /api/videos/:id
PUT /api/videos/:id
DELETE /api/videos/:id

Team:
GET /api/team
POST /api/team
PUT /api/team/:id
DELETE /api/team/:id

Contact:
GET /api/contact
PUT /api/contact
Contact FAQ CRUD similar patterns.

Bookings:
GET /api/bookings?status=&date=
POST /api/bookings
PUT /api/bookings/:id
PATCH /api/bookings/:id/status
DELETE /api/bookings/:id

Clients:
GET /api/clients?status=&search=
POST /api/clients
PUT /api/clients/:id
DELETE /api/clients/:id

Messages:
GET /api/messages?status=
POST /api/messages (from public contact form)
PUT /api/messages/:id (e.g., reply state)
PATCH /api/messages/:id/star
DELETE /api/messages/:id

Translations:
GET /api/translations
PUT /api/translations (bulk update)
PATCH /api/translations/:key

Settings:
GET /api/settings
PUT /api/settings

Media:
POST /api/media (upload)
GET /api/media
DELETE /api/media/:id

## Recommended Admin Dashboard Additions

New Pages / Sections:
1. Home Content Manager (hero texts, stats, features, testimonials CRUD).
2. About Content Manager (timeline, values, skills, mission).
3. Service Detail Editor Enhancements (benefits/process/FAQ arrays UI).
4. Global Taxonomies (categories & tags management shared between videos/articles).
5. Featured & Trending Manager (designate featured article, order trending topics).
6. Newsletter Settings panel.
7. Contact Content Manager (info blocks, social links, FAQs, quick actions).
8. Translation Manager (key-value grid with language tabs).
9. Media Library (upload images, manage URLs used across site).
10. Settings (site meta, SEO fields, branding assets).
11. Booking Flow Config (define steps, durations, buffer times).
12. Access Control (admin users & roles for future audits).

Small Improvements to Existing Pages:
- ServicesManagement: add image, benefits/process/FAQ editors.
- VideosManagement: add status toggle (draft/published), category selection tied to taxonomy.
- MagazineManagement: add excerpt, thumbnail cropping, featured toggle, tags multi-select.
- BookingsManagement: inline status update, reschedule calendar.
- ClientsManagement: segmentation tags, notes field, export CSV.
- MessagesManagement: starred toggle immediate UI, reply template modal.

## Implementation Priority (Phased)

Phase 1 (Core Content)
- Services deep data
- Articles + categories + tags + featured
- Videos + categories
- Testimonials + Team

Phase 2 (Supporting Marketing)
- Home/About structured data
- Contact info + FAQs
- Newsletter + SEO settings

Phase 3 (Operational)
- Bookings real CRUD
- Clients real CRUD
- Messages inbound from contact form
- Translations editor

Phase 4 (Enhancements)
- Media library
- Access control & roles
- Analytics dashboards (views, bookings conversion)

## Data Normalization Notes

- Avoid storing counts (like category counts) manually; compute on read.
- Keep large text (article body) separate or lazy-loaded.
- Use slugs for services/articles/videos for SEO-friendly URLs.
- Store benefits/process/faq as arrays of objects for future versioning:
  benefits: [ { id, text } ]
  processSteps: [ { stepNumber, title?, description } ]
  faq: [ { id, question, answer } ]

## Edge Cases / Considerations

- Internationalization: new keys added via admin -> must not break frontend if missing translation; fallback to default language.
- Media deletion: ensure no referencing content remains orphaned.
- Concurrency: optimistic updates for list views; implement ETag/version fields (e.g., updatedAt).
- Security: sanitize HTML if allowing rich article content.