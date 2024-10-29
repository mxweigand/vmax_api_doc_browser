import { JavaClass } from './java-class.interface';
import { VmaxMethod } from './vmax-method.interface';

export interface VmaxClass{
    javaClass: JavaClass;
    workingData: {
        added: boolean;
        addedMethods: VmaxMethod[];
    }
}