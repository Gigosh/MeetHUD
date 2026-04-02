import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const ALLOWED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.deleted",
]);

/**
 * POST /api/stripe/webhook
 *
 * Handles Stripe webhook events for billing/subscription management.
 * - Verifies Stripe signature (reject if invalid)
 * - Idempotency via processed_webhook_events table
 * - Only processes allowlisted events
 * - Restricted to billing/subscription mutations only
 */
export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe-Signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  // Idempotency: skip if already processed
  const { data: existing } = await supabaseAdmin
    .from("processed_webhook_events")
    .select("id")
    .eq("event_id", event.id)
    .single();

  if (existing) {
    return NextResponse.json({ received: true, status: "already_processed" });
  }

  // Event allowlist
  if (!ALLOWED_EVENTS.has(event.type)) {
    // Acknowledge unhandled but allowed event types
    return NextResponse.json({ received: true, status: "event_type_not_handled" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Event processing failed: ${message}` }, { status: 500 });
  }

  // Record processed event
  await supabaseAdmin.from("processed_webhook_events").insert({ event_id: event.id });

  return NextResponse.json({ received: true, status: "processed" });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const teamId = session.metadata?.team_id;
  const stripeSubscriptionId = session.subscription as string;

  if (!teamId || !stripeSubscriptionId) {
    throw new Error("Missing team_id or subscription_id in checkout session metadata");
  }

  // Activate team subscription
  await supabaseAdmin
    .from("subscriptions")
    .upsert(
      {
        team_id: teamId,
        stripe_subscription_id: stripeSubscriptionId,
        status: "active",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "team_id",
      }
    );
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const stripeSubscriptionId = subscription.id;

  // Deactivate subscription
  await supabaseAdmin
    .from("subscriptions")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", stripeSubscriptionId);
}
