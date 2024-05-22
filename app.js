import express from 'express';
import { PDFDocument, PDFPage, StandardFonts, rgb } from 'pdf-lib';
import multer from 'multer';
import fs from 'fs';

const app = express();

// Configure multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to parse multipart/form-data
app.use(express.urlencoded({ extended: true }));
app.use(upload.single('pdf'));

app.post('/', async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const filePath = './downloads/modified_document.pdf';
        const pdfBuffer = Buffer.from(req.file.buffer, 'binary');
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pageCount = pdfDoc.getPageCount();

        // Add a new page
        pdfDoc.addPage();

        // Embed the Times Roman font
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // Calculate the position where the text will be drawn
        const { width, height } = pdfDoc.getPage(pageCount).getSize();
        const fontSize = 12;
        const text = 'New Page Text';
        const x = 50;
        const y = height - 4 * fontSize;

        // Draw the text on the new page
        pdfDoc.getPage(pageCount).drawText(text, {
            x: x,
            y: y,
            size: fontSize,
            font: timesRomanFont,
            color: rgb(0, 0, 0), // Black color
        });

        const pdfBytes = await pdfDoc.save();

        fs.writeFile(filePath, pdfBytes, (err) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error saving the PDF.');
            } else {
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename="modified_document.pdf"');
                res.send(pdfBytes);
                console.log('====================================');
                console.log(`PDF saved successfully at ${filePath}`);
                console.log('====================================');
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing the PDF.');
    }
});

// Serve
app.listen(5000, function () {
    console.log('Example app listening on port 5000!');
});
