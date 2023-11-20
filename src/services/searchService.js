import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const searchPatients = async (key, value) => {
  const val = convertToDate(key,value);

  try {
    const response = await axios.get(`${API_BASE_URL}/patients/?${key}=${val}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    console.log('response?.data?', response?.data.status  );

    return response?.data?.map(item => ({
      id: item?.PatientID,
      name: item?.Name,
      dateOfBirth: new Date(item?.DateOfBirth),
      appointmentDate: new Date(item?.AppointmentDate),
      contactInformation: item?.ContactInformation,
      gender: item?.Gender,
      }));
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const searchMedicalHistory = async (key, value, id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/medical_history/${id}/?${key}=${value}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response?.data.map(item => ({
      id: item?.HistoryID,
      allergies: item?.Allergies,
      medications: item?.Medications,
      surgeries: item?.Surgeries,
      previousIllnesses: item?.PreviousIllnesses,
      patientID:item?.PatientID,
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

export const searchPrescriptions = async (key, value, id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/prescription/${id}/?${key}=${value}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response?.data?.map(item => ({
      id: item?.PrescriptionID,
      dosages: item?.Dosages,
      medications: item?.Medications,
      instructions: item?.Instructions,
      prescribedBy: localStorage.getItem('name'),
      patientID:item?.patientID,
    }));
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
};

function convertToDate(key, value) {
  if (key === 'AppointmentDate' || key === 'DateOfBirth') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      let month = (date.getMonth() + 1).toString().padStart(2, '0');
      let day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    } else {
      return 'Invalid date';
    }
  } else {
    return value;
  }
}