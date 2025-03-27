const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { s3Client } = require('../config/awsConfig');
const crypto = require('crypto');
const path = require('path');

// Função para validar a configuração do S3
const validateS3Config = () => {
  const requiredEnvVars = [
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY'
  ];

  const missingVars = requiredEnvVars.filter(name => !process.env[name]);

  if (missingVars.length > 0) {
    throw new Error(`Configuração do AWS S3 incompleta. Variáveis ausentes: ${missingVars.join(', ')}`);
  }

  return true;
};

// Função para extrair a chave do S3 a partir de uma URL
const getKeyFromUrl = (url) => {
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error('Erro ao extrair chave da URL:', error);
    return null;
  }
};

// Função para fazer upload de um arquivo para o S3
const uploadFileToS3 = async (fileBuffer, originalName, mimeType) => {
  try {
    // Validar a configuração do S3
    validateS3Config();

    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    console.log('Bucket usado para upload:', bucketName);

    // Gerar nome único para o arquivo
    const randomName = crypto.randomBytes(16).toString('hex');
    const fileExtension = path.extname(originalName) || '.jpg';
    const key = `uploads/${randomName}${fileExtension}`;

    // Configurar o comando de upload - sem ACL
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: fileBuffer,
      ContentType: mimeType
    };

    // Executar o upload
    await s3Client.send(new PutObjectCommand(params));

    // Retornar a URL do objeto
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('Erro ao fazer upload para o S3:', error);
    throw error;
  }
};

// Função para excluir um arquivo do S3
const deleteFileFromS3 = async (fileUrl) => {
  try {
    // Validar a configuração do S3
    validateS3Config();

    const key = getKeyFromUrl(fileUrl);
    if (!key) return;

    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key
    };

    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`Arquivo excluído com sucesso: ${key}`);
  } catch (error) {
    console.error('Erro ao excluir arquivo do S3:', error);
  }
};

module.exports = {
  uploadFileToS3,
  deleteFileFromS3,
  getKeyFromUrl
};