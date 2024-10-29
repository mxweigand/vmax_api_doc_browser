import { Injectable, OnModuleInit } from '@nestjs/common';
import { readdirSync, lstatSync, writeFile, readFileSync } from 'fs';
import { join } from 'path';
import { JavadocHtmlAnalyzerService } from '../javadoc-html-analyzer/javadoc-html-analyzer.service';
import { javaDocPath } from '../../jdoc-express/java-doc-path';
import { JavaClass } from '../../interfaces/java-class.interface';


@Injectable()
export class FileCrawlerService {
    
    private readonly FILE_PATH_ANALYZED_DIRECTORY: string = 'data/analyzed-directory.json';

    constructor(
        private readonly javadocHtmlAnalyzerService: JavadocHtmlAnalyzerService
    ) { }
    
    public crawlJavaDoc(): JavaClass[] {
        const topFileSystemNode = this.crawl(javaDocPath);
        this.writeToJson(topFileSystemNode, this.FILE_PATH_ANALYZED_DIRECTORY);
        this.javadocHtmlAnalyzerService.saveCollection()
        return this.javadocHtmlAnalyzerService.getCollection();
    }

    private crawl(path: string[]): FileSystemNode {
        let fileSystemNode: FileSystemNode = {} as FileSystemNode;
        fileSystemNode.name = path.pop();
        fileSystemNode.path = path;
        const fullPath = join(...fileSystemNode.path, fileSystemNode.name);
        if (lstatSync(fullPath).isDirectory()) {
            fileSystemNode.type = 'directory';
            const childrenAsString: string[] = readdirSync(fullPath);
            fileSystemNode.children = [];
            for (const child of childrenAsString) {
                fileSystemNode.children.push(this.crawl(
                    [ ...fileSystemNode.path, fileSystemNode.name, child ]
                ));
            }
        } else if (lstatSync(fullPath).isFile()) {
            fileSystemNode.type = 'file';
            fileSystemNode.children = undefined;
            if (
                !fileSystemNode.name.endsWith('.html') ||
                fileSystemNode.name === 'package-summary.html' ||
                fileSystemNode.name === 'allclasses-index.html' ||
                fileSystemNode.name === 'allpackages-index.html'
            ) { 
                return fileSystemNode;
            }
            // else, the file is/might be a javadoc html file -> analyze it
            const htmlContent: string = readFileSync(fullPath, 'utf8');
            this.javadocHtmlAnalyzerService.analyze(htmlContent);
        } else {
            throw new Error('Unknown FileSystemNode - cant continue!');
        }
        return fileSystemNode;
    }

    private writeToJson(fileSystemNode: FileSystemNode, filename: string): void {
        writeFile(
            filename, 
            JSON.stringify(fileSystemNode, undefined, 4), 
            function(err) { if (err) { console.log(err); } }
        );
    }

}

interface FileSystemNode {
    path: string[];
    name: string;
    type: 'file' | 'directory';
    children: FileSystemNode[];
}