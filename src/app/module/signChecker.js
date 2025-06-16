import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

let model = null;
let metaData = null;

export async function loadModel(modelUrl) {
    let message = `Loading model from: ${modelUrl}`;

    try {
        console.log(message);
        
        // Using Teachable Machine's load function for consistency
        model = await tmImage.load(modelUrl + 'model.json', modelUrl + 'metadata.json');
        
        // Metadata is now part of the model object, no need to fetch separately
        metaData = model.getMetadata();
        
        console.log(`Metadata loaded:`, metaData);
    } catch (loadError) {
        console.error("Error loading the model:", loadError);
        message = 'Failed to load the model. Please check the model path and try again.';
        throw new Error(message);
    }

    return { model, metaData, message };
}

export async function analyzeImage(imageUrl) {
    if (!model || !metaData) {
        throw new Error("Model and metadata not loaded.");
    }

    try {
        const img = new Image();
        img.src = imageUrl;
        await new Promise((resolve) => {
            img.onload = resolve;
        });

        const predictions = await model.predict(img); // tmImage handles preprocessing
        const topPrediction = predictions.reduce((max, current) =>
            current.probability > max.probability ? current : max, predictions[0]);

        return {
            class_name: topPrediction.className,
            confidence: topPrediction.probability * 100
        };
    } catch (err) {
        console.error(err);
        throw new Error("Failed to classify the image. Please try again.");
    }
}

// export async function loadModel(modelUrl) {
//     let message = `Loading model from: ${modelUrl}`

//     try {
//         console.log(`Loading model from: ${modelUrl}`);
//         model = await tf.loadLayersModel(modelUrl + 'model.json');
//         metaData = await fetch(modelUrl + 'metadata.json').then((res) => res.json());
//         console.log(`Metadata loaded:`, metaData);
//     } catch (loadError) {
//         console.error("Error loading the model:", loadError);
//         message = 'Failed to load the model. Please check the model path and try again.';
//         throw new Error(message);
//     }

//     return { model, metaData, message };
// }

// async function analyzeImage(imageUrl, model, metaData) {
//     let predictions;
//     let error = null;

//     if (!model || !metaData) {
//         throw new Error("Model and metadata not loaded.");
//     }

//     try {
//         const img = new Image();
//         img.src = imageUrl;
//         await new Promise((resolve) => {
//             img.onload = resolve;
//         });

//         const tensor = tf.browser.fromPixels(img)
//             .resizeBilinear([224, 224])
//             .toFloat()
//             .expandDims();
//         const predictionData = await model.predict(tensor).data();
//         const topPredictionIndex = predictionData.indexOf(Math.max(...predictionData));
//         const topPredictionConfidence = Math.max(...predictionData);

//         const className = metaData.labels[topPredictionIndex] || 'Unknown';

//         predictions = {
//             class_name: className,
//             confidence: topPredictionConfidence * 100
//         };
//     } catch (err) {
//         console.error(err);
//         throw new Error("Failed to classify the image. Please try again.");
//     }

//     return predictions;
// }

export const checkForSigns = async (lat, lng, segmentDistance, passedSignsRef, setPassedSigns, logAction, pauseCar, model, metaData, coordinates, setCurrentSignImage, updateScores) => {
    if (!passedSignsRef.current) {
        passedSignsRef.current = [];
    }

    for (const sign of coordinates.trafficSigns) {
        const distance = Math.hypot(sign.lat - lat, sign.lng - lng);

        if (distance < segmentDistance && !passedSignsRef.current.some(s => s.lat === sign.lat && s.lng === sign.lng)) {
            const signData = { lat: sign.lat, lng: sign.lng, iconUrl: sign.iconUrl, expectedType: sign.type };

            // Only update the passed signs once to avoid duplication
            setPassedSigns((prev) => {
                // Check again in case state has changed before this operation
                if (!prev.some(s => s.lat === sign.lat && s.lng === sign.lng)) {
                    passedSignsRef.current = [...prev, signData];
                    return passedSignsRef.current;
                }
                return prev;
            });

            setCurrentSignImage(sign.iconUrl);

            try {
                const result = await analyzeImage(sign.iconUrl, model, metaData);
                const signType = result.class_name.toLowerCase();
                const isCorrect = signType === sign.type.toLowerCase();

                const message = `Detected sign: ${signType}. Expected sign: ${sign.type}. ${isCorrect ? 'Correct' : 'Incorrect'}.`;
                console.log(message); 
                logAction(message);
                updateScores(isCorrect);

                signData.detectedType = signType;
                signData.confidence = result.confidence;
                signData.isCorrect = isCorrect;

                switch (signType) {
                    case 'stop':
                        logAction('Encountered STOP sign. Stopping the car.');
                        pauseCar(3000); 
                        break;
                    case 'yield':
                        logAction('Encountered YIELD sign. Yielding.');
                        pauseCar(1000); 
                        break;
                    case 'dne':
                        logAction('Encountered DO NOT ENTER sign. Stopping the car.');
                        pauseCar(5000); 
                        break;
                    default:
                        logAction('Unknown sign encountered.');
                        break;
                }
            } catch (error) {
                console.error('Error handling sign:', error);
                logAction('Error handling sign.');
            }
        }
    }
};
