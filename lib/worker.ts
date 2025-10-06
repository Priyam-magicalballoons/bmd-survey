// import { Redis } from "@upstash/redis";
// import "dotenv/config";
// import { PrismaClient } from "@prisma/client";

// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL!,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN!,
// });

// const STREAM_KEY = "patient_events";
// const DLQ_KEY = "patient_events:dlq";

// const prisma = new PrismaClient({
//   datasources: { db: { url: process.env.DATABASE_URL_DIRECT } },
// });

// type StreamMessage = {
//   id: string;
//   message: Record<string, string>;
// };

// async function startWorker() {
//   console.log("🚀 Worker started, polling for events...");
//   let lastId = "0";

//   while (true) {
//     try {
//       const rawRes = await redis.xread([STREAM_KEY], [lastId], { count: 5 });

//       if (!rawRes) {
//         await new Promise((r) => setTimeout(r, 5000));
//         continue;
//       }

//       for (const streamArr of rawRes as unknown as [
//         string,
//         [string, string[]][]
//       ][]) {
//         const messagesRaw = streamArr[1];

//         const messages: StreamMessage[] = messagesRaw.map(
//           ([id, fieldsArray]) => {
//             const message: Record<string, string> = {};
//             for (let i = 0; i < fieldsArray.length; i += 2) {
//               message[fieldsArray[i]] = fieldsArray[i + 1];
//             }
//             return { id, message };
//           }
//         );

//         for (const message of messages) {
//           const id = message.id;
//           const fields = message.message as any;

//           console.log("📥 Received:", id, fields);

//           const eventId = fields.event_id;
//           if (!eventId) {
//             console.warn("⚠️ Missing event_id, skipping", id);
//             lastId = id; // still advance so we don’t block forever
//             continue;
//           }

//           const retries = parseInt(fields.retries || "0");
//           let createdataID = "";
//           let createPatientId = "";

//           try {
//             const createPatient = await prisma.patient.create({
//               data: {
//                 age: fields.payload.age,
//                 gender: fields.payload.gender,
//                 number: fields.payload.mobile,
//                 coordinatorId: fields.coordinatorId,
//                 name: fields.payload.name,
//               },
//             });
//             createPatientId = createPatient.id;
//             if (createPatient.id) {
//               const createdata = await prisma.questionaire.create({
//                 data: {
//                   alcohol: fields.payload.alcohol,
//                   bmdScore: fields.payload.bmd_score,
//                   copd: fields.payload.existing_medical_conditions.copd,
//                   diabetes: fields.payload.existing_medical_conditions.diabetes,
//                   diet: fields.payload.diet,
//                   epilepsy: fields.payload.existing_medical_conditions.epilepsy,
//                   height: fields.payload.height,
//                   historyOfFractures: fields.payload.history_of_fractures,
//                   hypertension:
//                     fields.payload.existing_medical_conditions.hypertension,
//                   kneeOsteoarthritis:
//                     fields.payload.existing_medical_conditions
//                       .knee_osteoarthritis,
//                   orthopaedicSurgeriesHistory:
//                     fields.payload.orthopaedic_surgeries,
//                   smoking: fields.payload.smoking,
//                   tobacco: fields.payload.tobacco_chewing,
//                   weight: fields.payload.weight,
//                   copdMedication:
//                     fields.payload.existing_medical_conditions
//                       .copd_regular_medicine,
//                   epilepsyMedication:
//                     fields.payload.existing_medical_conditions
//                       .epilepsy_regular_medicine,
//                   fractureAge: fields.payload.fracture_diagnosed,
//                   Menopause: fields.payload.menopause,
//                   patientId: createPatient.id,
//                 },
//               });

//               createdataID = createdata.id;
//             }
//             if (!createPatient) {
//               throw Error;
//             }

//             // const insertData = await prisma;
//             console.log("✅ Inserted into DB:", eventId);

//             // Remove from main stream on success
//             await redis.xdel(STREAM_KEY, id);

//             // ✅ only update lastId after success
//             lastId = id;
//           } catch (err: any) {
//             console.error("❌ DB insert failed:", err.message);

//             if (!createdataID) {
//               await prisma.patient.delete({
//                 where: {
//                   id: createPatientId,
//                 },
//               });
//               console.log("id deleted successfully", createPatientId);
//             }

//             if (retries < 4) {
//               console.warn(`🔄 Retrying ${eventId}, attempt ${retries + 1}`);

//               await redis.xadd(STREAM_KEY, "*", {
//                 ...fields,
//                 retries: (retries + 1).toString(),
//               });

//               // Remove old copy
//               await redis.xdel(STREAM_KEY, id);

//               // ✅ advance lastId AFTER re-add
//               lastId = id;
//             } else {
//               console.error("⚠️ Dropping after 5 retries:", eventId);

//               await redis.xadd(DLQ_KEY, "*", {
//                 ...fields,
//                 original_id: id,
//                 failed_at: new Date().toISOString(),
//                 error: err.message || "unknown error",
//               });

//               await redis.xdel(STREAM_KEY, id);

//               // ✅ advance lastId AFTER moving to DLQ
//               lastId = id;
//             }
//           }
//         }
//       }
//     } catch (err: any) {
//       console.error("❌ Worker error:", err.message);
//       await new Promise((r) => setTimeout(r, 2000));
//     }
//   }
// }

// startWorker().catch(console.error);
