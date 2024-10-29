export interface JavaClass {
    fullyQualifiedName: string;
    name: string;
    package: string;
    superClasses: string[];
    superClassesImplicit: string[];
    subClassesImplicit: string[];
}
