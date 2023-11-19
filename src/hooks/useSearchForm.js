import { useState } from 'react';

export const useSearchForm = (props, searchPatients, searchMedicalHistory, searchPrescriptions) => {
  const [searchKey, setSearchKey] = useState('');
  const [searchValue, setSearchValue] = useState('');

  const handleSearch = async (key, value) => {
    if(props.name === "patients"){
      const data = await searchPatients(key, value);
      props.setRows(data);
    } else if(props.name === "prescriptions"){
      const data = await searchPrescriptions(key, value, props?.id);
      props.setRows(data);
    } else {
      const data = await searchMedicalHistory(key, value, props?.id);
      props.setRows(data);
    }
  };

  return { searchKey, searchValue, setSearchKey, setSearchValue, handleSearch };
};