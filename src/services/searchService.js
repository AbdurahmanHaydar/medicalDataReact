import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export const searchPatients = async (key, value) => {
  const response = await axios.get(`${API_BASE_URL}/patients/?${key}=${value}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data.map(item => ({
    id: item.PatientID,
    name: item.Name,
    dateOfBirth: new Date(item?.DateOfBirth),
    appointmentDate: new Date(item?.AppointmentDate),
    contactInformation: item.ContactInformation,
    gender: item.Gender,
    }));
};

export const searchMedicalHistory = async (key, value, id) => {
  const response = await axios.get(`${API_BASE_URL}/medical_history/${id}/?${key}=${value}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data.map(item => ({
    id: item.HistoryID,
    allergies: item.Allergies,
    medications: item.Medications,
    surgeries: item.Surgeries,
    previousIllnesses: item.PreviousIllnesses,
    patientID:item.PatientID,
  }));
};

export const searchPrescriptions = async (key, value, id) => {
  const response = await axios.get(`${API_BASE_URL}/prescription/${id}/?${key}=${value}`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  });
  return response.data.map(item => ({
    id: item.PrescriptionID,
    dosages: item.Dosages,
    medications: item.Medications,
    instructions: item.Instructions,
    prescribedBy: localStorage.getItem('name'),
    patientID:item.patientID,
  }));
};