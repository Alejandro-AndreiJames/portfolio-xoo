const fetchSuggestions = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/suggestions`, {
      params: {
        userId: user.value?.id,
        role: user.value?.role
      }
    });
    suggestions.value = response.data.data;
  } catch (error) {
    console.error('Error fetching suggestions:', error);
  }
}; 