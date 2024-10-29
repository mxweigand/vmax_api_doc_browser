import { Injectable } from '@nestjs/common';
import { VmaxClass } from '../../interfaces/vmax-class.interface';

@Injectable()
export class DatatypesService {

    private readonly dataTypes: VmaxClass[] = [
        {
            javaClass: {
                fullyQualifiedName: 'java.lang.String',
                name: 'String',
                package: 'java.lang',
                superClasses: [],
                superClassesImplicit: [],
                subClassesImplicit: []
            },
            workingData: {
                added: true,
                addedMethods: []
            }
        },
        {
            javaClass: {
                fullyQualifiedName: 'java.lang.Integer',
                name: 'Integer',
                package: 'java.lang',
                superClasses: [],
                superClassesImplicit: [],
                subClassesImplicit: []
            },
            workingData: {
                added: true,
                addedMethods: []
            }
        },
        {
            javaClass: {
                fullyQualifiedName: 'java.lang.Double',
                name: 'Double',
                package: 'java.lang',
                superClasses: [],
                superClassesImplicit: [],
                subClassesImplicit: []
            },
            workingData: {
                added: true,
                addedMethods: []
            }
        },
        {
            javaClass: {
                fullyQualifiedName: 'java.lang.Boolean',
                name: 'Boolean',
                package: 'java.lang',
                superClasses: [],
                superClassesImplicit: [],
                subClassesImplicit: []
            },
            workingData: {
                added: true,
                addedMethods: []
            }
        },
        {
            javaClass: {
                fullyQualifiedName: 'boolean',
                name: 'boolean',
                package: '',
                superClasses: [],
                superClassesImplicit: [],
                subClassesImplicit: []
            },
            workingData: {
                added: true,
                addedMethods: []
            }
        },
        {
            javaClass: {
                fullyQualifiedName: 'int',
                name: 'int',
                package: '',
                superClasses: [],
                superClassesImplicit: [],
                subClassesImplicit: []
            },
            workingData: {
                added: true,
                addedMethods: []
            }
        },
        {
            javaClass: {
                fullyQualifiedName: 'double',
                name: 'double',
                package: '',
                superClasses: [],
                superClassesImplicit: [],
                subClassesImplicit: []
            },
            workingData: {
                added: true,
                addedMethods: []
            }
        },
    ]

    public getDatatypes(): VmaxClass[] { 
        return this.dataTypes;
    }

}
