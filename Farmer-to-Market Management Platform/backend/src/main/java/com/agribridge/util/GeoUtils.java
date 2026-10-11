package com.agribridge.util;

import java.util.Locale;
import java.util.Map;

/**
 * Resolves approximate lat/lng for Indian cities used in shipment tracking maps.
 */
public final class GeoUtils {

    private static final Map<String, double[]> CITY_COORDS = Map.ofEntries(
            Map.entry("nashik", new double[]{19.9975, 73.7898}),
            Map.entry("hyderabad", new double[]{17.3850, 78.4867}),
            Map.entry("hitech city", new double[]{17.4483, 78.3915}),
            Map.entry("pune", new double[]{18.5204, 73.8567}),
            Map.entry("mumbai", new double[]{19.0760, 72.8777}),
            Map.entry("bengaluru", new double[]{12.9716, 77.5946}),
            Map.entry("bangalore", new double[]{12.9716, 77.5946}),
            Map.entry("delhi", new double[]{28.6139, 77.2090}),
            Map.entry("new delhi", new double[]{28.6139, 77.2090}),
            Map.entry("chennai", new double[]{13.0827, 80.2707}),
            Map.entry("kolkata", new double[]{22.5726, 88.3639}),
            Map.entry("ahmedabad", new double[]{23.0225, 72.5714}),
            Map.entry("indore", new double[]{22.7196, 75.8577}),
            Map.entry("jaipur", new double[]{26.9124, 75.7873}),
            Map.entry("lucknow", new double[]{26.8467, 80.9462}),
            Map.entry("nagpur", new double[]{21.1458, 79.0882}),
            Map.entry("surat", new double[]{21.1702, 72.8311}),
            Map.entry("kochi", new double[]{9.9312, 76.2673}),
            Map.entry("coimbatore", new double[]{11.0168, 76.9558}),
            Map.entry("chandigarh", new double[]{30.7333, 76.7794}),
            Map.entry("bhopal", new double[]{23.2599, 77.4126}),
            Map.entry("visakhapatnam", new double[]{17.6868, 83.2185}),
            Map.entry("vijayawada", new double[]{16.5062, 80.6480}),
            Map.entry("maharashtra", new double[]{19.7515, 75.7139}),
            Map.entry("telangana", new double[]{18.1124, 79.0193})
    );

    private GeoUtils() {}

    public static double[] resolve(String location, Double fallbackLat, Double fallbackLng) {
        if (fallbackLat != null && fallbackLng != null) {
            return new double[]{fallbackLat, fallbackLng};
        }
        if (location != null && !location.isBlank()) {
            String lower = location.toLowerCase(Locale.ROOT);
            for (Map.Entry<String, double[]> entry : CITY_COORDS.entrySet()) {
                if (lower.contains(entry.getKey())) {
                    return entry.getValue();
                }
            }
            int hash = Math.abs(lower.hashCode());
            double lat = 15.0 + (hash % 1200) / 100.0;
            double lng = 73.0 + ((hash / 13) % 1400) / 100.0;
            return new double[]{lat, lng};
        }
        return new double[]{20.5937, 78.9629};
    }
}
