import { useState, useEffect } from 'react';
import { IBGEService } from '../services/ibgeService';

export const useCitySearch = () => {
  const [citySearch, setCitySearch] = useState("");
  const [allCities, setAllCities] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    const loadCities = async () => {
      setIsLoadingCities(true);
      const cities = await IBGEService.fetchCities();
      setAllCities(cities);
      setIsLoadingCities(false);
    };

    loadCities();
  }, []);

  const normalizeText = (text: string) => 
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const filteredCities = allCities.filter(c => 
    normalizeText(c).includes(normalizeText(citySearch))
  );

  return {
    citySearch,
    setCitySearch,
    allCities,
    isLoadingCities,
    filteredCities
  };
};
