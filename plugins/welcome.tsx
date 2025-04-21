export const WelcomeMessage = () => (
  <div className="bg-blue-100 p-4 rounded-md shadow-sm">
    <h2 className="text-lg font-bold text-blue-800">
      Welcome to Our Platform!
    </h2>
    <p className="text-blue-600 mt-2">
      We're glad you're here. Start exploring our features.
    </p>
  </div>
);

// Hook registrations
export const actions = [
  { hookName: "Nex-header", position: 3, componentName: "WelcomeMessage" },
];

// Route registrations
export const routes = [
  {
    type: "view",
    route: "/welcome",
    componentName: "WelcomeMessage",
    position: 2,
  },
];
