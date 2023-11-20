import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import PreviewIcon from '@mui/icons-material/Preview';
import Typography from '@mui/material/Typography';
// import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import {
  GridRowModes,
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
} from '@mui/x-data-grid';
import { randomId } from '@mui/x-data-grid-generator';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Search from './search';


function EditToolbar(props) {
  const { setRows, setRowModesModel, setUpdatePatient } = props;

  const handleClick = () => {
    setUpdatePatient(false);
    const id = randomId();
    setRows((oldRows) => [...oldRows, { id, name: '', contactInformation: '', gender: '', dateOfBirth: '', appointmentDate: '' }]);
    setRowModesModel((oldModel) => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

export default function PatientRecords() {
  const [rows, setRows] = useState([]);
  const [updatePatient, setUpdatePatient] = useState(false);
  const [rowModesModel, setRowModesModel] = useState({});
  const navigate = useNavigate();

  useEffect(()=>{
    async function fetchPatients(){
      try{ 
        const { data } = await axios.get('api/patients/',{ headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }});
        console.log('data', data);

        const initialRows = data.map(item => ({
            id: item.PatientID,
            name: item.Name,
            dateOfBirth: new Date(item?.DateOfBirth),
            appointmentDate: new Date(item?.AppointmentDate),
            contactInformation: item.ContactInformation,
            gender: item.Gender,
        }));

        console.log('initialRows ', initialRows );
        setRows(initialRows);
        } catch (error) {
          navigate('/');
      }
    }
    fetchPatients();
  },[navigate]);

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setUpdatePatient(true);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  // const handleDownloadClick = (id) => () => {
  //   console.log('download report...');
  // };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));

    const config = {
      method: 'delete',
      url: `http://127.0.0.1:8000/api/delete_patient/${id}/`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      toast.success('Successfully deleted');
    })
    .catch(function (error) {
      console.log(error);
      toast.error('error deleting patient');
    });

  };

  const handleExpandClick = (id) => () => {
    if(JSON.stringify(id).length > 4){
      window.location.reload();
    }else{
      navigate(JSON.stringify(id));
    }
  };

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });

    const editedRow = rows.find((row) => row.id === id);
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  const processRowUpdate = async (newRow) => {
    console.log('newRowww', newRow);
    const formData = new FormData();
    formData.append('contactInformation', newRow?.contactInformation );
    let dateOfBirth = new Date(newRow?.dateOfBirth);
    let formattedDateOfBirth = dateOfBirth.getFullYear() + '-' + 
                        String(dateOfBirth.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(dateOfBirth.getDate()).padStart(2, '0');
    let appointmentDate = new Date(newRow?.appointmentDate);
    let formattedAppointmentDate = appointmentDate.getFullYear() + '-' + 
                        String(appointmentDate.getMonth() + 1).padStart(2, '0') + '-' + 
                        String(appointmentDate.getDate()).padStart(2, '0');

    formData.append('DateOfBirth', formattedDateOfBirth);
    formData.append('AppointmentDate', formattedAppointmentDate);
    formData.append('Gender', newRow?.gender);
    formData.append('Name', newRow?.name);
    formData.append('ContactInformation', newRow?.contactInformation);
    formData.append('PatientID', newRow?.id);

    const endpoint = updatePatient ? `update_patient/${newRow.id}/` : 'patients_create/';
    try {
      await axios({
        method: updatePatient? 'put' : 'post',
        url: `http://127.0.0.1:8000/api/${endpoint}`,
        data: formData,
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      toast.success("Saved!");
      window.location.reload();

    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Error saving.');
    }
    
    const updatedRow = { ...newRow, isNew: false };
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)));
    return updatedRow;
  };

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const columns = [
    { field: 'name', headerName: 'Name', width: 180, editable: true },
    { field: 'gender', headerName: 'Gender', width: 100, editable: true },
    {
      field: 'dateOfBirth',
      headerName: 'Date Of Birth',
      type: 'date',
      width: 150,
      editable: true,
    },
    {
      field: 'appointmentDate',
      headerName: 'Appointment Date',
      type: 'date',
      width: 180,
      editable: true,
    },
    { field: 'contactInformation', headerName: 'Contact Information', width: 180, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 210,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ];
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<PreviewIcon />}
            label="View Medical History"
            onClick={handleExpandClick(id)}
            color="inherit"
          />,
          // <GridActionsCellItem
          //   icon={<CloudDownloadIcon />}
          //   label="Download Report"
          //   onClick={handleDownloadClick(id)}
          //   color="inherit"
          // />,
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <Typography
              component="h1"
              variant="h5"
              align="center"
              color="text.primary"
              gutterBottom
            >
              Patient Records
      </Typography>
      <br />

      <Search search={rows} setRows={setRows} name="patients"/>
      <br />
      
      <DataGrid
        rows={rows}
        columns={columns}
        editMode="row"
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
          toolbar: EditToolbar,
        }}
        slotProps={{
          toolbar: { setRows, setRowModesModel, setUpdatePatient },
        }}
      />
    </Box>
  );
}
