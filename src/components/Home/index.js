import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import PatientRecords from './patientsRecordTable';
import MedicalHistory from './patientsMedicalHistory';
import LogoutIcon from '@mui/icons-material/Logout';
import { useParams } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Presciptions from './patientsPrescriptions';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  overflow: 'scroll',
  minHeight: '500px',
  color: theme.palette.text.secondary,
}));

const defaultTheme = createTheme();

export default function Home() {
  let { userId } = useParams();
  const navigate = useNavigate();

  const goBack = () => {
    navigate('/home')
  };

  const logout = () => {
    localStorage.clear();
    navigate('/')
  };
  
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <AppBar position="relative">
      <ToastContainer />
        <Toolbar>
          <div style={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <CameraIcon sx={{ mr: 2 }} />
            <Typography variant="h6" color="inherit" noWrap>
              MediData
            </Typography>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IconButton onClick={logout} color="inherit" size="small">
              <LogoutIcon /> logout
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      <main>
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth="lg">
            { userId ? 
                <> 
                <IconButton onClick={goBack} color="inherit" size="small">
                  <ArrowBackIcon />
                </IconButton>
                  
                  <Box sx={{ width: '100%' }}>
                    <Stack spacing={2}>
                      <Item ><MedicalHistory id={userId} /></Item>
                      <Divider />
                      <Item ><Presciptions id={userId}/></Item>
                    </Stack>
                  </Box>

                </> 
                : 
                  <PatientRecords /> 
            }
          </Container> 
        </Box>
      </main>
    </ThemeProvider>
  );
}