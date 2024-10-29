import * as express from 'express';
import * as interceptor from 'express-interceptor';
import * as cheerio from 'cheerio';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { javaDocPath } from './java-doc-path'

export const expressApp = express();

const javaDocRoutePrefix = '/javadoc';
const javaDocEntryPath = join(...javaDocPath);
const scriptsPath = join(__dirname, '..', '..', '..', 'public', 'scripts');
const scriptsPathFiles = readdirSync(scriptsPath, 'utf-8');
const cssFilesPath = join(__dirname, '..', '..', '..', 'public', 'styles');
const cssFilesPathFiles = readdirSync(cssFilesPath, 'utf-8');

const htmlInterceptor = interceptor(function(req, res){
    return {
      // only intercept HTML responses
      // 200 responses, as express.static will create a minimal HTML page for 404s
      isInterceptable: function(){
        if(/text\/html/.test(res.get('Content-Type')) && res.statusCode === 200) {
            // console.log(req.url + ' will get intercepted.')
            return true;
        };
      },
      // actual interceptor
      intercept: function(body, send) {
        const doc = cheerio.load(body);
        scriptsPathFiles.forEach( (filePath) => {
          if ( /\.js$/ .test(filePath) ) { 
              const scriptFile = readFileSync(join(scriptsPath, filePath), 'utf-8');
              doc('head').append('<script>' + scriptFile + '</script>');
        }});
        cssFilesPathFiles.forEach( (filePath) => {
          if ( /\.css$/ .test(filePath) ) { 
              const cssFile = readFileSync(join(cssFilesPath, filePath), 'utf-8');
              doc('head').append('<style>' + cssFile + '</style>');
        }});
        send(doc.html());
      }
    };
})

expressApp.use(javaDocRoutePrefix, htmlInterceptor);
expressApp.use(javaDocRoutePrefix, express.static(javaDocEntryPath));

