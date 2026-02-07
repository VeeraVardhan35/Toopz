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
  postMedia: 220,
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
  "https://picsum.photos/id/10/1200/800",
  "https://picsum.photos/id/11/1200/800",
  "https://picsum.photos/id/12/1200/800",
  "https://picsum.photos/id/13/1200/800",
  "https://picsum.photos/id/14/1200/800",
  "https://picsum.photos/id/15/1200/800",
  "https://picsum.photos/id/16/1200/800",
  "https://picsum.photos/id/17/1200/800",
  "https://picsum.photos/id/18/1200/800",
  "https://picsum.photos/id/19/1200/800",
  "https://picsum.photos/id/20/1200/800",
  "https://picsum.photos/id/21/1200/800",
  "https://picsum.photos/id/22/1200/800",
  "https://picsum.photos/id/23/1200/800",
  "https://picsum.photos/id/24/1200/800",
  "https://picsum.photos/id/25/1200/800",
  "https://picsum.photos/id/26/1200/800",
  "https://picsum.photos/id/27/1200/800",
  "https://picsum.photos/id/28/1200/800",
  "https://picsum.photos/id/29/1200/800",
  "https://picsum.photos/id/30/1200/800",
  "https://picsum.photos/id/31/1200/800",
  "https://picsum.photos/id/32/1200/800",
  "https://picsum.photos/id/33/1200/800",
  "https://picsum.photos/id/34/1200/800",
  "https://picsum.photos/id/35/1200/800",
  "https://picsum.photos/id/36/1200/800",
  "https://picsum.photos/id/37/1200/800",
  "https://picsum.photos/id/38/1200/800",
  "https://picsum.photos/id/39/1200/800",
  "https://picsum.photos/id/40/1200/800",
  "https://picsum.photos/id/41/1200/800",
  "https://picsum.photos/id/42/1200/800",
  "https://picsum.photos/id/43/1200/800",
  "https://picsum.photos/id/44/1200/800",
  "https://picsum.photos/id/45/1200/800",
  "https://picsum.photos/id/46/1200/800",
  "https://picsum.photos/id/47/1200/800",
  "https://picsum.photos/id/48/1200/800",
  "https://picsum.photos/id/49/1200/800",
  "https://picsum.photos/id/50/1200/800",
  "https://picsum.photos/id/51/1200/800",
  "https://picsum.photos/id/52/1200/800",
  "https://picsum.photos/id/53/1200/800",
  "https://picsum.photos/id/54/1200/800",
  "https://picsum.photos/id/55/1200/800",
  "https://picsum.photos/id/56/1200/800",
  "https://picsum.photos/id/57/1200/800",
  "https://picsum.photos/id/58/1200/800",
  "https://picsum.photos/id/59/1200/800",
  "https://picsum.photos/id/60/1200/800",
];
const cloudinaryVideos = [
  "https://res.cloudinary.com/demo/video/upload/sea_turtle.mp4",
  "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
  "https://res.cloudinary.com/demo/video/upload/snowy_owl.mp4",
  "https://res.cloudinary.com/demo/video/upload/river.mp4",
  "https://res.cloudinary.com/demo/video/upload/waterfall.mp4",
  "https://res.cloudinary.com/demo/video/upload/closeup.mp4",
  "https://res.cloudinary.com/demo/video/upload/sky.mp4",
  "https://res.cloudinary.com/demo/video/upload/ocean.mp4",
  "https://res.cloudinary.com/demo/video/upload/fire.mp4",
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
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerStorms.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "https://media.w3.org/2010/05/bunny/trailer.mp4",
  "https://media.w3.org/2010/05/sintel/trailer.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
  "https://sample-videos.com/video321/mp4/240/big_buck_bunny_240p_1mb.mp4",
  "https://sample-videos.com/video321/mp4/360/big_buck_bunny_360p_1mb.mp4",
  "https://sample-videos.com/video321/mp4/480/big_buck_bunny_480p_1mb.mp4",
  "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4",
  "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_5mb.mp4",
  "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_10mb.mp4",
  "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_20mb.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
  "https://filesamples.com/samples/video/mp4/sample_640x360.mp4",
  "https://filesamples.com/samples/video/mp4/sample_960x400_ocean_with_audio.mp4",
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
  const url = Math.random() > 0.45 ? pick(otherImages) : pick(cloudinaryImages);
  return isCloudinary(url) ? url : url;
};
const pickVideoUrl = () => {
  const url = Math.random() > 0.45 ? pick(otherVideos) : pick(cloudinaryVideos);
  return isCloudinary(url) ? url : url;
};
const pickFileUrl = () => {
  const url = Math.random() > 0.45 ? pick(otherFiles) : pick(cloudinaryFiles);
  return isCloudinary(url) ? url : url;
};

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/(^\\.|\\.$)/g, "");

const firstNames = [
  "John", "Peter", "Aisha", "Maya", "Liam", "Noah", "Olivia", "Emma", "Sophia", "Isabella",
  "Ethan", "Lucas", "Mason", "Ava", "Amelia", "Charlotte", "Harper", "Elijah", "James", "Benjamin",
  "Michael", "Daniel", "Grace", "Chloe", "Zoe", "Aria", "Nora", "Leo", "Kai", "Ella",
  "Aarav", "Riya", "Ananya", "Kabir", "Isha", "Sanjay", "Priya", "Vikram", "Neha", "Rahul",
];
const lastNames = [
  "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez",
  "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee",
  "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Sharma", "Reddy", "Gupta", "Khan", "Patel", "Mehta", "Nair", "Iyer", "Singh", "Das",
];
const randomName = () => `${pick(firstNames)} ${pick(lastNames)}`;

const postCaptions = [
  "Campus sunrise hits different today.",
  "We just wrapped the tech fest finale - proud of the team!",
  "Library grind with coffee and good vibes.",
  "Freshers' night was a blast!",
  "Sports meet finals were intense. Great energy.",
  "The robotics demo went better than expected!",
  "Rainy day on campus and it feels cozy.",
  "Green club planted 200 saplings this morning.",
  "Guest lecture notes are finally sorted - worth it.",
  "Hackathon weekend: sleep optional, snacks mandatory.",
  "Cultural night rehearsal - can't wait for the show.",
  "Study group at 6 PM? Bring your notes.",
  "Photography walk around campus today.",
  "New cafe menu looks amazing.",
  "Seminar on AI ethics was eye-opening.",
  "Celebration for our alumni meet today.",
  "Team practice for inter-college debate.",
  "Orientation week highlights!",
  "Our campus festival prep begins.",
  "Late night lab session, but progress feels good.",
  "Volunteering drive this weekend - join us!",
  "Placement cell session was super helpful.",
  "Campus cleanup success - great turnout.",
  "Music club jam session tonight.",
  "Coding contest results are out!",
];

const commentTexts = [
  "Love this!",
  "Looks awesome",
  "Count me in",
  "Great work!",
  "So proud of the team",
  "Can't wait!",
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
  "We're excited to share the full lineup for the event.",
  "Library timings are updated for the holiday week.",
  "New internships have been posted on the portal.",
  "Registrations close this weekend. Don't miss out!",
  "Join us for a talk on emerging tech trends.",
  "Auditions are open to all students this Thursday.",
  "Quick reminder about the upcoming club meeting.",
  "An item was found near the main gate. Details inside.",
  "Timetable is now live. Please review carefully.",
  "Scholarship applications close soon. Apply early.",
  "Career fair booths list is now available.",
];

const groupNames = [
  "Robotics Club",
  "Photography Club",
  "Debate Society",
  "Drama Circle",
  "Music Ensemble",
  "Green Campus",
  "Coding Club",
  "Literary Society",
  "Sports Committee",
  "AI & ML Group",
  "Entrepreneurship Cell",
  "Design Guild",
  "Astronomy Club",
  "Dance Crew",
  "Volunteer Network",
  "Film Society",
  "Math Circle",
  "Cybersecurity Hub",
  "Cultural Committee",
  "Startup Studio",
  "Innovation Lab",
  "Media & PR Club",
  "Placement Prep",
  "Women in Tech",
  "Social Impact",
  "Chess Club",
  "Fitness League",
  "Debate & MUN",
  "Cloud Computing",
  "Data Science Collective",
];

const messageTexts = [
  "Hey, are you joining the meeting today?",
  "Can you share the notes from class?",
  "The venue changed to Auditorium B.",
  "Congrats on the win!",
  "We should start at 5 PM.",
  "Thanks for the help!",
  "Let's finalize the slides tonight.",
  "I'm on my way.",
  "Please check the updated doc.",
  "Great idea - let's do it.",
  "See you in 10.",
  "Can we reschedule to tomorrow?",
];

const randomSentence = (arr) => pick(arr);

const insert = async () => {
<<<<<<< HEAD
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
  const demoUserRows = [
    {
      name: "Demo Student",
      email: "demo@student.com",
      password: demoPasswordStudent,
      role: "student",
      department: pick(departments),
      batch: pick(batches),
      universityId: demoUniversity.id,
      profileUrl: pickImageUrl(),
    },
    {
      name: "Demo Professor",
      email: "demo@professor.com",
      password: demoPasswordProfessor,
      role: "professor",
      department: pick(departments),
      batch: null,
      universityId: demoUniversity.id,
      profileUrl: pickImageUrl(),
    },
    {
      name: "Demo Admin",
      email: "demo@admin.com",
      password: demoPasswordAdmin,
      role: "admin",
      department: null,
      batch: null,
      universityId: demoUniversity.id,
      profileUrl: pickImageUrl(),
    },
    {
      name: "Demo Super Admin",
      email: "demo@superadmin.com",
      password: demoPasswordSuper,
      role: "UniversalAdmin",
      department: null,
      batch: null,
      universityId: demoUniversity.id,
      profileUrl: pickImageUrl(),
    },
  ];
  const insertedDemoUsers = await db.insert(users).values(demoUserRows).returning();

  const userRows = Array.from({ length: counts.users }).map((_, i) => {
    const role = pick(roles);
    const name = randomName();
    return {
      name,
      email: `${slugify(name)}${i + 1}-${seedId}@example.com`,
      password: hashed,
      role,
      universityId: pick(insertedUniversities).id,
      department: role === "student" || role === "professor" ? pick(departments) : null,
      batch: role === "student" ? pick(batches) : null,
      profileUrl: pickImageUrl(),
    };
  });
  const insertedUsers = await db.insert(users).values(userRows).returning();
  const allUsers = [...insertedDemoUsers, ...insertedUsers];

  const groupRows = [];
  insertedUniversities.forEach((uni) => {
    for (let i = 0; i < groupsPerUniversity; i += 1) {
      const baseName = groupNames[i % groupNames.length];
      groupRows.push({
        universityId: uni.id,
        name: `${baseName} - ${uni.name}`,
        type: pick(groupTypes),
        createdBy: pick(allUsers).id,
      });
    }
  });
  const insertedGroups = await db.insert(groups).values(groupRows).returning();

  const gmRows = Array.from({ length: counts.groupMembers }).map(() => ({
    groupId: pick(insertedGroups).id,
    userId: pick(allUsers).id,
    role: pick(roleTypes),
  }));
  const demoUniversityGroupIds = insertedGroups
    .filter((group) => group.universityId === demoUniversity.id)
    .slice(0, 12)
    .map((group) => group.id);
  const demoMembershipRows = insertedDemoUsers.flatMap((user) =>
    demoUniversityGroupIds.map((groupId, idx) => ({
      groupId,
      userId: user.id,
      role: idx === 0 ? "admin" : "member",
    }))
  );
  const demoExtraGroupRows = Array.from({ length: 40 }).map(() => ({
    groupId: pick(insertedGroups).id,
    userId: pick(insertedDemoUsers).id,
    role: pick(roleTypes),
  }));
  await db
    .insert(groupMembers)
    .values([...gmRows, ...demoMembershipRows, ...demoExtraGroupRows])
    .onConflictDoNothing();

  const postRows = Array.from({ length: counts.posts }).map((_, i) => ({
    universityId: pick(insertedUniversities).id,
    authorId: i < 80 ? insertedDemoUsers[i % insertedDemoUsers.length].id : pick(allUsers).id,
    groupId: Math.random() > 0.6 ? pick(insertedGroups).id : null,
    content: randomSentence(postCaptions),
  }));
  const insertedPosts = await db.insert(posts).values(postRows).returning();

  const mediaRows = Array.from({ length: counts.postMedia }).map((_, i) => {
    const isVideo = i % 3 === 0 || Math.random() > 0.7;
    return {
      postId: pick(insertedPosts).id,
      type: isVideo ? "VIDEO" : "IMAGE",
      url: isVideo ? pickVideoUrl() : pickImageUrl(),
    };
  });
  await db.insert(postMedia).values(mediaRows);

  const likeRows = Array.from({ length: counts.postLikes }).map(() => ({
    postId: pick(insertedPosts).id,
    userId: pick(allUsers).id,
  }));
  const demoLikeRows = Array.from({ length: 80 }).map(() => ({
    postId: pick(insertedPosts).id,
    userId: pick(insertedDemoUsers).id,
  }));
  await db.insert(postLikes).values([...likeRows, ...demoLikeRows]).onConflictDoNothing();

  const commentRows = Array.from({ length: counts.postComments }).map((_, i) => ({
    postId: pick(insertedPosts).id,
    authorId: i < 80 ? insertedDemoUsers[i % insertedDemoUsers.length].id : pick(allUsers).id,
    content: randomSentence(commentTexts),
  }));
  await db.insert(postComments).values(commentRows);

  const emailRows = Array.from({ length: counts.emails }).map((_, i) => ({
    universityId: pick(insertedUniversities).id,
    senderId: i < 60 ? insertedDemoUsers[i % insertedDemoUsers.length].id : pick(allUsers).id,
    subject: randomSentence(emailSubjects),
    content: randomSentence(emailBodies),
    type: pick(emailTypes),
    isImportant: Math.random() > 0.8,
    updatedAt: sql`now()`,
  }));
  const insertedEmails = await db.insert(emails).values(emailRows).returning();

  const recipientRows = Array.from({ length: counts.emailRecipients }).map(() => ({
    emailId: pick(insertedEmails).id,
    recipientId: pick(allUsers).id,
    isRead: Math.random() > 0.5,
    isStarred: Math.random() > 0.8,
  }));
  const demoRecipientRows = insertedEmails
    .slice(0, 60)
    .flatMap((email) =>
      insertedDemoUsers.map((user) => ({
        emailId: email.id,
        recipientId: user.id,
        isRead: true,
        isStarred: Math.random() > 0.7,
      }))
    );
  await db
    .insert(emailRecipients)
    .values([...recipientRows, ...demoRecipientRows])
    .onConflictDoNothing();

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
    senderId: i < 60 ? insertedDemoUsers[i % insertedDemoUsers.length].id : pick(allUsers).id,
    content: randomSentence(commentTexts),
  }));
  await db.insert(emailReplies).values(replyRows);

  const convoRows = Array.from({ length: counts.conversations }).map(() => ({
    universityId: pick(insertedUniversities).id,
    type: Math.random() > 0.6 ? "group" : "direct",
    groupId: Math.random() > 0.6 ? pick(insertedGroups).id : null,
    name: Math.random() > 0.6 ? `Conversation ${Math.random().toString(36).slice(2, 7)}` : null,
    avatarUrl: Math.random() > 0.7 ? pickImageUrl() : null,
    createdBy: pick(allUsers).id,
  }));
  const insertedConversations = await db.insert(conversations).values(convoRows).returning();

  const cpRows = Array.from({ length: counts.conversationParticipants }).map(() => ({
    conversationId: pick(insertedConversations).id,
    userId: pick(allUsers).id,
  }));
  const demoConversationRows = insertedConversations.flatMap((conversation, idx) => [
    {
      conversationId: conversation.id,
      userId: insertedDemoUsers[idx % insertedDemoUsers.length].id,
    },
  ]);
  const demoGroupConversationRows = insertedConversations
    .slice(0, 40)
    .flatMap((conversation) =>
      insertedDemoUsers.map((user) => ({
        conversationId: conversation.id,
        userId: user.id,
      }))
    );
  await db
    .insert(conversationParticipants)
    .values([...cpRows, ...demoConversationRows, ...demoGroupConversationRows])
    .onConflictDoNothing();

  const msgRows = Array.from({ length: counts.messages }).map((_, i) => {
    const type = pick(messageTypes);
    return {
      conversationId: pick(insertedConversations).id,
      senderId: i < 120 ? insertedDemoUsers[i % insertedDemoUsers.length].id : pick(allUsers).id,
      content: type === "text" ? randomSentence(messageTexts) : null,
      type,
      fileUrl:
        type === "image"
          ? pickImageUrl()
          : type === "video"
            ? pickVideoUrl()
            : type === "file"
              ? pickFileUrl()
              : null,
      fileName: type === "file" ? `doc-${i + 1}.pdf` : null,
      fileSize: type === "file" ? 1024 * (1 + (i % 10)) : null,
    };
  });
  const demoMessageRows = insertedConversations.map((conversation, idx) => ({
    conversationId: conversation.id,
    senderId: insertedDemoUsers[idx % insertedDemoUsers.length].id,
    content: randomSentence(messageTexts),
    type: "text",
    fileUrl: null,
    fileName: null,
    fileSize: null,
  }));
  const insertedMessages = await db
    .insert(messages)
    .values([...msgRows, ...demoMessageRows])
    .returning();

  const receiptRows = Array.from({ length: counts.messageReadReceipts }).map(() => ({
    messageId: pick(insertedMessages).id,
    userId: pick(allUsers).id,
  }));
  const demoReceiptRows = insertedMessages
    .slice(0, 120)
    .flatMap((message) =>
      insertedDemoUsers.map((user) => ({
        messageId: message.id,
        userId: user.id,
      }))
    );
  await db
    .insert(messageReadReceipts)
    .values([...receiptRows, ...demoReceiptRows])
    .onConflictDoNothing();

  const parRows = Array.from({ length: counts.pendingAdminRequests }).map(() => ({
    universityId: pick(insertedUniversities).id,
    userId: pick(allUsers).id,
    requestedRole: "admin",
    status: Math.random() > 0.8 ? "approved" : Math.random() > 0.5 ? "rejected" : "pending",
    requestMessage: "Requesting admin access",
    responseMessage: Math.random() > 0.7 ? "Reviewed" : null,
  }));
  await db.insert(pendingAdminRequests).values(parRows);

  const purRows = Array.from({ length: counts.pendingUniversityRequests }).map((_, i) => ({
    requesterId: pick(allUsers).id,
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

=======
  await db.transaction(async (tx) => {

    /* =========================
       PASSWORDS
    ========================== */
    const hashed = await bcrypt.hash("password123", 10);
    const demoPasswordStudent = await bcrypt.hash("demostudent", 10);
    const demoPasswordProfessor = await bcrypt.hash("demoprofessor", 10);
    const demoPasswordAdmin = await bcrypt.hash("demoadmin", 10);
    const demoPasswordSuper = await bcrypt.hash("demosuperadmin", 10);

    /* =========================
       UNIVERSITIES
    ========================== */
    const uniRows = Array.from({ length: counts.universities }).map((_, i) => ({
      name: `University ${i + 1}`,
      domain: `university${i + 1}-${seedId}.edu`,
      city: `City ${i + 1}`,
      state: `State ${i + 1}`,
      logoUrl: pickImageUrl(),
    }));

    await tx
      .insert(universities)
      .values(uniRows)
      .onConflictDoNothing();

    const insertedUniversities = await tx.select().from(universities);

    const demoUniversity = insertedUniversities[0];

    /* =========================
       DEMO USERS (SAFE)
    ========================== */
    const demoUserRows = [
      {
        name: "Demo Student",
        email: "demo@student.com",
        password: demoPasswordStudent,
        role: "student",
        department: pick(departments),
        batch: pick(batches),
        universityId: demoUniversity.id,
        profileUrl: pickImageUrl(),
      },
      {
        name: "Demo Professor",
        email: "demo@professor.com",
        password: demoPasswordProfessor,
        role: "professor",
        department: pick(departments),
        batch: null,
        universityId: demoUniversity.id,
        profileUrl: pickImageUrl(),
      },
      {
        name: "Demo Admin",
        email: "demo@admin.com",
        password: demoPasswordAdmin,
        role: "admin",
        department: null,
        batch: null,
        universityId: demoUniversity.id,
        profileUrl: pickImageUrl(),
      },
      {
        name: "Demo Super Admin",
        email: "demo@superadmin.com",
        password: demoPasswordSuper,
        role: "UniversalAdmin",
        department: null,
        batch: null,
        universityId: demoUniversity.id,
        profileUrl: pickImageUrl(),
      },
    ];

    await tx
      .insert(users)
      .values(demoUserRows)
      .onConflictDoNothing();

    const insertedDemoUsers = await tx
      .select()
      .from(users)
      .where(sql`email LIKE 'demo@%'`);

    const demoUsersByEmail = new Map(insertedDemoUsers.map((u) => [u.email, u]));
    const demoStudent = demoUsersByEmail.get("demo@student.com");
    const demoProfessor = demoUsersByEmail.get("demo@professor.com");
    const demoAdmin = demoUsersByEmail.get("demo@admin.com");
    const demoSuperAdmin = demoUsersByEmail.get("demo@superadmin.com");
    const demoUsers = [demoStudent, demoProfessor, demoAdmin, demoSuperAdmin].filter(Boolean);

    /* =========================
       RANDOM USERS
    ========================== */
    const userRows = Array.from({ length: counts.users }).map((_, i) => {
      const role = pick(roles);
      const name = randomName();
      return {
        name,
        email: `${slugify(name)}${i + 1}-${seedId}@example.com`,
        password: hashed,
        role,
        universityId: pick(insertedUniversities).id,
        department: role !== "admin" ? pick(departments) : null,
        batch: role === "student" ? pick(batches) : null,
        profileUrl: pickImageUrl(),
      };
    });

    await tx.insert(users).values(userRows).onConflictDoNothing();

    const allUsers = await tx.select().from(users);

    /* =========================
       DEMO CONNECTIONS (MESSAGES + EMAILS)
    ========================== */
    if (demoUsers.length === 4) {
      const demoPairs = [];
      for (let i = 0; i < demoUsers.length; i++) {
        for (let j = i + 1; j < demoUsers.length; j++) {
          demoPairs.push([demoUsers[i], demoUsers[j]]);
        }
      }

      const demoConvoRows = demoPairs.map(([a, b]) => ({
        universityId: demoUniversity.id,
        type: "direct",
        name: `${a.name} & ${b.name}`,
        createdBy: demoAdmin.id,
        avatarUrl: null,
      }));

      const demoConvos = await tx
        .insert(conversations)
        .values(demoConvoRows)
        .returning();

      const demoGroupConvo = await tx
        .insert(conversations)
        .values({
          universityId: demoUniversity.id,
          type: "group",
          name: "Demo Core",
          createdBy: demoAdmin.id,
          avatarUrl: pickImageUrl(),
        })
        .returning();

      const demoParticipantRows = [];
      demoConvos.forEach((convo, idx) => {
        const [a, b] = demoPairs[idx];
        demoParticipantRows.push(
          { conversationId: convo.id, userId: a.id },
          { conversationId: convo.id, userId: b.id }
        );
      });
      demoUsers.forEach((u) => {
        demoParticipantRows.push({ conversationId: demoGroupConvo[0].id, userId: u.id });
      });

      await tx
        .insert(conversationParticipants)
        .values(demoParticipantRows)
        .onConflictDoNothing();

      const demoMessageSeeds = [
        "Hey, just checking in about the demo setup.",
        "Looks good! I'll update the notes.",
        "Can we meet at 4 PM to finalize?",
        "Sharing the final checklist now.",
        "Thanks! I will take care of it.",
        "All set from my side.",
      ];

      const demoMessageRows = [];
      const demoMessagesPerConvo = 24;
      demoConvos.forEach((convo, idx) => {
        const [a, b] = demoPairs[idx];
        for (let i = 0; i < demoMessagesPerConvo; i++) {
          const sender = i % 2 === 0 ? a : b;
          demoMessageRows.push({
            conversationId: convo.id,
            senderId: sender.id,
            content: demoMessageSeeds[(idx + i) % demoMessageSeeds.length],
            type: "text",
          });
        }
      });

      const demoGroupMessages = 30;
      for (let i = 0; i < demoGroupMessages; i++) {
        const sender = demoUsers[i % demoUsers.length];
        demoMessageRows.push({
          conversationId: demoGroupConvo[0].id,
          senderId: sender.id,
          content: demoMessageSeeds[i % demoMessageSeeds.length],
          type: "text",
        });
      }

      await tx.insert(messages).values(demoMessageRows).onConflictDoNothing();

      const demoEmailsPerUser = 24;
      const demoEmailRows = [];
      const demoEmailRecipientMap = [];
      demoUsers.forEach((sender, senderIdx) => {
        const otherUsers = demoUsers.filter((u) => u.id !== sender.id);
        for (let i = 0; i < demoEmailsPerUser; i++) {
          const recipient = otherUsers[i % otherUsers.length];
          demoEmailRows.push({
            universityId: demoUniversity.id,
            senderId: sender.id,
            subject: `Demo update ${i + 1} from ${sender.name}`,
            content: emailBodies[(senderIdx + i) % emailBodies.length],
            type: pick(emailTypes),
            isImportant: i % 3 === 0,
          });
          demoEmailRecipientMap.push(recipient);
        }
      });

      const insertedDemoEmails = await tx
        .insert(emails)
        .values(demoEmailRows)
        .returning();

      const demoRecipientRows = [];
      insertedDemoEmails.forEach((emailRow, idx) => {
        const recipient = demoEmailRecipientMap[idx];
        demoRecipientRows.push({
          emailId: emailRow.id,
          recipientId: recipient.id,
          isRead: idx % 2 === 0,
          isStarred: idx % 5 === 0,
        });
      });

      await tx
        .insert(emailRecipients)
        .values(demoRecipientRows)
        .onConflictDoNothing();
    } else {
      console.warn("Demo users missing; skipping demo connections.");
    }

    /* =========================
       GROUPS
    ========================== */
    const groupRows = [];
    insertedUniversities.forEach((uni) => {
      for (let i = 0; i < groupsPerUniversity; i++) {
        const baseName = groupNames[i % groupNames.length];
        groupRows.push({
          universityId: uni.id,
          name: `${baseName} - ${uni.name}`,
          type: pick(groupTypes),
          createdBy: pick(allUsers).id,
        });
      }
    });

    await tx.insert(groups).values(groupRows).onConflictDoNothing();

    const insertedGroups = await tx.select().from(groups);

    /* =========================
       GROUP MEMBERS
    ========================== */
    const gmRows = Array.from({ length: counts.groupMembers }).map(() => ({
      groupId: pick(insertedGroups).id,
      userId: pick(allUsers).id,
      role: pick(roleTypes),
    }));

    await tx
      .insert(groupMembers)
      .values(gmRows)
      .onConflictDoNothing();

    /* =========================
       POSTS
    ========================== */
    const postRows = Array.from({ length: counts.posts }).map(() => ({
      universityId: pick(insertedUniversities).id,
      authorId: pick(allUsers).id,
      groupId: Math.random() > 0.6 ? pick(insertedGroups).id : null,
      content: randomSentence(postCaptions),
    }));

    await tx.insert(posts).values(postRows).onConflictDoNothing();

    const insertedPosts = await tx.select().from(posts);

    /* =========================
       POST LIKES
    ========================== */
    const likeRows = Array.from({ length: counts.postLikes }).map(() => ({
      postId: pick(insertedPosts).id,
      userId: pick(allUsers).id,
    }));

    await tx.insert(postLikes).values(likeRows).onConflictDoNothing();

    /* =========================
       EMAILS
    ========================== */
    const emailRows = Array.from({ length: counts.emails }).map(() => ({
      universityId: pick(insertedUniversities).id,
      senderId: pick(allUsers).id,
      subject: randomSentence(emailSubjects),
      content: randomSentence(emailBodies),
      type: pick(emailTypes),
      isImportant: Math.random() > 0.8,
    }));

    await tx.insert(emails).values(emailRows).onConflictDoNothing();

    const insertedEmails = await tx.select().from(emails);

    /* =========================
       EMAIL RECIPIENTS
    ========================== */
    const recipientRows = Array.from({ length: counts.emailRecipients }).map(() => ({
      emailId: pick(insertedEmails).id,
      recipientId: pick(allUsers).id,
      isRead: Math.random() > 0.5,
      isStarred: Math.random() > 0.8,
    }));

    await tx
      .insert(emailRecipients)
      .values(recipientRows)
      .onConflictDoNothing();

    /* =========================
       DONE
    ========================== */
    console.log("✅ FULL DATABASE SEEDED SAFELY");
  });
};


>>>>>>> 2cd663c (Ready for Deployment with reduced errors)
await insert();
process.exit(0);
