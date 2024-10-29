import { Injectable } from '@nestjs/common';
import { readFileSync, writeFile } from 'fs';
import { VmaxClass } from '../../interfaces/vmax-class.interface';
import { FileCrawlerService } from '../file-crawler/file-crawler.service';
import { JavaClass } from '../../interfaces/java-class.interface';
import { DatatypesService } from '../datatypes/datatypes.service';

@Injectable()
export class WorkingDataService {

    private readonly FILE_PATH_WORKING_DATA: string = 'data/working-data.json';
    private workingData: VmaxClass[];

    constructor(
        private readonly fileCrawlerService: FileCrawlerService,
        private readonly dataTypesService: DatatypesService
    ) {
        //
    }
    
    onModuleInit() {
        if (!this.checkWorkingDataAvailability()) {
            console.log(this.FILE_PATH_WORKING_DATA + ' was not found or is empty');
            this.createWorkingData();
            return;
        }
        console.log(this.FILE_PATH_WORKING_DATA + ' was found and loaded');
    }

    public getWorkingData(): VmaxClass[] {
        return this.workingData;
    }

    public createWorkingData(): void {
        console.log('creating working data - this might take a while...');
        this.workingData = this.fileCrawlerService.crawlJavaDoc().map( (javaClass: JavaClass) => 
            ({
                javaClass: javaClass,
                workingData: {
                    added: false,
                    addedMethods: []
                }
            }));
        this.workingData.push(...this.dataTypesService.getDatatypes());
        this.findImplicitSuperClasses();
        this.findExplicitAndImplicitSubClasses();
        this.saveWorkingData();
        console.log('... done!');
    }

    private checkWorkingDataAvailability(): boolean {
        try {
            const workingDataAsString = readFileSync(this.FILE_PATH_WORKING_DATA, 'utf8');
            if (workingDataAsString && workingDataAsString.length > 0) {
                this.workingData = JSON.parse(workingDataAsString);
                return true;
            }
        } catch (e) {
            return false;
        }        
    }

    public setWorkingDataAndSave(workingData: VmaxClass[]): void {
        this.workingData = workingData;
        this.saveWorkingData();
    }

    private saveWorkingData(): void {
        writeFile(
            this.FILE_PATH_WORKING_DATA, 
            JSON.stringify(this.workingData, undefined, 4), 
            function(err) { if (err) { console.log(err); } }
        ); 
    }

    private findImplicitSuperClasses(): void {
        this.workingData.forEach( (vmaxClass: VmaxClass) => {
            let superClasses: { class: string, added: boolean }[] = vmaxClass.javaClass.superClasses
                .map( (superClass: string) =>
                    ({ 
                        class: superClass,
                        added: false
                    }));
            let finished = false;
            while (!finished) {
                superClasses.forEach( 
                    (superClass: { class: string, added: boolean }) => {
                        // if a superclass is not added, find all its superclasse in workingData
                        if (!superClass.added) {
                            const superClassFull = this.workingData.find( (vmaxClass: VmaxClass) => 
                                vmaxClass.javaClass.fullyQualifiedName === superClass.class);
                            if (superClassFull) {
                                superClasses.push(...superClassFull.javaClass.superClasses.map( (superClass: string) =>
                                    ({ 
                                        class: superClass,
                                        added: false
                                    })));
                                superClass.added = true;
                            } else {
                                throw new Error('superclass ' + superClass.class + ' not found in workingData');
                            }
                        }
                    });
                finished = superClasses.every( 
                    (superClass: { class: string, added: boolean }) => superClass.added
                );
            }
            // TODO: fix issue: some superclasses are added multiple times
            // For now, just remove duplicates
            superClasses = superClasses.filter( (superClass: { class: string, added: boolean }, index: number, self: { class: string, added: boolean }[]) =>
                self.findIndex( (s: { class: string, added: boolean }) => s.class === superClass.class) === index);
            // map to string array
            vmaxClass.javaClass.superClassesImplicit = superClasses
                .map( (superClass: { class: string, added: boolean }) => superClass.class );
        });

    }
    
    private findExplicitAndImplicitSubClasses(): void { 
        this.workingData.forEach( (currentClass: VmaxClass) => {
            const subClasses: VmaxClass[] = this.workingData.filter( (possibleSuperClass: VmaxClass) =>
                possibleSuperClass.javaClass.superClassesImplicit.includes(currentClass.javaClass.fullyQualifiedName));
        });
    }
    
}
