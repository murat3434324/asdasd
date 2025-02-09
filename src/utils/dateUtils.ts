export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
};

export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const getTotalDuration = (hours: number, minutes: number) => {
  return `${hours}h ${minutes}m`;
};

// Format to send from frontend to backend (YYYY-MM-DD)
export const formatDateForBackend = (date: string) => {
  if (!date) return "";

  // If already in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Convert from DD-MM-YYYY to YYYY-MM-DD
  const [day, month, year] = date.split("-").map(part => part.trim());
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// Format to display from backend to frontend (DD-MM-YYYY)
export const formatDateForDisplay = (date: string) => {
  if (!date) return "";

  // If already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
    return date;
  }

  // Convert from YYYY-MM-DD to DD-MM-YYYY
  const [year, month, day] = date.split("-");
  return `${day}-${month}-${year}`;
}; 