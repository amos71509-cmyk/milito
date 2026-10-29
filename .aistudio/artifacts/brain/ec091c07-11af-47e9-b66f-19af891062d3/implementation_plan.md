# MILITO Dual-Gateway & Isolated Gadget/Automotive Storefronts

Restructure the existing MILITO application into an initial full-screen dual-carousel gateway (**Shop Gadgets** and **Explore Cars**) that routes visitors into two strictly separated shopping experiences—one exclusively for Gadgets and one exclusively for Cars—while reusing both existing hero carousels, admin-managed media, Firebase database, and browser Back navigation.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Critical Decisions Confirmed with You**
> - **Initial Gateway Layout & Chrome**: The landing view renders **only** the two existing hero carousels side-by-side on desktop (`50% / 50%` split) and stacked on mobile, with **no header, no footer, and no other homepage sections**.
> - **Strict Experience Isolation**:
>   - Clicking **Shop Gadgets** opens the Gadget Homepage containing only gadget-related sections, navigation, search, FAQs, and footer links—with all car sections (`VehicleShowcaseBanner`, `HomepageAutomotiveTeaser`) and car mentions removed.
>   - Clicking **Explore Cars** opens the Car Homepage containing the Featured Cars Teaser, Full Vehicle Catalog & Filters, Customs Estimator, and Car Buying Steps—with all gadget sections and phone/swap mentions removed.
> - **Existing Assets & Data Preserved**: Both hero carousels retain their existing video/image rotation, admin-managed media hooks, and styling without duplicating databases or product collections.

---

## 1. Overview & Core Concept

Currently, MILITO loads directly into a combined homepage where smartphone/gadget sections and automotive sections (`HomepageAutomotiveTeaser`, `VehicleShowcaseBanner`, and mixed navigation/footer links) are interleaved.

This update reorganizes the storefront flow into three distinct, history-aware views:
1. **Initial Gateway (`gateway`)**: Visitors arriving at MILITO see only the two existing hero carousels (**Shop Gadgets** and **Explore Cars**).
2. **Gadget Experience (`gadgets`, `store`, `swap-deals`)**: Visitors who select **Shop Gadgets** enter the dedicated gadget homepage and shopping flow with zero automotive sections or references.
3. **Car Experience (`vehicles`)**: Visitors who select **Explore Cars** enter the dedicated automotive homepage with featured vehicle teasers, the full vehicle catalog, customs clearing estimator, and buying steps, with zero gadget or phone swap references.

---

## 2. User Experience & Visual Design

### A. Initial Two-Option Gateway
- **Full-Viewport Split Layout**: Side-by-side 2-column grid on desktop (`min-h-screen grid-cols-1 lg:grid-cols-2`) and stacked vertically on mobile screens, with no top header, no bottom navigation bar, and no footer.
- **Left / Top Panel — Gadget Hero Carousel**: Reuses the existing MILITO Gadget Hero (`#hero` with its Cloudinary background video, ambient emerald glow, floating particle canvas, trust cards, and admin-configured copy). Its primary CTA button is labeled **Shop Gadgets** (with secondary quick action to **Start a Swap**).
- **Right / Bottom Panel — Car Hero Carousel**: Moves the existing `VehicleShowcaseBanner` out of the gadget homepage into the second gateway panel, preserving its admin-managed slides (`useVehicleShowcase`), auto-advancing media carousel, slide indicators, and dark gradient scrims. Its primary CTA button is labeled **Explore Cars**.

### B. Dedicated Gadget Homepage (`Shop Gadgets`)
- **Sections Included**:
  - Gadget-focused Header (Logo, Gadget-only instant search bar and popular tags, Home / Store / Trade-In navigation, Cart, Login, and a "Switch to Gateway" back option).
  - Gadget Hero Banner & Trust Cards (with courier delivery icon instead of a car icon and gadget-exclusive copy).
  - `HomepageProductTeaser` (Featured smartphones, iPads, and smartwatches).
  - `SwapDealsSection` (Interactive phone trade-in & swap estimator teaser).
  - `MilitoQCSection` (35-Point Quality Control inspection showcase).
  - `PublicTestimonialsSection` (Verified device buyer & swapper proofs).
  - Gadget-only FAQs (excluding vehicle importation questions) & `FinalCtaSection`.
  - Gadget-focused Footer & Mobile Bottom Navigation.
- **Strict Exclusions**: `HomepageAutomotiveTeaser` and `VehicleShowcaseBanner` are completely removed from this page, and all vehicle tabs, car search placeholders/tags, and car FAQ/footer links are hidden.

### C. Dedicated Car Homepage (`Explore Cars`)
- **Sections Included**:
  - Automotive-focused Header (MILITO Logo, Vehicle-only instant search bar and popular car tags, Featured / Catalog / Customs / How It Works links, and "Back to Gateway").
  - `HomepageAutomotiveTeaser` (Featured verified foreign-used and Nigerian-used vehicles).
  - Full Vehicle Catalog & Multi-Filter Inventory (`VehiclesPage` with condition tabs, make/body/price filters, and direct WhatsApp dealer inquiry).
  - International Vehicle Import & Customs Duty Estimator (`VehicleImport`).
  - 4-Step Car Buying & Clearing Process ("How It Works").
  - Automotive-focused Footer (highlighting Foreign Used & Nigerian Used vehicles, Apapa/Tin Can Port clearing, and inspection policies, with zero phone/swap references).
- **Strict Exclusions**: No smartphone teasers, no phone trade-in sections, no gadget cart upsells, and no phone mentions in navigation or footer.

---

## 3. Key Product Decisions & Trade-Offs

- **Browser History & Back Button Support (`pushState` / `popstate`)**:
  - Navigating from the initial Gateway to **Shop Gadgets** or **Explore Cars** pushes a browser history state (`?view=gadgets` or `?view=vehicles`, plus sub-views `store` and `swap-deals`).
  - Pressing the browser **Back** button from either homepage smoothly returns the visitor to the initial two-option Gateway (and pressing Forward returns them to their chosen experience) without losing state or reloading the app.
- **Context-Aware Shared Header & Footer**:
  - Rather than duplicating components, `Header` and `Footer` accept the active experience mode (`"gadgets"` vs `"vehicles"`).
  - In **Gadget mode**, search only queries `phoneProducts`, popular search chips show only device models, and navigation/footer links show only gadget and swap pages.
  - In **Car mode**, search only queries `vehicleProducts`, popular search chips show vehicle makes (`Toyota`, `Lexus`, `Mercedes-Benz`, `Foreign Used`), and navigation/footer links anchor to Car sections (`Featured Cars`, `Vehicle Catalog`, `Customs Estimator`, `How It Works`).
- **Admin Dashboard Access Preserved**:
  - The 5-tap secret Admin Dashboard trigger on the MILITO logo and all Firebase/Cloudinary image and showcase management hooks remain untouched and accessible from both experiences.

---

## 4. Technical Architecture & Data Strategy

```
+-------------------------------------------------------------------------+
|                        Browser URL & History Sync                       |
|      "/" (Gateway)  <--->  "/?view=gadgets"  |  "/?view=vehicles"       |
+-------------------------------------------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                    Initial Gateway (activePage = "gateway")             |
|                   [No Header | No Footer | Full-Viewport]               |
|  +---------------------------------+---------------------------------+  |
|  |   Existing Gadget Hero          |   Existing Car Hero Carousel    |  |
|  |   (Video + Glow + Trust Cards)  |   (VehicleShowcaseBanner)       |  |
|  |   [CTA: Shop Gadgets]           |   [CTA: Explore Cars]           |  |
|  +----------------+----------------+----------------+----------------+  |
+-------------------|---------------------------------|-------------------+
                    |                                 |
                    v                                 v
+------------------------------------+   +--------------------------------+
|   Gadget Homepage ("gadgets")      |   |   Car Homepage ("vehicles")    |
|------------------------------------|   |--------------------------------|
| - Header (Gadget Search & Nav)     |   | - Header (Car Search & Nav)    |
| - Gadget Hero & Trust Cards        |   | - HomepageAutomotiveTeaser     |
| - HomepageProductTeaser            |   | - Full Vehicle Catalog &       |
| - SwapDealsSection                 |   |   Multi-Filter Grid            |
| - MilitoQCSection                  |   | - VehicleImport (Customs)      |
| - PublicTestimonialsSection        |   | - 4-Step Car Buying Guide      |
| - Gadget-Only FAQs & Final CTA     |   | - Footer (Car-Only Links)      |
| - Footer (Gadget-Only) & MobileNav |   +--------------------------------+
+------------------------------------+
```

- **State & Routing Flow**:
  - Expand `activePage` state to `"gateway" | "gadgets" | "store" | "vehicles" | "swap-deals"`, defaulting to `"gateway"` on initial visit unless a deep-link query parameter (`?view=...` or `/product/...`) is present in the URL.
  - Synchronize `handleNavigatePage` with `window.history.pushState({ page, sectionId }, "", url)` and update the `popstate` listener so browser Back/Forward transitions cleanly between `gateway`, `gadgets`, `store`, `swap-deals`, and `vehicles`.
- **Shared Single Database**:
  - Continue reading from the existing Firestore database (`ai-studio-militotechhome-ec091c07-11af-47e9-b66f-19af891062d3`) and existing `phoneProducts` / `vehicleProducts` memos without duplicating collections or altering Admin Dashboard data structures.
