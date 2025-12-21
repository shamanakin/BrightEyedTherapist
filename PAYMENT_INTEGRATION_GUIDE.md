# Payment Integration Guide

This prototype uses a mock payment system (`auth.js` and `subscribe.html`) for demonstration purposes. To accept real payments, you will need to integrate a payment processor like Stripe or PayPal.

## 1. Stripe Integration (Recommended)

Stripe is the industry standard for subscription billing.

### Steps:
1.  **Create a Stripe Account:** Go to [stripe.com](https://stripe.com) and sign up.
2.  **Get API Keys:** In the Stripe Dashboard, get your "Publishable Key" and "Secret Key".
3.  **Frontend (Client-side):**
    *   Include Stripe.js in `subscribe.html`.
    *   Replace the mock form with Stripe Elements (a pre-built, secure UI component).
    *   When the user clicks "Pay", Stripe.js tokenizes the card details securely.
4.  **Backend (Server-side):**
    *   *Note: You will need a backend server (Node.js, Python, etc.) or serverless functions (Netlify/Vercel) to process the payment securely. Static HTML cannot process payments alone.*
    *   Create an endpoint (e.g., `/create-subscription`) that receives the token from the frontend.
    *   Use the Stripe API to create a Customer and a Subscription for that customer using the token.
    *   On success, return a status to the frontend.

## 2. PayPal Integration

1.  **Create a Business Account:** Go to [paypal.com](https://paypal.com).
2.  **Generate Buttons:** Use the PayPal Subscription Button generator to create a "Subscribe" button HTML snippet.
3.  **Embed:** Paste the generated HTML into `subscribe.html`.
4.  **Webhooks:** Configure PayPal IPN (Instant Payment Notification) to notify your backend when a payment is made so you can update the user's status in your database.

## 3. Database Integration

Currently, user data is stored in `localStorage` (`auth.js`). This is only for the demo.
*   You need a real database (Firebase, Supabase, MongoDB, SQL) to store user accounts, trial start dates, and subscription statuses.
*   `auth.js` should be replaced with API calls to your authentication service (e.g., Firebase Auth).

## 4. Email Integration

*   Use a transactional email service like **SendGrid**, **Mailgun**, or **Postmark**.
*   Set up a cron job (scheduled task) on your server to check daily for users whose trial expires in X days and trigger the API to send the reminder email.





