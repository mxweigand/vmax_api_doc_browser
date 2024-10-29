import { Controller, Get, Param, Query } from '@nestjs/common';
import { JavaApiElementsService } from '../java-api-elements/java-api-elements.service';
import { WorkingDataService } from '../crawler/working-data/working-data.service';
import { ClassInfo } from '../interfaces/class-info.interface';
import { CodeGeneratorService } from '../code-generator/code-generator.service';

@Controller('api')
export class ApiController {

    constructor(
      private readonly apiElementsService: JavaApiElementsService,
      private readonly workingDataService: WorkingDataService,
      private readonly codeGeneratorService: CodeGeneratorService
    ) {}

    // tools endpoints

    @Get('tools/clear')
    reloadJavaDoc(): void {
       this.workingDataService.createWorkingData();
       this.apiElementsService.getWorkingData();
       return;
    }

    @Get('tools/save')
    saveWorkingData(): void {
      return this.apiElementsService.saveWorkingData();
    }

    @Get('tools/generate')
    generateInterface(): string {
      return this.codeGeneratorService.generateJavaFile();
    }

    // class endpoints

    @Get('class/add')
    addClass(@Query('jfqn') jfqn: string): void {
      this.apiElementsService.addClass(jfqn);
    }

    @Get('class/remove')
    removeClass(@Query('jfqn') jfqn: string): void {
      this.apiElementsService.removeClass(jfqn);
    }

    @Get('class/status')
    getClassStatus(@Query('jfqn') jfqn: string): string {
      return this.apiElementsService.getClassStatus(jfqn);
    }

    @Get('class/info')
    getClassInfo(@Query('jfqn') jfqn: string): ClassInfo {
      return this.apiElementsService.getClassInfo(jfqn);
    }

    // method endpoints

    @Get('method/add')
    addMethod(
      @Query('classJfqn') classJfqn: string, 
      @Query('methodName') methodName: string, 
      @Query('returnTypeJfqn') returnTypeJfqn: string, 
      @Query('multiplicity') multiplicity: string
    ): { sourceClassAutomaticallyAdded: boolean, targetClassAutomaticallyAdded: boolean } {
      return this.apiElementsService.addMethod(classJfqn, methodName, returnTypeJfqn, multiplicity);
    }

    @Get('method/remove')
    removeMethod(
      @Query('classJfqn') classJfqn: string, 
      @Query('methodName') methodName: string,
    ): void {
      this.apiElementsService.removeMethod(classJfqn, methodName);
    }

    @Get('method/status')
    getMethodStatus(
      @Query('classJfqn') classJfqn: string, 
      @Query('methodName') methodName: string
    ): string {
      const added: boolean = this.apiElementsService.getMethodStatus(classJfqn, methodName);
      if (added === true) { return 'added' } 
      else if (added === false) { return 'not-added' }
      else { throw new Error('error looking up method status for:' + classJfqn + '.' + methodName) }
    }

    @Get('method/info')
    getMethodInfo(
      @Query('classJfqn') classJfqn: string, 
      @Query('methodName') methodName: string
    ): ClassInfo {
      return this.apiElementsService.getMethodInfo(classJfqn, methodName);
    }

}
