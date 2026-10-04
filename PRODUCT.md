# Product

## Register

product

## Users

CCCJB Connect serves Calvary Community Church Johor Bahru serving teams, from teenagers to older adults. Members primarily use a phone PWA at 320–430 CSS pixels, often just before service, standing, multitasking, or in dim light. Selena, Diana, David, and other church members will test real weekly arrangements and last-minute changes.

## Product Purpose

Help each member immediately understand their next serving date, preparation time, service time, venue, role, and practical notes. Help coordinators deliberately change arrangements, review possible conflicts, and prepare accurate WhatsApp updates naming affected people and roles.

The current implementation uses React, TypeScript, Vite, Tailwind, Lucide, React Context, and browser LocalStorage. Preserve existing data and business behavior. No Supabase, authentication, backend infrastructure, AI assistant, or unnecessary dependencies belong in this redesign.

## Brand Personality

Calm, warm, trustworthy, respectful, contemporary church community. A serving companion with direct and considerate language. Chinese first, with English interface support.

Retain the supplied cross/building logo in `public/logo.png` and `public/logo-white.png`. The files contain navy #0F172A and white line art on transparency. No replacement logo or unrelated worship stock imagery.

## Anti-references

Generic SaaS dashboards, purple gradients, neon glows, decorative glass panels, dense card grids, tiny text, excessive animation, and emoji used as interface icons.

## Design Principles

1. Put the next practical serving action before greetings, installation prompts, or release notes.
2. Make notes and possible conflicts readable on touch screens, without hover or hidden gestures.
3. Make member and coordinator states explicit; preview and confirm schedule-changing actions.
4. Preserve existing local information and show truthful save, failure, change, and sharing states.
5. Keep patterns consistent across ages, Chinese and English, light and dark modes.

## Accessibility & Inclusion

At least 44×44px touch targets, comfortable high-contrast text, browser zoom, clear Chinese line breaks, wrapping for long names, semantic controls, keyboard and screen reader support, safe areas, dynamic viewport height, and reduced-motion behavior. Main workflows must not depend on swipes, hover, or decorative motion.

## Beta Boundaries

Local editor mode prevents accidental editing; it does not verify authorisation or identity. LocalStorage and read badges do not synchronise across devices. Current conflict detection finds multiple assignments on one date, not verified overlapping time intervals. Some service time strings represent multiple sessions; do not infer a member's precise session from them.

The repository has installation metadata but no service-worker registration; offline cold start must not be presented as verified. New change records can record subsequent local edits, but cannot reconstruct historical authors.

## Current Design Status

The user requires an audit and two design directions, followed by approval before implementation. The proposed direction and detailed scope remain pending in `docs/redesign-audit/2026-10-04-audit-and-proposal.md`. This file records the supplied brief and verified repository context, not approval of a design.
