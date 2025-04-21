export const InfoCard = () => (
  <div className="bg-green-100 p-4 rounded-md shadow-sm">
    <h2 className="text-lg font-bold text-green-800">Important Information</h2>
    <p className="text-green-600 mt-2">
      Check out our latest updates and announcements.
    </p>
  </div>
);

// Hook registrations
export const actions = [
  { hookName: "Nex-header", position: 4, componentName: "InfoCard" },
];

// Route registrations
export const routes = [
  {
    type: "view",
    route: "/info",
    componentName: "InfoCard",
    position: 3,
  },
];
