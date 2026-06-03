import { dashboardIcons } from "../assets/dashboardIcons.js";

export const accountProfile = {
  initials: "SD",
  name: "Snigdha Dash",
  relation: "Self",
  status: "Active Profile",
  email: "snigdhadash111@gmail.com",
  phone: "+91-8576645375",
  birthdate: "03/04/2003",
  gender: "Female",
};

export const accountNavigation = [
  {
    title: "Profile",
    items: [
      { label: "Personal Information", icon: dashboardIcons.person, href: "/account" },
      { label: "My Family", icon: dashboardIcons.family, href: "/account/family" },
    ],
  },
  {
    title: "My Reports",
    items: [
      { label: "Blood Tests", icon: dashboardIcons.bloodTest, href: "/account/blood-tests" },
      { label: "Genetic Tests", icon: dashboardIcons.geneticTest, href: "/genetic-tests" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Address", icon: dashboardIcons.address, href: "/account/address" },
      { label: "Settings", icon: dashboardIcons.settings, href: "/account/settings" },
    ],
  },
  {
    title: "Help",
    items: [{ label: "Supports", icon: dashboardIcons.support, href: "/account/support" }],
  },
];

export const bloodTestOrders = [
  {
    id: "NUC-8429103",
    patients: ["John Doe", "Jane Smith"],
    testName: "Thyroid Profile",
    status: "In Progress",
    statusTone: "progress",
    appointmentDate: "Sunday, 8th Feb",
    appointmentTime: "7.00 AM- 8.00 AM",
    total: "₹399",
  },
  {
    id: "NUC-8429104",
    patients: ["John Doe", "Jane Smith"],
    testName: "Thyroid Profile",
    status: "Complete",
    statusTone: "complete",
    appointmentDate: "Sunday, 8th Feb",
    appointmentTime: "7.00 AM- 8.00 AM",
    total: "₹399",
  },
];

export const accountAddresses = [];

export const familyOverview = {
  title: "My Family",
  description: "Manage health profiles for 3 members.",
  actionLabel: "Add Member",
};

export const familyMembers = [
  {
    id: "snigdha-self",
    initials: "SD",
    name: "Snigdha Dash",
    relation: "Self",
    status: "Active Profile",
    age: "24 years",
    currentlyViewing: true,
  },
  {
    id: "snigdha-member-2",
    initials: "SD",
    name: "Snigdha Dash",
    relation: "Self",
    status: "Active Profile",
    age: "24 years",
    currentlyViewing: false,
  },
  {
    id: "snigdha-member-3",
    initials: "SD",
    name: "Snigdha Dash",
    relation: "Self",
    status: "Active Profile",
    age: "24 years",
    currentlyViewing: false,
  },
];
