// Utility function to safely convert database values to proper types
export const convertFromDB = (obj: any): any => {
  if (!obj || typeof obj !== "object") return obj;

  const converted: any = { ...obj };

  // Convert common boolean fields from strings/numbers to actual booleans
  const booleanFields = [
    "isCompleted",
    "isStriker",
    "isNonStriker",
    "isBowling",
    "isWicket",
    "isWide",
    "isNoBall",
    "isDot",
  ];

  booleanFields.forEach((field) => {
    if (field in converted) {
      const value = converted[field];
      // Handle various boolean representations from SQLite
      if (typeof value === "string") {
        const s = value.trim().toLowerCase();
        converted[field] = s === "1" || s === "true" ? true : false;
      } else if (typeof value === "number") {
        converted[field] = value === 1;
      } else {
        converted[field] = Boolean(value);
      }
    }
  });

  // Ensure numeric fields are numbers
  const numberFields = ["maxOvers", "totalRuns", "wickets", "overs", "balls", "extras"];
  numberFields.forEach((field) => {
    if (field in converted && typeof converted[field] === "string") {
      converted[field] = parseInt(converted[field], 10) || 0;
    }
  });

  // Handle nested objects and arrays
  Object.keys(converted).forEach((key) => {
    if (Array.isArray(converted[key])) {
      converted[key] = converted[key].map((item) => convertFromDB(item));
    } else if (typeof converted[key] === "object" && converted[key] !== null) {
      converted[key] = convertFromDB(converted[key]);
    }
  });

  return converted;
};
