import { Injectable, OnModuleInit } from '@nestjs/common';
import { VmaxClass } from '../interfaces/vmax-class.interface';
import { WorkingDataService } from '../crawler/working-data/working-data.service';
import { VmaxMethod } from '../interfaces/vmax-method.interface';
import { ClassInfo } from '../interfaces/class-info.interface';

@Injectable()
export class JavaApiElementsService implements OnModuleInit {
    
    data: VmaxClass[];

    constructor(
        private readonly workingDataService: WorkingDataService
    ) {
        //
    }

    onModuleInit() {
        this.getWorkingData();
    }

    public getWorkingData(): void {
        this.data = this.workingDataService.getWorkingData();
    }

    public saveWorkingData(): void {
        this.workingDataService.setWorkingDataAndSave(this.data);
        console.log('saved working data');
    }

    /**
     * returns the status of a class (true if added, false if not added)
     * @param jfqn 
     */
    public getClassStatus(jfqn: string): string {
        const foundClass: VmaxClass = this.data.find(
            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === jfqn);
        if (foundClass && foundClass.workingData.added === true) { return 'added' } 
        else if (foundClass && foundClass.workingData.added === false) { return 'not-added' }
        else { throw new Error('error looking up class status for:' + jfqn) }
    }

    /**
     * 
     * @param jfqn 
     */
    public addClass(jfqn: string): void {
        const foundClass: VmaxClass = this.data.find(
            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === jfqn);
        if (foundClass && foundClass.workingData.added === true) {
            throw new Error('class already added');
        } else if (foundClass && foundClass.workingData.added === false) {
            foundClass.workingData.added = true;
        } else { 
            throw new Error('class not found');
        }
    }
    
    /**
     * 
     * @param jfqn 
     */
    public removeClass(jfqn: string): void {
        const foundClass: VmaxClass = this.data.find(
            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === jfqn);
        if (foundClass && foundClass.workingData.added === false) {
            throw new Error('class already removed');
        } else if (foundClass && foundClass.workingData.added === true) {
            foundClass.workingData.added = false;
        } else { 
            throw new Error('class not found');
        }
    }

    /**
     * 
     * @param jfqn 
     */
    public getClassInfo(jfqn: string): ClassInfo {
        // find class
        const foundClass: VmaxClass = this.data.find(
            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === jfqn);
        if (!foundClass) {
            throw new Error('class not found');
        }
        // superclasses (added)
        if (!foundClass.javaClass.superClassesImplicit) {
            foundClass.javaClass.superClassesImplicit = [];
        }
        const addedSuperClassesString: string[] = foundClass.javaClass.superClassesImplicit.filter(
            (superClassString: string) => this.getClassStatus(superClassString) === 'added');
        const addedSuperClasses: { name: string, package: string }[] = addedSuperClassesString.map(
            (superClassString: string) => this.data.find(
                (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === superClassString)
        ).map(
            (superClass: VmaxClass) => ({
                name: superClass.javaClass.name,
                package: superClass.javaClass.package
            })
        );
        // subclasses (added)
        if (!foundClass.javaClass.subClassesImplicit) {
            foundClass.javaClass.subClassesImplicit = [];
        }
        const addedSubClassesString: string[] = foundClass.javaClass.subClassesImplicit.filter(
            (subClassString: string) => this.getClassStatus(subClassString) === 'added');
        const addedSubClasses: { name: string, package: string }[] = addedSubClassesString.map(
            (subClassString: string) => this.data.find(
                (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === subClassString)
        ).map(
            (subClass: VmaxClass) => ({
                name: subClass.javaClass.name,
                package: subClass.javaClass.package
            })
        );
        // methods (added)
        const addedMethods: {
            name: string,
            returnType: { name: string, package: string },
            multiplicity: string,
            highlight: boolean
        }[] = foundClass.workingData.addedMethods.map(
            (attribute: VmaxMethod) => {
                const returnType: VmaxClass = this.data.find(
                    (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === attribute.returnType);
                return {
                    name: attribute.name,
                    returnType: {
                        name: returnType.javaClass.name,
                        package: returnType.javaClass.package
                    },
                    multiplicity: attribute.multiplicity,
                    highlight: false
                }
            }
        );
        let classInfo: ClassInfo = {
            added: this.getClassStatus(jfqn),
            class:  { 
                name: foundClass.javaClass.name,
                package: foundClass.javaClass.package
            },
            addedSuperclasses: addedSuperClasses,
            addedSubclasses: addedSubClasses,
            addedMethods: addedMethods
        }
        return classInfo;
    }
    
    /**
     * 
     * @param classJfqn 
     * @param methodName 
     * @returns 
     */
    public getMethodStatus(classJfqn: string, methodName: string): boolean {
        const foundSourceClassOrInterface: VmaxClass = this.data.find(
            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === classJfqn);
        if (foundSourceClassOrInterface && foundSourceClassOrInterface.workingData.added === true) {
            return foundSourceClassOrInterface.workingData.addedMethods.some(
                (attribute: VmaxMethod) => attribute.name === methodName);
        } else {
            return false;
        }
    }  

    /**
     * 
     * @param classJfqn 
     * @param methodName 
     * @param returnTypeJfqn 
     * @param multiplicity 
     * @returns 
     */
    public addMethod(classJfqn: string, methodName: string, returnTypeJfqn: string, multiplicity: string): { sourceClassAutomaticallyAdded: boolean, targetClassAutomaticallyAdded: boolean } {
        const foundSourceClass: VmaxClass = this.data.find(
            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === classJfqn);
        const foundTargetClass: VmaxClass = this.data.find(
            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === returnTypeJfqn);
        let response = {
            sourceClassAutomaticallyAdded: false,
            targetClassAutomaticallyAdded: false,
        };
        if (foundSourceClass && foundTargetClass) {
            // add missing classes automatically if needed
            if (foundSourceClass.workingData.added === false) {
                foundSourceClass.workingData.added = true;
                response.sourceClassAutomaticallyAdded = true;
            }
            if (foundTargetClass.workingData.added === false) {
                foundTargetClass.workingData.added = true;
                response.targetClassAutomaticallyAdded = true;
            }
            // add attribute
            const attribute: VmaxMethod = {
                name: methodName,
                returnType: foundTargetClass.javaClass.fullyQualifiedName,
                multiplicity: multiplicity
            };
            foundSourceClass.workingData.addedMethods.push(attribute);
            return response;
        } else { 
            throw new Error('source/and or target class not found');
        }
    }

    /**
     * 
     * @param classJfqn 
     * @param methodName 
     */
    public removeMethod(classJfqn: string, methodName: string): void {
        const foundSourceClass: VmaxClass = this.data.find(
            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === classJfqn);
        if (foundSourceClass && foundSourceClass.workingData.added === true) {
            const foundAttributeIndex: number = foundSourceClass.workingData.addedMethods.findIndex(
                (attribute: VmaxMethod) => attribute.name === methodName);
            if (foundAttributeIndex > -1) {
                foundSourceClass.workingData.addedMethods.splice(foundAttributeIndex, 1);
            } else {
                throw new Error('method not found');
            }
        } else {
            throw new Error('source class not found or not added');
        }
    }

    /**
     * 
     * @param jfqn 
     */
    public getMethodInfo(classJfqn: string, methodName: string): ClassInfo {
        let classInfo: ClassInfo = this.getClassInfo(classJfqn);
        let foundHightlight = classInfo.addedMethods
            .find(addedMethod => addedMethod.name === methodName)
        if (foundHightlight)
            { foundHightlight.highlight = true }
        return classInfo;
    }

}
