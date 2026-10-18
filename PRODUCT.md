# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing application: React, TypeScript, Vite, and React Router.

## Users

The prototype serves catering customers and Pearl Island restaurant staff. Customers assemble catering requests; staff review requests, handle exceptions, and approve or revise proposals. The product is customer-led, with staff approval as an equally important part of the demonstrated workflow.

## Product Purpose

Pearl Island2GO is an interactive prototype for validating a guided catering request and staff approval workflow with Pearl Island. It helps a customer describe an event, build a proposed menu and supplies order, review an estimate, and submit a request for staff review. Staff can inspect the request, revise it, and simulate approval. The current goal is to learn from stakeholder feedback; this prototype is not ready for deployment or restaurant operations.

## Positioning

The prototype explores a connected customer-to-staff catering workflow for Pearl Island. A future product might connect catering requests with Pearl Island's website, Google Calendar, and other tools, and might replace or reduce reliance on Spoonfed. These are possibilities to validate, not current capabilities or commitments.

## Operating Context

The current demo is a browser-based, single-device prototype for walkthroughs and validation. Customers move through event details, menu selection, supplies, final details, and request review. Staff use a simulated view to review the submitted request, its flags, and proposed changes. Sample scenarios make walkthroughs repeatable. The app has no accounts or access control, and customer and staff views use the same local demo state.

## Capabilities and Constraints

- Current prototype behavior includes guided event intake, menu browsing and selection, quantity and estimate updates, optional rule-based recommendations, request review and local simulated submission, a minimal staff review and revision flow, customer approval of revisions, and a simulated handoff summary.
- Requests, messages, revisions, approvals, and acceptance are demo state stored in the browser on one device. Nothing is sent to Pearl Island or a customer. There are no live orders, payments, notifications, AI service, calendar writes, website connection, or other external integrations.
- The menu, prices, serving sizes, dietary tags, portions, recommendations, and exception rules are provisional. Some menu information was observed on Spoonfed; Pearl Island has not confirmed it. Dietary tags are not allergy or nutrition guarantees. Keep these qualifications in the internal product record and do not present provisional status as customer-facing copy; keep the walkthrough realistic while never implying an integration or transaction is live.
- Future possibilities, pending validation: embed or connect the request journey with Pearl Island's website; connect approved catering requests to Google Calendar; connect other tools; and evaluate whether the product should complement, reduce reliance on, or replace Spoonfed. Do not describe these as existing functionality.
- This is a validation prototype, not a production system. Do not claim deployment readiness, confirmed estimates, automatic acceptance, operational time savings, or verified business outcomes.

## Brand Commitments

Preserve Pearl Island's identity and use the approved Pearl Island brand references and assets in `docs/branding/pearl-island/`. The current prototype represents Pearl Island2GO catering.

## Evidence on Hand

- Project requirements, workflow assumptions, and questions for stakeholder validation are documented in `Pearl_Island2GO_Catering_PRD.md`, `SOBER_MEETING_QUESTIONS.md`, and related project research notes.
- The app contains an illustrative menu and repeatable sample scenarios. Menu details were observed from Spoonfed but remain unconfirmed by Pearl Island; sample customer and event details are invented for demonstration.
- Approved brand references and implementation notes are in `docs/branding/pearl-island/`.
- No verified customer testimonials, measured outcomes, confirmed operating rules, or live integration evidence is established for this prototype. Do not invent them.

## Product Principles

- Make it possible for a catering customer to assemble a request without getting stuck.
- Give staff clear context and control over review, revisions, and approval.
- Keep customer proposals and staff decisions connected through one consistent request record.
- Treat unverified menu and operating data as hypotheses; validate them with Pearl Island before production use.
- Distinguish prototype behavior from future integrations and real transactions.

## Accessibility & Inclusion

The customer journey must work on mobile devices and support keyboard-accessible forms and controls. Do not represent dietary tags as allergy-safety assurances.
