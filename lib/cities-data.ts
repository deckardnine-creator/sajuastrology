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
  { name: "Suwon", country: "South Korea", countryCode: "KR", longitude: 127.0286, latitude: 37.2636, timezone: "Asia/Seoul" },
  { name: "Ulsan", country: "South Korea", countryCode: "KR", longitude: 129.3114, latitude: 35.5384, timezone: "Asia/Seoul" },
  { name: "Changwon", country: "South Korea", countryCode: "KR", longitude: 128.6811, latitude: 35.2281, timezone: "Asia/Seoul" },
  { name: "Goyang", country: "South Korea", countryCode: "KR", longitude: 126.8320, latitude: 37.6584, timezone: "Asia/Seoul" },
  { name: "Seongnam", country: "South Korea", countryCode: "KR", longitude: 127.1267, latitude: 37.4201, timezone: "Asia/Seoul" },
  { name: "Cheongju", country: "South Korea", countryCode: "KR", longitude: 127.4890, latitude: 36.6424, timezone: "Asia/Seoul" },
  { name: "Jeonju", country: "South Korea", countryCode: "KR", longitude: 127.1480, latitude: 35.8242, timezone: "Asia/Seoul" },
  { name: "Jeju", country: "South Korea", countryCode: "KR", longitude: 126.5312, latitude: 33.4996, timezone: "Asia/Seoul" },
  { name: "Pohang", country: "South Korea", countryCode: "KR", longitude: 129.3435, latitude: 36.0190, timezone: "Asia/Seoul" },
  { name: "Yongin", country: "South Korea", countryCode: "KR", longitude: 127.1775, latitude: 37.2411, timezone: "Asia/Seoul" },
  
  // USA
  { name: "New York", country: "United States", countryCode: "US", longitude: -74.006, latitude: 40.7128, timezone: "America/New_York" },
  { name: "Los Angeles", country: "United States", countryCode: "US", longitude: -118.2437, latitude: 34.0522, timezone: "America/Los_Angeles" },
  { name: "Chicago", country: "United States", countryCode: "US", longitude: -87.6298, latitude: 41.8781, timezone: "America/Chicago" },
  { name: "Houston", country: "United States", countryCode: "US", longitude: -95.3698, latitude: 29.7604, timezone: "America/Chicago" },
  { name: "San Francisco", country: "United States", countryCode: "US", longitude: -122.4194, latitude: 37.7749, timezone: "America/Los_Angeles" },
  { name: "Seattle", country: "United States", countryCode: "US", longitude: -122.3321, latitude: 47.6062, timezone: "America/Los_Angeles" },
  { name: "Boston", country: "United States", countryCode: "US", longitude: -71.0589, latitude: 42.3601, timezone: "America/New_York" },
  { name: "Miami", country: "United States", countryCode: "US", longitude: -80.1918, latitude: 25.7617, timezone: "America/New_York" },
  { name: "Washington DC", country: "United States", countryCode: "US", longitude: -77.0369, latitude: 38.9072, timezone: "America/New_York" },
  { name: "Atlanta", country: "United States", countryCode: "US", longitude: -84.3880, latitude: 33.7490, timezone: "America/New_York" },
  { name: "Dallas", country: "United States", countryCode: "US", longitude: -96.7970, latitude: 32.7767, timezone: "America/Chicago" },
  { name: "Denver", country: "United States", countryCode: "US", longitude: -104.9903, latitude: 39.7392, timezone: "America/Denver" },
  { name: "San Diego", country: "United States", countryCode: "US", longitude: -117.1611, latitude: 32.7157, timezone: "America/Los_Angeles" },
  { name: "Portland", country: "United States", countryCode: "US", longitude: -122.6765, latitude: 45.5152, timezone: "America/Los_Angeles" },
  { name: "Las Vegas", country: "United States", countryCode: "US", longitude: -115.1398, latitude: 36.1699, timezone: "America/Los_Angeles" },
  { name: "Honolulu", country: "United States", countryCode: "US", longitude: -157.8583, latitude: 21.3069, timezone: "Pacific/Honolulu" },
  { name: "Philadelphia", country: "United States", countryCode: "US", longitude: -75.1652, latitude: 39.9526, timezone: "America/New_York" },
  { name: "Austin", country: "United States", countryCode: "US", longitude: -97.7431, latitude: 30.2672, timezone: "America/Chicago" },
  
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
  { name: "Yokohama", country: "Japan", countryCode: "JP", longitude: 139.6380, latitude: 35.4437, timezone: "Asia/Tokyo" },
  { name: "Nagoya", country: "Japan", countryCode: "JP", longitude: 136.9066, latitude: 35.1815, timezone: "Asia/Tokyo" },
  { name: "Sapporo", country: "Japan", countryCode: "JP", longitude: 141.3469, latitude: 43.0618, timezone: "Asia/Tokyo" },
  { name: "Fukuoka", country: "Japan", countryCode: "JP", longitude: 130.4017, latitude: 33.5904, timezone: "Asia/Tokyo" },
  { name: "Kobe", country: "Japan", countryCode: "JP", longitude: 135.1955, latitude: 34.6901, timezone: "Asia/Tokyo" },
  { name: "Hiroshima", country: "Japan", countryCode: "JP", longitude: 132.4596, latitude: 34.3853, timezone: "Asia/Tokyo" },
  { name: "Sendai", country: "Japan", countryCode: "JP", longitude: 140.8720, latitude: 38.2682, timezone: "Asia/Tokyo" },
  { name: "Nara", country: "Japan", countryCode: "JP", longitude: 135.8048, latitude: 34.6851, timezone: "Asia/Tokyo" },
  { name: "Okinawa", country: "Japan", countryCode: "JP", longitude: 127.6809, latitude: 26.3344, timezone: "Asia/Tokyo" },
  { name: "Kawasaki", country: "Japan", countryCode: "JP", longitude: 139.7172, latitude: 35.5308, timezone: "Asia/Tokyo" },
  { name: "Kitakyushu", country: "Japan", countryCode: "JP", longitude: 130.8333, latitude: 33.8833, timezone: "Asia/Tokyo" },
  { name: "Niigata", country: "Japan", countryCode: "JP", longitude: 139.0364, latitude: 37.9026, timezone: "Asia/Tokyo" },
  
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

  // ═══════════════════════════════════════════════════════════════
  // Expanded coverage — Latin America, Europe, Africa, additional Asia
  // Added to support 10-language service (ES/FR/PT/RU/HI/ID primary)
  // ═══════════════════════════════════════════════════════════════
  { name: "Barcelona", country: "Spain", countryCode: "ES", longitude: 2.1734, latitude: 41.3851, timezone: "Europe/Madrid" },
  { name: "Valencia", country: "Spain", countryCode: "ES", longitude: -0.3763, latitude: 39.4699, timezone: "Europe/Madrid" },
  { name: "Seville", country: "Spain", countryCode: "ES", longitude: -5.9845, latitude: 37.3891, timezone: "Europe/Madrid" },
  { name: "Zaragoza", country: "Spain", countryCode: "ES", longitude: -0.8891, latitude: 41.6488, timezone: "Europe/Madrid" },
  { name: "Malaga", country: "Spain", countryCode: "ES", longitude: -4.4214, latitude: 36.7213, timezone: "Europe/Madrid" },
  { name: "Bilbao", country: "Spain", countryCode: "ES", longitude: -2.935, latitude: 43.263, timezone: "Europe/Madrid" },
  { name: "Lyon", country: "France", countryCode: "FR", longitude: 4.8357, latitude: 45.764, timezone: "Europe/Paris" },
  { name: "Marseille", country: "France", countryCode: "FR", longitude: 5.3698, latitude: 43.2965, timezone: "Europe/Paris" },
  { name: "Toulouse", country: "France", countryCode: "FR", longitude: 1.4442, latitude: 43.6047, timezone: "Europe/Paris" },
  { name: "Bordeaux", country: "France", countryCode: "FR", longitude: -0.5792, latitude: 44.8378, timezone: "Europe/Paris" },
  { name: "Nice", country: "France", countryCode: "FR", longitude: 7.262, latitude: 43.7102, timezone: "Europe/Paris" },
  { name: "Strasbourg", country: "France", countryCode: "FR", longitude: 7.7521, latitude: 48.5734, timezone: "Europe/Paris" },
  { name: "Nantes", country: "France", countryCode: "FR", longitude: -1.5534, latitude: 47.2184, timezone: "Europe/Paris" },
  { name: "Lille", country: "France", countryCode: "FR", longitude: 3.0573, latitude: 50.6292, timezone: "Europe/Paris" },
  { name: "Lisbon", country: "Portugal", countryCode: "PT", longitude: -9.1393, latitude: 38.7223, timezone: "Europe/Lisbon" },
  { name: "Porto", country: "Portugal", countryCode: "PT", longitude: -8.6291, latitude: 41.1579, timezone: "Europe/Lisbon" },
  { name: "Braga", country: "Portugal", countryCode: "PT", longitude: -8.4265, latitude: 41.5454, timezone: "Europe/Lisbon" },
  { name: "Rio de Janeiro", country: "Brazil", countryCode: "BR", longitude: -43.1729, latitude: -22.9068, timezone: "America/Sao_Paulo" },
  { name: "Brasilia", country: "Brazil", countryCode: "BR", longitude: -47.8825, latitude: -15.7942, timezone: "America/Sao_Paulo" },
  { name: "Salvador", country: "Brazil", countryCode: "BR", longitude: -38.5014, latitude: -12.9777, timezone: "America/Bahia" },
  { name: "Fortaleza", country: "Brazil", countryCode: "BR", longitude: -38.5267, latitude: -3.7172, timezone: "America/Fortaleza" },
  { name: "Belo Horizonte", country: "Brazil", countryCode: "BR", longitude: -43.9386, latitude: -19.9167, timezone: "America/Sao_Paulo" },
  { name: "Manaus", country: "Brazil", countryCode: "BR", longitude: -60.0217, latitude: -3.119, timezone: "America/Manaus" },
  { name: "Curitiba", country: "Brazil", countryCode: "BR", longitude: -49.2731, latitude: -25.4284, timezone: "America/Sao_Paulo" },
  { name: "Recife", country: "Brazil", countryCode: "BR", longitude: -34.877, latitude: -8.0476, timezone: "America/Recife" },
  { name: "Porto Alegre", country: "Brazil", countryCode: "BR", longitude: -51.2177, latitude: -30.0346, timezone: "America/Sao_Paulo" },
  { name: "Taipei", country: "Taiwan", countryCode: "TW", longitude: 121.5654, latitude: 25.033, timezone: "Asia/Taipei" },
  { name: "Kaohsiung", country: "Taiwan", countryCode: "TW", longitude: 120.3014, latitude: 22.6273, timezone: "Asia/Taipei" },
  { name: "Taichung", country: "Taiwan", countryCode: "TW", longitude: 120.6736, latitude: 24.1477, timezone: "Asia/Taipei" },
  { name: "Tainan", country: "Taiwan", countryCode: "TW", longitude: 120.1966, latitude: 22.9908, timezone: "Asia/Taipei" },
  { name: "New Taipei", country: "Taiwan", countryCode: "TW", longitude: 121.4657, latitude: 25.012, timezone: "Asia/Taipei" },
  { name: "Chengdu", country: "China", countryCode: "CN", longitude: 104.0668, latitude: 30.5728, timezone: "Asia/Shanghai" },
  { name: "Xi'an", country: "China", countryCode: "CN", longitude: 108.9398, latitude: 34.3416, timezone: "Asia/Shanghai" },
  { name: "Nanjing", country: "China", countryCode: "CN", longitude: 118.7969, latitude: 32.0603, timezone: "Asia/Shanghai" },
  { name: "Hangzhou", country: "China", countryCode: "CN", longitude: 120.1551, latitude: 30.2741, timezone: "Asia/Shanghai" },
  { name: "Wuhan", country: "China", countryCode: "CN", longitude: 114.3055, latitude: 30.5928, timezone: "Asia/Shanghai" },
  { name: "Chongqing", country: "China", countryCode: "CN", longitude: 106.5516, latitude: 29.563, timezone: "Asia/Shanghai" },
  { name: "Macau", country: "China", countryCode: "MO", longitude: 113.5491, latitude: 22.1987, timezone: "Asia/Macau" },
  { name: "Moscow", country: "Russia", countryCode: "RU", longitude: 37.6173, latitude: 55.7558, timezone: "Europe/Moscow" },
  { name: "Saint Petersburg", country: "Russia", countryCode: "RU", longitude: 30.3351, latitude: 59.9343, timezone: "Europe/Moscow" },
  { name: "Novosibirsk", country: "Russia", countryCode: "RU", longitude: 82.9357, latitude: 55.0084, timezone: "Asia/Novosibirsk" },
  { name: "Yekaterinburg", country: "Russia", countryCode: "RU", longitude: 60.6057, latitude: 56.8389, timezone: "Asia/Yekaterinburg" },
  { name: "Kazan", country: "Russia", countryCode: "RU", longitude: 49.1221, latitude: 55.7887, timezone: "Europe/Moscow" },
  { name: "Sochi", country: "Russia", countryCode: "RU", longitude: 39.7303, latitude: 43.5855, timezone: "Europe/Moscow" },
  { name: "Vladivostok", country: "Russia", countryCode: "RU", longitude: 131.8855, latitude: 43.1198, timezone: "Asia/Vladivostok" },
  { name: "Chennai", country: "India", countryCode: "IN", longitude: 80.2707, latitude: 13.0827, timezone: "Asia/Kolkata" },
  { name: "Kolkata", country: "India", countryCode: "IN", longitude: 88.3639, latitude: 22.5726, timezone: "Asia/Kolkata" },
  { name: "Hyderabad", country: "India", countryCode: "IN", longitude: 78.4867, latitude: 17.385, timezone: "Asia/Kolkata" },
  { name: "Pune", country: "India", countryCode: "IN", longitude: 73.8567, latitude: 18.5204, timezone: "Asia/Kolkata" },
  { name: "Ahmedabad", country: "India", countryCode: "IN", longitude: 72.5714, latitude: 23.0225, timezone: "Asia/Kolkata" },
  { name: "Jaipur", country: "India", countryCode: "IN", longitude: 75.7873, latitude: 26.9124, timezone: "Asia/Kolkata" },
  { name: "Lucknow", country: "India", countryCode: "IN", longitude: 80.9462, latitude: 26.8467, timezone: "Asia/Kolkata" },
  { name: "Surabaya", country: "Indonesia", countryCode: "ID", longitude: 112.7521, latitude: -7.2504, timezone: "Asia/Jakarta" },
  { name: "Bandung", country: "Indonesia", countryCode: "ID", longitude: 107.6098, latitude: -6.9175, timezone: "Asia/Jakarta" },
  { name: "Medan", country: "Indonesia", countryCode: "ID", longitude: 98.6722, latitude: 3.5952, timezone: "Asia/Jakarta" },
  { name: "Semarang", country: "Indonesia", countryCode: "ID", longitude: 110.4203, latitude: -6.9667, timezone: "Asia/Jakarta" },
  { name: "Yogyakarta", country: "Indonesia", countryCode: "ID", longitude: 110.3695, latitude: -7.7956, timezone: "Asia/Jakarta" },
  { name: "Denpasar", country: "Indonesia", countryCode: "ID", longitude: 115.2191, latitude: -8.65, timezone: "Asia/Makassar" },
  { name: "Guadalajara", country: "Mexico", countryCode: "MX", longitude: -103.3496, latitude: 20.6597, timezone: "America/Mexico_City" },
  { name: "Monterrey", country: "Mexico", countryCode: "MX", longitude: -100.3161, latitude: 25.6866, timezone: "America/Monterrey" },
  { name: "Cancun", country: "Mexico", countryCode: "MX", longitude: -86.8515, latitude: 21.1619, timezone: "America/Cancun" },
  { name: "Tijuana", country: "Mexico", countryCode: "MX", longitude: -117.0382, latitude: 32.5149, timezone: "America/Tijuana" },
  { name: "Puebla", country: "Mexico", countryCode: "MX", longitude: -98.2063, latitude: 19.0414, timezone: "America/Mexico_City" },
  { name: "Cordoba", country: "Argentina", countryCode: "AR", longitude: -64.1888, latitude: -31.4201, timezone: "America/Argentina/Cordoba" },
  { name: "Rosario", country: "Argentina", countryCode: "AR", longitude: -60.6393, latitude: -32.9442, timezone: "America/Argentina/Buenos_Aires" },
  { name: "Mendoza", country: "Argentina", countryCode: "AR", longitude: -68.8272, latitude: -32.8895, timezone: "America/Argentina/Mendoza" },
  { name: "Santiago", country: "Chile", countryCode: "CL", longitude: -70.6693, latitude: -33.4489, timezone: "America/Santiago" },
  { name: "Valparaiso", country: "Chile", countryCode: "CL", longitude: -71.6197, latitude: -33.0472, timezone: "America/Santiago" },
  { name: "Bogota", country: "Colombia", countryCode: "CO", longitude: -74.0721, latitude: 4.711, timezone: "America/Bogota" },
  { name: "Medellin", country: "Colombia", countryCode: "CO", longitude: -75.5812, latitude: 6.2442, timezone: "America/Bogota" },
  { name: "Cali", country: "Colombia", countryCode: "CO", longitude: -76.532, latitude: 3.4516, timezone: "America/Bogota" },
  { name: "Lima", country: "Peru", countryCode: "PE", longitude: -77.0428, latitude: -12.0464, timezone: "America/Lima" },
  { name: "Cusco", country: "Peru", countryCode: "PE", longitude: -71.9675, latitude: -13.532, timezone: "America/Lima" },
  { name: "Manchester", country: "United Kingdom", countryCode: "GB", longitude: -2.2426, latitude: 53.4808, timezone: "Europe/London" },
  { name: "Edinburgh", country: "United Kingdom", countryCode: "GB", longitude: -3.1883, latitude: 55.9533, timezone: "Europe/London" },
  { name: "Birmingham", country: "United Kingdom", countryCode: "GB", longitude: -1.8904, latitude: 52.4862, timezone: "Europe/London" },
  { name: "Munich", country: "Germany", countryCode: "DE", longitude: 11.582, latitude: 48.1351, timezone: "Europe/Berlin" },
  { name: "Hamburg", country: "Germany", countryCode: "DE", longitude: 9.9937, latitude: 53.5511, timezone: "Europe/Berlin" },
  { name: "Frankfurt", country: "Germany", countryCode: "DE", longitude: 8.6821, latitude: 50.1109, timezone: "Europe/Berlin" },
  { name: "Milan", country: "Italy", countryCode: "IT", longitude: 9.19, latitude: 45.4642, timezone: "Europe/Rome" },
  { name: "Naples", country: "Italy", countryCode: "IT", longitude: 14.2681, latitude: 40.8518, timezone: "Europe/Rome" },
  { name: "Florence", country: "Italy", countryCode: "IT", longitude: 11.2558, latitude: 43.7696, timezone: "Europe/Rome" },
  { name: "Venice", country: "Italy", countryCode: "IT", longitude: 12.3155, latitude: 45.4408, timezone: "Europe/Rome" },
  { name: "Calgary", country: "Canada", countryCode: "CA", longitude: -114.0719, latitude: 51.0447, timezone: "America/Edmonton" },
  { name: "Ottawa", country: "Canada", countryCode: "CA", longitude: -75.6972, latitude: 45.4215, timezone: "America/Toronto" },
  { name: "Quebec City", country: "Canada", countryCode: "CA", longitude: -71.208, latitude: 46.8139, timezone: "America/Toronto" },
  { name: "Brisbane", country: "Australia", countryCode: "AU", longitude: 153.026, latitude: -27.4698, timezone: "Australia/Brisbane" },
  { name: "Perth", country: "Australia", countryCode: "AU", longitude: 115.8605, latitude: -31.9505, timezone: "Australia/Perth" },
  { name: "Adelaide", country: "Australia", countryCode: "AU", longitude: 138.6007, latitude: -34.9285, timezone: "Australia/Adelaide" },
  { name: "Cairo", country: "Egypt", countryCode: "EG", longitude: 31.2357, latitude: 30.0444, timezone: "Africa/Cairo" },
  { name: "Lagos", country: "Nigeria", countryCode: "NG", longitude: 3.3792, latitude: 6.5244, timezone: "Africa/Lagos" },
  { name: "Johannesburg", country: "South Africa", countryCode: "ZA", longitude: 28.0473, latitude: -26.2041, timezone: "Africa/Johannesburg" },
  { name: "Cape Town", country: "South Africa", countryCode: "ZA", longitude: 18.4241, latitude: -33.9249, timezone: "Africa/Johannesburg" },
  { name: "Nairobi", country: "Kenya", countryCode: "KE", longitude: 36.8219, latitude: -1.2921, timezone: "Africa/Nairobi" },
  { name: "Casablanca", country: "Morocco", countryCode: "MA", longitude: -7.5898, latitude: 33.5731, timezone: "Africa/Casablanca" },
  { name: "Dakar", country: "Senegal", countryCode: "SN", longitude: -17.4467, latitude: 14.7167, timezone: "Africa/Dakar" },
  { name: "Da Nang", country: "Vietnam", countryCode: "VN", longitude: 108.2022, latitude: 16.0544, timezone: "Asia/Ho_Chi_Minh" },
  { name: "Chiang Mai", country: "Thailand", countryCode: "TH", longitude: 98.9853, latitude: 18.7883, timezone: "Asia/Bangkok" },
  { name: "Istanbul", country: "Turkey", countryCode: "TR", longitude: 28.9784, latitude: 41.0082, timezone: "Europe/Istanbul" },
  { name: "Tehran", country: "Iran", countryCode: "IR", longitude: 51.389, latitude: 35.6892, timezone: "Asia/Tehran" },
  { name: "Riyadh", country: "Saudi Arabia", countryCode: "SA", longitude: 46.6753, latitude: 24.7136, timezone: "Asia/Riyadh" },
  { name: "Warsaw", country: "Poland", countryCode: "PL", longitude: 21.0122, latitude: 52.2297, timezone: "Europe/Warsaw" },
  { name: "Prague", country: "Czech Republic", countryCode: "CZ", longitude: 14.4378, latitude: 50.0755, timezone: "Europe/Prague" },
  { name: "Budapest", country: "Hungary", countryCode: "HU", longitude: 19.0402, latitude: 47.4979, timezone: "Europe/Budapest" },
  { name: "Kyiv", country: "Ukraine", countryCode: "UA", longitude: 30.5234, latitude: 50.4501, timezone: "Europe/Kyiv" },
  { name: "Stockholm", country: "Sweden", countryCode: "SE", longitude: 18.0686, latitude: 59.3293, timezone: "Europe/Stockholm" },
  { name: "Copenhagen", country: "Denmark", countryCode: "DK", longitude: 12.5683, latitude: 55.6761, timezone: "Europe/Copenhagen" },
  { name: "Oslo", country: "Norway", countryCode: "NO", longitude: 10.7522, latitude: 59.9139, timezone: "Europe/Oslo" },
  { name: "Helsinki", country: "Finland", countryCode: "FI", longitude: 24.9384, latitude: 60.1699, timezone: "Europe/Helsinki" },
  { name: "Zurich", country: "Switzerland", countryCode: "CH", longitude: 8.5417, latitude: 47.3769, timezone: "Europe/Zurich" },
  { name: "Geneva", country: "Switzerland", countryCode: "CH", longitude: 6.1432, latitude: 46.2044, timezone: "Europe/Zurich" },
  { name: "Vienna", country: "Austria", countryCode: "AT", longitude: 16.3738, latitude: 48.2082, timezone: "Europe/Vienna" },
  { name: "Brussels", country: "Belgium", countryCode: "BE", longitude: 4.3517, latitude: 50.8503, timezone: "Europe/Brussels" },
  { name: "Dublin", country: "Ireland", countryCode: "IE", longitude: -6.2603, latitude: 53.3498, timezone: "Europe/Dublin" },
];

// ─── Localized aliases for Korean/Japanese search ───
// Key = City.name, Value = array of alternate search terms
const CITY_ALIASES: Record<string, string[]> = {
  // Korean cities (한국어)
  "Seoul":     ["서울", "ソウル"],
  "Busan":     ["부산", "釜山", "プサン"],
  "Incheon":   ["인천", "仁川", "インチョン"],
  "Daegu":     ["대구", "大邱", "テグ"],
  "Daejeon":   ["대전", "大田", "テジョン"],
  "Gwangju":   ["광주", "光州", "クァンジュ"],
  "Suwon":     ["수원", "水原", "スウォン"],
  "Ulsan":     ["울산", "蔚山", "ウルサン"],
  "Changwon":  ["창원", "昌原", "チャンウォン"],
  "Goyang":    ["고양", "高陽", "コヤン"],
  "Seongnam":  ["성남", "城南", "ソンナム"],
  "Cheongju":  ["청주", "清州", "チョンジュ"],
  "Jeonju":    ["전주", "全州", "チョンジュ"],
  "Jeju":      ["제주", "濟州", "チェジュ"],
  "Pohang":    ["포항", "浦項", "ポハン"],
  "Yongin":    ["용인", "龍仁", "ヨンイン"],

  // Japanese cities (日本語) — includes hiragana for mobile keyboard input
  "Tokyo":      ["도쿄", "東京", "とうきょう"],
  "Osaka":      ["오사카", "大阪", "おおさか"],
  "Kyoto":      ["교토", "京都", "きょうと"],
  "Yokohama":   ["요코하마", "横浜", "よこはま"],
  "Nagoya":     ["나고야", "名古屋", "なごや"],
  "Sapporo":    ["삿포로", "札幌", "さっぽろ"],
  "Fukuoka":    ["후쿠오카", "福岡", "ふくおか"],
  "Kobe":       ["고베", "神戸", "こうべ"],
  "Hiroshima":  ["히로시마", "広島", "ひろしま"],
  "Sendai":     ["센다이", "仙台", "せんだい"],
  "Nara":       ["나라", "奈良", "なら"],
  "Okinawa":    ["오키나와", "沖縄", "おきなわ"],
  "Kawasaki":   ["가와사키", "川崎", "かわさき"],
  "Kitakyushu": ["기타큐슈", "北九州", "きたきゅうしゅう"],
  "Niigata":    ["니가타", "新潟", "にいがた"],

  // Chinese cities
  "Beijing":    ["베이징", "北京", "ペキン"],
  "Shanghai":   ["상하이", "上海", "シャンハイ"],
  "Hong Kong":  ["홍콩", "香港", "ホンコン"],
  "Guangzhou":  ["광저우", "広州", "グァンジョウ"],
  "Shenzhen":   ["선전", "深圳", "シンセン"],

  // Major international cities
  "New York":       ["뉴욕", "ニューヨーク"],
  "Los Angeles":    ["로스앤젤레스", "LA", "엘에이", "ロサンゼルス"],
  "Chicago":        ["시카고", "シカゴ"],
  "Houston":        ["휴스턴", "ヒューストン"],
  "San Francisco":  ["샌프란시스코", "サンフランシスコ"],
  "Seattle":        ["시애틀", "シアトル"],
  "Boston":         ["보스턴", "ボストン"],
  "Miami":          ["마이애미", "マイアミ"],
  "Washington DC":  ["워싱턴", "ワシントン"],
  "Atlanta":        ["애틀랜타", "アトランタ"],
  "Dallas":         ["달라스", "ダラス"],
  "Denver":         ["덴버", "デンバー"],
  "San Diego":      ["샌디에이고", "サンディエゴ"],
  "Portland":       ["포틀랜드", "ポートランド"],
  "Las Vegas":      ["라스베이거스", "ラスベガス"],
  "Honolulu":       ["호놀룰루", "ホノルル"],
  "Philadelphia":   ["필라델피아", "フィラデルフィア"],
  "Austin":         ["오스틴", "オースティン"],
  "London":         ["런던", "ロンドン"],
  "Paris":          ["파리", "パリ"],
  "Berlin":         ["베를린", "ベルリン"],
  "Rome":           ["로마", "ローマ"],
  "Madrid":         ["마드리드", "マドリード"],
  "Amsterdam":      ["암스테르담", "アムステルダム"],
  "Singapore":      ["싱가포르", "シンガポール"],
  "Bangkok":        ["방콕", "バンコク"],
  "Hanoi":          ["하노이", "ハノイ"],
  "Ho Chi Minh City": ["호치민", "ホーチミン"],
  "Manila":         ["마닐라", "マニラ"],
  "Jakarta":        ["자카르타", "ジャカルタ"],
  "Sydney":         ["시드니", "シドニー"],
  "Melbourne":      ["멜버른", "メルボルン"],
  "Auckland":       ["오클랜드", "オークランド"],
  "Toronto":        ["토론토", "トロント"],
  "Vancouver":      ["밴쿠버", "バンクーバー"],
  "Montreal":       ["몬트리올", "モントリオール"],
  "Sao Paulo":      ["상파울루", "サンパウロ"],
  "Buenos Aires":   ["부에노스아이레스", "ブエノスアイレス"],
  "Mexico City":    ["멕시코시티", "メキシコシティ"],
  "Dubai":          ["두바이", "ドバイ"],
  "Tel Aviv":       ["텔아비브", "テルアビブ"],
  "Mumbai":         ["뭄바이", "ムンバイ"],
  "Delhi":          ["델리", "デリー"],
  "Bangalore":      ["방갈로르", "バンガロール"],

  // ═══ Expanded multilingual aliases ═══
  // Aliases per city include: [Korean, Chinese/Hanja, Japanese katakana,
  //                           + native-script variant when non-Latin (Cyrillic/Devanagari)]
  "Barcelona": ["바르셀로나", "巴塞罗那", "バルセロナ"],
  "Valencia": ["발렌시아", "瓦倫西亞", "バレンシア"],
  "Seville": ["세비야", "塞維亞", "セビリア", "Sevilla"],
  "Zaragoza": ["사라고사", "薩拉戈薩", "サラゴサ"],
  "Malaga": ["말라가", "馬拉加", "マラガ", "Málaga"],
  "Bilbao": ["빌바오", "畢爾包", "ビルバオ"],
  "Lyon": ["리옹", "里昂", "リヨン"],
  "Marseille": ["마르세유", "馬賽", "マルセイユ"],
  "Toulouse": ["툴루즈", "土魯斯", "トゥールーズ"],
  "Bordeaux": ["보르도", "波爾多", "ボルドー"],
  "Nice": ["니스", "尼斯", "ニース"],
  "Strasbourg": ["스트라스부르", "斯特拉斯堡", "ストラスブール"],
  "Nantes": ["낭트", "南特", "ナント"],
  "Lille": ["릴", "里爾", "リール"],
  "Lisbon": ["리스본", "里斯本", "リスボン", "Lisboa"],
  "Porto": ["포르투", "波爾圖", "ポルト"],
  "Braga": ["브라가", "布拉加", "ブラガ"],
  "Rio de Janeiro": ["리우데자네이루", "里約熱內盧", "リオデジャネイロ"],
  "Brasilia": ["브라질리아", "巴西利亞", "ブラジリア", "Brasília"],
  "Salvador": ["살바도르", "薩爾瓦多", "サルヴァドール"],
  "Fortaleza": ["포르탈레자", "福塔萊薩", "フォルタレザ"],
  "Belo Horizonte": ["벨루오리존치", "美景市", "ベロオリゾンテ"],
  "Manaus": ["마나우스", "馬瑙斯", "マナウス"],
  "Curitiba": ["쿠리치바", "庫里奇巴", "クリチバ"],
  "Recife": ["헤시피", "累西腓", "レシフェ"],
  "Porto Alegre": ["포르투알레그리", "愉港", "ポルトアレグレ"],
  "Taipei": ["타이베이", "台北", "タイペイ"],
  "Kaohsiung": ["가오슝", "高雄", "カオシュン"],
  "Taichung": ["타이중", "台中", "タイチュン"],
  "Tainan": ["타이난", "台南", "タイナン"],
  "New Taipei": ["신베이", "新北", "しんぺい"],
  "Chengdu": ["청두", "成都", "チェンドゥ"],
  "Xi'an": ["시안", "西安", "シーアン"],
  "Nanjing": ["난징", "南京", "ナンキン"],
  "Hangzhou": ["항저우", "杭州", "ハンジョウ"],
  "Wuhan": ["우한", "武漢", "ウーハン"],
  "Chongqing": ["충칭", "重慶", "チョンチン"],
  "Macau": ["마카오", "澳門", "マカオ"],
  "Moscow": ["모스크바", "莫斯科", "モスクワ", "Москва"],
  "Saint Petersburg": ["상트페테르부르크", "聖彼得堡", "サンクトペテルブルク", "Санкт-Петербург"],
  "Novosibirsk": ["노보시비르스크", "新西伯利亞", "ノヴォシビルスク", "Новосибирск"],
  "Yekaterinburg": ["예카테린부르크", "葉卡捷琳堡", "エカテリンブルク", "Екатеринбург"],
  "Kazan": ["카잔", "喀山", "カザン", "Казань"],
  "Sochi": ["소치", "索契", "ソチ", "Сочи"],
  "Vladivostok": ["블라디보스토크", "海參崴", "ウラジオストク", "Владивосток"],
  "Chennai": ["첸나이", "金奈", "チェンナイ", "चेन्नई"],
  "Kolkata": ["콜카타", "加爾各答", "コルカタ", "कोलकाता"],
  "Hyderabad": ["하이데라바드", "海德拉巴", "ハイデラバード", "हैदराबाद"],
  "Pune": ["푸네", "浦那", "プネ", "पुणे"],
  "Ahmedabad": ["아메다바드", "艾哈邁達巴德", "アフマダーバード", "अहमदाबाद"],
  "Jaipur": ["자이푸르", "齋浦爾", "ジャイプル", "जयपुर"],
  "Lucknow": ["러크나우", "勒克瑙", "ラクナウ", "लखनऊ"],
  "Surabaya": ["수라바야", "泗水", "スラバヤ"],
  "Bandung": ["반둥", "萬隆", "バンドン"],
  "Medan": ["메단", "棉蘭", "メダン"],
  "Semarang": ["스마랑", "三寶壟", "スマラン"],
  "Yogyakarta": ["족자카르타", "日惹", "ジョグジャカルタ"],
  "Denpasar": ["덴파사르", "丹帕沙", "デンパサール", "Bali"],
  "Guadalajara": ["과달라하라", "瓜達拉哈拉", "グアダラハラ"],
  "Monterrey": ["몬테레이", "蒙特雷", "モンテレイ"],
  "Cancun": ["칸쿤", "坎昆", "カンクン", "Cancún"],
  "Tijuana": ["티후아나", "蒂華納", "ティフアナ"],
  "Puebla": ["푸에블라", "普埃布拉", "プエブラ"],
  "Cordoba": ["코르도바", "科爾多瓦", "コルドバ", "Córdoba"],
  "Rosario": ["로사리오", "羅薩里奧", "ロサリオ"],
  "Mendoza": ["멘도사", "門多薩", "メンドーサ"],
  "Santiago": ["산티아고", "聖地牙哥", "サンティアゴ"],
  "Valparaiso": ["발파라이소", "瓦爾帕萊索", "バルパライソ", "Valparaíso"],
  "Bogota": ["보고타", "波哥大", "ボゴタ", "Bogotá"],
  "Medellin": ["메데인", "麥德林", "メデジン", "Medellín"],
  "Cali": ["칼리", "卡利", "カリ"],
  "Lima": ["리마", "利馬", "リマ"],
  "Cusco": ["쿠스코", "庫斯科", "クスコ"],
  "Manchester": ["맨체스터", "曼徹斯特", "マンチェスター"],
  "Edinburgh": ["에든버러", "愛丁堡", "エディンバラ"],
  "Birmingham": ["버밍엄", "伯明翰", "バーミンガム"],
  "Munich": ["뮌헨", "慕尼黑", "ミュンヘン", "München"],
  "Hamburg": ["함부르크", "漢堡", "ハンブルク"],
  "Frankfurt": ["프랑크푸르트", "法蘭克福", "フランクフルト"],
  "Milan": ["밀라노", "米蘭", "ミラノ", "Milano"],
  "Naples": ["나폴리", "拿坡里", "ナポリ", "Napoli"],
  "Florence": ["피렌체", "佛羅倫斯", "フィレンツェ", "Firenze"],
  "Venice": ["베네치아", "威尼斯", "ベネチア", "Venezia"],
  "Calgary": ["캘거리", "卡加利", "カルガリー"],
  "Ottawa": ["오타와", "渥太華", "オタワ"],
  "Quebec City": ["퀘벡", "魁北克", "ケベック", "Québec"],
  "Brisbane": ["브리즈번", "布里斯本", "ブリスベン"],
  "Perth": ["퍼스", "珀斯", "パース"],
  "Adelaide": ["애들레이드", "阿德萊德", "アデレード"],
  "Cairo": ["카이로", "開羅", "カイロ"],
  "Lagos": ["라고스", "拉各斯", "ラゴス"],
  "Johannesburg": ["요하네스버그", "約翰尼斯堡", "ヨハネスブルク"],
  "Cape Town": ["케이프타운", "開普敦", "ケープタウン"],
  "Nairobi": ["나이로비", "奈洛比", "ナイロビ"],
  "Casablanca": ["카사블랑카", "卡薩布蘭卡", "カサブランカ"],
  "Dakar": ["다카르", "達喀爾", "ダカール"],
  "Da Nang": ["다낭", "峴港", "ダナン", "Đà Nẵng"],
  "Chiang Mai": ["치앙마이", "清邁", "チェンマイ", "เชียงใหม่"],
  "Istanbul": ["이스탄불", "伊斯坦堡", "イスタンブール"],
  "Tehran": ["테헤란", "德黑蘭", "テヘラン"],
  "Riyadh": ["리야드", "利雅德", "リヤド"],
  "Warsaw": ["바르샤바", "華沙", "ワルシャワ", "Warszawa"],
  "Prague": ["프라하", "布拉格", "プラハ", "Praha"],
  "Budapest": ["부다페스트", "布達佩斯", "ブダペスト"],
  "Kyiv": ["키이우", "基輔", "キーウ", "Київ", "Kiev"],
  "Stockholm": ["스톡홀름", "斯德哥爾摩", "ストックホルム"],
  "Copenhagen": ["코펜하겐", "哥本哈根", "コペンハーゲン", "København"],
  "Oslo": ["오슬로", "奧斯陸", "オスロ"],
  "Helsinki": ["헬싱키", "赫爾辛基", "ヘルシンキ"],
  "Zurich": ["취리히", "蘇黎世", "チューリッヒ"],
  "Geneva": ["제네바", "日內瓦", "ジュネーヴ", "Genève"],
  "Vienna": ["빈", "維也納", "ウィーン", "Wien"],
  "Brussels": ["브뤼셀", "布魯塞爾", "ブリュッセル", "Bruxelles"],
  "Dublin": ["더블린", "都柏林", "ダブリン"],
};

// Korean chosung (초성) extractor
const CHOSUNG_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function getChosung(str: string): string {
  return str.split('').map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return ch; // not a Korean syllable
    return CHOSUNG_LIST[Math.floor(code / 588)];
  }).join('');
}

// Check if query is all chosung (e.g. "ㅅㅇ" for 서울)
function isChosungOnly(str: string): boolean {
  return str.split('').every(ch => CHOSUNG_LIST.includes(ch));
}

export function searchCities(query: string): City[] {
  if (!query || query.length < 1) return [];
  const lowerQuery = query.toLowerCase();
  const chosungQuery = isChosungOnly(query) ? query : null;

  // For 1-char queries, show more results so users can see country variety
  // (e.g. "b" should surface Barcelona, Berlin, Boston, Bogotá, Bangkok etc.)
  const resultLimit = query.length === 1 ? 15 : 8;

  // Score each city for relevance ranking
  const scored: { city: City; score: number }[] = [];

  for (const city of CITIES) {
    let score = 0;
    const nameLower = city.name.toLowerCase();
    const aliases = CITY_ALIASES[city.name];

    // Prefix match on English name (highest priority)
    if (nameLower.startsWith(lowerQuery)) {
      score = 100;
    }
    // Prefix match on alias (covers Korean, Japanese, Chinese, Cyrillic,
    // Devanagari, and Latin-script variants like "Sevilla", "München")
    else if (aliases?.some(a => a.toLowerCase().startsWith(lowerQuery) || a.startsWith(query))) {
      score = 90;
    }
    // Chosung match (Korean-only — ㅅㅇ → 서울)
    else if (chosungQuery && aliases?.some(a => getChosung(a).startsWith(chosungQuery))) {
      score = 85;
    }
    // Contains match on English name
    else if (nameLower.includes(lowerQuery)) {
      score = 50;
    }
    // Contains match on alias
    else if (aliases?.some(a => a.toLowerCase().includes(lowerQuery) || a.includes(query))) {
      score = 40;
    }
    // Country match — raised from 30 → 60 so typing a country name
    // (e.g. "spain", "brazil") surfaces all of that country's cities
    // above unrelated prefix matches.
    else if (city.country.toLowerCase().includes(lowerQuery)) {
      score = 60;
    }

    if (score > 0) {
      // Bonus: shorter names rank higher (exact match feel)
      score += Math.max(0, 10 - nameLower.length);
      scored.push({ city, score });
    }
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, resultLimit)
    .map(s => s.city);
}

export function calculateSolarVariance(longitude: number): string {
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
