'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Box, Stack, Typography, Divider, Button, Paper, TextField, IconButton, List, ListItemText, ListItem, FormControl, FormControlLabel, Switch, InputLabel, Select, MenuItem, Link, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon, PlayArrow as PlayArrowIcon, Replay as ReplayIcon } from '@mui/icons-material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import coordinates from './module/coordinates.json';
import { useMap, routeBuilder } from './module/useMap';
import { useAnimateCar } from './module/animateCar.js';
import { loadModel } from './module/signChecker.js';
import Layout from '@/components/Layout';
import { useThemeContext } from '@/components/ThemeContext';

const Page = () => {
  const [reset, setReset] = useState(false);
  const [logs, setLogs] = useState([]);
  const [route, setRoute] = useState(null);
  const [model, setModel] = useState(null);
  const [metaData, setMetaData] = useState(null);
  const [modelUrl, setModelUrl] = useState('');
  const [passedSigns, setPassedSigns] = useState([]);
  const [currentSignImage, setCurrentSignImage] = useState(null);
  const passedSignsRef = useRef(passedSigns);
  const [correctSigns, setCorrectSigns] = useState(0);
  const [incorrectSigns, setIncorrectSigns] = useState(0);
  const [selectedLayer, setSelectedLayer] = useState("light_no_labels");  
  const [currentStep, setCurrentStep] = useState(0);

  const updateScores = (isCorrect) => {
    console.log(`Currently correct signs: ${correctSigns}, incorrect signs: ${incorrectSigns}.`);
    if (isCorrect) setCorrectSigns((prev) => prev + 1);
    else setIncorrectSigns((prev) => prev + 1);
  };

  useEffect(() => { passedSignsRef.current = passedSigns; }, [passedSigns]);
  useEffect(() => { if (typeof window !== 'undefined') { const storedModelUrl = localStorage.getItem('modelUrl'); if (storedModelUrl) setModelUrl(storedModelUrl); } }, []);
  useEffect(() => { if (typeof window !== 'undefined') localStorage.setItem('modelUrl', modelUrl); }, [modelUrl]);
  const logAction = (message) => setLogs((prevLogs) => [...prevLogs, message]);

  const { mapRef, carMarker } = useMap(coordinates, selectedLayer);
  const { createRoute, roundCoordinate, interpolate, segmentDistance, speed } = routeBuilder(mapRef, setRoute, coordinates);
  const animateCar = useAnimateCar(carMarker, mapRef, segmentDistance, speed, passedSignsRef, setPassedSigns, logAction, roundCoordinate, interpolate, model, metaData, coordinates, setCurrentSignImage, updateScores);


  const handleReset = () => {
    setReset(true);
    window.location.href = window.location.href;
    setTimeout(() => setReset(false), 100);
  };

  const handleRun = () => {
    loadModel(modelUrl).then(({ model, metaData, message }) => {
      if (model && metaData) { setModel(model); setMetaData(metaData); logAction('Model loaded successfully!'); createRoute(coordinates.startCoordinates, coordinates.destinationCoordinates); } else logAction(message);
    });
  };

  useEffect(() => { if (route) animateCar(route); }, [route]);


  const steps = [
    { title: "Step 1: Navigate to the Google Teachable Machine website.", description: (<>Navigate to the Google Teachable Machine website: <Link href="https://teachablemachine.withgoogle.com/train" target="_blank" rel="noopener noreferrer">https://teachablemachine.withgoogle.com/train</Link> </>)},
    { title: "Step 2: Get Started", description: "Choose 'Image Project,' and then select 'Standard image model'." },
    { title: "Step 3: Create Classes", description: "Create three classes and name them 'STOP', 'YIELD', and 'DNE' (for 'Do Not Enter')." },
    {
      title: "Step 4: Upload Images", description: (
        <>
          <Typography paragraph>
            Download and unzip one of the following datasets. Each dataset contains three folders for stop, yield, and do not enter signs. <br></br><br></br> 
            Upload the images in each folder to the corresponding classes/categories by clicking on the 'Upload' button under each class. <br></br><br></br>
          </Typography>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Dataset #1</Typography></AccordionSummary>
            <AccordionDetails>
              <Link href="/dataset/zip/dataset1.zip" target="_blank" rel="noopener noreferrer">Download Dataset #1</Link>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Dataset #2</Typography></AccordionSummary>
            <AccordionDetails>
              <Link href="/dataset/zip/dataset2.zip" target="_blank" rel="noopener noreferrer">Download Dataset #2</Link>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>Dataset #3</Typography></AccordionSummary>
            <AccordionDetails>
              <Link href="/dataset/zip/dataset3.zip" target="_blank" rel="noopener noreferrer">Download Dataset #3</Link>
            </AccordionDetails>
          </Accordion>
        </>
      )
    },
    { title: "Step 5: Train Your Model", description: "Train your model by clicking on the 'Train Model' button." },
    { title: "Step 6: Export Model", description: "Once the training is complete, click on 'Export Model,' ensure the 'TensorFlow.js' tab is selected, and click 'Upload my model.'" },
    { title: "Step 7: Copy URL", description: "Copy the URL provided for your trained model. It may take a minute for Google Teachable to finish uploading your model." },
    { title: "Step 8: Paste URL and Run", description: "Paste the URL into the 'Model URL' field above and click the play button to use your trained model. To reset the scenario, click the reset button." }
  ];


  return (
    <Layout>
      <Box sx={{ width: '100%', p: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Box sx={{ width: '70%', p: 2 }}>
            <Paper elevation={3} sx={{ p: 2, height: '75vh', position: 'relative' }}>
              <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 1000 }}>
                
                <TextField label="Model URL" variant="outlined" value={modelUrl} onChange={(e) => setModelUrl(e.target.value)} fullWidth sx={{ height: '48px', borderRadius: '10%', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.05)', transformOrigin: 'center' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
                
                <Button variant="contained" color="primary" onClick={handleRun} sx={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '50%', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><PlayArrowIcon sx={{ fontSize: '1.5rem' }} /></Button>
                
                <Button variant="contained" color="secondary" onClick={handleReset} sx={{ minWidth: '48px', width: '48px', height: '48px', borderRadius: '50%', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.1)' }, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><ReplayIcon sx={{ fontSize: '1.5rem' }} /></Button>
              
              </Stack>
              <Divider sx={{ mt: 20 }} />
              <div id="map" style={{ height: 'calc(100% - 72px - 16px)', width: '100%', position: 'absolute', top: 72, left: 0 }}></div>
            </Paper>

            <Typography variant="body1" sx={{ mt: 2, textAlign: 'center' }}></Typography>

            <Paper elevation={3} sx={{ p: 1, mb: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5" gutterBottom>Overall Score</Typography>
              <Divider sx={{ width: '100%', my: 2 }} />
              
              <Typography variant="h6" color="green">Correctly Detected: {correctSigns}</Typography>
              <Typography variant="h6" color="red">Incorrectly Detected: {incorrectSigns}</Typography>
            </Paper>

            
            <Paper elevation={3} sx={{ p: 2, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h5" gutterBottom>Road Sign Recognition</Typography>
              <Typography variant="body1" paragraph>After running the scenario, each sign that your model correctly predicted along with its confidence score will be displayed below.</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {passedSigns.map((sign, index) => (
                  <Paper key={index} elevation={3} sx={{ p: 1, border: `2px solid ${sign.isCorrect ? 'green' : 'red'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', width: 'calc(33.33% - 8px)', marginBottom: '8px', boxSizing: 'border-box' }}>
                    <img src={sign.iconUrl} alt="Traffic Sign" style={{ width: '100%', height: 'auto', maxHeight: '10vh', objectFit: 'contain' }} />
                    <Typography variant="body1" color={sign.isCorrect ? 'green' : 'red'}>Detected: {sign.detectedType}</Typography>
                    <Typography variant="body1" color={sign.isCorrect ? 'green' : 'red'}>Confidence: {sign.confidence ? sign.confidence.toFixed(2) : 'N/A'}%</Typography>
                    <Typography variant="body1">Expected: {sign.expectedType}</Typography>
                  </Paper>
                ))}
              </Box>
            </Paper> 


            

          </Box>


          <Box sx={{ width: '100%', maxWidth: 360, p: 2, m: 'auto' }}>
            <Paper elevation={3} sx={{ p: 2, mt: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>How To Train Your Model</Typography>
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold', textDecoration: 'underline' }}>{steps[currentStep].title}</Typography>
              <Typography variant="body1" paragraph sx={{ mt: 2 }}>{steps[currentStep].description}</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <IconButton onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))} disabled={currentStep === 0}><ArrowBackIosNewIcon /></IconButton>
                <IconButton onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))} disabled={currentStep === steps.length - 1}><ArrowForwardIosIcon /></IconButton>
              </Box>
            </Paper>
          </Box>

        </Stack>
      </Box>
    </Layout>
  );
};

export default Page;
