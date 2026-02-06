import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import {
  universities,
  users,
  groups,
  groupMembers,
  posts,
  postMedia,
  postLikes,
  postComments,
  emails,
  emailRecipients,
  emailAttachments,
  emailReplies,
  conversations,
  conversationParticipants,
  messages,
  messageReadReceipts,
  pendingAdminRequests,
  pendingUniversityRequests,
} from "../database/schema.js";
import { sql } from "drizzle-orm";

const seedId = Date.now().toString(36);
const groupsPerUniversity = 30;

const counts = {
  universities: 18,
  users: 240,
  groups: 18 * groupsPerUniversity,
  groupMembers: 18 * groupsPerUniversity * 3,
  posts: 220,
  postMedia: 180,
  postLikes: 420,
  postComments: 360,
  emails: 200,
  emailRecipients: 520,
  emailAttachments: 140,
  emailReplies: 160,
  conversations: 90,
  conversationParticipants: 240,
  messages: 420,
  messageReadReceipts: 320,
  pendingAdminRequests: 60,
  pendingUniversityRequests: 50,
};

const roles = ["student", "professor", "admin", "UniversalAdmin"];
const departments = [
  "Computer Science and Engineering",
  "Electronics and Communication",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Smart Manufacturing",
  "Civil Engineering",
  "Chemical Engineering",
  "Design",
  "others",
];
const batches = ["2020", "2021", "2022", "2023", "2024", "2025"];
const groupTypes = ["Academic", "Cultural", "Sports", "Technical", "Professional", "Special"];
const emailTypes = ["Academic", "Clubs", "Lost & Found", "Optional / Misc", "General"];
const roleTypes = ["admin", "member", "coordinator", "co-coordinator", "captain", "Mentor"];
const messageTypes = ["text", "image", "video", "file"];

const cloudinaryImages = [
  "https://res.cloudinary.com/demo/image/upload/sample.jpg",
  "https://res.cloudinary.com/demo/image/upload/woman.jpg",
  "https://res.cloudinary.com/demo/image/upload/dog.jpg",
  "https://res.cloudinary.com/demo/image/upload/couple.jpg",
  "https://res.cloudinary.com/demo/image/upload/kitten.jpg",
  "https://res.cloudinary.com/demo/image/upload/horse.jpg",
  "https://res.cloudinary.com/demo/image/upload/balloons.jpg",
  "https://res.cloudinary.com/demo/image/upload/park.jpg",
  "https://res.cloudinary.com/demo/image/upload/surfing.jpg",
  "https://res.cloudinary.com/demo/image/upload/mountain.jpg",
  "https://res.cloudinary.com/demo/image/upload/flower.jpg",
  "https://res.cloudinary.com/demo/image/upload/butterfly.jpg",
  "https://res.cloudinary.com/demo/image/upload/river.jpg",
  "https://res.cloudinary.com/demo/image/upload/cat.jpg",
  "https://res.cloudinary.com/demo/image/upload/bike.jpg",
  "https://res.cloudinary.com/demo/image/upload/forest.jpg",
  "https://res.cloudinary.com/demo/image/upload/lake.jpg",
  "https://res.cloudinary.com/demo/image/upload/bridge.jpg",
  "https://res.cloudinary.com/demo/image/upload/coffee.jpg",
  "https://res.cloudinary.com/demo/image/upload/road.jpg",
];
const otherImages = [
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  "https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?w=1200",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200",
  "https://images.unsplash.com/photo-1482192596544-9eb780fc7f66?w=1200",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200",
  "https://images.unsplash.com/photo-1500534623283-312aade485b7?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200",
];
const cloudinaryVideos = [
  "https://res.cloudinary.com/demo/video/upload/dog.mp4",
  "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4",
  "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
  "https://res.cloudinary.com/demo/video/upload/snowy_owl.mp4",
  "https://res.cloudinary.com/demo/video/upload/river.mp4",
  "https://res.cloudinary.com/demo/video/upload/waterfall.mp4",
  "https://res.cloudinary.com/demo/video/upload/closeup.mp4",
  "https://res.cloudinary.com/demo/video/upload/sky.mp4",
  "https://res.cloudinary.com/demo/video/upload/ocean.mp4",
  "https://res.cloudinary.com/demo/video/upload/fire.mp4",
  "https://res.cloudinary.com/demo/video/upload/bike.mp4",
  "https://res.cloudinary.com/demo/video/upload/forest.mp4",
];
const otherVideos = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
];
const cloudinaryFiles = [
  "https://res.cloudinary.com/demo/raw/upload/sample.pdf",
];
const otherFiles = [
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
];

const isCloudinary = (url) => url.includes("res.cloudinary.com");
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickImageUrl = () => {
  const url = Math.random() > 0.5 ? pick(cloudinaryImages) : pick(otherImages);
  return isCloudinary(url) ? url : url;
};
const pickVideoUrl = () => {
  const url = Math.random() > 0.5 ? pick(cloudinaryVideos) : pick(otherVideos);
  return isCloudinary(url) ? url : url;
};
const pickFileUrl = () => {
  const url = Math.random() > 0.5 ? pick(cloudinaryFiles) : pick(otherFiles);
  return isCloudinary(url) ? url : url;
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\\.|\\.$)/g, "");

const firstNames = [
  "John", "Peter", "Aisha", "Maya", "Liam", "Noah", "Olivia", "Emma", "Sophia", "Isabella",
  "Ethan", "Lucas", "Mason", "Ava", "Amelia", "Charlotte", "Harper", "Elijah", "James", "Benjamin",
  "Michael", "Daniel", "Grace", "Chloe", "Zoe", "Aria", "Nora", "Leo", "Kai", "Ella",
];
const lastNames = [
  "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez",
  "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
  "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
];
const randomName = () => `${pick(firstNames)} ${pick(lastNames)}`;

const postCaptions = [
  "Campus sunrise hits different today.",
  "We just wrapped the tech fest finale — proud of the team!",
  "Library grind with coffee and good vibes.",
  "Freshers’ night was a blast!",
  "Sports meet finals were intense. Great energy.",
  "The robotics demo went better than expected!",
  "Rainy day on campus and it feels cozy.",
  "Green club planted 200 saplings this morning.",
  "Guest lecture notes are finally整理 — worth it.",
  "Hackathon weekend: sleep optional, snacks mandatory.",
  "Cultural night rehearsal — can’t wait for the show.",
  "Study group at 6 PM? Bring your notes.",
  "Photography walk around campus today.",
  "New cafe menu looks amazing.",
  "Seminar on AI ethics was eye‑opening.",
  "Celebration for our alumni meet today.",
  "Team practice for inter‑college debate.",
  "Orientation week highlights!",
  "Our campus festival prep begins.",
  "Late night lab session, but progress feels good.",
  "Volunteering drive this weekend — join us!",
  "Placement cell session was super helpful.",
  "Campus cleanup success — great turnout.",
  "Music club jam session tonight.",
  "Coding contest results are out!",
];

const commentTexts = [
  "Love this!",
  "Looks awesome",
  "Count me in",
  "Great work!",
  "So proud of the team",
  "Can’t wait!",
  "This is exciting",
  "Thanks for sharing",
  "What time is it?",
  "See you there",
  "Nice shot",
  "This made my day",
];

const emailSubjects = [
  "Workshop registration details",
  "Campus fest schedule",
  "Library hours update",
  "New internship opportunities",
  "Sports meet registration",
  "Seminar on data science",
  "Cultural night auditions",
  "Club meeting reminder",
  "Lost and found item",
  "Exam timetable notice",
  "Scholarship updates",
  "Career fair invites",
];

const emailBodies = [
  "Please find the schedule attached and register by Friday.",
  "We’re excited to share the full lineup for the event.",
  "Library timings are updated for the holiday week.",
  "New internships have been posted on the portal.",
  "Registrations close this weekend. Don’t miss out!",
  "Join us for a talk on emerging tech trends.",
  "Auditions are open to all students this Thursday.",
  "Quick reminder about the upcoming club meeting.",
  "An item was found near the main gate. Details inside.",
  "Timetable is now live. Please review carefully.",
  "Scholarship applications close soon. Apply early.",
  "Career fair booths list is now available.",
];

const groupNames = [
  "Robotics Club", "Photography Club", "Debate Society", "Drama Circle", "Music Ensemble",
  "Green Campus", "Coding Club", "Literary Society", "Sports Committee", "AI & ML Group",
  "Entrepreneurship Cell", "Design Guild", "Astronomy Club", "Dance Crew", "Volunteer Network",
  "Film Society", "Math Circle", "Cybersecurity Hub", "Cultural Committee", "Startup Studio",
];

const messageTexts = [
  "Hey, are you joining the meeting today?",
  "Can you share the notes from class?",
  "The venue changed to Auditorium B.",
  "Congrats on the win!",
  "We should start at 5 PM.",
  "Thanks for the help!",
  "Let’s finalize the slides tonight.",
  "I’m on my way.",
  "Please check the updated doc.",
  "Great idea — let’s do it.",
  "See you in 10.",
  "Can we reschedule to tomorrow?",
];

const randomSentence = (arr) => pick(arr);

const insert = async () => {
  const hashed = await bcrypt.hash("password123", 10);
  const demoPasswordStudent = await bcrypt.hash("demostudent", 10);
  const demoPasswordProfessor = await bcrypt.hash("demoprofessor", 10);
  const demoPasswordAdmin = await bcrypt.hash("demoadmin", 10);
  const demoPasswordSuper = await bcrypt.hash("demosuperadmin", 10);

  const uniRows = Array.from({ length: counts.universities }).map((_, i) => ({
    name: `University ${i + 1}`,
    domain: `university${i + 1}-${seedId}.edu`,
    city: `City ${i + 1}`,
    state: `State ${i + 1}`,
    logoUrl: pickImageUrl(),
  }));
  const insertedUniversities = await db.insert(universities).values(uniRows).returning();

  const demoUniversity = insertedUniversities[0];
  const demoUsers = [
    { name: "Demo Student", email: `demo@student.com`, password: demoPasswordStudent, role: "student", department: pick(departments), batch: pick(batches), universityId: demoUniversity.id, profileUrl: pickImageUrl() },
    { name: "Demo Professor", email: `demo@professor.com`, password: demoPasswordProfessor, role: "professor", department: pick(departments), batch: null, universityId: demoUniversity.id, profileUrl: pickImageUrl() },
    { name: "Demo Admin", email: `demo@admin.com`, password: demoPasswordAdmin, role: "admin", department: null, batch: null, universityId: demoUniversity.id, profileUrl: pickImageUrl() },
    { name: "Demo Super Admin", email: `demo@superadmin.com`, password: demoPasswordSuper, role: "UniversalAdmin", department: null, batch: null, universityId: demoUniversity.id, profileUrl: pickImageUrl() },
  ];

  const userRows = Array.from({ length: counts.users }).map((_, i) => {
    const role = pick(roles);
    return {
      name: randomName(),
      email: `${slugify(randomName())}${i + 1}-${seedId}@example.com`,
      password: hashed,
      role,
      universityId: pick(insertedUniversities).id,
      department: role === "student" || role === "professor" ? pick(departments) : null,
      batch: role === "student" ? pick(batches) : null,
      profileUrl: pickImageUrl(),
    };
  });
  const insertedUsers = await db.insert(users).values([...demoUsers, ...userRows]).returning();

  const groupRows = [];
  insertedUniversities.forEach((uni) => {
    for (let i = 0; i < groupsPerUniversity; i += 1) {
      const baseName = groupNames[i % groupNames.length];
      groupRows.push({
        universityId: uni.id,
        name: `${baseName} - ${uni.name}`,
        type: pick(groupTypes),
        createdBy: pick(insertedUsers).id,
      });
    }
  });
  const insertedGroups = await db.insert(groups).values(groupRows).returning();

  const gmRows = Array.from({ length: counts.groupMembers }).map(() => ({
    groupId: pick(insertedGroups).id,
    userId: pick(insertedUsers).id,
    role: pick(roleTypes),
  }));
  await db.insert(groupMembers).values(gmRows);

  const postRows = Array.from({ length: counts.posts }).map((_, i) => ({
    universityId: pick(insertedUniversities).id,
    authorId: i < 40 ? demoUsers[i % demoUsers.length].id : pick(insertedUsers).id,
    groupId: Math.random() > 0.6 ? pick(insertedGroups).id : null,
    content: randomSentence(postCaptions),
  }));
  const insertedPosts = await db.insert(posts).values(postRows).returning();

  const mediaRows = Array.from({ length: counts.postMedia }).map(() => {
    const type = Math.random() > 0.7 ? "VIDEO" : "IMAGE";
    return {
      postId: pick(insertedPosts).id,
      type,
      url: type === "VIDEO" ? pickVideoUrl() : pickImageUrl(),
    };
  });
  await db.insert(postMedia).values(mediaRows);

  const likeRows = Array.from({ length: counts.postLikes }).map(() => ({
    postId: pick(insertedPosts).id,
    userId: pick(insertedUsers).id,
  }));
  await db.insert(postLikes).values(likeRows).onConflictDoNothing();

  const commentRows = Array.from({ length: counts.postComments }).map((_, i) => ({
    postId: pick(insertedPosts).id,
    authorId: i < 60 ? demoUsers[i % demoUsers.length].id : pick(insertedUsers).id,
    content: randomSentence(commentTexts),
  }));
  await db.insert(postComments).values(commentRows);

  const emailRows = Array.from({ length: counts.emails }).map((_, i) => ({
    universityId: pick(insertedUniversities).id,
    senderId: i < 40 ? demoUsers[i % demoUsers.length].id : pick(insertedUsers).id,
    subject: randomSentence(emailSubjects),
    content: randomSentence(emailBodies),
    type: pick(emailTypes),
    isImportant: Math.random() > 0.8,
    updatedAt: sql`now()`,
  }));
  const insertedEmails = await db.insert(emails).values(emailRows).returning();

  const recipientRows = Array.from({ length: counts.emailRecipients }).map(() => ({
    emailId: pick(insertedEmails).id,
    recipientId: pick(insertedUsers).id,
    isRead: Math.random() > 0.5,
    isStarred: Math.random() > 0.8,
  }));
  await db.insert(emailRecipients).values(recipientRows);

  const attachRows = Array.from({ length: counts.emailAttachments }).map((_, i) => ({
    emailId: pick(insertedEmails).id,
    fileName: `file-${i + 1}.pdf`,
    fileUrl: pickFileUrl(),
    fileSize: 1024 * (1 + (i % 10)),
    mimeType: "application/pdf",
  }));
  await db.insert(emailAttachments).values(attachRows);

  const replyRows = Array.from({ length: counts.emailReplies }).map((_, i) => ({
    emailId: pick(insertedEmails).id,
    senderId: i < 40 ? demoUsers[i % demoUsers.length].id : pick(insertedUsers).id,
    content: randomSentence(commentTexts),
  }));
  await db.insert(emailReplies).values(replyRows);

  const convoRows = Array.from({ length: counts.conversations }).map(() => ({
    universityId: pick(insertedUniversities).id,
    type: Math.random() > 0.6 ? "group" : "direct",
    groupId: Math.random() > 0.6 ? pick(insertedGroups).id : null,
    name: Math.random() > 0.6 ? `Conversation ${Math.random().toString(36).slice(2, 7)}` : null,
    avatarUrl: Math.random() > 0.7 ? pickImageUrl() : null,
    createdBy: pick(insertedUsers).id,
  }));
  const insertedConversations = await db.insert(conversations).values(convoRows).returning();

  const cpRows = Array.from({ length: counts.conversationParticipants }).map(() => ({
    conversationId: pick(insertedConversations).id,
    userId: pick(insertedUsers).id,
  }));
  await db.insert(conversationParticipants).values(cpRows);

  const msgRows = Array.from({ length: counts.messages }).map((_, i) => {
    const type = pick(messageTypes);
    return {
      conversationId: pick(insertedConversations).id,
      senderId: i < 80 ? demoUsers[i % demoUsers.length].id : pick(insertedUsers).id,
      content: type === "text" ? randomSentence(messageTexts) : null,
      type,
      fileUrl: type === "image" ? pickImageUrl() : type === "video" ? pickVideoUrl() : type === "file" ? pickFileUrl() : null,
      fileName: type === "file" ? `doc-${i + 1}.pdf` : null,
      fileSize: type === "file" ? 1024 * (1 + (i % 10)) : null,
    };
  });
  const insertedMessages = await db.insert(messages).values(msgRows).returning();

  const receiptRows = Array.from({ length: counts.messageReadReceipts }).map(() => ({
    messageId: pick(insertedMessages).id,
    userId: pick(insertedUsers).id,
  }));
  await db.insert(messageReadReceipts).values(receiptRows);

  const parRows = Array.from({ length: counts.pendingAdminRequests }).map(() => ({
    universityId: pick(insertedUniversities).id,
    userId: pick(insertedUsers).id,
    requestedRole: "admin",
    status: Math.random() > 0.8 ? "approved" : Math.random() > 0.5 ? "rejected" : "pending",
    requestMessage: "Requesting admin access",
    responseMessage: Math.random() > 0.7 ? "Reviewed" : null,
  }));
  await db.insert(pendingAdminRequests).values(parRows);

  const purRows = Array.from({ length: counts.pendingUniversityRequests }).map((_, i) => ({
    requesterId: pick(insertedUsers).id,
    name: `New University ${i + 1}`,
    domain: `newuni${i + 1}-${seedId}.edu`,
    city: `City ${i + 1}`,
    state: `State ${i + 1}`,
    logoUrl: pickImageUrl(),
    status: Math.random() > 0.8 ? "approved" : Math.random() > 0.5 ? "rejected" : "pending",
    requestMessage: "Please add our university",
    responseMessage: Math.random() > 0.7 ? "Reviewed" : null,
  }));
  await db.insert(pendingUniversityRequests).values(purRows);
};

await insert();
process.exit(0);
