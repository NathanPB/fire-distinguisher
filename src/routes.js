/*
Copyright 2019 Nathan P. Bombana

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { Router } from 'express';
import multer from 'multer';
import vision from '@google-cloud/vision';

const routes = Router();

const client = new vision.ImageAnnotatorClient({
  keyFilename: 'keyfile.json'
});

const labels = ["Fire", "Flame", "Campfire", "Bonfire"];

/**
 * GET home page
 */

const thePage = async (req, res, next) => {
  let foundFire = false;
  if(req.file) {
    let response = await client.labelDetection(`./${req.file.path}`);
    response.forEach(it => {
      it.labelAnnotations.forEach(label => {
        if(labels.includes(label.description) && label.score >= 0.7){
          foundFire = true;
        }
      });
    });
  }

  res.render('index', {
    input: req.file ? req.file.filename : null,
    output: req.file ? foundFire : null
  });
};

const upload = multer({
  dest: 'public/uploads/',
  limits: {
    fileSize: 1024*1024
  }
}).single('firepic');

routes.get('/', upload, thePage);
routes.post('/', upload, thePage);

export default routes;
