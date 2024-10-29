import { Injectable } from '@nestjs/common';
import { JavaClass } from '../../interfaces/java-class.interface';
import * as cheerio from 'cheerio';
import { writeFile } from 'fs';

@Injectable()
export class JavadocHtmlAnalyzerService {

    private readonly FILE_PATH_ANALYZED_JAVA_CONTENTS: string = 'data/analyzed-java-contents.json';

    private collection: JavaClass[] = [];

    constructor() { }

    /**
     * public method to analyze the html content of a javadoc html file
     * and create a JavaClass object from it
     * @param htmlContent 
     */
    public analyze(htmlContent: string): void {
        let javaClass: JavaClass = {} as JavaClass;
        const selector: cheerio.Root = cheerio.load(htmlContent);
        javaClass.package = this.getPackageJfqn(selector);
        const name: string = this.getName(selector);
        if (!name) { return; }
        javaClass.name = name;
        javaClass.fullyQualifiedName = javaClass.package + '.' + javaClass.name;
        javaClass.superClasses = this.getSuperClasses(selector, javaClass.package);
        javaClass.superClassesImplicit = [];
        this.collection.push(javaClass);
    }

    /**
     * public method to save the collection to a file after all html files have been analyzed
     */
    public saveCollection(): void {
        writeFile(
            this.FILE_PATH_ANALYZED_JAVA_CONTENTS, 
            JSON.stringify(this.collection, undefined, 4), 
            function(err) { if (err) { console.log(err); } }
        ); 
    }

    /**
     * public method to get the collection
     * @returns 
     */
    public getCollection(): JavaClass[] {
        return this.collection;
    }

    /**
     * gets the full qualified name of the package
     * @param selector 
     * @returns 
     */
    private getPackageJfqn(selector: cheerio.Root): string {
        return selector('div.sub-title > a[href="package-summary.html"]').text();
    }

    /**
     * gets the name of the class or interface
     * @param selector 
     * @returns 
     */
    private getName(selector: cheerio.Root): string {
        const fullTitle = selector('h1.title').text();
        const fullTitleArray = /^(Class |Interface )(.*)/.exec(fullTitle);
        if (fullTitleArray && fullTitleArray.length === 3 && fullTitleArray[2]) {
            return fullTitleArray[2]
        } else { 
            return undefined 
        }
    }

    /**
     * gets the full qualified names of the classes or interfaces that the current class or interface extends or implements
     * @param selector 
     * @param packageJfqn 
     * @returns 
     */
    private getSuperClasses(selector: cheerio.Root, packageJfqn: string): string[] {
        const currentPath: string[] = packageJfqn.split('.');
        const linkArray: string[] = [];
        selector('span.extends-implements').contents().each((index, element) => {
            // links 
            if (element.type === 'tag' && element.name === 'a' ) {
                // get element before and skip if it ends with '<' (no Collection<Class>)
                if (element.prev && element.prev.type === 'text' && element.prev.data.endsWith('<')) {
                    return;
                }
                // get element after and skip if it stars with '<' (no Class<T>)
                if (element.next && element.next.type === 'text' && element.next.data.startsWith('<')) {
                    return;
                }
                // skip external links
                if (selector(element).hasClass('external-link')) {
                    return;
                }
                linkArray.push(selector(element).attr('href'));
            }
        });
        const jfqnArray: string[] = linkArray.map((link: string) => {
            // first, remove the '.html' at the end of the link and split it by all '/'s
            const linkAsArray: string[] = link.replace('.html', '').split('/');
            // count each '..' at the beginning of the link
            // then remove the same amount of elements at the end of current path and combine them
            let count = 0;
            while (linkAsArray[count] === '..') {
                count++;
            }
            const prefix = currentPath.slice(0, currentPath.length - count).join('.');
            const suffix = linkAsArray.slice(count).join('.');
            return prefix + '.' + suffix;
        })
        return jfqnArray;
    }
}