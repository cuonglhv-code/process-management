import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServiceClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const existing = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Profile not found. Sign up first via /login." }, { status: 400 });
  }

  if (existing.role !== "admin") {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const alreadySeeded = await prisma.process.findFirst({
    where: { title: "B2S Request Review" },
  });

  if (alreadySeeded) {
    return NextResponse.json({ message: "B2S process already exists, skipping." });
  }

  const process = await prisma.process.create({
    data: {
      title: "B2S Request Review",
      category: "Sales",
      description:
        "End-to-end approval workflow for Business-to-School and corporate programme requests — from intake through academic and financial review to CEO approval, client quotation, and deployment.",
      tags: ["b2s", "corporate", "sales", "approval"],
      ownerId: user.id,
      published: true,
    },
  });

  const stepData = [
    { order: 1, type: "terminal" as const, label: "Sales request received", position: { x: 240, y: 0 }, responsibleRole: "Sales", helpText: "Submit the request to the B2S Coordinator via the standard channel. Include client name, programme type, and indicative timeline." },
    { order: 2, type: "decision" as const, label: "Tier?", position: { x: 240, y: 100 }, responsibleRole: "B2S Coordinator", helpText: "Check the request against the Product Tree. Tier 1 = standard product, deploy immediately. Tier 2/3 = requires Custom Request Form." },
    { order: 3, type: "action" as const, label: "Custom Request Form issued", position: { x: 240, y: 230 }, responsibleRole: "B2S Coordinator", helpText: "Download the CRF (linked below). Sales must complete all required fields and return it before academic review begins." },
    { order: 4, type: "action" as const, label: "Man-day estimation", position: { x: 240, y: 360 }, responsibleRole: "Academic Lead (HCT/HET)", helpText: "Use the Man-day Estimation Tool to estimate staff hours, test design time, marking load, and LMS setup. SLA: 3–5 business days." },
    { order: 5, type: "decision" as const, label: "Reusable?", position: { x: 240, y: 490 }, responsibleRole: "Academic Lead", helpText: "Will the materials be reusable? If no, raise a Red Flag." },
    { order: 6, type: "annotation" as const, label: "Red flag", position: { x: 440, y: 490 }, responsibleRole: "Academic Lead", helpText: "Mark this contract as Red Flag. It will be escalated to CEO at Stage 4 regardless of tier." },
    { order: 7, type: "action" as const, label: "Full cost modelling", position: { x: 240, y: 620 }, responsibleRole: "Finance Role", helpText: "Open the Full Cost Model. Enter all direct and hidden costs, calculate gross margin. SLA: 3–5 business days." },
    { order: 8, type: "decision" as const, label: "Margin?", position: { x: 240, y: 750 }, responsibleRole: "Finance Role", helpText: "Does the gross margin meet the minimum threshold (default 20%)?" },
    { order: 9, type: "terminal" as const, label: "Reject", position: { x: 440, y: 750 }, responsibleRole: "Finance Role", helpText: "Issue a written Rejection Notice to Sales within 1 business day." },
    { order: 10, type: "decision" as const, label: "Tier 3?", position: { x: 240, y: 880 }, responsibleRole: "B2S Coordinator", helpText: "Is this Tier 3, Red Flag, or loss-leader? If yes, mandatory CEO review." },
    { order: 11, type: "action" as const, label: "CEO / BoD approval", position: { x: 440, y: 880 }, responsibleRole: "CEO", helpText: "CEO receives completed CRF, feasibility verdict, P&L decision, one-page summary." },
    { order: 12, type: "terminal" as const, label: "Decline", position: { x: 440, y: 1010 }, responsibleRole: "CEO", helpText: "CEO issues a written Decline." },
    { order: 13, type: "action" as const, label: "Generate & send quote", position: { x: 240, y: 1010 }, responsibleRole: "B2S Coordinator + Finance", helpText: "Use the Client Quote template." },
    { order: 14, type: "decision" as const, label: "Client response?", position: { x: 240, y: 1140 }, responsibleRole: "Client", helpText: "Three possible outcomes: Accept, Negotiate, Major changes." },
    { order: 15, type: "terminal" as const, label: "Quote accepted", position: { x: 40, y: 1270 }, responsibleRole: "B2S Coordinator", helpText: "Log acceptance. Trigger deployment handoff." },
    { order: 16, type: "terminal" as const, label: "Deploy — Tier 1", position: { x: 40, y: 230 }, responsibleRole: "B2S Coordinator", helpText: "Standard product confirmed. Proceed directly to deployment brief." },
    { order: 17, type: "terminal" as const, label: "Academic team commences delivery", position: { x: 40, y: 1400 }, responsibleRole: "Academic Lead", helpText: "Issue Deployment Brief. Assign teachers, initiate materials production." },
  ];

  const steps = [];
  for (const s of stepData) {
    const step = await prisma.step.create({
      data: {
        processId: process.id,
        type: s.type,
        label: s.label,
        position: s.position,
        responsibleRole: s.responsibleRole,
        helpText: s.helpText,
        order: s.order,
      },
    });
    steps.push(step);
  }

  const edgeData = [
    { sourceIdx: 0, targetIdx: 1, label: null, style: "solid" as const },
    { sourceIdx: 0, targetIdx: 15, label: "Tier 1", style: "solid" as const },
    { sourceIdx: 1, targetIdx: 2, label: "Tier 2/3", style: "solid" as const },
    { sourceIdx: 2, targetIdx: 3, label: null, style: "solid" as const },
    { sourceIdx: 3, targetIdx: 4, label: null, style: "solid" as const },
    { sourceIdx: 4, targetIdx: 5, label: "No", style: "dashed" as const },
    { sourceIdx: 4, targetIdx: 6, label: "Yes", style: "solid" as const },
    { sourceIdx: 5, targetIdx: 6, label: null, style: "dashed" as const },
    { sourceIdx: 6, targetIdx: 7, label: null, style: "solid" as const },
    { sourceIdx: 7, targetIdx: 8, label: "Negative", style: "solid" as const },
    { sourceIdx: 7, targetIdx: 9, label: "Viable", style: "solid" as const },
    { sourceIdx: 9, targetIdx: 12, label: "No", style: "solid" as const },
    { sourceIdx: 9, targetIdx: 10, label: "Yes", style: "solid" as const },
    { sourceIdx: 10, targetIdx: 11, label: "Declined", style: "solid" as const },
    { sourceIdx: 10, targetIdx: 12, label: "Approved", style: "solid" as const },
    { sourceIdx: 12, targetIdx: 13, label: null, style: "solid" as const },
    { sourceIdx: 13, targetIdx: 12, label: "Negotiate", style: "dashed" as const },
    { sourceIdx: 13, targetIdx: 0, label: "Major changes", style: "dashed" as const },
    { sourceIdx: 13, targetIdx: 14, label: "Accept", style: "solid" as const },
    { sourceIdx: 14, targetIdx: 16, label: null, style: "solid" as const },
    { sourceIdx: 15, targetIdx: 16, label: null, style: "solid" as const },
  ];

  for (const e of edgeData) {
    await prisma.stepEdge.create({
      data: {
        sourceId: steps[e.sourceIdx].id,
        targetId: steps[e.targetIdx].id,
        label: e.label,
        style: e.style,
      },
    });
  }

  const formData = [
    { stepIdx: 2, label: "Custom Request Form (Excel)", url: "/forms/B2S_01_Custom_Request_Form.xlsx", type: "download" as const },
    { stepIdx: 3, label: "Man-day Estimation Tool (Excel)", url: "/forms/B2S_02_Manday_Estimation.xlsx", type: "download" as const },
    { stepIdx: 6, label: "Full Cost Model (Excel)", url: "/forms/B2S_03_Full_Cost_Model.xlsx", type: "download" as const },
    { stepIdx: 10, label: "Approval Form (Excel)", url: "/forms/B2S_04_Approval_Form.xlsx", type: "download" as const },
    { stepIdx: 12, label: "Client Quote Template (Excel)", url: "/forms/B2S_05_Client_Quote.xlsx", type: "download" as const },
  ];

  for (const f of formData) {
    await prisma.form.create({
      data: {
        stepId: steps[f.stepIdx].id,
        label: f.label,
        url: f.url,
        type: f.type,
      },
    });
  }

  return NextResponse.json({
    message: "B2S Request Review process seeded successfully!",
    steps: steps.length,
    edges: edgeData.length,
    forms: formData.length,
  });
}
