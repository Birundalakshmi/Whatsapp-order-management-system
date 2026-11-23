# MIRA — Merchant Intelligent and Retail Assistant
### Production-Quality SaaS Frontend for AI-Powered Conversational Order Management

MIRA helps small businesses—particularly home bakeries and artisanal confectioners—manage customer orders through WhatsApp using a coordinated multi-agent AI system.

---

## 🌟 Key Capabilities & Completed Screens

### 1. **Overview Dashboard**
- **Three Core Questions Answered Instantly**:
  1. *What needs my attention?* (High-priority payment verification, unusual custom cake request, urgent cancellations)
  2. *What is happening with my orders?* (Live orders in preparation, kitchen deadlines, upcoming pickup slots)
  3. *How is my business performing?* (Confirmed daily revenue excluding unverified tokens, order volume vs. yesterday)
- **KPI Metrics Cards**: Orders Today (+14.2%), In Kitchen / Pending, Confirmed Revenue, Awaiting Human Approval.
- **Attention Required Queue**: Direct action links to Approval Center, Customization reviews, and Payment audits.
- **Interactive Order Trends**: Clean SVG bar chart with 7-day, 14-day, and 30-day views with breakdown tooltips.
- **Agent Fleet Activity Summary**: Real-time non-confidential telemetry from orchestrator and sub-agents.
- **Upcoming Deliveries & Pickups**: Clear deadlines, delivery addresses, and handover slots.

### 2. **Orders Management Page**
- **Full-featured Search & Filtering**: Filter by order ID, customer name, phone number, order status (`New`, `Confirmed`, `Preparing`, `Ready`, `Completed`, `Cancelled`), payment status, and sort by date/value.
- **Comprehensive Table View**: Responsive table with status pills, WhatsApp origin badges, and quick transition buttons.
- **Slide-Over Detail Drawer**:
  - Full product breakdown with custom piping notes and pricing.
  - Complete order activity timeline (`Customer Placed` ➔ `AI Payment Verified` ➔ `Bakery Confirmed` ➔ `In Kitchen Prep` ➔ `Ready`).
  - Action transitions: Confirm Order, Move to Kitchen Bake, Mark Ready, Complete, or Cancel.
  - Safe confirmation modal with mandatory cancellation rationale.

### 3. **WhatsApp Inbox (3-Panel Customer Support Experience)**
- **Left Panel**: Searchable conversation list, unread badges, customer avatars, status tags (`Active`, `VIP`, `Eggless`, `Resolved`).
- **Center Panel**:
  - WhatsApp-inspired conversation thread with customer, merchant, and AI agent bubbles.
  - Message delivery & read indicators (`CheckCheck`).
  - Embedded rich cards for quoted orders and custom cake inquiries.
  - Interactive image attachments preview modal for payment slips and reference photos.
  - Quick-reply template buttons (`Confirm Slot`, `Request Receipt`, `Ready for Pickup`).
  - Real-time message composer connected to live API (with local fallback).
  - Conversation status toggles (Resolve / Reopen).
- **Right Panel**:
  - Customer profile, total orders count, lifetime spend.
  - Active order snapshot and payment status.
  - Dietary restrictions & allergy warnings (e.g. strict eggless, low sugar, celiac warnings).
  - Editable internal bakery notes.

### 4. **Customization Requests**
- **Cake Specification Inspector**: Reviews requested cake designs, tiers (e.g. 2-tier 6"+8", 3-tier gold leaf), flavors, and custom piping messages.
- **AI Feasibility Engine**: Displays feasibility confidence score, estimated kitchen prep hours, suggested surcharge fee, and AI reasoning.
- **Human Review Actions**: Approve, Reject (with reason), Request More Info, or Escalate to Executive Chef with audit logging.

### 5. **Payment Verification Page**
- **Strict Verification Protocol**: Displays expected vs. claimed amounts, payment method (UPI, Bank Transfer, Card), and UTR reference number.
- **OCR AI Extraction**: Flags amount discrepancies, duplicate references, or fuzzy screenshots.
- **Secure Screenshot Modal**: Full-resolution preview of payment receipts.
- **Owner Sign-off**: Requires conscious merchant confirmation before marking payments verified.

### 6. **Approval Center**
- **Central Human Escalation Queue**: Categories include *Payment mismatch*, *Unusual customization*, *High-value orders*, and *Medical allergen risks*.
- **Urgency Tags**: High, Medium, Low urgency with waiting time counters.
- **Detailed Evidence & Audit Trail**: Full history of decisions, recommendations, and merchant notes.

### 7. **AI Agents & Orchestrator Fleet**
- **Visual StateGraph Topology**: Interactive diagram showing message ingestion from WhatsApp into the central MIRA Orchestrator and dispatch to specialized sub-agents.
- **7 Specialized Agents**:
  1. *Conversation Agent* — Customer dialogue, friendly tone, FAQs.
  2. *Order Agent* — Product extraction, cart computation, catalog matching.
  3. *Customization Agent* — Cake design feasibility, kitchen prep hours estimation.
  4. *Memory Agent* — Recall of past orders, dietary preferences, VIP tags.
  5. *Payment Agent* — Receipt OCR parsing, UTR reference auditing.
  6. *Approval Agent* — Safety threshold evaluation and human escalation.
  7. *Analytics Agent* — Demand forecasting and business intelligence.
- **Live Diagnostics & Traces**: Latency metrics, tool calls (`IntentRouter`, `ReceiptOCRScanner`, `AllergenMatrix`), and clean outcome summaries.

### 8. **Analytics Page**
- **Honest Financial Metrics**: Strictly distinguishes total order pipeline value from confirmed revenue.
- **Charts & Breakdowns**:
  - Daily revenue and order trend bar charts.
  - Order status distribution donut chart.
  - Payment verification outcome distribution.
  - Best-selling bakery creations ranked by revenue.

### 9. **Customer Directory**
- **Profiles & Spend Records**: Directory with search, contact details, total orders, lifetime spend, and dietary preferences.
- **Slide-Over Profile Drawer**: Complete past order history and one-click WhatsApp chat launch.

### 10. **Settings & Kitchen Configuration**
- **Tabs**:
  - *Business Profile*: Bakery name, tagline, owner, phone, email, address, base currency, minimum lead time.
  - *Kitchen Hours*: Daily open/close schedules and holiday closures.
  - *Product Catalog*: Items, categories, eggless flags, pricing, and live in-stock toggles.
  - *Delivery & Pickup*: Delivery zone rates (0-5 km, 5-15 km) and counter pickup settings.
  - *WhatsApp API*: Meta Cloud API and Twilio webhook connection status.
  - *AI Safeguards*: Configurable rules (e.g. threshold for high-value orders, payment discrepancy auto-flag).
  - *Security*: Owner authentication details, privacy guarantees.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom SaaS theme (deep indigo, soft lavender, clean light surfaces, 8px grid system)
- **Icons**: Lucide React
- **Charts**: Custom lightweight, responsive SVG charts (`BarTrendChart`, `DonutChart`, `MiniSparkline`)
- **Backend**: FastAPI with Uvicorn (Companion service with OpenAPI docs at `/docs`)

---

## 🚀 Running the Project

### 1. Run the Frontend (Vite)

```powershell
# Set Node in PATH if not already in global PATH:
$env:PATH = "C:\Users\hp\AppData\Local\Programs\nodejs;$env:PATH"

# Install dependencies (already installed)
npm install

# Start Vite development server
npm run dev
```

The application runs at **`http://localhost:5173`**.

The frontend is completely self-contained with a full in-memory bakery data store (`mockData.ts` and `apiClient.ts`). All actions—confirming orders, sending WhatsApp messages, reviewing custom cakes, verifying payments, and approving escalations—are fully functional and interactive directly in the browser without requiring any external backend server.

---

## 🔒 Security & Privacy Practices

- **Zero Secret Exposure**: No private API keys, Supabase service-role tokens, or webhook secrets exist in frontend source code.
- **Confirmed Financial Verification**: The interface strictly reserves payment verification to the authorized merchant and never assumes money was received based solely on an AI confidence score.
#   W h a t s a p p - o r d e r - m a n a g e m e n t - s y s t e m  
 