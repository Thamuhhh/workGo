import { Job } from '../models/Job';
import { User } from '../models/User';
import { Application } from '../models/Application';
import { Message } from '../models/Message';
import { Notification } from '../models/Notification';
import { Wallet } from '../models/Wallet';
import { ApplicationStatus } from '../types';

const pad = (n: number): string => String(n).padStart(2, '0');
const iso = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const inDays = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return iso(d);
};

// Demo seeding is disabled — the app only mirrors jobs real users post.
const SEED_DEMO_CONTENT = false;

interface SeedJob {
  title: string;
  category: string;
  description: string;
  location: { address: string; latitude: number; longitude: number; city?: string };
  date: string;
  startTime: string;
  endTime: string;
  workersRequired: number;
  salary: number;
  foodProvided?: boolean;
  transportProvided?: boolean;
  requirements: { skills: string[] };
  rating?: number;
  employer?: number;
}

const SEED_JOBS: SeedJob[] = [
  {
    title: 'Wedding Catering Staff',
    category: 'Catering',
    description:
      'Join Sri Balaji Caterers for a full-day wedding event at Kanchipuram. Serve guests, help with setup and cleanup, and support the kitchen team through the function.',
    location: { address: 'Kanchipuram', latitude: 12.8352, longitude: 79.7, city: 'Kanchipuram' },
    date: inDays(0),
    startTime: '6 AM',
    endTime: '4 PM',
    workersRequired: 15,
    salary: 900,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Basic catering experience preferred.'] },
    rating: 4.9,
  },
  {
    title: 'Event Booth Promoter',
    category: 'Promoter',
    description:
      'Represent SparkPromo at our event zone today — greet visitors, explain offers, hand out samples and keep the booth lively. A friendly, outgoing personality is all you need.',
    location: { address: 'Trade Centre', latitude: 13.0035, longitude: 80.199, city: 'Chennai' },
    date: inDays(0),
    startTime: '10 AM',
    endTime: '6 PM',
    workersRequired: 6,
    salary: 1000,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Good communication and energetic promotion.'] },
    rating: 4.8,
  },
  {
    title: 'Banquet Cleaning Staff',
    category: 'Cleaner',
    description:
      'Help keep the banquet hall spotless before, during and after the evening function tomorrow. You will work in a small team with a supervisor on site.',
    location: { address: 'Gandhi Road', latitude: 12.9966, longitude: 80.2031, city: 'Chennai' },
    date: inDays(1),
    startTime: '8 AM',
    endTime: '4 PM',
    workersRequired: 8,
    salary: 850,
    foodProvided: true,
    transportProvided: false,
    requirements: { skills: ['Cleaning and post-event hall cleanup.'] },
    rating: 4.7,
  },
  {
    title: 'Wedding MC / Anchor',
    category: 'MC/Anchor',
    description:
      'Host a traditional Kanchipuram wedding — manage introductions and announcements smoothly and keep the crowd engaged in Tamil and English through the evening.',
    location: { address: 'Kanchipuram', latitude: 12.8475, longitude: 79.7082, city: 'Kanchipuram' },
    date: inDays(2),
    startTime: '5 PM',
    endTime: '11 PM',
    workersRequired: 2,
    salary: 1200,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Fluent in Tamil & English hosting.'] },
    rating: 4.9,
  },
  {
    title: 'Community Event Coordinator',
    category: 'Event Coordinator',
    description:
      'Manage volunteers, timings and logistics for a community event on Gandhi Road. You will be the on-ground point of contact and report directly to the organiser.',
    location: { address: 'Gandhi Road', latitude: 12.991, longitude: 80.211, city: 'Chennai' },
    date: inDays(3),
    startTime: '9 AM',
    endTime: '6 PM',
    workersRequired: 4,
    salary: 1100,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Coordination and on-ground management.'] },
    rating: 4.8,
  },
];

const DEMO_EMPLOYER_PHONE = '9000000001';

const EXTRA_EMPLOYERS: { name: string; phone: string; businessName: string; businessType: string }[] = [
  { name: 'SparkPromo Events', phone: '9000000002', businessName: 'SparkPromo Events', businessType: 'Promotions & Events' },
  { name: 'Sri Balaji Caterers', phone: '9000000003', businessName: 'Sri Balaji Caterers', businessType: 'Catering' },
  { name: 'City Grand Banquets', phone: '9000000004', businessName: 'City Grand Banquets, Gandhi Road', businessType: 'Banquets & Halls' },
  { name: 'Greenfield Org', phone: '9000000005', businessName: 'Greenfield Society Trust', businessType: 'Community Events' },
  { name: 'UrbanEvents Co', phone: '9000000006', businessName: 'UrbanEvents Co., Chennai', businessType: 'Event Management' },
];

const SEED_EXTRA_JOBS: SeedJob[] = [
  {
    title: 'Retail Promoter – Mall Weekend',
    category: 'Promoter',
    description: 'Represent a leading snack brand inside the mall this weekend. Hand out samples, chat with shoppers and close the day with daily sales targets met by the team.',
    location: { address: 'Phoenix MarketCity, Anna Nagar', latitude: 13.0827, longitude: 80.211, city: 'Chennai' },
    date: inDays(2),
    startTime: '11 AM',
    endTime: '8 PM',
    workersRequired: 8,
    salary: 950,
    foodProvided: true,
    transportProvided: false,
    requirements: { skills: ['Friendly & outgoing', 'Basic mobile payment handling'] },
    rating: 4.7,
    employer: 0,
  },
  {
    title: 'Sample & Demo Promoter',
    category: 'Promoter',
    description: 'Greet visitors at the demo counters, explain product benefits and manage queues at the Trade Centre expo zone.',
    location: { address: 'Trade Centre', latitude: 13.0035, longitude: 80.199, city: 'Chennai' },
    date: inDays(0),
    startTime: '10 AM',
    endTime: '6 PM',
    workersRequired: 6,
    salary: 900,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Good communication', 'Energetic promotion'] },
    rating: 4.8,
    employer: 0,
  },
  {
    title: 'Wedding Dinner Catering Staff',
    category: 'Catering',
    description: 'Support the kitchen and serving team for a grand wedding dinner at Kanchipuram. Plating, serving guests and keeping the buffet stocked.',
    location: { address: 'Kanchipuram', latitude: 12.8352, longitude: 79.7, city: 'Kanchipuram' },
    date: inDays(1),
    startTime: '5 PM',
    endTime: '11 PM',
    workersRequired: 10,
    salary: 950,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Basic catering', 'Hygiene-first attitude'] },
    rating: 4.9,
    employer: 1,
  },
  {
    title: 'Canteen Helper – Catering',
    category: 'Catering',
    description: 'Help run the canteen counter at an industrial event in Chengalpattu — serve food, restock and keep the area clean through the day.',
    location: { address: 'Chemplast Road', latitude: 12.685, longitude: 79.975, city: 'Chengalpattu' },
    date: inDays(3),
    startTime: '8 AM',
    endTime: '4 PM',
    workersRequired: 5,
    salary: 800,
    foodProvided: true,
    transportProvided: false,
    requirements: { skills: ['Simple food handling', 'Teamwork'] },
    rating: 4.6,
    employer: 1,
  },
  {
    title: 'Banquet Serving Staff',
    category: 'Catering',
    description: 'Serve plated dinners and refill drinks at City Grand Banquets, Gandhi Road. Tight, well-run team with a head waiter on site.',
    location: { address: 'Gandhi Road', latitude: 12.9966, longitude: 80.2031, city: 'Chennai' },
    date: inDays(1),
    startTime: '6 PM',
    endTime: '11 PM',
    workersRequired: 7,
    salary: 880,
    foodProvided: true,
    transportProvided: false,
    requirements: { skills: ['Serving etiquette', 'Polite manner'] },
    rating: 4.7,
    employer: 2,
  },
  {
    title: 'Kalyana Mandapam Cleaning Crew',
    category: 'Cleaner',
    description: 'Pre-hall setup and mid-function touch-ups for a big wedding in Kanchipuram. You work in pairs with a supervisor coordinating clearances.',
    location: { address: 'Kanchipuram', latitude: 12.825, longitude: 79.695, city: 'Kanchipuram' },
    date: inDays(0),
    startTime: '9 AM',
    endTime: '6 PM',
    workersRequired: 6,
    salary: 820,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Cleaning', 'Physically fit'] },
    rating: 4.5,
    employer: 2,
  },
  {
    title: 'Post-Event Hall Cleaning',
    category: 'Cleaner',
    description: 'Late-night cleanup after a corporate event in Tambaram. Sweep, mop, bag waste and leave the hall ready for the morning booking.',
    location: { address: 'Tambaram', latitude: 12.923, longitude: 80.117, city: 'Chennai' },
    date: inDays(2),
    startTime: '10 PM',
    endTime: '2 AM',
    workersRequired: 4,
    salary: 800,
    foodProvided: false,
    transportProvided: true,
    requirements: { skills: ['Cleaning', 'Night availability'] },
    rating: 4.4,
    employer: 2,
  },
  {
    title: 'Tamil Wedding MC',
    category: 'MC/Anchor',
    description: 'Anchor a traditional Tamil wedding in Sriperumbudur — mahurta, kanyadanam and reception introductions with warmth and timing.',
    location: { address: 'Sriperumbudur', latitude: 12.967, longitude: 79.942, city: 'Sriperumbudur' },
    date: inDays(4),
    startTime: '5 PM',
    endTime: '10 PM',
    workersRequired: 2,
    salary: 1400,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Fluent Tamil & English', 'Wedding hosting experience'] },
    rating: 4.9,
    employer: 4,
  },
  {
    title: 'Stage Anchor – College Fest',
    category: 'MC/Anchor',
    description: 'Host a two-day college fest main stage at a Chennai campus. Announce events, energise the crowd and keep sponsors happy between acts.',
    location: { address: 'Anna University, Guindy', latitude: 13.006, longitude: 80.216, city: 'Chennai' },
    date: inDays(5),
    startTime: '9 AM',
    endTime: '5 PM',
    workersRequired: 1,
    salary: 1200,
    foodProvided: true,
    transportProvided: false,
    requirements: { skills: ['High-energy stage presence', 'Tamil & English'] },
    rating: 4.8,
    employer: 4,
  },
  {
    title: 'Trade Fair Coordinator',
    category: 'Event Coordinator',
    description: 'Coordinate stall setups, vendor visits and crowd flow at the Chennai trade fair. You are the bridge between organizers and stall owners.',
    location: { address: 'Trade Centre', latitude: 13.0035, longitude: 80.199, city: 'Chennai' },
    date: inDays(3),
    startTime: '9 AM',
    endTime: '6 PM',
    workersRequired: 3,
    salary: 1150,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Coordination', 'Problem solving on the spot'] },
    rating: 4.7,
    employer: 4,
  },
  {
    title: 'Volunteer Coordinator – Marathon',
    category: 'Event Coordinator',
    description: 'Manage water-station volunteers and route marshals for a Chennai city run. Report directly to the race director.',
    location: { address: 'Marina Loop', latitude: 13.0628, longitude: 80.2775, city: 'Chennai' },
    date: inDays(6),
    startTime: '4 AM',
    endTime: '11 AM',
    workersRequired: 5,
    salary: 1000,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Leadership', 'Early start OK'] },
    rating: 4.8,
    employer: 3,
  },
  {
    title: 'Entry Ticket Checker',
    category: 'Others',
    description: 'Scan tickets at the gate of the trade expo, guide visitors to halls and answer simple directions.',
    location: { address: 'Trade Centre', latitude: 13.0041, longitude: 80.1985, city: 'Chennai' },
    date: inDays(0),
    startTime: '9 AM',
    endTime: '5 PM',
    workersRequired: 4,
    salary: 700,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Basic English', 'Punctual'] },
    rating: 4.6,
    employer: 0,
  },
  {
    title: 'Event Security Guard',
    category: 'Others',
    description: 'Stand at entry and stage points for an evening function in Kanchipuram. No confrontation needed — just presence and crowd awareness.',
    location: { address: 'Kanchipuram', latitude: 12.84, longitude: 79.705, city: 'Kanchipuram' },
    date: inDays(1),
    startTime: '4 PM',
    endTime: '10 PM',
    workersRequired: 6,
    salary: 850,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Physically fit', 'Calm under stress'] },
    rating: 4.5,
    employer: 4,
  },
  {
    title: 'Stage Setup Hand',
    category: 'Others',
    description: 'Assemble stage panels, lights and seating for a corporate townhall in Chennai. Physical work with a friendly crew.',
    location: { address: 'Green Park, Saidapet', latitude: 13.023, longitude: 80.222, city: 'Chennai' },
    date: inDays(2),
    startTime: '7 AM',
    endTime: '3 PM',
    workersRequired: 8,
    salary: 950,
    foodProvided: true,
    transportProvided: false,
    requirements: { skills: ['Manual strength', 'Follow instructions'] },
    rating: 4.6,
    employer: 4,
  },
  {
    title: 'Warehouse Packing Helper',
    category: 'Others',
    description: 'Pack promo kits for an upcoming campaign at our Maraimalai Nagar warehouse. Repetitive but steady, warm-dry environment.',
    location: { address: 'SPL Axis, Maraimalai Nagar', latitude: 12.793, longitude: 80.035, city: 'Maraimalai Nagar' },
    date: inDays(3),
    startTime: '9 AM',
    endTime: '5 PM',
    workersRequired: 10,
    salary: 780,
    foodProvided: true,
    transportProvided: true,
    requirements: { skills: ['Attention to quantity', 'Fast fingers'] },
    rating: 4.5,
    employer: 0,
  },
  {
    title: 'Loading / Shifting Helper',
    category: 'Others',
    description: 'Help move event furniture and boxes between venues in Chennai. Short burst of heavy lifting, then storing it neatly.',
    location: { address: 'Koyambedu Depot', latitude: 13.073, longitude: 80.201, city: 'Chennai' },
    date: inDays(1),
    startTime: '8 AM',
    endTime: '12 PM',
    workersRequired: 6,
    salary: 900,
    foodProvided: true,
    transportProvided: false,
    requirements: { skills: ['Heavy lifting', 'Teamwork'] },
    rating: 4.4,
    employer: 2,
  },
];

const DEMO_WORKERS: { name: string; phone: string; city: string; skills: string[]; rating: number; completedJobs: number }[] = [
  { name: 'Murugan S', phone: '9000000231', city: 'Kanchipuram', skills: ['Catering Staff'], rating: 4.6, completedJobs: 12 },
  { name: 'Priya R', phone: '9000000232', city: 'Chengalpattu', skills: ['Event Coordinator'], rating: 4.8, completedJobs: 18 },
  { name: 'Karthik V', phone: '9000000233', city: 'Chennai', skills: ['MC/Anchor'], rating: 4.7, completedJobs: 9 },
  { name: 'Santhosh K', phone: '9000000234', city: 'Kanchipuram', skills: ['Catering Staff'], rating: 4.5, completedJobs: 7 },
  { name: 'Divya M', phone: '9000000235', city: 'Chennai', skills: ['Catering Staff', 'Promoter'], rating: 4.9, completedJobs: 22 },
  { name: 'Ravi T', phone: '9000000236', city: 'Chennai', skills: ['Cleaner'], rating: 4.4, completedJobs: 5 },
];

// Applications per inserted job (order matches SEED_JOBS above).
const SEED_APPLICATIONS: Record<number, { worker: number; status: ApplicationStatus }[]> = {
  0: [
    { worker: 0, status: 'ACCEPTED' },
    { worker: 3, status: 'APPLIED' },
    { worker: 4, status: 'APPLIED' },
  ],
  1: [{ worker: 4, status: 'APPLIED' }],
  2: [{ worker: 5, status: 'SHORTLISTED' }],
  3: [{ worker: 2, status: 'SHORTLISTED' }],
  4: [
    { worker: 1, status: 'ACCEPTED' },
    { worker: 4, status: 'SHORTLISTED' },
  ],
};

export const seedDatabase = async (): Promise<void> => {
  try {
    // 0. Purge demo content every boot so the app only reflects jobs real users posted.
    const demoEmployerPhones = [
      DEMO_EMPLOYER_PHONE,
      ...EXTRA_EMPLOYERS.map((e) => e.phone),
    ];
    const demoEmployers = await User.find({ phone: { $in: demoEmployerPhones } }).select('_id');
    const demoEmployerIds = demoEmployers.map((u: any) => u._id);
    if (demoEmployerIds.length > 0) {
      const demoJobIds = (
        await Job.find({ postedBy: { $in: demoEmployerIds } }).select('_id')
      ).map((j: any) => j._id);
      if (demoJobIds.length > 0) {
        const apps = await Application.deleteMany({ jobId: { $in: demoJobIds } });
        await Message.deleteMany({ jobId: { $in: demoJobIds } });
        await Notification.deleteMany({
          $or: [
            { userId: { $in: demoEmployerIds } },
            { 'data.jobId': { $in: demoJobIds.map((id: any) => id.toString()) } },
          ],
        });
        await Job.deleteMany({ _id: { $in: demoJobIds } });
        console.log(
          `[seed] Purged ${demoJobIds.length} demo job(s) + ${apps.deletedCount} linked application(s).`
        );
      }
      const users = await User.deleteMany({ _id: { $in: demoEmployerIds } });
      console.log(`[seed] Purged ${users.deletedCount} demo employer account(s).`);
    }
    const demoWorkerIds = (
      await User.find({ phone: { $in: DEMO_WORKERS.map((w) => w.phone) } }).select('_id')
    ).map((u: any) => u._id);
    if (demoWorkerIds.length > 0) {
      const wallets = await Wallet.deleteMany({ userId: { $in: demoWorkerIds } });
      if (wallets.deletedCount > 0) {
        console.log(`[seed] Cleared ${wallets.deletedCount} demo worker wallet(s).`);
      }
    }

    if (SEED_DEMO_CONTENT) {
    // 1. Demo employer
    let employer = await User.findOne({ phone: DEMO_EMPLOYER_PHONE });
    if (!employer) {
      employer = await User.create({
        name: 'Gigro Events',
        phone: DEMO_EMPLOYER_PHONE,
        role: 'employer',
        businessName: 'Gigro Events',
        businessType: 'Event Management',
        isVerified: true,
        rating: 4.8,
      });
    }

    // 2. Demo jobs (only if none exist)
    let jobs: any[] = await Job.find({ postedBy: employer!._id });
    if (jobs.length === 0) {
      jobs = await Job.insertMany(
        SEED_JOBS.map(({ rating, ...job }) => ({
          ...job,
          postedBy: employer!._id,
          paymentType: 'per_day',
          workersAccepted: Math.floor((job.workersRequired * 60) / 100),
          status: 'OPEN',
          rating,
        }))
      );
    } else {
      jobs = await Job.find({ postedBy: employer!._id });
    }

    // 2b. Extra demo employers + realistic jobs (idempotent per employer + title)
    const extraEmployers: { _id: unknown }[] = [];
    for (const e of EXTRA_EMPLOYERS) {
      let u = await User.findOne({ phone: e.phone });
      if (!u) {
        u = await User.create({
          name: e.name,
          phone: e.phone,
          role: 'employer',
          businessName: e.businessName,
          businessType: e.businessType,
          isVerified: true,
          rating: 4.7,
        });
      }
      extraEmployers.push(u);
    }
    const openJobs = await Job.find({ status: 'OPEN' }).select('title postedBy').lean();
    const existingJobKeys = new Set(
      openJobs.map((j: any) => `${j.postedBy.toString()}_${j.title}`)
    );
    const extraJobsToInsert: any[] = [];
    for (const { rating, employer, ...j } of SEED_EXTRA_JOBS) {
      const owner: any =
        employer !== undefined ? extraEmployers[employer] : undefined;
      if (!owner) continue;
      const key = `${(owner as any)._id.toString()}_${j.title}`;
      if (existingJobKeys.has(key)) continue;
      extraJobsToInsert.push({
        ...j,
        postedBy: (owner as any)._id,
        paymentType: 'per_day',
        workersAccepted: Math.floor((j.workersRequired * 55) / 100),
        status: 'OPEN',
        rating,
      });
    }
    if (extraJobsToInsert.length > 0) {
      await Job.insertMany(extraJobsToInsert);
      console.log(`[seed] Added ${extraJobsToInsert.length} extra job(s) across ${extraEmployers.length} employers.`);
    }

    // 3. Demo workers (find or create)
    const workers: { _id: unknown }[] = [];
    for (const w of DEMO_WORKERS) {
      let user = await User.findOne({ phone: w.phone });
      if (!user) {
        user = await User.create({
          name: w.name,
          phone: w.phone,
          role: 'worker',
          location: { address: w.city, latitude: 0, longitude: 0, city: w.city },
          skills: w.skills,
          categories: w.skills,
          isVerified: true,
          rating: w.rating,
          completedJobs: w.completedJobs,
        });
      }
      workers.push(user);
    }

    // 4. Demo applications (only if none exist), matched by job title
    const existingApps = await Application.countDocuments();
    if (existingApps === 0) {
      const jobsByTitle = new Map(jobs.map((j) => [j.title, j]));
      const applications: { jobId: unknown; workerId: unknown; status: ApplicationStatus }[] = [];
      Object.entries(SEED_APPLICATIONS).forEach(([jobIndex, apps]) => {
        const title = SEED_JOBS[Number(jobIndex)]?.title;
        const job = title ? jobsByTitle.get(title) : undefined;
        if (!job) return;
        apps.forEach(({ worker, status }) => {
          const workerUser = workers[worker];
          if (!workerUser) return;
          applications.push({ jobId: job._id, workerId: workerUser._id, status });
        });
      });

      if (applications.length > 0) {
        await Application.insertMany(applications);
      }

      console.log(
        `[seed] Demo data ready: ${jobs.length} jobs, ${workers.length} workers, ${applications.length} applications.`
      );
    }

    // 5. Demo messages (only if none exist) for the accepted hires
    const existingMessages = await Message.countDocuments();
    if (existingMessages === 0) {
      const accepted = await Application.find({ status: { $in: ['ACCEPTED', 'COMPLETED'] } }).lean();
      let seeded = 0;
      for (const app of accepted as any[]) {
        const job = jobs.find((j) => j._id.toString() === app.jobId.toString());
        const worker = workers.find((w: any) => w._id.toString() === app.workerId.toString());
        if (!job || !worker) continue;
        await Message.insertMany([
          {
            jobId: job._id,
            sender: employer!._id,
            recipient: worker._id,
            senderRole: 'employer',
            text: `Hi ${(worker as any).name.split(' ')[0]}! Your application for ${job.title} was accepted. Please reach the venue by ${job.startTime} with a valid ID.`,
            read: true,
            createdAt: new Date(),
          },
          {
            jobId: job._id,
            sender: worker._id,
            recipient: employer!._id,
            senderRole: 'worker',
            text: 'Thanks for the opportunity! I will be there on time.',
            read: true,
            createdAt: new Date(Date.now() - 5 * 60000),
          },
          {
            jobId: job._id,
            sender: employer!._id,
            recipient: worker._id,
            senderRole: 'employer',
            text: 'Great. Please reply here if you need any help finding the venue.',
            read: false,
            createdAt: new Date(Date.now() - 2 * 60000),
          },
        ]);
        seeded += 3;
      }
      if (seeded > 0) console.log(`[seed] Seeded ${seeded} message(s) across ${accepted.length} threads.`);
    }

    // 6. Demo notifications (only if none exist)
    const existingNotifs = await Notification.countDocuments();
    if (existingNotifs === 0) {
      const appDocs = await Application.find({ status: { $in: ['ACCEPTED', 'COMPLETED'] } })
        .populate('workerId')
        .populate('jobId');
      let seeded = 0;
      for (const app of appDocs) {
        const worker = app.workerId as any;
        const job = app.jobId as any;
        if (!worker || !job) continue;
        await Notification.create({
          userId: worker._id,
          title: worker.name.split(' ')[0] + ' confirmed for ' + job.title,
          body: `${job.title} · ${job.location?.city ?? ''} · ${new Date(job.date).toLocaleDateString()}`,
          type: 'accepted',
          data: { jobId: job._id.toString() },
          isRead: false,
        });
        seeded += 1;
      }
      await Notification.create({
        userId: employer!._id,
        title: 'You are ready to hire',
        body: 'Select from shortlisted workers to confirm your next team.',
        type: 'offer',
        isRead: false,
      });
      console.log(`[seed] Seeded ${seeded + 1} notification(s).`);
    }

    // 7. Demo wallets (only if missing) with a seeded earnings line for accepted hires
    const walletUsers = await Application.find({ status: { $in: ['ACCEPTED', 'COMPLETED'] } })
      .populate('workerId')
      .populate('jobId');
    for (const app of walletUsers) {
      const worker = app.workerId as any;
      const job = app.jobId as any;
      if (!worker || !job) continue;
      const existing = await Wallet.findOne({ userId: worker._id });
      if (existing) continue;
      await Wallet.create({
        userId: worker._id,
        balance: job.salary,
        totalEarned: job.salary,
        upiId: '',
        transactions: [
          {
            id: `tx_${Date.now().toString(36)}_${worker._id.toString().slice(0, 4)}`,
            title: `Payout · ${job.title}`,
            meta: 'Gig completed',
            amount: job.salary,
            timestamp: new Date(),
          },
        ],
      });
    }
    } // end SEED_DEMO_CONTENT

    // Ensure /applications only returns rows backed by a real job.
    const aliveJobs = await Job.find({}).select('_id').lean();
    const aliveJobIds = aliveJobs.map((j: any) => j._id.toString());
    const orphanApps = await Application.find({}).select('jobId').lean();
    const orphanAppIds = (orphanApps as any[])
      .filter((a) => !aliveJobIds.includes(a.jobId.toString()))
      .map((a) => a._id);
    if (orphanAppIds.length > 0) {
      await Application.deleteMany({ _id: { $in: orphanAppIds } });
      console.log(
        `[seed] Removed ${orphanAppIds.length} orphaned application(s) with missing jobs.`
      );
    }
    const orphanMsgs = await Message.find({}).select('jobId').lean();
    const orphanMsgIds = (orphanMsgs as any[])
      .filter((m) => !aliveJobIds.includes(m.jobId.toString()))
      .map((m) => m._id);
    if (orphanMsgIds.length > 0) {
      await Message.deleteMany({ _id: { $in: orphanMsgIds } });
      console.log(`[seed] Removed ${orphanMsgIds.length} orphaned message(s) with missing jobs.`);
    }
  } catch (e: any) {
    console.warn(`[seed] Database seeding skipped: ${e?.message}`);
  }
};