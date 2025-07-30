import { useState, useEffect, useCallback } from "react";
import { styled } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Container from "@mui/material/Container";
import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { 
  Paper, 
  CardActionArea, 
  CardMedia, 
  Grid, 
  TableContainer, 
  Table, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell, 
  Button, 
  CircularProgress,
  Box
} from "@mui/material";
import mylogo from "./mylogo.PNG";
import bgImage from "./bg.png";
import { DropzoneArea } from 'mui-file-dropzone';
import ClearIcon from '@mui/icons-material/Clear';
import axios from "axios";

// Styled components for MUI v5
const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText('#ffffff'),
  backgroundColor: '#ffffff',
  '&:hover': {
    backgroundColor: '#ffffff7a',
  },
  width: '100%',
  borderRadius: '15px',
  padding: '15px 22px',
  fontSize: '20px',
  fontWeight: 900,
}));

const StyledCard = styled(Card)(({ theme, isEmpty }) => ({
  margin: 'auto',
  maxWidth: 400,
  height: isEmpty ? 'auto' : 500,
  backgroundColor: 'transparent',
  boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important',
  borderRadius: '15px',
}));

const StyledAppBar = styled(AppBar)({
  background: '#be6a77',
  boxShadow: 'none',
  color: 'white'
});

const StyledContainer = styled(Container)({
  backgroundImage: `url(${bgImage})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  height: '93vh',
  marginTop: '8px',
});

const StyledTableContainer = styled(TableContainer)({
  backgroundColor: 'transparent !important',
  boxShadow: 'none !important',
});

const StyledTable = styled(Table)({
  backgroundColor: 'transparent !important',
});

const StyledTableCell = styled(TableCell)({
  fontSize: '22px',
  backgroundColor: 'transparent !important',
  borderColor: 'transparent !important',
  color: '#000000a6 !important',
  fontWeight: 'bolder',
  padding: '1px 24px 1px 16px',
});

const StyledTableCellSmall = styled(TableCell)({
  fontSize: '14px',
  backgroundColor: 'transparent !important',
  borderColor: 'transparent !important',
  color: '#000000a6 !important',
  fontWeight: 'bolder',
  padding: '1px 24px 1px 16px',
});

const DetailContent = styled(CardContent)({
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  alignItems: 'center',
});

const StyledCircularProgress = styled(CircularProgress)({
  color: '#be6a77 !important',
});

export const ImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  let confidence = 0;

  const sendFile = useCallback(async () => {
    if (image && selectedFile) {
      try {
        console.log('Sending file to API:', process.env.REACT_APP_API_URL);
        console.log('File details:', selectedFile.name, selectedFile.size, selectedFile.type);
        
        let formData = new FormData();
        formData.append("file", selectedFile);
        
        let res = await axios({
          method: "post",
          url: process.env.REACT_APP_API_URL,
          data: formData,
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        console.log('API Response:', res.data);
        
        if (res.status === 200) {
          setData(res.data);
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Show error to user
        setData({
          class: 'Error',
          confidence: 0,
          error: error.response?.data?.message || 'Failed to process image'
        });
      } finally {
        setIsLoading(false);
      }
    }
  }, [image, selectedFile]);

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    // Cleanup function to revoke object URL
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) {
      return;
    }
    setIsLoading(true);
    sendFile();
  }, [preview, sendFile]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(files[0]);
    setData(undefined);
    setImage(true);
  };

  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  return (
    <React.Fragment>
      <StyledAppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            Potato Disease Classification App
          </Typography>
          <Avatar src={mylogo} alt="CodeBasics Logo" />
        </Toolbar>
      </StyledAppBar>
      
      <StyledContainer maxWidth={false} disableGutters={true}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '4em 1em 0 1em',
            minHeight: '80vh'
          }}
        >
          <Grid container spacing={2} justifyContent="center" alignItems="center">
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
              <StyledCard isEmpty={!image}>
                {image && (
                  <CardActionArea>
                    <CardMedia
                      component="img"
                      height="400"
                      image={preview}
                      alt="Uploaded potato leaf"
                      sx={{ objectFit: 'cover' }}
                    />
                  </CardActionArea>
                )}
                
                {!image && (
                  <CardContent>
                    <DropzoneArea
                      acceptedFiles={['image/*']}
                      dropzoneText="Drag and drop an image of a potato plant leaf to process"
                      onChange={onSelectFile}
                      maxFileSize={5000000} // 5MB
                      filesLimit={1}
                    />
                  </CardContent>
                )}
                
                {data && (
                  <DetailContent>
                    <StyledTableContainer component={Paper}>
                      <StyledTable size="small" aria-label="results table">
                        <TableHead>
                          <TableRow>
                            <StyledTableCellSmall>Label:</StyledTableCellSmall>
                            <StyledTableCellSmall align="right">Confidence:</StyledTableCellSmall>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          <TableRow>
                            <StyledTableCell component="th" scope="row">
                              {data.class}
                            </StyledTableCell>
                            <StyledTableCell align="right">
                              {confidence}%
                            </StyledTableCell>
                          </TableRow>
                        </TableBody>
                      </StyledTable>
                    </StyledTableContainer>
                  </DetailContent>
                )}
                
                {isLoading && (
                  <DetailContent>
                    <StyledCircularProgress color="secondary" />
                    <Typography variant="h6" noWrap sx={{ mt: 2 }}>
                      Processing
                    </Typography>
                  </DetailContent>
                )}
              </StyledCard>
            </Grid>
            
            {data && (
              <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', maxWidth: '416px', width: '100%' }}>
                <ColorButton
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={clearData}
                  startIcon={<ClearIcon fontSize="large" />}
                >
                  Clear
                </ColorButton>
              </Grid>
            )}
          </Grid>
        </Box>
      </StyledContainer>
    </React.Fragment>
  );
};