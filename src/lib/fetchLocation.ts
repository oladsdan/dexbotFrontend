export async function fetchLocationData() {
  try {
    const response = await fetch('/api/location');
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }
    const result = await response.json();
    
    // Return in the same format as before
    return {
      success: result.success,
      data: result.data
    };
  } catch (error) {
    console.error("Error fetching location:", error);
    return {
      success: false,
      error: error.message
    };
  }
}