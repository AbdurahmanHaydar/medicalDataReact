import React from 'react';
import { TextField, Stack, Button, Autocomplete } from '@mui/material';
import { useSearchForm } from '../../hooks/useSearchForm';
import { searchPatients, searchMedicalHistory, searchPrescriptions } from '../../services/searchService';

export default function Search(props) {
  console.log('props', props);


  const { searchKey, searchValue, setSearchKey, setSearchValue, handleSearch } = useSearchForm(props, searchPatients, searchMedicalHistory, searchPrescriptions);

  let dropdowns = props.name === "patients" ? ['Name', 'Gender', 'AppointmentDate', 'DateOfBirth'] : ['Allergies', 'Medications', 'Surgeries', 'PreviousIllnesses'];
  if (props.name === "prescriptions") dropdowns = ['Dosages', 'Medications', 'Instructions'];

  return (
    <Stack direction="row" spacing={2} sx={{ width: '100%' }}>
      <Autocomplete
        id="free-solo-demo"
        freeSolo
        onChange={(event, value) => setSearchKey(value)}
        options={ dropdowns}
        renderInput={(params) => <TextField sx={{ width: '200px' }} {...params} label="Select Search Key" />}
      />
      <TextField
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        sx={{ width: '200px' }} 
        label="Enter Search Value"
      />
      <Button variant="outlined" onClick={() => handleSearch(searchKey, searchValue)}>Search</Button>
    </Stack>
  );
}
