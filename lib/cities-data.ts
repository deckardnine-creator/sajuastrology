// Major cities with coordinates for birth location selection
export interface City {
  name: string;
  country: string;
  countryCode: string;
  longitude: number;
  latitude: number;
  timezone: string;
}

export const CITIES: City[] = [
  // South Korea
  { name: "Seoul", country: "South Korea", countryCode: "KR", longitude: 126.978, latitude: 37.5665, timezone: "Asia/Seoul" },
  { name: "Busan", country: "South Korea", countryCode: "KR", longitude: 129.0756, latitude: 35.1796, timezone: "Asia/Seoul" },
  { name: "Incheon", country: "South Korea", countryCode: "KR", longitude: 126.7052, latitude: 37.4563, timezone: "Asia/Seoul" },
  { name: "Daegu", country: "South Korea", countryCode: "KR", longitude: 128.6014, latitude: 35.8714, timezone: "Asia/Seoul" },
  { name: "Daejeon", country: "South Korea", countryCode: "KR", longitude: 127.3845, latitude: 36.3504, timezone: "Asia/Seoul" },
  { name: "Gwangju", country: "South Korea", countryCode: "KR", longitude: 126.8526, latitude: 35.1595, timezone: "Asia/Seoul" },
  
  // USA
  { name: "New York", country: "United States", countryCode: "US", longitude: -74.006, latitude: 40.7128, timezone: "America/New_York" },
  { name: "Los Angeles", country: "United States", countryCode: "US", longitude: -118.2437, latitude: 34.0522, timezone: "America/Los_Angeles" },
  { name: "Chicago", country: "United States", countryCode: "US", longitude: -87.6298, latitude: 41.8781, timezone: "America/Chicago" },
  { name: "Houston", country: "United States", countryCode: "US", longitude: -95.3698, latitude: 29.7604, timezone: "America/Chicago" },
  { name: "San Francisco", country: "United States", countryCode: "US", longitude: -122.4194, latitude: 37.7749, timezone: "America/Los_Angeles" },
  { name: "Seattle", country: "United States", countryCode: "US", longitude: -122.3321, latitude: 47.6062, timezone: "America/Los_Angeles" },
  { name: "Boston", country: "United States", countryCode: "US", longitude: -71.0589, latitude: 42.3601, timezone: "America/New_York" },
  { name: "Miami", country: "United States", countryCode: "US", longitude: -80.1918, latitude: 25.7617, timezone: "America/New_York" },
  
  // China
  { name: "Beijing", country: "China", countryCode: "CN", longitude: 116.4074, latitude: 39.9042, timezone: "Asia/Shanghai" },
  { name: "Shanghai", country: "China", countryCode: "CN", longitude: 121.4737, latitude: 31.2304, timezone: "Asia/Shanghai" },
  { name: "Hong Kong", country: "China", countryCode: "HK", longitude: 114.1694, latitude: 22.3193, timezone: "Asia/Hong_Kong" },
  { name: "Guangzhou", country: "China", countryCode: "CN", longitude: 113.2644, latitude: 23.1291, timezone: "Asia/Shanghai" },
  { name: "Shenzhen", country: "China", countryCode: "CN", longitude: 114.0579, latitude: 22.5431, timezone: "Asia/Shanghai" },
  
  // Japan
  { name: "Tokyo", country: "Japan", countryCode: "JP", longitude: 139.6917, latitude: 35.6895, timezone: "Asia/Tokyo" },
  { name: "Osaka", country: "Japan", countryCode: "JP", longitude: 135.5023, latitude: 34.6937, timezone: "Asia/Tokyo" },
  { name: "Kyoto", country: "Japan", countryCode: "JP", longitude: 135.7681, latitude: 35.0116, timezone: "Asia/Tokyo" },
  
  // Europe
  { name: "London", country: "United Kingdom", countryCode: "GB", longitude: -0.1276, latitude: 51.5074, timezone: "Europe/London" },
  { name: "Paris", country: "France", countryCode: "FR", longitude: 2.3522, latitude: 48.8566, timezone: "Europe/Paris" },
  { name: "Berlin", country: "Germany", countryCode: "DE", longitude: 13.405, latitude: 52.52, timezone: "Europe/Berlin" },
  { name: "Rome", country: "Italy", countryCode: "IT", longitude: 12.4964, latitude: 41.9028, timezone: "Europe/Rome" },
  { name: "Madrid", country: "Spain", countryCode: "ES", longitude: -3.7038, latitude: 40.4168, timezone: "Europe/Madrid" },
  { name: "Amsterdam", country: "Netherlands", countryCode: "NL", longitude: 4.9041, latitude: 52.3676, timezone: "Europe/Amsterdam" },
  
  // Southeast Asia
  { name: "Singapore", country: "Singapore", countryCode: "SG", longitude: 103.8198, latitude: 1.3521, timezone: "Asia/Singapore" },
  { name: "Bangkok", country: "Thailand", countryCode: "TH", longitude: 100.5018, latitude: 13.7563, timezone: "Asia/Bangkok" },
  { name: "Hanoi", country: "Vietnam", countryCode: "VN", longitude: 105.8342, latitude: 21.0278, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Ho Chi Minh City", country: "Vietnam", countryCode: "VN", longitude: 106.6297, latitude: 10.8231, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Manila", country: "Philippines", countryCode: "PH", longitude: 120.9842, latitude: 14.5995, timezone: "Asia/Manila" },
  { name: "Jakarta", country: "Indonesia", countryCode: "ID", longitude: 106.8456, latitude: -6.2088, timezone: "Asia/Jakarta" },
  
  // Australia & NZ
  { name: "Sydney", country: "Australia", countryCode: "AU", longitude: 151.2093, latitude: -33.8688, timezone: "Australia/Sydney" },
  { name: "Melbourne", country: "Australia", countryCode: "AU", longitude: 144.9631, latitude: -37.8136, timezone: "Australia/Melbourne" },
  { name: "Auckland", country: "New Zealand", countryCode: "NZ", longitude: 174.7633, latitude: -36.8485, timezone: "Pacific/Auckland" },
  
  // Canada
  { name: "Toronto", country: "Canada", countryCode: "CA", longitude: -79.3832, latitude: 43.6532, timezone: "America/Toronto" },
  { name: "Vancouver", country: "Canada", countryCode: "CA", longitude: -123.1207, latitude: 49.2827, timezone: "America/Vancouver" },
  { name: "Montreal", country: "Canada", countryCode: "CA", longitude: -73.5673, latitude: 45.5017, timezone: "America/Montreal" },
  
  // South America
  { name: "Sao Paulo", country: "Brazil", countryCode: "BR", longitude: -46.6333, latitude: -23.5505, timezone: "America/Sao_Paulo" },
  { name: "Buenos Aires", country: "Argentina", countryCode: "AR", longitude: -58.3816, latitude: -34.6037, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Mexico City", country: "Mexico", countryCode: "MX", longitude: -99.1332, latitude: 19.4326, timezone: "America/Mexico_City" },
  
  // Middle East
  { name: "Dubai", country: "UAE", countryCode: "AE", longitude: 55.2708, latitude: 25.2048, timezone: "Asia/Dubai" },
  { name: "Tel Aviv", country: "Israel", countryCode: "IL", longitude: 34.7818, latitude: 32.0853, timezone: "Asia/Jerusalem" },
  
  // India
  { name: "Mumbai", country: "India", countryCode: "IN", longitude: 72.8777, latitude: 19.076, timezone: "Asia/Kolkata" },
  { name: "Delhi", country: "India", countryCode: "IN", longitude: 77.1025, latitude: 28.7041, timezone: "Asia/Kolkata" },
  { name: "Bangalore", country: "India", countryCode: "IN", longitude: 77.5946, latitude: 12.9716, timezone: "Asia/Kolkata" },
];

export function searchCities(query: string): City[] {
  if (!query || query.length < 2) return [];
  const lowerQuery = query.toLowerCase();
  return CITIES.filter(
    (city) =>
      city.name.toLowerCase().includes(lowerQuery) ||
      city.country.toLowerCase().includes(lowerQuery)
  ).slice(0, 8);
}

export function calculateSolarVariance(longitude: number): string {
  // Calculate the difference from standard time meridian
  // Each 15 degrees = 1 hour = 60 minutes
  const minutesOffset = (longitude % 15) * 4;
  const absMinutes = Math.abs(minutesOffset);
  const mins = Math.floor(absMinutes);
  const secs = Math.round((absMinutes - mins) * 60);
  const sign = minutesOffset >= 0 ? "+" : "-";
  return `${sign}${mins}m ${secs}s`;
}

export function formatLongitude(longitude: number): string {
  const abs = Math.abs(longitude);
  const direction = longitude >= 0 ? "E" : "W";
  return `${abs.toFixed(4)}° ${direction}`;
}
