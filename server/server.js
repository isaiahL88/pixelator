import express from 'express'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
});

const prisma = PrismaClient();


//This bit will get all posts from the MySql db, add a sign url to the image on s3 and return the list of meta data and s3 signed links
app.get("/api/posts", async (req, res) => {
    const pics = await prisma.pictures.findMany({ orderBy: [{ created: 'desc' }] })
    for (const pic of pics) {
        const params = {
            Bucket: bucketName,
            Key: pic.imageName
        };
        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3, command, { expiresIn: 3600 }); //expire 1 hour
        pic.imageUrl = url;
    }
    res.send(pics)
});

app.post('/api/posts', async (req, res) => { })

app.delete("/api/posts/:id", async (req, res) => { });

app.listen(8080, () => console.log("listening on port 8080"));