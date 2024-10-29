import { Injectable } from '@nestjs/common';
import { WorkingDataService } from '../crawler/working-data/working-data.service';
import { VmaxClass } from '../interfaces/vmax-class.interface';
import { VmaxMethod } from 'src/interfaces/vmax-method.interface';

@Injectable()
export class CodeGeneratorService {

    constructor(
        private readonly workingDataService: WorkingDataService,
    ) {}

    public generateJavaFile(): string {
        // get working data and filter out classes that are not added
        let workingData: VmaxClass[] = this.workingDataService.getWorkingData().filter((vmaxClass: VmaxClass) => vmaxClass.workingData.added);
        // filter superclass array of each class to only include added superclasses
        workingData.forEach((vmaxClass: VmaxClass) => {
            if (vmaxClass.javaClass.superClassesImplicit && vmaxClass.javaClass.superClassesImplicit.length > 0) {
                const newSuperClasses: string[] = vmaxClass.javaClass.superClassesImplicit.filter((superClassJfqn: string) =>
                    workingData.some((vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === superClassJfqn)
                );
                vmaxClass.javaClass.superClassesImplicit = newSuperClasses;
        }});
        // remove indirect superclasses 
        let sortedWorkingData: VmaxClass[] = [];
        workingData.forEach((vmaxClass: VmaxClass) => {
            let allSuperClassesOfSuperClasses: string[] = [];
            let directSuperClasses: string[] = [];
            if (vmaxClass.javaClass.superClassesImplicit && vmaxClass.javaClass.superClassesImplicit.length > 0) {       
                vmaxClass.javaClass.superClassesImplicit.forEach((superClassJfqn: string) => {
                    // get superclasses of superclass
                    const superClassesOfSuperClass: string[] = workingData.find(
                        (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === superClassJfqn)
                        .javaClass.superClassesImplicit;
                    // add superclasses of superclass to allSuperClassesOfSuperClasses
                    allSuperClassesOfSuperClasses.push(...superClassesOfSuperClass);

                });
                vmaxClass.javaClass.superClassesImplicit.forEach((superClassJfqn: string) => {
                    // if superclass is not in allSuperClassesOfSuperClasses, add it to directSuperClasses
                    if (!allSuperClassesOfSuperClasses.includes(superClassJfqn)) {
                        directSuperClasses.push(superClassJfqn);
                    }
                });
            }
            let newVmaxClass: VmaxClass = vmaxClass;
            newVmaxClass.javaClass.superClassesImplicit = directSuperClasses;
            sortedWorkingData.push(newVmaxClass);
        });
        // sort working data by subclasses, as classes with no subclasses have to be generated first
        let sortedWorkingData2: VmaxClass[] = [];
        while (sortedWorkingData.length > 0) {
            // find classes in workingData that have no superclasses, that are still in workingData
            for ( let index = 0; index < sortedWorkingData.length; index++ ) {
                let currentClass: VmaxClass = sortedWorkingData.splice(index, 1)[0];
                // if all superclasses are not in workingData, add class to sortedWorkingData
                if (currentClass.javaClass.superClassesImplicit.length === 0 ) {
                    sortedWorkingData2.push(currentClass);
                    break;
                // all superclasses have to be added already
                } else if ((currentClass.javaClass.superClassesImplicit.every(
                    (superClassJfqn: string) => sortedWorkingData2.some(
                        (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === superClassJfqn)))) {
                            sortedWorkingData2.push(currentClass);  
                            break;   
                }
                 else {
                    // put back current class at the original position
                    sortedWorkingData.splice(index, 0, currentClass);
                }
            };
        }
        return this.fillTemplate(sortedWorkingData2);
    }

    public fillTemplate(workingData: VmaxClass[]): string {
        const packageName: string = "com.vmax.vmax_plugin_msosa";
        const className: string = "MsosaApiClassAndAttributeList";
        const classClassName: string = "MsosaApiClass";
        const attributeClassName: string = "MsosaApiAttribute";
        let javaCode: string = `
            package ${packageName};

            import java.util.ArrayList;
            import java.util.Arrays;
            import java.util.Collections;
            import java.util.List;

            import com.vmax.vmax_core.api_elements.ApiAttribute;
            import com.vmax.vmax_core.api_elements.ApiClass;
            import com.vmax.vmax_core.api_elements.ApiClassAndAttributeList;
            import com.vmax.vmax_core.api_elements.ApiDataTypeList;

            public class ${className} extends ApiClassAndAttributeList {

                public ${className}(String classUriPrefix, String attributeUriPrefix, String instanceUriPrefix) {
                    // call super constructor
                    super(classUriPrefix, attributeUriPrefix, instanceUriPrefix);
                    // prepare lists
                    this.classList = new ArrayList<ApiClass>();
                    this.attributeList = new ArrayList<ApiAttribute>();

                    // ************************************************
                    // *** START OF ATOMATICALLY GENERATETD CONTENT ***
                    // ************************************************

                    // ******************
                    // *** CLASS LIST ***
                    // ******************
                    ${this.genearateClassListSection(workingData, classClassName)}
                    // **********************
                    // *** ATTRIBUTE LIST ***
                    // **********************
                    ${this.genarateAttributeListSection(workingData, attributeClassName)}
                    // **********************************************
                    // *** END OF ATOMATICALLY GENERATETD CONTENT ***
                    // **********************************************

                }

            }
        `
        // remove first and last line (those are empty)
        javaCode = javaCode.replace(/^.*\n/, '');
        javaCode = javaCode.replace(/\n.*$/, '');
        // remove leading whitespace (12 spaces) in each line
        javaCode = javaCode.replace(/^ {12}/gm, '');
        return javaCode;
    }

    private genearateClassListSection(workingData: VmaxClass[], classClassName: string): string {
        let classListSection: string = "";
        workingData.forEach((vmaxClass: VmaxClass) => {
            // exculde all datatypes
            if (!(
                vmaxClass.javaClass.fullyQualifiedName === "java.lang.String" || 
                vmaxClass.javaClass.fullyQualifiedName === "java.lang.Boolean" || 
                vmaxClass.javaClass.fullyQualifiedName === "java.lang.Integer" || 
                vmaxClass.javaClass.fullyQualifiedName === "java.lang.Double" || 
                vmaxClass.javaClass.fullyQualifiedName === "int" || 
                vmaxClass.javaClass.fullyQualifiedName === "double" || 
                vmaxClass.javaClass.fullyQualifiedName === "boolean"
            )) {
                const jfqn: string = vmaxClass.javaClass.fullyQualifiedName;
                const className: string = vmaxClass.javaClass.name;
                let superClassString: string = "new ArrayList<ApiClass>()";
                if (vmaxClass.javaClass.superClassesImplicit && vmaxClass.javaClass.superClassesImplicit.length > 0) {
                    // find all superclasses in workingData
                    const superClasses: VmaxClass[] = workingData.filter(
                        (vmaxClass2: VmaxClass) => vmaxClass.javaClass.superClassesImplicit.includes(vmaxClass2.javaClass.fullyQualifiedName));
                    superClassString = 
                        'Arrays.asList(' 
                        + superClasses
                            .map((vmaxClass2: VmaxClass) => `class${vmaxClass2.javaClass.name}`)
                            .join(", ") 
                        + ')';
                } 
                classListSection += `
                    // class ${jfqn}
                    ApiClass class${className} = new ${classClassName}(
                        ${jfqn}.class, 
                        ${superClassString}, 
                        this.classUriPrefix + "${className}",
                        this.instanceUriPrefix);
                    this.classList.add(class${className});
                `;
            }
        });
        return classListSection;
    }

    private genarateAttributeListSection(workingData: VmaxClass[], attributeClassName: string): string {
        let attributeListSection: string = "";
        workingData.forEach((vmaxClass: VmaxClass) => {
            if (vmaxClass.workingData.addedMethods && vmaxClass.workingData.addedMethods.length > 0) {
                vmaxClass.workingData.addedMethods.forEach((vmaxMethod: VmaxMethod) => {
                    // return type class name or ApiDataTypeList constant
                    let returnTypeString: string = "";
                    if (vmaxMethod.returnType === "java.lang.String") {
                        returnTypeString = "ApiDataTypeList.DATA_TYPE_STRING";
                    } else if (vmaxMethod.returnType === "java.lang.Boolean") {
                        returnTypeString = "ApiDataTypeList.DATA_TYPE_BOOLEAN";
                    } else if (vmaxMethod.returnType === "java.lang.Integer") {
                        returnTypeString = "ApiDataTypeList.DATA_TYPE_INTEGER";
                    } else if (vmaxMethod.returnType === "java.lang.Double") {
                        returnTypeString = "ApiDataTypeList.DATA_TYPE_DOUBLE";
                    } else if (vmaxMethod.returnType === "int") {
                        returnTypeString = "ApiDataTypeList.DATA_TYPE_INTEGER";
                    } else if (vmaxMethod.returnType === "double") {
                        returnTypeString = "ApiDataTypeList.DATA_TYPE_DOUBLE";
                    } else if (vmaxMethod.returnType === "boolean") {
                        returnTypeString = "ApiDataTypeList.DATA_TYPE_BOOLEAN";
                    } else {
                        // find class in workingData
                        const returnClass: VmaxClass = workingData.find(
                            (vmaxClass: VmaxClass) => vmaxClass.javaClass.fullyQualifiedName === vmaxMethod.returnType);
                        if (!returnClass) {
                            throw new Error(`Return type ${vmaxMethod.returnType} of method ${vmaxMethod.name} of class ${vmaxClass.javaClass.fullyQualifiedName} not found in workingData`);
                        }
                        returnTypeString = `class${returnClass.javaClass.name}`;
                    }
                    // return statement for different multiplicities
                    let returnStatement: string = "";
                    if (vmaxMethod.multiplicity === "SINGLE") {
                        returnStatement = `Collections.singletonList(((${vmaxClass.javaClass.fullyQualifiedName}) sourceInstanceObject).${vmaxMethod.name}())`;
                    } else if (vmaxMethod.multiplicity === "LIST") {
                        returnStatement = `((${vmaxClass.javaClass.fullyQualifiedName}) sourceInstanceObject).${vmaxMethod.name}()`;
                    } else if (vmaxMethod.multiplicity === "SET") {
                        returnStatement = `new ArrayList<>(((${vmaxClass.javaClass.fullyQualifiedName}) sourceInstanceObject).${vmaxMethod.name}())`;
                    } else if (vmaxMethod.multiplicity === "COLLECTION") {
                        returnStatement = `new ArrayList<>(((${vmaxClass.javaClass.fullyQualifiedName}) sourceInstanceObject).${vmaxMethod.name}())`;
                    } else {
                        throw new Error(`Unknown multiplicity ${vmaxMethod.multiplicity} for method ${vmaxMethod.name} of class ${vmaxClass.javaClass.fullyQualifiedName}`);
                    }
                    attributeListSection += `
                        // method ${vmaxMethod.name}() of class ${vmaxClass.javaClass.fullyQualifiedName}
                        this.attributeList.add(new ${attributeClassName}(
                            class${vmaxClass.javaClass.name}, 
                            ${returnTypeString}, 
                            this.attributeUriPrefix + "${vmaxMethod.name}") {
                                @Override
                                public List<Object> getTargetEntitiesForSourceInstanceSpec(Object sourceInstanceObject) {
                                    return ${returnStatement};
                                }       
                            }
                        );
                    `;
                });
            }
        });
        // add 4 spaces to the beginning of each line and return the generated code
        // remove leading whitespace (4 spaces) in each line
        attributeListSection = attributeListSection.replace(/^ {4}/gm, '');
        return attributeListSection;
    }

}