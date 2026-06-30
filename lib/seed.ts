import type { Admin, Testimony } from "./types";

/**
 * Demo data used when no backend is configured (NEXT_PUBLIC_API_BASE_URL unset).
 * Timestamps are relative to "now" so the UI shows realistic "2h ago" labels.
 */

const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

export function seedTestimonies(): Testimony[] {
  return [
    { id: "1", submitterName: "Maria Okonkwo", submitterTkn: "TKN-7781", memberId: "m1", isAnonymous: false, source: "member", category: "Healing", tags: ["back pain", "prayer"], status: "pending", createdAt: hoursAgo(2), attachmentType: "image", attachmentUrl: "healing-service.jpg", title: "Healed after years of chronic pain", body: "For three years I lived with chronic back pain that no treatment could touch. During our healing service last month, the elders gathered and prayed over me. That night I slept without medication for the first time in longer than I can remember, and I have been pain-free since. God restored what the doctors had given up on." },
    { id: "2", submitterName: "David Reyes", submitterTkn: "TKN-6650", memberId: "m2", isAnonymous: true, source: "member", category: "Deliverance", tags: ["addiction", "freedom"], status: "pending", createdAt: hoursAgo(5), attachmentType: "document", attachmentUrl: "recovery-journal.pdf", title: "Set free from addiction", body: "I had been bound by addiction for most of my adult life and had lost hope of ever being free. Through this community and a lot of honest prayer, I have now been sober for 200 days. I am sharing this anonymously because I want the glory to go to God, not to me." },
    { id: "3", submitterName: "Grace Liu", submitterTkn: "TKN-5512", memberId: "m3", isAnonymous: false, source: "member", category: "Provision", tags: ["finances"], status: "pending", createdAt: daysAgo(1), attachmentType: null, attachmentUrl: null, title: "Provision when we could not pay rent", body: "We were two weeks from losing our apartment with no way to cover the rent. I asked the Lord to make a way, even though I could not see one. Within days an unexpected check arrived for almost the exact amount we owed. He provided when there was no path I could see." },
    { id: "4", submitterName: "Sarah Bennett", submitterTkn: "TKN-4408", memberId: "m4", isAnonymous: true, source: "member", category: "Family", tags: ["marriage", "retreat"], status: "pending", createdAt: daysAgo(1), attachmentType: "image", attachmentUrl: "retreat-photo.jpg", title: "A marriage restored", body: "My marriage had been cold and distant for years and we had quietly decided to separate. We came to the couples retreat as a last attempt, not expecting much. God softened both our hearts that weekend and gave us back a love I genuinely thought was gone for good." },
    { id: "5", submitterName: "Samuel Adeyemi", submitterTkn: "TKN-3391", memberId: "m5", isAnonymous: false, source: "member", category: "Breakthrough", tags: ["job"], status: "pending", createdAt: daysAgo(2), attachmentType: "document", attachmentUrl: "offer-letter.pdf", title: "New job after eight months", body: "After eight months of unemployment and more rejections than I could count, I was ready to give up. I kept showing up to serve on the welcome team anyway. The week I stopped striving and started trusting, I was offered a role better than the one I had lost." },
    { id: "6", submitterName: "Priya Nair", submitterTkn: "TKN-2284", memberId: "m6", isAnonymous: false, source: "member", category: "Healing", tags: ["anxiety", "peace"], status: "accepted", createdAt: daysAgo(3), approvedAt: daysAgo(3), attachmentType: null, attachmentUrl: null, title: "Peace in the middle of anxiety", body: "Anxiety used to wake me at 3am every single night. Learning to pray through the fear instead of fighting it alone has given me a peace that genuinely does not make sense given everything going on." },
    { id: "7", submitterName: "James Carter", submitterTkn: "TKN-1190", memberId: "m7", isAnonymous: false, source: "member", category: "Family", tags: ["reconciliation"], status: "accepted", createdAt: daysAgo(4), approvedAt: daysAgo(4), attachmentType: "image", attachmentUrl: "letter.jpg", title: "Reconciled with my father", body: "My father and I had not spoken in eleven years. I felt led to write him one honest letter. He called the day he received it, and we both wept on the phone. We are slowly rebuilding what was broken." },
    { id: "8", submitterName: "Lydia Cho", submitterTkn: "TKN-0073", memberId: "m8", isAnonymous: true, source: "member", category: "Family", tags: ["belonging"], status: "accepted", createdAt: daysAgo(5), approvedAt: daysAgo(5), attachmentType: null, attachmentUrl: null, title: "I found a church family", body: "I moved to this city completely alone and spent almost a year feeling invisible. This church became the family I did not have. For the first time in a long time, I belong somewhere." },
    { id: "9", submitterName: "Thomas Wright", submitterTkn: "TKN-9962", memberId: "m9", isAnonymous: false, source: "member", category: "Healing", tags: ["surgery"], status: "accepted", createdAt: daysAgo(6), approvedAt: daysAgo(6), attachmentType: "image", attachmentUrl: "recovery.jpg", title: "Carried through surgery", body: "Going into surgery I was terrified, but a peace settled over me that I can only describe as being carried. Recovery has been faster than anyone on the care team expected." },
    { id: "10", submitterName: "Esther Boateng", submitterTkn: null, memberId: "admin1", isAnonymous: false, source: "admin", category: "Salvation", tags: ["crusade"], status: "accepted", createdAt: daysAgo(8), approvedAt: daysAgo(8), attachmentType: null, attachmentUrl: null, title: "Gave her life to Christ at the crusade", body: "Recorded on her behalf by the aid team: Esther came forward at the regional crusade and surrendered her life to Christ. She asked us to share her testimony so others would know it is never too late." },
  ];
}

export function seedAdmins(): Admin[] {
  return [
    { id: "1", name: "Ruth Adeyemi", tkn: "TKN-4471", role: "Super Admin", lastLoginAt: hoursAgo(2), isActive: true },
    { id: "2", name: "Caleb Mensah", tkn: "TKN-3320", role: "Admin", lastLoginAt: hoursAgo(20), isActive: true },
    { id: "3", name: "Hannah Park", tkn: "TKN-2910", role: "Admin", lastLoginAt: daysAgo(3), isActive: true },
    { id: "4", name: "Daniel Osei", tkn: "TKN-1185", role: "Viewer", lastLoginAt: daysAgo(14), isActive: false },
  ];
}
