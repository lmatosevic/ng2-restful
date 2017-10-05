import {NgModule} from '@angular/core';
import {RestService} from './rest-service';
import {GenericResponse} from './generic-response';

@NgModule({
    imports: [],
    exports: [RestService, GenericResponse],
    declarations: [RestService, GenericResponse],
    providers: [],
})
export class RestfulModule {
}