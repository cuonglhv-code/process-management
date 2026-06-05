import { PrismaClient, Role, StepType, EdgeStyle, FormType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "admin@jaxtina.com";
  const existingAdmin = await prisma.profile.findUnique({
    where: { email: adminEmail },
  });

  let adminId: string;
  if (existingAdmin) {
    adminId = existingAdmin.id;
  } else {
    adminId = crypto.randomUUID();
    await prisma.profile.create({
      data: {
        id: adminId,
        email: adminEmail,
        name: "Admin",
        role: "admin",
      },
    });
    console.log(`Created admin profile: ${adminEmail}`);
  }

  const existingB2S = await prisma.process.findFirst({
    where: { title: "B2S Request Review" },
  });

  if (existingB2S) {
    console.log("B2S process already exists, skipping seed.");
    return;
  }

  const process = await prisma.process.create({
    data: {
      title: "B2S Request Review",
      category: "Sales",
      description:
        "End-to-end approval workflow for Business-to-School and corporate programme requests — from intake through academic and financial review to CEO approval, client quotation, and deployment.",
      tags: ["b2s", "corporate", "sales", "approval"],
      ownerId: adminId,
      published: true,
    },
  });

  const stepData = [
    {
      order: 1,
      type: "terminal" as StepType,
      label: "Sales request received",
      position: { x: 240, y: 0 },
      responsibleRole: "Sales",
      helpText:
        "Submit the request to the B2S Coordinator via the standard channel. Include client name, programme type, and indicative timeline.",
    },
    {
      order: 2,
      type: "decision" as StepType,
      label: "Tier?",
      position: { x: 240, y: 100 },
      responsibleRole: "B2S Coordinator",
      helpText:
        "Check the request against the Product Tree. Tier 1 = standard product, deploy immediately. Tier 2/3 = requires Custom Request Form.",
    },
    {
      order: 3,
      type: "action" as StepType,
      label: "Custom Request Form issued",
      position: { x: 240, y: 230 },
      responsibleRole: "B2S Coordinator",
      helpText:
        "Download the CRF (linked below). Sales must complete all required fields and return it before academic review begins. Incomplete forms are returned without review.",
    },
    {
      order: 4,
      type: "action" as StepType,
      label: "Man-day estimation",
      position: { x: 240, y: 360 },
      responsibleRole: "Academic Lead (HCT/HET)",
      helpText:
        "Use the Man-day Estimation Tool to estimate staff hours, test design time, marking load, and LMS setup. Complete the feasibility verdict section. SLA: 3–5 business days.",
    },
    {
      order: 5,
      type: "decision" as StepType,
      label: "Reusable?",
      position: { x: 240, y: 490 },
      responsibleRole: "Academic Lead",
      helpText:
        "Ask: will the materials created for this contract be reusable for future clients or internal programmes? If no, raise a Red Flag in the estimation tool before proceeding.",
    },
    {
      order: 6,
      type: "annotation" as StepType,
      label: "Red flag",
      position: { x: 440, y: 490 },
      responsibleRole: "Academic Lead",
      helpText:
        "Mark this contract as Red Flag in the Man-day tool. It will be escalated to CEO at Stage 4 regardless of tier. This does not block the request — it flags strategic cost.",
    },
    {
      order: 7,
      type: "action" as StepType,
      label: "Full cost modelling",
      position: { x: 240, y: 620 },
      responsibleRole: "Finance Role",
      helpText:
        "Open the Full Cost Model. Enter all direct costs (teacher labour, test design, LMS, materials), hidden costs (re-sit risk, opportunity cost, overhead), and calculate gross margin. SLA: 3–5 business days.",
    },
    {
      order: 8,
      type: "decision" as StepType,
      label: "Margin?",
      position: { x: 240, y: 750 },
      responsibleRole: "Finance Role",
      helpText:
        "Does the gross margin meet the minimum threshold (default 20%)? If negative or below threshold, reject with written grounds. Loss-leaders require CEO sign-off.",
    },
    {
      order: 9,
      type: "terminal" as StepType,
      label: "Reject",
      position: { x: 440, y: 750 },
      responsibleRole: "Finance Role",
      helpText:
        "Issue a written Rejection Notice to Sales within 1 business day. State grounds clearly. Sales may revise and resubmit once; second rejection is final.",
    },
    {
      order: 10,
      type: "decision" as StepType,
      label: "Tier 3?",
      position: { x: 240, y: 880 },
      responsibleRole: "B2S Coordinator",
      helpText:
        "Is this a Tier 3 contract, a Red Flag contract, or a loss-leader? If yes, mandatory CEO review. If no (Tier 2, viable margin, no red flag), bypass to quote stage.",
    },
    {
      order: 11,
      type: "action" as StepType,
      label: "CEO / BoD approval",
      position: { x: 440, y: 880 },
      responsibleRole: "CEO",
      helpText:
        "CEO receives: completed CRF, feasibility verdict, P&L decision, one-page summary. Issues written Approved or Declined within 3–5 business days. Use the Approval Form.",
    },
    {
      order: 12,
      type: "terminal" as StepType,
      label: "Decline",
      position: { x: 440, y: 1010 },
      responsibleRole: "CEO",
      helpText:
        "CEO issues a written Decline. Sales may escalate only with new written business justification. Log outcome in the B2S Tracker.",
    },
    {
      order: 13,
      type: "action" as StepType,
      label: "Generate & send quote",
      position: { x: 240, y: 1010 },
      responsibleRole: "B2S Coordinator + Finance",
      helpText:
        "Use the Client Quote template. Include: pricing breakdown, programme scope, payment terms, validity period (30 days). Send to client contact named in CRF.",
    },
    {
      order: 14,
      type: "decision" as StepType,
      label: "Client response?",
      position: { x: 240, y: 1140 },
      responsibleRole: "Client",
      helpText:
        "Three possible outcomes: Accept (proceed to deployment), Negotiate (revise quote and resend), Major changes (return to Stage 1 with a new CRF).",
    },
    {
      order: 15,
      type: "terminal" as StepType,
      label: "Quote accepted",
      position: { x: 40, y: 1270 },
      responsibleRole: "B2S Coordinator",
      helpText:
        "Log acceptance. File the signed quote. Trigger deployment handoff within 1 business day.",
    },
    {
      order: 16,
      type: "terminal" as StepType,
      label: "Deploy — Tier 1",
      position: { x: 40, y: 230 },
      responsibleRole: "B2S Coordinator",
      helpText:
        "Standard product confirmed. Proceed directly to deployment brief. No further review required.",
    },
    {
      order: 17,
      type: "terminal" as StepType,
      label: "Academic team commences delivery",
      position: { x: 40, y: 1400 },
      responsibleRole: "Academic Lead",
      helpText:
        "Issue Deployment Brief to Academic Lead and Sales. Academic Lead assigns teachers, initiates materials production, configures LMS within agreed start date.",
    },
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
    { sourceIdx: 0, targetIdx: 1, label: null, style: "solid" as EdgeStyle },
    { sourceIdx: 0, targetIdx: 15, label: "Tier 1", style: "solid" as EdgeStyle },
    { sourceIdx: 1, targetIdx: 2, label: "Tier 2/3", style: "solid" as EdgeStyle },
    { sourceIdx: 2, targetIdx: 3, label: null, style: "solid" as EdgeStyle },
    { sourceIdx: 3, targetIdx: 4, label: null, style: "solid" as EdgeStyle },
    { sourceIdx: 4, targetIdx: 5, label: "No", style: "dashed" as EdgeStyle },
    { sourceIdx: 4, targetIdx: 6, label: "Yes", style: "solid" as EdgeStyle },
    { sourceIdx: 5, targetIdx: 6, label: null, style: "dashed" as EdgeStyle },
    { sourceIdx: 6, targetIdx: 7, label: null, style: "solid" as EdgeStyle },
    { sourceIdx: 7, targetIdx: 8, label: "Negative", style: "solid" as EdgeStyle },
    { sourceIdx: 7, targetIdx: 9, label: "Viable", style: "solid" as EdgeStyle },
    { sourceIdx: 9, targetIdx: 12, label: "No", style: "solid" as EdgeStyle },
    { sourceIdx: 9, targetIdx: 10, label: "Yes", style: "solid" as EdgeStyle },
    { sourceIdx: 10, targetIdx: 11, label: "Declined", style: "solid" as EdgeStyle },
    { sourceIdx: 10, targetIdx: 12, label: "Approved", style: "solid" as EdgeStyle },
    { sourceIdx: 12, targetIdx: 13, label: null, style: "solid" as EdgeStyle },
    { sourceIdx: 13, targetIdx: 12, label: "Negotiate", style: "dashed" as EdgeStyle },
    { sourceIdx: 13, targetIdx: 0, label: "Major changes", style: "dashed" as EdgeStyle },
    { sourceIdx: 13, targetIdx: 14, label: "Accept", style: "solid" as EdgeStyle },
    { sourceIdx: 14, targetIdx: 16, label: null, style: "solid" as EdgeStyle },
    { sourceIdx: 15, targetIdx: 16, label: null, style: "solid" as EdgeStyle },
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
    { stepIdx: 2, label: "Custom Request Form (Excel)", url: "/forms/B2S_01_Custom_Request_Form.xlsx", type: "download" as FormType },
    { stepIdx: 3, label: "Man-day Estimation Tool (Excel)", url: "/forms/B2S_02_Manday_Estimation.xlsx", type: "download" as FormType },
    { stepIdx: 6, label: "Full Cost Model (Excel)", url: "/forms/B2S_03_Full_Cost_Model.xlsx", type: "download" as FormType },
    { stepIdx: 10, label: "Approval Form (Excel)", url: "/forms/B2S_04_Approval_Form.xlsx", type: "download" as FormType },
    { stepIdx: 12, label: "Client Quote Template (Excel)", url: "/forms/B2S_05_Client_Quote.xlsx", type: "download" as FormType },
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

  console.log("B2S Request Review process seeded successfully!");
  console.log(`  - ${steps.length} steps`);
  console.log(`  - ${edgeData.length} edges`);
  console.log(`  - ${formData.length} forms`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
