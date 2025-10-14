import Contracts from "../models/contract.js";
const data = [
  {
    title: "Work Visa Processing Contract",
    contract_template: `
    # Visa & Work Permit Agreement
    **Agreement between:**  
    **Service Provider:**
        Name : {{service_provider_name}} 
        Email : {{client_email}}
        Phone Number : {{client_phone_number}}
        ID : {{service_provider_id}}
    **Client:**
        Name : {{client_first_name}} {{client_last_name}} 
        Email : {{client_email}}
        Phone Number : {{client_phone_number}}

    ---

## 1. Introduction

This Visa & Work Permit Agreement defines the terms and conditions under which the Agency will provide visa and work permit processing services for the Client.
---

## 2. Scope of Services

The Agency agrees to assist the Client in the preparation and submission of all required documentation to obtain a work visa and/or permit. Services include:

- Completion of application forms  
- Appointment scheduling  
- Document verification  
- Submission and communication with relevant authorities
---

## 3. Client Obligations
The Client must provide accurate, truthful, and complete information, and submit all necessary documents promptly.  
The Agency is **not responsible** for delays or rejections caused by incorrect or incomplete information from the Client.

---

## 4. Service Fees
- Total Service Fee: **{{price}} {{currency}}**  

> Note: The fee covers only the Agency’s service. All official government, embassy, or courier fees are excluded unless explicitly stated.

---

## 5. Processing Time
The estimated processing time is **{{processing_days}} business days** from the date all required documents are received.  
Processing time may vary due to embassy workload, holidays, or other factors beyond the Agency’s control.

---

## 6. Refund Policy
No refunds will be issued after submission of the application to the authorities.  
Refunds may be considered only in exceptional cases at the Agency's discretion.

---

## 7. Confidentiality
Both parties agree to maintain strict confidentiality regarding all personal information and documentation exchanged during the visa application process.

---

## 8. Terms & Conditions
The Agency acts solely as an intermediary and cannot guarantee visa approval.  
The Client acknowledges that final approval rests entirely with the embassy or immigration authorities.

---

## 9. Extra Points
- {{extra_point_1}}  
- {{extra_point_2}}  
- {{extra_point_3}}
---
**Signed on:** {{agreement_date}}  

`,

    variables: [
      "destination_country",
      "price",
      "currency",
      "payment_terms",
      "processing_days",
      "extra_point_1",
      "extra_point_2",
      "extra_point_3",
    ],
    fixed_variables: [
      "client_first_name",
      "client_first_last",
      "client_email",
      "service_provider_name",
      "service_provider_email",
      "service_provider_id",
      "service_provider_representative",
      "agreement_date",
    ],
    category_id: 1,
  },
];
export default async function contractSeed() {
  await Contracts.bulkCreate(data);
}
