"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { useState } from "react";

type Section =
  | "overview"
  | "balance"
  | "redeem"
  | "generate"
  | "purchases"
  | "templates"
  | "widgets"
  | "settings"
  | "users"
  | "developer";

const sections: { id: Section; label: string; badge?: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "balance", label: "Check Balance" },
  { id: "redeem", label: "Redeem Gift Vouchers" },
  { id: "generate", label: "Generate Gift Vouchers" },
  { id: "purchases", label: "View Purchases" },
  { id: "templates", label: "Templates", badge: "Admin" },
  { id: "widgets", label: "Widgets", badge: "Admin" },
  { id: "settings", label: "Settings", badge: "Admin" },
  { id: "users", label: "User Management", badge: "Admin" },
  { id: "developer", label: "Developer Guide", badge: "Technical" },
];

function Img({ alt }: { alt: string }) {
  return (
    <Box
      sx={{
        my: 2,
        p: 4,
        border: "2px dashed",
        borderColor: "divider",
        borderRadius: 2,
        textAlign: "center",
        color: "text.secondary",
        bgcolor: "action.hover",
      }}
    >
      <Typography variant="body2">📷 Screenshot: {alt}</Typography>
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="h4" sx={{ mt: 4, mb: 2 }}>
      {children}
    </Typography>
  );
}

function Sub({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
      {children}
    </Typography>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Typography variant="body1" sx={{ mb: 1.5 }}>
      {children}
    </Typography>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", gap: 1.5, mb: 1.5, alignItems: "baseline" }}>
      <Chip label={n} size="small" color="primary" sx={{ fontWeight: 700 }} />
      <Typography variant="body1">{children}</Typography>
    </Box>
  );
}

function OverviewSection() {
  return (
    <>
      <SectionTitle>Overview</SectionTitle>
      <P>
        This application manages the full lifecycle of gift vouchers — from
        creating templates and selling cards through your website, to redeeming
        them in-house and tracking every transaction.
      </P>
      <Sub>Role Permissions</Sub>
      <P>
        There are two staff-facing roles. Your permissions depend on which role
        your account has been assigned.
      </P>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Staff
        </Typography>
        <Typography variant="body2">
          Can check balances, redeem gift vouchers, generate complimentary
          cards, view all purchases, and access this documentation. Ideal for
          front-of-house team members.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Admin
        </Typography>
        <Typography variant="body2">
          Everything Staff can do, plus: create and edit templates, manage
          embeddable purchase widgets, configure system settings (currency,
          payment gateway, notifications), and manage user accounts.
        </Typography>
      </Paper>
      <Sub>Navigation</Sub>
      <P>
        The top navigation bar organises features into dropdown menus. Staff
        members see the Voucher Status and Manage menus. Admins additionally see
        the Admin menu.
      </P>
      <Img alt="Navigation bar showing Voucher Status, Manage, and Admin dropdown menus" />
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Voucher Status</Typography>
        <Typography variant="body2">
          Check Balance — available to everyone including customers. Redeem —
          staff and admin only.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Manage</Typography>
        <Typography variant="body2">
          Generate, Purchases (staff and admin). Templates, Widgets (admin
          only).
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Admin</Typography>
        <Typography variant="body2">Settings, Users (admin only).</Typography>
      </Paper>
      <Sub>QR Code Scanning</Sub>
      <P>
        Every gift voucher has a QR code. When scanned, it automatically routes
        the user to the appropriate page: staff and admin users are taken
        directly to the Redeem page with the code pre-filled; customers are
        taken to the Balance page.
      </P>
    </>
  );
}

function BalanceSection() {
  return (
    <>
      <SectionTitle>Check Balance</SectionTitle>
      <P>
        The Balance page is publicly accessible — customers can use it without
        logging in. Navigate to Voucher Status → Check Balance, or visit the
        /gift-cards/balance URL directly.
      </P>
      <Img alt="Balance lookup page with search field and results" />
      <Sub>Looking Up a Gift Voucher</Sub>
      <Step n={1}>
        Enter the gift voucher code (e.g. THW-XXXX-XXXX) or the
        purchaser/recipient email address into the search field.
      </Step>
      <Step n={2}>Press Enter or click Search.</Step>
      <Step n={3}>
        The result card shows the code, status badge, original amount, current
        balance, and purchase date.
      </Step>
      <Sub>Search by Email</Sub>
      <P>
        If an email address is entered instead of a code, the system returns all
        gift vouchers associated with that email. This is useful when a customer
        has lost their code but knows the email used at purchase.
      </P>
      <Sub>Auto-Lookup via URL</Sub>
      <P>
        Appending ?code=THW-XXXX-XXXX to the balance page URL will automatically
        search on page load. This is how QR codes work for customers — scanning
        the QR redirects them here with the code pre-filled.
      </P>
      <Sub>Status Badges</Sub>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip label="active" color="success" size="small" />
          <Typography variant="body2">
            Full balance available for use.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Chip label="partially redeemed" color="warning" size="small" />
          <Typography variant="body2">
            Some balance has been used; remainder is still available.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Chip label="fully redeemed" size="small" />
          <Typography variant="body2">Entire balance has been used.</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
          <Chip label="cancelled" color="error" size="small" />
          <Typography variant="body2">
            Card has been cancelled by an admin or staff member.
          </Typography>
        </Box>
      </Paper>
    </>
  );
}

function RedeemSection() {
  return (
    <>
      <SectionTitle>Redeem Gift Vouchers</SectionTitle>
      <P>
        Navigate to Voucher Status → Redeem. This page is available to Staff and
        Admin users.
      </P>
      <Img alt="Redeem page showing code lookup field and gift voucher details" />
      <Sub>Looking Up a Card</Sub>
      <Step n={1}>
        Enter the gift voucher code in the lookup field. You can type it
        manually or scan the QR code (which opens this page with the code
        pre-filled).
      </Step>
      <Step n={2}>Click Lookup or press Enter.</Step>
      <Step n={3}>
        The card details appear: code, status, original amount, current balance,
        and purchaser name.
      </Step>
      <Img alt="Gift card details panel showing code, status, amounts, and purchaser" />
      <Sub>Redemption Types</Sub>
      <P>
        The redemption behaviour depends on the template the gift voucher was
        created from:
      </P>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Single Use (Full Balance)</Typography>
        <Typography variant="body2">
          The entire balance is redeemed in one transaction. You will see a
          single &quot;Redeem&quot; button showing the full amount. There is no
          amount field — the full balance is always taken.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Partial Redemption</Typography>
        <Typography variant="body2">
          The balance can be used across multiple visits. An amount field
          appears where you enter how much to redeem this time. The remaining
          balance stays on the card for future use.
        </Typography>
      </Paper>
      <Sub>Performing a Redemption</Sub>
      <Step n={1}>
        After looking up the card, the redemption section appears below the card
        details (only if the card has a remaining balance and is not cancelled).
      </Step>
      <Step n={2}>
        For partial redemption cards: enter the amount to redeem. For single-use
        cards: the full amount is shown on the button.
      </Step>
      <Step n={3}>
        Optionally add notes (e.g. &quot;Table 5&quot;, &quot;Sunday
        lunch&quot;).
      </Step>
      <Step n={4}>Click the Redeem button.</Step>
      <Step n={5}>
        A success message confirms the amount redeemed and the remaining
        balance.
      </Step>
      <Img alt="Successful redemption showing confirmation message and updated balance" />
      <Sub>Redemption History</Sub>
      <P>
        Below the card details, a table shows every redemption made against this
        card: date, amount, remaining balance after that redemption, notes, and
        status.
      </P>
      <Img alt="Redemption history table with date, amount, remaining, notes, and undo button" />
      <Sub>Reversing a Redemption (Un-Redeem)</Sub>
      <P>
        If a redemption was made in error, you can reverse it. Each active
        (non-reversed) redemption row has an undo button (↩ icon).
      </P>
      <Step n={1}>
        Click the undo icon on the redemption you want to reverse.
      </Step>
      <Step n={2}>
        A confirmation dialog appears showing the amount that will be restored.
      </Step>
      <Step n={3}>
        Click Reverse to confirm. The balance is restored and the redemption row
        is marked as &quot;Reversed&quot; with a strikethrough.
      </Step>
      <Alert severity="warning" sx={{ my: 2 }}>
        Reversals are permanent and tracked in the audit trail. The reversed
        redemption remains visible in the history with a &quot;Reversed&quot;
        badge.
      </Alert>
    </>
  );
}

function GenerateSection() {
  return (
    <>
      <SectionTitle>Generate Gift Vouchers</SectionTitle>
      <P>
        Navigate to Manage → Generate. This creates a gift voucher without
        requiring a customer purchase — useful for complimentary gifts,
        promotions, or replacements.
      </P>
      <Img alt="Generate gift voucher form with template, amount, sender, and recipient fields" />
      <Sub>Creating a Complimentary Gift Voucher</Sub>
      <Step n={1}>
        Select a Template from the dropdown. Only active templates appear.
      </Step>
      <Step n={2}>
        Enter the Amount. Minimum is 1 in your configured currency.
      </Step>
      <Step n={3}>
        Enter the From (sender name) — this appears on the gift voucher and in
        emails. For house-generated cards, use your business name.
      </Step>
      <Step n={4}>
        Optionally enter a Recipient Name and Recipient Email. If an email is
        provided, the gift voucher PDF will be emailed to that address
        automatically.
      </Step>
      <Step n={5}>
        Optionally add a Personal Message — this appears on the gift voucher as
        an italicised quote.
      </Step>
      <Step n={6}>Click Generate Gift Voucher.</Step>
      <Step n={7}>
        A success message shows the generated code and confirms whether an email
        was sent.
      </Step>
      <Img alt="Success message showing generated gift voucher code" />
      <Alert severity="info" sx={{ my: 2 }}>
        Generated cards work identically to purchased cards. They appear in the
        Purchases list and can be redeemed, cancelled, and looked up the same
        way.
      </Alert>
    </>
  );
}

function PurchasesSection() {
  return (
    <>
      <SectionTitle>View Purchases</SectionTitle>
      <P>
        Navigate to Manage → Purchases. This page shows every gift voucher in
        the system — both customer purchases and staff-generated cards.
      </P>
      <Img alt="Purchases table showing code, amount, balance, purchaser, date, status columns" />
      <Sub>Desktop View</Sub>
      <P>
        On larger screens, purchases display in a sortable table with columns:
        Code, Amount, Balance, Purchaser (name and email), Date, Status, and
        action buttons.
      </P>
      <P>
        Click any column header (Code, Purchaser, Date) to sort. Click again to
        reverse the sort direction. The active sort column shows an arrow
        indicator.
      </P>
      <Sub>Mobile View</Sub>
      <P>
        On smaller screens, each gift voucher displays as a compact card with
        all the same information. A Sort By dropdown at the top lets you choose
        the sort field and direction.
      </P>
      <Img alt="Mobile card layout with sort dropdown" />
      <Sub>Actions</Sub>
      <P>Each gift voucher row has two action buttons:</P>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">View</Typography>
        <Typography variant="body2">
          Opens the public gift voucher view page showing the full card with
          template image, code overlay, QR code, amount, balance, and a Print
          button. This is the same page customers see.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Redeem</Typography>
        <Typography variant="body2">
          Navigates to the Redeem page with the code pre-filled, ready for
          immediate lookup.
        </Typography>
      </Paper>
      <Sub>Gift Voucher View Page</Sub>
      <P>
        The View page displays the gift voucher exactly as the customer receives
        it: the template image with the code and expiration overlaid in the
        configured position, the QR code in its configured position, the amount,
        balance, recipient name, and personal message.
      </P>
      <Img alt="Gift card view page with template image, code overlay, QR code, and details" />
      <P>
        The Print button at the top opens the browser print dialog with a
        print-optimised layout — only the gift voucher is printed, without
        navigation or other page elements.
      </P>
    </>
  );
}

function TemplatesSection() {
  return (
    <>
      <SectionTitle>Templates (Admin Only)</SectionTitle>
      <P>
        Navigate to Manage → Templates. Templates define the visual design and
        behaviour of gift vouchers. Every gift voucher is created from a
        template.
      </P>
      <Img alt="Templates list page showing template cards with image previews" />
      <Sub>Template List</Sub>
      <P>
        The templates page shows all templates as cards with the template image,
        name, active/inactive badge, and Edit/Delete buttons. Click Create
        Template to make a new one.
      </P>
      <Sub>Creating a Template</Sub>
      <Step n={1}>
        Click Create Template. Fill in the Template Name — this is an internal
        label (e.g. &quot;Holiday 2026&quot;, &quot;Standard&quot;).
      </Step>
      <Step n={2}>
        Toggle Active on or off. Only active templates appear in the Generate
        page dropdown and in widget/pay link template selectors.
      </Step>
      <Step n={3}>
        Choose the Redemption Type: Single Use (full balance redeemed at once)
        or Partial Redemption (balance can be used across multiple visits).
      </Step>
      <Step n={4}>
        Optionally set an Expiration Date. Leave empty for cards that never
        expire. Expired cards automatically have their balance set to zero when
        looked up.
      </Step>
      <Step n={5}>
        Set the Code Prefix (max 6 characters). Generated codes will look like
        PREFIX-XXXX-XXXX. For example, prefix &quot;THW&quot; produces codes
        like THW-A3F2-K9B1.
      </Step>
      <Step n={6}>Optionally add a Description for internal reference.</Step>
      <Step n={7}>
        Click Upload Template Image. This is the background image for the gift
        card. Recommended: landscape orientation, at least 800px wide.
      </Step>
      <Img alt="Template creation form with name, redemption type, expiration, and code prefix fields" />
      <Sub>Positioning the Code Overlay</Sub>
      <P>
        After uploading an image, the positioning tools appear. There are two
        elements to position: the Code Area and the QR Code.
      </P>
      <Step n={1}>
        Select Code Area mode using the toggle buttons at the top.
      </Step>
      <Step n={2}>
        Click and drag on the template image to draw a rectangle where the gift
        card code and expiration text will appear. A dashed teal box shows the
        selected area with a preview of the code text.
      </Step>
      <Step n={3}>Adjust Font Size using the slider (8–48px).</Step>
      <Step n={4}>
        Pick a Font Color using the colour picker. Choose a colour that
        contrasts well with your template image in that area.
      </Step>
      <Step n={5}>
        Set the Alignment (Left, Center, Right) to control how the code text
        sits within the selected area.
      </Step>
      <Img alt="Code positioning interface showing drag area on template image with font controls" />
      <Sub>Positioning the QR Code</Sub>
      <Step n={1}>Switch to QR Code mode using the toggle buttons.</Step>
      <Step n={2}>
        Click on the template image where you want the QR code to appear. A
        dashed orange square shows the placement.
      </Step>
      <Step n={3}>
        Adjust the QR Code Size slider (5–30% of image width). The QR code is
        always square.
      </Step>
      <Img alt="QR code positioning showing orange square overlay on template image" />
      <Sub>Updating an Existing Template</Sub>
      <P>
        Click Edit on any template card to modify it. You can change all fields
        including uploading a new image. The code and QR positions are preserved
        unless you reposition them.
      </P>
      <Alert severity="info" sx={{ my: 2 }}>
        Changing a template does not affect gift vouchers that have already been
        created from it. Existing cards retain the image and positions they were
        generated with. Only new cards will use the updated template.
      </Alert>
      <Sub>Replacing a Template Image</Sub>
      <Step n={1}>Edit the template.</Step>
      <Step n={2}>
        Click Upload Template Image and select the new image file.
      </Step>
      <Step n={3}>
        Reposition the code area and QR code on the new image — the old
        positions may not align correctly on a different image.
      </Step>
      <Step n={4}>Click Save.</Step>
      <Sub>Deleting a Template</Sub>
      <P>
        Click Delete on a template card. A confirmation dialog appears. Deleting
        a template does not delete gift vouchers that were created from it —
        those cards continue to work, but their view page may show a missing
        image.
      </P>
    </>
  );
}

function WidgetsSection() {
  return (
    <>
      <SectionTitle>Widgets (Admin Only)</SectionTitle>
      <P>
        Navigate to Manage → Widgets. Widgets are embeddable purchase forms that
        you place on your website so customers can buy gift vouchers directly.
      </P>
      <Img alt="Widgets list page showing widget cards with name, API key, and action buttons" />
      <Sub>Widget List</Sub>
      <P>
        Each widget card shows the name, active/inactive badge, a truncated API
        key, and the allowed domains. Action buttons: Edit, Demo &amp; Test,
        Embed Code, Delete.
      </P>
      <Sub>Creating a Widget</Sub>
      <Step n={1}>
        Click Create Widget. Enter a Widget Name (internal label).
      </Step>
      <Step n={2}>
        Select a Template — this determines which gift voucher design is used
        for purchases through this widget.
      </Step>
      <Step n={3}>
        Customise the widget appearance using the colour pickers: Primary Button
        Color, Secondary Button Color, Background Color, Text Color, Field Label
        Color, Field Text Color. A live preview updates as you change colours.
      </Step>
      <Step n={4}>
        Set the Button Text (default: &quot;Buy Gift Voucher&quot;) and
        optionally a Title Display and Header/Footer text.
      </Step>
      <Step n={5}>
        Set the Redirect URL — this is the page where the widget is embedded.
        After a Stripe payment, customers are redirected back to this URL.
      </Step>
      <Step n={6}>
        Enter Allowed Domains (one per line). Leave empty to allow embedding on
        any domain. For security, list only the domains where you will embed
        this widget.
      </Step>
      <Step n={7}>Toggle Active on/off and click Create Widget.</Step>
      <Img alt="Widget creation form with colour pickers and live preview" />
      <Sub>Embedding a Widget on Your Website</Sub>
      <Step n={1}>
        From the widgets list, click Embed Code on the widget you want to use.
      </Step>
      <Step n={2}>
        A dialog shows the HTML snippet. Click Copy to Clipboard.
      </Step>
      <Step n={3}>
        Paste the snippet into your website HTML where you want the purchase
        form to appear. The snippet includes a div container and a script tag
        that loads the widget.
      </Step>
      <Img alt="Embed code dialog showing HTML snippet with copy button" />
      <Sub>Testing a Widget</Sub>
      <P>
        Click Demo &amp; Test on any widget to open a standalone page that
        renders the widget in isolation. Use this to verify the appearance and
        test the purchase flow before embedding on your live site.
      </P>
      <Img alt="Widget demo page showing the embedded purchase form" />
    </>
  );
}

function SettingsSection() {
  return (
    <>
      <SectionTitle>Settings (Admin Only)</SectionTitle>
      <P>
        Navigate to Admin → Settings. This page controls system-wide
        configuration.
      </P>
      <Img alt="Settings page showing currency, redemption type, payment mode, and notification sections" />
      <Sub>Currency</Sub>
      <P>
        Choose between GBP (£), EUR (€), or USD ($). This affects the currency
        symbol displayed everywhere in the app and in emails. Date formats also
        adapt: DD/MM/YYYY for GBP/EUR, MM/DD/YYYY for USD.
      </P>
      <Sub>Default Redemption Type</Sub>
      <P>
        Sets the default for new templates. Individual templates can override
        this. Single Use means the full balance is redeemed at once. Partial
        allows multiple redemptions against the same card.
      </P>
      <Sub>Payment Mode</Sub>
      <P>
        Sandbox mode creates gift vouchers immediately without processing real
        payments — useful for testing. Production mode processes real payments
        through your chosen payment gateway.
      </P>
      <Img alt="Payment mode selector showing Sandbox and Production options" />
      <Sub>Payment Gateway (Production Mode)</Sub>
      <P>When in Production mode, choose your payment gateway:</P>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Stripe</Typography>
        <Typography variant="body2">
          Enter your Stripe Secret Key (starts with sk_live_ or sk_test_) and
          Stripe Webhook Secret (starts with whsec_). The webhook endpoint URL
          is displayed in the helper text — configure this in your Stripe
          dashboard under Developers → Webhooks.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Squarespace</Typography>
        <Typography variant="body2">
          For Squarespace integration, enter your API Key (generated in
          Squarespace under Settings → Advanced → Developer API Keys). Set the
          Polling Interval (30–300 seconds) — how often the system checks for
          new Squarespace orders.
        </Typography>
      </Paper>
      <Img alt="Squarespace gateway configuration with API key, polling interval, and pay links" />
      <Sub>Squarespace Pay Links</Sub>
      <P>
        Pay links connect Squarespace products to gift voucher templates. When a
        customer purchases a product on Squarespace whose name matches a pay
        link, the system automatically creates a gift voucher using the linked
        template.
      </P>
      <Step n={1}>Click Add Pay Link.</Step>
      <Step n={2}>
        Enter a Display Name (internal label), the exact Squarespace Product
        Name (must match exactly as it appears in Squarespace), and select a
        Gift Voucher Template.
      </Step>
      <Step n={3}>Click Add.</Step>
      <Alert severity="warning" sx={{ my: 2 }}>
        Each pay link product name must be unique and must not be a substring of
        another. For example, do not create both &quot;Gift Vouchers&quot; and
        &quot;Buy Gift Vouchers&quot;.
      </Alert>
      <Sub>Notification Email List</Sub>
      <P>
        Add email addresses that should receive a notification for every gift
        card purchase. These addresses are also BCC&apos;d on all purchase
        confirmation emails sent to customers. Type an email and click Add or
        press Enter. Click the × on any chip to remove it.
      </P>
      <Img alt="Notification email list with email chips and add field" />
      <Alert severity="info" sx={{ my: 2 }}>
        After saving settings, refresh the page to see currency changes take
        effect across the app.
      </Alert>
    </>
  );
}

function UsersSection() {
  return (
    <>
      <SectionTitle>User Management (Admin Only)</SectionTitle>
      <P>
        Navigate to Admin → Users. This page manages who can access the admin
        panel and what they can do.
      </P>
      <Img alt="Users list page with filter and user table" />
      <Sub>User Roles</Sub>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Admin (Role 1)</Typography>
        <Typography variant="body2">
          Full access to all features: templates, widgets, settings, users, plus
          everything staff can do.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">User (Role 2)</Typography>
        <Typography variant="body2">
          Standard user with no admin panel access. Can only use public pages
          (balance lookup, gift voucher view).
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Staff (Role 3)</Typography>
        <Typography variant="body2">
          Can check balances, redeem, generate, view purchases, and access
          documentation. Cannot manage templates, widgets, settings, or users.
        </Typography>
      </Paper>
      <Sub>Creating a User</Sub>
      <Step n={1}>Click the Create User button.</Step>
      <Step n={2}>Fill in email, password, first name, last name.</Step>
      <Step n={3}>Select the Role: Admin, User, or Staff.</Step>
      <Step n={4}>Click Save.</Step>
      <Img alt="Create user form with email, password, name, and role fields" />
      <Sub>Editing a User</Sub>
      <P>
        Click on any user in the list to edit their details. You can change
        their role, name, email, or reset their password.
      </P>
      <Sub>Filtering Users</Sub>
      <P>
        Use the role filter dropdown at the top of the users list to show only
        users of a specific role.
      </P>
    </>
  );
}

function DeveloperSection() {
  return (
    <>
      <SectionTitle>Developer Guide</SectionTitle>
      <Alert severity="info" sx={{ mb: 2 }}>
        This section is intended for developers who may need to maintain,
        extend, or troubleshoot the application.
      </Alert>

      <Sub>Architecture Overview</Sub>
      <P>
        The system consists of two separate applications that communicate via
        REST API:
      </P>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">
          Frontend — Next.js 15 (App Router)
        </Typography>
        <Typography variant="body2" component="div">
          React 19, TypeScript, Material UI, React Hook Form + Yup validation,
          React Query for data fetching, i18next for internationalisation,
          qrcode.react for QR code rendering. Runs under PM2 as
          &quot;hurstwood-gift-cards&quot;.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Backend — NestJS</Typography>
        <Typography variant="body2" component="div">
          TypeScript, MongoDB (via Mongoose), Passport JWT authentication,
          Handlebars email templates, Puppeteer for PDF/image generation,
          @nestjs/event-emitter for internal events. Runs under PM2 as
          &quot;hurstwood-gift-cards-server&quot;.
        </Typography>
      </Paper>

      <Sub>Project Structure</Sub>
      <Paper
        sx={{
          p: 2,
          mb: 2,
          fontFamily: "monospace",
          fontSize: 13,
          overflow: "auto",
        }}
      >
        <pre
          style={{ margin: 0 }}
        >{`/var/www/gift-cards/              # Frontend (Next.js)
├── src/
│   ├── app/[language]/
│   │   ├── admin-panel/          # Protected admin pages
│   │   │   └── gift-cards/
│   │   │       ├── docs/         # This documentation
│   │   │       ├── generate/     # Generate complimentary cards
│   │   │       ├── purchases/    # Purchase list
│   │   │       ├── redeem/       # Redemption console
│   │   │       ├── settings/     # System settings (admin)
│   │   │       ├── templates/    # Template CRUD (admin)
│   │   │       └── widgets/      # Widget CRUD (admin)
│   │   └── gift-cards/
│   │       ├── balance/          # Public balance lookup
│   │       ├── view/[code]/      # Public gift voucher view
│   │       └── qr/[code]/        # QR redirect handler
│   ├── components/
│   │   ├── app-bar.tsx           # Main navigation
│   │   └── widget-preview.tsx    # Widget live preview
│   └── services/
│       ├── api/                  # API client services & types
│       ├── auth/                 # Auth HOCs & hooks
│       ├── currency/             # CurrencyProvider context
│       └── i18n/                 # Translation files

/var/www/gift-cards-server/       # Backend (NestJS)
├── src/
│   ├── gift-cards/               # Core gift voucher module
│   │   ├── domain/               # GiftCard & Redemption entities
│   │   ├── dto/                  # Create, Redeem, Query DTOs
│   │   ├── infrastructure/       # MongoDB repository & schema
│   │   ├── utils/                # Code generation, PDF generation
│   │   ├── gift-cards.controller.ts
│   │   ├── gift-cards.service.ts
│   │   └── gift-cards.module.ts
│   ├── gift-card-templates/      # Template module (same pattern)
│   ├── widgets/                  # Widget module (same pattern)
│   ├── settings/                 # Singleton settings document
│   ├── squarespace/              # Squarespace order polling
│   ├── stripe/                   # Stripe checkout & webhooks
│   ├── mail/                     # Email service + HBS templates
│   ├── auth/                     # JWT auth, strategies
│   ├── users/                    # User CRUD
│   └── roles/                    # Role enum, guard, decorator`}</pre>
      </Paper>

      <Sub>Backend Module Pattern</Sub>
      <P>Each domain module follows the same layered pattern:</P>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Domain Layer</Typography>
        <Typography variant="body2">
          Plain TypeScript classes with Swagger decorators (e.g. gift-card.ts).
          No database dependencies. Defines the shape of the entity.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">DTO Layer</Typography>
        <Typography variant="body2">
          Data Transfer Objects for input validation using class-validator
          decorators. Separate DTOs for create, update, query, and redeem
          operations.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Infrastructure Layer</Typography>
        <Typography variant="body2">
          MongoDB schema (Mongoose), mapper (toDomain/toPersistence), and
          repository implementation. The repository extends an abstract base
          class so the persistence layer can be swapped.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Controller</Typography>
        <Typography variant="body2">
          REST endpoints with Swagger docs, auth guards, and role decorators.
          Delegates to the service layer.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Service</Typography>
        <Typography variant="body2">
          Business logic. Orchestrates repository calls, email sending, code
          generation, and validation.
        </Typography>
      </Paper>

      <Sub>Database</Sub>
      <P>
        MongoDB Atlas is used via Mongoose. Key collections (named after schema
        classes):
      </P>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" component="div">
          <strong>giftcardschemaclasses</strong> — Gift card documents with
          embedded redemptions array. Fields: code, templateId, widgetId,
          originalAmount, currentBalance, purchaseDate, purchaserEmail,
          purchaserName, recipientEmail, recipientName, status, redemptions[],
          notes, stripeSessionId, squarespaceOrderId.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" component="div">
          <strong>giftcardtemplateschemaclasses</strong> — Template documents.
          Fields: name, description, image (URL), codePosition (x, y, width,
          height, fontSize, fontColor, alignment), qrPosition (x, y, size),
          redemptionType, expirationDate, codePrefix, isActive, createdBy.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" component="div">
          <strong>settingsschemaclasses</strong> — Singleton settings document.
          Fields: currency, defaultRedemptionType, notificationEmails[],
          paymentMode, paymentGateway, stripeSecretKey, stripeWebhookSecret,
          squarespaceApiKey, squarespacePollingInterval, squarespacePayLinks[],
          squarespaceLastPollAt.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" component="div">
          <strong>widgetschemaclasses</strong> — Widget documents. Fields: name,
          templateId, apiKey, allowedDomains[], customization (colours, text),
          isActive, redirectUrl.
        </Typography>
      </Paper>

      <Sub>Authentication &amp; Authorisation</Sub>
      <P>
        JWT-based authentication via Passport. Tokens are issued at login and
        refreshed via a refresh token endpoint. Role-based access control uses a
        custom @Roles() decorator and RolesGuard that checks
        request.user.role.id against the allowed role IDs.
      </P>
      <Paper
        sx={{
          p: 2,
          mb: 2,
          fontFamily: "monospace",
          fontSize: 13,
          overflow: "auto",
        }}
      >
        <pre style={{ margin: 0 }}>{`// Protecting an endpoint:
@Roles(RoleEnum.admin, RoleEnum.staff)
@UseGuards(AuthGuard('jwt'), RolesGuard)

// Role enum values:
admin = 1, user = 2, staff = 3

// Frontend page guard:
export default withPageRequiredAuth(MyPage, {
  roles: [RoleEnum.ADMIN, RoleEnum.STAFF],
});`}</pre>
      </Paper>

      <Sub>Gift Voucher Lifecycle</Sub>
      <P>The complete flow from purchase to redemption:</P>
      <Step n={1}>
        Purchase triggered via: widget (Stripe checkout or sandbox), Squarespace
        order polling, or staff Generate page.
      </Step>
      <Step n={2}>
        GiftCardsService.purchase() generates a unique code using the
        template&apos;s prefix (e.g. THW-XXXX-XXXX), creates the database record
        with status &quot;active&quot;.
      </Step>
      <Step n={3}>
        MailService sends: purchase confirmation to purchaser (with PDF
        attachment), recipient email if different, and purchase notification to
        the notification email list.
      </Step>
      <Step n={4}>
        PDF is generated via Puppeteer — renders the template image with code
        overlay and QR code to a headless Chrome instance, exports as PDF.
      </Step>
      <Step n={5}>
        On redemption, the service checks: card exists, not fully
        redeemed/cancelled, not expired, amount does not exceed balance. Creates
        a Redemption entry with unique ID, updates balance and status.
      </Step>
      <Step n={6}>
        Un-redeem marks the redemption as reversed, restores the balance, and
        recalculates the status.
      </Step>

      <Sub>Squarespace Integration</Sub>
      <P>
        The SquarespaceService polls the Squarespace Commerce Orders API on a
        configurable interval. It uses the modifiedAfter/modifiedBefore
        parameters to fetch only new orders since the last poll.
      </P>
      <P>
        For each order line item, it matches the productName against configured
        pay links (exact match). Deduplication uses a composite key of
        orderId:lineItemId stored in the squarespaceOrderId field.
      </P>
      <P>
        The service listens for the &quot;settings.updated&quot; event (emitted
        when settings are saved) and automatically restarts polling with the new
        configuration. The updateLastPollAt() method deliberately does not emit
        this event to avoid a restart loop.
      </P>

      <Sub>Stripe Integration</Sub>
      <P>
        Widgets create a Stripe Checkout Session via the
        /gift-cards/create-checkout-session endpoint. Gift card metadata
        (template, amount, purchaser info) is stored in the session metadata.
      </P>
      <P>
        The /gift-cards/stripe-webhook endpoint receives
        checkout.session.completed events, extracts the metadata, and calls
        GiftCardsService.purchase() to create the gift voucher.
      </P>

      <Sub>Email System</Sub>
      <P>
        The MailService uses Handlebars templates in src/mail/mail-templates/:
      </P>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="body2" component="div">
          <strong>gift-card-purchase.hbs</strong> — Sent to the purchaser with
          the gift voucher PDF attached.
          <br />
          <strong>gift-card-recipient.hbs</strong> — Sent to the recipient (if
          different from purchaser) with the PDF.
          <br />
          <strong>gift-card-purchase-notification.hbs</strong> — Sent to the
          notification email list with purchase summary.
        </Typography>
      </Paper>
      <P>
        PDFs are generated using Puppeteer with headless Chrome. The
        generate-gift-card-pdf.ts utility renders an HTML page with the template
        image, code overlay, and QR code, then exports it as a PDF or PNG image.
      </P>

      <Sub>API Endpoints Reference</Sub>
      <Paper sx={{ p: 2, mb: 2, overflow: "auto" }}>
        <Typography variant="subtitle2" gutterBottom>
          Gift Vouchers (/api/v1/gift-cards)
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontFamily: "monospace", fontSize: 12 }}
        >
          POST&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Purchase
          (public/sandbox)
          <br />
          POST&nbsp;&nbsp;&nbsp;/create-checkout-session&nbsp;&nbsp;&nbsp;Create
          Stripe session
          <br />
          POST&nbsp;&nbsp;&nbsp;/stripe-webhook&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Stripe
          webhook handler
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List
          all (admin/staff, paginated)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          by ID (admin/staff)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/code/:code&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          by code (public)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/email/:email&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          by email (public)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/stripe-session/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          by Stripe session
          <br />
          POST&nbsp;&nbsp;&nbsp;/:id/redeem&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Redeem
          (admin/staff)
          <br />
          PATCH&nbsp;&nbsp;/:id/cancel&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Cancel
          (admin/staff)
          <br />
          POST&nbsp;&nbsp;&nbsp;/:id/unredeem&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Reverse
          redemption (admin/staff)
        </Typography>
      </Paper>
      <Paper sx={{ p: 2, mb: 2, overflow: "auto" }}>
        <Typography variant="subtitle2" gutterBottom>
          Templates (/api/v1/gift-card-templates)
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontFamily: "monospace", fontSize: 12 }}
        >
          POST&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Create
          (admin)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List
          all (admin, paginated)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/active&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List
          active (admin/staff)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          by ID (admin)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/public/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          by ID (public, limited fields)
          <br />
          PATCH&nbsp;&nbsp;/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Update
          (admin)
          <br />
          DELETE&nbsp;/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Delete
          (admin)
        </Typography>
      </Paper>
      <Paper sx={{ p: 2, mb: 2, overflow: "auto" }}>
        <Typography variant="subtitle2" gutterBottom>
          Widgets (/api/v1/widgets)
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontFamily: "monospace", fontSize: 12 }}
        >
          POST&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Create
          (admin)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;List
          all (admin, paginated)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          by ID (admin)
          <br />
          PATCH&nbsp;&nbsp;/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Update
          (admin)
          <br />
          DELETE&nbsp;/:id&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Delete
          (admin)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/public/:apiKey&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          widget config (public)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/loader/:apiKey/widget.js&nbsp;&nbsp;&nbsp;Widget
          JS loader (public)
        </Typography>
      </Paper>
      <Paper sx={{ p: 2, mb: 2, overflow: "auto" }}>
        <Typography variant="subtitle2" gutterBottom>
          Settings (/api/v1/settings)
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontFamily: "monospace", fontSize: 12 }}
        >
          GET&nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Get
          all settings (admin)
          <br />
          PATCH&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Update
          settings (admin)
          <br />
          GET&nbsp;&nbsp;&nbsp;&nbsp;/public/payment-config&nbsp;&nbsp;&nbsp;Get
          payment mode (public)
        </Typography>
      </Paper>

      <Sub>Environment Variables</Sub>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Frontend (.env.local)
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontFamily: "monospace", fontSize: 12 }}
        >
          NEXT_PUBLIC_API_URL — Backend API base URL (e.g.
          https://your-server.example.com/api)
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Backend (.env) — Key Variables
        </Typography>
        <Typography
          variant="body2"
          component="div"
          sx={{ fontFamily: "monospace", fontSize: 12 }}
        >
          DATABASE_URL — MongoDB connection string
          <br />
          FRONTEND_DOMAIN — Frontend URL for CORS and email links
          <br />
          BACKEND_DOMAIN — Backend URL for self-referencing
          <br />
          MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASSWORD — SMTP config
          <br />
          MAIL_DEFAULT_EMAIL — Sender address for emails
          <br />
          AUTH_JWT_SECRET, AUTH_JWT_TOKEN_EXPIRES_IN — JWT configuration
          <br />
          FILE_DRIVER — File upload driver (local or s3)
        </Typography>
      </Paper>

      <Sub>Build &amp; Deploy</Sub>
      <Paper
        sx={{
          p: 2,
          mb: 2,
          fontFamily: "monospace",
          fontSize: 13,
          overflow: "auto",
        }}
      >
        <pre style={{ margin: 0 }}>{`# Backend
cd /var/www/gift-cards-server
npx prettier --write "src/**/*.ts"
npm run build
pm2 restart hurstwood-gift-cards-server

# Frontend
cd /var/www/gift-cards
npx prettier --write "src/**/*.tsx"
npm run build
pm2 restart hurstwood-gift-cards

# Always run prettier before building.
# Always check build output for errors.
# Restart both services after changes.`}</pre>
      </Paper>

      <Sub>Adding a New Feature (Checklist)</Sub>
      <Step n={1}>
        Backend: Create domain class, DTO, schema, mapper, repository, service
        method, controller endpoint.
      </Step>
      <Step n={2}>
        Frontend: Add API type, API service function, page component with
        withPageRequiredAuth guard, page.tsx wrapper with metadata.
      </Step>
      <Step n={3}>
        Add navigation link in app-bar.tsx (check isAdmin/isStaff/isAdminOrStaff
        for visibility).
      </Step>
      <Step n={4}>
        Add translations to the relevant i18n JSON files in
        src/services/i18n/locales/en/.
      </Step>
      <Step n={5}>
        Run prettier, build both projects, restart both PM2 processes.
      </Step>

      <Sub>Troubleshooting</Sub>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">
          Gift cards not being created from Squarespace
        </Typography>
        <Typography variant="body2">
          Check PM2 logs: pm2 logs hurstwood-gift-cards-server --lines 50. Look
          for &quot;no pay link match&quot; warnings — the product name in
          Squarespace must exactly match the pay link configuration. Verify the
          API key is valid and the polling interval is reasonable.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">Emails not sending</Typography>
        <Typography variant="body2">
          Check SMTP configuration in the backend .env file. The mail service
          catches and logs errors silently to avoid blocking gift voucher
          creation. Check PM2 logs for mail-related errors.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">PDF generation failing</Typography>
        <Typography variant="body2">
          PDFs are generated using Puppeteer with headless Chrome at
          /usr/bin/google-chrome. Ensure Chrome is installed on the server.
          Check for out-of-memory errors in PM2 logs.
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle2">
          Build errors after code changes
        </Typography>
        <Typography variant="body2">
          Always run npx prettier --write on changed files before building. Read
          the full build output — TypeScript errors will be shown. Common
          issues: missing imports, type mismatches, unused variables.
        </Typography>
      </Paper>
    </>
  );
}

const sectionComponents: Record<Section, () => React.JSX.Element> = {
  overview: OverviewSection,
  balance: BalanceSection,
  redeem: RedeemSection,
  generate: GenerateSection,
  purchases: PurchasesSection,
  templates: TemplatesSection,
  widgets: WidgetsSection,
  settings: SettingsSection,
  users: UsersSection,
  developer: DeveloperSection,
};

function DocsPage() {
  const [active, setActive] = useState<Section>("overview");
  const ActiveSection = sectionComponents[active];

  return (
    <Container maxWidth="lg">
      <Grid container spacing={3} pt={3}>
        <Grid size={12}>
          <Typography variant="h4">Documentation</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete guide to using the gift voucher management system.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Paper variant="outlined" sx={{ position: "sticky", top: 16 }}>
            <List dense disablePadding>
              {sections.map((s) => (
                <ListItem key={s.id} disablePadding>
                  <ListItemButton
                    selected={active === s.id}
                    onClick={() => setActive(s.id)}
                  >
                    <ListItemText primary={s.label} />
                    {s.badge && (
                      <Chip
                        label={s.badge}
                        size="small"
                        variant="outlined"
                        sx={{ ml: 1, height: 20, fontSize: 11 }}
                      />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          <Paper sx={{ p: { xs: 2, md: 4 }, minHeight: 400 }}>
            <ActiveSection />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default withPageRequiredAuth(DocsPage, {
  roles: [RoleEnum.ADMIN, RoleEnum.STAFF],
});
