import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
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
  const { setRows, setRowModesModel, setUpdateMedicalHistory } = props;

  const handleClick = () => {
    setUpdateMedicalHistory(false);
    let id = randomId();
    setRows((oldRows) => [...oldRows, { id, previousIllnesses: '', patientID:'', allergies :'', surgeries:'', medications: '', isNew: true }]);
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

export default function MedicalHistory({id}) {
  const [rows, setRows] = useState([]);
  const [rowModesModel, setRowModesModel] = useState({});
  const [updateMedicalHistory, setUpdateMedicalHistory] = useState(false);
  const navigate = useNavigate();

  console.log('id 1', id);

  useEffect(()=>{
    async function fetchMedicalhistory(){
      try {
        const { data } = await axios.get(`http://127.0.0.1:8000/api/medical_history/${id}/`,{ headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }});
    
        const initialRows = data.map(item => ({
            id: item.HistoryID,
            allergies: item.Allergies,
            medications: item.Medications,
            surgeries: item.Surgeries,
            previousIllnesses: item.PreviousIllnesses,
            patientID:item.patientID,
        }));

        setRows(initialRows);

      } catch (error) {
        console.log(error);
        // navigate('/');
      }
    }

    fetchMedicalhistory();
  },[id, navigate]);


  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id) => () => {
    setUpdateMedicalHistory(true);
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id));

    const config = {
      method: 'delete',
      url: `http://127.0.0.1:8000/api/medical_history_delete/${id}/`,
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    };

    axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      toast.success(JSON.stringify(response.data?.details) || 'Deleted');
    })
    .catch(function (error) {
      console.log(error);
      toast.error('error deleting patient');
    });
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
    console.log('newRow', newRow);
    console.log('iddd',id);

    const formData = new FormData();
    formData.append('Allergies', newRow?.allergies);
    formData.append('Medications', newRow?.medications);
    formData.append('PreviousIllnesses', newRow?.previousIllnesses);
    formData.append('Surgeries', newRow?.surgeries);
    formData.append('PatientID', Number(id));
    formData.append('HistoryID', newRow?.id);

    try {

      const endpoint = updateMedicalHistory ? `medicalhistoryupdate/${newRow?.id}/` : 'medical_history_create/';

      await axios({
        method: updateMedicalHistory? 'put' : 'post',
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
    { field: 'allergies', headerName: 'Allergies', width: 180, editable: true },
    { field: 'medications', headerName: 'Medications', width: 180, editable: true },
    { field: 'surgeries', headerName: 'Surgeries', width: 180, editable: true },
    { field: 'previousIllnesses', headerName: 'PreviousIllnesses', width: 180, editable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
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
        ];
      },
    },
  ];

  return (
    <Box
      sx={{
        height: 300,
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
              Patient Medical History
      </Typography>

      <br />

      <Search search={rows} setRows={setRows} name="medicalhistroy" id={id}/>
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
          toolbar: { setRows, setRowModesModel, setUpdateMedicalHistory },
        }}
      />
    </Box>
  );
}
