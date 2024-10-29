export interface ClassInfo {
    added: string,
    class: Class,
    addedSuperclasses: Class[],
    addedSubclasses: Class[],
    addedMethods: Method[]
}

interface Method { 
    name: string,
    returnType: Class,
    multiplicity: string,
    highlight: boolean
}

interface Class {
    name: string,
    package: string,
}
