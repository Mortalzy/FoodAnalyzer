const fs = require('fs').promises
const path = require('path')

async function saveAnalysisToFile() {
    const resultsPath = path.join(__dirname, 'json-results')
    console.log(resultsPath)

    const analysis = {

    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `analysis-${timestamp}.json`
    const filePath = path.join(resultsPath, filename)
    console.log(filePath + '!!!!')


    const analysisWithMeta = {
        ...analysis,
        metadata: {
            timestamp: new Date().toISOString(),
            // imageFile: path.basename(imagePath),
            // userComment: comment,
            model: "google/gemma-3-4b-it:free"
        }
    }

    await fs.writeFile(filePath, JSON.stringify(analysisWithMeta, null, 2))

    console.log(timestamp)
    console.log(filename)
}
saveAnalysisToFile()

