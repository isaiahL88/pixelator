import express from 'express';
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from 'multer'
import crypto from 'crypto'

import { spawn } from 'child_process'

const childPython = spawn('python', ['--version']);
childPython.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
})

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const genRandomName = (num = 16) => { crypto.randomBytes(num).toString('hex') }

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
});

const prisma = new PrismaClient();
const app = express();


//Create memory storage object
const storage = multer.memoryStorage()
//Create memory upload function
const upload = multer({ storage: storage });

//This bit will get all posts from the MySql db, add a sign url to the image on s3 and return the list of meta data and s3 signed links
app.get("/api/posts", async (req, res) => {
    const pics = await prisma.pictures.findMany({ orderBy: [{ created: 'desc' }] })
    for (const pic of pics) {
        const params = {
            Bucket: bucketName,
            Key: pic.imageName
        };
        const command = new GetObjectCommand(params);
        //Generating signed Url
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); //expire 1 hour
        pic.imageUrl = url;
    }
    res.send(pics)
});


//Endpoint used to upload images
app.post('/api/posts', upload.single('image'), async (req, res) => {
    //This is the actuall image data to send to s3, use sharp to resize
    const buffer = await sharp(req.file.buffer).resize({ height: 1920, width: 1080, fit: "contain" }).toBuffer();
    //s3 bucket params
    const params = {
        Bucket: bucketName,
        Key: genRandomName,
        Body: buffer,
        ContentType: req.file.mimetype
    }
    //Upload this image to the s3 bucket
    const command = new PutObjectCommand(params);
    await s3.send(command);

    //Upload image name with meta data (only name for now) to db
    const pic = await prisma.pics.create({
        data: {
            imageName: randoName,
            name: req.body
        }
    })

    res.send({ pic });
})

app.delete("/api/posts/:id", async (req, res) => { });

app.listen(8080, () => console.log("listening on port 8080"));