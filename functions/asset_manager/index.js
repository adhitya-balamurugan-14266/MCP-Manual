'use strict';
const catalyst = require('zcatalyst-sdk-node');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const BUCKET_NAME = 'mcp-manual-logos';
const BUCKET_BASE_URL =
  process.env.STRATUS_BUCKET_URL ||
  'https://mcp-manual-logos-development.zohostratus.in';

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    if (req.body && typeof req.body === 'string') {
      try { return resolve(JSON.parse(req.body)); } catch { return resolve({}); }
    }
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function getRoutePath(url) {
  return (url || '').split('?')[0].replace(/\/api\/asset_manager/, '') || '/';
}

function safeKey(filename) {
  return filename.replace(/\s+/g, '-');
}

function getContentType(filename) {
  const ext = path.extname(filename).toLowerCase();
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.webp') return 'image/webp';
  return 'application/octet-stream';
}

module.exports = async (req, res) => {
  try {
    const app = catalyst.initialize(req, { type: catalyst.type.admin });
    const stratus = app.stratus();
    const bucket = stratus.bucket(BUCKET_NAME);

    const routePath = getRoutePath(req.url);
    const method = req.method;

    // POST /upload — body: { key: "filename.svg", content: "<base64>", contentType?: "..." }
    if (method === 'POST' && routePath === '/upload') {
      const body = await getBody(req);
      const { key, content, contentType } = body;
      if (!key || !content) {
        return sendJson(res, 400, { status: 'error', message: '"key" and "content" (base64) are required' });
      }
      const objectKey = safeKey(key);
      const mime = contentType || getContentType(key);
      const buffer = Buffer.from(content, 'base64');
      const stream = Readable.from(buffer);
      await bucket.putObject(objectKey, stream, { overwrite: true, contentType: mime });
      return sendJson(res, 200, { status: 'success', key: objectKey, url: `${BUCKET_BASE_URL}/${objectKey}` });
    }

    // DELETE /delete?key=filename
    else if (method === 'DELETE' && routePath === '/delete') {
      const params = new URLSearchParams((req.url || '').split('?')[1] || '');
      const key = params.get('key');
      if (!key) return sendJson(res, 400, { status: 'error', message: '"key" query param is required' });
      await bucket.deleteObject(safeKey(key));
      return sendJson(res, 200, { status: 'success', message: `Deleted: ${key}` });
    }

    // POST /init-logos — sync all bundled logos/ to Stratus (idempotent)
    else if (method === 'POST' && routePath === '/init-logos') {
      const logosDir = path.join(__dirname, 'logos');
      if (!fs.existsSync(logosDir)) {
        return sendJson(res, 404, { status: 'error', message: 'logos/ directory not found in function bundle' });
      }
      const files = fs.readdirSync(logosDir).filter((f) => /\.(svg|png|jpg|jpeg|webp)$/i.test(f));
      const uploaded = [];
      const failed = [];
      for (const file of files) {
        try {
          const objectKey = safeKey(file);
          const contentType = getContentType(file);
          const stream = fs.createReadStream(path.join(logosDir, file));
          await bucket.putObject(objectKey, stream, { overwrite: true, contentType });
          uploaded.push({ key: objectKey, url: `${BUCKET_BASE_URL}/${objectKey}` });
        } catch (err) {
          failed.push({ file, error: err.message });
        }
      }
      return sendJson(res, 200, {
        status: 'success',
        uploaded: uploaded.length,
        failed: failed.length,
        files: uploaded,
        errors: failed,
      });
    }

    else {
      sendJson(res, 404, { status: 'error', message: `No route: ${method} ${routePath}` });
    }
  } catch (err) {
    sendJson(res, 500, { status: 'error', message: err.message });
  }
};
