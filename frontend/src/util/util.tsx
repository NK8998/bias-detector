export const GLASS_CARD =
  "bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl hover:shadow-2xl hover:border-blue-400/20";

export const computeSelectionRates = (metricsByGender) => {
  if (metricsByGender?.selection_rate) {
    const male = metricsByGender.selection_rate[1] ?? 0;
    const female = metricsByGender.selection_rate[0] ?? 0;

    return [
      { group: "Male (1)", rate: male, color: "blue" },
      { group: "Female/Other (0)", rate: female, color: "pink" },
    ];
  }

  // fallback
  return [
    { group: "Male (1)", rate: 0.65, color: "blue" },
    { group: "Female/Other (0)", rate: 0.83, color: "pink" },
  ];
};
