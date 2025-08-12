import Contracts from "../models/contract.js";
const data = [
  {
    name: "Premium Web Development Service Agreement",
    about: "Standard contract for full-stack web development services",
    description:
      "This agreement outlines the terms for professional web development services including frontend, backend, and database implementation. It covers deliverables, timelines, payment terms, and intellectual property rights.",
    requests: 42, // Number of times this contract template has been requested
    contract: {
      version: "2.1",
      effectiveDate: "2023-11-15",
      parties: {
        business: {
          name: "CodeMaster Academy",
          type: "Educational Service business",
        },
        client: {
          name: "Client Organization/Individual",
          type: "Service Recipient",
        },
      },
      terms: {
        duration: {
          startDate: "Upon signing",
          endDate: "Project completion + 30 days warranty",
        },
        deliverables: [
          "Complete web application with responsive design",
          "Documented source code",
          "Deployment assistance",
          "30 days post-delivery support",
        ],
        payment: {
          structure:
            "50% upfront, 40% upon delivery, 10% after warranty period",
          totalAmount: 4999.99,
          currency: "USD",
        },
        intellectualProperty: {
          ownership: "Client retains all rights to custom developed code",
          licenses:
            "business may use project for portfolio with client approval",
        },
        confidentiality: {
          obligations:
            "Both parties agree to non-disclosure of proprietary information",
        },
        termination: {
          conditions: [
            "Either party may terminate with 30 days written notice",
            "Client responsible for payment for work completed",
          ],
        },
        disputeResolution: {
          process: "Mediation followed by arbitration if necessary",
          jurisdiction: "State of California",
        },
      },
      signatures: {
        business: {
          name: "business Representative",
          title: "Director of Services",
          date: "2023-11-15",
        },
        client: {
          name: "Client Representative",
          title: "Authorized Signatory",
          date: "2023-11-15",
        },
      },
    },
  },
];
export default async function contractSeed() {
  await Contracts.bulkCreate(data);
}
