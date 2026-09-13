export interface SampleJob {
  id: string;
  title: string;
  category: string;
  employerName: string;
  location: string;
  distance: string;
  date: string;
  timing: string;
  workersRequired: number;
  workersAccepted: number;
  salary: string;
  employerRating: string;
  foodProvided: boolean;
  transportProvided: boolean;
  requirements: string;
  about: string;
}

export const SAMPLE_JOBS: SampleJob[] = [
  {
    id: 'job_1',
    title: 'Wedding Catering Staff',
    category: 'Catering',
    employerName: 'Sri Balaji Caterers',
    location: 'Kanchipuram',
    distance: '4.2 km away',
    date: '20 September',
    timing: '6:00 AM - 4:00 PM',
    workersRequired: 15,
    workersAccepted: 12,
    salary: '₹900 / day',
    employerRating: '4.9 Rating',
    foodProvided: true,
    transportProvided: true,
    requirements: 'Basic catering experience preferred.',
    about:
      'Join Sri Balaji Caterers for a full-day wedding event at Kanchipuram. Serve guests, help with setup and cleanup, and support the kitchen team through the function.',
  },
  {
    id: 'job_2',
    title: 'Event Booth Promoter',
    category: 'Promoter',
    employerName: 'SparkPromo Events',
    location: 'Trade Centre',
    distance: '3.1 km away',
    date: 'Today',
    timing: '10:00 AM - 6:00 PM',
    workersRequired: 6,
    workersAccepted: 4,
    salary: '₹1,000 / day',
    employerRating: '4.8 Rating',
    foodProvided: true,
    transportProvided: true,
    requirements: 'Good communication and energetic promotion.',
    about:
      'Represent SparkPromo at our event zone today — greet visitors, explain offers, hand out samples and keep the booth lively. A friendly, outgoing personality is all you need.',
  },
  {
    id: 'job_3',
    title: 'Banquet Cleaning Staff',
    category: 'Cleaner',
    employerName: 'City Grand Banquets',
    location: 'Gandhi Road',
    distance: '2.4 km away',
    date: 'Tomorrow',
    timing: '8:00 AM - 4:00 PM',
    workersRequired: 8,
    workersAccepted: 5,
    salary: '₹850 / day',
    employerRating: '4.7 Rating',
    foodProvided: true,
    transportProvided: false,
    requirements: 'Cleaning and post-event hall cleanup.',
    about:
      'Help keep the banquet hall spotless before, during and after the evening function tomorrow. You will work in a small team with a supervisor on site.',
  },
  {
    id: 'job_4',
    title: 'Wedding MC / Anchor',
    category: 'MC/Anchor',
    employerName: 'Kanchipuram Wedding Co.',
    location: 'Kanchipuram',
    distance: '5.5 km away',
    date: '22 September',
    timing: '5:00 PM - 11:00 PM',
    workersRequired: 2,
    workersAccepted: 1,
    salary: '₹1,200 / day',
    employerRating: '4.9 Rating',
    foodProvided: true,
    transportProvided: true,
    requirements: 'Fluent in Tamil & English hosting.',
    about:
      'Host a traditional Kanchipuram wedding — manage introductions and announcements smoothly and keep the crowd engaged in Tamil and English through the evening.',
  },
  {
    id: 'job_5',
    title: 'Community Event Coordinator',
    category: 'Event Coordinator',
    employerName: 'Greenfield Society Trust',
    location: 'Gandhi Road',
    distance: '3.8 km away',
    date: '24 September',
    timing: '9:00 AM - 6:00 PM',
    workersRequired: 4,
    workersAccepted: 2,
    salary: '₹1,100 / day',
    employerRating: '4.8 Rating',
    foodProvided: true,
    transportProvided: true,
    requirements: 'Coordination and on-ground management.',
    about:
      'Manage volunteers, timings and logistics for a community event on Gandhi Road. You will be the on-ground point of contact and report directly to the organiser.',
  },
];