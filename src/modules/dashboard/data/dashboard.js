import { welcomeDashboardIcons } from "../assets/welcomeDashboardIcons.js";

export const dashboardProfile = {
  initials: "SD",
  firstName: "Snigdha",
};

export const dashboardModuleGroups = [
  {
    title: "Testing",
    modules: [
      { label: "Genetic Tests", icon: welcomeDashboardIcons.geneticTests, href: "/genetic-tests" },
      { label: "Blood Tests", icon: welcomeDashboardIcons.labTests, href: "/blood-test" },
    ],
  },
  {
    title: "Family",
    modules: [
      { label: "Family Tree", icon: welcomeDashboardIcons.familyTree },
      { label: "Family Planning", icon: welcomeDashboardIcons.familyPlanning },
      { label: "Child Stimulator", icon: welcomeDashboardIcons.childStimulator },
      { label: "IVF", icon: welcomeDashboardIcons.ivf },
    ],
  },
  {
    title: "Health",
    modules: [
      { label: "Gut", icon: welcomeDashboardIcons.gut, iconClassName: "scale-125" },
      { label: "Fitness", icon: welcomeDashboardIcons.fitness },
      { label: "Nutrition", icon: welcomeDashboardIcons.nutrition },
      { label: "Food", icon: welcomeDashboardIcons.food },
    ],
  },
];
